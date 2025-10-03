<?php

namespace App\Http\Controllers\Admin\CategoryMapping;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\CategoryMapping\Subcategory;

/**
 * 子分类管理控制器
 */
class SubcategoryController extends Controller
{
    public function index(Request $request)
    {
        if ($request->ajax()) {
            try {
                $query = Subcategory::query();

                if ($request->has('search') && $request->search) {
                    $search = $request->search;
                    $query->where(function($q) use ($search) {
                        $q->where('subcategory_name', 'like', "%{$search}%");
                    });
                }

                if ($request->has('status_filter') && $request->status_filter) {
                    $query->where('subcategory_status', $request->status_filter);
                }

                $subcategories = $query->paginate(10);

                return response()->json([
                    'success' => true,
                    'data' => $subcategories->items(),
                    'pagination' => [
                        'current_page' => $subcategories->currentPage(),
                        'last_page' => $subcategories->lastPage(),
                        'per_page' => $subcategories->perPage(),
                        'total' => $subcategories->total(),
                        'from' => $subcategories->firstItem(),
                        'to' => $subcategories->lastItem(),
                    ]
                ]);
            } catch (\Exception $e) {
                Log::error('Subcategory management error: ' . $e->getMessage());
                return response()->json(['error' => 'Failed to fetch subcategories'], 500);
            }
        }

        $subcategories = Subcategory::paginate(10);
        return view('admin.categories.subcategory.dashboard', compact('subcategories'));
    }

    public function create()
    {
        return view('admin.categories.subcategory.create');
    }

    public function store(Request $request)
    {
        // 与 CategoryController 的实现保持一致：有数组走批量，否则走单个
        if ($request->has('subcategories') && is_array($request->input('subcategories'))) {
            return $this->storeMultipleSubcategories($request);
        }

        return $this->storeSingleSubcategory($request);
    }

