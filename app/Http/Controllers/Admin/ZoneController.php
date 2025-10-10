<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\StorageLocation\Zone;

class ZoneController extends Controller
{
    // Constants for better maintainability
    private const MAX_BULK_ZONES = 10;
    private const STATUSES = ['Available', 'Unavailable'];

    // Validation rules
    private const ZONE_RULES = [
        'zone_name' => 'required|string|max:255',
        'location' => 'required|string|max:255',
    ];

    private const ZONE_IMAGE_RULES = [
        'zone_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
    ];

    /**
     * Normalize zone data from frontend
     */
    private function normalizeZoneData(array $zoneData): array
    {
        // Convert camelCase to snake_case
        if (isset($zoneData['zoneName']) && !isset($zoneData['zone_name'])) {
            $zoneData['zone_name'] = $zoneData['zoneName'];
        }
        if (isset($zoneData['zoneStatus']) && !isset($zoneData['zone_status'])) {
            $zoneData['zone_status'] = $zoneData['zoneStatus'];
        }

        return $zoneData;
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
        if (strpos($errorMessage, 'Duplicate entry') !== false && strpos($errorMessage, 'zones_zone_name_unique') !== false) {
            return 'Zone name already exists. Please choose a different name.';
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
        Log::info("Zone {$action}", array_merge([
            'timestamp' => now()->toISOString(),
            'ip' => request()->ip(),
        ], $data));
    }
    public function index(Request $request)
    {
        if ($request->ajax()) {
            try {
                $query = Zone::query();

                if ($request->has('search') && $request->search) {
                    $search = $request->search;
                    $query->where(function($q) use ($search) {
                        $q->where('zone_name', 'like', "%{$search}%")
                          ->orWhere('location', 'like', "%{$search}%");
                    });
                }

                if ($request->has('status_filter') && $request->status_filter) {
                    $query->where('zone_status', $request->status_filter);
                }

                $zones = $query->paginate(10);

                return response()->json([
                    'success' => true,
                    'data' => $zones->items(),
                    'pagination' => [
                        'current_page' => $zones->currentPage(),
                        'last_page' => $zones->lastPage(),
                        'per_page' => $zones->perPage(),
                        'total' => $zones->total(),
                        'from' => $zones->firstItem(),
                        'to' => $zones->lastItem(),
                    ]
                ]);
            } catch (\Exception $e) {
                Log::error('Zone management error: ' . $e->getMessage());
                return response()->json(['error' => 'Failed to fetch zones'], 500);
            }
        }

        return view('admin.zone_dashboard');
    }

    public function create()
    {
        return view('admin.zone_create');
    }

    /**
     * 存储新区域
     */
    public function store(Request $request)
    {
        // 与 CategoryController 的实现保持一致：有数组走批量，否则走单个
        if ($request->has('zones') && is_array($request->input('zones'))) {
            return $this->storeMultipleZones($request);
        }

        return $this->storeSingleZone($request);
    }

    /**
     * 单个存储区域
     */
    private function storeSingleZone(Request $request)
    {
        // 校验
        $rules = array_merge(self::ZONE_RULES, self::ZONE_IMAGE_RULES);
        $rules['zone_name'] .= '|unique:zones,zone_name';

        $request->validate($rules);

        try {
            $zoneData = [
                'zone_name' => $request->input('zone_name') ?? $request->input('zoneName'),
                'location' => $request->input('location'),
                'zone_status' => 'Available', // 默认为 Available
            ];

            // 处理文件上传
            if ($request->hasFile('zone_image')) {
                // 文件上传（确保目录存在）
                $image = $request->file('zone_image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $directory = public_path('assets/images/zones');
                if (!file_exists($directory)) {
                    mkdir($directory, 0777, true);
                }
                $image->move($directory, $imageName);
                $zoneData['zone_image'] = 'zones/' . $imageName;
            }

            $zone = Zone::create($zoneData);

            $this->logOperation('created (single)', [
                'zone_id' => $zone->id,
                'zone_name' => $zoneData['zone_name']
            ]);

            $message = 'Zone created successfully!';

            if ($request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $zone
                ]);
            }

            return redirect()->route('admin.storage_locations.zone.index')
                ->with('success', $message);

        } catch (\Exception $e) {
            return $this->handleError($request, 'Failed to create zone: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 批量存储区域（统一入口）
     */
    private function storeMultipleZones(Request $request)
    {
        // 仅处理批量数组
        $zones = $request->input('zones', []);

        // 限制批量创建数量
        if (count($zones) > self::MAX_BULK_ZONES) {
            return $this->handleError($request, 'Cannot create more than ' . self::MAX_BULK_ZONES . ' zones at once');
        }

        $createdZones = [];
        $errors = [];

        // 预处理：收集所有区域名称进行批量检查
        $zoneNamesToCheck = [];
        foreach ($zones as $index => $zoneData) {
            $zoneData = $this->normalizeZoneData($zoneData);
            if (isset($zoneData['zone_name'])) {
                $zoneNamesToCheck[] = $zoneData['zone_name'];
            }
        }

        // 批量检查区域名称是否已存在
        $existingZoneNames = Zone::whereIn('zone_name', $zoneNamesToCheck)->pluck('zone_name')->toArray();

        foreach ($zones as $index => $zoneData) {
            $zoneData = $this->normalizeZoneData($zoneData);

            $validator = \Validator::make($zoneData, self::ZONE_RULES);

            if ($validator->fails()) {
                $errors[] = "Zone " . ($index + 1) . ": " . implode(', ', $validator->errors()->all());
                continue;
            }

            // 检查区域名称是否已存在
            if (in_array($zoneData['zone_name'], $existingZoneNames)) {
                $errors[] = "Zone " . ($index + 1) . ": Zone name '{$zoneData['zone_name']}' already exists";
                continue;
            }

            try {
                $zoneRecord = [
                    'zone_name' => $zoneData['zone_name'],
                    'location' => $zoneData['location'],
                    'zone_status' => 'Available', // 默认为 Available
                ];

                // 处理图片上传 - 使用文件数组
                $files = $request->file('images');
                if (is_array($files) && isset($files[$index]) && $files[$index] && $files[$index]->isValid()) {
                    $image = $files[$index];
                    $directory = public_path('assets/images/zones');
                    if (!file_exists($directory)) {
                        mkdir($directory, 0777, true);
                    }
                    $imageName = time() . '_' . $index . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                    $image->move($directory, $imageName);
                    $zoneRecord['zone_image'] = 'zones/' . $imageName;
                }

                $zone = Zone::create($zoneRecord);
                $createdZones[] = $zone;

                $this->logOperation('created (batch)', [
                    'zone_id' => $zone->id,
                    'zone_name' => $zoneData['zone_name']
                ]);
            } catch (\Exception $e) {
                $simplifiedError = $this->simplifyErrorMessage($e->getMessage());
                $errorMessage = $simplifiedError ?: $e->getMessage();
                $errors[] = "Zone " . ($index + 1) . ": " . $errorMessage;
            }
        }

        if ($request->ajax()) {
            if (count($errors) > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some zones failed to create',
                    'errors' => $errors,
                    'created_count' => count($createdZones)
                ], 422);
            } else {
                return response()->json([
                    'success' => true,
                    'message' => count($createdZones) . ' zones created successfully',
                    'data' => $createdZones
                ]);
            }
        }

        if (count($errors) > 0) {
            return back()->withErrors(['error' => implode('; ', $errors)])
                ->withInput();
        }

        return redirect()->route('admin.storage_locations.zone.index')
            ->with('success', count($createdZones) . ' zones created successfully');
    }

    public function edit($id)
    {
        $zone = Zone::findOrFail($id);
        return view('admin.zone_update', compact('zone'));
    }

    public function update(Request $request, $id)
    {
        try {
            $zone = Zone::findOrFail($id);

            Log::info('Update request received', [
                'id' => $id,
                'request_data' => $request->all(),
                'is_ajax' => request()->ajax()
            ]);

            // 验证请求数据
            $rules = array_merge(self::ZONE_RULES, self::ZONE_IMAGE_RULES);
            $rules['zone_status'] = 'required|in:' . implode(',', self::STATUSES);

            $validatedData = $request->validate($rules);

            // 检查区域名称是否已存在（排除当前记录）
            $existingZone = Zone::where('zone_name', $validatedData['zone_name'])
                ->where('id', '!=', $id)
                ->first();

            if ($existingZone) {
                $message = "Zone name '{$validatedData['zone_name']}' already exists";

                if ($request->ajax()) {
                    return response()->json([
                        'success' => false,
                        'message' => $message,
                        'errors' => [
                            'zone_name' => [$message]
                        ]
                    ], 422);
                }

                return back()->withErrors(['zone_name' => $message])->withInput();
            }

            // 更新区域记录
            $zoneData = [
                'zone_name' => $validatedData['zone_name'],
                'location' => $validatedData['location'],
                'zone_status' => $validatedData['zone_status'],
            ];

            // 处理图片：上传新图片或移除现有图片
            if ($request->hasFile('zone_image')) {
                // 上传新图片：删除旧图片
                if ($zone->zone_image && file_exists(public_path('assets/images/' . $zone->zone_image))) {
                    unlink(public_path('assets/images/' . $zone->zone_image));
                }

                $image = $request->file('zone_image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $image->move(public_path('assets/images/zones'), $imageName);
                $zoneData['zone_image'] = 'zones/' . $imageName;
            } elseif ($request->has('remove_image') && $request->input('remove_image') === '1') {
                // 移除图片：删除文件并清空数据库字段
                if ($zone->zone_image && file_exists(public_path('assets/images/' . $zone->zone_image))) {
                    unlink(public_path('assets/images/' . $zone->zone_image));
                }
                $zoneData['zone_image'] = null;
            }

            $zone->update($zoneData);

            $this->logOperation('updated', [
                'zone_id' => $id,
                'zone_name' => $validatedData['zone_name'],
                'location' => $validatedData['location'],
                'zone_status' => $validatedData['zone_status']
            ]);

            $message = 'Zone updated successfully';

            if ($request->ajax()) {
                $freshZone = $zone->fresh();
                Log::info('AJAX response data', [
                    'success' => true,
                    'message' => $message,
                    'data' => $freshZone
                ]);

                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $freshZone
                ]);
            }

            return redirect()->route('admin.storage_locations.zone.index')
                ->with('success', $message);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Zone update validation failed', [
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
            return $this->handleError($request, 'Failed to update zone: ' . $e->getMessage(), $e);
        }
    }

