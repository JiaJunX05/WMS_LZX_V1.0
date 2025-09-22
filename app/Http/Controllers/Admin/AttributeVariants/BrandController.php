<?php

namespace App\Http\Controllers\Admin\AttributeVariants;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\AttributeVariants\Brand;

/**
 * 品牌管理控制器
 *
 * 功能模块：
 * - 品牌列表展示：搜索、筛选、分页
 * - 品牌操作：创建、编辑、删除、状态管理
 * - 图片管理：上传、更新、删除
 *
 * @author WMS Team
 * @version 1.0.0
 */
class BrandController extends Controller
{
    /**
     * 品牌列表页面
     *
     * @param Request $request HTTP请求对象
     * @return \Illuminate\View\View|\Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // 如果是 AJAX 请求，返回 JSON 数据
        if ($request->ajax()) {
            try {
                $query = Brand::query();

                // 搜索条件：品牌名称
                if ($request->filled('search')) {
                    $search = $request->input('search');
                    $query->where('brand_name', 'like', "%$search%");
                }

                // 根据品牌ID筛选
                if ($request->filled('brand_id')) {
                    $query->where('id', $request->input('brand_id'));
                }

                // 根据品牌状态筛选
                if ($request->filled('brand_status')) {
                    $query->where('brand_status', $request->input('brand_status'));
                }

                // 分页设置
                $perPage = $request->input('perPage', 10);
                $brands = $query->paginate($perPage);

                // 返回分页数据
                return response()->json([
                    'data' => $brands->map(function ($brand) {
                        return [
                            'id' => $brand->id,
                            'brand_name' => $brand->brand_name,
                            'brand_status' => $brand->brand_status,
                            'brand_image' => $brand->brand_image,
                        ];
                    }),
                    'pagination' => [
                        'current_page' => $brands->currentPage(),
                        'last_page' => $brands->lastPage(),
                        'total' => $brands->total(),
                        'per_page' => $brands->perPage(),
                        'from' => $brands->firstItem(),
                        'to' => $brands->lastItem(),
                    ],
                ]);
            } catch (\Exception $e) {
                Log::error('Brand management error: ' . $e->getMessage());
                return response()->json(['error' => 'Failed to fetch brands'], 500);
            }
        }

        // 如果不是 AJAX 请求，返回视图
        $brands = Brand::all();
        return view('admin.attribute_variants.brand.dashboard', compact('brands'));
    }

    /**
     * 显示创建品牌表单
     *
     * @return \Illuminate\View\View
     */
    public function create()
    {
        return view('admin.attribute_variants.brand.create');
    }

    /**
     * 存储新品牌
     *
     * @param Request $request HTTP请求对象
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        try {
            // 验证请求数据
            $request->validate([
                'brand_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'brand_name' => 'required|string|max:255|unique:brands',
                'brand_status' => 'required|in:Available,Unavailable',
            ]);

            // 处理图片上传（如果有的话）
            $brandImagePath = null;
            if ($request->hasFile('brand_image')) {
                $image = $request->file('brand_image');
                $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $directory = public_path('assets/images/brands');

                // 确保目录存在
                if (!file_exists($directory)) {
                    mkdir($directory, 0777, true);
                }

                // 移动图片到指定目录
                $image->move($directory, $imageName);
                $brandImagePath = 'brands/' . $imageName;
            }

            // 创建品牌记录
            $brand = Brand::create([
                'brand_image' => $brandImagePath,
                'brand_name' => $request->brand_name,
                'brand_status' => $request->brand_status ?? 'Available',
            ]);

            return redirect()->route('admin.attribute_variant.brand.index')
                            ->with('success', 'Brand created successfully');
        } catch (\Exception $e) {
            Log::error('Brand creation error: ' . $e->getMessage());

            // 如果出错，删除已上传的图片
            if (isset($imageName) && file_exists($directory . '/' . $imageName)) {
                unlink($directory . '/' . $imageName);
            }

            return redirect()->back()
                            ->withInput()
                            ->withErrors(['error' => 'Brand creation failed: ' . $e->getMessage()]);
        }
    }

    /**
     * 显示编辑品牌表单
     *
     * @param int $id 品牌ID
     * @return \Illuminate\View\View
     */
    public function edit($id)
    {
        $brand = Brand::findOrFail($id);
        return view('admin.attribute_variants.brand.update', compact('brand'));
    }

