<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\CategoryMapping\Subcategory;

/**
 * 子分类管理控制器
 */
class SubcategoryController extends Controller
{
    // Constants for better maintainability
    private const MAX_BULK_SUBCATEGORIES = 10;
    private const STATUSES = ['Available', 'Unavailable'];

    // Validation rules
    private const SUBCATEGORY_RULES = [
        'subcategory_name' => 'required|string|max:255',
    ];

    private const SUBCATEGORY_IMAGE_RULES = [
        'subcategory_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
    ];

    /**
     * Normalize subcategory data from frontend
     */
    private function normalizeSubcategoryData(array $subcategoryData): array
    {
        // Convert camelCase to snake_case
        if (isset($subcategoryData['subcategoryName']) && !isset($subcategoryData['subcategory_name'])) {
            $subcategoryData['subcategory_name'] = $subcategoryData['subcategoryName'];
        }
        if (isset($subcategoryData['subcategoryStatus']) && !isset($subcategoryData['subcategory_status'])) {
            $subcategoryData['subcategory_status'] = $subcategoryData['subcategoryStatus'];
        }

        return $subcategoryData;
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
        if (strpos($errorMessage, 'Duplicate entry') !== false && strpos($errorMessage, 'subcategories_subcategory_name_unique') !== false) {
            return 'Subcategory name already exists. Please choose a different name.';
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
        Log::info("Subcategory {$action}", array_merge([
            'timestamp' => now()->toISOString(),
            'ip' => request()->ip(),
        ], $data));
    }
    public function index(Request $request)
    {
        if ($request->ajax()) {
            try {
                $query = Subcategory::query();

                if ($request->has('search') && $request->search) {
                    $search = $request->search;
                    $query->where(function($q) use ($search) {
                        $q->where('subcategory_name', 'like', "%{$search}%");
                    });
                }

                if ($request->has('status_filter') && $request->status_filter) {
                    $query->where('subcategory_status', $request->status_filter);
                }

                $subcategories = $query->paginate(10);

                return response()->json([
                    'success' => true,
                    'data' => $subcategories->items(),
                    'pagination' => [
                        'current_page' => $subcategories->currentPage(),
                        'last_page' => $subcategories->lastPage(),
                        'per_page' => $subcategories->perPage(),
                        'total' => $subcategories->total(),
                        'from' => $subcategories->firstItem(),
                        'to' => $subcategories->lastItem(),
                    ]
                ]);
            } catch (\Exception $e) {
                Log::error('Subcategory management error: ' . $e->getMessage());
                return response()->json(['error' => 'Failed to fetch subcategories'], 500);
            }
        }

        $subcategories = Subcategory::paginate(10);
        return view('admin.subcategory_dashboard', compact('subcategories'));
    }

    public function create()
    {
        return view('admin.subcategory_create');
    }

    public function store(Request $request)
    {
        // 与 CategoryController 的实现保持一致：有数组走批量，否则走单个
        if ($request->has('subcategories') && is_array($request->input('subcategories'))) {
            return $this->storeMultipleSubcategories($request);
        }

        return $this->storeSingleSubcategory($request);
    }

    /**
     * 单个存储子分类
     */
    private function storeSingleSubcategory(Request $request)
    {
        // 校验
        $rules = array_merge(self::SUBCATEGORY_RULES, self::SUBCATEGORY_IMAGE_RULES);
        $rules['subcategory_name'] .= '|unique:subcategories,subcategory_name';

        $request->validate($rules);

        try {
            $subcategoryData = [
                'subcategory_name' => $request->input('subcategory_name') ?? $request->input('subcategoryName'),
                'subcategory_status' => 'Available', // 默認為 Available
            ];

            // 处理文件上传
            if ($request->hasFile('subcategory_image')) {
                // 文件上传（确保目录存在）
                $image = $request->file('subcategory_image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $directory = public_path('assets/images/subcategories');
                if (!file_exists($directory)) {
                    mkdir($directory, 0777, true);
                }
                $image->move($directory, $imageName);
                $subcategoryData['subcategory_image'] = 'subcategories/' . $imageName;
            }

            $subcategory = Subcategory::create($subcategoryData);

            $this->logOperation('created (single)', [
                'subcategory_id' => $subcategory->id,
                'subcategory_name' => $subcategoryData['subcategory_name']
            ]);

            $message = 'Subcategory created successfully!';

            if ($request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $subcategory
                ]);
            }

            return redirect()->route('admin.category_mapping.subcategory.index')
                ->with('success', $message);

        } catch (\Exception $e) {
            return $this->handleError($request, 'Failed to create subcategory: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 批量存储子分类（统一入口）
     */
    private function storeMultipleSubcategories(Request $request)
    {
        // 仅处理批量数组
        $subcategories = $request->input('subcategories', []);

        // 限制批量创建数量
        if (count($subcategories) > self::MAX_BULK_SUBCATEGORIES) {
            return $this->handleError($request, 'Cannot create more than ' . self::MAX_BULK_SUBCATEGORIES . ' subcategories at once');
        }

        $createdSubcategories = [];
        $errors = [];

        // 预处理：收集所有子分类名称进行批量检查
        $subcategoryNamesToCheck = [];
        foreach ($subcategories as $index => $subcategoryData) {
            $subcategoryData = $this->normalizeSubcategoryData($subcategoryData);
            if (isset($subcategoryData['subcategory_name'])) {
                $subcategoryNamesToCheck[] = $subcategoryData['subcategory_name'];
            }
        }

        $existingSubcategoryNames = Subcategory::whereIn('subcategory_name', $subcategoryNamesToCheck)->pluck('subcategory_name')->toArray();

        foreach ($subcategories as $index => $subcategoryData) {
            $subcategoryData = $this->normalizeSubcategoryData($subcategoryData);

            $validator = \Validator::make($subcategoryData, self::SUBCATEGORY_RULES);

            if ($validator->fails()) {
                $errors[] = "Subcategory " . ($index + 1) . ": " . implode(', ', $validator->errors()->all());
                continue;
            }

            // 检查子分类名称是否已存在
            if (in_array($subcategoryData['subcategory_name'], $existingSubcategoryNames)) {
                $errors[] = "Subcategory " . ($index + 1) . ": Subcategory name '{$subcategoryData['subcategory_name']}' already exists";
                continue;
            }

            try {
                $subcategoryRecord = [
                    'subcategory_name' => $subcategoryData['subcategory_name'],
                    'subcategory_status' => 'Available', // 默認為 Available
                ];

                // 处理图片上传 - 使用文件数组
                $files = $request->file('images');
                if (is_array($files) && isset($files[$index]) && $files[$index] && $files[$index]->isValid()) {
                    $image = $files[$index];
                    $directory = public_path('assets/images/subcategories');
                    if (!file_exists($directory)) {
                        mkdir($directory, 0777, true);
                    }
                    $imageName = time() . '_' . $index . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                    $image->move($directory, $imageName);
                    $subcategoryRecord['subcategory_image'] = 'subcategories/' . $imageName;
                }

                $subcategory = Subcategory::create($subcategoryRecord);
                $createdSubcategories[] = $subcategory;

                $this->logOperation('created (batch)', [
                    'subcategory_id' => $subcategory->id,
                    'subcategory_name' => $subcategoryData['subcategory_name']
                ]);
            } catch (\Exception $e) {
                $simplifiedError = $this->simplifyErrorMessage($e->getMessage());
                $errorMessage = $simplifiedError ?: $e->getMessage();
                $errors[] = "Subcategory " . ($index + 1) . ": " . $errorMessage;
            }
        }

        if ($request->ajax()) {
            if (count($errors) > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some subcategories failed to create',
                    'errors' => $errors,
                    'created_count' => count($createdSubcategories)
                ], 422);
            } else {
                return response()->json([
                    'success' => true,
                    'message' => count($createdSubcategories) . ' subcategories created successfully',
                    'data' => $createdSubcategories
                ]);
            }
        }

        if (count($errors) > 0) {
            return back()->withErrors(['error' => implode('; ', $errors)])
                ->withInput();
        }

        return redirect()->route('admin.category_mapping.subcategory.index')
            ->with('success', count($createdSubcategories) . ' subcategories created successfully');
    }

    public function edit($id)
    {
        $subcategory = Subcategory::findOrFail($id);
        return view('admin.subcategory_update', compact('subcategory'));
    }

    public function update(Request $request, $id)
    {
        try {
            $subcategory = Subcategory::findOrFail($id);

            Log::info('Update request received', [
                'id' => $id,
                'request_data' => $request->all(),
                'is_ajax' => request()->ajax()
            ]);

            // 验证请求数据
            $rules = array_merge(self::SUBCATEGORY_RULES, self::SUBCATEGORY_IMAGE_RULES);
            $rules['subcategory_status'] = 'required|in:' . implode(',', self::STATUSES);

            $validatedData = $request->validate($rules);

            // 检查子分类名称是否已存在（排除当前记录）
            $existingSubcategory = Subcategory::where('subcategory_name', $validatedData['subcategory_name'])
                ->where('id', '!=', $id)
                ->first();

            if ($existingSubcategory) {
                $message = "Subcategory name '{$validatedData['subcategory_name']}' already exists";

                if ($request->ajax()) {
                    return response()->json([
                        'success' => false,
                        'message' => $message,
                        'errors' => [
                            'subcategory_name' => [$message]
                        ]
                    ], 422);
                }

                return back()->withErrors(['subcategory_name' => $message])->withInput();
            }

            // 更新子分类记录
            $subcategoryData = [
                'subcategory_name' => $validatedData['subcategory_name'],
                'subcategory_status' => $validatedData['subcategory_status'],
            ];

            if ($request->hasFile('subcategory_image')) {
                if ($subcategory->subcategory_image && file_exists(public_path('assets/images/' . $subcategory->subcategory_image))) {
                    unlink(public_path('assets/images/' . $subcategory->subcategory_image));
                }

                $image = $request->file('subcategory_image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $image->move(public_path('assets/images/subcategories'), $imageName);
                $subcategoryData['subcategory_image'] = 'subcategories/' . $imageName;
            }

            $subcategory->update($subcategoryData);

            $this->logOperation('updated', [
                'subcategory_id' => $id,
                'subcategory_name' => $validatedData['subcategory_name'],
                'subcategory_status' => $validatedData['subcategory_status']
            ]);

            $message = 'Subcategory updated successfully';

            if ($request->ajax()) {
                $freshSubcategory = $subcategory->fresh();
                Log::info('AJAX response data', [
                    'success' => true,
                    'message' => $message,
                    'data' => $freshSubcategory
                ]);

                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $freshSubcategory
                ]);
            }

            return redirect()->route('admin.category_mapping.subcategory.index')
                ->with('success', $message);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Subcategory update validation failed', [
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
            return $this->handleError($request, 'Failed to update subcategory: ' . $e->getMessage(), $e);
        }
    }

