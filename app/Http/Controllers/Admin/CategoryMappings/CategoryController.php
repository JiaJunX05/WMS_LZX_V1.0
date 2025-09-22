<?php

namespace App\Http\Controllers\Admin\CategoryMappings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\CategoryMappings\Category;

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
     * 分类列表页面
     *
     * @param Request $request HTTP请求对象
     * @return \Illuminate\View\View|\Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // 如果是 AJAX 请求，返回 JSON 数据
        if ($request->ajax()) {
            try {
                $query = Category::query();

                // 搜索条件：分类名称
                if ($request->filled('search')) {
                    $search = $request->input('search');
                    $query->where('category_name', 'like', "%$search%");
                }

                // 根据分类ID筛选
                if ($request->filled('category_id')) {
                    $query->where('id', $request->input('category_id'));
                }

                // 根据分类状态筛选
                if ($request->filled('category_status')) {
                    $query->where('category_status', $request->input('category_status'));
                }

                // 分页设置
                $perPage = $request->input('perPage', 10);
                $categories = $query->paginate($perPage);

                // 返回分页数据
                return response()->json([
                    'data' => $categories->map(function ($category) {
                        return [
                            'id' => $category->id,
                            'category_name' => $category->category_name,
                            'category_image' => $category->category_image,
                            'category_status' => $category->category_status,
                        ];
                    }),
                    'pagination' => [
                        'current_page' => $categories->currentPage(),
                        'last_page' => $categories->lastPage(),
                        'total' => $categories->total(),
                        'per_page' => $categories->perPage(),
                        'from' => $categories->firstItem(),
                        'to' => $categories->lastItem(),
                    ],
                ]);
            } catch (\Exception $e) {
                Log::error('Category management error: ' . $e->getMessage());
                return response()->json(['error' => 'Failed to fetch categories'], 500);
            }
        }

        // 如果不是 AJAX 请求，返回视图
        $categories = Category::all();
        return view('admin.category_mappings.category.dashboard', compact('categories'));
    }

    /**
     * 显示创建分类表单
     *
     * @return \Illuminate\View\View
     */
    public function create()
    {
        return view('admin.category_mappings.category.create');
    }

    /**
     * 存储新分类
     *
     * @param Request $request HTTP请求对象
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        try {
            // 验证请求数据
            $request->validate([
                'category_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'category_name' => 'required|string|max:255|unique:categories',
                'category_status' => 'required|in:Available,Unavailable',
            ]);

            // 处理图片上传（如果有的话）
            $categoryImagePath = null;
            if ($request->hasFile('category_image')) {
                $image = $request->file('category_image');
                $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $directory = public_path('assets/images/categories');

                // 确保目录存在
                if (!file_exists($directory)) {
                    mkdir($directory, 0777, true);
                }

                // 移动图片到指定目录
                $image->move($directory, $imageName);
                $categoryImagePath = 'categories/' . $imageName;
            }

            // 创建分类记录
            $category = Category::create([
                'category_image' => $categoryImagePath,
                'category_name' => $request->category_name,
                'category_status' => $request->category_status ?? 'Available',
            ]);

            return redirect()->route('admin.category_mapping.category.index')
                            ->with('success', 'Category created successfully');
        } catch (\Exception $e) {
            Log::error('Category creation error: ' . $e->getMessage());

            // 如果出错，删除已上传的图片
            if (isset($imageName) && file_exists($directory . '/' . $imageName)) {
                unlink($directory . '/' . $imageName);
            }

            return redirect()->back()
                            ->withInput()
                            ->withErrors(['error' => 'Category creation failed: ' . $e->getMessage()]);
        }
    }

    public function edit($id) {
        $category = Category::findOrFail($id);
        return view('admin.category_mappings.category.update', compact('category'));
    }

    public function update(Request $request, $id) {
        try {
            $request->validate([
                'category_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'category_name' => 'required|string|max:255|unique:categories,category_name,' . $id,
                'category_status' => 'required|in:Available,Unavailable',
            ]);

            $category = Category::findOrFail($id);

            if (!$category) {
                return redirect()->back()
                                ->withErrors(['error' => 'Category not found']);
            }

            if ($request->hasFile('category_image')) {
                // 删除旧图片
                if ($category->category_image) {
                    $imagePath = public_path('assets/images/' . $category->category_image);
                    if (file_exists($imagePath)) {
                        unlink($imagePath);
                    }
                }

                // 处理新图片上传
                $image = $request->file('category_image');
                $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $directory = public_path('assets/images/categories');

                // 确保目录存在
                if (!file_exists($directory)) {
                    mkdir($directory, 0777, true);
                }

                $image->move($directory, $imageName);
                $category->category_image = 'categories/' . $imageName;
            }

            $category->category_name = $request->category_name;
            $category->category_status = $request->category_status ?? 'Available';
            $category->save();

            return redirect()->route('admin.category_mapping.category.index')
                            ->with('success', 'Category updated successfully');
        } catch (\Exception $e) {
            Log::error('Category update error: ' . $e->getMessage());
            return redirect()->back()
                            ->withInput()
                            ->withErrors(['error' => 'Category update failed: ' . $e->getMessage()]);
        }
    }

    public function destroy($id) {
        try {
            $category = Category::findOrFail($id);

            // 检查是否有关联的分类
            if ($category->mappings()->exists()) {
                return redirect()->back()
                                ->withErrors(['error' => 'Cannot delete category with existing mappings']);
            }

            // 删除数据库记录
            if ($category->category_image) {
                $imagePath = public_path('assets/images/' . $category->category_image);
                if (file_exists($imagePath)) {
                    unlink($imagePath);
                }
            }

            // 删除数据库记录
            $category->delete();

            return redirect()->route('admin.category_mapping.category.index')
                            ->with('success', 'Category deleted successfully');

        } catch (\Exception $e) {
            Log::error('Category deletion error: ' . $e->getMessage());
            return redirect()->back()
                            ->withErrors(['error' => 'Failed to delete category: ' . $e->getMessage()]);
        }
    }

    /**
     * 设置分类为可用状态
     *
     * @param int $id 分类ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function setAvailable($id)
    {
        try {
            $category = Category::findOrFail($id);
            $category->category_status = 'Available';
            $category->save();

            Log::info('Category set to Available', [
                'category_id' => $category->id,
                'category_name' => $category->category_name
            ]);

            return redirect()->route('admin.category_mapping.category.index')
                            ->with('success', 'Category has been set to available status');
        } catch (\Exception $e) {
            Log::error('Failed to set category to Available', [
                'category_id' => $id,
                'error_message' => $e->getMessage()
            ]);

            return redirect()->back()
                            ->withErrors(['error' => 'An error occurred while setting category status. Please try again.']);
        }
    }

    /**
     * 设置分类为不可用状态
     *
     * @param int $id 分类ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function setUnavailable($id)
    {
        try {
            $category = Category::findOrFail($id);
            $category->category_status = 'Unavailable';
            $category->save();

            Log::info('Category set to Unavailable', [
                'category_id' => $category->id,
                'category_name' => $category->category_name
            ]);

            return redirect()->route('admin.category_mapping.category.index')
                            ->with('success', 'Category has been set to unavailable status');
        } catch (\Exception $e) {
            Log::error('Failed to set category to Unavailable', [
                'category_id' => $id,
                'error_message' => $e->getMessage()
            ]);

            return redirect()->back()
                            ->withErrors(['error' => 'An error occurred while setting category status. Please try again.']);
        }
    }
}