    /**
     * 更新品牌信息
     *
     * @param Request $request HTTP请求对象
     * @param int $id 品牌ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        try {
            // 验证请求数据
            $request->validate([
                'brand_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'brand_name' => 'required|string|max:255|unique:brands,brand_name,' . $id,
                'brand_status' => 'required|in:Available,Unavailable',
            ]);

            $brand = Brand::findOrFail($id);

            if (!$brand) {
                return redirect()->back()
                                ->withErrors(['error' => 'Brand not found']);
            }

            // 处理图片更新
            if ($request->hasFile('brand_image')) {
                // 删除旧图片
                if ($brand->brand_image) {
                    $imagePath = public_path('assets/images/' . $brand->brand_image);
                    if (file_exists($imagePath)) {
                        unlink($imagePath);
                    }
                }

                // 处理新图片上传
                $image = $request->file('brand_image');
                $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $directory = public_path('assets/images/brands');

                if (!file_exists($directory)) {
                    mkdir($directory, 0777, true);
                }

                $image->move($directory, $imageName);
                $brand->brand_image = 'brands/' . $imageName;
            }

            // 更新品牌信息
            $brand->brand_name = $request->brand_name;
            $brand->brand_status = $request->brand_status ?? 'Available';
            $brand->save();

            return redirect()->route('admin.attribute_variant.brand.index')
                            ->with('success', 'Brand updated successfully');
        } catch (\Exception $e) {
            Log::error('Brand update error: ' . $e->getMessage());
            return redirect()->back()
                            ->withInput()
                            ->withErrors(['error' => 'Brand update failed: ' . $e->getMessage()]);
        }
    }

    /**
     * 删除品牌
     *
     * @param int $id 品牌ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        try {
            $brand = Brand::findOrFail($id);

            // 检查是否有关联的产品
            if ($brand->products()->exists()) {
                return redirect()->back()
                                ->withErrors(['error' => 'Cannot delete this brand because products are still linked to it.']);
            }

            // 删除图片文件
            if ($brand->brand_image) {
                $imagePath = public_path('assets/images/' . $brand->brand_image);
                if (file_exists($imagePath)) {
                    unlink($imagePath);
                }
            }

            // 删除数据库记录
            $brand->delete();

            return redirect()->route('admin.attribute_variant.brand.index')
                            ->with('success', 'Brand deleted successfully');
        } catch (\Exception $e) {
            Log::error('Brand deletion error: ' . $e->getMessage());
            return redirect()->back()
                            ->withErrors(['error' => 'Failed to delete brand: ' . $e->getMessage()]);
        }
    }

    /**
     * 设置品牌为可用状态
     *
     * @param int $id 品牌ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function setAvailable($id)
    {
        try {
            $brand = Brand::findOrFail($id);
            $brand->brand_status = 'Available';
            $brand->save();

            Log::info('Brand set to Available', [
                'brand_id' => $brand->id,
                'brand_name' => $brand->brand_name
            ]);

            return redirect()->route('admin.attribute_variant.brand.index')
                            ->with('success', 'Brand has been set to available status');
        } catch (\Exception $e) {
            Log::error('Failed to set brand to Available', [
                'brand_id' => $id,
                'error_message' => $e->getMessage()
            ]);

            return redirect()->back()
                            ->withErrors(['error' => 'An error occurred while setting brand status. Please try again.']);
        }
    }

    /**
     * 设置品牌为不可用状态
     *
     * @param int $id 品牌ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function setUnavailable($id)
    {
        try {
            $brand = Brand::findOrFail($id);
            $brand->brand_status = 'Unavailable';
            $brand->save();

            Log::info('Brand set to Unavailable', [
                'brand_id' => $brand->id,
                'brand_name' => $brand->brand_name
            ]);

            return redirect()->route('admin.attribute_variant.brand.index')
                            ->with('success', 'Brand has been set to unavailable status');
        } catch (\Exception $e) {
            Log::error('Failed to set brand to Unavailable', [
                'brand_id' => $id,
                'error_message' => $e->getMessage()
            ]);

            return redirect()->back()
                            ->withErrors(['error' => 'An error occurred while setting brand status. Please try again.']);
        }
    }
}