    public function setAvailable($id)
    {
        try {
            $subcategory = Subcategory::findOrFail($id);
            $subcategory->update(['subcategory_status' => 'Available']);

            $this->logOperation('set to available', ['subcategory_id' => $id]);

            // 返回 JSON 响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Subcategory has been set to available status',
                    'data' => $subcategory
                ]);
            }

            return redirect()->route('admin.category_mapping.subcategory.index')
                ->with('success', 'Subcategory has been set to available status');

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to set subcategory available: ' . $e->getMessage(), $e);
        }
    }

    public function setUnavailable($id)
    {
        try {
            $subcategory = Subcategory::findOrFail($id);
            $subcategory->update(['subcategory_status' => 'Unavailable']);

            $this->logOperation('set to unavailable', ['subcategory_id' => $id]);

            // 返回 JSON 响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Subcategory has been set to unavailable status',
                    'data' => $subcategory
                ]);
            }

            return redirect()->route('admin.category_mapping.subcategory.index')
                ->with('success', 'Subcategory has been set to unavailable status');

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to set subcategory unavailable: ' . $e->getMessage(), $e);
        }
    }

    public function destroy($id)
    {
        try {
            $subcategory = Subcategory::findOrFail($id);

            if ($subcategory->subcategory_image && file_exists(public_path('assets/images/' . $subcategory->subcategory_image))) {
                unlink(public_path('assets/images/' . $subcategory->subcategory_image));
            }

            $subcategory->delete();

            $this->logOperation('deleted', ['subcategory_id' => $id]);

            // 返回 JSON 响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Subcategory deleted successfully!',
                    'data' => [
                        'id' => $id,
                        'name' => $subcategory->subcategory_name
                    ]
                ]);
            }

            return redirect()->route('admin.category_mapping.subcategory.index')
                ->with('success', 'Subcategory deleted successfully!');

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to delete subcategory: ' . $e->getMessage(), $e);
        }
    }
}
