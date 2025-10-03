<?php

namespace App\Http\Controllers\Admin\StorageLocation;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\StorageLocation\Zone;

class ZoneController extends Controller
{
    public function index(Request $request)
    {
        if ($request->ajax()) {
            try {
                $query = Zone::query();

                if ($request->has('search') && $request->search) {
                    $search = $request->search;
                    $query->where(function($q) use ($search) {
                        $q->where('zone_name', 'like', "%{$search}%")
                          ->orWhere('location', 'like', "%{$search}%");
                    });
                }

                if ($request->has('status_filter') && $request->status_filter) {
                    $query->where('zone_status', $request->status_filter);
                }

                $zones = $query->paginate(10);

                return response()->json([
                    'success' => true,
                    'data' => $zones->items(),
                    'pagination' => [
                        'current_page' => $zones->currentPage(),
                        'last_page' => $zones->lastPage(),
                        'per_page' => $zones->perPage(),
                        'total' => $zones->total(),
                        'from' => $zones->firstItem(),
                        'to' => $zones->lastItem(),
                    ]
                ]);
            } catch (\Exception $e) {
                Log::error('Zone management error: ' . $e->getMessage());
                return response()->json(['error' => 'Failed to fetch zones'], 500);
            }
        }

        return view('admin.storage.zones.dashboard');
    }

    public function create()
    {
        return view('admin.storage.zones.create');
    }

    /**
     * 存储新区域
     */
    public function store(Request $request)
    {
        // 与 CategoryController 的实现保持一致：有数组走批量，否则走单个
        if ($request->has('zones') && is_array($request->input('zones'))) {
            return $this->storeMultipleZones($request);
        }

        return $this->storeSingleZone($request);
    }

    /**
     * 单个存储区域
     */
    private function storeSingleZone(Request $request)
    {
        // 校验
        $request->validate([
            'zone_name' => 'required|string|max:255|unique:zones,zone_name',
            'location' => 'required|string|max:255',
            'zone_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'zone_status' => 'required|in:Available,Unavailable',
        ]);

        try {
            $zoneData = [
                'zone_name' => $request->input('zone_name') ?? $request->input('zoneName'),
                'location' => $request->input('location'),
                'zone_status' => $request->input('zone_status') ?? $request->input('zoneStatus'),
            ];

            // 处理文件上传
            if ($request->hasFile('zone_image')) {
                // 文件上传（确保目录存在）
                $image = $request->file('zone_image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $directory = public_path('assets/images/zones');
                if (!file_exists($directory)) {
                    mkdir($directory, 0777, true);
                }
                $image->move($directory, $imageName);
                $zoneData['zone_image'] = 'zones/' . $imageName;
            }

            $zone = Zone::create($zoneData);

            Log::info('Zone created successfully (single)', [
                'zone_id' => $zone->id,
                'zone_name' => $zoneData['zone_name']
            ]);

            $message = 'Zone created successfully!';

            if ($request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $zone
                ]);
            }

            return redirect()->route('admin.storage_locations.zone.index')
                ->with('success', $message);

        } catch (\Exception $e) {
            Log::error('Zone creation failed (single): ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            if ($request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create zone: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to create zone: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * 批量存储区域（统一入口）
     */
    private function storeMultipleZones(Request $request)
    {
        // 仅处理批量数组
        $zones = $request->input('zones', []);
        $createdZones = [];
        $errors = [];

        foreach ($zones as $index => $zoneData) {

            // 兼容前端字段命名（camelCase -> snake_case）
            // 前端：zoneName / zoneStatus
            // 后端期望：zone_name / zone_status
            if (isset($zoneData['zoneName']) && !isset($zoneData['zone_name'])) {
                $zoneData['zone_name'] = $zoneData['zoneName'];
            }
            if (isset($zoneData['zoneStatus']) && !isset($zoneData['zone_status'])) {
                $zoneData['zone_status'] = $zoneData['zoneStatus'];
            }

            $validator = \Validator::make($zoneData, [
                'zone_name' => 'required|string|max:255',
                'location' => 'required|string|max:255',
                'zone_status' => 'required|in:Available,Unavailable',
            ]);

            if ($validator->fails()) {
                $errors[] = "Zone " . ($index + 1) . ": " . implode(', ', $validator->errors()->all());
                continue;
            }

            // 检查区域名称是否已存在
            $existingZone = Zone::where('zone_name', $zoneData['zone_name'])->first();

            if ($existingZone) {
                $errors[] = "Zone " . ($index + 1) . ": Zone name '{$zoneData['zone_name']}' already exists";
                continue;
            }

            try {
                $zoneRecord = [
                    'zone_name' => $zoneData['zone_name'],
                    'location' => $zoneData['location'],
                    'zone_status' => $zoneData['zone_status'],
                ];

                // 处理图片上传 - 使用文件数组
                $files = $request->file('images');
                if (is_array($files) && isset($files[$index]) && $files[$index] && $files[$index]->isValid()) {
                    $image = $files[$index];
                    $directory = public_path('assets/images/zones');
                    if (!file_exists($directory)) {
                        mkdir($directory, 0777, true);
                    }
                    $imageName = time() . '_' . $index . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                    $image->move($directory, $imageName);
                    $zoneRecord['zone_image'] = 'zones/' . $imageName;
                }

                $zone = Zone::create($zoneRecord);
                $createdZones[] = $zone;
            } catch (\Exception $e) {
                $errors[] = "Zone " . ($index + 1) . ": " . $e->getMessage();
            }
        }

        if ($request->ajax()) {
            if (count($errors) > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some zones failed to create',
                    'errors' => $errors,
                    'created_count' => count($createdZones)
                ], 422);
            } else {
                return response()->json([
                    'success' => true,
                    'message' => count($createdZones) . ' zones created successfully',
                    'data' => $createdZones
                ]);
            }
        }

        if (count($errors) > 0) {
            return back()->withErrors(['error' => implode('; ', $errors)])
                ->withInput();
        }

        return redirect()->route('admin.storage_locations.zone.index')
            ->with('success', count($createdZones) . ' zones created successfully');
    }

