<?php

namespace App\Http\Controllers\Admin\StorageLocations;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\StorageLocations\Zone;

/**
 * 区域管理控制器
 *
 * 功能模块：
 * - 区域列表展示：搜索、筛选、分页
 * - 区域操作：创建、编辑、删除、状态管理
 * - 图片管理：上传、更新、删除
 *
 * @author WMS Team
 * @version 1.0.0
 */
class ZoneController extends Controller
{
    /**
     * 区域列表页面
     *
     * @param Request $request HTTP请求对象
     * @return \Illuminate\View\View|\Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // 如果是 AJAX 请求，返回 JSON 数据
        if ($request->ajax()) {
            try {
                $query = Zone::query();

                // 搜索条件：区域名称或位置
                if ($request->filled('search')) {
                    $search = $request->input('search');
                    $query->where(function ($query) use ($search) {
                        $query->where('zone_name', 'like', "%$search%")
                              ->orWhere('location', 'like', "%$search%");
                    });
                }

                // 根据区域ID筛选
                if ($request->filled('zone_id')) {
                    $query->where('id', $request->input('zone_id'));
                }

                // 根据区域状态筛选
                if ($request->filled('zone_status')) {
                    $query->where('zone_status', $request->input('zone_status'));
                }

                // 分页设置
                $perPage = $request->input('perPage', 10);
                $zones = $query->paginate($perPage);

                // 返回分页数据
                return response()->json([
                    'data' => $zones->map(function ($zone) {
                        return [
                            'id' => $zone->id,
                            'zone_name' => $zone->zone_name,
                            'location' => $zone->location,
                            'zone_status' => $zone->zone_status,
                            'zone_image' => $zone->zone_image,
                        ];
                    }),
                    'pagination' => [
                        'current_page' => $zones->currentPage(),
                        'last_page' => $zones->lastPage(),
                        'total' => $zones->total(),
                        'per_page' => $zones->perPage(),
                        'from' => $zones->firstItem(),
                        'to' => $zones->lastItem(),
                    ],
                ]);
            } catch (\Exception $e) {
                Log::error('Zone management error: ' . $e->getMessage());
                return response()->json(['error' => 'Failed to fetch zones'], 500);
            }
        }

        // 如果不是 AJAX 请求，返回视图
        $zones = Zone::all();
        return view('admin.storage_locations.zone.dashboard', compact('zones'));
    }

    /**
     * 显示创建区域表单
     *
     * @return \Illuminate\View\View
     */
    public function create()
    {
        return view('admin.storage_locations.zone.create');
    }

    /**
     * 存储新区域
     *
     * @param Request $request HTTP请求对象
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        try {
            // 验证请求数据
            $request->validate([
                'zone_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'zone_name' => 'required|string|max:255|unique:zones',
                'location' => 'required|string|max:255',
                'zone_status' => 'required|in:Available,Unavailable',
            ]);

            // 处理图片上传（如果有的话）
            $zoneImagePath = null;
            if ($request->hasFile('zone_image')) {
                $image = $request->file('zone_image');
                $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $directory = public_path('assets/images/zones');

                // 确保目录存在
                if (!file_exists($directory)) {
                    mkdir($directory, 0777, true);
                }

                // 移动图片到指定目录
                $image->move($directory, $imageName);
                $zoneImagePath = 'zones/' . $imageName;
            }

            // 创建区域记录
            $zone = Zone::create([
                'zone_image' => $zoneImagePath,
                'zone_name' => $request->zone_name,
                'location' => $request->location,
                'zone_status' => $request->zone_status ?? 'Available',
            ]);

            return redirect()->route('admin.storage_locations.zone.index')
                            ->with('success', 'Zone created successfully');
        } catch (\Exception $e) {
            Log::error('Zone creation error: ' . $e->getMessage());

            // 如果出错，删除已上传的图片
            if (isset($imageName) && file_exists($directory . '/' . $imageName)) {
                unlink($directory . '/' . $imageName);
            }

            return redirect()->back()
                            ->withInput()
                            ->withErrors(['error' => 'Zone creation failed: ' . $e->getMessage()]);
        }
    }

    /**
     * 显示编辑区域表单
     *
     * @param int $id 区域ID
     * @return \Illuminate\View\View
     */
    public function edit($id)
    {
        $zone = Zone::findOrFail($id);
        return view('admin.storage_locations.zone.update', compact('zone'));
    }

