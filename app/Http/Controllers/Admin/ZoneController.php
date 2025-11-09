<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Zone;
use App\Exports\ZoneExport;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;

/**
 * 区域管理控制器
 * Zone Management Controller
 *
 * 功能模块：
 * - 区域列表展示：搜索、筛选、分页
 * - 区域操作：创建、编辑、删除、状态管理
 * - 图片管理：上传、更新、删除
 * - 数据导出：Excel 导出功能
 *
 * @author WMS Team
 * @version 3.0.0
 */
class ZoneController extends Controller
{
    // =============================================================================
    // 常量定义 (Constants)
    // =============================================================================

    /**
     * 状态常量
     */
    private const STATUSES = ['Available', 'Unavailable'];

    /**
     * 区域验证规则
     */
    private const ZONE_RULES = [
        'zone_name' => 'required|string|max:255',
        'location' => 'required|string|max:255',
    ];

    /**
     * 区域图片验证规则
     */
    private const ZONE_IMAGE_RULES = [
        'zone_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
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
        if (strpos($errorMessage, 'Duplicate entry') !== false && strpos($errorMessage, 'zones_zone_name_unique') !== false) {
            return 'Zone name already exists. Please choose a different name.';
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
        Log::info("Zone {$action}", array_merge([
            'timestamp' => now()->toISOString(),
            'ip' => request()->ip(),
        ], $data));
    }

    // =============================================================================
    // 公共方法 (Public Methods)
    // =============================================================================

    /**
     * 显示区域列表页面
     * Display zone list page
     *
     * @param Request $request
     * @return \Illuminate\View\View|\Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        if ($request->ajax()) {
            try {
                $query = Zone::query();

                // 搜索功能
                if ($request->has('search') && $request->search) {
                    $search = $request->search;
                    $query->where(function($q) use ($search) {
                        $q->where('zone_name', 'like', "%{$search}%")
                          ->orWhere('location', 'like', "%{$search}%");
                    });
                }

                // 状态筛选
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

        return view('admin.zone.dashboard');
    }

    /**
     * 存储新区域
     * Store new zone
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $rules = array_merge(self::ZONE_RULES, self::ZONE_IMAGE_RULES);
        $rules['zone_name'] .= '|unique:zones,zone_name';

        $request->validate($rules);

        try {
            $zoneData = [
                'zone_name' => $request->input('zone_name') ?? $request->input('zoneName'),
                'location' => $request->input('location'),
                'zone_status' => 'Available',
            ];

            // 处理文件上传
            if ($request->hasFile('zone_image')) {
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

            $this->logOperation('created', [
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
     * 显示区域编辑表单（用于 Modal）
     * Show zone edit form (for Modal)
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function showEditForm(Request $request, $id)
    {
        try {
            $zone = Zone::findOrFail($id);

            // 如果是 AJAX 请求，返回 JSON 数据（用于 Modal）
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Zone data fetched successfully',
                    'data' => [
                        'id' => $zone->id,
                        'zone_name' => $zone->zone_name,
                        'location' => $zone->location,
                        'zone_status' => $zone->zone_status,
                        'zone_image' => $zone->zone_image
                    ]
                ]);
            }

            // 非 AJAX 请求重定向到管理页面
            return redirect()->route('admin.storage_locations.zone.index');
        } catch (\Exception $e) {
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to load zone data: ' . $e->getMessage()
                ], 404);
            }
            return redirect()->route('admin.storage_locations.zone.index')
                ->with('error', 'Zone not found');
        }
    }

    /**
     * 更新区域信息
     * Update zone information
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
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

    /**
     * 设置区域为可用状态
     * Set zone to available status
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function setAvailable($id)
    {
        try {
            $zone = Zone::findOrFail($id);
            $zone->update(['zone_status' => 'Available']);

            $this->logOperation('set to available', ['zone_id' => $id]);

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

    /**
     * 设置区域为不可用状态
     * Set zone to unavailable status
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function setUnavailable($id)
    {
        try {
            $zone = Zone::findOrFail($id);
            $zone->update(['zone_status' => 'Unavailable']);

            $this->logOperation('set to unavailable', ['zone_id' => $id]);

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

    /**
     * 删除区域
     * Delete zone
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        try {
            $zone = Zone::findOrFail($id);

            // 删除区域图片
            if ($zone->zone_image && file_exists(public_path('assets/images/' . $zone->zone_image))) {
                unlink(public_path('assets/images/' . $zone->zone_image));
            }

            $zone->delete();

            $this->logOperation('deleted', ['zone_id' => $id]);

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

    /**
     * 导出区域数据到 Excel
     * Export zones data to Excel
     *
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse|\Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function exportZones(Request $request)
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
            $filename = "zones_export_{$timestamp}.xlsx";

            // 使用 Laravel Excel 导出
            return Excel::download(new ZoneExport($filters), $filename);

        } catch (\Exception $e) {
            Log::error('Zone export failed: ' . $e->getMessage());

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
