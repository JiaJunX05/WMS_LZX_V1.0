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
        $request->validate([
            'gender_name' => 'required|string|max:255|unique:genders,gender_name',
            // 'gender_status' => 'required|in:Available,Unavailable', // 移除驗證，默認為 Available
        ]);

        try {
            $genderData = [
                'gender_name' => $request->input('gender_name') ?? $request->input('genderName'),
                'gender_status' => 'Available', // 默認為 Available
            ];

            $gender = Gender::create($genderData);

            Log::info('Gender created successfully (single)', [
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
            Log::error('Gender creation failed (single): ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            if ($request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create gender: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to create gender: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * 批量存储性别（统一入口）
     */
    private function storeMultipleGenders(Request $request)
    {
        // 仅处理批量数组
        $genders = $request->input('genders', []);
        $createdGenders = [];
        $errors = [];

        foreach ($genders as $index => $genderData) {

            // 兼容前端字段命名（camelCase -> snake_case）
            // 前端：genderName / genderStatus
            // 后端期望：gender_name / gender_status
            if (isset($genderData['genderName']) && !isset($genderData['gender_name'])) {
                $genderData['gender_name'] = $genderData['genderName'];
            }
            if (isset($genderData['genderStatus']) && !isset($genderData['gender_status'])) {
                $genderData['gender_status'] = $genderData['genderStatus'];
            }

            $validator = \Validator::make($genderData, [
                'gender_name' => 'required|string|max:255',
                // 'gender_status' => 'required|in:Available,Unavailable', // 移除驗證，默認為 Available
            ]);

            if ($validator->fails()) {
                $errors[] = "Gender " . ($index + 1) . ": " . implode(', ', $validator->errors()->all());
                continue;
            }

            // 检查性别名称是否已存在
            $existingGender = Gender::where('gender_name', $genderData['gender_name'])->first();

            if ($existingGender) {
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
            } catch (\Exception $e) {
                $errors[] = "Gender " . ($index + 1) . ": " . $e->getMessage();
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
            $validatedData = $request->validate([
                'gender_name' => 'required|string|max:255',
                'gender_status' => 'required|in:Available,Unavailable',
            ]);

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

            Log::info('Gender updated successfully', [
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
            Log::error('Gender update failed: ' . $e->getMessage(), [
                'id' => $id,
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            $message = 'Failed to update gender: ' . $e->getMessage();

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
     * 设置性别为可用状态
     */
    public function setAvailable($id)
    {
        try {
            $gender = Gender::findOrFail($id);
            $gender->update(['gender_status' => 'Available']);

            Log::info('Gender set to available', ['gender_id' => $id]);

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
            Log::error('Failed to set gender available: ' . $e->getMessage());

            // 返回 JSON 错误响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to set gender available: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to set gender available: ' . $e->getMessage()]);
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

            Log::info('Gender set to unavailable', ['gender_id' => $id]);

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
            Log::error('Failed to set gender unavailable: ' . $e->getMessage());

            // 返回 JSON 错误响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to set gender unavailable: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to set gender unavailable: ' . $e->getMessage()]);
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

            Log::info('Gender deleted successfully', ['gender_id' => $id]);

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
            Log::error('Gender deletion failed: ' . $e->getMessage());

            // 返回 JSON 错误响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to delete gender: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to delete gender: ' . $e->getMessage()]);
        }
    }
}
