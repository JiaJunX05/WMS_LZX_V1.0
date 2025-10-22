<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Rack;
use App\Exports\RackExport;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;

class RackController extends Controller
{
    // Constants for better maintainability
    private const MAX_BULK_RACKS = 10;
    private const STATUSES = ['Available', 'Unavailable'];

    // Validation rules
    private const RACK_RULES = [
        'rack_number' => 'required|string|max:255',
        'capacity' => 'nullable|integer|min:1',
    ];

    private const RACK_IMAGE_RULES = [
        'rack_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
    ];

    /**
     * Normalize rack data from frontend
     */
    private function normalizeRackData(array $rackData): array
    {
        // Convert camelCase to snake_case
        if (isset($rackData['rackNumber']) && !isset($rackData['rack_number'])) {
            $rackData['rack_number'] = $rackData['rackNumber'];
        }
        if (isset($rackData['rackStatus']) && !isset($rackData['rack_status'])) {
            $rackData['rack_status'] = $rackData['rackStatus'];
        }

        return $rackData;
    }

    /**
     * Handle errors consistently
     */
    private function handleError(Request $request, string $message, \Exception $e = null): \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
    {
        if ($e) {
            // 简化错误信息
            $simplifiedMessage = $this->simplifyErrorMessage($e->getMessage());

            Log::error($message . ': ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            // 使用简化的错误信息
            $message = $simplifiedMessage ?: $message;
        }

        if ($request->ajax()) {
            return response()->json([
                'success' => false,
                'message' => $message
            ], 500);
        }

        return back()->withErrors(['error' => $message])->withInput();
    }

    /**
     * Simplify database error messages
     */
    private function simplifyErrorMessage(string $errorMessage): ?string
    {
        // 处理重复键错误
        if (strpos($errorMessage, 'Duplicate entry') !== false && strpos($errorMessage, 'racks_rack_number_unique') !== false) {
            return 'Rack number already exists. Please choose a different number.';
        }

        // 处理其他数据库约束错误
        if (strpos($errorMessage, 'Integrity constraint violation') !== false) {
            return 'Data validation failed. Please check your input.';
        }

        return null; // 返回 null 表示不简化，使用原始消息
    }

    /**
     * Log operation for audit trail
     */
    private function logOperation(string $action, array $data = []): void
    {
        Log::info("Rack {$action}", array_merge([
            'timestamp' => now()->toISOString(),
            'ip' => request()->ip(),
        ], $data));
    }
    public function index(Request $request)
    {
        if ($request->ajax()) {
            try {
                $query = Rack::query();

                if ($request->has('search') && $request->search) {
                    $search = $request->search;
                    $query->where(function($q) use ($search) {
                        $q->where('rack_number', 'like', "%{$search}%");
                    });
                }

                if ($request->has('status_filter') && $request->status_filter) {
                    $query->where('rack_status', $request->status_filter);
                }

                $racks = $query->paginate(10);

                return response()->json([
                    'success' => true,
                    'data' => $racks->items(),
                    'pagination' => [
                        'current_page' => $racks->currentPage(),
                        'last_page' => $racks->lastPage(),
                        'per_page' => $racks->perPage(),
                        'total' => $racks->total(),
                        'from' => $racks->firstItem(),
                        'to' => $racks->lastItem(),
                    ]
                ]);
            } catch (\Exception $e) {
                Log::error('Rack management error: ' . $e->getMessage());
                return response()->json(['error' => 'Failed to fetch racks'], 500);
            }
        }

        return view('admin.rack_dashboard');
    }

    public function create()
    {
        return view('admin.rack_create');
    }

    /**
     * 存储新货架
     */
    public function store(Request $request)
    {
        // 与 CategoryController 的实现保持一致：有数组走批量，否则走单个
        if ($request->has('racks') && is_array($request->input('racks'))) {
            return $this->storeMultipleRacks($request);
        }

        return $this->storeSingleRack($request);
    }

    /**
     * 单个存储货架
     */
    private function storeSingleRack(Request $request)
    {
        // 校验
        $rules = array_merge(self::RACK_RULES, self::RACK_IMAGE_RULES);
        $rules['rack_number'] .= '|unique:racks,rack_number';

        $request->validate($rules);

        try {
            $rackData = [
                'rack_number' => $request->input('rack_number') ?? $request->input('rackNumber'),
                'capacity' => $request->input('capacity') ?: 50, // 使用默认值50如果为空或0
                'rack_status' => 'Available', // 默认为 Available
            ];

            // 处理文件上传
            if ($request->hasFile('rack_image')) {
                // 文件上传（确保目录存在）
                $image = $request->file('rack_image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $directory = public_path('assets/images/racks');
                if (!file_exists($directory)) {
                    mkdir($directory, 0777, true);
                }
                $image->move($directory, $imageName);
                $rackData['rack_image'] = 'racks/' . $imageName;
            }

            $rack = Rack::create($rackData);

            $this->logOperation('created (single)', [
                'rack_id' => $rack->id,
                'rack_number' => $rackData['rack_number']
            ]);

            $message = 'Rack created successfully!';

            if ($request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $rack
                ]);
            }

            return redirect()->route('admin.storage_locations.rack.index')
                ->with('success', $message);

        } catch (\Exception $e) {
            return $this->handleError($request, 'Failed to create rack: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 批量存储货架（统一入口）
     */
    private function storeMultipleRacks(Request $request)
    {
        // 仅处理批量数组
        $racks = $request->input('racks', []);

        // 限制批量创建数量
        if (count($racks) > self::MAX_BULK_RACKS) {
            return $this->handleError($request, 'Cannot create more than ' . self::MAX_BULK_RACKS . ' racks at once');
        }

        $createdRacks = [];
        $errors = [];

        // 预处理：收集所有货架编号进行批量检查
        $rackNumbersToCheck = [];
        foreach ($racks as $index => $rackData) {
            $rackData = $this->normalizeRackData($rackData);
            if (isset($rackData['rack_number'])) {
                $rackNumbersToCheck[] = $rackData['rack_number'];
            }
        }

        // 批量检查货架编号是否已存在
        $existingRackNumbers = Rack::whereIn('rack_number', $rackNumbersToCheck)->pluck('rack_number')->toArray();

        foreach ($racks as $index => $rackData) {
            // 先标准化数据，再进行验证
            $rackData = $this->normalizeRackData($rackData);

            $validator = \Validator::make($rackData, self::RACK_RULES);

            if ($validator->fails()) {
                $errors[] = "Rack " . ($index + 1) . ": " . implode(', ', $validator->errors()->all());
                continue;
            }

            // 检查货架编号是否已存在
            if (in_array($rackData['rack_number'], $existingRackNumbers)) {
                $errors[] = "Rack " . ($index + 1) . ": Rack number '{$rackData['rack_number']}' already exists";
                continue;
            }

            try {
                $rackRecord = [
                    'rack_number' => $rackData['rack_number'],
                    'capacity' => $rackData['capacity'] ?? 50, // 使用默认值50如果为空
                    'rack_status' => 'Available', // 默认为 Available
                ];

                // 处理图片上传 - 使用文件数组
                $files = $request->file('images');
                if (is_array($files) && isset($files[$index]) && $files[$index] && $files[$index]->isValid()) {
                    $image = $files[$index];
                    $directory = public_path('assets/images/racks');
                    if (!file_exists($directory)) {
                        mkdir($directory, 0777, true);
                    }
                    $imageName = time() . '_' . $index . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                    $image->move($directory, $imageName);
                    $rackRecord['rack_image'] = 'racks/' . $imageName;
                }

                $rack = Rack::create($rackRecord);
                $createdRacks[] = $rack;

                $this->logOperation('created (batch)', [
                    'rack_id' => $rack->id,
                    'rack_number' => $rackData['rack_number']
                ]);
            } catch (\Exception $e) {
                $simplifiedError = $this->simplifyErrorMessage($e->getMessage());
                $errorMessage = $simplifiedError ?: $e->getMessage();
                $errors[] = "Rack " . ($index + 1) . ": " . $errorMessage;
            }
        }

        if ($request->ajax()) {
            if (count($errors) > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some racks failed to create',
                    'errors' => $errors,
                    'created_count' => count($createdRacks)
                ], 422);
            } else {
                return response()->json([
                    'success' => true,
                    'message' => count($createdRacks) . ' racks created successfully',
                    'data' => $createdRacks
                ]);
            }
        }

        if (count($errors) > 0) {
            return back()->withErrors(['error' => implode('; ', $errors)])
                ->withInput();
        }

        return redirect()->route('admin.storage_locations.rack.index')
            ->with('success', count($createdRacks) . ' racks created successfully');
    }

    public function edit($id)
    {
        $rack = Rack::findOrFail($id);
        return view('admin.rack_update', compact('rack'));
    }

    public function update(Request $request, $id)
    {
        try {
            $rack = Rack::findOrFail($id);

            Log::info('Update request received', [
                'id' => $id,
                'request_data' => $request->all(),
                'is_ajax' => request()->ajax()
            ]);

            // 验证请求数据
            $rules = array_merge(self::RACK_RULES, self::RACK_IMAGE_RULES);
            $rules['rack_status'] = 'required|in:' . implode(',', self::STATUSES);

            $validatedData = $request->validate($rules);

            // 检查货架编号是否已存在（排除当前记录）
            $existingRack = Rack::where('rack_number', $validatedData['rack_number'])
                ->where('id', '!=', $id)
                ->first();

            if ($existingRack) {
                $message = "Rack number '{$validatedData['rack_number']}' already exists";

                if ($request->ajax()) {
                    return response()->json([
                        'success' => false,
                        'message' => $message,
                        'errors' => [
                            'rack_number' => [$message]
                        ]
                    ], 422);
                }

                return back()->withErrors(['rack_number' => $message])->withInput();
            }

            // 更新货架记录
            $rackData = [
                'rack_number' => $validatedData['rack_number'],
                'capacity' => $validatedData['capacity'] ?: 50, // 使用默认值50如果为空或0
                'rack_status' => $validatedData['rack_status'],
            ];

            // 处理图片：上传新图片或移除现有图片
            if ($request->hasFile('rack_image')) {
                // 上传新图片：删除旧图片
                if ($rack->rack_image && file_exists(public_path('assets/images/' . $rack->rack_image))) {
                    unlink(public_path('assets/images/' . $rack->rack_image));
                }

                $image = $request->file('rack_image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $image->move(public_path('assets/images/racks'), $imageName);
                $rackData['rack_image'] = 'racks/' . $imageName;
            } elseif ($request->has('remove_image') && $request->input('remove_image') === '1') {
                // 移除图片：删除文件并清空数据库字段
                if ($rack->rack_image && file_exists(public_path('assets/images/' . $rack->rack_image))) {
                    unlink(public_path('assets/images/' . $rack->rack_image));
                }
                $rackData['rack_image'] = null;
            }

            $rack->update($rackData);

            $this->logOperation('updated', [
                'rack_id' => $id,
                'rack_number' => $validatedData['rack_number'],
                'capacity' => $validatedData['capacity'],
                'rack_status' => $validatedData['rack_status']
            ]);

            $message = 'Rack updated successfully';

            if ($request->ajax()) {
                $freshRack = $rack->fresh();
                Log::info('AJAX response data', [
                    'success' => true,
                    'message' => $message,
                    'data' => $freshRack
                ]);

                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $freshRack
                ]);
            }

            return redirect()->route('admin.storage_locations.rack.index')
                ->with('success', $message);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Rack update validation failed', [
                'id' => $id,
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);

            if ($request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $e->errors()
                ], 422);
            }

            throw $e;

        } catch (\Exception $e) {
            return $this->handleError($request, 'Failed to update rack: ' . $e->getMessage(), $e);
        }
    }

    public function setAvailable($id)
    {
        try {
            $rack = Rack::findOrFail($id);
            $rack->update(['rack_status' => 'Available']);

            $this->logOperation('set to available', ['rack_id' => $id]);

            // 返回 JSON 响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Rack has been set to available status',
                    'data' => $rack
                ]);
            }

            return redirect()->route('admin.storage_locations.rack.index')
                ->with('success', 'Rack has been set to available status');

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to set rack available: ' . $e->getMessage(), $e);
        }
    }

    public function setUnavailable($id)
    {
        try {
            $rack = Rack::findOrFail($id);
            $rack->update(['rack_status' => 'Unavailable']);

            $this->logOperation('set to unavailable', ['rack_id' => $id]);

            // 返回 JSON 响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Rack has been set to unavailable status',
                    'data' => $rack
                ]);
            }

            return redirect()->route('admin.storage_locations.rack.index')
                ->with('success', 'Rack has been set to unavailable status');

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to set rack unavailable: ' . $e->getMessage(), $e);
        }
    }

    public function destroy($id)
    {
        try {
            $rack = Rack::findOrFail($id);

            if ($rack->rack_image && file_exists(public_path('assets/images/' . $rack->rack_image))) {
                unlink(public_path('assets/images/' . $rack->rack_image));
            }

            $rack->delete();

            $this->logOperation('deleted', ['rack_id' => $id]);

            // 返回 JSON 响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Rack deleted successfully!',
                    'data' => [
                        'id' => $id,
                        'name' => $rack->rack_number
                    ]
                ]);
            }

            return redirect()->route('admin.storage_locations.rack.index')
                ->with('success', 'Rack deleted successfully!');

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to delete rack: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 導出貨架數據到Excel
     */
    public function exportRacks(Request $request)
    {
        try {
            // 獲取篩選條件
            $filters = [
                'search' => $request->get('search'),
                'status_filter' => $request->get('status_filter'),
                'ids' => $request->get('ids') ? explode(',', $request->get('ids')) : null,
            ];

            // 生成文件名
            $timestamp = Carbon::now()->format('Y-m-d_H-i-s');
            $filename = "racks_export_{$timestamp}.xlsx";

            // 使用Laravel Excel導出
            return Excel::download(new RackExport($filters), $filename);

        } catch (\Exception $e) {
            Log::error('Rack export failed: ' . $e->getMessage());

            if ($request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Export failed: ' . $e->getMessage()
                ], 500);
            }

            return redirect()->back()
                ->with('error', 'Export failed. Please try again.');
        }
    }
}
