<?php

namespace App\Http\Controllers\Admin\AttributeVariants;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\AttributeVariants\Gender;

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
     * 性别列表页面
     *
     * @param Request $request HTTP请求对象
     * @return \Illuminate\View\View|\Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // 如果是 AJAX 请求，返回 JSON 数据
        if ($request->ajax()) {
            try {
                $query = Gender::query();

                // 搜索条件：性别名称
                if ($request->filled('search')) {
                    $search = $request->input('search');
                    $query->where('gender_name', 'like', "%$search%");
                }

                // 根据性别ID筛选
                if ($request->filled('gender_id')) {
                    $query->where('id', $request->input('gender_id'));
                }

                // 根据性别状态筛选
                if ($request->filled('gender_status')) {
                    $query->where('gender_status', $request->input('gender_status'));
                }

                // 分页设置
                $perPage = $request->input('perPage', 10);
                $genders = $query->paginate($perPage);

                // 返回分页数据
                return response()->json([
                    'data' => $genders->map(function ($gender) {
                        return [
                            'id' => $gender->id,
                            'gender_name' => $gender->gender_name,
                            'gender_code' => $gender->gender_code,
                            'gender_description' => $gender->gender_description,
                            'gender_status' => $gender->gender_status,
                            'sizes_count' => $gender->sizeClothings()->count() + $gender->sizeShoes()->count(),
                        ];
                    }),
                    'pagination' => [
                        'current_page' => $genders->currentPage(),
                        'last_page' => $genders->lastPage(),
                        'total' => $genders->total(),
                        'per_page' => $genders->perPage(),
                        'from' => $genders->firstItem(),
                        'to' => $genders->lastItem(),
                    ],
                ]);
            } catch (\Exception $e) {
                Log::error('Gender management error: ' . $e->getMessage());
                return response()->json(['error' => 'Failed to fetch genders'], 500);
            }
        }

        // 如果不是 AJAX 请求，返回视图
        $genders = Gender::all();
        return view('admin.attribute_variants.gender.dashboard', compact('genders'));
    }

    /**
     * 显示创建性别表单
     *
     * @return \Illuminate\View\View
     */
    public function create()
    {
        return view('admin.attribute_variants.gender.create');
    }

    /**
     * 存储新性别
     *
     * @param Request $request HTTP请求对象
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        try {
            // 验证请求数据
            $request->validate([
                'gender_name' => 'required|string|max:50|unique:genders',
                'gender_code' => 'required|string|max:10|unique:genders',
                'gender_description' => 'nullable|string|max:1000',
                'gender_status' => 'required|in:Available,Unavailable',
            ], [
                'gender_name.required' => 'Gender name is required',
                'gender_name.unique' => 'This gender name already exists',
                'gender_code.required' => 'Gender code is required',
                'gender_code.unique' => 'This gender code already exists',
            ]);

            // 创建性别记录
            $gender = Gender::create([
                'gender_name' => $request->gender_name,
                'gender_code' => $request->gender_code,
                'gender_description' => $request->gender_description,
                'gender_status' => $request->gender_status ?? 'Available',
            ]);

            return redirect()->route('admin.attribute_variant.gender.index')
                            ->with('success', 'Gender created successfully');
        } catch (\Exception $e) {
            Log::error('Gender creation error: ' . $e->getMessage());
            return redirect()->back()
                            ->withInput()
                            ->withErrors(['error' => 'Gender creation failed: ' . $e->getMessage()]);
        }
    }

    /**
     * 显示编辑性别表单
     *
     * @param int $id 性别ID
     * @return \Illuminate\View\View
     */
    public function edit($id)
    {
        $gender = Gender::findOrFail($id);
        return view('admin.attribute_variants.gender.update', compact('gender'));
    }

    /**
     * 更新性别信息
     *
     * @param Request $request HTTP请求对象
     * @param int $id 性别ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        try {
            // 验证请求数据
            $request->validate([
                'gender_name' => 'required|string|max:50|unique:genders,gender_name,' . $id,
                'gender_code' => 'required|string|max:10|unique:genders,gender_code,' . $id,
                'gender_description' => 'nullable|string|max:1000',
                'gender_status' => 'required|in:Available,Unavailable',
            ], [
                'gender_name.required' => 'Gender name is required',
                'gender_name.unique' => 'This gender name already exists',
                'gender_code.required' => 'Gender code is required',
                'gender_code.unique' => 'This gender code already exists',
            ]);

            $gender = Gender::findOrFail($id);

            if (!$gender) {
                return redirect()->back()
                                ->withErrors(['error' => 'Gender not found']);
            }

            // 更新性别信息
            $gender->gender_name = $request->gender_name;
            $gender->gender_code = $request->gender_code;
            $gender->gender_description = $request->gender_description;
            $gender->gender_status = $request->gender_status ?? 'Available';
            $gender->save();

            return redirect()->route('admin.attribute_variant.gender.index')
                            ->with('success', 'Gender updated successfully');
        } catch (\Exception $e) {
            Log::error('Gender update error: ' . $e->getMessage());
            return redirect()->back()
                            ->withInput()
                            ->withErrors(['error' => 'Gender update failed: ' . $e->getMessage()]);
        }
    }

    /**
     * 删除性别
     *
     * @param int $id 性别ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        try {
            $gender = Gender::findOrFail($id);

            // 检查是否有关联的尺寸
            if ($gender->sizeClothings()->exists() || $gender->sizeShoes()->exists()) {
                return redirect()->back()
                                ->withErrors(['error' => 'Cannot delete this gender because sizes are still linked to it.']);
            }

            // 删除数据库记录
            $gender->delete();

            return redirect()->route('admin.attribute_variant.gender.index')
                            ->with('success', 'Gender deleted successfully');
        } catch (\Exception $e) {
            Log::error('Gender deletion error: ' . $e->getMessage());
            return redirect()->back()
                            ->withErrors(['error' => 'Failed to delete gender: ' . $e->getMessage()]);
        }
    }

    /**
     * 设置性别为可用状态
     *
     * @param int $id 性别ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function setAvailable($id)
    {
        try {
            $gender = Gender::findOrFail($id);
            $gender->gender_status = 'Available';
            $gender->save();

            Log::info('Gender set to Available', [
                'gender_id' => $gender->id,
                'gender_name' => $gender->gender_name
            ]);

            return redirect()->route('admin.attribute_variant.gender.index')
                            ->with('success', 'Gender has been set to available status');
        } catch (\Exception $e) {
            Log::error('Failed to set gender to Available', [
                'gender_id' => $id,
                'error_message' => $e->getMessage()
            ]);

            return redirect()->back()
                            ->withErrors(['error' => 'An error occurred while setting gender status. Please try again.']);
        }
    }

    /**
     * 设置性别为不可用状态
     *
     * @param int $id 性别ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function setUnavailable($id)
    {
        try {
            $gender = Gender::findOrFail($id);
            $gender->gender_status = 'Unavailable';
            $gender->save();

            Log::info('Gender set to Unavailable', [
                'gender_id' => $gender->id,
                'gender_name' => $gender->gender_name
            ]);

            return redirect()->route('admin.attribute_variant.gender.index')
                            ->with('success', 'Gender has been set to unavailable status');
        } catch (\Exception $e) {
            Log::error('Failed to set gender to Unavailable', [
                'gender_id' => $id,
                'error_message' => $e->getMessage()
            ]);

            return redirect()->back()
                            ->withErrors(['error' => 'An error occurred while setting gender status. Please try again.']);
        }
    }
}
