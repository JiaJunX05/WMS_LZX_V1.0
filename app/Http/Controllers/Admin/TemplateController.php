<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\SizeTemplate;
use App\Models\SizeLibrary;
use App\Models\Category;

/**
 * 尺码模板管理控制器
 * Size Template Management Controller
 *
 * 功能模块：
 * - 模板列表展示：搜索、筛选、分页
 * - 模板操作：创建、编辑、删除、查看
 * - 模板组合管理：类别+性别+尺码库的组合
 * - 状态管理：可用/不可用状态切换
 * - 动态数据：根据类别和性别获取可用尺码库
 *
 * @author WMS Team
 * @version 3.0.0
 */
class TemplateController extends Controller
{
    // =============================================================================
    // 常量定义 (Constants)
    // =============================================================================

    /**
     * 批量创建最大数量
     */
    private const MAX_BULK_TEMPLATES = 100; // 增加到 100，如果需要移除限制可以设置为 PHP_INT_MAX

    /**
     * 状态常量
     */
    private const STATUSES = ['Available', 'Unavailable'];

    /**
     * 模板验证规则
     */
    private const TEMPLATE_RULES = [
        'category_id' => 'required|exists:categories,id',
        'gender' => 'required|in:Men,Women,Kids,Unisex',
        'size_library_id' => 'required|exists:size_libraries,id',
    ];

    // =============================================================================
    // 私有辅助方法 (Private Helper Methods)
    // =============================================================================

