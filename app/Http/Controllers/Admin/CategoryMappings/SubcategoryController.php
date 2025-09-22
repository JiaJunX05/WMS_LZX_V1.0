<?php

namespace App\Http\Controllers\Admin\CategoryMappings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\CategoryMappings\Subcategory;

/**
 * 子分类管理控制器
 *
 * 功能模块：
 * - 子分类列表展示：搜索、筛选、分页
 * - 子分类操作：创建、编辑、删除、状态管理
 * - 图片管理：上传、更新、删除
 *
 * @author WMS Team
 * @version 1.0.0
 */
class SubcategoryController extends Controller
{
    /**
     * 子分类列表页面
     *
     * @param Request $request HTTP请求对象
     * @return \Illuminate\View\View|\Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // 如果是 AJAX 请求，返回 JSON 数据
        if ($request->ajax()) {
            try {
                $query = Subcategory::query();

                // 搜索条件：子分类名称
                if ($request->filled('search')) {
                    $search = $request->input('search');
                    $query->where('subcategory_name', 'like', "%$search%");
                }

                // 根据子分类ID筛选
                if ($request->filled('subcategory_id')) {
                    $query->where('id', $request->input('subcategory_id'));
                }

                // 根据子分类状态筛选
                if ($request->filled('subcategory_status')) {
                    $query->where('subcategory_status', $request->input('subcategory_status'));
                }

                // 分页设置
                $perPage = $request->input('perPage', 10);
                $subcategories = $query->paginate($perPage);

                // 返回分页数据
                return response()->json([
                    'data' => $subcategories->map(function ($subcategory) {
                        return [
                            'id' => $subcategory->id,
                            'subcategory_name' => $subcategory->subcategory_name,
                            'subcategory_image' => $subcategory->subcategory_image,
                            'subcategory_status' => $subcategory->subcategory_status,
                        ];
                    }),
                    'pagination' => [
                        'current_page' => $subcategories->currentPage(),
                        'last_page' => $subcategories->lastPage(),
                        'total' => $subcategories->total(),
                        'per_page' => $subcategories->perPage(),
                        'from' => $subcategories->firstItem(),
                        'to' => $subcategories->lastItem(),
                    ],
                ]);
            } catch (\Exception $e) {
                Log::error('Subcategory management error: ' . $e->getMessage());
                return response()->json(['error' => 'Failed to fetch subcategories'], 500);
            }
        }

        // 如果不是 AJAX 请求，返回视图
        $subcategories = Subcategory::all();
        return view('admin.category_mappings.subcategory.dashboard', compact('subcategories'));
    }

    /**
     * 显示创建子分类表单
     *
     * @return \Illuminate\View\View
     */
    public function create()
    {
        return view('admin.category_mappings.subcategory.create');
    }

    /**
     * 存储新子分类
     *
     * @param Request $request HTTP请求对象
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        try {
            // 验证请求数据
            $request->validate([
                'subcategory_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'subcategory_name' => 'required|string|max:255|unique:subcategories',
                'subcategory_status' => 'required|in:Available,Unavailable',
            ]);

            $subcategoryImagePath = null;

            // 处理图片上传
            if ($request->hasFile('subcategory_image')) {
                $image = $request->file('subcategory_image');
                $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $directory = public_path('assets/images/subcategories');

                // 确保目录存在
                if (!file_exists($directory)) {
                    mkdir($directory, 0777, true);
                }

                // 移动图片到指定目录
                $image->move($directory, $imageName);
                $subcategoryImagePath = 'subcategories/' . $imageName;
            }

            // 创建子分类记录
            $subcategory = Subcategory::create([
                'subcategory_image' => $subcategoryImagePath,
                'subcategory_name' => $request->subcategory_name,
                'subcategory_status' => $request->subcategory_status,
            ]);

            Log::info('Subcategory created successfully', [
                'subcategory_id' => $subcategory->id,
                'subcategory_name' => $subcategory->subcategory_name
            ]);

            return redirect()->route('admin.category_mapping.subcategory.index')
                            ->with('success', 'Subcategory created successfully');
        } catch (\Exception $e) {
            Log::error('Subcategory creation error: ' . $e->getMessage());

            // 如果出错，删除已上传的图片
            if (isset($subcategoryImagePath) && file_exists(public_path('assets/images/' . $subcategoryImagePath))) {
                unlink(public_path('assets/images/' . $subcategoryImagePath));
            }

            return redirect()->back()
                            ->withInput()
                            ->withErrors(['error' => 'Subcategory creation failed: ' . $e->getMessage()]);
        }
    }

    /**
     * 显示编辑子分类表单
     *
     * @param int $id 子分类ID
     * @return \Illuminate\View\View
     */
    public function edit($id)
    {
        $subcategory = Subcategory::findOrFail($id);
        return view('admin.category_mappings.subcategory.update', compact('subcategory'));
    }