    /**
     * 更新区域信息
     *
     * @param Request $request HTTP请求对象
     * @param int $id 区域ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        try {
            // 验证请求数据
            $request->validate([
                'zone_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'zone_name' => 'required|string|max:255|unique:zones,zone_name,' . $id,
                'location' => 'required|string|max:255',
                'zone_status' => 'required|in:Available,Unavailable',
            ]);

            $zone = Zone::findOrFail($id);

            if (!$zone) {
                return redirect()->back()
                                ->withErrors(['error' => 'Zone not found']);
            }

            // 处理图片更新
            if ($request->hasFile('zone_image')) {
                // 删除旧图片
                if ($zone->zone_image) {
                    $imagePath = public_path('assets/images/' . $zone->zone_image);
                    if (file_exists($imagePath)) {
                        unlink($imagePath);
                    }
                }

                // 处理新图片上传
                $image = $request->file('zone_image');
                $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $directory = public_path('assets/images/zones');

                if (!file_exists($directory)) {
                    mkdir($directory, 0777, true);
                }

                $image->move($directory, $imageName);
                $zone->zone_image = 'zones/' . $imageName;
            }

            // 更新区域信息
            $zone->zone_name = $request->zone_name;
            $zone->location = $request->location;
            $zone->zone_status = $request->zone_status ?? 'Available';
            $zone->save();

            return redirect()->route('admin.storage_locations.zone.index')
                            ->with('success', 'Zone updated successfully');
        } catch (\Exception $e) {
            Log::error('Zone update error: ' . $e->getMessage());
            return redirect()->back()
                            ->withInput()
                            ->withErrors(['error' => 'Zone update failed: ' . $e->getMessage()]);
        }
    }

    /**
     * 删除区域
     *
     * @param int $id 区域ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        try {
            $zone = Zone::findOrFail($id);

            // 检查是否有关联的存储位置
            if ($zone->locations()->exists()) {
                return redirect()->back()
                                ->withErrors(['error' => 'Cannot delete this zone because storage locations are still linked to it.']);
            }

            // 删除图片文件
            if ($zone->zone_image) {
                $imagePath = public_path('assets/images/' . $zone->zone_image);
                if (file_exists($imagePath)) {
                    unlink($imagePath);
                }
            }

            // 删除数据库记录
            $zone->delete();

            return redirect()->route('admin.storage_locations.zone.index')
                            ->with('success', 'Zone deleted successfully');
        } catch (\Exception $e) {
            Log::error('Zone deletion error: ' . $e->getMessage());
            return redirect()->back()
                            ->withErrors(['error' => 'Failed to delete zone: ' . $e->getMessage()]);
        }
    }

    /**
     * 设置区域为可用状态
     *
     * @param int $id 区域ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function setAvailable($id)
    {
        try {
            $zone = Zone::findOrFail($id);
            $zone->zone_status = 'Available';
            $zone->save();

            Log::info('Zone set to Available', [
                'zone_id' => $zone->id,
                'zone_name' => $zone->zone_name
            ]);

            return redirect()->route('admin.storage_locations.zone.index')
                            ->with('success', 'Zone has been set to available status');
        } catch (\Exception $e) {
            Log::error('Failed to set zone to Available', [
                'zone_id' => $id,
                'error_message' => $e->getMessage()
            ]);

            return redirect()->back()
                            ->withErrors(['error' => 'An error occurred while setting zone status. Please try again.']);
        }
    }

    /**
     * 设置区域为不可用状态
     *
     * @param int $id 区域ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function setUnavailable($id)
    {
        try {
            $zone = Zone::findOrFail($id);
            $zone->zone_status = 'Unavailable';
            $zone->save();

            Log::info('Zone set to Unavailable', [
                'zone_id' => $zone->id,
                'zone_name' => $zone->zone_name
            ]);

            return redirect()->route('admin.storage_locations.zone.index')
                            ->with('success', 'Zone has been set to unavailable status');
        } catch (\Exception $e) {
            Log::error('Failed to set zone to Unavailable', [
                'zone_id' => $id,
                'error_message' => $e->getMessage()
            ]);

            return redirect()->back()
                            ->withErrors(['error' => 'An error occurred while setting zone status. Please try again.']);
        }
    }
}
