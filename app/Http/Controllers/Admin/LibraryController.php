<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\SizeLibrary;
use App\Models\Category;
use Illuminate\Validation\ValidationException;

/**
 * 尺码库管理控制器
 * Size Library Management Controller
 *
 * 功能模块：
 * - 尺码库列表展示：搜索、筛选、分页
 * - 尺码库操作：创建、编辑、删除、状态管理
 * - 批量创建：支持批量创建尺码库
 * - 尺码值管理：按类别组织尺码值
 *
 * @author WMS Team
 * @version 3.0.0
 */
class LibraryController extends Controller
{
    // =============================================================================
    // 常量定义 (Constants)
    // =============================================================================

    /**
     * 批量创建最大数量
     */
    private const MAX_BULK_LIBRARIES = 100; // 增加到 100，如果需要移除限制可以设置为 PHP_INT_MAX

    /**
     * 状态常量
     */
    private const STATUSES = ['Available', 'Unavailable'];

    /**
     * 尺码库验证规则
     */
    private const LIBRARY_RULES = [
        'category_id' => 'required|exists:categories,id',
        'size_value' => 'required|string|max:20',
    ];

    /**
     * 尺码库状态验证规则
     */
    private const LIBRARY_STATUS_RULES = [
        'size_status' => 'required|in:Available,Unavailable',
    ];

    // =============================================================================
    // 私有辅助方法 (Private Helper Methods)
    // =============================================================================

