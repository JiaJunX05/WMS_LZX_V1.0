<?php

namespace App\Http\Controllers\Admin\StorageLocation;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\StorageLocation\Rack;

class RackController extends Controller
{
    public function index(Request $request)
    {
        if ($request->ajax()) {
            try {
                $query = Rack::query();

                if ($request->has('search') && $request->search) {
                    $search = $request->search;
                    $query->where(function($q) use ($search) {
                        $q->where('rack_number', 'like', "%{$search}%");
                    });
                }

                if ($request->has('status_filter') && $request->status_filter) {
                    $query->where('rack_status', $request->status_filter);
                }

                $racks = $query->paginate(10);

                return response()->json([
                    'success' => true,
                    'data' => $racks->items(),
                    'pagination' => [
                        'current_page' => $racks->currentPage(),
                        'last_page' => $racks->lastPage(),
                        'per_page' => $racks->perPage(),
                        'total' => $racks->total(),
                        'from' => $racks->firstItem(),
                        'to' => $racks->lastItem(),
                    ]
                ]);
            } catch (\Exception $e) {
                Log::error('Rack management error: ' . $e->getMessage());
                return response()->json(['error' => 'Failed to fetch racks'], 500);
            }
        }

        return view('admin.storage.racks.dashboard');
    }

    public function create()
    {
        return view('admin.storage.racks.create');
    }

    /**
     * 存储新货架
     */
    public function store(Request $request)
    {
        // 与 CategoryController 的实现保持一致：有数组走批量，否则走单个
        if ($request->has('racks') && is_array($request->input('racks'))) {
            return $this->storeMultipleRacks($request);
        }

        return $this->storeSingleRack($request);
    }

    /**
     * 单个存储货架
     */
    private function storeSingleRack(Request $request)
    {
        // 校验
        $request->validate([
            'rack_number' => 'required|string|max:255|unique:racks,rack_number',
            'capacity' => 'nullable|integer|min:1',
            'rack_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'rack_status' => 'required|in:Available,Unavailable',
        ]);

        try {
            $rackData = [
                'rack_number' => $request->input('rack_number') ?? $request->input('rackNumber'),
                'capacity' => $request->input('capacity') ?: 50, // 使用默认值50如果为空或0
                'rack_status' => $request->input('rack_status') ?? $request->input('rackStatus'),
            ];

            // 处理文件上传
            if ($request->hasFile('rack_image')) {
                // 文件上传（确保目录存在）
                $image = $request->file('rack_image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $directory = public_path('assets/images/racks');
                if (!file_exists($directory)) {
                    mkdir($directory, 0777, true);
                }
                $image->move($directory, $imageName);
                $rackData['rack_image'] = 'racks/' . $imageName;
            }

            $rack = Rack::create($rackData);

            Log::info('Rack created successfully (single)', [
                'rack_id' => $rack->id,
                'rack_number' => $rackData['rack_number']
            ]);

            $message = 'Rack created successfully!';

            if ($request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $rack
                ]);
            }

            return redirect()->route('admin.storage_locations.rack.index')
                ->with('success', $message);

        } catch (\Exception $e) {
            Log::error('Rack creation failed (single): ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            if ($request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create rack: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to create rack: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * 批量存储货架（统一入口）
     */
    private function storeMultipleRacks(Request $request)
    {
        // 仅处理批量数组
        $racks = $request->input('racks', []);
        $createdRacks = [];
        $errors = [];

        foreach ($racks as $index => $rackData) {

            // 兼容前端字段命名（camelCase -> snake_case）
            // 前端：rackNumber / rackStatus
            // 后端期望：rack_number / rack_status
            if (isset($rackData['rackNumber']) && !isset($rackData['rack_number'])) {
                $rackData['rack_number'] = $rackData['rackNumber'];
            }
            if (isset($rackData['rackStatus']) && !isset($rackData['rack_status'])) {
                $rackData['rack_status'] = $rackData['rackStatus'];
            }

            $validator = \Validator::make($rackData, [
                'rack_number' => 'required|string|max:255',
                'capacity' => 'nullable|integer|min:1',
                'rack_status' => 'required|in:Available,Unavailable',
            ]);

            if ($validator->fails()) {
                $errors[] = "Rack " . ($index + 1) . ": " . implode(', ', $validator->errors()->all());
                continue;
            }

            // 检查货架编号是否已存在
            $existingRack = Rack::where('rack_number', $rackData['rack_number'])->first();

            if ($existingRack) {
                $errors[] = "Rack " . ($index + 1) . ": Rack number '{$rackData['rack_number']}' already exists";
                continue;
            }

            try {
                $rackRecord = [
                    'rack_number' => $rackData['rack_number'],
                    'capacity' => $rackData['capacity'] ?? 50, // 使用默认值50如果为空
                    'rack_status' => $rackData['rack_status'],
                ];

                // 处理图片上传 - 使用文件数组
                $files = $request->file('images');
                if (is_array($files) && isset($files[$index]) && $files[$index] && $files[$index]->isValid()) {
                    $image = $files[$index];
                    $directory = public_path('assets/images/racks');
                    if (!file_exists($directory)) {
                        mkdir($directory, 0777, true);
                    }
                    $imageName = time() . '_' . $index . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                    $image->move($directory, $imageName);
                    $rackRecord['rack_image'] = 'racks/' . $imageName;
                }

                $rack = Rack::create($rackRecord);
                $createdRacks[] = $rack;
            } catch (\Exception $e) {
                $errors[] = "Rack " . ($index + 1) . ": " . $e->getMessage();
            }
        }

        if ($request->ajax()) {
            if (count($errors) > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some racks failed to create',
                    'errors' => $errors,
                    'created_count' => count($createdRacks)
                ], 422);
            } else {
                return response()->json([
                    'success' => true,
                    'message' => count($createdRacks) . ' racks created successfully',
                    'data' => $createdRacks
                ]);
            }
        }

        if (count($errors) > 0) {
            return back()->withErrors(['error' => implode('; ', $errors)])
                ->withInput();
        }

        return redirect()->route('admin.storage_locations.rack.index')
            ->with('success', count($createdRacks) . ' racks created successfully');
    }

