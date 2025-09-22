<?php

namespace App\Http\Controllers\Admin\AttributeVariants\SizeMappings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\AttributeVariants\SizeMappings\SizeShoes;
use App\Models\AttributeVariants\Gender;

/**
 * 鞋子尺码管理控制器
 */
class SizeShoesController extends Controller
{
    public function index(Request $request)
    {
        if ($request->ajax()) {
            try {
                $sizeShoes = SizeShoes::with('gender')->get();

                // 计算统计数据
                $totalSizes = SizeShoes::count();
                $availableSizes = SizeShoes::where('size_status', 'Available')->count();
                $unavailableSizes = SizeShoes::where('size_status', 'Unavailable')->count();

                // 返回 JSON 响应
                return response()->json([
                    'success' => true,
                    'data' => $sizeShoes,
                    'statistics' => [
                        'total' => $totalSizes,
                        'available' => $availableSizes,
                        'unavailable' => $unavailableSizes,
                    ],
                ]);
            } catch (\Exception $e) {
                Log::error('Size shoes index error: ' . $e->getMessage());
                return response()->json(['success' => false, 'message' => 'Failed to load size shoes'], 500);
            }
        }

        $sizeShoes = SizeShoes::with('gender')->get();
        $genders = Gender::where('gender_status', 'Available')->get();

        return view('admin.attribute_variants.size_mappings.size_shoes.dashboard', compact('sizeShoes', 'genders'));
    }

    public function create()
    {
        $genders = Gender::where('gender_status', 'Available')->get();
        return view('admin.attribute_variants.size_mappings.size_shoes.create', compact('genders'));
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
                    $exists = SizeShoes::where([
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

                    SizeShoes::create([
                        'size_value' => $sizeData['size_value'],
                        'gender_id' => $request->gender_id,
                        'measurements' => $measurements,
                        'size_status' => $sizeData['size_status'] ?? 'Available',
                    ]);

                    $createdCount++;
                }

                $message = "Successfully created {$createdCount} shoe size(s)";
                if (!empty($duplicates)) {
                    $message .= ". Skipped duplicates: " . implode(', ', $duplicates);
                }

                return redirect()->route('admin.attribute_variant.size_shoes.index')
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
                $exists = SizeShoes::where([
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

                SizeShoes::create([
                    'size_value' => $request->size_value,
                    'gender_id' => $request->gender_id,
                    'measurements' => $measurements,
                    'size_status' => $request->size_status ?? 'Available',
                ]);

                return redirect()->route('admin.attribute_variant.size_shoes.index')
                                ->with('success', 'Size shoes created successfully');
            }
        } catch (\Exception $e) {
            Log::error('Size shoes creation error: ' . $e->getMessage());
            return redirect()->back()->withInput()->withErrors(['error' => 'Failed to create size shoes']);
        }
    }

    public function edit($id)
    {
        $sizeShoes = SizeShoes::with('gender')->findOrFail($id);
        $genders = Gender::where('gender_status', 'Available')->get();

        return view('admin.attribute_variants.size_mappings.size_shoes.update', compact('sizeShoes', 'genders'));
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

            $sizeShoes = SizeShoes::findOrFail($id);

            // 检查重复（排除当前记录）
            $exists = SizeShoes::where([
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

            $sizeShoes->update([
                'size_value' => $request->size_value,
                'gender_id' => $request->gender_id,
                'measurements' => $measurements,
                'size_status' => $request->size_status,
            ]);

            return redirect()->route('admin.attribute_variant.size_shoes.index')
                            ->with('success', 'Size shoes updated successfully');
        } catch (\Exception $e) {
            Log::error('Size shoes update error: ' . $e->getMessage());
            return redirect()->back()->withInput()->withErrors(['error' => 'Failed to update size shoes']);
        }
    }

    public function setAvailable($id)
    {
        try {
            $sizeShoes = SizeShoes::findOrFail($id);
            $sizeShoes->size_status = 'Available';
            $sizeShoes->save();

            if (request()->ajax()) {
                return response()->json(['success' => true, 'message' => 'Size shoes set to available successfully']);
            }

            return redirect()->route('admin.attribute_variant.size_shoes.index')
                            ->with('success', 'Size shoes set to available successfully');
        } catch (\Exception $e) {
            Log::error('Size shoes set available error: ' . $e->getMessage());
            if (request()->ajax()) {
                return response()->json(['success' => false, 'message' => 'Failed to set size shoes as available']);
            }
            return redirect()->back()->withErrors(['error' => 'Failed to set size shoes as available']);
        }
    }

    public function setUnavailable($id)
    {
        try {
            $sizeShoes = SizeShoes::findOrFail($id);
            $sizeShoes->size_status = 'Unavailable';
            $sizeShoes->save();

            if (request()->ajax()) {
                return response()->json(['success' => true, 'message' => 'Size shoes set to unavailable successfully']);
            }

            return redirect()->route('admin.attribute_variant.size_shoes.index')
                            ->with('success', 'Size shoes set to unavailable successfully');
        } catch (\Exception $e) {
            Log::error('Size shoes set unavailable error: ' . $e->getMessage());
            if (request()->ajax()) {
                return response()->json(['success' => false, 'message' => 'Failed to set size shoes as unavailable']);
            }
            return redirect()->back()->withErrors(['error' => 'Failed to set size shoes as unavailable']);
        }
    }

    public function destroy($id)
    {
        try {
            $sizeShoes = SizeShoes::findOrFail($id);

            if ($sizeShoes->sizeTypes()->exists()) {
                if (request()->ajax()) {
                    return response()->json(['success' => false, 'message' => 'Cannot delete this size shoes because size types are still linked to it.']);
                }
                return redirect()->back()
                                ->withErrors(['error' => 'Cannot delete this size shoes because size types are still linked to it.']);
            }

            $sizeShoes->delete();

            if (request()->ajax()) {
                return response()->json(['success' => true, 'message' => 'Size shoes deleted successfully']);
            }

            return redirect()->route('admin.attribute_variant.size_shoes.index')
                            ->with('success', 'Size shoes deleted successfully');
        } catch (\Exception $e) {
            Log::error('Size shoes delete error: ' . $e->getMessage());
            if (request()->ajax()) {
                return response()->json(['success' => false, 'message' => 'Failed to delete size shoes']);
            }
            return redirect()->back()->withErrors(['error' => 'Failed to delete size shoes']);
        }
    }
}
