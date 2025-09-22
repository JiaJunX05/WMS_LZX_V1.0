<?php

namespace App\Http\Controllers\Admin\StorageLocations;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\StorageLocations\Zone;
use App\Models\StorageLocations\Rack;
use App\Models\StorageLocations\Location;

/**
 * 位置管理控制器
 *
 * 功能模块：
 * - 位置列表展示：搜索、分页
 * - 位置操作：创建、编辑、删除
 * - 区域和货架关联管理
 *
 * @author WMS Team
 * @version 1.0.0
 */
class LocationController extends Controller
{
    /**
     * 位置列表页面
     *
     * @param Request $request HTTP请求对象
     * @return \Illuminate\View\View|\Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // 如果是 AJAX 请求，返回 JSON 数据
        if ($request->ajax()) {
            try {
                $query = Location::with(['zone', 'rack']);

                // 分页参数
                $perPage = $request->input('perPage', 10);
                $page = $request->input('page', 1);

                // 获取分页数据
                $locations = $query->paginate($perPage, ['*'], 'page', $page);

                // 计算分页显示信息
                $total = $locations->total();
                $start = $total > 0 ? ($locations->currentPage() - 1) * $perPage + 1 : 0;
                $end = min($start + $perPage - 1, $total);

                // 返回 JSON 响应
                return response()->json([
                    'data' => $locations->items(),
                    'current_page' => $locations->currentPage(),
                    'last_page' => $locations->lastPage(),
                    'total' => $total,
                    'per_page' => $perPage,
                    'from' => $start,
                    'to' => $end,
                    'pagination' => [
                        'current_page' => $locations->currentPage(),
                        'last_page' => $locations->lastPage(),
                        'from' => $start,
                        'to' => $end,
                        'total' => $total,
                        'per_page' => $perPage,
                        'total_pages' => $locations->lastPage(),
                    ],
                ]);
            } catch (\Exception $e) {
                Log::error('Location index error: ' . $e->getMessage());
                return response()->json(['error' => 'Failed to load locations'], 500);
            }
        }

        // 非 AJAX 请求，返回视图
        try {
            $zones = Zone::where('zone_status', 'Available')->get();
            $racks = Rack::where('rack_status', 'Available')->get();
            return view('admin.storage_locations.location.dashboard', compact('zones', 'racks'));
        } catch (\Exception $e) {
            Log::error('Location dashboard error: ' . $e->getMessage());
            return redirect()->back()
                            ->withErrors(['error' => 'Failed to load location dashboard']);
        }
    }

    /**
     * 显示创建位置表单
     *
     * @return \Illuminate\View\View
     */
    public function create()
    {
        try {
            // 只获取状态为 Available 的 Zone 和 Rack
            $zones = Zone::where('zone_status', 'Available')->get();
            $racks = Rack::where('rack_status', 'Available')->get();

            return view('admin.storage_locations.location.create', compact('zones', 'racks'));
        } catch (\Exception $e) {
            Log::error('Location create form error: ' . $e->getMessage());
            return redirect()->route('admin.storage_locations.location.index')
                            ->withErrors(['error' => 'Failed to load create form']);
        }
    }

