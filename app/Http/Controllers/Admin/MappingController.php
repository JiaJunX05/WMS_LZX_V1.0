<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Mapping;
use App\Models\Category;
use App\Models\Subcategory;

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
    // Constants for better maintainability
    private const MAX_BULK_MAPPINGS = 10;
    private const STATUSES = ['Available', 'Unavailable'];

    // Validation rules
    private const MAPPING_RULES = [
        'category_id' => 'required|exists:categories,id',
        'subcategory_id' => 'required|exists:subcategories,id',
    ];

    /**
     * Normalize mapping data from frontend
     */
    private function normalizeMappingData(array $mappingData): array
    {
        // Convert camelCase to snake_case
        if (isset($mappingData['categoryId']) && !isset($mappingData['category_id'])) {
            $mappingData['category_id'] = $mappingData['categoryId'];
        }
        if (isset($mappingData['subcategoryId']) && !isset($mappingData['subcategory_id'])) {
            $mappingData['subcategory_id'] = $mappingData['subcategoryId'];
        }
        if (isset($mappingData['mappingStatus']) && !isset($mappingData['mapping_status'])) {
            $mappingData['mapping_status'] = $mappingData['mappingStatus'];
        }

        return $mappingData;
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
        if (strpos($errorMessage, 'Duplicate entry') !== false && strpos($errorMessage, 'mappings_category_id_subcategory_id_unique') !== false) {
            return 'Mapping combination already exists. Please choose a different combination.';
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
        Log::info("Mapping {$action}", array_merge([
            'timestamp' => now()->toISOString(),
            'ip' => request()->ip(),
        ], $data));
    }
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
        return view('admin.mapping.dashboard', compact('categories', 'subcategories', 'mappings'));
    }

    public function create()
    {
        $categories = Category::where('category_status', 'Available')->get();
        $subcategories = Subcategory::where('subcategory_status', 'Available')->get();
        return view('admin.mapping.create', compact('categories', 'subcategories'));
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

                // 限制批量创建数量
                if (count($mappings) > self::MAX_BULK_MAPPINGS) {
                    return $this->handleError($request, 'Cannot create more than ' . self::MAX_BULK_MAPPINGS . ' mappings at once');
                }

                // 预处理：收集所有映射组合进行批量检查
                $combinationsToCheck = [];
                foreach ($mappings as $index => $mappingData) {
                    $mappingData = $this->normalizeMappingData($mappingData);
                    if (isset($mappingData['category_id']) && isset($mappingData['subcategory_id'])) {
                        $combinationsToCheck[] = [
                            'category_id' => $mappingData['category_id'],
                            'subcategory_id' => $mappingData['subcategory_id']
                        ];
                    }
                }

                $existingCombinations = Mapping::where(function($query) use ($combinationsToCheck) {
                    foreach ($combinationsToCheck as $combination) {
                        $query->orWhere(function($q) use ($combination) {
                            $q->where('category_id', $combination['category_id'])
                              ->where('subcategory_id', $combination['subcategory_id']);
                        });
                    }
                })->get(['category_id', 'subcategory_id'])->map(function($item) {
                    return $item->category_id . '_' . $item->subcategory_id;
                })->toArray();

                foreach ($mappings as $index => $mappingData) {
                    try {
                        $mappingData = $this->normalizeMappingData($mappingData);

                        // 验证每个映射数据
                        $validator = \Validator::make($mappingData, self::MAPPING_RULES);

                        if ($validator->fails()) {
                            $errors["mappings.{$index}"] = $validator->errors()->all();
                            continue;
                        }

                        // 检查映射组合是否已存在
                        $combinationKey = $mappingData['category_id'] . '_' . $mappingData['subcategory_id'];
                        if (in_array($combinationKey, $existingCombinations)) {
                            $category = Category::find($mappingData['category_id']);
                            $subcategory = Subcategory::find($mappingData['subcategory_id']);
                            $errors["mappings.{$index}"] = ["Mapping combination {$category->category_name} - {$subcategory->subcategory_name} already exists"];
                            continue;
                        }

                        Mapping::create([
                            'category_id' => $mappingData['category_id'],
                            'subcategory_id' => $mappingData['subcategory_id'],
                            'mapping_status' => 'Available', // 默認為 Available
                        ]);

                        $createdCount++;

                        $this->logOperation('created (batch)', [
                            'category_id' => $mappingData['category_id'],
                            'subcategory_id' => $mappingData['subcategory_id']
                        ]);
                    } catch (\Exception $e) {
                        $simplifiedError = $this->simplifyErrorMessage($e->getMessage());
                        $errorMessage = $simplifiedError ?: $e->getMessage();
                        $errors["mappings.{$index}"] = [$errorMessage];
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

                $this->logOperation('created (batch)', [
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
                $request->validate(self::MAPPING_RULES);

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

                $this->logOperation('created (single)', [
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
            return $this->handleError($request, 'Failed to create mapping: ' . $e->getMessage(), $e);
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

                return view('admin.mapping.view', compact('mappings', 'categories', 'subcategories', 'category'));
            }

            // 如果不是categoryId，检查是否是mappingId
            $mapping = Mapping::with(['category', 'subcategory'])->find($id);

            if ($mapping) {
                $categories = Category::where('category_status', 'Available')->get();
                $subcategories = Subcategory::where('subcategory_status', 'Available')->get();
                return view('admin.mapping.view', compact('mapping', 'categories', 'subcategories'));
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

            return view('admin.mapping.update', compact('mapping', 'categories', 'subcategories'));
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
            $rules = self::MAPPING_RULES;
            $rules['mapping_status'] = 'required|in:' . implode(',', self::STATUSES);

            $validatedData = $request->validate($rules);

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
                'mapping_status' => $validatedData['mapping_status'],
            ]);

            $this->logOperation('updated', [
                'mapping_id' => $id,
                'category_id' => $validatedData['category_id'],
                'subcategory_id' => $validatedData['subcategory_id'],
                'mapping_status' => $validatedData['mapping_status']
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
            return $this->handleError($request, 'Failed to update mapping: ' . $e->getMessage(), $e);
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

            $this->logOperation('deleted', ['mapping_id' => $id]);

            if (request()->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Mapping deleted successfully!'
                ]);
            }

            return redirect()->route('admin.category_mapping.mapping.index')
                ->with('success', 'Mapping deleted successfully!');

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to delete mapping: ' . $e->getMessage(), $e);
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

            $this->logOperation('set to available', ['mapping_id' => $id]);

            if (request()->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Mapping status updated to available successfully!'
                ]);
            }

            return back()->with('success', 'Mapping status updated to available successfully!');

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to update mapping status: ' . $e->getMessage(), $e);
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

            $this->logOperation('set to unavailable', ['mapping_id' => $id]);

            if (request()->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Mapping status updated to unavailable successfully!'
                ]);
            }

            return back()->with('success', 'Mapping status updated to unavailable successfully!');

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to update mapping status: ' . $e->getMessage(), $e);
        }
    }
}
