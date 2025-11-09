<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Subcategory;
use App\Exports\SubcategoryExport;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;

/**
 * 子分类管理控制器
 * Subcategory Management Controller
 *
 * 功能模块：
 * - 子分类列表展示：搜索、筛选、分页
 * - 子分类操作：创建、编辑、删除、状态管理
 * - 图片管理：上传、更新、删除
 * - 数据导出：Excel 导出功能
 *
 * @author WMS Team
 * @version 3.0.0
 */
class SubcategoryController extends Controller
{
    // =============================================================================
    // 常量定义 (Constants)
    // =============================================================================

    /**
     * 状态常量
     */
    private const STATUSES = ['Available', 'Unavailable'];

    /**
     * 子分类验证规则
     */
    private const SUBCATEGORY_RULES = [
        'subcategory_name' => 'required|string|max:255',
    ];

    /**
     * 子分类图片验证规则
     */
    private const SUBCATEGORY_IMAGE_RULES = [
        'subcategory_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
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
        if (strpos($errorMessage, 'Duplicate entry') !== false && strpos($errorMessage, 'subcategories_subcategory_name_unique') !== false) {
            return 'Subcategory name already exists. Please choose a different name.';
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
        Log::info("Subcategory {$action}", array_merge([
            'timestamp' => now()->toISOString(),
            'ip' => request()->ip(),
        ], $data));
    }

    // =============================================================================
    // 公共方法 (Public Methods)
    // =============================================================================

    /**
     * 显示子分类列表页面
     * Display subcategory list page
     *
     * @param Request $request
     * @return \Illuminate\View\View|\Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        if ($request->ajax()) {
            try {
                $query = Subcategory::query();

                // 搜索功能
                if ($request->has('search') && $request->search) {
                    $search = $request->search;
                    $query->where(function($q) use ($search) {
                        $q->where('subcategory_name', 'like', "%{$search}%");
                    });
                }

                // 状态筛选
                if ($request->has('status_filter') && $request->status_filter) {
                    $query->where('subcategory_status', $request->status_filter);
                }

                $subcategories = $query->paginate(10);

                return response()->json([
                    'success' => true,
                    'data' => $subcategories->items(),
                    'pagination' => [
                        'current_page' => $subcategories->currentPage(),
                        'last_page' => $subcategories->lastPage(),
                        'per_page' => $subcategories->perPage(),
                        'total' => $subcategories->total(),
                        'from' => $subcategories->firstItem(),
                        'to' => $subcategories->lastItem(),
                    ]
                ]);
            } catch (\Exception $e) {
                Log::error('Subcategory management error: ' . $e->getMessage());
                return response()->json(['error' => 'Failed to fetch subcategories'], 500);
            }
        }

        $subcategories = Subcategory::paginate(10);
        return view('admin.subcategory.dashboard', compact('subcategories'));
    }

    /**
     * 存储新子分类
     * Store new subcategory
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $rules = array_merge(self::SUBCATEGORY_RULES, self::SUBCATEGORY_IMAGE_RULES);
        $rules['subcategory_name'] .= '|unique:subcategories,subcategory_name';

        $request->validate($rules);

        try {
            $subcategoryData = [
                'subcategory_name' => $request->input('subcategory_name') ?? $request->input('subcategoryName'),
                'subcategory_status' => 'Available',
            ];

            // 处理文件上传
            if ($request->hasFile('subcategory_image')) {
                $image = $request->file('subcategory_image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $directory = public_path('assets/images/subcategories');

                if (!file_exists($directory)) {
                    mkdir($directory, 0777, true);
                }

                $image->move($directory, $imageName);
                $subcategoryData['subcategory_image'] = 'subcategories/' . $imageName;
            }

            $subcategory = Subcategory::create($subcategoryData);

            $this->logOperation('created', [
                'subcategory_id' => $subcategory->id,
                'subcategory_name' => $subcategoryData['subcategory_name']
            ]);

            $message = 'Subcategory created successfully!';

            if ($request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $subcategory
                ]);
            }

            return redirect()->route('admin.category_mapping.subcategory.index')
                ->with('success', $message);

        } catch (\Exception $e) {
            return $this->handleError($request, 'Failed to create subcategory: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 显示子分类编辑表单（用于 Modal）
     * Show subcategory edit form (for Modal)
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function showEditForm(Request $request, $id)
    {
        try {
            $subcategory = Subcategory::findOrFail($id);

            // 如果是 AJAX 请求，返回 JSON 数据（用于 Modal）
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Subcategory data fetched successfully',
                    'data' => [
                        'id' => $subcategory->id,
                        'subcategory_name' => $subcategory->subcategory_name,
                        'subcategory_status' => $subcategory->subcategory_status,
                        'subcategory_image' => $subcategory->subcategory_image
                    ]
                ]);
            }

            // 非 AJAX 请求重定向到管理页面
            return redirect()->route('admin.category_mapping.subcategory.index');
        } catch (\Exception $e) {
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to load subcategory data: ' . $e->getMessage()
                ], 404);
            }
            return redirect()->route('admin.category_mapping.subcategory.index')
                ->with('error', 'Subcategory not found');
        }
    }

    /**
     * 更新子分类信息
     * Update subcategory information
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        try {
            $subcategory = Subcategory::findOrFail($id);

            Log::info('Update request received', [
                'id' => $id,
                'request_data' => $request->all(),
                'is_ajax' => request()->ajax()
            ]);

            // 验证请求数据
            $rules = array_merge(self::SUBCATEGORY_RULES, self::SUBCATEGORY_IMAGE_RULES);
            $rules['subcategory_status'] = 'required|in:' . implode(',', self::STATUSES);

            $validatedData = $request->validate($rules);

            // 检查子分类名称是否已存在（排除当前记录）
            $existingSubcategory = Subcategory::where('subcategory_name', $validatedData['subcategory_name'])
                ->where('id', '!=', $id)
                ->first();

            if ($existingSubcategory) {
                $message = "Subcategory name '{$validatedData['subcategory_name']}' already exists";

                if ($request->ajax()) {
                    return response()->json([
                        'success' => false,
                        'message' => $message,
                        'errors' => [
                            'subcategory_name' => [$message]
                        ]
                    ], 422);
                }

                return back()->withErrors(['subcategory_name' => $message])->withInput();
            }

            // 更新子分类记录
            $subcategoryData = [
                'subcategory_name' => $validatedData['subcategory_name'],
                'subcategory_status' => $validatedData['subcategory_status'],
            ];

            // 处理图片：上传新图片或移除现有图片
            if ($request->hasFile('subcategory_image')) {
                // 上传新图片：删除旧图片
                if ($subcategory->subcategory_image && file_exists(public_path('assets/images/' . $subcategory->subcategory_image))) {
                    unlink(public_path('assets/images/' . $subcategory->subcategory_image));
                }

                $image = $request->file('subcategory_image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $image->move(public_path('assets/images/subcategories'), $imageName);
                $subcategoryData['subcategory_image'] = 'subcategories/' . $imageName;
            } elseif ($request->has('remove_image') && $request->input('remove_image') === '1') {
                // 移除图片：删除文件并清空数据库字段
                if ($subcategory->subcategory_image && file_exists(public_path('assets/images/' . $subcategory->subcategory_image))) {
                    unlink(public_path('assets/images/' . $subcategory->subcategory_image));
                }
                $subcategoryData['subcategory_image'] = null;
            }

            $subcategory->update($subcategoryData);

            $this->logOperation('updated', [
                'subcategory_id' => $id,
                'subcategory_name' => $validatedData['subcategory_name'],
                'subcategory_status' => $validatedData['subcategory_status']
            ]);

            $message = 'Subcategory updated successfully';

            if ($request->ajax()) {
                $freshSubcategory = $subcategory->fresh();

                Log::info('AJAX response data', [
                    'success' => true,
                    'message' => $message,
                    'data' => $freshSubcategory
                ]);

                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $freshSubcategory
                ]);
            }

            return redirect()->route('admin.category_mapping.subcategory.index')
                ->with('success', $message);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Subcategory update validation failed', [
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
            return $this->handleError($request, 'Failed to update subcategory: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 设置子分类为可用状态
     * Set subcategory to available status
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function setAvailable($id)
    {
        try {
            $subcategory = Subcategory::findOrFail($id);
            $subcategory->update(['subcategory_status' => 'Available']);

            $this->logOperation('set to available', ['subcategory_id' => $id]);

            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Subcategory has been set to available status',
                    'data' => $subcategory
                ]);
            }

            return redirect()->route('admin.category_mapping.subcategory.index')
                ->with('success', 'Subcategory has been set to available status');

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to set subcategory available: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 设置子分类为不可用状态
     * Set subcategory to unavailable status
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function setUnavailable($id)
    {
        try {
            $subcategory = Subcategory::findOrFail($id);
            $subcategory->update(['subcategory_status' => 'Unavailable']);

            $this->logOperation('set to unavailable', ['subcategory_id' => $id]);

            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Subcategory has been set to unavailable status',
                    'data' => $subcategory
                ]);
            }

            return redirect()->route('admin.category_mapping.subcategory.index')
                ->with('success', 'Subcategory has been set to unavailable status');

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to set subcategory unavailable: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 删除子分类
     * Delete subcategory
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        try {
            $subcategory = Subcategory::findOrFail($id);

            // 删除子分类图片
            if ($subcategory->subcategory_image && file_exists(public_path('assets/images/' . $subcategory->subcategory_image))) {
                unlink(public_path('assets/images/' . $subcategory->subcategory_image));
            }

            $subcategory->delete();

            $this->logOperation('deleted', ['subcategory_id' => $id]);

            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Subcategory deleted successfully!',
                    'data' => [
                        'id' => $id,
                        'name' => $subcategory->subcategory_name
                    ]
                ]);
            }

            return redirect()->route('admin.category_mapping.subcategory.index')
                ->with('success', 'Subcategory deleted successfully!');

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to delete subcategory: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 导出子分类数据到 Excel
     * Export subcategories data to Excel
     *
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse|\Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function exportSubcategories(Request $request)
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
            $filename = "subcategories_export_{$timestamp}.xlsx";

            // 使用 Laravel Excel 导出
            return Excel::download(new SubcategoryExport($filters), $filename);

        } catch (\Exception $e) {
            Log::error('Subcategory export failed: ' . $e->getMessage());

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
