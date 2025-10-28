<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Category;
use App\Exports\CategoryExport;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;

/**
 * 分类管理控制器
 *
 * 功能模块：
 * - 分类列表展示：搜索、筛选、分页
 * - 分类操作：创建、编辑、删除、状态管理
 * - 图片管理：上传、更新、删除
 *
 * @author WMS Team
 * @version 1.0.0
 */
class CategoryController extends Controller
{
    // Constants for better maintainability
    private const MAX_BULK_CATEGORIES = 10;
    private const STATUSES = ['Available', 'Unavailable'];

    // Validation rules
    private const CATEGORY_RULES = [
        'category_name' => 'required|string|max:255',
    ];

    private const CATEGORY_IMAGE_RULES = [
        'category_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
    ];

    /**
     * Normalize category data from frontend
     */
    private function normalizeCategoryData(array $categoryData): array
    {
        // Convert camelCase to snake_case
        if (isset($categoryData['categoryName']) && !isset($categoryData['category_name'])) {
            $categoryData['category_name'] = $categoryData['categoryName'];
        }
        if (isset($categoryData['categoryStatus']) && !isset($categoryData['category_status'])) {
            $categoryData['category_status'] = $categoryData['categoryStatus'];
        }

        return $categoryData;
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
        if (strpos($errorMessage, 'Duplicate entry') !== false && strpos($errorMessage, 'categories_category_name_unique') !== false) {
            return 'Category name already exists. Please choose a different name.';
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
        Log::info("Category {$action}", array_merge([
            'timestamp' => now()->toISOString(),
            'ip' => request()->ip(),
        ], $data));
    }
    /**
     * 显示分类列表页面
     */
    public function index(Request $request)
    {
        if ($request->ajax()) {
            try {
                $query = Category::query();

                // 搜索功能
                if ($request->has('search') && $request->search) {
                    $search = $request->search;
                    $query->where(function($q) use ($search) {
                        $q->where('category_name', 'like', "%{$search}%");
                    });
                }

                // 状态筛选
                if ($request->has('status_filter') && $request->status_filter) {
                    $query->where('category_status', $request->status_filter);
                }

                $categories = $query->paginate(10);

                return response()->json([
                    'success' => true,
                    'data' => $categories->items(),
                    'pagination' => [
                        'current_page' => $categories->currentPage(),
                        'last_page' => $categories->lastPage(),
                        'per_page' => $categories->perPage(),
                        'total' => $categories->total(),
                        'from' => $categories->firstItem(),
                        'to' => $categories->lastItem(),
                    ]
                ]);
            } catch (\Exception $e) {
                Log::error('Category management error: ' . $e->getMessage());
                return response()->json(['error' => 'Failed to fetch categories'], 500);
            }
        }

        $categories = Category::paginate(10);
        return view('admin.category.dashboard', compact('categories'));
    }

    /**
     * 显示创建分类表单
     */
    public function create()
    {
        return view('admin.category.create');
    }

    /**
     * 存储新分类
     */
    public function store(Request $request)
    {
        // 与 SizeLibrary 的实现保持一致：有数组走批量，否则走单个
        if ($request->has('categories') && is_array($request->input('categories'))) {
            return $this->storeMultipleCategories($request);
        }

        return $this->storeSingleCategory($request);
    }

    /**
     * 单个存储分类
     */
    private function storeSingleCategory(Request $request)
    {
        // 校验
        $rules = array_merge(self::CATEGORY_RULES, self::CATEGORY_IMAGE_RULES);
        $rules['category_name'] .= '|unique:categories,category_name';

        $request->validate($rules);

        try {
            $categoryData = [
                'category_name' => $request->input('category_name') ?? $request->input('categoryName'),
                'category_status' => 'Available', // 默认为 Available
            ];

            // 处理文件上传
            if ($request->hasFile('category_image')) {
                // 文件上传（确保目录存在）
                $image = $request->file('category_image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $directory = public_path('assets/images/categories');
                if (!file_exists($directory)) {
                    mkdir($directory, 0777, true);
                }
                $image->move($directory, $imageName);
                $categoryData['category_image'] = 'categories/' . $imageName;
            }

            $category = Category::create($categoryData);

            $this->logOperation('created (single)', [
                'category_id' => $category->id,
                'category_name' => $categoryData['category_name']
            ]);

            $message = 'Category created successfully!';

            if ($request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $category
                ]);
            }

            return redirect()->route('admin.category_mapping.category.index')
                ->with('success', $message);

        } catch (\Exception $e) {
            return $this->handleError($request, 'Failed to create category: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 批量存储分类（统一入口）
     */
    private function storeMultipleCategories(Request $request)
    {
        // 仅处理批量数组
        $categories = $request->input('categories', []);

        // 限制批量创建数量
        if (count($categories) > self::MAX_BULK_CATEGORIES) {
            return $this->handleError($request, 'Cannot create more than ' . self::MAX_BULK_CATEGORIES . ' categories at once');
        }

        $createdCategories = [];
        $errors = [];

        // 预处理：收集所有分类名称进行批量检查
        $categoryNamesToCheck = [];
        foreach ($categories as $index => $categoryData) {
            $categoryData = $this->normalizeCategoryData($categoryData);
            if (isset($categoryData['category_name'])) {
                $categoryNamesToCheck[] = $categoryData['category_name'];
            }
        }

        $existingCategoryNames = Category::whereIn('category_name', $categoryNamesToCheck)->pluck('category_name')->toArray();

        foreach ($categories as $index => $categoryData) {
            $categoryData = $this->normalizeCategoryData($categoryData);

            $validator = \Validator::make($categoryData, self::CATEGORY_RULES);

            if ($validator->fails()) {
                $errors[] = "Category " . ($index + 1) . ": " . implode(', ', $validator->errors()->all());
                continue;
            }

            // 检查分类名称是否已存在
            if (in_array($categoryData['category_name'], $existingCategoryNames)) {
                $errors[] = "Category " . ($index + 1) . ": Category name '{$categoryData['category_name']}' already exists";
                continue;
            }

            try {
                $categoryRecord = [
                    'category_name' => $categoryData['category_name'],
                    'category_status' => 'Available', // 默认为 Available
                ];

                // 处理图片上传 - 使用文件数组
                $files = $request->file('images');
                if (is_array($files) && isset($files[$index]) && $files[$index] && $files[$index]->isValid()) {
                    $image = $files[$index];
                    $directory = public_path('assets/images/categories');
                    if (!file_exists($directory)) {
                        mkdir($directory, 0777, true);
                    }
                    $imageName = time() . '_' . $index . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                    $image->move($directory, $imageName);
                    $categoryRecord['category_image'] = 'categories/' . $imageName;
                }

                $category = Category::create($categoryRecord);
                $createdCategories[] = $category;

                $this->logOperation('created (batch)', [
                    'category_id' => $category->id,
                    'category_name' => $categoryData['category_name']
                ]);
            } catch (\Exception $e) {
                $simplifiedError = $this->simplifyErrorMessage($e->getMessage());
                $errorMessage = $simplifiedError ?: $e->getMessage();
                $errors[] = "Category " . ($index + 1) . ": " . $errorMessage;
            }
        }

        if ($request->ajax()) {
            if (count($errors) > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some categories failed to create',
                    'errors' => $errors,
                    'created_count' => count($createdCategories)
                ], 422);
            } else {
                return response()->json([
                    'success' => true,
                    'message' => count($createdCategories) . ' categories created successfully',
                    'data' => $createdCategories
                ]);
            }
        }

        if (count($errors) > 0) {
            return back()->withErrors(['error' => implode('; ', $errors)])
                ->withInput();
        }

        return redirect()->route('admin.category_mapping.category.index')
            ->with('success', count($createdCategories) . ' categories created successfully');
    }


    /**
     * 显示编辑分类表单
     */
    public function edit($id)
    {
        $category = Category::findOrFail($id);
        return view('admin.category.update', compact('category'));
    }

    /**
     * 更新分类信息
     */
    public function update(Request $request, $id)
    {
        try {
            $category = Category::findOrFail($id);

            Log::info('Update request received', [
                'id' => $id,
                'request_data' => $request->all(),
                'is_ajax' => request()->ajax()
            ]);

            // 验证请求数据
            $rules = array_merge(self::CATEGORY_RULES, self::CATEGORY_IMAGE_RULES);
            $rules['category_status'] = 'required|in:' . implode(',', self::STATUSES);

            $validatedData = $request->validate($rules);

            // 检查分类名称是否已存在（排除当前记录）
            $existingCategory = Category::where('category_name', $validatedData['category_name'])
                ->where('id', '!=', $id)
                ->first();

            if ($existingCategory) {
                $message = "Category name '{$validatedData['category_name']}' already exists";

                if ($request->ajax()) {
                    return response()->json([
                        'success' => false,
                        'message' => $message,
                        'errors' => [
                            'category_name' => [$message]
                        ]
                    ], 422);
                }

                return back()->withErrors(['category_name' => $message])->withInput();
            }

            // 更新分类记录
            $categoryData = [
                'category_name' => $validatedData['category_name'],
                'category_status' => $validatedData['category_status'],
            ];

            // 处理图片：上传新图片或移除现有图片
            if ($request->hasFile('category_image')) {
                // 上传新图片：删除旧图片
                if ($category->category_image && file_exists(public_path('assets/images/' . $category->category_image))) {
                    unlink(public_path('assets/images/' . $category->category_image));
                }

                // 上传新图片（确保目录存在）
                $image = $request->file('category_image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $directory = public_path('assets/images/categories');
                if (!file_exists($directory)) {
                    mkdir($directory, 0777, true);
                }
                $image->move($directory, $imageName);
                $categoryData['category_image'] = 'categories/' . $imageName;
            } elseif ($request->has('remove_image') && $request->input('remove_image') === '1') {
                // 移除图片：删除文件并清空数据库字段
                if ($category->category_image && file_exists(public_path('assets/images/' . $category->category_image))) {
                    unlink(public_path('assets/images/' . $category->category_image));
                }
                $categoryData['category_image'] = null;
            }

            $category->update($categoryData);

            $this->logOperation('updated', [
                'category_id' => $id,
                'category_name' => $validatedData['category_name'],
                'category_status' => $validatedData['category_status']
            ]);

            $message = 'Category updated successfully';

            if ($request->ajax()) {
                $freshCategory = $category->fresh();
                Log::info('AJAX response data', [
                    'success' => true,
                    'message' => $message,
                    'data' => $freshCategory
                ]);

                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $freshCategory
                ]);
            }

            return redirect()->route('admin.category_mapping.category.index')
                ->with('success', $message);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Category update validation failed', [
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
            return $this->handleError($request, 'Failed to update category: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 设置分类为可用状态
     */
    public function setAvailable($id)
    {
        try {
            $category = Category::findOrFail($id);
            $category->update(['category_status' => 'Available']);

            $this->logOperation('set to available', ['category_id' => $id]);

            // 返回 JSON 响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Category has been set to available status',
                    'data' => $category
                ]);
            }

            return redirect()->route('admin.category_mapping.category.index')
                ->with('success', 'Category has been set to available status');

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to set category available: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 设置分类为不可用状态
     */
    public function setUnavailable($id)
    {
        try {
            $category = Category::findOrFail($id);
            $category->update(['category_status' => 'Unavailable']);

            $this->logOperation('set to unavailable', ['category_id' => $id]);

            // 返回 JSON 响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Category has been set to unavailable status',
                    'data' => $category
                ]);
            }

            return redirect()->route('admin.category_mapping.category.index')
                ->with('success', 'Category has been set to unavailable status');

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to set category unavailable: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 删除分类
     */
    public function destroy($id)
    {
        try {
            $category = Category::findOrFail($id);

            // 删除分类图片
            if ($category->category_image && file_exists(public_path('assets/images/' . $category->category_image))) {
                unlink(public_path('assets/images/' . $category->category_image));
            }

            $category->delete();

            $this->logOperation('deleted', ['category_id' => $id]);

            // 返回 JSON 响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Category deleted successfully!',
                    'data' => [
                        'id' => $id,
                        'name' => $category->category_name
                    ]
                ]);
            }

            return redirect()->route('admin.category_mapping.category.index')
                ->with('success', 'Category deleted successfully!');

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to delete category: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 導出分類數據到Excel
     */
    public function exportCategories(Request $request)
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
            $filename = "categories_export_{$timestamp}.xlsx";

            // 使用Laravel Excel導出
            return Excel::download(new CategoryExport($filters), $filename);

        } catch (\Exception $e) {
            Log::error('Category export failed: ' . $e->getMessage());

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
