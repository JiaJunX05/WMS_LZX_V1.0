<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\ManagementTool\Color;

/**
 * 颜色管理控制器
 *
 * 功能模块：
 * - 颜色列表展示：搜索、筛选、分页
 * - 颜色操作：创建、编辑、删除、状态管理
 * - 颜色代码管理：HEX、RGB 代码
 *
 * @author WMS Team
 * @version 1.0.0
 */
class ColorController extends Controller
{
    // Constants for better maintainability
    private const MAX_BULK_COLORS = 10;
    private const STATUSES = ['Available', 'Unavailable'];

    // Validation rules
    private const COLOR_RULES = [
        'color_name' => 'required|string|max:255',
        'color_hex' => 'required|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
        'color_rgb' => 'nullable|string|max:255',
    ];

    /**
     * Normalize color data from frontend
     */
    private function normalizeColorData(array $colorData): array
    {
        // Convert camelCase to snake_case
        if (isset($colorData['colorName']) && !isset($colorData['color_name'])) {
            $colorData['color_name'] = $colorData['colorName'];
        }
        if (isset($colorData['colorHex']) && !isset($colorData['color_hex'])) {
            $colorData['color_hex'] = $colorData['colorHex'];
        }
        if (isset($colorData['colorRgb']) && !isset($colorData['color_rgb'])) {
            $colorData['color_rgb'] = $colorData['colorRgb'];
        }
        if (isset($colorData['colorStatus']) && !isset($colorData['color_status'])) {
            $colorData['color_status'] = $colorData['colorStatus'];
        }

        return $colorData;
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
        if (strpos($errorMessage, 'Duplicate entry') !== false && strpos($errorMessage, 'colors_color_name_unique') !== false) {
            return 'Color name already exists. Please choose a different name.';
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
        Log::info("Color {$action}", array_merge([
            'timestamp' => now()->toISOString(),
            'ip' => request()->ip(),
        ], $data));
    }
    /**
     * 显示颜色列表页面
     */
    public function index(Request $request)
    {
        if ($request->ajax()) {
            try {
                $query = Color::query();

                // 搜索功能
                if ($request->has('search') && $request->search) {
                    $search = $request->search;
                    $query->where(function($q) use ($search) {
                        $q->where('color_name', 'like', "%{$search}%")
                          ->orWhere('color_hex', 'like', "%{$search}%")
                          ->orWhere('color_rgb', 'like', "%{$search}%");
                    });
                }

                // 状态筛选
                if ($request->has('status_filter') && $request->status_filter) {
                    $query->where('color_status', $request->status_filter);
                }

                $colors = $query->paginate(10);

                return response()->json([
                    'success' => true,
                    'data' => $colors->items(),
                    'pagination' => [
                        'current_page' => $colors->currentPage(),
                        'last_page' => $colors->lastPage(),
                        'per_page' => $colors->perPage(),
                        'total' => $colors->total(),
                        'from' => $colors->firstItem(),
                        'to' => $colors->lastItem(),
                    ]
                ]);
            } catch (\Exception $e) {
                Log::error('Color management error: ' . $e->getMessage());
                return response()->json(['error' => 'Failed to fetch colors'], 500);
            }
        }

        $colors = Color::paginate(10);
        return view('admin.color_dashboard', compact('colors'));
    }

    /**
     * 显示创建颜色表单
     */
    public function create()
    {
        return view('admin.color_create');
    }

    /**
     * 存储新颜色
     */
    public function store(Request $request)
    {
        // 与 BrandController 的实现保持一致：有数组走批量，否则走单个
        if ($request->has('colors') && is_array($request->input('colors'))) {
            return $this->storeMultipleColors($request);
        }

        return $this->storeSingleColor($request);
    }

    /**
     * 单个存储颜色
     */
    private function storeSingleColor(Request $request)
    {
        // 校验
        $rules = self::COLOR_RULES;
        $rules['color_name'] .= '|unique:colors,color_name';

        $request->validate($rules);

        try {
            $colorData = [
                'color_name' => $request->input('color_name') ?? $request->input('colorName'),
                'color_hex' => $request->input('color_hex') ?? $request->input('colorHex'),
                'color_rgb' => $request->input('color_rgb') ?? $request->input('colorRgb'),
                'color_status' => 'Available', // Hardcoded to Available
            ];

            $color = Color::create($colorData);

            $this->logOperation('created (single)', [
                'color_id' => $color->id,
                'color_name' => $colorData['color_name']
            ]);

            $message = 'Color created successfully!';

            if ($request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $color
                ]);
            }

            return redirect()->route('admin.management_tool.color.index')
                ->with('success', $message);

        } catch (\Exception $e) {
            return $this->handleError($request, 'Failed to create color: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 批量存储颜色（统一入口）
     */
    private function storeMultipleColors(Request $request)
    {
        // 仅处理批量数组
        $colors = $request->input('colors', []);

        // 限制批量创建数量
        if (count($colors) > self::MAX_BULK_COLORS) {
            return $this->handleError($request, 'Cannot create more than ' . self::MAX_BULK_COLORS . ' colors at once');
        }

        $createdColors = [];
        $errors = [];

        // 预处理：收集所有颜色名称进行批量检查
        $colorNamesToCheck = [];
        foreach ($colors as $index => $colorData) {
            $colorData = $this->normalizeColorData($colorData);
            if (isset($colorData['color_name'])) {
                $colorNamesToCheck[] = $colorData['color_name'];
            }
        }

        $existingColorNames = Color::whereIn('color_name', $colorNamesToCheck)
            ->pluck('color_name')
            ->toArray();

        foreach ($colors as $index => $colorData) {
            $colorData = $this->normalizeColorData($colorData);

            $validator = \Validator::make($colorData, self::COLOR_RULES);

            if ($validator->fails()) {
                $errors[] = "Color " . ($index + 1) . ": " . implode(', ', $validator->errors()->all());
                continue;
            }

            // 检查颜色名称是否已存在
            if (in_array($colorData['color_name'], $existingColorNames)) {
                $errors[] = "Color " . ($index + 1) . ": Color name '{$colorData['color_name']}' already exists";
                continue;
            }

            try {
                $colorRecord = [
                    'color_name' => $colorData['color_name'],
                    'color_hex' => $colorData['color_hex'],
                    'color_rgb' => $colorData['color_rgb'] ?? null,
                    'color_status' => 'Available', // Hardcoded to Available
                ];

                $color = Color::create($colorRecord);
                $createdColors[] = $color;

                $this->logOperation('created (batch)', [
                    'color_id' => $color->id,
                    'color_name' => $colorData['color_name']
                ]);
            } catch (\Exception $e) {
                $simplifiedError = $this->simplifyErrorMessage($e->getMessage());
                $errorMessage = $simplifiedError ?: $e->getMessage();
                $errors[] = "Color " . ($index + 1) . ": " . $errorMessage;
            }
        }

        if ($request->ajax()) {
            if (count($errors) > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some colors failed to create',
                    'errors' => $errors,
                    'created_count' => count($createdColors)
                ], 422);
            } else {
                return response()->json([
                    'success' => true,
                    'message' => count($createdColors) . ' colors created successfully',
                    'data' => $createdColors
                ]);
            }
        }

        if (count($errors) > 0) {
            return back()->withErrors(['error' => implode('; ', $errors)])
                ->withInput();
        }

        return redirect()->route('admin.management_tool.color.index')
            ->with('success', count($createdColors) . ' colors created successfully');
    }

