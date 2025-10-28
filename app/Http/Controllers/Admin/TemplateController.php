<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\SizeTemplate;
use App\Models\SizeLibrary;
use App\Models\Category;
use App\Models\Gender;

/**
 * Size Template Management Controller
 * 尺码模板管理控制器
 *
 * 功能模块：
 * - 模板列表展示：搜索、筛选、分页
 * - 模板操作：创建、编辑、删除、查看
 * - 模板组合管理：类别+性别+尺码库的组合
 * - 状态管理：可用/不可用状态切换
 * - 动态数据：根据类别和性别获取可用尺码库
 *
 * @author WMS Team
 * @version 1.0.0
 */
class TemplateController extends Controller
{
    // Constants for better maintainability
    private const MAX_BULK_TEMPLATES = 20;
    private const STATUSES = ['Available', 'Unavailable'];

    // Validation rules
    private const TEMPLATE_RULES = [
        'category_id' => 'required|exists:categories,id',
        'gender_id' => 'required|exists:genders,id',
        'size_library_id' => 'required|exists:size_libraries,id',
    ];

    /**
     * Normalize template data from frontend
     */
    private function normalizeTemplateData(array $templateData): array
    {
        // Convert camelCase to snake_case
        if (isset($templateData['categoryId']) && !isset($templateData['category_id'])) {
            $templateData['category_id'] = $templateData['categoryId'];
        }
        if (isset($templateData['genderId']) && !isset($templateData['gender_id'])) {
            $templateData['gender_id'] = $templateData['genderId'];
        }
        if (isset($templateData['sizeLibraryId']) && !isset($templateData['size_library_id'])) {
            $templateData['size_library_id'] = $templateData['sizeLibraryId'];
        }
        if (isset($templateData['templateStatus']) && !isset($templateData['template_status'])) {
            $templateData['template_status'] = $templateData['templateStatus'];
        }

        return $templateData;
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
        if (strpos($errorMessage, 'Duplicate entry') !== false && strpos($errorMessage, 'size_templates_category_id_gender_id_size_library_id_unique') !== false) {
            return 'Template combination already exists. Please choose a different combination.';
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
        Log::info("Template {$action}", array_merge([
            'timestamp' => now()->toISOString(),
            'ip' => request()->ip(),
        ], $data));
    }
    /**
     * 显示尺码模板列表页面
     * Display size template list page
     */
    public function index(Request $request)
    {
        if ($request->ajax()) {
            return $this->getTemplatesData();
        }

        $sizeTemplates = SizeTemplate::with(['category', 'gender', 'sizeLibrary'])
            ->join('size_libraries', 'size_templates.size_library_id', '=', 'size_libraries.id')
            ->orderBy('size_libraries.size_value', 'asc')
            ->select('size_templates.*')
            ->get();
        $categories = Category::where('category_status', 'Available')->get();
        $genders = Gender::where('gender_status', 'Available')->get();

        return view('admin.template.dashboard', compact('sizeTemplates', 'categories', 'genders'));
    }

    /**
     * 显示创建尺码模板表单
     * Show create size template form
     */
    public function create()
    {
        $categories = Category::where('category_status', 'Available')->get();
        $genders = Gender::where('gender_status', 'Available')->get();
        $sizeLibraries = SizeLibrary::where('size_status', 'Available')->get();

        return view('admin.template.create', compact('categories', 'genders', 'sizeLibraries'));
    }

    /**
     * 存储新尺码模板
     * Store new size template
     */
    public function store(Request $request)
    {
        // 检查是否是批量创建
        if ($request->has('templates') && is_array($request->templates)) {
            return $this->storeMultipleTemplates($request);
        }

        return $this->storeSingleTemplate($request);
    }

    /**
     * 显示尺码模板详情
     * Show size template details
     *
     * 支持两种模式：
     * 1. 传入category_id_gender_id格式 - 显示该组合下的所有templates
     * 2. 传入template_id - 显示单个template
     */
    public function view($id)
    {
        try {
            // 检查是否是category_gender组合格式 (例如: "1_2" 表示category_id=1, gender_id=2)
            if (strpos($id, '_') !== false) {
                return $this->viewTemplateGroup($id);
            }

            // 如果不是组合格式，尝试作为单个template ID处理
            return $this->viewSingleTemplate($id);
        } catch (\Exception $e) {
            Log::error('Failed to load view form: ' . $e->getMessage(), [
                'id' => $id,
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('admin.size_library.template.index')
                ->with('error', 'Failed to load view form');
        }
    }

    /**
     * 显示编辑尺码模板表单
     * Show edit size template form
     */
    public function edit($id)
    {
        try {
            $sizeTemplate = SizeTemplate::with(['category', 'gender', 'sizeLibrary'])->findOrFail($id);
            $categories = Category::where('category_status', 'Available')->get();
            $genders = Gender::where('gender_status', 'Available')->get();
            // 根據當前模板的 category 過濾 size libraries
            $sizeLibraries = SizeLibrary::where('size_status', 'Available')
                ->where('category_id', $sizeTemplate->category_id)
                ->with('category')
                ->get();

            return view('admin.template.update', compact('sizeTemplate', 'categories', 'genders', 'sizeLibraries'));
        } catch (\Exception $e) {
            Log::error('Failed to load edit form: ' . $e->getMessage(), [
                'id' => $id,
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('admin.size_library.template.index')
                ->with('error', 'Failed to load edit form');
        }
    }

    /**
     * 更新尺码模板信息
     * Update size template information
     */
    public function update(Request $request, $id)
    {
        try {
            $sizeTemplate = SizeTemplate::findOrFail($id);

            Log::info('Update request received', [
                'id' => $id,
                'request_data' => $request->all(),
                'is_ajax' => request()->ajax()
            ]);

            // 验证请求数据
            $rules = self::TEMPLATE_RULES;
            $rules['template_status'] = 'required|in:' . implode(',', self::STATUSES);

            $validatedData = $request->validate($rules);

            // 检查模板组合是否已存在（排除当前记录）
            $existingTemplate = SizeTemplate::where('category_id', $validatedData['category_id'])
                ->where('gender_id', $validatedData['gender_id'])
                ->where('size_library_id', $validatedData['size_library_id'])
                ->where('id', '!=', $id)
                ->first();

            if ($existingTemplate) {
                $message = "This template combination already exists";

                if ($request->ajax()) {
                    return response()->json([
                        'success' => false,
                        'message' => $message,
                        'errors' => [
                            'size_library_id' => [$message]
                        ]
                    ], 422);
                }

                return back()->withErrors(['size_library_id' => $message])->withInput();
            }

            // 更新尺码模板记录
            $sizeTemplate->update([
                'category_id' => $validatedData['category_id'],
                'gender_id' => $validatedData['gender_id'],
                'size_library_id' => $validatedData['size_library_id'],
                'template_status' => $validatedData['template_status'],
            ]);

            $this->logOperation('updated', [
                'size_template_id' => $id,
                'category_id' => $validatedData['category_id'],
                'gender_id' => $validatedData['gender_id'],
                'size_library_id' => $validatedData['size_library_id'],
                'template_status' => $validatedData['template_status']
            ]);

            if ($request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Template updated successfully!',
                    'data' => $sizeTemplate->load(['category', 'gender', 'sizeLibrary'])
                ]);
            }

            return redirect()->route('admin.size_library.template.index')
                ->with('success', 'SizeTemplate updated successfully!');

        } catch (\Exception $e) {
            return $this->handleError($request, 'Failed to update template: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 删除尺码模板
     * Delete size template
     */
    public function destroy($id)
    {
        try {
            $sizeTemplate = SizeTemplate::findOrFail($id);
            $sizeTemplate->delete();

            $this->logOperation('deleted', ['size_template_id' => $id]);

            // 检查是否是 AJAX 请求
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'SizeTemplate deleted successfully!'
                ])->header('Content-Type', 'application/json');
            }

            return redirect()->route('admin.size_library.template.index')
                ->with('success', 'SizeTemplate deleted successfully!');

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to delete size template: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 根据类别、性别和尺码类型获取可用的尺码库
     * Get available size libraries based on category, gender and size type
     */
    public function getAvailableSizeLibraries(Request $request)
    {
        try {
            $categoryId = $request->input('category_id');
            $genderId = $request->input('gender_id');

            Log::info('getAvailableSizeLibraries called', [
                'category_id' => $categoryId,
                'gender_id' => $genderId
            ]);

            // 如果 category_id 或 gender_id 为 0，获取所有可用的尺码库
            if ($categoryId == 0 || $genderId == 0) {
                $sizeLibraries = SizeLibrary::where('size_status', 'Available')
                    ->with('category')
                    ->orderBy('category_id')
                    ->orderBy('id')
                    ->get();
            } else {
                // 只獲取該類別下的所有可用尺碼庫
                $sizeLibraries = SizeLibrary::where('category_id', $categoryId)
                    ->where('size_status', 'Available')
                    ->orderBy('id')
                    ->get();
            }

            $sizeLibraries = $sizeLibraries->map(function ($sizeLibrary) {
                return [
                    'id' => $sizeLibrary->id,
                    'size_value' => $sizeLibrary->size_value,
                    'size_status' => $sizeLibrary->size_status
                ];
            });

            Log::info('Returning linked size libraries', [
                'count' => $sizeLibraries->count(),
                'libraries' => $sizeLibraries->pluck('size_value')->toArray()
            ]);

            return response()->json([
                'success' => true,
                'data' => $sizeLibraries
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get available size libraries: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to get available size libraries'], 500);
        }
    }

    /**
     * 设置模板为可用状态
     * Set template to available status
     */
    public function setAvailable(Request $request, $id)
    {
        try {
            $template = SizeTemplate::findOrFail($id);
            $template->template_status = 'Available';
            $template->save();

            $this->logOperation('set to available', ['template_id' => $id]);

            if ($request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Template status updated to available successfully!'
                ]);
            }

            return redirect()->back()->with('success', 'Template status updated to available successfully!');

        } catch (\Exception $e) {
            return $this->handleError($request, 'Failed to update template status: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 设置模板为不可用状态
     * Set template to unavailable status
     */
    public function setUnavailable(Request $request, $id)
    {
        try {
            $template = SizeTemplate::findOrFail($id);
            $template->template_status = 'Unavailable';
            $template->save();

            $this->logOperation('set to unavailable', ['template_id' => $id]);

            if ($request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Template status updated to unavailable successfully!'
                ]);
            }

            return redirect()->back()->with('success', 'Template status updated to unavailable successfully!');

        } catch (\Exception $e) {
            return $this->handleError($request, 'Failed to update template status: ' . $e->getMessage(), $e);
        }
    }

    // =============================================================================
    // 私有辅助方法 (Private Helper Methods)
    // =============================================================================

    /**
     * 获取模板数据（AJAX）
     * Get templates data for AJAX requests
     */
    private function getTemplatesData()
    {
        try {
            $sizeTemplates = SizeTemplate::with(['category', 'gender', 'sizeLibrary'])
                ->join('size_libraries', 'size_templates.size_library_id', '=', 'size_libraries.id')
                ->orderBy('size_libraries.size_value', 'asc')
                ->select('size_templates.*')
                ->get();

            // 按 category + gender 组合分组
            $groupedTemplates = $sizeTemplates->groupBy(function ($template) {
                return $template->category_id . '_' . $template->gender_id;
            })->map(function ($templates, $key) {
                $firstTemplate = $templates->first();
                return [
                    'group_key' => $key,
                    'category' => $firstTemplate->category,
                    'gender' => $firstTemplate->gender,
                    'templates' => $templates->values()->toArray()
                ];
            })->values();

            return response()->json([
                'success' => true,
                'data' => $groupedTemplates,
                'total_templates' => $sizeTemplates->count(), // 添加模板總數
                'total_groups' => $groupedTemplates->count(), // 添加分組總數
                'pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => $sizeTemplates->count(), // 使用模板總數
                    'total' => $sizeTemplates->count(), // 使用模板總數
                    'from' => 1,
                    'to' => $sizeTemplates->count(),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('SizeTemplate management error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch size templates: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * 批量创建模板
     * Store multiple templates
     */
    private function storeMultipleTemplates(Request $request)
    {
        $templates = $request->templates;

        // 限制批量创建数量
        if (count($templates) > self::MAX_BULK_TEMPLATES) {
            return $this->handleError($request, 'Cannot create more than ' . self::MAX_BULK_TEMPLATES . ' templates at once');
        }

        $createdTemplates = [];
        $errors = [];

        // 预处理：收集所有模板组合进行批量检查
        $combinationsToCheck = [];
        foreach ($templates as $index => $templateData) {
            $templateData = $this->normalizeTemplateData($templateData);
            if (isset($templateData['category_id']) && isset($templateData['gender_id']) && isset($templateData['size_library_id'])) {
                $combinationsToCheck[] = [
                    'category_id' => $templateData['category_id'],
                    'gender_id' => $templateData['gender_id'],
                    'size_library_id' => $templateData['size_library_id']
                ];
            }
        }

        $existingCombinations = SizeTemplate::where(function($query) use ($combinationsToCheck) {
            foreach ($combinationsToCheck as $combination) {
                $query->orWhere(function($q) use ($combination) {
                    $q->where('category_id', $combination['category_id'])
                      ->where('gender_id', $combination['gender_id'])
                      ->where('size_library_id', $combination['size_library_id']);
                });
            }
        })->get(['category_id', 'gender_id', 'size_library_id'])->map(function($item) {
            return $item->category_id . '_' . $item->gender_id . '_' . $item->size_library_id;
        })->toArray();

        foreach ($templates as $index => $templateData) {
            $templateData = $this->normalizeTemplateData($templateData);

            $validator = \Validator::make($templateData, self::TEMPLATE_RULES);

            if ($validator->fails()) {
                $errors[] = "Template " . ($index + 1) . ": " . implode(', ', $validator->errors()->all());
                continue;
            }

            // 检查模板组合是否已存在
            $combinationKey = $templateData['category_id'] . '_' . $templateData['gender_id'] . '_' . $templateData['size_library_id'];
            if (in_array($combinationKey, $existingCombinations)) {
                $errors[] = "Template " . ($index + 1) . ": This template combination already exists";
                continue;
            }

            try {
                $template = SizeTemplate::create([
                    'category_id' => $templateData['category_id'],
                    'gender_id' => $templateData['gender_id'],
                    'size_library_id' => $templateData['size_library_id'],
                    'template_status' => 'Available', // 默認為 Available
                ]);
                $createdTemplates[] = $template;

                $this->logOperation('created (batch)', [
                    'template_id' => $template->id,
                    'category_id' => $templateData['category_id'],
                    'gender_id' => $templateData['gender_id'],
                    'size_library_id' => $templateData['size_library_id']
                ]);
            } catch (\Exception $e) {
                $simplifiedError = $this->simplifyErrorMessage($e->getMessage());
                $errorMessage = $simplifiedError ?: $e->getMessage();
                $errors[] = "Template " . ($index + 1) . ": " . $errorMessage;
            }
        }

        if ($request->ajax()) {
            if (count($errors) > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some templates failed to create',
                    'errors' => $errors,
                    'created_count' => count($createdTemplates)
                ], 422);
            } else {
                return response()->json([
                    'success' => true,
                    'message' => count($createdTemplates) . ' templates created successfully',
                    'data' => $createdTemplates
                ]);
            }
        }

        if (count($errors) > 0) {
            return back()->withErrors(['error' => implode('; ', $errors)])
                ->withInput();
        }

        return redirect()->route('admin.size_library.template.index')
            ->with('success', count($createdTemplates) . ' templates created successfully');
    }

    /**
     * 单个创建模板
     * Store single template
     */
    private function storeSingleTemplate(Request $request)
    {
        $request->validate(self::TEMPLATE_RULES);

        // 检查模板组合是否已存在
        $existingTemplate = SizeTemplate::where('category_id', $request->category_id)
            ->where('gender_id', $request->gender_id)
            ->where('size_library_id', $request->size_library_id)
            ->first();

        if ($existingTemplate) {
            if ($request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'This template combination already exists'
                ], 422);
            }
            return back()->withErrors(['error' => 'This template combination already exists'])
                ->withInput();
        }

        try {
            $template = SizeTemplate::create([
                'category_id' => $request->category_id,
                'gender_id' => $request->gender_id,
                'size_library_id' => $request->size_library_id,
                'template_status' => 'Available', // 默認為 Available
            ]);

            $this->logOperation('created (single)', [
                'template_id' => $template->id,
                'category_id' => $request->category_id,
                'gender_id' => $request->gender_id,
                'size_library_id' => $request->size_library_id
            ]);

            if ($request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Template created successfully',
                    'data' => $template->load(['category', 'gender', 'sizeLibrary'])
                ]);
            }

            return redirect()->route('admin.size_library.template.index')
                ->with('success', 'Size template created successfully');
        } catch (\Exception $e) {
            return $this->handleError($request, 'Failed to create size template: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 查看模板组（category + gender 组合）
     * View template group (category + gender combination)
     */
    private function viewTemplateGroup($id)
    {
        $parts = explode('_', $id);
        if (count($parts) === 2) {
            $categoryId = $parts[0];
            $genderId = $parts[1];

            $category = Category::find($categoryId);
            $gender = Gender::find($genderId);

            if ($category && $gender) {
                // 获取该category+gender组合下的所有templates，按size_value排序
                $sizeTemplates = SizeTemplate::where('size_templates.category_id', $categoryId)
                    ->where('size_templates.gender_id', $genderId)
                    ->with(['category', 'gender', 'sizeLibrary'])
                    ->join('size_libraries', 'size_templates.size_library_id', '=', 'size_libraries.id')
                    ->orderBy('size_libraries.size_value', 'asc')
                    ->select('size_templates.*')
                    ->get();

                $categories = Category::where('category_status', 'Available')->get();
                $genders = Gender::where('gender_status', 'Available')->get();
                $sizeLibraries = SizeLibrary::where('size_status', 'Available')->get();

                return view('admin.template.view', compact('sizeTemplates', 'categories', 'genders', 'sizeLibraries', 'category', 'gender'));
            }
        }

        throw new \Exception('Invalid category_gender combination format');
    }

    /**
     * 查看单个模板
     * View single template
     */
    private function viewSingleTemplate($id)
    {
        $sizeTemplate = SizeTemplate::with(['category', 'gender', 'sizeLibrary'])->findOrFail($id);
        $categories = Category::where('category_status', 'Available')->get();
        $genders = Gender::where('gender_status', 'Available')->get();
        $sizeLibraries = SizeLibrary::where('size_status', 'Available')->get();

        return view('admin.template.view', compact('sizeTemplate', 'categories', 'genders', 'sizeLibraries'));
    }

    /**
     * 处理重复模板错误
     * Handle duplicate template error
     */
    private function handleDuplicateTemplate(Request $request, $message)
    {
        if ($request->ajax()) {
            return response()->json([
                'success' => false,
                'message' => $message,
                'errors' => [
                    'template_combination' => [$message]
                ]
            ], 422);
        }

        return back()->withErrors(['template_combination' => $message])->withInput();
    }

}
