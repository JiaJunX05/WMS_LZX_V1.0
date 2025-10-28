<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Location;
use App\Models\Zone;
use App\Models\Rack;

/**
 * 位置管理控制器 (Location Management Controller)
 *
 * 功能：
 * - 位置数据管理：创建、读取、更新、删除
 * - 位置搜索和分页
 * - 统计数据计算
 *
 * @author WMS Team
 * @version 1.0.0
 */
class LocationController extends Controller
{
    // Constants for better maintainability
    private const MAX_BULK_LOCATIONS = 10;
    private const STATUSES = ['Available', 'Unavailable'];

    // Validation rules
    private const LOCATION_RULES = [
        'zone_id' => 'required|exists:zones,id',
        'rack_id' => 'required|exists:racks,id',
    ];

    private const LOCATION_STATUS_RULES = [
        'location_status' => 'required|in:Available,Unavailable',
    ];

    /**
     * Normalize location data from frontend
     */
    private function normalizeLocationData(array $locationData): array
    {
        // Convert camelCase to snake_case
        if (isset($locationData['zoneId']) && !isset($locationData['zone_id'])) {
            $locationData['zone_id'] = $locationData['zoneId'];
        }
        if (isset($locationData['rackId']) && !isset($locationData['rack_id'])) {
            $locationData['rack_id'] = $locationData['rackId'];
        }
        if (isset($locationData['locationStatus']) && !isset($locationData['location_status'])) {
            $locationData['location_status'] = $locationData['locationStatus'];
        }

        return $locationData;
    }

