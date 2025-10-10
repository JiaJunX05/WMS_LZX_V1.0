<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\SizeLibrary\SizeLibrary;
use App\Models\CategoryMapping\Category;
use Illuminate\Validation\ValidationException;

/**
 * 尺码库管理控制器
 *
 * 功能模块：
 * - 尺码库列表展示：搜索、筛选、分页
 * - 尺码库操作：创建、编辑、删除、状态管理
 * - 尺码值管理：按类别组织尺码值
 *
 * @author WMS Team
 * @version 1.0.0
 */
class LibraryController extends Controller
{
    // Constants for better maintainability
    private const MAX_BULK_LIBRARIES = 10;
    private const STATUSES = ['Available', 'Unavailable'];

    // Validation rules
    private const LIBRARY_RULES = [
        'category_id' => 'required|exists:categories,id',
        'size_value' => 'required|string|max:20',
    ];

    private const LIBRARY_STATUS_RULES = [
        'size_status' => 'required|in:Available,Unavailable',
    ];

    /**
     * Normalize library data from frontend
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
        if (strpos($errorMessage, 'Duplicate entry') !== false && strpos($errorMessage, 'size_libraries_category_id_size_value_unique') !== false) {
            return 'Size value already exists for this category. Please choose a different value.';
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
        Log::info("SizeLibrary {$action}", array_merge([
            'timestamp' => now()->toISOString(),
            'ip' => request()->ip(),
        ], $data));
    }
    /**
     * 显示尺码库列表页面
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

        // 添加調試信息
        Log::info('Library Dashboard loaded', [
            'size_libraries_count' => $sizeLibraries->count(),
            'categories_count' => $categories->count(),
            'is_ajax' => $request->ajax()
        ]);

        return view('admin.library_dashboard', compact('sizeLibraries', 'categories'));
    }

    /**
     * 显示创建尺码库表单
     */
    public function create()
    {
        try {
            $categories = Category::where('category_status', 'Available')->get();
            return view('admin.library_create', compact('categories'));
        } catch (\Exception $e) {
            Log::error('Failed to load create form: ' . $e->getMessage());
            return redirect()->route('admin.size_library.library.index')
                ->with('error', 'Failed to load create form');
        }
    }

    /**
     * 存储新尺码库
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
     * 1. 传入category_id格式 - 显示该类别下的所有size libraries
     * 2. 传入size_library_id - 显示单个size library
     */
    public function view($id)
    {
        try {
            // 检查是否是categoryId（数字格式）
            if (is_numeric($id)) {
                return $this->viewLibraryGroup($id);
            }

            // 如果不是数字格式，尝试作为单个library ID处理
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
     */
    public function edit($id)
    {
        try {
            // 首先检查是否是categoryId（通过检查是否存在对应的sizeLibrary）
            $category = Category::find($id);
            if ($category) {
                // 获取该类别下的所有尺码库，按size_value排序
                $sizeLibraries = SizeLibrary::where('category_id', $id)
                    ->with('category')
                    ->orderBy('size_value', 'asc')
                    ->get();
                $categories = Category::where('category_status', 'Available')->get();

                return view('admin.library_update', compact('sizeLibraries', 'categories', 'category'));
            }

            // 如果不是categoryId，检查是否是sizeLibraryId
            $sizeLibrary = SizeLibrary::with('category')->find($id);
            if ($sizeLibrary) {
                $categories = Category::where('category_status', 'Available')->get();
                return view('admin.library_update', compact('sizeLibrary', 'categories'));
            }

            // 如果既不是categoryId也不是sizeLibraryId，返回404
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
     * 更新尺码库信息
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
                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $sizeLibrary->fresh()
                ]);
            }

            return redirect()->route('admin.size_library.library.index')
                ->with('success', $message);

        } catch (\Exception $e) {
            return $this->handleError($request, 'Failed to update size library: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 设置尺码库为可用状态
     */
    public function setAvailable(Request $request, $id)
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
     */
    public function setUnavailable(Request $request, $id)
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
     */
    public function destroy($id)
    {
        try {
            Log::info('destroy called', ['id' => $id, 'is_ajax' => request()->ajax()]);

            $sizeLibrary = SizeLibrary::findOrFail($id);
            $deletedData = $sizeLibrary->toArray(); // 保存删除前的数据用于日志
            $sizeLibrary->delete();

            $this->logOperation('deleted', [
                'size_library_id' => $id,
                'deleted_data' => $deletedData
            ]);

            $message = 'Size library deleted successfully';

            if (request()->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $deletedData
                ]);
            }

            return redirect()->route('admin.size_library.library.index')
                ->with('success', $message);

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

            // 添加調試信息
            Log::info('getLibrariesData called', [
                'total_libraries' => $sizeLibraries->count(),
                'grouped_count' => $groupedLibraries->count(),
                'libraries_data' => $sizeLibraries->toArray(),
                'grouped_data' => $groupedLibraries->toArray()
            ]);

            return response()->json([
                'success' => true,
                'data' => $groupedLibraries,
                'total_libraries' => $sizeLibraries->count(), // 添加尺碼庫總數
                'total_groups' => $groupedLibraries->count(), // 添加分組總數
                'pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => $sizeLibraries->count(), // 使用尺碼庫總數
                    'total' => $sizeLibraries->count(), // 使用尺碼庫總數
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
                    'size_status' => 'Available', // 默認為 Available
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
     */
    private function storeSingleLibrary(Request $request)
    {
        try {
            // 验证请求数据
            $rules = [
                'category_id' => 'required|exists:categories,id',
                'size_values' => 'required|array|min:1',
                'size_values.*' => 'required|string|max:20',
            ];

            $validatedData = $request->validate($rules);

            $categoryId = $validatedData['category_id'];
            $sizeValues = $validatedData['size_values'];
            $sizeStatus = 'Available'; // 默認為 Available

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
     */
    private function viewLibraryGroup($categoryId)
    {
        $category = Category::find($categoryId);

        if ($category) {
            // 获取该类别下的所有尺码库，按size_value排序
            $sizeLibraries = SizeLibrary::where('category_id', $categoryId)
                ->with('category')
                ->orderBy('size_value', 'asc')
                ->get();
            $categories = Category::where('category_status', 'Available')->get();

            return view('admin.library_view', compact('sizeLibraries', 'categories', 'category'));
        }

        throw new \Exception('Invalid category ID');
    }

    /**
     * 查看单个尺码库
     * View single library
     */
    private function viewSingleLibrary($id)
    {
        $sizeLibrary = SizeLibrary::with('category')->findOrFail($id);
        $categories = Category::where('category_status', 'Available')->get();
        return view('admin.library_view', compact('sizeLibrary', 'categories'));
    }

    /**
     * 处理重复尺码库错误
     * Handle duplicate library error
     */
    private function handleDuplicateLibrary(Request $request, $message)
    {
        if ($request->ajax()) {
            return response()->json([
                'success' => false,
                'message' => $message,
                'errors' => [
                    'library_combination' => [$message]
                ]
            ], 422);
        }

        return back()->withErrors(['library_combination' => $message])->withInput();
    }
}
