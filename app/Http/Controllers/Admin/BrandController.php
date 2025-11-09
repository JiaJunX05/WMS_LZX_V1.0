<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Brand;
use App\Exports\BrandExport;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;

/**
 * 品牌管理控制器
 * Brand Management Controller
 *
 * 功能模块：
 * - 品牌列表展示：搜索、筛选、分页
 * - 品牌操作：创建、编辑、删除、状态管理
 * - 图片管理：上传、更新、删除
 * - 数据导出：Excel 导出功能
 *
 * @author WMS Team
 * @version 3.0.0
 */
class BrandController extends Controller
{
    // =============================================================================
    // 常量定义 (Constants)
    // =============================================================================

    /**
     * 状态常量
     */
    private const STATUSES = ['Available', 'Unavailable'];

    /**
     * 品牌验证规则
     */
    private const BRAND_RULES = [
        'brand_name' => 'required|string|max:255',
    ];

    /**
     * 品牌图片验证规则
     */
    private const BRAND_IMAGE_RULES = [
        'brand_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
    ];

    // =============================================================================
    // 私有辅助方法 (Private Helper Methods)
    // =============================================================================

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
        if (strpos($errorMessage, 'Duplicate entry') !== false && strpos($errorMessage, 'brands_brand_name_unique') !== false) {
            return 'Brand name already exists. Please choose a different name.';
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
        Log::info("Brand {$action}", array_merge([
            'timestamp' => now()->toISOString(),
            'ip' => request()->ip(),
        ], $data));
    }

    // =============================================================================
    // 公共方法 (Public Methods)
    // =============================================================================

    /**
     * 显示品牌列表页面
     * Display brand list page
     *
     * @param Request $request
     * @return \Illuminate\View\View|\Illuminate\Http\JsonResponse
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
        return view('admin.brand.dashboard', compact('brands'));
    }

    /**
     * 存储新品牌
     * Store new brand
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $rules = array_merge(self::BRAND_RULES, self::BRAND_IMAGE_RULES);
        $rules['brand_name'] .= '|unique:brands,brand_name';

        $request->validate($rules);

        try {
            $brandData = [
                'brand_name' => $request->input('brand_name') ?? $request->input('brandName'),
                'brand_status' => 'Available',
            ];

            // 处理文件上传
            if ($request->hasFile('brand_image')) {
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

            $this->logOperation('created', [
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
            return $this->handleError($request, 'Failed to create brand: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 显示品牌编辑表单（用于 Modal）
     * Show brand edit form (for Modal)
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function showEditForm(Request $request, $id)
    {
        try {
            $brand = Brand::findOrFail($id);

            // 如果是 AJAX 请求，返回 JSON 数据（用于 Modal）
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Brand data fetched successfully',
                    'data' => [
                        'id' => $brand->id,
                        'brand_name' => $brand->brand_name,
                        'brand_status' => $brand->brand_status,
                        'brand_image' => $brand->brand_image
                    ]
                ]);
            }

            // 非 AJAX 请求重定向到管理页面
            return redirect()->route('admin.management_tool.brand.index');
        } catch (\Exception $e) {
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to load brand data: ' . $e->getMessage()
                ], 404);
            }
            return redirect()->route('admin.management_tool.brand.index')
                ->with('error', 'Brand not found');
        }
    }

    /**
     * 更新品牌信息
     * Update brand information
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
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
            $rules = array_merge(self::BRAND_RULES, self::BRAND_IMAGE_RULES);
            $rules['brand_status'] = 'required|in:' . implode(',', self::STATUSES);

            $validatedData = $request->validate($rules);

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

            // 处理图片：上传新图片或移除现有图片
            if ($request->hasFile('brand_image')) {
                // 上传新图片：删除旧图片
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
            } elseif ($request->has('remove_image') && $request->input('remove_image') === '1') {
                // 移除图片：删除文件并清空数据库字段
                if ($brand->brand_image && file_exists(public_path('assets/images/' . $brand->brand_image))) {
                    unlink(public_path('assets/images/' . $brand->brand_image));
                }
                $brandData['brand_image'] = null;
            }

            $brand->update($brandData);

            $this->logOperation('updated', [
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
            return $this->handleError($request, 'Failed to update brand: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 设置品牌为可用状态
     * Set brand to available status
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function setAvailable($id)
    {
        try {
            $brand = Brand::findOrFail($id);
            $brand->update(['brand_status' => 'Available']);

            $this->logOperation('set to available', ['brand_id' => $id]);

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
            return $this->handleError(request(), 'Failed to set brand available: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 设置品牌为不可用状态
     * Set brand to unavailable status
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function setUnavailable($id)
    {
        try {
            $brand = Brand::findOrFail($id);
            $brand->update(['brand_status' => 'Unavailable']);

            $this->logOperation('set to unavailable', ['brand_id' => $id]);

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
            return $this->handleError(request(), 'Failed to set brand unavailable: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 删除品牌
     * Delete brand
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
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

            $this->logOperation('deleted', ['brand_id' => $id]);

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
            return $this->handleError(request(), 'Failed to delete brand: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 导出品牌数据到 Excel
     * Export brands data to Excel
     *
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse|\Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function exportBrands(Request $request)
    {
        try {
            // 获取筛选条件
            $filters = [
                'search' => $request->get('search'),
                'status_filter' => $request->get('status_filter'),
                'ids' => $request->get('ids') ? explode(',', $request->get('ids')) : null,
            ];

            // 生成文件名
            $timestamp = Carbon::now()->format('Y-m-d_H-i-s');
            $filename = "brands_export_{$timestamp}.xlsx";

            // 使用 Laravel Excel 导出
            return Excel::download(new BrandExport($filters), $filename);

        } catch (\Exception $e) {
            Log::error('Brand export failed: ' . $e->getMessage());

            if ($request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Export failed: ' . $e->getMessage()
                ], 500);
            }

            return redirect()->back()
                ->with('error', 'Export failed. Please try again.');
        }
    }
}