    public function edit($id)
    {
        $zone = Zone::findOrFail($id);
        return view('admin.storage.zones.update', compact('zone'));
    }

    public function update(Request $request, $id)
    {
        $zone = Zone::findOrFail($id);

        $request->validate([
            'zone_name' => 'required|string|max:255|unique:zones,zone_name,' . $id,
            'location' => 'required|string|max:255',
            'zone_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'zone_status' => 'required|in:Available,Unavailable',
        ]);

        try {
            $zoneData = [
                'zone_name' => $request->zone_name,
                'location' => $request->location,
                'zone_status' => $request->zone_status,
            ];

            if ($request->hasFile('zone_image')) {
                if ($zone->zone_image && file_exists(public_path('assets/images/' . $zone->zone_image))) {
                    unlink(public_path('assets/images/' . $zone->zone_image));
                }

                $image = $request->file('zone_image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $image->move(public_path('assets/images/zones'), $imageName);
                $zoneData['zone_image'] = 'zones/' . $imageName;
            }

            $zone->update($zoneData);

            Log::info('Zone updated successfully', ['zone_id' => $id, 'zone_name' => $request->zone_name]);

            // 返回 JSON 响应
            if ($request->ajax() || $request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Zone updated successfully!',
                    'data' => $zone
                ]);
            }

            return redirect()->route('admin.storage_locations.zone.index')
                ->with('success', 'Zone updated successfully!');

        } catch (\Exception $e) {
            Log::error('Zone update failed: ' . $e->getMessage());

            // 返回 JSON 错误响应
            if ($request->ajax() || $request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to update zone: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to update zone: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function setAvailable($id)
    {
        try {
            $zone = Zone::findOrFail($id);
            $zone->update(['zone_status' => 'Available']);

            Log::info('Zone set to available', ['zone_id' => $id]);

            // 返回 JSON 响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Zone has been set to available status',
                    'data' => $zone
                ]);
            }

            return redirect()->route('admin.storage_locations.zone.index')
                ->with('success', 'Zone has been set to available status');

        } catch (\Exception $e) {
            Log::error('Failed to set zone available: ' . $e->getMessage());

            // 返回 JSON 错误响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to set zone available: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to set zone available: ' . $e->getMessage()]);
        }
    }

    public function setUnavailable($id)
    {
        try {
            $zone = Zone::findOrFail($id);
            $zone->update(['zone_status' => 'Unavailable']);

            Log::info('Zone set to unavailable', ['zone_id' => $id]);

            // 返回 JSON 响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Zone has been set to unavailable status',
                    'data' => $zone
                ]);
            }

            return redirect()->route('admin.storage_locations.zone.index')
                ->with('success', 'Zone has been set to unavailable status');

        } catch (\Exception $e) {
            Log::error('Failed to set zone unavailable: ' . $e->getMessage());

            // 返回 JSON 错误响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to set zone unavailable: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to set zone unavailable: ' . $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        try {
            $zone = Zone::findOrFail($id);

            if ($zone->zone_image && file_exists(public_path('assets/images/' . $zone->zone_image))) {
                unlink(public_path('assets/images/' . $zone->zone_image));
            }

            $zone->delete();

            Log::info('Zone deleted successfully', ['zone_id' => $id]);

            // 返回 JSON 响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Zone deleted successfully!',
                    'data' => [
                        'id' => $id,
                        'name' => $zone->zone_name
                    ]
                ]);
            }

            return redirect()->route('admin.storage_locations.zone.index')
                ->with('success', 'Zone deleted successfully!');

        } catch (\Exception $e) {
            Log::error('Zone deletion failed: ' . $e->getMessage());

            // 返回 JSON 错误响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to delete zone: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to delete zone: ' . $e->getMessage()]);
        }
    }
}
