<?php

namespace App\Http\Controllers\Admin\AttributeVariants\SizeMappings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\AttributeVariants\SizeMappings\SizeType;
use App\Models\AttributeVariants\SizeMappings\SizeClothing;
use App\Models\AttributeVariants\SizeMappings\SizeShoes;
use App\Models\CategoryMappings\Category;
use App\Models\AttributeVariants\Gender;

/**
 * 尺码类型管理控制器
 *
 * 功能模块：
 * - 尺码类型列表展示：搜索、筛选、分页
 * - 尺码类型操作：创建、编辑、删除、状态管理
 * - 尺码类型管理：衣服尺码、鞋子尺码关联
 *
 * @author WMS Team
 * @version 1.0.0
 */
class SizeTypeController extends Controller
{
    /**
     * 尺码类型列表页面
     */
    public function index(Request $request)
    {
        if ($request->ajax()) {
            try {
                $query = SizeType::with([
                    'clothingSize' => function($query) {
                        $query->with('gender');
                    },
                    'shoeSize' => function($query) {
                        $query->with('gender');
                    },
                    'category'
                ])->whereHas('category'); // 只獲取有關聯Category的記錄

                $sizeTypes = $query->get();

                // 處理數據，確保每個SizeType都有正確的關聯數據
                $processedSizeTypes = $sizeTypes->map(function($sizeType) {
                    // 確保 size_value 被正確設置
                    if (!$sizeType->size_value) {
                        if ($sizeType->clothing_size_id && $sizeType->clothingSize && $sizeType->clothingSize->size_value) {
                            $sizeType->size_value = $sizeType->clothingSize->size_value;
                        } elseif ($sizeType->shoe_size_id && $sizeType->shoeSize && $sizeType->shoeSize->size_value) {
                            $sizeType->size_value = $sizeType->shoeSize->size_value;
                        }
                    }

                    // 添加類型信息
                    $sizeType->type = $sizeType->clothing_size_id ? 'clothing' : 'shoes';

                    // 確保 gender 信息被正確設置
                    if ($sizeType->clothing_size_id && $sizeType->clothingSize && $sizeType->clothingSize->gender) {
                        $sizeType->gender_info = $sizeType->clothingSize->gender;
                    } elseif ($sizeType->shoe_size_id && $sizeType->shoeSize && $sizeType->shoeSize->gender) {
                        $sizeType->gender_info = $sizeType->shoeSize->gender;
                    } else {
                        $sizeType->gender_info = null;
                    }

                    return $sizeType;
                });

                // 计算统计数据
                $totalSizes = SizeType::count();
                $availableSizes = SizeType::where('size_status', 'Available')->count();
                $unavailableSizes = SizeType::where('size_status', 'Unavailable')->count();

                // 返回 JSON 响应
                return response()->json([
                    'success' => true,
                    'data' => $processedSizeTypes,
                    'statistics' => [
                        'total' => $totalSizes,
                        'available' => $availableSizes,
                        'unavailable' => $unavailableSizes,
                    ],
                ]);
            } catch (\Exception $e) {
                Log::error('Size type index error: ' . $e->getMessage());
                return response()->json(['success' => false, 'message' => 'Failed to load size types'], 500);
            }
        }

        $sizeTypes = SizeType::with([
            'clothingSize' => function($query) {
                $query->with('gender');
            },
            'shoeSize' => function($query) {
                $query->with('gender');
            },
            'category'
        ])->whereHas('category')->get();
        $categories = Category::where('category_status', 'Available')->get();

        // 为卡片布局准备分组数据
        $groupedSizesWithIcons = [];
        foreach ($sizeTypes as $sizeType) {
            $gender = $sizeType->gender;
            $category = $sizeType->category;

            if ($gender && $category) {
                $groupKey = $gender->id . '_' . $category->id;

                if (!isset($groupedSizesWithIcons[$groupKey])) {
                    $groupedSizesWithIcons[$groupKey] = [
                        'sizes' => collect([]),
                        'icon' => 'bi bi-diagram-3',
                        'color' => 'bg-primary',
                        'gender' => $gender->gender_name,
                        'category' => $category->category_name,
                        'genderId' => $gender->id,
                        'categoryId' => $category->id,
                    ];
                }

                $groupedSizesWithIcons[$groupKey]['sizes']->push($sizeType);
            }
        }

        return view('admin.attribute_variants.size_mappings.size_types.dashboard', compact('sizeTypes', 'categories'));
    }

    /**
     * 显示创建表单
     */
    public function create()
    {
        $categories = Category::where('category_status', 'Available')->get();
        $genders = Gender::where('gender_status', 'Available')->get();
        $clothingSizes = SizeClothing::with('gender')->where('size_status', 'Available')->get();
        $shoeSizes = SizeShoes::with('gender')->where('size_status', 'Available')->get();

        return view('admin.attribute_variants.size_mappings.size_types.create', compact('categories', 'genders', 'clothingSizes', 'shoeSizes'));
    }

