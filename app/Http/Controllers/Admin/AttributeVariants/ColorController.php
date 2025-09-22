<?php

namespace App\Http\Controllers\Admin\AttributeVariants;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\AttributeVariants\Color;

/**
 * 颜色管理控制器
 *
 * 功能模块：
 * - 颜色列表展示：搜索、筛选、分页
 * - 颜色操作：创建、编辑、删除、状态管理
 * - 颜色代码管理：HEX、RGB 代码
 *
 * @author WMS Team
 * @version 1.0.0
 */
class ColorController extends Controller
{
    /**
     * 颜色列表页面
     *
     * @param Request $request HTTP请求对象
     * @return \Illuminate\View\View|\Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // 如果是 AJAX 请求，返回 JSON 数据
        if ($request->ajax()) {
            try {
                $query = Color::query();

                // 搜索条件：颜色名称、HEX代码或RGB代码
                if ($request->filled('search')) {
                    $search = $request->input('search');
                    $query->where(function ($query) use ($search) {
                        $query->where('color_name', 'like', "%$search%")
                              ->orWhere('color_hex', 'like', "%$search%")
                              ->orWhere('color_rgb', 'like', "%$search%");
                    });
                }

                // 根据颜色ID筛选
                if ($request->filled('color_id')) {
                    $query->where('id', $request->input('color_id'));
                }

                // 根据颜色状态筛选
                if ($request->filled('color_status')) {
                    $query->where('color_status', $request->input('color_status'));
                }

                // 分页设置
                $perPage = $request->input('perPage', 10);
                $colors = $query->paginate($perPage);

                // 返回分页数据
                return response()->json([
                    'data' => $colors->map(function ($color) {
                        return [
                            'id' => $color->id,
                            'color_name' => $color->color_name,
                            'color_hex' => $color->color_hex,
                            'color_rgb' => $color->color_rgb,
                            'color_status' => $color->color_status,
                        ];
                    }),
                    'pagination' => [
                        'current_page' => $colors->currentPage(),
                        'last_page' => $colors->lastPage(),
                        'total' => $colors->total(),
                        'per_page' => $colors->perPage(),
                        'from' => $colors->firstItem(),
                        'to' => $colors->lastItem(),
                    ],
                ]);
            } catch (\Exception $e) {
                Log::error('Color management error: ' . $e->getMessage());
                return response()->json(['error' => 'Failed to fetch colors'], 500);
            }
        }

        // 如果不是 AJAX 请求，返回视图
        $colors = Color::all();
        return view('admin.attribute_variants.color.dashboard', compact('colors'));
    }

    /**
     * 显示创建颜色表单
     *
     * @return \Illuminate\View\View
     */
    public function create()
    {
        return view('admin.attribute_variants.color.create');
    }

    /**
     * 存储新颜色
     *
     * @param Request $request HTTP请求对象
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        try {
            // 验证请求数据
            $request->validate([
                'color_name' => 'required|string|max:255|unique:colors',
                'color_hex' => ['required', 'string', 'max:7', 'regex:/^#[0-9A-Fa-f]{6}$/', 'unique:colors'],
                'color_rgb' => 'required|string|max:255|unique:colors',
                'color_status' => 'required|in:Available,Unavailable',
            ]);

            // 创建颜色记录
            $color = Color::create([
                'color_name' => $request->color_name,
                'color_hex' => $request->color_hex,
                'color_rgb' => $request->color_rgb,
                'color_status' => $request->color_status ?? 'Available',
            ]);

            return redirect()->route('admin.attribute_variant.color.index')
                            ->with('success', 'Color created successfully');
        } catch (\Exception $e) {
            Log::error('Color creation error: ' . $e->getMessage());
            return redirect()->back()
                            ->withInput()
                            ->withErrors(['error' => 'Color creation failed: ' . $e->getMessage()]);
        }
    }

    /**
     * 显示编辑颜色表单
     *
     * @param int $id 颜色ID
     * @return \Illuminate\View\View
     */
    public function edit($id)
    {
        $color = Color::findOrFail($id);
        return view('admin.attribute_variants.color.update', compact('color'));
    }

    /**
     * 更新颜色信息
     *
     * @param Request $request HTTP请求对象
     * @param int $id 颜色ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        try {
            // 验证请求数据
            $request->validate([
                'color_name' => 'required|string|max:255|unique:colors,color_name,' . $id,
                'color_hex' => ['required', 'string', 'max:7', 'regex:/^#[0-9A-Fa-f]{6}$/', 'unique:colors,color_hex,' . $id],
                'color_rgb' => 'required|string|max:255|unique:colors,color_rgb,' . $id,
                'color_status' => 'required|in:Available,Unavailable',
            ]);

            $color = Color::findOrFail($id);

            if (!$color) {
                return redirect()->back()
                                ->withErrors(['error' => 'Color not found']);
            }

            // 更新颜色信息
            $color->color_name = $request->color_name;
            $color->color_hex = $request->color_hex;
            $color->color_rgb = $request->color_rgb;
            $color->color_status = $request->color_status ?? 'Available';
            $color->save();

            return redirect()->route('admin.attribute_variant.color.index')
                            ->with('success', 'Color updated successfully');
        } catch (\Exception $e) {
            Log::error('Color update error: ' . $e->getMessage());
            return redirect()->back()
                            ->withInput()
                            ->withErrors(['error' => 'Color update failed: ' . $e->getMessage()]);
        }
    }

    /**
     * 删除颜色
     *
     * @param int $id 颜色ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        try {
            $color = Color::findOrFail($id);

            // 检查是否有关联的产品
            if ($color->products()->exists()) {
                return redirect()->back()
                                ->withErrors(['error' => 'Cannot delete this color because products are still linked to it.']);
            }

            // 删除数据库记录
            $color->delete();

            return redirect()->route('admin.attribute_variant.color.index')
                            ->with('success', 'Color deleted successfully');
        } catch (\Exception $e) {
            Log::error('Color deletion error: ' . $e->getMessage());
            return redirect()->back()
                            ->withErrors(['error' => 'Failed to delete color: ' . $e->getMessage()]);
        }
    }

    /**
     * 设置颜色为可用状态
     *
     * @param int $id 颜色ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function setAvailable($id)
    {
        try {
            $color = Color::findOrFail($id);
            $color->color_status = 'Available';
            $color->save();

            Log::info('Color set to Available', [
                'color_id' => $color->id,
                'color_name' => $color->color_name
            ]);

            return redirect()->route('admin.attribute_variant.color.index')
                            ->with('success', 'Color has been set to available status');
        } catch (\Exception $e) {
            Log::error('Failed to set color to Available', [
                'color_id' => $id,
                'error_message' => $e->getMessage()
            ]);

            return redirect()->back()
                            ->withErrors(['error' => 'An error occurred while setting color status. Please try again.']);
        }
    }

    /**
     * 设置颜色为不可用状态
     *
     * @param int $id 颜色ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function setUnavailable($id)
    {
        try {
            $color = Color::findOrFail($id);
            $color->color_status = 'Unavailable';
            $color->save();

            Log::info('Color set to Unavailable', [
                'color_id' => $color->id,
                'color_name' => $color->color_name
            ]);

            return redirect()->route('admin.attribute_variant.color.index')
                            ->with('success', 'Color has been set to unavailable status');
        } catch (\Exception $e) {
            Log::error('Failed to set color to Unavailable', [
                'color_id' => $id,
                'error_message' => $e->getMessage()
            ]);

            return redirect()->back()
                            ->withErrors(['error' => 'An error occurred while setting color status. Please try again.']);
        }
    }
}

