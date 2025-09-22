<?php

namespace App\Http\Controllers\Admin\StorageLocations;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\StorageLocations\Rack;

/**
 * 货架管理控制器
 *
 * 功能模块：
 * - 货架列表展示：搜索、筛选、分页
 * - 货架操作：创建、编辑、删除
 * - 图片管理：上传、更新、删除
 *
 * @author WMS Team
 * @version 1.0.0
 */
class RackController extends Controller
{
    /**
     * 货架列表页面
     *
     * @param Request $request HTTP请求对象
     * @return \Illuminate\View\View|\Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // 如果是 AJAX 请求，返回 JSON 数据
        if ($request->ajax()) {
            try {
                $query = Rack::query();

                // 搜索条件：货架编号
                if ($request->filled('search')) {
                    $search = $request->input('search');
                    $query->where(function ($query) use ($search) {
                        $query->where('rack_number', 'like', "%$search%");
                    });
                }

                // 根据货架ID筛选
                if ($request->filled('rack_id')) {
                    $query->where('id', $request->input('rack_id'));
                }

                // 根据区域状态筛选
                if ($request->filled('rack_status')) {
                    $query->where('rack_status', $request->input('rack_status'));
                }


                // 分页设置
                $perPage = $request->input('perPage', 10);
                $racks = $query->paginate($perPage);

                // 返回分页数据
                return response()->json([
                    'data' => $racks->map(function ($rack) {
                        return [
                            'id' => $rack->id,
                            'rack_number' => $rack->rack_number,
                            'capacity' => $rack->capacity,
                            'rack_image' => $rack->rack_image,
                            'rack_status' => $rack->rack_status,
                        ];
                    }),
                    'pagination' => [
                        'current_page' => $racks->currentPage(),
                        'last_page' => $racks->lastPage(),
                        'total' => $racks->total(),
                        'per_page' => $racks->perPage(),
                        'from' => $racks->firstItem(),
                        'to' => $racks->lastItem(),
                    ],
                ]);
            } catch (\Exception $e) {
                Log::error('Rack management error: ' . $e->getMessage());
                return response()->json(['error' => 'Failed to fetch racks'], 500);
            }
        }

        // 如果不是 AJAX 请求，返回视图
        $racks = Rack::all();
        return view('admin.storage_locations.rack.dashboard', compact('racks'));
    }

    /**
     * 显示创建货架表单
     *
     * @return \Illuminate\View\View
     */
    public function create()
    {
        return view('admin.storage_locations.rack.create');
    }

    /**
     * 存储新货架
     *
     * @param Request $request HTTP请求对象
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        try {
            // 验证请求数据
            $request->validate([
                'rack_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'rack_number' => 'required|string|max:255|unique:racks',
                'capacity' => 'nullable|integer|min:1',
                'rack_status' => 'required|in:Available,Unavailable',
            ]);


            // 处理图片上传（如果有的话）
            $rackImagePath = null;
            if ($request->hasFile('rack_image')) {
                $image = $request->file('rack_image');
                $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $directory = public_path('assets/images/racks');

                // 确保目录存在
                if (!file_exists($directory)) {
                    mkdir($directory, 0777, true);
                }

                // 移动图片到指定目录
                $image->move($directory, $imageName);
                $rackImagePath = 'racks/' . $imageName;
            }

            // 创建货架记录
            $rack = Rack::create([
                'rack_image' => $rackImagePath,
                'rack_number' => $request->rack_number,
                'capacity' => $request->capacity ?? 50,
                'rack_status' => $request->rack_status ?? 'Available',
            ]);

            return redirect()->route('admin.storage_locations.rack.index')
                            ->with('success', 'Rack created successfully');
        } catch (\Exception $e) {
            Log::error('Rack creation error: ' . $e->getMessage());

            // 如果出错，删除已上传的图片
            if (isset($imageName) && file_exists($directory . '/' . $imageName)) {
                unlink($directory . '/' . $imageName);
            }

            return redirect()->back()
                            ->withInput()
                            ->withErrors(['error' => 'Rack creation failed: ' . $e->getMessage()]);
        }
    }

    /**
     * 显示编辑货架表单
     *
     * @param int $id 货架ID
     * @return \Illuminate\View\View
     */
    public function edit($id)
    {
        $rack = Rack::findOrFail($id);
        return view('admin.storage_locations.rack.update', compact('rack'));
    }

