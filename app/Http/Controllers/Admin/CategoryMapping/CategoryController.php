<?php

namespace App\Http\Controllers\Admin\CategoryMapping;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\CategoryMapping\Category;

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
        return view('admin.categories.category.dashboard', compact('categories'));
    }

    /**
     * 显示创建分类表单
     */
    public function create()
    {
        return view('admin.categories.category.create');
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
        $request->validate([
            'category_name' => 'required|string|max:255|unique:categories,category_name',
            'category_status' => 'required|in:Available,Unavailable',
            'category_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        try {
            $categoryData = [
                'category_name' => $request->input('category_name') ?? $request->input('categoryName'),
                'category_status' => $request->input('category_status') ?? $request->input('categoryStatus'),
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

            Log::info('Category created successfully (single)', [
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
            Log::error('Category creation failed (single): ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            if ($request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create category: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to create category: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * 批量存储分类（统一入口）
     */
    private function storeMultipleCategories(Request $request)
    {
        // 仅处理批量数组
        $categories = $request->input('categories', []);
        $createdCategories = [];
        $errors = [];

        foreach ($categories as $index => $categoryData) {

            // 兼容前端字段命名（camelCase -> snake_case）
            // 前端：categoryName / categoryStatus
            // 后端期望：category_name / category_status
            if (isset($categoryData['categoryName']) && !isset($categoryData['category_name'])) {
                $categoryData['category_name'] = $categoryData['categoryName'];
            }
            if (isset($categoryData['categoryStatus']) && !isset($categoryData['category_status'])) {
                $categoryData['category_status'] = $categoryData['categoryStatus'];
            }

            $validator = \Validator::make($categoryData, [
                'category_name' => 'required|string|max:255',
                'category_status' => 'required|in:Available,Unavailable',
            ]);

            if ($validator->fails()) {
                $errors[] = "Category " . ($index + 1) . ": " . implode(', ', $validator->errors()->all());
                continue;
            }

            // 检查分类名称是否已存在
            $existingCategory = Category::where('category_name', $categoryData['category_name'])->first();

            if ($existingCategory) {
                $errors[] = "Category " . ($index + 1) . ": Category name '{$categoryData['category_name']}' already exists";
                continue;
            }

            try {
                $categoryRecord = [
                    'category_name' => $categoryData['category_name'],
                    'category_status' => $categoryData['category_status'],
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
            } catch (\Exception $e) {
                $errors[] = "Category " . ($index + 1) . ": " . $e->getMessage();
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
        return view('admin.categories.category.update', compact('category'));
    }

    /**
     * 更新分类信息
     */
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $request->validate([
            'category_name' => 'required|string|max:255|unique:categories,category_name,' . $id,
            'category_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'category_status' => 'required|in:Available,Unavailable',
        ]);

        try {
            $categoryData = [
                'category_name' => $request->category_name,
                'category_status' => $request->category_status,
            ];

            // 处理图片更新
            if ($request->hasFile('category_image')) {
                // 删除旧图片
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
            }

            $category->update($categoryData);

            Log::info('Category updated successfully', ['category_id' => $id, 'category_name' => $request->category_name]);

            // 返回 JSON 响应
            if ($request->ajax() || $request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Category updated successfully!',
                    'data' => $category
                ]);
            }

            return redirect()->route('admin.category_mapping.category.index')
                ->with('success', 'Category updated successfully!');

        } catch (\Exception $e) {
            Log::error('Category update failed: ' . $e->getMessage());

            // 返回 JSON 错误响应
            if ($request->ajax() || $request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to update category: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to update category: ' . $e->getMessage()])
                ->withInput();
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

            Log::info('Category set to available', ['category_id' => $id]);

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
            Log::error('Failed to set category available: ' . $e->getMessage());

            // 返回 JSON 错误响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to set category available: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to set category available: ' . $e->getMessage()]);
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

            Log::info('Category set to unavailable', ['category_id' => $id]);

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
            Log::error('Failed to set category unavailable: ' . $e->getMessage());

            // 返回 JSON 错误响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to set category unavailable: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to set category unavailable: ' . $e->getMessage()]);
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

            Log::info('Category deleted successfully', ['category_id' => $id]);

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
            Log::error('Category deletion failed: ' . $e->getMessage());

            // 返回 JSON 错误响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to delete category: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to delete category: ' . $e->getMessage()]);
        }
    }
}