    /**
     * 显示编辑颜色表单
     */
    public function edit($id)
    {
        $color = Color::findOrFail($id);
        return view('admin.color_update', compact('color'));
    }

    /**
     * 更新颜色信息
     */
    public function update(Request $request, $id)
    {
        try {
            $color = Color::findOrFail($id);

            Log::info('Update request received', [
                'id' => $id,
                'request_data' => $request->all(),
                'is_ajax' => request()->ajax()
            ]);

            // 验证请求数据
            $rules = self::COLOR_RULES;
            $rules['color_status'] = 'required|in:' . implode(',', self::STATUSES);

            $validatedData = $request->validate($rules);

            // 检查颜色名称是否已存在（排除当前记录）
            $existingColor = Color::where('color_name', $validatedData['color_name'])
                ->where('id', '!=', $id)
                ->first();

            if ($existingColor) {
                $message = "Color name '{$validatedData['color_name']}' already exists";

                if ($request->ajax()) {
                    return response()->json([
                        'success' => false,
                        'message' => $message,
                        'errors' => [
                            'color_name' => [$message]
                        ]
                    ], 422);
                }

                return back()->withErrors(['color_name' => $message])->withInput();
            }

            // 更新颜色记录
            $color->update([
                'color_name' => $validatedData['color_name'],
                'color_hex' => $validatedData['color_hex'],
                'color_rgb' => $validatedData['color_rgb'],
                'color_status' => $validatedData['color_status'],
            ]);

            $this->logOperation('updated', [
                'color_id' => $id,
                'color_name' => $validatedData['color_name'],
                'color_hex' => $validatedData['color_hex'],
                'color_status' => $validatedData['color_status']
            ]);

            $message = 'Color updated successfully';

            if ($request->ajax()) {
                $freshColor = $color->fresh();
                Log::info('AJAX response data', [
                    'success' => true,
                    'message' => $message,
                    'data' => $freshColor
                ]);

                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $freshColor
                ]);
            }

            return redirect()->route('admin.management_tool.color.index')
                ->with('success', $message);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Color update validation failed', [
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
            return $this->handleError($request, 'Failed to update color: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 设置颜色为可用状态
     */
    public function setAvailable($id)
    {
        try {
            $color = Color::findOrFail($id);
            $color->update(['color_status' => 'Available']);

            $this->logOperation('set to available', ['color_id' => $id]);

            // 返回 JSON 响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Color has been set to available status',
                    'data' => $color
                ]);
            }

            return redirect()->route('admin.management_tool.color.index')
                ->with('success', 'Color has been set to available status');

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to set color available: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 设置颜色为不可用状态
     */
    public function setUnavailable($id)
    {
        try {
            $color = Color::findOrFail($id);
            $color->update(['color_status' => 'Unavailable']);

            $this->logOperation('set to unavailable', ['color_id' => $id]);

            // 返回 JSON 响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Color has been set to unavailable status',
                    'data' => $color
                ]);
            }

            return redirect()->route('admin.management_tool.color.index')
                ->with('success', 'Color has been set to unavailable status');

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to set color unavailable: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 删除颜色
     */
    public function destroy($id)
    {
        try {
            $color = Color::findOrFail($id);
            $color->delete();

            $this->logOperation('deleted', ['color_id' => $id]);

            // 返回 JSON 响应
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Color deleted successfully!',
                    'data' => [
                        'id' => $id,
                        'name' => $color->color_name
                    ]
                ]);
            }

            return redirect()->route('admin.management_tool.color.index')
                ->with('success', 'Color deleted successfully!');

        } catch (\Exception $e) {
            return $this->handleError(request(), 'Failed to delete color: ' . $e->getMessage(), $e);
        }
    }
}