    /**
     * 标准化模板数据
     * Normalize template data from frontend
     *
     * @param array $templateData
     * @return array
     */
    private function normalizeTemplateData(array $templateData): array
    {
        // Convert camelCase to snake_case
        if (isset($templateData['categoryId']) && !isset($templateData['category_id'])) {
            $templateData['category_id'] = $templateData['categoryId'];
        }
        if (isset($templateData['genderId']) && !isset($templateData['gender'])) {
            $templateData['gender'] = $templateData['genderId'];
        }
        if (isset($templateData['gender_id']) && !isset($templateData['gender'])) {
            $templateData['gender'] = $templateData['gender_id'];
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
     * 统一错误处理
     * Handle errors consistently
     *
     * @param Request $request
     * @param string $message
     * @param \Exception|null $e
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    private function handleError(Request $request, string $message, \Exception $e = null): \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
    {
        if ($e) {
            $simplifiedMessage = $this->simplifyErrorMessage($e->getMessage());

            Log::error($message . ': ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

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
     * 简化数据库错误信息
     * Simplify database error messages
     *
     * @param string $errorMessage
     * @return string|null
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

        return null;
    }

    /**
     * 记录操作日志
     * Log operation for audit trail
     *
     * @param string $action
     * @param array $data
     * @return void
     */
    private function logOperation(string $action, array $data = []): void
    {
        Log::info("Template {$action}", array_merge([
            'timestamp' => now()->toISOString(),
            'ip' => request()->ip(),
        ], $data));
    }

    // =============================================================================
    // 公共方法 (Public Methods)
    // =============================================================================

    /**
     * 显示尺码模板列表页面
     * Display size template list page
     *
     * @param Request $request
     * @return \Illuminate\View\View|\Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        if ($request->ajax()) {
            return $this->getTemplatesData();
        }

        $sizeTemplates = SizeTemplate::with(['category', 'sizeLibrary'])
            ->join('size_libraries', 'size_templates.size_library_id', '=', 'size_libraries.id')
            ->orderBy('size_libraries.size_value', 'asc')
            ->select('size_templates.*')
            ->get();
        $categories = Category::where('category_status', 'Available')->get();

        return view('admin.template.dashboard', compact('sizeTemplates', 'categories'));
    }

    /**
     * 获取创建模板数据（现在通过 modal，只返回 JSON）
     * Get create template data (now through modal, returns JSON only)
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function create()
    {
        $categories = Category::where('category_status', 'Available')->get();

        return response()->json([
            'success' => true,
            'categories' => $categories
        ]);
    }

    /**
     * 存储新尺码模板
     * Store new size template
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
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
     * 1. 传入 category_id_gender 格式 - 显示该组合下的所有 templates
     * 2. 传入 template_id - 显示单个 template
     *
     * @param int|string $id
     * @return \Illuminate\View\View
     */
    public function view($id)
    {
        try {
            // 检查是否是 category_gender 组合格式 (例如: "1_Men" 表示 category_id=1, gender=Men)
            if (strpos($id, '_') !== false) {
                return $this->viewTemplateGroup($id);
            }

            // 如果不是组合格式，尝试作为单个 template ID 处理
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
     *
     * @param int $id
     * @return \Illuminate\View\View
     */
    public function edit($id)
    {
        try {
            $sizeTemplate = SizeTemplate::with(['category', 'sizeLibrary'])->findOrFail($id);
            $categories = Category::where('category_status', 'Available')->get();

            // 根据当前模板的 category 过滤 size libraries
            $sizeLibraries = SizeLibrary::where('size_status', 'Available')
                ->where('category_id', $sizeTemplate->category_id)
                ->with('category')
                ->get();

            return view('admin.template.update', compact('sizeTemplate', 'categories', 'sizeLibraries'));
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
     * 显示尺码模板编辑表单（用于 Modal）
     * Show size template edit form (for Modal)
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function showEditForm(Request $request, $id)
    {
        try {
            $template = SizeTemplate::with(['category', 'sizeLibrary'])->findOrFail($id);

            // 如果是 AJAX 请求，返回 JSON 数据（用于 Modal）
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Size template data fetched successfully',
                    'data' => [
                        'id' => $template->id,
                        'category_id' => $template->category_id,
                        'gender' => $template->gender,
                        'size_library_id' => $template->size_library_id,
                        'template_status' => $template->template_status,
                        'category_name' => $template->category->category_name ?? '',
                        'size_value' => $template->sizeLibrary->size_value ?? ''
                    ]
                ]);
            }

            // 非 AJAX 请求重定向到管理页面
            return redirect()->route('admin.size_library.template.index');
        } catch (\Exception $e) {
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to load size template data: ' . $e->getMessage()
                ], 404);
            }
            return redirect()->route('admin.size_library.template.index')
                ->with('error', 'Size template not found');
        }
    }

    /**
     * 更新尺码模板信息
     * Update size template information
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
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
                ->where('gender', $validatedData['gender'])
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
                'gender' => $validatedData['gender'],
                'size_library_id' => $validatedData['size_library_id'],
                'template_status' => $validatedData['template_status'],
            ]);

            $this->logOperation('updated', [
                'size_template_id' => $id,
                'category_id' => $validatedData['category_id'],
                'gender' => $validatedData['gender'],
                'size_library_id' => $validatedData['size_library_id'],
                'template_status' => $validatedData['template_status']
            ]);

            $message = 'Template updated successfully!';

            if ($request->ajax()) {
                $freshTemplate = $sizeTemplate->fresh(['category', 'sizeLibrary']);

                Log::info('AJAX response data', [
                    'success' => true,
                    'message' => $message,
                    'data' => $freshTemplate
                ]);

                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $freshTemplate
                ]);
            }

            return redirect()->route('admin.size_library.template.index')
                ->with('success', $message);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Template update validation failed', [
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
            return $this->handleError($request, 'Failed to update template: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 删除尺码模板
     * Delete size template
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        try {
            $sizeTemplate = SizeTemplate::findOrFail($id);
            $sizeTemplate->delete();

            $this->logOperation('deleted', ['size_template_id' => $id]);

            if (request()->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Template deleted successfully!'
                ]);
            }

            return redirect()->route('admin.size_library.template.index')
                ->with('success', 'Template deleted successfully!');

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to delete size template: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 根据类别和性别获取可用的尺码库
     * Get available size libraries based on category and gender
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAvailableSizeLibraries(Request $request)
    {
        try {
            $categoryId = $request->input('category_id');
            $gender = $request->input('gender');

            Log::info('getAvailableSizeLibraries called', [
                'category_id' => $categoryId,
                'gender' => $gender
            ]);

            // 如果 category_id 为 0 或 gender 为空，获取所有可用的尺码库
            if ($categoryId == 0 || empty($gender)) {
                $sizeLibraries = SizeLibrary::where('size_status', 'Available')
                    ->with('category')
                    ->orderBy('category_id')
                    ->orderBy('id')
                    ->get();
            } else {
                // 只获取该类别下的所有可用尺码库
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
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function setAvailable($id)
    {
        try {
            Log::info('setAvailable called', ['id' => $id, 'is_ajax' => request()->ajax()]);

            $template = SizeTemplate::findOrFail($id);
            $template->update(['template_status' => 'Available']);

            $this->logOperation('set to available', ['template_id' => $id]);

            $message = 'Template has been set to available status';

            if (request()->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $template->fresh()
                ]);
            }

            return redirect()->route('admin.size_library.template.index')
                ->with('success', $message);

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to set template available: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 设置模板为不可用状态
     * Set template to unavailable status
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function setUnavailable($id)
    {
        try {
            Log::info('setUnavailable called', ['id' => $id, 'is_ajax' => request()->ajax()]);

            $template = SizeTemplate::findOrFail($id);
            $template->update(['template_status' => 'Unavailable']);

            $this->logOperation('set to unavailable', ['template_id' => $id]);

            $message = 'Template has been set to unavailable status';

            if (request()->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $template->fresh()
                ]);
            }

            return redirect()->route('admin.size_library.template.index')
                ->with('success', $message);

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to set template unavailable: ' . $e->getMessage(), $e);
        }
    }

    // =============================================================================
    // 私有辅助方法 (Private Helper Methods)
    // =============================================================================

    /**
     * 获取模板数据（AJAX）
     * Get templates data for AJAX requests
     *
     * @return \Illuminate\Http\JsonResponse
     */
    private function getTemplatesData()
    {
        try {
            $sizeTemplates = SizeTemplate::with(['category', 'sizeLibrary'])
                ->join('size_libraries', 'size_templates.size_library_id', '=', 'size_libraries.id')
                ->orderBy('size_libraries.size_value', 'asc')
                ->select('size_templates.*')
                ->get();

            // 按 category + gender 组合分组
            $groupedTemplates = $sizeTemplates->groupBy(function ($template) {
                return $template->category_id . '_' . $template->gender;
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
                'total_templates' => $sizeTemplates->count(),
                'total_groups' => $groupedTemplates->count(),
                'pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => $sizeTemplates->count(),
                    'total' => $sizeTemplates->count(),
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
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
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
            if (isset($templateData['category_id']) && isset($templateData['gender']) && isset($templateData['size_library_id'])) {
                $combinationsToCheck[] = [
                    'category_id' => $templateData['category_id'],
                    'gender' => $templateData['gender'],
                    'size_library_id' => $templateData['size_library_id']
                ];
            }
        }

        $existingCombinations = SizeTemplate::where(function($query) use ($combinationsToCheck) {
            foreach ($combinationsToCheck as $combination) {
                $query->orWhere(function($q) use ($combination) {
                    $q->where('category_id', $combination['category_id'])
                      ->where('gender', $combination['gender'])
                      ->where('size_library_id', $combination['size_library_id']);
                });
            }
        })->get(['category_id', 'gender', 'size_library_id'])->map(function($item) {
            return $item->category_id . '_' . $item->gender . '_' . $item->size_library_id;
        })->toArray();

        foreach ($templates as $index => $templateData) {
            $templateData = $this->normalizeTemplateData($templateData);

            $validator = \Validator::make($templateData, self::TEMPLATE_RULES);

            if ($validator->fails()) {
                $errors[] = "Template " . ($index + 1) . ": " . implode(', ', $validator->errors()->all());
                continue;
            }

            // 检查模板组合是否已存在
            $combinationKey = $templateData['category_id'] . '_' . $templateData['gender'] . '_' . $templateData['size_library_id'];
            if (in_array($combinationKey, $existingCombinations)) {
                $errors[] = "Template " . ($index + 1) . ": This template combination already exists";
                continue;
            }

            try {
                $template = SizeTemplate::create([
                    'category_id' => $templateData['category_id'],
                    'gender' => $templateData['gender'],
                    'size_library_id' => $templateData['size_library_id'],
                    'template_status' => 'Available',
                ]);
                $createdTemplates[] = $template;

                $this->logOperation('created (batch)', [
                    'template_id' => $template->id,
                    'category_id' => $templateData['category_id'],
                    'gender' => $templateData['gender'],
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
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    private function storeSingleTemplate(Request $request)
    {
        $request->validate(self::TEMPLATE_RULES);

        // 检查模板组合是否已存在
        $existingTemplate = SizeTemplate::where('category_id', $request->category_id)
            ->where('gender', $request->gender)
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
                'gender' => $request->gender,
                'size_library_id' => $request->size_library_id,
                'template_status' => 'Available',
            ]);

            $this->logOperation('created (single)', [
                'template_id' => $template->id,
                'category_id' => $request->category_id,
                'gender' => $request->gender,
                'size_library_id' => $request->size_library_id
            ]);

            if ($request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Template created successfully',
                    'data' => $template->load(['category', 'sizeLibrary'])
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
     *
     * @param string $id
     * @return \Illuminate\View\View
     */
    private function viewTemplateGroup($id)
    {
        $parts = explode('_', $id);
        if (count($parts) === 2) {
            $categoryId = $parts[0];
            $gender = $parts[1]; // 现在 gender 是字符串值，不是 ID

            $category = Category::find($categoryId);

            if ($category && in_array($gender, ['Men', 'Women', 'Kids', 'Unisex'])) {
                // 获取该 category+gender 组合下的所有 templates，按 size_value 排序
                $sizeTemplates = SizeTemplate::where('size_templates.category_id', $categoryId)
                    ->where('size_templates.gender', $gender)
                    ->with(['category', 'sizeLibrary'])
                    ->join('size_libraries', 'size_templates.size_library_id', '=', 'size_libraries.id')
                    ->orderBy('size_libraries.size_value', 'asc')
                    ->select('size_templates.*')
                    ->get();

                $categories = Category::where('category_status', 'Available')->get();
                $sizeLibraries = SizeLibrary::where('size_status', 'Available')->get();

                return view('admin.template.view', compact('sizeTemplates', 'categories', 'sizeLibraries', 'category', 'gender'));
            }
        }

        throw new \Exception('Invalid category_gender combination format');
    }

    /**
     * 查看单个模板
     * View single template
     *
     * @param int $id
     * @return \Illuminate\View\View
     */
    private function viewSingleTemplate($id)
    {
        $sizeTemplate = SizeTemplate::with(['category', 'sizeLibrary'])->findOrFail($id);
        $categories = Category::where('category_status', 'Available')->get();
        $sizeLibraries = SizeLibrary::where('size_status', 'Available')->get();

        return view('admin.template.view', compact('sizeTemplate', 'categories', 'sizeLibraries'));
    }
}
