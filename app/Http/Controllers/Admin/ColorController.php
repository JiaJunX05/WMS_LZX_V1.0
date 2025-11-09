<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Color;
use App\Exports\ColorExport;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;

/**
 * 颜色管理控制器
 * Color Management Controller
 *
 * 功能模块：
 * - 颜色列表展示：搜索、筛选、分页
 * - 颜色操作：创建、编辑、删除、状态管理
 * - 颜色代码管理：HEX、RGB 代码
 * - 数据导出：Excel 导出功能
 *
 * @author WMS Team
 * @version 3.0.0
 */
class ColorController extends Controller
{
    // =============================================================================
    // 常量定义 (Constants)
    // =============================================================================

    /**
     * 状态常量
     */
    private const STATUSES = ['Available', 'Unavailable'];

    /**
     * 颜色验证规则
     */
    private const COLOR_RULES = [
        'color_name' => 'required|string|max:255',
        'color_hex' => 'required|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
        'color_rgb' => 'nullable|string|max:255',
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
        if (strpos($errorMessage, 'Duplicate entry') !== false && strpos($errorMessage, 'colors_color_name_unique') !== false) {
            return 'Color name already exists. Please choose a different name.';
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
        Log::info("Color {$action}", array_merge([
            'timestamp' => now()->toISOString(),
            'ip' => request()->ip(),
        ], $data));
    }

    // =============================================================================
    // 公共方法 (Public Methods)
    // =============================================================================

    /**
     * 显示颜色列表页面
     * Display color list page
     *
     * @param Request $request
     * @return \Illuminate\View\View|\Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        if ($request->ajax()) {
            try {
                $query = Color::query();

                // 搜索功能
                if ($request->has('search') && $request->search) {
                    $search = $request->search;
                    $query->where(function($q) use ($search) {
                        $q->where('color_name', 'like', "%{$search}%")
                          ->orWhere('color_hex', 'like', "%{$search}%")
                          ->orWhere('color_rgb', 'like', "%{$search}%");
                    });
                }

                // 状态筛选
                if ($request->has('status_filter') && $request->status_filter) {
                    $query->where('color_status', $request->status_filter);
                }

                $colors = $query->paginate(10);

                return response()->json([
                    'success' => true,
                    'data' => $colors->items(),
                    'pagination' => [
                        'current_page' => $colors->currentPage(),
                        'last_page' => $colors->lastPage(),
                        'per_page' => $colors->perPage(),
                        'total' => $colors->total(),
                        'from' => $colors->firstItem(),
                        'to' => $colors->lastItem(),
                    ]
                ]);
            } catch (\Exception $e) {
                Log::error('Color management error: ' . $e->getMessage());
                return response()->json(['error' => 'Failed to fetch colors'], 500);
            }
        }

        $colors = Color::paginate(10);
        return view('admin.color.dashboard', compact('colors'));
    }

    /**
     * 存储新颜色
     * Store new color
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $rules = self::COLOR_RULES;
        $rules['color_name'] .= '|unique:colors,color_name';

        $request->validate($rules);

        try {
            $colorData = [
                'color_name' => $request->input('color_name') ?? $request->input('colorName'),
                'color_hex' => $request->input('color_hex') ?? $request->input('colorHex'),
                'color_rgb' => $request->input('color_rgb') ?? $request->input('colorRgb'),
                'color_status' => 'Available',
            ];

            $color = Color::create($colorData);

            $this->logOperation('created', [
                'color_id' => $color->id,
                'color_name' => $colorData['color_name']
            ]);

            $message = 'Color created successfully!';

            if ($request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $color
                ]);
            }

            return redirect()->route('admin.management_tool.color.index')
                ->with('success', $message);

        } catch (\Exception $e) {
            return $this->handleError($request, 'Failed to create color: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 显示颜色编辑表单（用于 Modal）
     * Show color edit form (for Modal)
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function showEditForm(Request $request, $id)
    {
        try {
            $color = Color::findOrFail($id);

            // 如果是 AJAX 请求，返回 JSON 数据（用于 Modal）
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Color data fetched successfully',
                    'data' => [
                        'id' => $color->id,
                        'color_name' => $color->color_name,
                        'color_hex' => $color->color_hex,
                        'color_rgb' => $color->color_rgb,
                        'color_status' => $color->color_status
                    ]
                ]);
            }

            // 非 AJAX 请求重定向到管理页面
            return redirect()->route('admin.management_tool.color.index');
        } catch (\Exception $e) {
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to load color data: ' . $e->getMessage()
                ], 404);
            }
            return redirect()->route('admin.management_tool.color.index')
                ->with('error', 'Color not found');
        }
    }

    /**
     * 更新颜色信息
     * Update color information
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        try {
            $color = Color::findOrFail($id);

            Log::info('Update request received', [
                'id' => $id,
                'request_data' => $request->all(),
                'is_ajax' => request()->ajax()
            ]);

            // 验证请求数据
            $rules = self::COLOR_RULES;
            $rules['color_status'] = 'required|in:' . implode(',', self::STATUSES);

            $validatedData = $request->validate($rules);

            // 检查颜色名称是否已存在（排除当前记录）
            $existingColor = Color::where('color_name', $validatedData['color_name'])
                ->where('id', '!=', $id)
                ->first();

            if ($existingColor) {
                $message = "Color name '{$validatedData['color_name']}' already exists";

                if ($request->ajax()) {
                    return response()->json([
                        'success' => false,
                        'message' => $message,
                        'errors' => [
                            'color_name' => [$message]
                        ]
                    ], 422);
                }

                return back()->withErrors(['color_name' => $message])->withInput();
            }

            // 更新颜色记录
            $color->update([
                'color_name' => $validatedData['color_name'],
                'color_hex' => $validatedData['color_hex'],
                'color_rgb' => $validatedData['color_rgb'],
                'color_status' => $validatedData['color_status'],
            ]);

            $this->logOperation('updated', [
                'color_id' => $id,
                'color_name' => $validatedData['color_name'],
                'color_hex' => $validatedData['color_hex'],
                'color_status' => $validatedData['color_status']
            ]);

            $message = 'Color updated successfully';

            if ($request->ajax()) {
                $freshColor = $color->fresh();

                Log::info('AJAX response data', [
                    'success' => true,
                    'message' => $message,
                    'data' => $freshColor
                ]);

                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $freshColor
                ]);
            }

            return redirect()->route('admin.management_tool.color.index')
                ->with('success', $message);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Color update validation failed', [
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
            return $this->handleError($request, 'Failed to update color: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 设置颜色为可用状态
     * Set color to available status
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function setAvailable($id)
    {
        try {
            $color = Color::findOrFail($id);
            $color->update(['color_status' => 'Available']);

            $this->logOperation('set to available', ['color_id' => $id]);

            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Color has been set to available status',
                    'data' => $color
                ]);
            }

            return redirect()->route('admin.management_tool.color.index')
                ->with('success', 'Color has been set to available status');

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to set color available: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 设置颜色为不可用状态
     * Set color to unavailable status
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function setUnavailable($id)
    {
        try {
            $color = Color::findOrFail($id);
            $color->update(['color_status' => 'Unavailable']);

            $this->logOperation('set to unavailable', ['color_id' => $id]);

            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Color has been set to unavailable status',
                    'data' => $color
                ]);
            }

            return redirect()->route('admin.management_tool.color.index')
                ->with('success', 'Color has been set to unavailable status');

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to set color unavailable: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 删除颜色
     * Delete color
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        try {
            $color = Color::findOrFail($id);
            $color->delete();

            $this->logOperation('deleted', ['color_id' => $id]);

            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Color deleted successfully!',
                    'data' => [
                        'id' => $id,
                        'name' => $color->color_name
                    ]
                ]);
            }

            return redirect()->route('admin.management_tool.color.index')
                ->with('success', 'Color deleted successfully!');

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to delete color: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 导出颜色数据到 Excel
     * Export colors data to Excel
     *
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse|\Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function exportColors(Request $request)
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
            $filename = "colors_export_{$timestamp}.xlsx";

            // 使用 Laravel Excel 导出
            return Excel::download(new ColorExport($filters), $filename);

        } catch (\Exception $e) {
            Log::error('Color export failed: ' . $e->getMessage());

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
