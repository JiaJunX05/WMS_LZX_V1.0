<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\StockMovement;
use App\Models\Product;
use App\Models\ProductVariant;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\StockHistoryExport;
use Carbon\Carbon;

class StockController extends Controller
{
    // =============================================================================
    // 常量定义 (Constants)
    // =============================================================================

    private const DEFAULT_PER_PAGE = 10;
    private const HISTORY_PER_PAGE = 15;
    private const LOW_STOCK_THRESHOLD = 10;
    private const MAX_BULK_ITEMS = 50;

    // Validation rules
    private const STOCK_RULES = [
        'product_id' => 'required|exists:products,id',
        'quantity' => 'required|integer|min:1',
        'reference_number' => 'nullable|string|max:255',
    ];

    private const BATCH_STOCK_RULES = [
        'stock_items' => 'required|array|min:1|max:' . self::MAX_BULK_ITEMS,
        'stock_items.*.product_id' => 'required|exists:products,id',
        'stock_items.*.quantity' => 'required|integer|min:1',
        'stock_items.*.reference_number' => 'nullable|string|max:255'
    ];

    /**
     * Normalize stock data from frontend
     */
    private function normalizeStockData(array $stockData): array
    {
        // Convert camelCase to snake_case
        if (isset($stockData['productId']) && !isset($stockData['product_id'])) {
            $stockData['product_id'] = $stockData['productId'];
        }
        if (isset($stockData['referenceNumber']) && !isset($stockData['reference_number'])) {
            $stockData['reference_number'] = $stockData['referenceNumber'];
        }

        return $stockData;
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
        // 处理库存不足错误
        if (strpos($errorMessage, 'Insufficient stock') !== false) {
            return 'Insufficient stock for this product.';
        }

        // 处理数据库约束错误
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
        Log::info("Stock {$action}", array_merge([
            'timestamp' => now()->toISOString(),
            'ip' => request()->ip(),
        ], $data));
    }

    // =============================================================================
    // 产品查询构建器 (Product Query Builder)
    // =============================================================================

    /**
     * 构建基础产品查询
     */
    private function buildBaseProductQuery()
    {
        return Product::with([
            'category',
            'subcategory',
            'variants.attributeVariant.brand',
            'variants.attributeVariant.color',
            'variants.attributeVariant.size',
            'variants.attributeVariant.size.category'
        ])->select([
            'id',
            'name',
            'cover_image',
            'quantity',
            'product_status',
            'category_id',
            'subcategory_id'
        ]);
    }

    /**
     * 应用搜索过滤
     */
    private function applySearchFilter($query, $search)
    {
        if (!$search) return $query;

        return $query->where(function($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhereHas('variants', function($variant) use ($search) {
                  $variant->where('sku_code', 'like', "%{$search}%")
                          ->orWhere('barcode_number', 'like', "%{$search}%");
              });
        });
    }

    /**
     * 应用品牌过滤
     */
    private function applyBrandFilter($query, $brandId)
    {
        if (!$brandId) return $query;

        return $query->whereHas('variants.attributeVariant.brand', function($brand) use ($brandId) {
            $brand->where('id', $brandId);
        });
    }

    /**
     * 应用状态过滤
     */
    private function applyStatusFilter($query, $status)
    {
        if (!$status) return $query;

        return $query->where('product_status', $status);
    }