    /**
     * 更新子分类信息
     *
     * @param Request $request HTTP请求对象
     * @param int $id 子分类ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'subcategory_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'subcategory_name' => 'required|string|max:255|unique:subcategories,subcategory_name,' . $id,
                'subcategory_status' => 'required|in:Available,Unavailable',
            ]);

            $subcategory = Subcategory::findOrFail($id);

            // 处理图片上传
            if ($request->hasFile('subcategory_image')) {
                // 删除旧图片
                if ($subcategory->subcategory_image) {
                    $oldImagePath = public_path('assets/images/' . $subcategory->subcategory_image);
                    if (file_exists($oldImagePath)) {
                        unlink($oldImagePath);
                    }
                }

                // 处理新图片上传
                $image = $request->file('subcategory_image');
                $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $directory = public_path('assets/images/subcategories');

                // 确保目录存在
                if (!file_exists($directory)) {
                    mkdir($directory, 0777, true);
                }

                // 移动图片到指定目录
                $image->move($directory, $imageName);
                $subcategory->subcategory_image = 'subcategories/' . $imageName;
            }

            // 更新子分类信息
            $subcategory->subcategory_name = $request->subcategory_name;
            $subcategory->subcategory_status = $request->subcategory_status;
            $subcategory->save();

            Log::info('Subcategory updated successfully', [
                'subcategory_id' => $subcategory->id,
                'subcategory_name' => $subcategory->subcategory_name
            ]);

            return redirect()->route('admin.category_mapping.subcategory.index')
                            ->with('success', 'Subcategory updated successfully');
        } catch (\Exception $e) {
            Log::error('Subcategory update error: ' . $e->getMessage());
            return redirect()->back()
                            ->withInput()
                            ->withErrors(['error' => 'Subcategory update failed: ' . $e->getMessage()]);
        }
    }

    /**
     * 删除子分类
     *
     * @param int $id 子分类ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        try {
            $subcategory = Subcategory::findOrFail($id);

            // 检查是否有关联的映射
            if ($subcategory->mappings()->exists()) {
                return redirect()->back()
                                ->withErrors(['error' => 'Cannot delete subcategory with existing mappings']);
            }

            // 删除图片文件
            if ($subcategory->subcategory_image) {
                $imagePath = public_path('assets/images/' . $subcategory->subcategory_image);
                if (file_exists($imagePath)) {
                    unlink($imagePath);
                }
            }

            // 删除数据库记录
            $subcategory->delete();

            Log::info('Subcategory deleted successfully', [
                'subcategory_id' => $id,
                'subcategory_name' => $subcategory->subcategory_name
            ]);

            return redirect()->route('admin.category_mapping.subcategory.index')
                            ->with('success', 'Subcategory deleted successfully');
        } catch (\Exception $e) {
            Log::error('Subcategory deletion error: ' . $e->getMessage());
            return redirect()->back()
                            ->withErrors(['error' => 'Failed to delete subcategory: ' . $e->getMessage()]);
        }
    }

    /**
     * 设置子分类为可用状态
     *
     * @param int $id 子分类ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function setAvailable($id)
    {
        try {
            $subcategory = Subcategory::findOrFail($id);
            $subcategory->subcategory_status = 'Available';
            $subcategory->save();

            Log::info('Subcategory set to Available', [
                'subcategory_id' => $subcategory->id,
                'subcategory_name' => $subcategory->subcategory_name
            ]);

            return redirect()->route('admin.category_mapping.subcategory.index')
                            ->with('success', 'Subcategory has been set to available status');
        } catch (\Exception $e) {
            Log::error('Failed to set subcategory to Available', [
                'subcategory_id' => $id,
                'error_message' => $e->getMessage()
            ]);

            return redirect()->back()
                            ->withErrors(['error' => 'An error occurred while setting subcategory status. Please try again.']);
        }
    }

    /**
     * 设置子分类为不可用状态
     *
     * @param int $id 子分类ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function setUnavailable($id)
    {
        try {
            $subcategory = Subcategory::findOrFail($id);
            $subcategory->subcategory_status = 'Unavailable';
            $subcategory->save();

            Log::info('Subcategory set to Unavailable', [
                'subcategory_id' => $subcategory->id,
                'subcategory_name' => $subcategory->subcategory_name
            ]);

            return redirect()->route('admin.category_mapping.subcategory.index')
                            ->with('success', 'Subcategory has been set to unavailable status');
        } catch (\Exception $e) {
            Log::error('Failed to set subcategory to Unavailable', [
                'subcategory_id' => $id,
                'error_message' => $e->getMessage()
            ]);

            return redirect()->back()
                            ->withErrors(['error' => 'An error occurred while setting subcategory status. Please try again.']);
        }
    }
}