    public function edit($id)
    {
        $rack = Rack::findOrFail($id);
        return view('admin.storage.racks.update', compact('rack'));
    }

    public function update(Request $request, $id)
    {
        $rack = Rack::findOrFail($id);

        $request->validate([
            'rack_number' => 'required|string|max:255|unique:racks,rack_number,' . $id,
            'capacity' => 'required|integer|min:1',
            'rack_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'rack_status' => 'required|in:Available,Unavailable',
        ]);

        try {
            $rackData = [
                'rack_number' => $request->rack_number,
                'capacity' => $request->capacity ?: 50, // 使用默认值50如果为空或0
                'rack_status' => $request->rack_status,
            ];

            if ($request->hasFile('rack_image')) {
                if ($rack->rack_image && file_exists(public_path('assets/images/' . $rack->rack_image))) {
                    unlink(public_path('assets/images/' . $rack->rack_image));
                }

                $image = $request->file('rack_image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $image->move(public_path('assets/images/racks'), $imageName);
                $rackData['rack_image'] = 'racks/' . $imageName;
            }

            $rack->update($rackData);

            Log::info('Rack updated successfully', ['rack_id' => $id, 'rack_number' => $request->rack_number]);

            // 返回 JSON 响应
            if ($request->ajax() || $request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Rack updated successfully!',
                    'data' => $rack
                ]);
            }

            return redirect()->route('admin.storage_locations.rack.index')
                ->with('success', 'Rack updated successfully!');

        } catch (\Exception $e) {
            Log::error('Rack update failed: ' . $e->getMessage());

            // 返回 JSON 错误响应
            if ($request->ajax() || $request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to update rack: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to update rack: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function setAvailable($id)
    {
        try {
            $rack = Rack::findOrFail($id);
            $rack->update(['rack_status' => 'Available']);

            Log::info('Rack set to available', ['rack_id' => $id]);

            // 返回 JSON 响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Rack has been set to available status',
                    'data' => $rack
                ]);
            }

            return redirect()->route('admin.storage_locations.rack.index')
                ->with('success', 'Rack has been set to available status');

        } catch (\Exception $e) {
            Log::error('Failed to set rack available: ' . $e->getMessage());

            // 返回 JSON 错误响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to set rack available: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to set rack available: ' . $e->getMessage()]);
        }
    }

    public function setUnavailable($id)
    {
        try {
            $rack = Rack::findOrFail($id);
            $rack->update(['rack_status' => 'Unavailable']);

            Log::info('Rack set to unavailable', ['rack_id' => $id]);

            // 返回 JSON 响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Rack has been set to unavailable status',
                    'data' => $rack
                ]);
            }

            return redirect()->route('admin.storage_locations.rack.index')
                ->with('success', 'Rack has been set to unavailable status');

        } catch (\Exception $e) {
            Log::error('Failed to set rack unavailable: ' . $e->getMessage());

            // 返回 JSON 错误响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to set rack unavailable: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to set rack unavailable: ' . $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        try {
            $rack = Rack::findOrFail($id);

            if ($rack->rack_image && file_exists(public_path('assets/images/' . $rack->rack_image))) {
                unlink(public_path('assets/images/' . $rack->rack_image));
            }

            $rack->delete();

            Log::info('Rack deleted successfully', ['rack_id' => $id]);

            // 返回 JSON 响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Rack deleted successfully!',
                    'data' => [
                        'id' => $id,
                        'name' => $rack->rack_number
                    ]
                ]);
            }

            return redirect()->route('admin.storage_locations.rack.index')
                ->with('success', 'Rack deleted successfully!');

        } catch (\Exception $e) {
            Log::error('Rack deletion failed: ' . $e->getMessage());

            // 返回 JSON 错误响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to delete rack: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to delete rack: ' . $e->getMessage()]);
        }
    }
}
