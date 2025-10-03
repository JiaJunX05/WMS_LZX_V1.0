<?php

namespace App\Http\Controllers\Admin\SizeLibrary;

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
            ->paginate(100);
        $categories = Category::where('category_status', 'Available')->get();
        return view('admin.sizes.library.dashboard', compact('sizeLibraries', 'categories'));
    }

    /**
     * 显示创建尺码库表单
     */
    public function create()
    {
        try {
            $categories = Category::where('category_status', 'Available')->get();
            return view('admin.sizes.library.create', compact('categories'));
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

                return view('admin.sizes.library.update', compact('sizeLibraries', 'categories', 'category'));
            }

            // 如果不是categoryId，检查是否是sizeLibraryId
            $sizeLibrary = SizeLibrary::with('category')->find($id);
            if ($sizeLibrary) {
                $categories = Category::where('category_status', 'Available')->get();
                return view('admin.sizes.library.update', compact('sizeLibrary', 'categories'));
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
            $validatedData = $request->validate([
                'category_id' => 'required|exists:categories,id',
                'size_value' => 'required|string|max:20',
                'size_status' => 'required|in:Available,Unavailable',
            ]);

            // 检查同一类别下尺码值是否已存在（排除当前记录）
            $existingSize = SizeLibrary::where('category_id', $validatedData['category_id'])
                ->where('size_value', $validatedData['size_value'])
                ->where('id', '!=', $id)
                ->first();

            if ($existingSize) {
                return $this->handleDuplicateLibrary($request, 'This size value already exists for the selected category');
            }

            // 更新尺码库记录
            $sizeLibrary->update([
                'category_id' => $validatedData['category_id'],
                'size_value' => $validatedData['size_value'],
                'size_status' => $validatedData['size_status'],
            ]);

            Log::info('SizeLibrary updated successfully', [
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

        } catch (ValidationException $e) {
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
            Log::error('SizeLibrary update failed: ' . $e->getMessage(), [
                'id' => $id,
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            $message = 'Failed to update size library: ' . $e->getMessage();

            if ($request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => $message
                ], 500);
            }

            return back()->withErrors(['error' => $message])->withInput();
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

            Log::info('SizeLibrary set to available', ['size_library_id' => $id]);

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
            Log::error('Failed to set size library available: ' . $e->getMessage(), [
                'id' => $id,
                'trace' => $e->getTraceAsString()
            ]);

            $message = 'Failed to set size library available: ' . $e->getMessage();

            if (request()->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => $message
                ], 500);
            }

            return back()->withErrors(['error' => $message]);
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

            Log::info('SizeLibrary set to unavailable', ['size_library_id' => $id]);

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
            Log::error('Failed to set size library unavailable: ' . $e->getMessage(), [
                'id' => $id,
                'trace' => $e->getTraceAsString()
            ]);

            $message = 'Failed to set size library unavailable: ' . $e->getMessage();

            if (request()->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => $message
                ], 500);
            }

            return back()->withErrors(['error' => $message]);
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

            Log::info('SizeLibrary deleted successfully', [
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
            Log::error('SizeLibrary deletion failed: ' . $e->getMessage(), [
                'id' => $id,
                'trace' => $e->getTraceAsString()
            ]);

            $message = 'Failed to delete size library: ' . $e->getMessage();

            if (request()->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => $message
                ], 500);
            }

            return back()->withErrors(['error' => $message]);
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

            return response()->json([
                'success' => true,
                'data' => $groupedLibraries,
                'pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => $groupedLibraries->count(),
                    'total' => $groupedLibraries->count(),
                    'from' => 1,
                    'to' => $groupedLibraries->count(),
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
        $createdLibraries = [];
        $errors = [];

        foreach ($libraries as $index => $libraryData) {
            $validator = \Validator::make($libraryData, [
                'category_id' => 'required|exists:categories,id',
                'size_value' => 'required|string|max:20',
                'size_status' => 'required|in:Available,Unavailable',
            ]);

            if ($validator->fails()) {
                $errors[] = "Library " . ($index + 1) . ": " . implode(', ', $validator->errors()->all());
                continue;
            }

            // 检查尺码值是否已存在
            $existingLibrary = SizeLibrary::where('category_id', $libraryData['category_id'])
                ->where('size_value', $libraryData['size_value'])
                ->first();

            if ($existingLibrary) {
                $errors[] = "Library " . ($index + 1) . ": This size value already exists for the selected category";
                continue;
            }

            try {
                $library = SizeLibrary::create([
                    'category_id' => $libraryData['category_id'],
                    'size_value' => $libraryData['size_value'],
                    'size_status' => $libraryData['size_status'],
                ]);
                $createdLibraries[] = $library;
            } catch (\Exception $e) {
                $errors[] = "Library " . ($index + 1) . ": " . $e->getMessage();
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
            $validatedData = $request->validate([
                'category_id' => 'required|exists:categories,id',
                'size_values' => 'required|array|min:1',
                'size_values.*' => 'required|string|max:20',
                'size_status' => 'required|in:Available,Unavailable',
            ]);

            $categoryId = $validatedData['category_id'];
            $sizeValues = $validatedData['size_values'];
            $sizeStatus = $validatedData['size_status'];

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

            Log::info('SizeLibrary created successfully', [
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
            Log::error('SizeLibrary creation failed: ' . $e->getMessage(), [
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            $message = 'Failed to create size library: ' . $e->getMessage();

            if ($request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => $message
                ], 500);
            }

            return back()->withErrors(['error' => $message])->withInput();
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

            return view('admin.sizes.library.view', compact('sizeLibraries', 'categories', 'category'));
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
        return view('admin.sizes.library.view', compact('sizeLibrary', 'categories'));
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
