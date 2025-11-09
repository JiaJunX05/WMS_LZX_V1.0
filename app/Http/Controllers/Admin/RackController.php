<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Rack;
use App\Exports\RackExport;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;

/**
 * 货架管理控制器
 * Rack Management Controller
 *
 * 功能模块：
 * - 货架列表展示：搜索、筛选、分页
 * - 货架操作：创建、编辑、删除、状态管理
 * - 图片管理：上传、更新、删除
 * - 数据导出：Excel 导出功能
 *
 * @author WMS Team
 * @version 3.0.0
 */
class RackController extends Controller
{
    // =============================================================================
    // 常量定义 (Constants)
    // =============================================================================

    /**
     * 状态常量
     */
    private const STATUSES = ['Available', 'Unavailable'];

    /**
     * 货架验证规则
     */
    private const RACK_RULES = [
        'rack_number' => 'required|string|max:255',
        'capacity' => 'nullable|integer|min:1',
    ];

    /**
     * 货架图片验证规则
     */
    private const RACK_IMAGE_RULES = [
        'rack_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
    ];

    // =============================================================================
    // 私有辅助方法 (Private Helper Methods)
    // =============================================================================

    /**
     * 统一错误处理
     * Handle errors consistently
     *
     * @param Request $request
     * @param string $message
     * @param \Exception|null $e
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    private function handleError(Request $request, string $message, \Exception $e = null): \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
    {
        if ($e) {
            $simplifiedMessage = $this->simplifyErrorMessage($e->getMessage());

            Log::error($message . ': ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

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
     * 简化数据库错误信息
     * Simplify database error messages
     *
     * @param string $errorMessage
     * @return string|null
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

        return null;
    }

    /**
     * 记录操作日志
     * Log operation for audit trail
     *
     * @param string $action
     * @param array $data
     * @return void
     */
    private function logOperation(string $action, array $data = []): void
    {
        Log::info("Rack {$action}", array_merge([
            'timestamp' => now()->toISOString(),
            'ip' => request()->ip(),
        ], $data));
    }

    // =============================================================================
    // 公共方法 (Public Methods)
    // =============================================================================

    /**
     * 显示货架列表页面
     * Display rack list page
     *
     * @param Request $request
     * @return \Illuminate\View\View|\Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        if ($request->ajax()) {
            try {
                $query = Rack::query();

                // 搜索功能
                if ($request->has('search') && $request->search) {
                    $search = $request->search;
                    $query->where(function($q) use ($search) {
                        $q->where('rack_number', 'like', "%{$search}%");
                    });
                }

                // 状态筛选
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

        return view('admin.rack.dashboard');
    }

    /**
     * 存储新货架
     * Store new rack
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $rules = array_merge(self::RACK_RULES, self::RACK_IMAGE_RULES);
        $rules['rack_number'] .= '|unique:racks,rack_number';

        $request->validate($rules);

        try {
            $rackData = [
                'rack_number' => $request->input('rack_number') ?? $request->input('rackNumber'),
                'capacity' => $request->input('capacity') ?: 50,
                'rack_status' => 'Available',
            ];

            // 处理文件上传
            if ($request->hasFile('rack_image')) {
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

            $this->logOperation('created', [
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
     * 显示货架编辑表单（用于 Modal）
     * Show rack edit form (for Modal)
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function showEditForm(Request $request, $id)
    {
        try {
            $rack = Rack::findOrFail($id);

            // 如果是 AJAX 请求，返回 JSON 数据（用于 Modal）
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Rack data fetched successfully',
                    'data' => [
                        'id' => $rack->id,
                        'rack_number' => $rack->rack_number,
                        'capacity' => $rack->capacity,
                        'rack_status' => $rack->rack_status,
                        'rack_image' => $rack->rack_image
                    ]
                ]);
            }

            // 非 AJAX 请求重定向到管理页面
            return redirect()->route('admin.storage_locations.rack.index');
        } catch (\Exception $e) {
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to load rack data: ' . $e->getMessage()
                ], 404);
            }
            return redirect()->route('admin.storage_locations.rack.index')
                ->with('error', 'Rack not found');
        }
    }

    /**
     * 更新货架信息
     * Update rack information
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
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
                'capacity' => $validatedData['capacity'] ?: 50,
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

    /**
     * 设置货架为可用状态
     * Set rack to available status
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function setAvailable($id)
    {
        try {
            $rack = Rack::findOrFail($id);
            $rack->update(['rack_status' => 'Available']);

            $this->logOperation('set to available', ['rack_id' => $id]);

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

    /**
     * 设置货架为不可用状态
     * Set rack to unavailable status
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function setUnavailable($id)
    {
        try {
            $rack = Rack::findOrFail($id);
            $rack->update(['rack_status' => 'Unavailable']);

            $this->logOperation('set to unavailable', ['rack_id' => $id]);

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

    /**
     * 删除货架
     * Delete rack
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        try {
            $rack = Rack::findOrFail($id);

            // 删除货架图片
            if ($rack->rack_image && file_exists(public_path('assets/images/' . $rack->rack_image))) {
                unlink(public_path('assets/images/' . $rack->rack_image));
            }

            $rack->delete();

            $this->logOperation('deleted', ['rack_id' => $id]);

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
     * 导出货架数据到 Excel
     * Export racks data to Excel
     *
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse|\Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function exportRacks(Request $request)
    {
        try {
            // 获取筛选条件
            $filters = [
                'search' => $request->get('search'),
                'status_filter' => $request->get('status_filter'),
                'ids' => $request->get('ids') ? explode(',', $request->get('ids')) : null,
            ];

            // 生成文件名
            $timestamp = Carbon::now()->format('Y-m-d_H-i-s');
            $filename = "racks_export_{$timestamp}.xlsx";

            // 使用 Laravel Excel 导出
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
