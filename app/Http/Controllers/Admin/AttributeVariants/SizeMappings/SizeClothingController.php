<?php

namespace App\Http\Controllers\Admin\AttributeVariants\SizeMappings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\AttributeVariants\SizeMappings\SizeClothing;
use App\Models\AttributeVariants\Gender;

/**
 * 衣服尺码管理控制器
 */
class SizeClothingController extends Controller
{
    public function index(Request $request)
    {
        if ($request->ajax()) {
            try {
                $sizeClothings = SizeClothing::with('gender')->get();

                // 计算统计数据
                $totalSizes = SizeClothing::count();
                $availableSizes = SizeClothing::where('size_status', 'Available')->count();
                $unavailableSizes = SizeClothing::where('size_status', 'Unavailable')->count();

                // 返回 JSON 响应
                return response()->json([
                    'success' => true,
                    'data' => $sizeClothings,
                    'statistics' => [
                        'total' => $totalSizes,
                        'available' => $availableSizes,
                        'unavailable' => $unavailableSizes,
                    ],
                ]);
            } catch (\Exception $e) {
                Log::error('Size clothing index error: ' . $e->getMessage());
                return response()->json(['success' => false, 'message' => 'Failed to load size clothings'], 500);
            }
        }

        $sizeClothings = SizeClothing::with('gender')->get();
        $genders = Gender::where('gender_status', 'Available')->get();

        return view('admin.attribute_variants.size_mappings.size_clothing.dashboard', compact('sizeClothings', 'genders'));
    }

    public function create()
    {
        $genders = Gender::where('gender_status', 'Available')->get();
        return view('admin.attribute_variants.size_mappings.size_clothing.create', compact('genders'));
    }

    public function store(Request $request)
    {
        try {
            // 检查是否是批量创建
            if ($request->has('sizes') && is_array($request->sizes)) {
                // 批量创建验证
                $request->validate([
                    'gender_id' => 'required|exists:genders,id',
                    'sizes' => 'required|array|min:1',
                    'sizes.*.size_value' => 'required|string|max:20',
                    'sizes.*.measurements' => 'nullable|string|max:1000',
                    'sizes.*.size_status' => 'required|in:Available,Unavailable',
                ]);

                $createdCount = 0;
                $duplicates = [];

                foreach ($request->sizes as $index => $sizeData) {
                    // 检查重复
                    $exists = SizeClothing::where([
                        'size_value' => $sizeData['size_value'],
                        'gender_id' => $request->gender_id,
                    ])->exists();

                    if ($exists) {
                        $duplicates[] = $sizeData['size_value'];
                        continue;
                    }

                    // 处理 measurements
                    $measurements = null;
                    if (!empty($sizeData['measurements'])) {
                        $measurements = ['description' => $sizeData['measurements']];
                    }

                    SizeClothing::create([
                        'size_value' => $sizeData['size_value'],
                        'gender_id' => $request->gender_id,
                        'measurements' => $measurements,
                        'size_status' => $sizeData['size_status'] ?? 'Available',
                    ]);

                    $createdCount++;
                }

                $message = "Successfully created {$createdCount} clothing size(s)";
                if (!empty($duplicates)) {
                    $message .= ". Skipped duplicates: " . implode(', ', $duplicates);
                }

                return redirect()->route('admin.attribute_variant.size_clothing.index')
                                ->with('success', $message);
            } else {
                // 单个创建验证
                $request->validate([
                    'size_value' => 'required|string|max:20',
                    'gender_id' => 'required|exists:genders,id',
                    'measurements' => 'nullable|string|max:1000',
                    'size_status' => 'required|in:Available,Unavailable',
                ]);

                // 检查重复
                $exists = SizeClothing::where([
                    'size_value' => $request->size_value,
                    'gender_id' => $request->gender_id,
                ])->exists();

                if ($exists) {
                    return redirect()->back()
                                    ->withErrors(['error' => 'This size already exists for the selected gender'])
                                    ->withInput();
                }

                // 处理 measurements 字符串转换为数组
                $measurements = null;
                if ($request->measurements) {
                    $measurements = ['description' => $request->measurements];
                }

                SizeClothing::create([
                    'size_value' => $request->size_value,
                    'gender_id' => $request->gender_id,
                    'measurements' => $measurements,
                    'size_status' => $request->size_status ?? 'Available',
                ]);

                return redirect()->route('admin.attribute_variant.size_clothing.index')
                                ->with('success', 'Size clothing created successfully');
            }
        } catch (\Exception $e) {
            Log::error('Size clothing creation error: ' . $e->getMessage());
            return redirect()->back()->withInput()->withErrors(['error' => 'Failed to create size clothing']);
        }
    }

    public function edit($id)
    {
        $sizeClothing = SizeClothing::with('gender')->findOrFail($id);
        $genders = Gender::where('gender_status', 'Available')->get();

        return view('admin.attribute_variants.size_mappings.size_clothing.update', compact('sizeClothing', 'genders'));
    }

    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'size_value' => 'required|string|max:20',
                'gender_id' => 'required|exists:genders,id',
                'measurements' => 'nullable|string|max:1000',
                'size_status' => 'required|in:Available,Unavailable',
            ]);

            $sizeClothing = SizeClothing::findOrFail($id);

            // 检查重复（排除当前记录）
            $exists = SizeClothing::where([
                'size_value' => $request->size_value,
                'gender_id' => $request->gender_id,
            ])->where('id', '!=', $id)->exists();

            if ($exists) {
                return redirect()->back()
                                ->withErrors(['error' => 'This size already exists for the selected gender'])
                                ->withInput();
            }

            // 处理 measurements 字符串转换为数组
            $measurements = null;
            if ($request->measurements) {
                $measurements = ['description' => $request->measurements];
            }

            $sizeClothing->update([
                'size_value' => $request->size_value,
                'gender_id' => $request->gender_id,
                'measurements' => $measurements,
                'size_status' => $request->size_status,
            ]);

            return redirect()->route('admin.attribute_variant.size_clothing.index')
                            ->with('success', 'Size clothing updated successfully');
        } catch (\Exception $e) {
            Log::error('Size clothing update error: ' . $e->getMessage());
            return redirect()->back()->withInput()->withErrors(['error' => 'Failed to update size clothing']);
        }
    }

    public function setAvailable($id)
    {
        try {
            $sizeClothing = SizeClothing::findOrFail($id);
            $sizeClothing->size_status = 'Available';
            $sizeClothing->save();

            return redirect()->route('admin.attribute_variant.size_clothing.index')
                            ->with('success', 'Size clothing set to available successfully');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Failed to set size clothing as available']);
        }
    }

    public function setUnavailable($id)
    {
        try {
            $sizeClothing = SizeClothing::findOrFail($id);
            $sizeClothing->size_status = 'Unavailable';
            $sizeClothing->save();

            return redirect()->route('admin.attribute_variant.size_clothing.index')
                            ->with('success', 'Size clothing set to unavailable successfully');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Failed to set size clothing as unavailable']);
        }
    }

    public function destroy($id)
    {
        try {
            $sizeClothing = SizeClothing::findOrFail($id);

            if ($sizeClothing->sizeTypes()->exists()) {
                return redirect()->back()
                                ->withErrors(['error' => 'Cannot delete this size clothing because size types are still linked to it.']);
            }

            $sizeClothing->delete();

            return redirect()->route('admin.attribute_variant.size_clothing.index')
                            ->with('success', 'Size clothing deleted successfully');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Failed to delete size clothing']);
        }
    }
}