    /**
     * 存储新位置
     *
     * @param Request $request HTTP请求对象
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        try {
            // 验证输入数据
            $request->validate([
                'zone_id' => 'required|exists:zones,id',
                'rack_id' => 'required|exists:racks,id',
            ]);

            // 检查是否已经存在相同的组合
            $exists = Location::where('zone_id', $request->zone_id)
                            ->where('rack_id', $request->rack_id)
                            ->exists();

            if ($exists) {
                return redirect()->back()
                                ->withErrors(['error' => 'This Zone and Rack combination already exists.']);
            }

            // 检查该 zone 是否已经关联了 10 个 rack
            $rackCount = Location::where('zone_id', $request->zone_id)->count();
            if ($rackCount >= 10) {
                return redirect()->back()
                                ->withErrors(['error' => 'A zone can only have a maximum of 10 racks.']);
            }

            // 创建位置记录
            $location = Location::create([
                'zone_id' => $request->zone_id,
                'rack_id' => $request->rack_id,
            ]);

            return redirect()->route('admin.storage_locations.location.index')
                            ->with('success', 'Storage location created successfully');
        } catch (\Exception $e) {
            Log::error('Location store error: ' . $e->getMessage());
            return redirect()->back()
                            ->withInput()
                            ->withErrors(['error' => 'Failed to create storage location']);
        }
    }

    /**
     * 显示编辑位置表单
     *
     * @param int $id 位置ID
     * @return \Illuminate\View\View|\Illuminate\Http\RedirectResponse
     */
    public function edit($id)
    {
        try {
            $location = Location::findOrFail($id);

            // 只获取状态为 Available 的 Zone 和 Rack，以及当前已选择的 Zone 和 Rack
            $zones = Zone::where(function($query) use ($location) {
                $query->where('zone_status', 'Available')
                      ->orWhere('id', $location->zone_id);
            })->get();

            $racks = Rack::where(function($query) use ($location) {
                $query->where('rack_status', 'Available')
                      ->orWhere('id', $location->rack_id);
            })->get();

            return view('admin.storage_locations.location.update', compact('location', 'zones', 'racks'));
        } catch (\Exception $e) {
            Log::error('Location edit form error: ' . $e->getMessage());
            return redirect()->route('admin.storage_locations.location.index')
                            ->withErrors(['error' => 'Location not found or failed to load edit form']);
        }
    }

    /**
     * 更新位置信息
     *
     * @param Request $request HTTP请求对象
     * @param int $id 位置ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        try {
            // 验证输入数据
            $request->validate([
                'zone_id' => 'required|exists:zones,id',
                'rack_id' => 'required|exists:racks,id',
            ]);

            $location = Location::findOrFail($id);

            // 检查是否已经存在相同的组合
            $exists = Location::where('zone_id', $request->zone_id)
                            ->where('rack_id', $request->rack_id)
                            ->where('id', '!=', $id)
                            ->exists();

            if ($exists) {
                return redirect()->back()
                                ->withErrors(['error' => 'This Zone and Rack combination already exists.']);
            }

            // 如果 zone_id 发生变化，检查新的 zone 是否已经关联了 10 个 rack
            if ($location->zone_id != $request->zone_id) {
                $rackCount = Location::where('zone_id', $request->zone_id)->count();
                if ($rackCount >= 10) {
                    return redirect()->back()
                                    ->withErrors(['error' => 'A zone can only have a maximum of 10 racks.']);
                }
            }

            // 更新位置信息
            $location->zone_id = $request->zone_id;
            $location->rack_id = $request->rack_id;
            $location->save();

            return redirect()->route('admin.storage_locations.location.index')
                            ->with('success', 'Storage location updated successfully');
        } catch (\Exception $e) {
            Log::error('Location update error: ' . $e->getMessage());
            return redirect()->back()
                            ->withInput()
                            ->withErrors(['error' => 'Failed to update storage location']);
        }
    }

    /**
     * 删除位置
     *
     * @param int $id 位置ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        try {
            $location = Location::findOrFail($id);

            // 检查是否有关联的产品
            if ($location->zone->products()->exists() || $location->rack->products()->exists()) {
                return redirect()->back()
                                ->withErrors(['error' => 'Cannot delete this location because products are still linked to its zone or rack.']);
            }

            // 删除位置记录
            $location->delete();

            return redirect()->route('admin.storage_locations.location.index')
                            ->with('success', 'Storage location deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Location destroy error: ' . $e->getMessage());
            return redirect()->back()
                            ->withErrors(['error' => 'Failed to delete storage location: ' . $e->getMessage()]);
        }
    }
}

