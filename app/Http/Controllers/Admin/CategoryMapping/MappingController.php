<?php

namespace App\Http\Controllers\Admin\CategoryMapping;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\CategoryMapping\Mapping;
use App\Models\CategoryMapping\Category;
use App\Models\CategoryMapping\Subcategory;

/**
 * 分类映射管理控制器 (Category Mapping Management Controller)
 *
 * 功能：
 * - 分类映射数据管理：创建、读取、更新、删除
 * - 批量创建分类映射
 * - 分类映射搜索和分页
 * - 统计数据计算
 *
 * @author WMS Team
 * @version 1.0.0
 */
class MappingController extends Controller
{
    /**
     * 显示分类映射管理页面
     *
     * @param Request $request
     * @return \Illuminate\View\View|\Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        if ($request->ajax()) {
            try {
                $mappings = Mapping::with(['category', 'subcategory'])->get();

                // 計算統計數據
                $totalCategories = Category::where('category_status', 'Available')->count();
                $totalSubcategories = Subcategory::where('subcategory_status', 'Available')->count();
                $totalMappings = $mappings->count();

                return response()->json([
                    'success' => true,
                    'data' => $mappings,
                    'total' => $totalMappings,
                    'categories_count' => $totalCategories,
                    'subcategories_count' => $totalSubcategories,
                    'pagination' => [
                        'current_page' => 1,
                        'last_page' => 1,
                        'per_page' => $totalMappings,
                        'total' => $totalMappings,
                        'from' => 1,
                        'to' => $totalMappings,
                    ]
                ]);
            } catch (\Exception $e) {
                Log::error('Mapping management error: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch mappings: ' . $e->getMessage()
                ], 500);
            }
        }

        $categories = Category::where('category_status', 'Available')->get();
        $subcategories = Subcategory::where('subcategory_status', 'Available')->get();
        $mappings = Mapping::with(['category', 'subcategory'])->get();
        return view('admin.categories.mapping.dashboard', compact('categories', 'subcategories', 'mappings'));
    }

    public function create()
    {
        $categories = Category::where('category_status', 'Available')->get();
        $subcategories = Subcategory::where('subcategory_status', 'Available')->get();
        return view('admin.categories.mapping.create', compact('categories', 'subcategories'));
    }

    /**
     * 存储新分类映射
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            // 检查是否为批量创建模式
            if ($request->has('mappings') && is_array($request->mappings)) {
                // 批量创建模式
                $mappings = $request->mappings;
                $createdCount = 0;
                $errors = [];

                foreach ($mappings as $index => $mappingData) {
                    try {
                        // 验证每个映射数据
                        $validator = \Validator::make($mappingData, [
                            'category_id' => 'required|exists:categories,id',
                            'subcategory_id' => 'required|exists:subcategories,id',
                            'mapping_status' => 'nullable|in:Available,Unavailable',
                        ]);

                        if ($validator->fails()) {
                            $errors["mappings.{$index}"] = $validator->errors()->all();
                            continue;
                        }

                        // 检查映射是否已存在
                        $existing = Mapping::where('category_id', $mappingData['category_id'])
                            ->where('subcategory_id', $mappingData['subcategory_id'])
                            ->first();

                        if ($existing) {
                            $category = Category::find($mappingData['category_id']);
                            $subcategory = Subcategory::find($mappingData['subcategory_id']);
                            $errors["mappings.{$index}"] = ["Mapping combination {$category->category_name} - {$subcategory->subcategory_name} already exists"];
                            continue;
                        }

                        Mapping::create([
                            'category_id' => $mappingData['category_id'],
                            'subcategory_id' => $mappingData['subcategory_id'],
                            'mapping_status' => $mappingData['mapping_status'] ?? 'Available',
                        ]);

                        $createdCount++;
                    } catch (\Exception $e) {
                        $errors["mappings.{$index}"] = [$e->getMessage()];
                    }
                }

                if (!empty($errors)) {
                    if ($request->ajax()) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Some mappings failed to create',
                            'errors' => $errors
                        ], 422);
                    }
                    return back()->withErrors($errors)->withInput();
                }

                Log::info('Mappings created successfully', [
                    'count' => $createdCount,
                    'mappings' => $mappings
                ]);

                if ($request->ajax()) {
                    return response()->json([
                        'success' => true,
                        'message' => "Successfully created {$createdCount} mapping(s)!"
                    ]);
                }

                return redirect()->route('admin.category_mapping.mapping.index')
                    ->with('success', "Successfully created {$createdCount} mapping(s)!");
            } else {
                // 单个创建模式
                $request->validate([
                    'category_id' => 'required|exists:categories,id',
                    'subcategory_id' => 'required|exists:subcategories,id',
                ]);

                // 检查映射是否已存在
                $existing = Mapping::where('category_id', $request->category_id)
                    ->where('subcategory_id', $request->subcategory_id)
                    ->first();

                if ($existing) {
                    $category = Category::find($request->category_id);
                    $subcategory = Subcategory::find($request->subcategory_id);
                    $errorMessage = "Mapping combination {$category->category_name} - {$subcategory->subcategory_name} already exists";

                    if ($request->ajax()) {
                        return response()->json([
                            'success' => false,
                            'message' => $errorMessage,
                            'errors' => ['mapping' => [$errorMessage]]
                        ], 422);
                    }

                    return back()->withErrors(['mapping' => $errorMessage])->withInput();
                }

                Mapping::create([
                    'category_id' => $request->category_id,
                    'subcategory_id' => $request->subcategory_id,
                ]);

                Log::info('Mapping created successfully', [
                    'category_id' => $request->category_id,
                    'subcategory_id' => $request->subcategory_id
                ]);

                if ($request->ajax()) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Mapping created successfully!'
                    ]);
                }

                return redirect()->route('admin.category_mapping.mapping.index')
                    ->with('success', 'Mapping created successfully!');
            }

        } catch (\Exception $e) {
            Log::error('Mapping creation failed: ' . $e->getMessage());

            if ($request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create mapping: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to create mapping: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * 显示分类映射详情页面
     *
     * @param int $id
     * @return \Illuminate\View\View
     */
    public function view($id)
    {
        try {
            // 首先检查是否是categoryId
            $category = Category::find($id);

            if ($category) {
                // 如果是categoryId，获取该分类下的所有映射
                $mappings = Mapping::where('category_id', $id)->with(['category', 'subcategory'])->get();
                $categories = Category::where('category_status', 'Available')->get();
                $subcategories = Subcategory::where('subcategory_status', 'Available')->get();

                return view('admin.categories.mapping.view', compact('mappings', 'categories', 'subcategories', 'category'));
            }

            // 如果不是categoryId，检查是否是mappingId
            $mapping = Mapping::with(['category', 'subcategory'])->find($id);

            if ($mapping) {
                $categories = Category::where('category_status', 'Available')->get();
                $subcategories = Subcategory::where('subcategory_status', 'Available')->get();
                return view('admin.categories.mapping.view', compact('mapping', 'categories', 'subcategories'));
            }

            // 如果既不是category也不是mapping，返回404
            abort(404, 'Category or mapping not found');

        } catch (\Exception $e) {
            Log::error('Failed to load view form: ' . $e->getMessage(), [
                'id' => $id,
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('admin.category_mapping.mapping.index')
                ->with('error', 'Failed to load view form');
        }
    }

    /**
     * 显示编辑分类映射页面
     *
     * @param int $id
     * @return \Illuminate\View\View
     */
    public function edit($id)
    {
        try {
            $mapping = Mapping::with(['category', 'subcategory'])->findOrFail($id);
            $categories = Category::where('category_status', 'Available')->get();
            $subcategories = Subcategory::where('subcategory_status', 'Available')->get();

            return view('admin.categories.mapping.update', compact('mapping', 'categories', 'subcategories'));
        } catch (\Exception $e) {
            Log::error('Failed to load edit form: ' . $e->getMessage(), [
                'id' => $id,
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('admin.category_mapping.mapping.index')
                ->with('error', 'Failed to load edit form');
        }
    }

    /**
     * 更新分类映射信息
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        try {
            $mapping = Mapping::findOrFail($id);

            Log::info('Update request received', [
                'id' => $id,
                'request_data' => $request->all(),
                'is_ajax' => request()->ajax()
            ]);

            // 验证请求数据
            $validatedData = $request->validate([
                'category_id' => 'required|exists:categories,id',
                'subcategory_id' => 'required|exists:subcategories,id',
            ]);

            // 检查映射组合是否已存在（排除当前记录）
            $existingMapping = Mapping::where('category_id', $validatedData['category_id'])
                ->where('subcategory_id', $validatedData['subcategory_id'])
                ->where('id', '!=', $id)
                ->first();

            if ($existingMapping) {
                $category = Category::find($validatedData['category_id']);
                $subcategory = Subcategory::find($validatedData['subcategory_id']);
                $message = "Mapping combination {$category->category_name} - {$subcategory->subcategory_name} already exists";

                if ($request->ajax()) {
                    return response()->json([
                        'success' => false,
                        'message' => $message,
                        'errors' => [
                            'mapping' => [$message]
                        ]
                    ], 422);
                }

                return back()->withErrors(['mapping' => $message])->withInput();
            }

            // 更新映射记录
            $mapping->update([
                'category_id' => $validatedData['category_id'],
                'subcategory_id' => $validatedData['subcategory_id'],
            ]);

            Log::info('Mapping updated successfully', [
                'mapping_id' => $id,
                'category_id' => $validatedData['category_id'],
                'subcategory_id' => $validatedData['subcategory_id']
            ]);

            $message = 'Mapping updated successfully!';

            if ($request->ajax()) {
                $freshMapping = $mapping->fresh(['category', 'subcategory']);
                Log::info('AJAX response data', [
                    'success' => true,
                    'message' => $message,
                    'data' => $freshMapping
                ]);

                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $freshMapping
                ]);
            }

            return redirect()->route('admin.category_mapping.mapping.index')
                ->with('success', $message);

        } catch (\Exception $e) {
            Log::error('Mapping update failed: ' . $e->getMessage(), [
                'id' => $id,
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            if ($request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to update mapping: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to update mapping: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * 删除分类映射
     *
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $mapping = Mapping::findOrFail($id);
            $mapping->delete();

            Log::info('Mapping deleted successfully', ['mapping_id' => $id]);

            if (request()->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Mapping deleted successfully!'
                ]);
            }

            return redirect()->route('admin.category_mapping.mapping.index')
                ->with('success', 'Mapping deleted successfully!');

        } catch (\Exception $e) {
            Log::error('Mapping deletion failed: ' . $e->getMessage());

            if (request()->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to delete mapping: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to delete mapping: ' . $e->getMessage()]);
        }
    }

    /**
     * 设置映射为可用状态
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function setAvailable($id)
    {
        try {
            $mapping = Mapping::findOrFail($id);
            $mapping->update(['mapping_status' => 'Available']);

            Log::info('Mapping set to available', ['mapping_id' => $id]);

            if (request()->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Mapping status updated to available successfully!'
                ]);
            }

            return back()->with('success', 'Mapping status updated to available successfully!');

        } catch (\Exception $e) {
            Log::error('Failed to set mapping available: ' . $e->getMessage());

            if (request()->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to update mapping status: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to update mapping status: ' . $e->getMessage()]);
        }
    }

    /**
     * 设置映射为不可用状态
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function setUnavailable($id)
    {
        try {
            $mapping = Mapping::findOrFail($id);
            $mapping->update(['mapping_status' => 'Unavailable']);

            Log::info('Mapping set to unavailable', ['mapping_id' => $id]);

            if (request()->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Mapping status updated to unavailable successfully!'
                ]);
            }

            return back()->with('success', 'Mapping status updated to unavailable successfully!');

        } catch (\Exception $e) {
            Log::error('Failed to set mapping unavailable: ' . $e->getMessage());

            if (request()->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to update mapping status: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to update mapping status: ' . $e->getMessage()]);
        }
    }
}