    /**
     * 构建分页响应
     */
    private function buildPaginatedResponse($paginator)
    {
        return response()->json([
            'success' => true,
            'data' => $paginator->items(),
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ]
        ]);
    }

    // =============================================================================
    // 库存变动处理 (Stock Movement Processing)
    // =============================================================================

    /**
     * 处理单个库存变动
     */
    private function processStockMovement($productId, $quantity, $movementType, $referenceNumber = null)
    {
        $product = Product::findOrFail($productId);
        $variant = $product->variants->first();

        $previousStock = $product->quantity;

        // 验证库存是否足够（仅对出库操作）
        if ($movementType === 'stock_out' && $previousStock < $quantity) {
            throw new \Exception("Insufficient stock. Available: {$previousStock}, Requested: {$quantity}");
        }

        // 计算新库存
        $newStock = $movementType === 'stock_out'
            ? $previousStock - $quantity
            : $previousStock + $quantity;

        // 更新产品库存
        $product->quantity = $newStock;
        $product->save();

        // 记录库存变动
        StockMovement::create([
            'product_id' => $product->id,
            'variant_id' => $variant ? $variant->id : null,
            'movement_type' => $movementType,
            'quantity' => $quantity,
            'previous_stock' => $previousStock,
            'current_stock' => $newStock,
            'reference_number' => $referenceNumber,
            'user_id' => Auth::id(),
            'movement_date' => now()
        ]);

        Log::info("Stock {$movementType} recorded", [
            'product_id' => $product->id,
            'quantity' => $quantity,
            'user_id' => Auth::id(),
            'previous_stock' => $previousStock,
            'new_stock' => $newStock
        ]);

        return [
            'product_id' => $product->id,
            'product_name' => $product->name,
            'quantity' => $quantity,
            'previous_stock' => $previousStock,
            'new_stock' => $newStock
        ];
    }

    /**
     * 处理批量库存变动
     */
    private function processBatchStockMovement($items, $movementType)
    {
        $processedItems = [];
        $errors = [];

        // 按产品ID分组，合并相同产品的数量
        $groupedItems = [];
        foreach ($items as $item) {
            $productId = $item['product_id'];
            if (!isset($groupedItems[$productId])) {
                $groupedItems[$productId] = [
                    'product_id' => $productId,
                    'quantity' => 0,
                    'reference_number' => $item['reference_number'] ?? null
                ];
            }
            $groupedItems[$productId]['quantity'] += $item['quantity'];
        }

        foreach ($groupedItems as $item) {
            try {
                $result = $this->processStockMovement(
                    $item['product_id'],
                    $item['quantity'],
                    $movementType,
                    $item['reference_number']
                );
                $processedItems[] = $result;
            } catch (\Exception $e) {
                $errors[] = "Product {$item['product_id']}: " . $e->getMessage();
                Log::error("Batch Stock {$movementType} error for product {$item['product_id']}: " . $e->getMessage());
            }
        }

        return [
            'processed_items' => $processedItems,
            'errors' => $errors
        ];
    }

    // =============================================================================
    // 库存历史查询构建器 (Stock History Query Builder)
    // =============================================================================

    /**
     * 构建基础库存历史查询
     */
    private function buildBaseStockHistoryQuery()
    {
        $query = StockMovement::with([
            'user:id,name,email',
            'product:id,name,cover_image',
            'variant:id,product_id,sku_code,barcode_number'
        ])->orderBy('movement_date', 'desc');

        // 权限控制：Staff 只能看到自己的记录
        $userRole = auth()->user()->getAccountRole();
        if ($userRole === 'Staff') {
            $query->where('user_id', auth()->id());
        }

        return $query;
    }

    /**
     * 应用库存历史过滤
     */
    private function applyStockHistoryFilters($query, $request)
    {
        // 日期筛选
        if ($request->filled('start_date')) {
            $query->where('movement_date', '>=', $request->start_date . ' 00:00:00');
        }

        if ($request->filled('end_date')) {
            $query->where('movement_date', '<=', $request->end_date . ' 23:59:59');
        }

        // 变动类型筛选
        if ($request->filled('movement_type') && $request->movement_type !== 'all') {
            $query->where('movement_type', $request->movement_type);
        }

        // 产品ID筛选
        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        // 产品搜索
        if ($request->filled('product_search')) {
            $search = $request->product_search;
            $query->where(function($q) use ($search) {
                $q->whereHas('product', function($productQuery) use ($search) {
                    $productQuery->where('name', 'like', "%{$search}%");
                })->orWhereHas('variant', function($variantQuery) use ($search) {
                    $variantQuery->where('sku_code', 'like', "%{$search}%")
                               ->orWhere('barcode_number', 'like', "%{$search}%");
                })->orWhere('reference_number', 'like', "%{$search}%");
            });
        }

        return $query;
    }

    /**
     * 格式化库存历史数据
     */
    private function formatStockHistoryData($movements)
    {
        return $movements->map(function ($movement) {
            $skuCode = $movement->variant && $movement->variant->sku_code
                ? $movement->variant->sku_code
                : 'N/A';

            return [
                'id' => $movement->id,
                'date' => $movement->movement_date->format('Y-m-d H:i:s'),
                'movement_type' => $movement->movement_type,
                'product_id' => $movement->product_id,
                'product_name' => $movement->product->name ?? 'N/A',
                'product_image' => $movement->product->cover_image ?? null,
                'sku_code' => $skuCode,
                'barcode_number' => $movement->variant->barcode_number ?? null,
                'quantity' => $movement->quantity,
                'previous_stock' => $movement->previous_stock,
                'current_stock' => $movement->current_stock,
                'reference_number' => $movement->reference_number,
                'user_id' => $movement->user_id,
                'user_name' => $movement->user->name ?? 'Unknown User',
                'user_email' => $movement->user->email ?? null,
            ];
        });
    }
    // =============================================================================
    // 公共方法 (Public Methods)
    // =============================================================================

    /**
     * 显示库存管理页面
     */
    public function stockManagement(Request $request) {
        if ($request->ajax()) {
            try {
                $query = $this->buildBaseProductQuery();
                $query = $this->applySearchFilter($query, $request->search);
                $query = $this->applyBrandFilter($query, $request->brand_filter);
                $query = $this->applyStatusFilter($query, $request->status_filter);

                $perPage = $request->get('per_page', self::DEFAULT_PER_PAGE);
                $products = $query->paginate($perPage);

                return $this->buildPaginatedResponse($products);
            } catch (\Exception $e) {
                return $this->handleError($request, 'Failed to fetch products: ' . $e->getMessage(), $e);
            }
        }

        return view('stock_movement.stock_dashboard');
    }

    /**
     * 显示库存入库页面
     */
    public function stockInPage(Request $request) {
        if ($request->ajax()) {
            $query = $this->buildBaseProductQuery();
            $query = $this->applySearchFilter($query, $request->search);

            $perPage = $request->get('per_page', self::DEFAULT_PER_PAGE);
            $products = $query->paginate($perPage);

            return $this->buildPaginatedResponse($products);
        }

        $products = $this->buildBaseProductQuery()->paginate(self::DEFAULT_PER_PAGE);
        $selectedProductId = $request->get('product_id');

        Log::info('Stock In Page - Selected Product ID: ' . $selectedProductId);

        return view('stock_movement.stock_in', compact('products', 'selectedProductId'));
    }

    /**
     * 显示库存出库页面
     */
    public function stockOutPage(Request $request) {
        if ($request->ajax()) {
            $query = $this->buildBaseProductQuery()->where('quantity', '>', 0);
            $query = $this->applySearchFilter($query, $request->search);

            $perPage = $request->get('per_page', self::DEFAULT_PER_PAGE);
            $products = $query->paginate($perPage);

            return $this->buildPaginatedResponse($products);
        }

        $products = $this->buildBaseProductQuery()
            ->where('quantity', '>', 0)
            ->paginate(self::DEFAULT_PER_PAGE);
        $selectedProductId = $request->get('product_id');

        Log::info('Stock Out Page - Selected Product ID: ' . $selectedProductId);

        return view('stock_movement.stock_out', compact('products', 'selectedProductId'));
    }

    /**
     * 库存退货页面
     */
    public function stockReturnPage(Request $request) {
        if ($request->ajax()) {
            $query = $this->buildBaseProductQuery()->where('quantity', '>', 0);
            $query = $this->applySearchFilter($query, $request->search);

            $perPage = $request->get('per_page', self::DEFAULT_PER_PAGE);
            $products = $query->paginate($perPage);

            return $this->buildPaginatedResponse($products);
        }

        $products = $this->buildBaseProductQuery()
            ->where('quantity', '>', 0)
            ->paginate(self::DEFAULT_PER_PAGE);
        $selectedProductId = $request->get('product_id');

        Log::info('Stock Return Page - Selected Product ID: ' . $selectedProductId);

        return view('stock_movement.stock_return', compact('products', 'selectedProductId'));
    }

    /**
     * 库存入库 - 支持单个和批量提交
     */
    public function stockIn(Request $request) {
        // 检查是否为批量提交
        if ($request->has('stock_in_items') && is_array($request->stock_in_items)) {
            return $this->batchStockIn($request);
        }

        // 单个产品入库
        $request->validate(self::STOCK_RULES);

        try {
            $result = $this->processStockMovement(
                $request->product_id,
                $request->quantity,
                'stock_in',
                $request->reference_number
            );

            $this->logOperation('stock in', [
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
                'new_stock' => $result['new_stock']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Stock in recorded successfully',
                'new_stock' => $result['new_stock']
            ]);

        } catch (\Exception $e) {
            return $this->handleError($request, 'Failed to record stock in: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 批量库存入库
     */
    private function batchStockIn(Request $request) {
        $rules = [
            'stock_in_items' => 'required|array|min:1|max:' . self::MAX_BULK_ITEMS,
            'stock_in_items.*.product_id' => 'required|exists:products,id',
            'stock_in_items.*.quantity' => 'required|integer|min:1',
            'stock_in_items.*.reference_number' => 'nullable|string|max:255'
        ];

        $request->validate($rules);

        try {
            $result = $this->processBatchStockMovement($request->stock_in_items, 'stock_in');

            if (count($result['errors']) > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some items failed to process',
                    'errors' => $result['errors'],
                    'processed_items' => $result['processed_items']
                ], 422);
            }

            $this->logOperation('batch stock in', [
                'total_items' => count($result['processed_items']),
                'processed_items' => $result['processed_items']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Batch stock in recorded successfully',
                'processed_items' => $result['processed_items'],
                'total_items' => count($result['processed_items'])
            ]);

        } catch (\Exception $e) {
            return $this->handleError($request, 'Failed to record batch stock in: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 库存出库 - 支持单个和批量提交
     */
    public function stockOut(Request $request) {
        // 检查是否为批量提交
        if ($request->has('stock_out_items') && is_array($request->stock_out_items)) {
            return $this->batchStockOut($request);
        }

        // 单个产品出库
        $request->validate(self::STOCK_RULES);

        try {
            $result = $this->processStockMovement(
                $request->product_id,
                $request->quantity,
                'stock_out',
                $request->reference_number
            );

            $this->logOperation('stock out', [
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
                'new_stock' => $result['new_stock']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Stock out recorded successfully',
                'new_stock' => $result['new_stock']
            ]);

        } catch (\Exception $e) {
            return $this->handleError($request, 'Failed to record stock out: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 批量库存出库
     */
    private function batchStockOut(Request $request) {
        $rules = [
            'stock_out_items' => 'required|array|min:1|max:' . self::MAX_BULK_ITEMS,
            'stock_out_items.*.product_id' => 'required|exists:products,id',
            'stock_out_items.*.quantity' => 'required|integer|min:1',
            'stock_out_items.*.reference_number' => 'nullable|string|max:255'
        ];

        $request->validate($rules);

        try {
            $result = $this->processBatchStockMovement($request->stock_out_items, 'stock_out');

            if (count($result['errors']) > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some items failed to process',
                    'errors' => $result['errors'],
                    'processed_items' => $result['processed_items']
                ], 422);
            }

            $this->logOperation('batch stock out', [
                'total_items' => count($result['processed_items']),
                'processed_items' => $result['processed_items']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Batch stock out recorded successfully',
                'processed_items' => $result['processed_items'],
                'total_items' => count($result['processed_items'])
            ]);

        } catch (\Exception $e) {
            return $this->handleError($request, 'Failed to record batch stock out: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 库存退货 - 支持单个和批量提交
     */
    public function stockReturn(Request $request) {
        // 检查是否为批量提交
        if ($request->has('stock_return_items') && is_array($request->stock_return_items)) {
            return $this->batchStockReturn($request);
        }

        // 单个产品退货（保持向后兼容）
        $request->validate(self::STOCK_RULES);

        try {
            $product = Product::findOrFail($request->product_id);
            $variant = $product->variants->first();

            // 记录变动前的库存
            $previousStock = $product->quantity;
            $newStock = $previousStock + $request->quantity;

            // 更新产品库存
            $product->quantity = $newStock;
            $product->save();

            // 记录库存变动
            StockMovement::create([
                'product_id' => $product->id,
                'variant_id' => $variant ? $variant->id : null,
                'movement_type' => 'stock_return',
                'quantity' => $request->quantity,
                'previous_stock' => $previousStock,
                'current_stock' => $newStock,
                'reference_number' => $request->reference_number,
                'user_id' => Auth::id(),
                'movement_date' => now()
            ]);

            $this->logOperation('stock return', [
                'product_id' => $product->id,
                'quantity' => $request->quantity,
                'previous_stock' => $previousStock,
                'new_stock' => $newStock
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Stock return recorded successfully',
                'new_stock' => $newStock
            ]);

        } catch (\Exception $e) {
            return $this->handleError($request, 'Failed to record stock return: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 批量库存退货
     */
    private function batchStockReturn(Request $request) {
        $rules = [
            'stock_return_items' => 'required|array|min:1|max:' . self::MAX_BULK_ITEMS,
            'stock_return_items.*.product_id' => 'required|exists:products,id',
            'stock_return_items.*.quantity' => 'required|integer|min:1',
            'stock_return_items.*.reference_number' => 'nullable|string|max:255'
        ];

        $request->validate($rules);

        try {
            $result = $this->processBatchStockMovement($request->stock_return_items, 'stock_return');

            if (count($result['errors']) > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some items failed to process',
                    'errors' => $result['errors'],
                    'processed_items' => $result['processed_items']
                ], 422);
            }

            $this->logOperation('batch stock return', [
                'total_items' => count($result['processed_items']),
                'processed_items' => $result['processed_items']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Batch stock return recorded successfully',
                'processed_items' => $result['processed_items'],
                'total_items' => count($result['processed_items'])
            ]);

        } catch (\Exception $e) {
            return $this->handleError($request, 'Failed to record batch stock return: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 获取当前用户的库存变动历史（仅显示自己处理的记录）
     */
    public function getUserStockHistory(Request $request, $id) {
        if ($request->ajax()) {
            try {
                $query = $this->buildBaseStockHistoryQuery()
                    ->where('product_id', $id)
                    ->where('user_id', auth()->id()); // 只显示当前用户的库存变动记录

                $query = $this->applyStockHistoryFilters($query, $request);
                $movements = $query->paginate(self::DEFAULT_PER_PAGE);

                return response()->json([
                    'success' => true,
                    'data' => $this->formatStockHistoryData($movements),
                    'pagination' => [
                        'current_page' => $movements->currentPage(),
                        'last_page' => $movements->lastPage(),
                        'per_page' => $movements->perPage(),
                        'total' => $movements->total(),
                        'from' => $movements->firstItem(),
                        'to' => $movements->lastItem(),
                    ]
                ]);

            } catch (\Exception $e) {
                return $this->handleError($request, 'Failed to get stock history: ' . $e->getMessage(), $e);
            }
        }

        return response()->json(['error' => 'Invalid request'], 400);
    }

    /**
     * 显示库存历史报告页面
     */
    public function stockHistoryReport(Request $request)
    {

        return view('stock_movement.stock_history');
    }

    /**
     * 获取所有库存变动历史（分页和筛选）
     */
    public function getStockHistory(Request $request)
    {
        if ($request->ajax()) {
            try {
                $query = StockMovement::with([
                    'user:id,name,email',
                    'product:id,name,cover_image',
                    'variant:id,product_id,sku_code,barcode_number'
                ])->orderBy('movement_date', 'desc');

                // 權限控制：Staff 只能看到自己的記錄，Admin 和 SuperAdmin 可以看到所有記錄
                $userRole = auth()->user()->getAccountRole();
                if ($userRole === 'Staff') {
                    $query->where('user_id', auth()->id());
                }
                // Admin 和 SuperAdmin 不需要額外限制，可以看到所有記錄

                // 日期筛选
                if ($request->filled('start_date')) {
                    $query->where('movement_date', '>=', $request->start_date . ' 00:00:00');
                }

                if ($request->filled('end_date')) {
                    $query->where('movement_date', '<=', $request->end_date . ' 23:59:59');
                }

                // 变动类型筛选
                if ($request->filled('movement_type') && $request->movement_type !== 'all') {
                    $query->where('movement_type', $request->movement_type);
                }

                // 产品ID筛选 - 用于特定产品的库存历史
                if ($request->filled('product_id')) {
                    $query->where('product_id', $request->product_id);
                }

                // 产品搜索 - 支持产品名称、SKU、条形码和参考号码
                if ($request->filled('product_search')) {
                    $search = $request->product_search;
                    $query->where(function($q) use ($search) {
                        $q->whereHas('product', function($productQuery) use ($search) {
                            $productQuery->where('name', 'like', "%{$search}%");
                        })->orWhereHas('variant', function($variantQuery) use ($search) {
                            $variantQuery->where('sku_code', 'like', "%{$search}%")
                                       ->orWhere('barcode_number', 'like', "%{$search}%");
                        })->orWhere('reference_number', 'like', "%{$search}%");
                    });
                }

                // 分页参数
                $perPage = $request->get('per_page', 15);
                $page = $request->get('page', 1);

                $movements = $query->paginate($perPage, ['*'], 'page', $page);

                $movementsData = $movements->map(function ($movement) {
                    // 确定SKU - 优先使用variant的sku_code
                    $skuCode = 'N/A';
                    if ($movement->variant && $movement->variant->sku_code) {
                        $skuCode = $movement->variant->sku_code;
                    }

                    return [
                        'id' => $movement->id,
                        'date' => $movement->movement_date->format('Y-m-d H:i:s'),
                        'movement_type' => $movement->movement_type,
                        'product_id' => $movement->product_id,
                        'product_name' => $movement->product->name ?? 'N/A',
                        'product_image' => $movement->product->cover_image ?? null,
                        'sku_code' => $skuCode,
                        'barcode_number' => $movement->variant->barcode_number ?? null,
                        'quantity' => $movement->quantity,
                        'previous_stock' => $movement->previous_stock,
                        'current_stock' => $movement->current_stock,
                        'reference_number' => $movement->reference_number,
                        'user_id' => $movement->user_id,
                        'user_name' => $movement->user->name ?? 'Unknown User',
                        'user_email' => $movement->user->email ?? null,
                    ];
                });

                return response()->json([
                    'success' => true,
                    'data' => $movementsData,
                    'pagination' => [
                        'current_page' => $movements->currentPage(),
                        'last_page' => $movements->lastPage(),
                        'per_page' => $movements->perPage(),
                        'total' => $movements->total(),
                        'from' => $movements->firstItem(),
                        'to' => $movements->lastItem(),
                    ]
                ]);

            } catch (\Exception $e) {
                return $this->handleError($request, 'Failed to get stock history: ' . $e->getMessage(), $e);
            }
        }

        return response()->json(['error' => 'Invalid request'], 400);
    }

    /**
     * 显示产品库存详情页面
     */
    public function stockDetail(Request $request)
    {
        $productId = $request->get('id');

        if (!$productId) {
            return redirect()->route('staff.stock_management')
                ->with('error', 'Product ID is required');
        }

        // 验证产品是否存在
        $product = Product::with([
            'category',
            'subcategory',
            'variants.attributeVariant.brand',
            'variants.attributeVariant.color',
            'variants.attributeVariant.size',
            'variants.attributeVariant.size.category'
        ])->find($productId);

        if (!$product) {
            return redirect()->route('staff.stock_management')
                ->with('error', 'Product not found');
        }

        return view('stock_movement.stock_detail', compact('product'));
    }

    /**
     * 获取特定产品的库存变动历史
     */
    public function getProductStockHistory(Request $request, $productId)
    {
        if ($request->ajax()) {
            try {
                $product = Product::findOrFail($productId);

                $query = StockMovement::with([
                    'user:id,name,email',
                    'product:id,name',
                    'variant:id,product_id,sku_code,barcode_number'
                ])->where('product_id', $productId)
                  ->orderBy('movement_date', 'desc');

                // 日期筛选
                if ($request->filled('start_date')) {
                    $query->where('movement_date', '>=', $request->start_date . ' 00:00:00');
                }

                if ($request->filled('end_date')) {
                    $query->where('movement_date', '<=', $request->end_date . ' 23:59:59');
                }

                // 变动类型筛选
                if ($request->filled('movement_type') && $request->movement_type !== 'all') {
                    $query->where('movement_type', $request->movement_type);
                }

                // 分页参数
                $perPage = $request->get('per_page', 15);
                $page = $request->get('page', 1);

                $movements = $query->paginate($perPage, ['*'], 'page', $page);

                return response()->json([
                    'success' => true,
                    'product' => [
                        'id' => $product->id,
                        'name' => $product->name,
                        'current_stock' => $product->quantity,
                    ],
                    'data' => $movements->map(function ($movement) {
                        // 确定SKU - 优先使用variant的sku_code
                        $skuCode = 'N/A';
                        if ($movement->variant && $movement->variant->sku_code) {
                            $skuCode = $movement->variant->sku_code;
                        }

                        return [
                            'id' => $movement->id,
                            'date' => $movement->movement_date->format('Y-m-d H:i:s'),
                            'type' => $movement->movement_type,
                            'sku_code' => $skuCode,
                            'barcode_number' => $movement->variant->barcode_number ?? null,
                            'quantity' => $movement->quantity,
                            'previous_stock' => $movement->previous_stock,
                            'current_stock' => $movement->current_stock,
                            'reference_number' => $movement->reference_number,
                            'notes' => $movement->notes,
                            'movement_reason' => $movement->movement_reason,
                            'user_id' => $movement->user_id,
                            'user_name' => $movement->user->name ?? 'Unknown User',
                            'user_email' => $movement->user->email ?? null,
                        ];
                    }),
                    'pagination' => [
                        'current_page' => $movements->currentPage(),
                        'last_page' => $movements->lastPage(),
                        'per_page' => $movements->perPage(),
                        'total' => $movements->total(),
                        'from' => $movements->firstItem(),
                        'to' => $movements->lastItem(),
                    ]
                ]);

            } catch (\Exception $e) {
                return $this->handleError($request, 'Failed to get product stock history: ' . $e->getMessage(), $e);
            }
        }

        return response()->json(['error' => 'Invalid request'], 400);
    }

    /**
     * 获取库存统计数据
     */
    public function getStockStatistics(Request $request)
    {
        // 权限控制：仅管理员和超级管理员可以访问统计数据
        $userRole = auth()->user()->getAccountRole();
        if (!in_array($userRole, ['Admin', 'SuperAdmin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Only administrators can view statistics.'
            ], 403);
        }

        try {
            $startDate = $request->filled('start_date') ? $request->start_date . ' 00:00:00' : now()->subDays(30);
            $endDate = $request->filled('end_date') ? $request->end_date . ' 23:59:59' : now();

            // 总入库数量
            $totalStockIn = StockMovement::where('movement_type', 'stock_in')
                ->whereBetween('movement_date', [$startDate, $endDate])
                ->sum('quantity');

            // 总出库数量
            $totalStockOut = StockMovement::where('movement_type', 'stock_out')
                ->whereBetween('movement_date', [$startDate, $endDate])
                ->sum('quantity');

            // 净库存变化
            $netChange = $totalStockIn + $totalStockOut; // stock_out 已经是负数

            // 变动次数
            $totalMovements = StockMovement::whereBetween('movement_date', [$startDate, $endDate])->count();

            // 当前总库存
            $currentTotalStock = Product::sum('quantity');

            // 低库存产品数量 (假设库存小于10为低库存)
            $lowStockCount = Product::where('quantity', '<', 10)->count();

            return response()->json([
                'success' => true,
                'statistics' => [
                    'total_stock_in' => abs($totalStockIn),
                    'total_stock_out' => abs($totalStockOut),
                    'net_change' => $netChange,
                    'total_movements' => $totalMovements,
                    'current_total_stock' => $currentTotalStock,
                    'low_stock_count' => $lowStockCount,
                ]
            ]);

        } catch (\Exception $e) {
            return $this->handleError($request, 'Failed to get stock statistics: ' . $e->getMessage(), $e);
        }
    }

    /**
     * 导出库存历史数据到Excel
     */
    public function exportStockHistory(Request $request)
    {
        try {
            // 获取筛选条件
            $filters = [
                'movement_type' => $request->get('movement_type'),
                'product_search' => $request->get('product_search'),
                'start_date' => $request->get('start_date'),
                'end_date' => $request->get('end_date'),
            ];

            // 生成文件名
            $timestamp = Carbon::now()->format('Y-m-d_H-i-s');
            $filename = "stock_history_export_{$timestamp}.xlsx";

            // 使用Laravel Excel导出
            return Excel::download(new StockHistoryExport($filters), $filename);

        } catch (\Exception $e) {
            Log::error('Stock history export failed: ' . $e->getMessage());

            if ($request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Export failed: ' . $e->getMessage()
                ], 500);
            }

            return redirect()->back()
                ->with('error', 'Export failed. Please try again.');
        }
    }
}
