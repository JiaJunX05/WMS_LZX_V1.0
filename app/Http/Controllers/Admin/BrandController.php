<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\ManagementTool\Brand;

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
     * 显示品牌列表页面
     */
    public function index(Request $request)
    {
        if ($request->ajax()) {
            try {
                $query = Brand::query();

                // 搜索功能
                if ($request->has('search') && $request->search) {
                    $search = $request->search;
                    $query->where(function($q) use ($search) {
                        $q->where('brand_name', 'like', "%{$search}%");
                    });
                }

                // 状态筛选
                if ($request->has('status_filter') && $request->status_filter) {
                    $query->where('brand_status', $request->status_filter);
                }

                $brands = $query->paginate(10);

                return response()->json([
                    'success' => true,
                    'data' => $brands->items(),
                    'pagination' => [
                        'current_page' => $brands->currentPage(),
                        'last_page' => $brands->lastPage(),
                        'per_page' => $brands->perPage(),
                        'total' => $brands->total(),
                        'from' => $brands->firstItem(),
                        'to' => $brands->lastItem(),
                    ]
                ]);
            } catch (\Exception $e) {
                Log::error('Brand management error: ' . $e->getMessage());
                return response()->json(['error' => 'Failed to fetch brands'], 500);
            }
        }

        $brands = Brand::paginate(10);
        return view('admin.brand_dashboard', compact('brands'));
    }

    /**
     * 显示创建品牌表单
     */
    public function create()
    {
        return view('admin.brand_create');
    }

    /**
     * 存储新品牌
     */
    public function store(Request $request)
    {
        // 与 CategoryController 的实现保持一致：有数组走批量，否则走单个
        if ($request->has('brands') && is_array($request->input('brands'))) {
            return $this->storeMultipleBrands($request);
        }

        return $this->storeSingleBrand($request);
    }

    /**
     * 单个存储品牌
     */
    private function storeSingleBrand(Request $request)
    {
        // 校验
        $request->validate([
            'brand_name' => 'required|string|max:255|unique:brands,brand_name',
            'brand_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            // brand_status 不再需要验证，默认为 Available
        ]);

        try {
            $brandData = [
                'brand_name' => $request->input('brand_name') ?? $request->input('brandName'),
                'brand_status' => 'Available', // 默认为 Available
            ];

            // 处理文件上传
            if ($request->hasFile('brand_image')) {
                // 文件上传（确保目录存在）
                $image = $request->file('brand_image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $directory = public_path('assets/images/brands');
                if (!file_exists($directory)) {
                    mkdir($directory, 0777, true);
                }
                $image->move($directory, $imageName);
                $brandData['brand_image'] = 'brands/' . $imageName;
            }

            $brand = Brand::create($brandData);

            Log::info('Brand created successfully (single)', [
                'brand_id' => $brand->id,
                'brand_name' => $brandData['brand_name']
            ]);

            $message = 'Brand created successfully!';

            if ($request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $brand
                ]);
            }

            return redirect()->route('admin.management_tool.brand.index')
                ->with('success', $message);

        } catch (\Exception $e) {
            Log::error('Brand creation failed (single): ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            if ($request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create brand: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to create brand: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * 批量存储品牌（统一入口）
     */
    private function storeMultipleBrands(Request $request)
    {
        // 仅处理批量数组
        $brands = $request->input('brands', []);
        $createdBrands = [];
        $errors = [];

        foreach ($brands as $index => $brandData) {

            // 兼容前端字段命名（camelCase -> snake_case）
            // 前端：brandName / brandStatus
            // 后端期望：brand_name / brand_status
            if (isset($brandData['brandName']) && !isset($brandData['brand_name'])) {
                $brandData['brand_name'] = $brandData['brandName'];
            }
            if (isset($brandData['brandStatus']) && !isset($brandData['brand_status'])) {
                $brandData['brand_status'] = $brandData['brandStatus'];
            }

            $validator = \Validator::make($brandData, [
                'brand_name' => 'required|string|max:255',
            ]);

            if ($validator->fails()) {
                $errors[] = "Brand " . ($index + 1) . ": " . implode(', ', $validator->errors()->all());
                continue;
            }

            // 检查品牌名称是否已存在
            $existingBrand = Brand::where('brand_name', $brandData['brand_name'])->first();

            if ($existingBrand) {
                $errors[] = "Brand " . ($index + 1) . ": Brand name '{$brandData['brand_name']}' already exists";
                continue;
            }

            try {
                $brandRecord = [
                    'brand_name' => $brandData['brand_name'],
                    'brand_status' => 'Available', // 默认为 Available
                ];

                // 处理图片上传 - 使用文件数组
                $files = $request->file('images');
                if (is_array($files) && isset($files[$index]) && $files[$index] && $files[$index]->isValid()) {
                    $image = $files[$index];
                    $directory = public_path('assets/images/brands');
                    if (!file_exists($directory)) {
                        mkdir($directory, 0777, true);
                    }
                    $imageName = time() . '_' . $index . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                    $image->move($directory, $imageName);
                    $brandRecord['brand_image'] = 'brands/' . $imageName;
                }

                $brand = Brand::create($brandRecord);
                $createdBrands[] = $brand;
            } catch (\Exception $e) {
                $errors[] = "Brand " . ($index + 1) . ": " . $e->getMessage();
            }
        }

        if ($request->ajax()) {
            if (count($errors) > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some brands failed to create',
                    'errors' => $errors,
                    'created_count' => count($createdBrands)
                ], 422);
            } else {
                return response()->json([
                    'success' => true,
                    'message' => count($createdBrands) . ' brands created successfully',
                    'data' => $createdBrands
                ]);
            }
        }

        if (count($errors) > 0) {
            return back()->withErrors(['error' => implode('; ', $errors)])
                ->withInput();
        }

        return redirect()->route('admin.management_tool.brand.index')
            ->with('success', count($createdBrands) . ' brands created successfully');
    }

    /**
     * 显示编辑品牌表单
     */
    public function edit($id)
    {
        $brand = Brand::findOrFail($id);
        return view('admin.brand_update', compact('brand'));
    }

    /**
     * 更新品牌信息
     */
    public function update(Request $request, $id)
    {
        try {
            $brand = Brand::findOrFail($id);

            Log::info('Update request received', [
                'id' => $id,
                'request_data' => $request->all(),
                'is_ajax' => request()->ajax()
            ]);

            // 验证请求数据
            $validatedData = $request->validate([
                'brand_name' => 'required|string|max:255',
                'brand_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'brand_status' => 'required|in:Available,Unavailable',
            ]);

            // 检查品牌名称是否已存在（排除当前记录）
            $existingBrand = Brand::where('brand_name', $validatedData['brand_name'])
                ->where('id', '!=', $id)
                ->first();

            if ($existingBrand) {
                $message = "Brand name '{$validatedData['brand_name']}' already exists";

                if ($request->ajax()) {
                    return response()->json([
                        'success' => false,
                        'message' => $message,
                        'errors' => [
                            'brand_name' => [$message]
                        ]
                    ], 422);
                }

                return back()->withErrors(['brand_name' => $message])->withInput();
            }

            // 更新品牌记录
            $brandData = [
                'brand_name' => $validatedData['brand_name'],
                'brand_status' => $validatedData['brand_status'],
            ];

            // 处理图片更新
            if ($request->hasFile('brand_image')) {
                // 删除旧图片
                if ($brand->brand_image && file_exists(public_path('assets/images/' . $brand->brand_image))) {
                    unlink(public_path('assets/images/' . $brand->brand_image));
                }

                // 上传新图片（确保目录存在）
                $image = $request->file('brand_image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $directory = public_path('assets/images/brands');
                if (!file_exists($directory)) {
                    mkdir($directory, 0777, true);
                }
                $image->move($directory, $imageName);
                $brandData['brand_image'] = 'brands/' . $imageName;
            }

            $brand->update($brandData);

            Log::info('Brand updated successfully', [
                'brand_id' => $id,
                'brand_name' => $validatedData['brand_name'],
                'brand_status' => $validatedData['brand_status']
            ]);

            $message = 'Brand updated successfully';

            if ($request->ajax()) {
                $freshBrand = $brand->fresh();
                Log::info('AJAX response data', [
                    'success' => true,
                    'message' => $message,
                    'data' => $freshBrand
                ]);

                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $freshBrand
                ]);
            }

            return redirect()->route('admin.management_tool.brand.index')
                ->with('success', $message);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Brand update validation failed', [
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
            Log::error('Brand update failed: ' . $e->getMessage(), [
                'id' => $id,
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            $message = 'Failed to update brand: ' . $e->getMessage();

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
     * 设置品牌为可用状态
     */
    public function setAvailable($id)
    {
        try {
            $brand = Brand::findOrFail($id);
            $brand->update(['brand_status' => 'Available']);

            Log::info('Brand set to available', ['brand_id' => $id]);

            // 返回 JSON 响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Brand has been set to available status',
                    'data' => $brand
                ]);
            }

            return redirect()->route('admin.management_tool.brand.index')
                ->with('success', 'Brand has been set to available status');

        } catch (\Exception $e) {
            Log::error('Failed to set brand available: ' . $e->getMessage());

            // 返回 JSON 错误响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to set brand available: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to set brand available: ' . $e->getMessage()]);
        }
    }

    /**
     * 设置品牌为不可用状态
     */
    public function setUnavailable($id)
    {
        try {
            $brand = Brand::findOrFail($id);
            $brand->update(['brand_status' => 'Unavailable']);

            Log::info('Brand set to unavailable', ['brand_id' => $id]);

            // 返回 JSON 响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Brand has been set to unavailable status',
                    'data' => $brand
                ]);
            }

            return redirect()->route('admin.management_tool.brand.index')
                ->with('success', 'Brand has been set to unavailable status');

        } catch (\Exception $e) {
            Log::error('Failed to set brand unavailable: ' . $e->getMessage());

            // 返回 JSON 错误响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to set brand unavailable: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to set brand unavailable: ' . $e->getMessage()]);
        }
    }

    /**
     * 删除品牌
     */
    public function destroy($id)
    {
        try {
            $brand = Brand::findOrFail($id);

            // 删除品牌图片
            if ($brand->brand_image && file_exists(public_path('assets/images/' . $brand->brand_image))) {
                unlink(public_path('assets/images/' . $brand->brand_image));
            }

            $brand->delete();

            Log::info('Brand deleted successfully', ['brand_id' => $id]);

            // 返回 JSON 响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Brand deleted successfully!',
                    'data' => [
                        'id' => $id,
                        'name' => $brand->brand_name
                    ]
                ]);
            }

            return redirect()->route('admin.management_tool.brand.index')
                ->with('success', 'Brand deleted successfully!');

        } catch (\Exception $e) {
            Log::error('Brand deletion failed: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to delete brand: ' . $e->getMessage()]);
        }
    }
}