    /**
     * 存储新记录
     */
    public function store(Request $request)
    {
        try {
            // 批量创建验证
            $request->validate([
                'category_id' => 'required|exists:categories,id',
                'size_type' => 'required|in:clothing,shoes',
                'clothing_size_ids' => 'nullable|array',
                'clothing_size_ids.*' => 'exists:size_clothings,id',
                'shoe_size_ids' => 'nullable|array',
                'shoe_size_ids.*' => 'exists:size_shoes,id',
                'size_status' => 'required|in:Available,Unavailable',
            ]);

            $createdCount = 0;
            $duplicates = [];

            if ($request->size_type === 'clothing' && $request->has('clothing_size_ids')) {
                foreach ($request->clothing_size_ids as $clothingSizeId) {
                    // 检查重复
                    $exists = SizeType::where([
                        'clothing_size_id' => $clothingSizeId,
                        'category_id' => $request->category_id,
                    ])->exists();

                    if ($exists) {
                        $clothingSize = SizeClothing::find($clothingSizeId);
                        $duplicates[] = $clothingSize ? $clothingSize->size_value : "ID: $clothingSizeId";
                        continue;
                    }

                    SizeType::create([
                        'category_id' => $request->category_id,
                        'clothing_size_id' => $clothingSizeId,
                        'shoe_size_id' => null,
                        'size_status' => $request->size_status ?? 'Available',
                    ]);

                    $createdCount++;
                }
            } elseif ($request->size_type === 'shoes' && $request->has('shoe_size_ids')) {
                foreach ($request->shoe_size_ids as $shoeSizeId) {
                    // 检查重复
                    $exists = SizeType::where([
                        'shoe_size_id' => $shoeSizeId,
                        'category_id' => $request->category_id,
                    ])->exists();

                    if ($exists) {
                        $shoeSize = SizeShoes::find($shoeSizeId);
                        $duplicates[] = $shoeSize ? $shoeSize->size_value : "ID: $shoeSizeId";
                        continue;
                    }

                    SizeType::create([
                        'category_id' => $request->category_id,
                        'shoe_size_id' => $shoeSizeId,
                        'clothing_size_id' => null,
                        'size_status' => $request->size_status ?? 'Available',
                    ]);

                    $createdCount++;
                }
            }

            if ($createdCount === 0) {
                return redirect()->back()
                                ->withErrors(['error' => 'No sizes were selected or all selected sizes already exist'])
                                ->withInput();
            }

            $message = "Successfully created {$createdCount} size type(s)";
            if (!empty($duplicates)) {
                $message .= ". Skipped duplicates: " . implode(', ', $duplicates);
            }

            return redirect()->route('admin.attribute_variant.size_type.index')
                            ->with('success', $message);
        } catch (\Exception $e) {
            Log::error('Size type creation error: ' . $e->getMessage());
            return redirect()->back()->withInput()->withErrors(['error' => 'Failed to create size type']);
        }
    }

    /**
     * 显示编辑表单
     */
    public function edit($id)
    {
        $sizeType = SizeType::with(['clothingSize.gender', 'shoeSize.gender', 'category'])->findOrFail($id);
        $categories = Category::where('category_status', 'Available')->get();
        $genders = Gender::where('gender_status', 'Available')->get();
        $clothingSizes = SizeClothing::with('gender')->where('size_status', 'Available')->get();
        $shoeSizes = SizeShoes::with('gender')->where('size_status', 'Available')->get();

        return view('admin.attribute_variants.size_mappings.size_types.update', compact('sizeType', 'categories', 'genders', 'clothingSizes', 'shoeSizes'));
    }

    /**
     * 更新记录
     */
    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'category_id' => 'required|exists:categories,id',
                'size_type' => 'required|in:clothing,shoes',
                'clothing_size_id' => 'nullable|exists:size_clothings,id',
                'shoe_size_id' => 'nullable|exists:size_shoes,id',
                'size_status' => 'required|in:Available,Unavailable',
            ]);

            $sizeType = SizeType::findOrFail($id);

            $updateData = [
                'category_id' => $request->category_id,
                'size_status' => $request->size_status,
            ];

            if ($request->size_type === 'clothing') {
                $updateData['clothing_size_id'] = $request->clothing_size_id;
                $updateData['shoe_size_id'] = null;
            } else {
                $updateData['shoe_size_id'] = $request->shoe_size_id;
                $updateData['clothing_size_id'] = null;
            }

            $sizeType->update($updateData);

            return redirect()->route('admin.attribute_variant.size_type.index')
                            ->with('success', 'Size type updated successfully');
        } catch (\Exception $e) {
            Log::error('Size type update error: ' . $e->getMessage());
            return redirect()->back()->withInput()->withErrors(['error' => 'Failed to update size type']);
        }
    }

    /**
     * 设置为可用
     */
    public function setAvailable($id)
    {
        try {
            $sizeType = SizeType::findOrFail($id);
            $sizeType->size_status = 'Available';
            $sizeType->save();

            return redirect()->route('admin.attribute_variant.size_type.index')
                            ->with('success', 'Size type set to available successfully');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Failed to set size type as available']);
        }
    }

    /**
     * 设置为不可用
     */
    public function setUnavailable($id)
    {
        try {
            $sizeType = SizeType::findOrFail($id);
            $sizeType->size_status = 'Unavailable';
            $sizeType->save();

            return redirect()->route('admin.attribute_variant.size_type.index')
                            ->with('success', 'Size type set to unavailable successfully');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Failed to set size type as unavailable']);
        }
    }

    /**
     * 删除记录
     */
    public function destroy($id)
    {
        try {
            $sizeType = SizeType::findOrFail($id);

            if ($sizeType->attributeVariants()->exists()) {
                return redirect()->back()
                                ->withErrors(['error' => 'Cannot delete this size type because products are still linked to it.']);
            }

            $sizeType->delete();

            return redirect()->route('admin.attribute_variant.size_type.index')
                            ->with('success', 'Size type deleted successfully');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Failed to delete size type']);
        }
    }
}