    /**
     * Handle errors consistently
     */
    private function handleError(Request $request, string $message, \Exception $e = null): \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
    {
        if ($e) {
            // 简化错误信息
            $simplifiedMessage = $this->simplifyErrorMessage($e->getMessage());

            Log::error($message . ': ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            // 使用简化的错误信息
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
     * Simplify database error messages
     */
    private function simplifyErrorMessage(string $errorMessage): ?string
    {
        // 处理重复键错误
        if (strpos($errorMessage, 'Duplicate entry') !== false && strpos($errorMessage, 'locations_zone_id_rack_id_unique') !== false) {
            return 'Location combination already exists. Please choose a different combination.';
        }

        // 处理其他数据库约束错误
        if (strpos($errorMessage, 'Integrity constraint violation') !== false) {
            return 'Data validation failed. Please check your input.';
        }

        return null; // 返回 null 表示不简化，使用原始消息
    }

    /**
     * Log operation for audit trail
     */
    private function logOperation(string $action, array $data = []): void
    {
        Log::info("Location {$action}", array_merge([
            'timestamp' => now()->toISOString(),
            'ip' => request()->ip(),
        ], $data));
    }
    /**
     * 显示位置管理页面
     *
     * @param Request $request
     * @return \Illuminate\View\View|\Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        if ($request->ajax()) {
            try {
                $locations = Location::with(['zone', 'rack'])->get();

                // 計算統計數據
                $totalZones = Zone::where('zone_status', 'Available')->count();
                $totalRacks = Rack::where('rack_status', 'Available')->count();
                $totalLocations = $locations->count();

                return response()->json([
                    'success' => true,
                    'data' => $locations,
                    'total' => $totalLocations,
                    'zones_count' => $totalZones,
                    'racks_count' => $totalRacks,
                    'pagination' => [
                        'current_page' => 1,
                        'last_page' => 1,
                        'per_page' => $totalLocations,
                        'total' => $totalLocations,
                        'from' => 1,
                        'to' => $totalLocations,
                    ]
                ]);
            } catch (\Exception $e) {
                Log::error('Location management error: ' . $e->getMessage());
                return response()->json(['error' => 'Failed to fetch locations'], 500);
            }
        }

        $zones = Zone::where('zone_status', 'Available')->get();
        $racks = Rack::where('rack_status', 'Available')->get();
        $locations = Location::with(['zone', 'rack'])->get();
        return view('admin.location.dashboard', compact('zones', 'racks', 'locations'));
    }

    /**
     * 显示创建位置页面
     *
     * @return \Illuminate\View\View
     */
    public function create()
    {
        $zones = Zone::where('zone_status', 'Available')->get();
        $racks = Rack::where('rack_status', 'Available')->get();
        return view('admin.location.create', compact('zones', 'racks'));
    }

    /**
     * 存储新位置
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        try {
            // 检查是否为批量创建模式
            if ($request->has('locations') && is_array($request->locations)) {
                // 批量创建模式
                $locations = $request->input('locations', []);

                // 限制批量创建数量
                if (count($locations) > self::MAX_BULK_LOCATIONS) {
                    return $this->handleError($request, 'Cannot create more than ' . self::MAX_BULK_LOCATIONS . ' locations at once');
                }

                $validatedData = $request->validate([
                    'locations' => 'required|array|min:1',
                    'locations.*.zone_id' => 'required|exists:zones,id',
                    'locations.*.rack_id' => 'required|exists:racks,id',
                    // 'locations.*.location_status' => 'required|in:Available,Unavailable', // 移除驗證，默認為 Available
                ]);

                $locations = $validatedData['locations'];

                // 预处理：收集所有位置组合进行批量检查
                $locationCombinationsToCheck = [];
                foreach ($locations as $locationData) {
                    $locationData = $this->normalizeLocationData($locationData);
                    $locationCombinationsToCheck[] = [
                        'zone_id' => $locationData['zone_id'],
                        'rack_id' => $locationData['rack_id']
                    ];
                }

                // 批量检查位置组合是否已存在
                $existingLocations = [];
                foreach ($locationCombinationsToCheck as $combination) {
                    $existing = Location::where('zone_id', $combination['zone_id'])
                        ->where('rack_id', $combination['rack_id'])
                        ->first();

                    if ($existing) {
                        $zone = Zone::find($combination['zone_id']);
                        $rack = Rack::find($combination['rack_id']);
                        $existingLocations[] = $zone->zone_name . ' - ' . $rack->rack_number;
                    }
                }

                if (!empty($existingLocations)) {
                    if ($request->ajax()) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Some locations failed to create',
                            'errors' => [
                                'locations' => ['These location combinations already exist: ' . implode(', ', $existingLocations)]
                            ]
                        ], 422);
                    }

                    return back()->withErrors(['locations' => 'These location combinations already exist: ' . implode(', ', $existingLocations)])
                        ->withInput();
                }

                // 批量创建位置记录
                $createdLocations = [];
                foreach ($locations as $locationData) {
                    $locationData = $this->normalizeLocationData($locationData);
                    $location = Location::create([
                        'zone_id' => $locationData['zone_id'],
                        'rack_id' => $locationData['rack_id'],
                        'location_status' => 'Available', // 默認為 Available
                    ]);
                    $createdLocations[] = $location;

                    $this->logOperation('created (batch)', [
                        'location_id' => $location->id,
                        'zone_id' => $locationData['zone_id'],
                        'rack_id' => $locationData['rack_id']
                    ]);
                }

                $count = count($createdLocations);
                $message = "Successfully created {$count} location(s)!";

                if ($request->ajax()) {
                    return response()->json([
                        'success' => true,
                        'message' => $message,
                        'data' => $createdLocations
                    ]);
                }

                return redirect()->route('admin.storage_locations.location.index')
                    ->with('success', $message);

            } else {
                // 单个创建模式
                $rules = array_merge(self::LOCATION_RULES, self::LOCATION_STATUS_RULES);
                $request->validate($rules);

                // 检查位置组合是否已存在
                $existing = Location::where('zone_id', $request->zone_id)
                    ->where('rack_id', $request->rack_id)
                    ->first();

                if ($existing) {
                    $zone = Zone::find($request->zone_id);
                    $rack = Rack::find($request->rack_id);
                    $errorMessage = "Location combination {$zone->zone_name} - {$rack->rack_number} already exists";

                    if ($request->ajax()) {
                        return response()->json([
                            'success' => false,
                            'message' => $errorMessage,
                            'errors' => ['location' => [$errorMessage]]
                        ], 422);
                    }

                    return back()->withErrors(['location' => $errorMessage])->withInput();
                }

                $location = Location::create([
                    'zone_id' => $request->zone_id,
                    'rack_id' => $request->rack_id,
                    'location_status' => 'Available', // 默認為 Available
                ]);

                $this->logOperation('created (single)', [
                    'location_id' => $location->id,
                    'zone_id' => $request->zone_id,
                    'rack_id' => $request->rack_id,
                    'location_status' => $request->location_status
                ]);

                if ($request->ajax()) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Location created successfully!'
                    ]);
                }

                return redirect()->route('admin.storage_locations.location.index')
                    ->with('success', 'Location created successfully!');
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Location validation failed', [
                'errors' => $e->errors()
            ]);

            if ($request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $e->errors()
                ], 422);
            }

            return back()->withErrors($e->errors())->withInput();

        } catch (\Exception $e) {
            return $this->handleError($request, 'Failed to create location(s): ' . $e->getMessage(), $e);
        }
    }

    /**
     * 显示位置详情页面
     *
     * @param int $id
     * @return \Illuminate\View\View
     */
    public function view($id)
    {
        try {
            // 首先检查是否是zoneId
            $zone = Zone::find($id);

            if ($zone) {
                // 如果是zoneId，获取该区域下的所有位置
                $locations = Location::where('zone_id', $id)->with(['zone', 'rack'])->get();
                $zones = Zone::where('zone_status', 'Available')->get();
                $racks = Rack::where('rack_status', 'Available')->get();

                return view('admin.location.view', compact('locations', 'zones', 'racks', 'zone'));
            }

            // 如果不是zoneId，检查是否是locationId
            $location = Location::with(['zone', 'rack'])->find($id);

            if ($location) {
                $zones = Zone::where('zone_status', 'Available')->get();
                $racks = Rack::where('rack_status', 'Available')->get();
                return view('admin.location.view', compact('location', 'zones', 'racks'));
            }

            // 如果既不是zone也不是location，返回404
            abort(404, 'Zone or location not found');

        } catch (\Exception $e) {
            Log::error('Failed to load view form: ' . $e->getMessage(), [
                'id' => $id,
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('admin.storage_locations.location.index')
                ->with('error', 'Failed to load view form');
        }
    }

    /**
     * 显示编辑位置页面
     *
     * @param int $id
     * @return \Illuminate\View\View
     */
    public function edit($id)
    {
        try {
            $location = Location::with(['zone', 'rack'])->findOrFail($id);
            $zones = Zone::where('zone_status', 'Available')->get();
            $racks = Rack::where('rack_status', 'Available')->get();

            return view('admin.location.update', compact('location', 'zones', 'racks'));
        } catch (\Exception $e) {
            Log::error('Failed to load edit form: ' . $e->getMessage(), [
                'id' => $id,
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('admin.storage_locations.location.index')
                ->with('error', 'Failed to load edit form');
        }
    }

    /**
     * 更新位置信息
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        try {
            $location = Location::findOrFail($id);

            Log::info('Update request received', [
                'id' => $id,
                'request_data' => $request->all(),
                'is_ajax' => request()->ajax()
            ]);

            // 验证请求数据
            $rules = array_merge(self::LOCATION_RULES, self::LOCATION_STATUS_RULES);
            $validatedData = $request->validate($rules);

            // 检查位置组合是否已存在（排除当前记录）
            $existingLocation = Location::where('zone_id', $validatedData['zone_id'])
                ->where('rack_id', $validatedData['rack_id'])
                ->where('id', '!=', $id)
                ->first();

            if ($existingLocation) {
                $zone = Zone::find($validatedData['zone_id']);
                $rack = Rack::find($validatedData['rack_id']);
                $message = "Location combination {$zone->zone_name} - {$rack->rack_number} already exists";

                if ($request->ajax()) {
                    return response()->json([
                        'success' => false,
                        'message' => $message,
                        'errors' => [
                            'location' => [$message]
                        ]
                    ], 422);
                }

                return back()->withErrors(['location' => $message])->withInput();
            }

            // 更新位置记录
            $location->update([
                'zone_id' => $validatedData['zone_id'],
                'rack_id' => $validatedData['rack_id'],
                'location_status' => $validatedData['location_status'],
            ]);

            $this->logOperation('updated', [
                'location_id' => $id,
                'zone_id' => $validatedData['zone_id'],
                'rack_id' => $validatedData['rack_id'],
                'location_status' => $validatedData['location_status']
            ]);

            $message = 'Location updated successfully';

            if ($request->ajax()) {
                $freshLocation = $location->fresh(['zone', 'rack']);
                Log::info('AJAX response data', [
                    'success' => true,
                    'message' => $message,
                    'data' => $freshLocation
                ]);

                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $freshLocation
                ]);
            }

            return redirect()->route('admin.storage_locations.location.index')
                ->with('success', $message);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Location update validation failed', [
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
            return $this->handleError($request, 'Failed to update location: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 设置位置为可用状态
     *
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
     */
    public function setAvailable($id)
    {
        try {
            Log::info('setAvailable called', ['id' => $id, 'is_ajax' => request()->ajax()]);

            $location = Location::findOrFail($id);
            $location->update(['location_status' => 'Available']);

            $this->logOperation('set to available', ['location_id' => $id]);

            $message = 'Location has been set to available status';

            if (request()->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $location->fresh()
                ]);
            }

            return redirect()->route('admin.storage_locations.location.index')
                ->with('success', $message);

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to set location available: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 设置位置为不可用状态
     *
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
     */
    public function setUnavailable($id)
    {
        try {
            Log::info('setUnavailable called', ['id' => $id, 'is_ajax' => request()->ajax()]);

            $location = Location::findOrFail($id);
            $location->update(['location_status' => 'Unavailable']);

            $this->logOperation('set to unavailable', ['location_id' => $id]);

            $message = 'Location has been set to unavailable status';

            if (request()->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $location->fresh()
                ]);
            }

            return redirect()->route('admin.storage_locations.location.index')
                ->with('success', $message);

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to set location unavailable: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 删除位置
     *
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $location = Location::findOrFail($id);
            $location->delete();

            $this->logOperation('deleted', ['location_id' => $id]);

            if (request()->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Location deleted successfully!'
                ]);
            }

            return redirect()->route('admin.storage_locations.location.index')
                ->with('success', 'Location deleted successfully!');

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to delete location: ' . $e->getMessage(), $e);
        }
    }
}