    public function setAvailable($id)
    {
        try {
            $zone = Zone::findOrFail($id);
            $zone->update(['zone_status' => 'Available']);

            $this->logOperation('set to available', ['zone_id' => $id]);

            // 返回 JSON 响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Zone has been set to available status',
                    'data' => $zone
                ]);
            }

            return redirect()->route('admin.storage_locations.zone.index')
                ->with('success', 'Zone has been set to available status');

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to set zone available: ' . $e->getMessage(), $e);
        }
    }

    public function setUnavailable($id)
    {
        try {
            $zone = Zone::findOrFail($id);
            $zone->update(['zone_status' => 'Unavailable']);

            $this->logOperation('set to unavailable', ['zone_id' => $id]);

            // 返回 JSON 响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Zone has been set to unavailable status',
                    'data' => $zone
                ]);
            }

            return redirect()->route('admin.storage_locations.zone.index')
                ->with('success', 'Zone has been set to unavailable status');

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to set zone unavailable: ' . $e->getMessage(), $e);
        }
    }

    public function destroy($id)
    {
        try {
            $zone = Zone::findOrFail($id);

            if ($zone->zone_image && file_exists(public_path('assets/images/' . $zone->zone_image))) {
                unlink(public_path('assets/images/' . $zone->zone_image));
            }

            $zone->delete();

            $this->logOperation('deleted', ['zone_id' => $id]);

            // 返回 JSON 响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Zone deleted successfully!',
                    'data' => [
                        'id' => $id,
                        'name' => $zone->zone_name
                    ]
                ]);
            }

            return redirect()->route('admin.storage_locations.zone.index')
                ->with('success', 'Zone deleted successfully!');

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to delete zone: ' . $e->getMessage(), $e);
        }
    }
}
