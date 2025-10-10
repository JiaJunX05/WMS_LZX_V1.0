<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\ManagementTool\Gender;

/**
 * 性别管理控制器
 *
 * 功能模块：
 * - 性别列表展示：搜索、筛选、分页
 * - 性别操作：创建、编辑、删除、状态管理
 * - 性别分类管理：男性、女性、儿童、中性
 *
 * @author WMS Team
 * @version 1.0.0
 */
class GenderController extends Controller
{
    // Constants for better maintainability
    private const MAX_BULK_GENDERS = 10;
    private const STATUSES = ['Available', 'Unavailable'];

    // Validation rules
    private const GENDER_RULES = [
        'gender_name' => 'required|string|max:255',
    ];

    /**
     * Normalize gender data from frontend
     */
    private function normalizeGenderData(array $genderData): array
    {
        // Convert camelCase to snake_case
        if (isset($genderData['genderName']) && !isset($genderData['gender_name'])) {
            $genderData['gender_name'] = $genderData['genderName'];
        }
        if (isset($genderData['genderStatus']) && !isset($genderData['gender_status'])) {
            $genderData['gender_status'] = $genderData['genderStatus'];
        }

        return $genderData;
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
        if (strpos($errorMessage, 'Duplicate entry') !== false && strpos($errorMessage, 'genders_gender_name_unique') !== false) {
            return 'Gender name already exists. Please choose a different name.';
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
        Log::info("Gender {$action}", array_merge([
            'timestamp' => now()->toISOString(),
            'ip' => request()->ip(),
        ], $data));
    }
    /**
     * 显示性别列表页面
     */
    public function index(Request $request)
    {
        if ($request->ajax()) {
            try {
                $query = Gender::query();

                // 搜索功能
                if ($request->has('search') && $request->search) {
                    $search = $request->search;
                    $query->where(function($q) use ($search) {
                        $q->where('gender_name', 'like', "%{$search}%");
                    });
                }

                // 状态筛选
                if ($request->has('status_filter') && $request->status_filter) {
                    $query->where('gender_status', $request->status_filter);
                }

                $genders = $query->paginate(10);

                // 為每個 gender 添加 sizes count
                $gendersWithCounts = $genders->items();
                foreach ($gendersWithCounts as $gender) {
                    $gender->sizes_count = $gender->sizeTemplates()->count();
                }

                return response()->json([
                    'success' => true,
                    'data' => $gendersWithCounts,
                    'pagination' => [
                        'current_page' => $genders->currentPage(),
                        'last_page' => $genders->lastPage(),
                        'per_page' => $genders->perPage(),
                        'total' => $genders->total(),
                        'from' => $genders->firstItem(),
                        'to' => $genders->lastItem(),
                    ]
                ]);
            } catch (\Exception $e) {
                Log::error('Gender management error: ' . $e->getMessage());
                return response()->json(['error' => 'Failed to fetch genders'], 500);
            }
        }

        $genders = Gender::paginate(10);
        return view('admin.gender_dashboard', compact('genders'));
    }

    /**
     * 显示创建性别表单
     */
    public function create()
    {
        return view('admin.gender_create');
    }

    /**
     * 存储新性别
     */
    public function store(Request $request)
    {
        // 与 BrandController 的实现保持一致：有数组走批量，否则走单个
        if ($request->has('genders') && is_array($request->input('genders'))) {
            return $this->storeMultipleGenders($request);
        }

        return $this->storeSingleGender($request);
    }

    /**
     * 单个存储性别
     */
    private function storeSingleGender(Request $request)
    {
        // 校验
        $rules = self::GENDER_RULES;
        $rules['gender_name'] .= '|unique:genders,gender_name';

        $request->validate($rules);

        try {
            $genderData = [
                'gender_name' => $request->input('gender_name') ?? $request->input('genderName'),
                'gender_status' => 'Available', // 默認為 Available
            ];

            $gender = Gender::create($genderData);

            $this->logOperation('created (single)', [
                'gender_id' => $gender->id,
                'gender_name' => $genderData['gender_name']
            ]);

            $message = 'Gender created successfully!';

            if ($request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $gender
                ]);
            }

            return redirect()->route('admin.management_tool.gender.index')
                ->with('success', $message);

        } catch (\Exception $e) {
            return $this->handleError($request, 'Failed to create gender: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 批量存储性别（统一入口）
     */
    private function storeMultipleGenders(Request $request)
    {
        // 仅处理批量数组
        $genders = $request->input('genders', []);

        // 限制批量创建数量
        if (count($genders) > self::MAX_BULK_GENDERS) {
            return $this->handleError($request, 'Cannot create more than ' . self::MAX_BULK_GENDERS . ' genders at once');
        }

        $createdGenders = [];
        $errors = [];

        // 预处理：收集所有性别名称进行批量检查
        $genderNamesToCheck = [];
        foreach ($genders as $index => $genderData) {
            $genderData = $this->normalizeGenderData($genderData);
            if (isset($genderData['gender_name'])) {
                $genderNamesToCheck[] = $genderData['gender_name'];
            }
        }

        $existingGenderNames = Gender::whereIn('gender_name', $genderNamesToCheck)
            ->pluck('gender_name')
            ->toArray();

        foreach ($genders as $index => $genderData) {
            $genderData = $this->normalizeGenderData($genderData);

            $validator = \Validator::make($genderData, self::GENDER_RULES);

            if ($validator->fails()) {
                $errors[] = "Gender " . ($index + 1) . ": " . implode(', ', $validator->errors()->all());
                continue;
            }

            // 检查性别名称是否已存在
            if (in_array($genderData['gender_name'], $existingGenderNames)) {
                $errors[] = "Gender " . ($index + 1) . ": Gender name '{$genderData['gender_name']}' already exists";
                continue;
            }

            try {
                $genderRecord = [
                    'gender_name' => $genderData['gender_name'],
                    'gender_status' => 'Available', // 默認為 Available
                ];

                $gender = Gender::create($genderRecord);
                $createdGenders[] = $gender;

                $this->logOperation('created (batch)', [
                    'gender_id' => $gender->id,
                    'gender_name' => $genderData['gender_name']
                ]);
            } catch (\Exception $e) {
                $simplifiedError = $this->simplifyErrorMessage($e->getMessage());
                $errorMessage = $simplifiedError ?: $e->getMessage();
                $errors[] = "Gender " . ($index + 1) . ": " . $errorMessage;
            }
        }

        if ($request->ajax()) {
            if (count($errors) > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some genders failed to create',
                    'errors' => $errors,
                    'created_count' => count($createdGenders)
                ], 422);
            } else {
                return response()->json([
                    'success' => true,
                    'message' => count($createdGenders) . ' genders created successfully',
                    'data' => $createdGenders
                ]);
            }
        }

        if (count($errors) > 0) {
            return back()->withErrors(['error' => implode('; ', $errors)])
                ->withInput();
        }

        return redirect()->route('admin.management_tool.gender.index')
            ->with('success', count($createdGenders) . ' genders created successfully');
    }

