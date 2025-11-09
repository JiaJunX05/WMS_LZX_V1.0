<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Mapping;
use App\Models\Category;
use App\Models\Subcategory;

/**
 * 分类映射管理控制器
 * Category Mapping Management Controller
 *
 * 功能模块：
 * - 分类映射列表展示：搜索、筛选、分页
 * - 分类映射操作：创建、编辑、删除、状态管理
 * - 批量创建：支持批量创建分类映射
 * - 统计数据：计算分类映射相关统计数据
 *
 * @author WMS Team
 * @version 3.0.0
 */
class MappingController extends Controller
{
    // =============================================================================
    // 常量定义 (Constants)
    // =============================================================================

    /**
     * 批量创建最大数量
     */
    private const MAX_BULK_MAPPINGS = 100; // 增加到 100，如果需要移除限制可以设置为 PHP_INT_MAX

    /**
     * 状态常量
     */
    private const STATUSES = ['Available', 'Unavailable'];

    /**
     * 映射验证规则
     */
    private const MAPPING_RULES = [
        'category_id' => 'required|exists:categories,id',
        'subcategory_id' => 'required|exists:subcategories,id',
    ];

    /**
     * 映射状态验证规则
     */
    private const MAPPING_STATUS_RULES = [
        'mapping_status' => 'required|in:Available,Unavailable',
    ];

    // =============================================================================
    // 私有辅助方法 (Private Helper Methods)
    // =============================================================================

    /**
     * 标准化映射数据
     * Normalize mapping data from frontend
     *
     * @param array $mappingData
     * @return array
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
        if (strpos($errorMessage, 'Duplicate entry') !== false && strpos($errorMessage, 'mappings_category_id_subcategory_id_unique') !== false) {
            return 'Mapping combination already exists. Please choose a different combination.';
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
        Log::info("Mapping {$action}", array_merge([
            'timestamp' => now()->toISOString(),
            'ip' => request()->ip(),
        ], $data));
    }

    // =============================================================================
    // 公共方法 (Public Methods)
    // =============================================================================

    /**
     * 显示分类映射管理页面
     * Display category mapping management page
     *
     * @param Request $request
     * @return \Illuminate\View\View|\Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        if ($request->ajax()) {
            try {
                $mappings = Mapping::with(['category', 'subcategory'])->get();

                // 计算统计数据
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

    /**
     * 获取创建映射数据（现在通过 modal，只返回 JSON）
     * Get create mapping data (now through modal, returns JSON only)
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function create()
    {
        $categories = Category::where('category_status', 'Available')->get();
        $subcategories = Subcategory::where('subcategory_status', 'Available')->get();

        return response()->json([
            'success' => true,
            'categories' => $categories,
            'subcategories' => $subcategories
        ]);
    }

    /**
     * 存储新分类映射
     * Store new category mapping
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        try {
            // 检查是否为批量创建模式
            if ($request->has('mappings') && is_array($request->mappings)) {
                return $this->storeMultipleMappings($request);
            }

            return $this->storeSingleMapping($request);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Mapping validation failed', [
                'errors' => $e->errors()
            ]);

            if ($request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $e->errors()
                ], 422);
            }

            return back()->withErrors($e->errors())->withInput();

        } catch (\Exception $e) {
            return $this->handleError($request, 'Failed to create mapping: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 显示分类映射详情页面
     * Display category mapping details page
     *
     * @param int $id
     * @return \Illuminate\View\View
     */
    public function view($id)
    {
        try {
            // 首先检查是否是 categoryId
            $category = Category::find($id);

            if ($category) {
                // 如果是 categoryId，获取该分类下的所有映射
                $mappings = Mapping::where('category_id', $id)->with(['category', 'subcategory'])->get();
                $categories = Category::where('category_status', 'Available')->get();
                $subcategories = Subcategory::where('subcategory_status', 'Available')->get();

                return view('admin.mapping.view', compact('mappings', 'categories', 'subcategories', 'category'));
            }

            // 如果不是 categoryId，检查是否是 mappingId
            $mapping = Mapping::with(['category', 'subcategory'])->find($id);

            if ($mapping) {
                $categories = Category::where('category_status', 'Available')->get();
                $subcategories = Subcategory::where('subcategory_status', 'Available')->get();
                return view('admin.mapping.view', compact('mapping', 'categories', 'subcategories'));
            }

            // 如果既不是 category 也不是 mapping，返回 404
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
     * 显示映射编辑表单（用于 Modal）
     * Show mapping edit form (for Modal)
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function showEditForm(Request $request, $id)
    {
        try {
            $mapping = Mapping::with(['category', 'subcategory'])->findOrFail($id);

            // 如果是 AJAX 请求，返回 JSON 数据（用于 Modal）
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Mapping data fetched successfully',
                    'data' => [
                        'id' => $mapping->id,
                        'category_id' => $mapping->category_id,
                        'subcategory_id' => $mapping->subcategory_id,
                        'mapping_status' => $mapping->mapping_status,
                        'category_name' => $mapping->category->category_name ?? '',
                        'subcategory_name' => $mapping->subcategory->subcategory_name ?? ''
                    ]
                ]);
            }

            // 非 AJAX 请求重定向到管理页面
            return redirect()->route('admin.category_mapping.mapping.index');
        } catch (\Exception $e) {
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to load mapping data: ' . $e->getMessage()
                ], 404);
            }
            return redirect()->route('admin.category_mapping.mapping.index')
                ->with('error', 'Mapping not found');
        }
    }

    /**
     * 更新分类映射信息
     * Update category mapping information
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
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
            $rules = array_merge(self::MAPPING_RULES, self::MAPPING_STATUS_RULES);
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

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Mapping update validation failed', [
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
            return $this->handleError($request, 'Failed to update mapping: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 设置映射为可用状态
     * Set mapping to available status
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function setAvailable($id)
    {
        try {
            Log::info('setAvailable called', ['id' => $id, 'is_ajax' => request()->ajax()]);

            $mapping = Mapping::findOrFail($id);
            $mapping->update(['mapping_status' => 'Available']);

            $this->logOperation('set to available', ['mapping_id' => $id]);

            $message = 'Mapping has been set to available status';

            if (request()->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $mapping->fresh()
                ]);
            }

            return redirect()->route('admin.category_mapping.mapping.index')
                ->with('success', $message);

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to set mapping available: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 设置映射为不可用状态
     * Set mapping to unavailable status
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function setUnavailable($id)
    {
        try {
            Log::info('setUnavailable called', ['id' => $id, 'is_ajax' => request()->ajax()]);

            $mapping = Mapping::findOrFail($id);
            $mapping->update(['mapping_status' => 'Unavailable']);

            $this->logOperation('set to unavailable', ['mapping_id' => $id]);

            $message = 'Mapping has been set to unavailable status';

            if (request()->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $mapping->fresh()
                ]);
            }

            return redirect()->route('admin.category_mapping.mapping.index')
                ->with('success', $message);

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to set mapping unavailable: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 删除分类映射
     * Delete category mapping
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
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

    // =============================================================================
    // 私有辅助方法 (Private Helper Methods)
    // =============================================================================

    /**
     * 批量创建映射
     * Store multiple mappings
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    private function storeMultipleMappings(Request $request)
    {
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
                    'mapping_status' => 'Available',
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
    }

    /**
     * 单个创建映射
     * Store single mapping
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    private function storeSingleMapping(Request $request)
    {
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
}