    /**
     * 标准化尺码库数据
     * Normalize library data from frontend
     *
     * @param array $libraryData
     * @return array
     */
    private function normalizeLibraryData(array $libraryData): array
    {
        // Convert camelCase to snake_case
        if (isset($libraryData['categoryId']) && !isset($libraryData['category_id'])) {
            $libraryData['category_id'] = $libraryData['categoryId'];
        }
        if (isset($libraryData['sizeValue']) && !isset($libraryData['size_value'])) {
            $libraryData['size_value'] = $libraryData['sizeValue'];
        }
        if (isset($libraryData['sizeStatus']) && !isset($libraryData['size_status'])) {
            $libraryData['size_status'] = $libraryData['sizeStatus'];
        }

        return $libraryData;
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
        if (strpos($errorMessage, 'Duplicate entry') !== false && strpos($errorMessage, 'size_libraries_category_id_size_value_unique') !== false) {
            return 'Size value already exists for this category. Please choose a different value.';
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
        Log::info("SizeLibrary {$action}", array_merge([
            'timestamp' => now()->toISOString(),
            'ip' => request()->ip(),
        ], $data));
    }

    // =============================================================================
    // 公共方法 (Public Methods)
    // =============================================================================

    /**
     * 显示尺码库列表页面
     * Display size library list page
     *
     * @param Request $request
     * @return \Illuminate\View\View|\Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        if ($request->ajax()) {
            return $this->getLibrariesData();
        }

        $sizeLibraries = SizeLibrary::with('category')
            ->orderBy('size_value', 'asc')
            ->get();
        $categories = Category::where('category_status', 'Available')->get();

        Log::info('Library Dashboard loaded', [
            'size_libraries_count' => $sizeLibraries->count(),
            'categories_count' => $categories->count(),
            'is_ajax' => $request->ajax()
        ]);

        return view('admin.library.dashboard', compact('sizeLibraries', 'categories'));
    }

    /**
     * 获取创建尺码库数据（现在通过 modal，只返回 JSON）
     * Get create size library data (now through modal, returns JSON only)
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function create()
    {
        $categories = Category::where('category_status', 'Available')->get();

        return response()->json([
            'success' => true,
            'categories' => $categories
        ]);
    }

    /**
     * 存储新尺码库
     * Store new size library
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        // 检查是否是批量创建
        if ($request->has('libraries') && is_array($request->libraries)) {
            return $this->storeMultipleLibraries($request);
        }

        return $this->storeSingleLibrary($request);
    }

    /**
     * 显示尺码库详情
     * Show size library details
     *
     * 支持两种模式：
     * 1. 传入 category_id 格式 - 显示该类别下的所有 size libraries
     * 2. 传入 size_library_id - 显示单个 size library
     *
     * @param int|string $id
     * @return \Illuminate\View\View
     */
    public function view($id)
    {
        try {
            // 检查是否是 categoryId（数字格式）
            if (is_numeric($id)) {
                return $this->viewLibraryGroup($id);
            }

            // 如果不是数字格式，尝试作为单个 library ID 处理
            return $this->viewSingleLibrary($id);
        } catch (\Exception $e) {
            Log::error('Failed to load view form: ' . $e->getMessage(), [
                'id' => $id,
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('admin.size_library.library.index')
                ->with('error', 'Failed to load view form');
        }
    }

    /**
     * 显示编辑尺码库表单
     * Show edit size library form
     *
     * @param int $id
     * @return \Illuminate\View\View
     */
    public function edit($id)
    {
        try {
            // 首先检查是否是 categoryId（通过检查是否存在对应的 sizeLibrary）
            $category = Category::find($id);
            if ($category) {
                // 获取该类别下的所有尺码库，按 size_value 排序
                $sizeLibraries = SizeLibrary::where('category_id', $id)
                    ->with('category')
                    ->orderBy('size_value', 'asc')
                    ->get();
                $categories = Category::where('category_status', 'Available')->get();

                return view('admin.library.update', compact('sizeLibraries', 'categories', 'category'));
            }

            // 如果不是 categoryId，检查是否是 sizeLibraryId
            $sizeLibrary = SizeLibrary::with('category')->find($id);
            if ($sizeLibrary) {
                $categories = Category::where('category_status', 'Available')->get();
                return view('admin.library.update', compact('sizeLibrary', 'categories'));
            }

            // 如果既不是 categoryId 也不是 sizeLibraryId，返回 404
            abort(404, 'Size library or category not found');

        } catch (\Exception $e) {
            Log::error('Failed to load edit form: ' . $e->getMessage(), [
                'id' => $id,
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('admin.size_library.library.index')
                ->with('error', 'Failed to load edit form');
        }
    }

    /**
     * 显示尺码库编辑表单（用于 Modal）
     * Show size library edit form (for Modal)
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function showEditForm(Request $request, $id)
    {
        try {
            $library = SizeLibrary::with('category')->findOrFail($id);

            // 如果是 AJAX 请求，返回 JSON 数据（用于 Modal）
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Size library data fetched successfully',
                    'data' => [
                        'id' => $library->id,
                        'category_id' => $library->category_id,
                        'size_value' => $library->size_value,
                        'size_status' => $library->size_status,
                        'category_name' => $library->category->category_name ?? ''
                    ]
                ]);
            }

            // 非 AJAX 请求重定向到管理页面
            return redirect()->route('admin.size_library.library.index');
        } catch (\Exception $e) {
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to load size library data: ' . $e->getMessage()
                ], 404);
            }
            return redirect()->route('admin.size_library.library.index')
                ->with('error', 'Size library not found');
        }
    }

    /**
     * 更新尺码库信息
     * Update size library information
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        try {
            $sizeLibrary = SizeLibrary::findOrFail($id);

            Log::info('Update request received', [
                'id' => $id,
                'request_data' => $request->all(),
                'is_ajax' => request()->ajax()
            ]);

            // 验证请求数据
            $rules = array_merge(self::LIBRARY_RULES, self::LIBRARY_STATUS_RULES);
            $validatedData = $request->validate($rules);

            // 检查同一类别下尺码值是否已存在（排除当前记录）
            $existingSize = SizeLibrary::where('category_id', $validatedData['category_id'])
                ->where('size_value', $validatedData['size_value'])
                ->where('id', '!=', $id)
                ->first();

            if ($existingSize) {
                $message = "This size value already exists for the selected category";

                if ($request->ajax()) {
                    return response()->json([
                        'success' => false,
                        'message' => $message,
                        'errors' => [
                            'size_value' => [$message]
                        ]
                    ], 422);
                }

                return back()->withErrors(['size_value' => $message])->withInput();
            }

            // 更新尺码库记录
            $sizeLibrary->update([
                'category_id' => $validatedData['category_id'],
                'size_value' => $validatedData['size_value'],
                'size_status' => $validatedData['size_status'],
            ]);

            $this->logOperation('updated', [
                'size_library_id' => $id,
                'category_id' => $validatedData['category_id'],
                'size_value' => $validatedData['size_value']
            ]);

            $message = 'Size library updated successfully';

            if ($request->ajax()) {
                $freshLibrary = $sizeLibrary->fresh(['category']);

                Log::info('AJAX response data', [
                    'success' => true,
                    'message' => $message,
                    'data' => $freshLibrary
                ]);

                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $freshLibrary
                ]);
            }

            return redirect()->route('admin.size_library.library.index')
                ->with('success', $message);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('SizeLibrary update validation failed', [
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
            return $this->handleError($request, 'Failed to update size library: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 设置尺码库为可用状态
     * Set size library to available status
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function setAvailable($id)
    {
        try {
            Log::info('setAvailable called', ['id' => $id, 'is_ajax' => request()->ajax()]);

            $sizeLibrary = SizeLibrary::findOrFail($id);
            $sizeLibrary->update(['size_status' => 'Available']);

            $this->logOperation('set to available', ['size_library_id' => $id]);

            $message = 'Size library has been set to available status';

            if (request()->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $sizeLibrary->fresh()
                ]);
            }

            return redirect()->route('admin.size_library.library.index')
                ->with('success', $message);

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to set size library available: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 设置尺码库为不可用状态
     * Set size library to unavailable status
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function setUnavailable($id)
    {
        try {
            Log::info('setUnavailable called', ['id' => $id, 'is_ajax' => request()->ajax()]);

            $sizeLibrary = SizeLibrary::findOrFail($id);
            $sizeLibrary->update(['size_status' => 'Unavailable']);

            $this->logOperation('set to unavailable', ['size_library_id' => $id]);

            $message = 'Size library has been set to unavailable status';

            if (request()->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $sizeLibrary->fresh()
                ]);
            }

            return redirect()->route('admin.size_library.library.index')
                ->with('success', $message);

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to set size library unavailable: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 删除尺码库
     * Delete size library
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        try {
            $sizeLibrary = SizeLibrary::findOrFail($id);
            $sizeLibrary->delete();

            $this->logOperation('deleted', ['size_library_id' => $id]);

            if (request()->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Size library deleted successfully!'
                ]);
            }

            return redirect()->route('admin.size_library.library.index')
                ->with('success', 'Size library deleted successfully!');

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to delete size library: ' . $e->getMessage(), $e);
        }
    }

    // =============================================================================
    // 私有辅助方法 (Private Helper Methods)
    // =============================================================================

    /**
     * 获取尺码库数据（AJAX）
     * Get libraries data for AJAX requests
     *
     * @return \Illuminate\Http\JsonResponse
     */
    private function getLibrariesData()
    {
        try {
            $sizeLibraries = SizeLibrary::with('category')
                ->orderBy('size_value', 'asc')
                ->get();

            // 按 category 分组
            $groupedLibraries = $sizeLibraries->groupBy('category_id')->map(function ($libraries, $categoryId) {
                $firstLibrary = $libraries->first();
                return [
                    'group_key' => $categoryId,
                    'category' => $firstLibrary->category,
                    'libraries' => $libraries->values()->toArray()
                ];
            })->values();

            Log::info('getLibrariesData called', [
                'total_libraries' => $sizeLibraries->count(),
                'grouped_count' => $groupedLibraries->count(),
            ]);

            return response()->json([
                'success' => true,
                'data' => $groupedLibraries,
                'total_libraries' => $sizeLibraries->count(),
                'total_groups' => $groupedLibraries->count(),
                'pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => $sizeLibraries->count(),
                    'total' => $sizeLibraries->count(),
                    'from' => 1,
                    'to' => $sizeLibraries->count(),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('SizeLibrary management error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch size libraries: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * 批量创建尺码库
     * Store multiple libraries
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    private function storeMultipleLibraries(Request $request)
    {
        $libraries = $request->libraries;

        // 限制批量创建数量
        if (count($libraries) > self::MAX_BULK_LIBRARIES) {
            return $this->handleError($request, 'Cannot create more than ' . self::MAX_BULK_LIBRARIES . ' libraries at once');
        }

        $createdLibraries = [];
        $errors = [];

        // 预处理：收集所有尺码组合进行批量检查
        $combinationsToCheck = [];
        foreach ($libraries as $index => $libraryData) {
            $libraryData = $this->normalizeLibraryData($libraryData);
            if (isset($libraryData['category_id']) && isset($libraryData['size_value'])) {
                $combinationsToCheck[] = [
                    'category_id' => $libraryData['category_id'],
                    'size_value' => $libraryData['size_value']
                ];
            }
        }

        $existingCombinations = SizeLibrary::where(function($query) use ($combinationsToCheck) {
            foreach ($combinationsToCheck as $combination) {
                $query->orWhere(function($q) use ($combination) {
                    $q->where('category_id', $combination['category_id'])
                      ->where('size_value', $combination['size_value']);
                });
            }
        })->get(['category_id', 'size_value'])->map(function($item) {
            return $item->category_id . '_' . $item->size_value;
        })->toArray();

        foreach ($libraries as $index => $libraryData) {
            $libraryData = $this->normalizeLibraryData($libraryData);

            $validator = \Validator::make($libraryData, self::LIBRARY_RULES);

            if ($validator->fails()) {
                $errors[] = "Library " . ($index + 1) . ": " . implode(', ', $validator->errors()->all());
                continue;
            }

            // 检查尺码组合是否已存在
            $combinationKey = $libraryData['category_id'] . '_' . $libraryData['size_value'];
            if (in_array($combinationKey, $existingCombinations)) {
                $errors[] = "Library " . ($index + 1) . ": This size value already exists for the selected category";
                continue;
            }

            try {
                $library = SizeLibrary::create([
                    'category_id' => $libraryData['category_id'],
                    'size_value' => $libraryData['size_value'],
                    'size_status' => 'Available',
                ]);
                $createdLibraries[] = $library;

                $this->logOperation('created (batch)', [
                    'library_id' => $library->id,
                    'category_id' => $libraryData['category_id'],
                    'size_value' => $libraryData['size_value']
                ]);
            } catch (\Exception $e) {
                $simplifiedError = $this->simplifyErrorMessage($e->getMessage());
                $errorMessage = $simplifiedError ?: $e->getMessage();
                $errors[] = "Library " . ($index + 1) . ": " . $errorMessage;
            }
        }

        if ($request->ajax()) {
            if (count($errors) > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some libraries failed to create',
                    'errors' => $errors,
                    'created_count' => count($createdLibraries)
                ], 422);
            } else {
                return response()->json([
                    'success' => true,
                    'message' => count($createdLibraries) . ' libraries created successfully',
                    'data' => $createdLibraries
                ]);
            }
        }

        if (count($errors) > 0) {
            return back()->withErrors(['error' => implode('; ', $errors)])
                ->withInput();
        }

        return redirect()->route('admin.size_library.library.index')
            ->with('success', count($createdLibraries) . ' libraries created successfully');
    }

    /**
     * 单个创建尺码库
     * Store single library
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    private function storeSingleLibrary(Request $request)
    {
        try {
            // 支持两种格式：单个 size_value 或 size_values 数组
            $categoryId = $request->input('category_id');
            $sizeValue = $request->input('size_value');
            $sizeValues = $request->input('size_values', []);

            // 如果提供了单个 size_value，转换为数组
            if ($sizeValue && empty($sizeValues)) {
                $sizeValues = [$sizeValue];
            }

            // 验证请求数据
            $rules = [
                'category_id' => 'required|exists:categories,id',
                'size_values' => 'required|array|min:1',
                'size_values.*' => 'required|string|max:20',
            ];

            // 创建验证数据数组
            $validationData = [
                'category_id' => $categoryId,
                'size_values' => $sizeValues
            ];

            $validatedData = \Validator::make($validationData, $rules)->validate();

            $categoryId = $validatedData['category_id'];
            $sizeValues = $validatedData['size_values'];
            $sizeStatus = 'Available';

            // 检查同一类别下尺码值是否已存在
            $existingSizes = SizeLibrary::where('category_id', $categoryId)
                ->whereIn('size_value', $sizeValues)
                ->pluck('size_value')
                ->toArray();

            if (!empty($existingSizes)) {
                if ($request->ajax()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Some size values already exist for the selected category',
                        'errors' => [
                            'size_values' => ['These size values already exist: ' . implode(', ', $existingSizes)]
                        ]
                    ], 422);
                }

                return back()->withErrors(['size_values' => 'These size values already exist for the selected category: ' . implode(', ', $existingSizes)])
                    ->withInput();
            }

            // 批量创建尺码库记录
            $createdSizes = [];
            foreach ($sizeValues as $sizeValue) {
                $sizeLibrary = SizeLibrary::create([
                    'category_id' => $categoryId,
                    'size_value' => $sizeValue,
                    'size_status' => $sizeStatus,
                ]);
                $createdSizes[] = $sizeLibrary;
            }

            $this->logOperation('created (single)', [
                'category_id' => $categoryId,
                'size_values' => $sizeValues,
                'count' => count($createdSizes)
            ]);

            $count = count($createdSizes);
            $message = "Successfully created {$count} size value(s) in the library!";

            if ($request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $createdSizes
                ]);
            }

            return redirect()->route('admin.size_library.library.index')
                ->with('success', $message);

        } catch (ValidationException $e) {
            Log::warning('SizeLibrary validation failed', [
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
            return $this->handleError($request, 'Failed to create size library: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 查看尺码库组（按类别分组）
     * View library group (by category)
     *
     * @param int $categoryId
     * @return \Illuminate\View\View
     */
    private function viewLibraryGroup($categoryId)
    {
        $category = Category::find($categoryId);

        if ($category) {
            // 获取该类别下的所有尺码库，按 size_value 排序
            $sizeLibraries = SizeLibrary::where('category_id', $categoryId)
                ->with('category')
                ->orderBy('size_value', 'asc')
                ->get();
            $categories = Category::where('category_status', 'Available')->get();

            return view('admin.library.view', compact('sizeLibraries', 'categories', 'category'));
        }

        throw new \Exception('Invalid category ID');
    }

    /**
     * 查看单个尺码库
     * View single library
     *
     * @param int|string $id
     * @return \Illuminate\View\View
     */
    private function viewSingleLibrary($id)
    {
        $sizeLibrary = SizeLibrary::with('category')->findOrFail($id);
        $categories = Category::where('category_status', 'Available')->get();

        return view('admin.library.view', compact('sizeLibrary', 'categories'));
    }
}