    /**
     * 单个存储子分类
     */
    private function storeSingleSubcategory(Request $request)
    {
        // 校验
        $request->validate([
            'subcategory_name' => 'required|string|max:255|unique:subcategories,subcategory_name',
            'subcategory_status' => 'required|in:Available,Unavailable',
            'subcategory_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        try {
            $subcategoryData = [
                'subcategory_name' => $request->input('subcategory_name') ?? $request->input('subcategoryName'),
                'subcategory_status' => $request->input('subcategory_status') ?? $request->input('subcategoryStatus'),
            ];

            // 处理文件上传
            if ($request->hasFile('subcategory_image')) {
                // 文件上传（确保目录存在）
                $image = $request->file('subcategory_image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $directory = public_path('assets/images/subcategories');
                if (!file_exists($directory)) {
                    mkdir($directory, 0777, true);
                }
                $image->move($directory, $imageName);
                $subcategoryData['subcategory_image'] = 'subcategories/' . $imageName;
            }

            $subcategory = Subcategory::create($subcategoryData);

            Log::info('Subcategory created successfully (single)', [
                'subcategory_id' => $subcategory->id,
                'subcategory_name' => $subcategoryData['subcategory_name']
            ]);

            $message = 'Subcategory created successfully!';

            if ($request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $subcategory
                ]);
            }

            return redirect()->route('admin.category_mapping.subcategory.index')
                ->with('success', $message);

        } catch (\Exception $e) {
            Log::error('Subcategory creation failed (single): ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            if ($request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create subcategory: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to create subcategory: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * 批量存储子分类（统一入口）
     */
    private function storeMultipleSubcategories(Request $request)
    {
        // 仅处理批量数组
        $subcategories = $request->input('subcategories', []);
        $createdSubcategories = [];
        $errors = [];

        foreach ($subcategories as $index => $subcategoryData) {

            // 兼容前端字段命名（camelCase -> snake_case）
            // 前端：subcategoryName / subcategoryStatus
            // 后端期望：subcategory_name / subcategory_status
            if (isset($subcategoryData['subcategoryName']) && !isset($subcategoryData['subcategory_name'])) {
                $subcategoryData['subcategory_name'] = $subcategoryData['subcategoryName'];
            }
            if (isset($subcategoryData['subcategoryStatus']) && !isset($subcategoryData['subcategory_status'])) {
                $subcategoryData['subcategory_status'] = $subcategoryData['subcategoryStatus'];
            }

            $validator = \Validator::make($subcategoryData, [
                'subcategory_name' => 'required|string|max:255',
                'subcategory_status' => 'required|in:Available,Unavailable',
            ]);

            if ($validator->fails()) {
                $errors[] = "Subcategory " . ($index + 1) . ": " . implode(', ', $validator->errors()->all());
                continue;
            }

            // 检查子分类名称是否已存在
            $existingSubcategory = Subcategory::where('subcategory_name', $subcategoryData['subcategory_name'])->first();

            if ($existingSubcategory) {
                $errors[] = "Subcategory " . ($index + 1) . ": Subcategory name '{$subcategoryData['subcategory_name']}' already exists";
                continue;
            }

            try {
                $subcategoryRecord = [
                    'subcategory_name' => $subcategoryData['subcategory_name'],
                    'subcategory_status' => $subcategoryData['subcategory_status'],
                ];

                // 处理图片上传 - 使用文件数组
                $files = $request->file('images');
                if (is_array($files) && isset($files[$index]) && $files[$index] && $files[$index]->isValid()) {
                    $image = $files[$index];
                    $directory = public_path('assets/images/subcategories');
                    if (!file_exists($directory)) {
                        mkdir($directory, 0777, true);
                    }
                    $imageName = time() . '_' . $index . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                    $image->move($directory, $imageName);
                    $subcategoryRecord['subcategory_image'] = 'subcategories/' . $imageName;
                }

                $subcategory = Subcategory::create($subcategoryRecord);
                $createdSubcategories[] = $subcategory;
            } catch (\Exception $e) {
                $errors[] = "Subcategory " . ($index + 1) . ": " . $e->getMessage();
            }
        }

        if ($request->ajax()) {
            if (count($errors) > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some subcategories failed to create',
                    'errors' => $errors,
                    'created_count' => count($createdSubcategories)
                ], 422);
            } else {
                return response()->json([
                    'success' => true,
                    'message' => count($createdSubcategories) . ' subcategories created successfully',
                    'data' => $createdSubcategories
                ]);
            }
        }

        if (count($errors) > 0) {
            return back()->withErrors(['error' => implode('; ', $errors)])
                ->withInput();
        }

        return redirect()->route('admin.category_mapping.subcategory.index')
            ->with('success', count($createdSubcategories) . ' subcategories created successfully');
    }

    public function edit($id)
    {
        $subcategory = Subcategory::findOrFail($id);
        return view('admin.categories.subcategory.update', compact('subcategory'));
    }

    public function update(Request $request, $id)
    {
        $subcategory = Subcategory::findOrFail($id);

        $request->validate([
            'subcategory_name' => 'required|string|max:255|unique:subcategories,subcategory_name,' . $id,
            'subcategory_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'subcategory_status' => 'required|in:Available,Unavailable',
        ]);

        try {
            $subcategoryData = [
                'subcategory_name' => $request->subcategory_name,
                'subcategory_status' => $request->subcategory_status,
            ];

            if ($request->hasFile('subcategory_image')) {
                if ($subcategory->subcategory_image && file_exists(public_path('assets/images/' . $subcategory->subcategory_image))) {
                    unlink(public_path('assets/images/' . $subcategory->subcategory_image));
                }

                $image = $request->file('subcategory_image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $image->move(public_path('assets/images/subcategories'), $imageName);
                $subcategoryData['subcategory_image'] = 'subcategories/' . $imageName;
            }

            $subcategory->update($subcategoryData);

            Log::info('Subcategory updated successfully', ['subcategory_id' => $id, 'subcategory_name' => $request->subcategory_name]);

            // 返回 JSON 响应
            if ($request->ajax() || $request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Subcategory updated successfully!',
                    'data' => $subcategory
                ]);
            }

            return redirect()->route('admin.category_mapping.subcategory.index')
                ->with('success', 'Subcategory updated successfully!');

        } catch (\Exception $e) {
            Log::error('Subcategory update failed: ' . $e->getMessage());

            // 返回 JSON 错误响应
            if ($request->ajax() || $request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to update subcategory: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to update subcategory: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function setAvailable($id)
    {
        try {
            $subcategory = Subcategory::findOrFail($id);
            $subcategory->update(['subcategory_status' => 'Available']);

            Log::info('Subcategory set to available', ['subcategory_id' => $id]);

            // 返回 JSON 响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Subcategory has been set to available status',
                    'data' => $subcategory
                ]);
            }

            return redirect()->route('admin.category_mapping.subcategory.index')
                ->with('success', 'Subcategory has been set to available status');

        } catch (\Exception $e) {
            Log::error('Failed to set subcategory available: ' . $e->getMessage());

            // 返回 JSON 错误响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to set subcategory available: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to set subcategory available: ' . $e->getMessage()]);
        }
    }

    public function setUnavailable($id)
    {
        try {
            $subcategory = Subcategory::findOrFail($id);
            $subcategory->update(['subcategory_status' => 'Unavailable']);

            Log::info('Subcategory set to unavailable', ['subcategory_id' => $id]);

            // 返回 JSON 响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Subcategory has been set to unavailable status',
                    'data' => $subcategory
                ]);
            }

            return redirect()->route('admin.category_mapping.subcategory.index')
                ->with('success', 'Subcategory has been set to unavailable status');

        } catch (\Exception $e) {
            Log::error('Failed to set subcategory unavailable: ' . $e->getMessage());

            // 返回 JSON 错误响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to set subcategory unavailable: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to set subcategory unavailable: ' . $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        try {
            $subcategory = Subcategory::findOrFail($id);

            if ($subcategory->subcategory_image && file_exists(public_path('assets/images/' . $subcategory->subcategory_image))) {
                unlink(public_path('assets/images/' . $subcategory->subcategory_image));
            }

            $subcategory->delete();

            Log::info('Subcategory deleted successfully', ['subcategory_id' => $id]);

            // 返回 JSON 响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Subcategory deleted successfully!',
                    'data' => [
                        'id' => $id,
                        'name' => $subcategory->subcategory_name
                    ]
                ]);
            }

            return redirect()->route('admin.category_mapping.subcategory.index')
                ->with('success', 'Subcategory deleted successfully!');

        } catch (\Exception $e) {
            Log::error('Subcategory deletion failed: ' . $e->getMessage());

            // 返回 JSON 错误响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to delete subcategory: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to delete subcategory: ' . $e->getMessage()]);
        }
    }
}
