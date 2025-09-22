<?php

namespace App\Http\Controllers\Admin\CategoryMappings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\CategoryMappings\Category;
use App\Models\CategoryMappings\Subcategory;
use App\Models\CategoryMappings\Mapping;

/**
 * 映射管理控制器
 *
 * 功能模块：
 * - 映射列表展示：搜索、分页
 * - 映射操作：创建、编辑、删除
 * - 分类和子分类关联管理
 *
 * @author WMS Team
 * @version 1.0.0
 */
class MappingController extends Controller
{
    /**
     * 映射列表页面
     *
     * @param Request $request HTTP请求对象
     * @return \Illuminate\View\View|\Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // 如果是 AJAX 请求，返回 JSON 数据
        if ($request->ajax()) {
            try {
                $query = Mapping::with(['category', 'subcategory']);

                // 分页参数
                $perPage = $request->input('perPage', 10);
                $page = $request->input('page', 1);

                // 获取分页数据
                $mappings = $query->paginate($perPage, ['*'], 'page', $page);

                // 计算分页显示信息
                $total = $mappings->total();
                $start = $total > 0 ? ($mappings->currentPage() - 1) * $perPage + 1 : 0;
                $end = min($start + $perPage - 1, $total);

                // 计算未映射的子分类数量
                $totalSubcategories = \App\Models\CategoryMappings\Subcategory::where('subcategory_status', 'Available')->count();
                $mappedSubcategoriesCount = Mapping::distinct('subcategory_id')->count();
                $unmappedSubcategories = max(0, $totalSubcategories - $mappedSubcategoriesCount);

                // 返回 JSON 响应
                return response()->json([
                    'data' => $mappings->items(),
                    'current_page' => $mappings->currentPage(),
                    'last_page' => $mappings->lastPage(),
                    'total' => $total,
                    'per_page' => $perPage,
                    'from' => $start,
                    'to' => $end,
                    'unmapped_subcategories' => $unmappedSubcategories,
                    'pagination' => [
                        'current_page' => $mappings->currentPage(),
                        'last_page' => $mappings->lastPage(),
                        'from' => $start,
                        'to' => $end,
                        'total' => $total,
                    ],
                ]);
            } catch (\Exception $e) {
                Log::error('Mapping index error: ' . $e->getMessage());
                return response()->json(['error' => 'Failed to load mappings'], 500);
            }
        }

        // 非 AJAX 请求，返回视图
        try {
            $categories = Category::where('category_status', 'Available')->get();
            $subcategories = Subcategory::where('subcategory_status', 'Available')->get();
            return view('admin.category_mappings.mapping.dashboard', compact('categories', 'subcategories'));
        } catch (\Exception $e) {
            Log::error('Mapping dashboard error: ' . $e->getMessage());
            return redirect()->back()
                            ->withErrors(['error' => 'Failed to load mapping dashboard']);
        }
    }

    /**
     * 显示创建映射表单
     *
     * @return \Illuminate\View\View
     */
    public function create()
    {
        try {
            // 只获取状态为 Available 的 Category 和 Subcategory
            $categories = Category::where('category_status', 'Available')->get();
            $subcategories = Subcategory::where('subcategory_status', 'Available')->get();

            return view('admin.category_mappings.mapping.create', compact('categories', 'subcategories'));
        } catch (\Exception $e) {
            Log::error('Mapping create form error: ' . $e->getMessage());
            return redirect()->route('admin.category_mapping.mapping.index')
                            ->withErrors(['error' => 'Failed to load create form']);
        }
    }

    /**
     * 存储新映射
     *
     * @param Request $request HTTP请求对象
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        try {
            // 验证输入数据
            $request->validate([
                'category_id' => 'required|exists:categories,id',
                'subcategory_id' => 'required|exists:subcategories,id',
            ]);

            // 检查是否已经存在相同的组合
            $exists = Mapping::where('category_id', $request->category_id)
                            ->where('subcategory_id', $request->subcategory_id)
                            ->exists();

            if ($exists) {
                return redirect()->back()
                                ->withErrors(['error' => 'This Category and Subcategory combination already exists.']);
            }

            // 创建映射记录
            $mapping = Mapping::create([
                'category_id' => $request->category_id,
                'subcategory_id' => $request->subcategory_id,
            ]);

            return redirect()->route('admin.category_mapping.mapping.index')
                            ->with('success', 'Category mapping created successfully');
        } catch (\Exception $e) {
            Log::error('Mapping store error: ' . $e->getMessage());
            return redirect()->back()
                            ->withInput()
                            ->withErrors(['error' => 'Failed to create category mapping']);
        }
    }

    /**
     * 显示编辑映射表单
     *
     * @param int $id 映射ID
     * @return \Illuminate\View\View|\Illuminate\Http\RedirectResponse
     */
    public function edit($id)
    {
        try {
            $mapping = Mapping::findOrFail($id);

            // 只获取状态为 Available 的 Category 和 Subcategory，以及当前已选择的 Category 和 Subcategory
            $categories = Category::where(function($query) use ($mapping) {
                $query->where('category_status', 'Available')
                      ->orWhere('id', $mapping->category_id);
            })->get();

            $subcategories = Subcategory::where(function($query) use ($mapping) {
                $query->where('subcategory_status', 'Available')
                      ->orWhere('id', $mapping->subcategory_id);
            })->get();

            return view('admin.category_mappings.mapping.update', compact('mapping', 'categories', 'subcategories'));
        } catch (\Exception $e) {
            Log::error('Mapping edit form error: ' . $e->getMessage());
            return redirect()->route('admin.category_mapping.mapping.index')
                            ->withErrors(['error' => 'Mapping not found or failed to load edit form']);
        }
    }

    /**
     * 更新映射信息
     *
     * @param Request $request HTTP请求对象
     * @param int $id 映射ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        try {
            // 验证输入数据
            $request->validate([
                'category_id' => 'required|exists:categories,id',
                'subcategory_id' => 'required|exists:subcategories,id',
            ]);

            $mapping = Mapping::findOrFail($id);

            // 检查是否已经存在相同的组合
            $exists = Mapping::where('category_id', $request->category_id)
                            ->where('subcategory_id', $request->subcategory_id)
                            ->where('id', '!=', $id)
                            ->exists();

            if ($exists) {
                return redirect()->back()
                                ->withErrors(['error' => 'This Category and Subcategory combination already exists.']);
            }

            // 更新映射信息
            $mapping->category_id = $request->category_id;
            $mapping->subcategory_id = $request->subcategory_id;
            $mapping->save();

            return redirect()->route('admin.category_mapping.mapping.index')
                            ->with('success', 'Category mapping updated successfully');
        } catch (\Exception $e) {
            Log::error('Mapping update error: ' . $e->getMessage());
            return redirect()->back()
                            ->withInput()
                            ->withErrors(['error' => 'Failed to update category mapping']);
        }
    }

    /**
     * 删除映射
     *
     * @param int $id 映射ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        try {
            $mapping = Mapping::findOrFail($id);

            // 检查是否有关联的产品
            if ($mapping->category->products()->exists() || $mapping->subcategory->products()->exists()) {
                return redirect()->back()
                                ->withErrors(['error' => 'Cannot delete this mapping because products are still linked to its category or subcategory.']);
            }

            // 删除映射记录
            $mapping->delete();

            return redirect()->route('admin.category_mapping.mapping.index')
                            ->with('success', 'Category mapping deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Mapping destroy error: ' . $e->getMessage());
            return redirect()->back()
                            ->withErrors(['error' => 'Failed to delete mapping: ' . $e->getMessage()]);
        }
    }
}