    /**
     * 显示编辑性别表单
     */
    public function edit($id)
    {
        $gender = Gender::findOrFail($id);
        return view('admin.gender_update', compact('gender'));
    }

    /**
     * 更新性别信息
     */
    public function update(Request $request, $id)
    {
        try {
            $gender = Gender::findOrFail($id);

            Log::info('Update request received', [
                'id' => $id,
                'request_data' => $request->all(),
                'is_ajax' => request()->ajax()
            ]);

            // 验证请求数据
            $rules = self::GENDER_RULES;
            $rules['gender_status'] = 'required|in:' . implode(',', self::STATUSES);

            $validatedData = $request->validate($rules);

            // 检查性别名称是否已存在（排除当前记录）
            $existingGender = Gender::where('gender_name', $validatedData['gender_name'])
                ->where('id', '!=', $id)
                ->first();

            if ($existingGender) {
                $message = "Gender name '{$validatedData['gender_name']}' already exists";

                if ($request->ajax()) {
                    return response()->json([
                        'success' => false,
                        'message' => $message,
                        'errors' => [
                            'gender_name' => [$message]
                        ]
                    ], 422);
                }

                return back()->withErrors(['gender_name' => $message])->withInput();
            }

            // 更新性别记录
            $gender->update([
                'gender_name' => $validatedData['gender_name'],
                'gender_status' => $validatedData['gender_status'],
            ]);

            $this->logOperation('updated', [
                'gender_id' => $id,
                'gender_name' => $validatedData['gender_name'],
                'gender_status' => $validatedData['gender_status']
            ]);

            $message = 'Gender updated successfully';

            if ($request->ajax()) {
                $freshGender = $gender->fresh();
                Log::info('AJAX response data', [
                    'success' => true,
                    'message' => $message,
                    'data' => $freshGender
                ]);

                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $freshGender
                ]);
            }

            return redirect()->route('admin.management_tool.gender.index')
                ->with('success', $message);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Gender update validation failed', [
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
            return $this->handleError($request, 'Failed to update gender: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 设置性别为可用状态
     */
    public function setAvailable($id)
    {
        try {
            $gender = Gender::findOrFail($id);
            $gender->update(['gender_status' => 'Available']);

            $this->logOperation('set to available', ['gender_id' => $id]);

            // 返回 JSON 响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Gender has been set to available status',
                    'data' => $gender
                ]);
            }

            return redirect()->route('admin.management_tool.gender.index')
                ->with('success', 'Gender has been set to available status');

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to set gender available: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 设置性别为不可用状态
     */
    public function setUnavailable($id)
    {
        try {
            $gender = Gender::findOrFail($id);
            $gender->update(['gender_status' => 'Unavailable']);

            $this->logOperation('set to unavailable', ['gender_id' => $id]);

            // 返回 JSON 响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Gender has been set to unavailable status',
                    'data' => $gender
                ]);
            }

            return redirect()->route('admin.management_tool.gender.index')
                ->with('success', 'Gender has been set to unavailable status');

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to set gender unavailable: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 删除性别
     */
    public function destroy($id)
    {
        try {
            $gender = Gender::findOrFail($id);
            $gender->delete();

            $this->logOperation('deleted', ['gender_id' => $id]);

            // 返回 JSON 响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Gender deleted successfully!',
                    'data' => [
                        'id' => $id,
                        'name' => $gender->gender_name
                    ]
                ]);
            }

            return redirect()->route('admin.management_tool.gender.index')
                ->with('success', 'Gender deleted successfully!');

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to delete gender: ' . $e->getMessage(), $e);
        }
    }
}