    /**
     * 更新货架信息
     *
     * @param Request $request HTTP请求对象
     * @param int $id 货架ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        try {
            // 验证请求数据
            $request->validate([
                'rack_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'rack_number' => 'required|string|max:255|unique:racks,rack_number,' . $id,
                'capacity' => 'nullable|integer|min:1',
                'rack_status' => 'required|in:Available,Unavailable',
            ]);

            $rack = Rack::findOrFail($id);

            if (!$rack) {
                return redirect()->back()
                                ->withErrors(['error' => 'Rack not found']);
            }

            // 处理图片更新
            if ($request->hasFile('rack_image')) {
                // 删除旧图片
                if ($rack->rack_image) {
                    $imagePath = public_path('assets/images/' . $rack->rack_image);
                    if (file_exists($imagePath)) {
                        unlink($imagePath);
                    }
                }

                // 处理新图片上传
                $image = $request->file('rack_image');
                $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $directory = public_path('assets/images/racks');

                if (!file_exists($directory)) {
                    mkdir($directory, 0777, true);
                }

                $image->move($directory, $imageName);
                $rack->rack_image = 'racks/' . $imageName;
            }

            // 更新货架信息
            $rack->rack_number = $request->rack_number;
            $rack->capacity = $request->capacity ?? 50;
            $rack->rack_status = $request->rack_status ?? 'Available';
            $rack->save();

            return redirect()->route('admin.storage_locations.rack.index')
                            ->with('success', 'Rack updated successfully');
        } catch (\Exception $e) {
            Log::error('Rack update error: ' . $e->getMessage());
            return redirect()->back()
                            ->withInput()
                            ->withErrors(['error' => 'Rack update failed: ' . $e->getMessage()]);
        }
    }

    /**
     * 删除货架
     *
     * @param int $id 货架ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        try {
            $rack = Rack::findOrFail($id);

            // 检查是否有关联的存储位置
            if ($rack->locations()->exists()) {
                return redirect()->back()
                                ->withErrors(['error' => 'Cannot delete this rack because storage locations are still linked to it.']);
            }

            // 删除图片文件
            if ($rack->rack_image) {
                $imagePath = public_path('assets/images/' . $rack->rack_image);
                if (file_exists($imagePath)) {
                    unlink($imagePath);
                }
            }

            // 删除数据库记录
            $rack->delete();

            return redirect()->route('admin.storage_locations.rack.index')
                            ->with('success', 'Rack deleted successfully');
        } catch (\Exception $e) {
            Log::error('Rack deletion error: ' . $e->getMessage());
            return redirect()->back()
                            ->withErrors(['error' => 'Rack deletion failed: ' . $e->getMessage()]);
        }
    }

    /**
     * 设置货架为可用状态
     *
     * @param int $id 货架ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function setAvailable($id)
    {
        try {
            $rack = Rack::findOrFail($id);
            $rack->rack_status = 'Available';
            $rack->save();

            Log::info('Rack set to Available', [
                'rack_id' => $rack->id,
                'rack_number' => $rack->rack_number
            ]);

            return redirect()->route('admin.storage_locations.rack.index')
                            ->with('success', 'Rack has been set to available status');
        } catch (\Exception $e) {
            Log::error('Failed to set rack to Available', [
                'rack_id' => $id,
                'error_message' => $e->getMessage()
            ]);

            return redirect()->back()
                            ->withErrors(['error' => 'An error occurred while setting rack status. Please try again.']);
        }
    }

    /**
     * 设置货架为不可用状态
     *
     * @param int $id 货架ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function setUnavailable($id)
    {
        try {
            $rack = Rack::findOrFail($id);
            $rack->rack_status = 'Unavailable';
            $rack->save();

            Log::info('Rack set to Unavailable', [
                'rack_id' => $rack->id,
                'rack_number' => $rack->rack_number
            ]);

            return redirect()->route('admin.storage_locations.rack.index')
                            ->with('success', 'Rack has been set to unavailable status');
        } catch (\Exception $e) {
            Log::error('Failed to set rack to Unavailable', [
                'rack_id' => $id,
                'error_message' => $e->getMessage()
            ]);

            return redirect()->back()
                            ->withErrors(['error' => 'An error occurred while setting rack status. Please try again.']);
        }
    }
}
