<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\StockMovement;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\CategoryMapping\Category;
use App\Models\CategoryMapping\Subcategory;
use App\Models\ManagementTool\Brand;
use App\Models\ManagementTool\Color;
use App\Models\SizeLibrary\SizeLibrary;

class StockController extends Controller
{
    /**
     * 显示库存管理页面
     */
    public function stockManagement(Request $request) {
        if ($request->ajax()) {
            try {
                $query = Product::with([
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

                // 搜索功能
                if ($request->has('search') && $request->search) {
                    $search = $request->search;
                    $query->where(function($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                          ->orWhereHas('variants', function($variant) use ($search) {
                              $variant->where('sku_code', 'like', "%{$search}%")
                                      ->orWhere('barcode_number', 'like', "%{$search}%");
                          });
                    });
                }

                // 品牌筛选
                if ($request->has('brand_filter') && $request->brand_filter) {
                    $query->whereHas('variants.attributeVariant.brand', function($brand) use ($request) {
                        $brand->where('id', $request->brand_filter);
                    });
                }

                // 状态筛选
                if ($request->has('status_filter') && $request->status_filter) {
                    $query->where('product_status', $request->status_filter);
                }

                $products = $query->paginate(10);

                return response()->json([
                    'success' => true,
                    'data' => $products->items(),
                    'pagination' => [
                        'current_page' => $products->currentPage(),
                        'last_page' => $products->lastPage(),
                        'per_page' => $products->perPage(),
                        'total' => $products->total(),
                        'from' => $products->firstItem(),
                        'to' => $products->lastItem(),
                    ]
                ]);
            } catch (\Exception $e) {
                Log::error('Stock management error: ' . $e->getMessage());
                return response()->json(['error' => 'Failed to fetch products'], 500);
            }
        }

        return view('product_variants.stock_movement.dashboard');
    }

    /**
     * 显示库存入库页面
     */
    public function stockInPage(Request $request) {
        if ($request->ajax()) {
            $query = Product::with([
                'category',
                'subcategory',
                'variants.attributeVariant.brand',
                'variants.attributeVariant.color',
                'variants.attributeVariant.size',
                'variants.attributeVariant.size.category'
            ]);

            // 搜索功能
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhereHas('variants', function($variant) use ($search) {
                          $variant->where('sku_code', 'like', "%{$search}%")
                                  ->orWhere('barcode_number', 'like', "%{$search}%");
                      });
                });
            }

            $products = $query->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $products->items(),
                'pagination' => [
                    'current_page' => $products->currentPage(),
                    'last_page' => $products->lastPage(),
                    'per_page' => $products->perPage(),
                    'total' => $products->total(),
                    'from' => $products->firstItem(),
                    'to' => $products->lastItem(),
                ]
            ]);
        }

        $products = Product::with([
            'category',
            'subcategory',
            'variants.attributeVariant.brand',
            'variants.attributeVariant.color',
            'variants.attributeVariant.size',
            'variants.attributeVariant.size.category'
        ])->paginate(10);

        $selectedProductId = $request->get('product_id');

        // 调试信息
        \Log::info('Stock In Page - Selected Product ID: ' . $selectedProductId);

        return view('product_variants.stock_movement.stock_in', compact('products', 'selectedProductId'));
    }

    /**
     * 显示库存出库页面
     */
    public function stockOutPage(Request $request) {
        if ($request->ajax()) {
            $query = Product::with([
                'category',
                'subcategory',
                'variants.attributeVariant.brand',
                'variants.attributeVariant.color',
                'variants.attributeVariant.size',
                'variants.attributeVariant.size.category'
            ])->where('quantity', '>', 0); // 只显示有库存的产品

            // 搜索功能
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhereHas('variants', function($variant) use ($search) {
                          $variant->where('sku_code', 'like', "%{$search}%")
                                  ->orWhere('barcode_number', 'like', "%{$search}%");
                      });
                });
            }

            $products = $query->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $products->items(),
                'pagination' => [
                    'current_page' => $products->currentPage(),
                    'last_page' => $products->lastPage(),
                    'per_page' => $products->perPage(),
                    'total' => $products->total(),
                    'from' => $products->firstItem(),
                    'to' => $products->lastItem(),
                ]
            ]);
        }

        $products = Product::with([
            'category',
            'subcategory',
            'variants.attributeVariant.brand',
            'variants.attributeVariant.color',
            'variants.attributeVariant.size',
            'variants.attributeVariant.size.category'
        ])->where('quantity', '>', 0)->paginate(10); // 只显示有库存的产品

        $selectedProductId = $request->get('product_id');

        // 调试信息
        \Log::info('Stock Out Page - Selected Product ID: ' . $selectedProductId);

        return view('product_variants.stock_movement.stock_out', compact('products', 'selectedProductId'));
    }

    /**
     * 库存退货页面
     */
    public function stockReturnPage(Request $request) {
        if ($request->ajax()) {
            $query = Product::with([
                'category',
                'subcategory',
                'variants.attributeVariant.brand',
                'variants.attributeVariant.color',
                'variants.attributeVariant.size',
                'variants.attributeVariant.size.category'
            ])->where('quantity', '>', 0); // 只显示有库存的产品

            if ($request->has('search') && !empty($request->search)) {
                $searchTerm = $request->search;
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('name', 'like', "%{$searchTerm}%")
                      ->orWhere('barcode_number', 'like', "%{$searchTerm}%")
                      ->orWhereHas('variants', function ($variantQuery) use ($searchTerm) {
                          $variantQuery->where('sku_code', 'like', "%{$searchTerm}%");
                      });
                });
            }

            $products = $query->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $products->items(),
                'pagination' => [
                    'current_page' => $products->currentPage(),
                    'last_page' => $products->lastPage(),
                    'per_page' => $products->perPage(),
                    'total' => $products->total(),
                    'from' => $products->firstItem(),
                    'to' => $products->lastItem(),
                ]
            ]);
        }

        $products = Product::with([
            'category',
            'subcategory',
            'variants.attributeVariant.brand',
            'variants.attributeVariant.color',
            'variants.attributeVariant.size',
            'variants.attributeVariant.size.category'
        ])->where('quantity', '>', 0)->paginate(10); // 只显示有库存的产品

        $selectedProductId = $request->get('product_id');

        // 调试信息
        \Log::info('Stock Return Page - Selected Product ID: ' . $selectedProductId);

        return view('product_variants.stock_movement.stock_return', compact('products', 'selectedProductId'));
    }

    /**
     * 库存入库 - 支持单个和批量提交
     */
    public function stockIn(Request $request) {
        // 检查是否为批量提交
        if ($request->has('stock_in_items') && is_array($request->stock_in_items)) {
            return $this->batchStockIn($request);
        }

        // 单个产品入库（保持向后兼容）
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'reference_number' => 'nullable|string|max:255',
        ]);

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
                'movement_type' => 'stock_in',
                'quantity' => $request->quantity,
                'previous_stock' => $previousStock,
                'current_stock' => $newStock,
                'reference_number' => $request->reference_number,
                'user_id' => Auth::id(),
                'movement_date' => now()
            ]);

            Log::info('Stock In recorded', [
                'product_id' => $product->id,
                'quantity' => $request->quantity,
                'user_id' => Auth::id(),
                'previous_stock' => $previousStock,
                'new_stock' => $newStock
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Stock in recorded successfully',
                'new_stock' => $newStock
            ]);

        } catch (\Exception $e) {
            Log::error('Stock in error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to record stock in: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 批量库存入库
     */
    private function batchStockIn(Request $request) {
        $request->validate([
            'stock_in_items' => 'required|array|min:1',
            'stock_in_items.*.product_id' => 'required|exists:products,id',
            'stock_in_items.*.quantity' => 'required|integer|min:1',
            'stock_in_items.*.reference_number' => 'nullable|string|max:255'
        ]);

        try {
            $processedItems = [];
            $errors = [];

            // 按產品ID分組，合併相同產品的數量
            $groupedItems = [];
            Log::info('Received stock_in_items:', $request->stock_in_items);
            Log::info('Total items received:', ['count' => count($request->stock_in_items)]);

            foreach ($request->stock_in_items as $item) {
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

            Log::info('Grouped items:', $groupedItems);
            Log::info('Grouped items count:', ['count' => count($groupedItems)]);

            foreach ($groupedItems as $item) {
                try {
                    $product = Product::findOrFail($item['product_id']);
                    $variant = $product->variants->first();

                    // 记录变动前的库存
                    $previousStock = $product->quantity;
                    $newStock = $previousStock + $item['quantity'];

                    Log::info('Stock In Calculation', [
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'previous_stock' => $previousStock,
                        'incoming_quantity' => $item['quantity'],
                        'new_stock' => $newStock,
                        'calculation' => "{$previousStock} + {$item['quantity']} = {$newStock}"
                    ]);

                    // 更新产品库存
                    $product->quantity = $newStock;
                    $product->save();

                    // 只創建一條庫存變動記錄
                    StockMovement::create([
                        'product_id' => $product->id,
                        'variant_id' => $variant ? $variant->id : null,
                        'movement_type' => 'stock_in',
                        'quantity' => $item['quantity'],
                        'previous_stock' => $previousStock,
                        'current_stock' => $newStock,
                        'reference_number' => $item['reference_number'],
                        'user_id' => Auth::id(),
                        'movement_date' => now()
                    ]);

                    $processedItems[] = [
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'quantity' => $item['quantity'],
                        'previous_stock' => $previousStock,
                        'new_stock' => $newStock
                    ];

                    Log::info('Batch Stock In recorded', [
                        'product_id' => $product->id,
                        'quantity' => $item['quantity'],
                        'user_id' => Auth::id(),
                        'previous_stock' => $previousStock,
                        'new_stock' => $newStock
                    ]);

                } catch (\Exception $e) {
                    $errors[] = "Product {$item['product_id']}: " . $e->getMessage();
                    Log::error("Batch Stock In error for product {$item['product_id']}: " . $e->getMessage());
                }
            }

            if (count($errors) > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some items failed to process',
                    'errors' => $errors,
                    'processed_items' => $processedItems
                ], 422);
            }

            return response()->json([
                'success' => true,
                'message' => 'Batch stock in recorded successfully',
                'processed_items' => $processedItems,
                'total_items' => count($processedItems)
            ]);

        } catch (\Exception $e) {
            Log::error('Batch stock in error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to record batch stock in: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 库存出库
     */
    /**
     * 库存出库 - 支持单个和批量提交
     */
    public function stockOut(Request $request) {
        // 检查是否为批量提交
        if ($request->has('stock_out_items') && is_array($request->stock_out_items)) {
            return $this->batchStockOut($request);
        }

        // 单个产品出库（保持向后兼容）
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'reference_number' => 'nullable|string|max:255'
        ]);

        try {
            $product = Product::findOrFail($request->product_id);
            $variant = $product->variants->first();

            // 记录变动前的库存
            $previousStock = $product->quantity;

            // 检查库存是否足够
            if ($previousStock < $request->quantity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient stock. Available: ' . $previousStock . ', Requested: ' . $request->quantity
                ], 400);
            }

            $newStock = $previousStock - $request->quantity;

            // 更新产品库存
            $product->quantity = $newStock;
            $product->save();

            // 记录库存变动
            StockMovement::create([
                'product_id' => $product->id,
                'variant_id' => $variant ? $variant->id : null,
                'movement_type' => 'stock_out',
                'quantity' => $request->quantity,
                'previous_stock' => $previousStock,
                'current_stock' => $newStock,
                'reference_number' => $request->reference_number,
                'user_id' => Auth::id(),
                'movement_date' => now()
            ]);

            Log::info('Stock Out recorded', [
                'product_id' => $product->id,
                'quantity' => $request->quantity,
                'user_id' => Auth::id(),
                'previous_stock' => $previousStock,
                'new_stock' => $newStock
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Stock out recorded successfully',
                'new_stock' => $newStock
            ]);

        } catch (\Exception $e) {
            Log::error('Stock out error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to record stock out: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 批量库存出库
     */
    private function batchStockOut(Request $request) {
        $request->validate([
            'stock_out_items' => 'required|array|min:1',
            'stock_out_items.*.product_id' => 'required|exists:products,id',
            'stock_out_items.*.quantity' => 'required|integer|min:1',
            'stock_out_items.*.reference_number' => 'nullable|string|max:255'
        ]);

        try {
            $processedItems = [];
            $errors = [];

            // 按產品ID分組，合併相同產品的數量
            $groupedItems = [];
            Log::info('Received stock_out_items:', $request->stock_out_items);
            Log::info('Total items received:', ['count' => count($request->stock_out_items)]);

            foreach ($request->stock_out_items as $item) {
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

            Log::info('Grouped items:', $groupedItems);
            Log::info('Grouped items count:', ['count' => count($groupedItems)]);

            foreach ($groupedItems as $item) {
                try {
                    $product = Product::findOrFail($item['product_id']);
                    $variant = $product->variants->first();

                    // 检查库存是否足够
                    if ($product->quantity < $item['quantity']) {
                        $errors[] = "Product {$product->name}: Insufficient stock. Available: {$product->quantity}, Requested: {$item['quantity']}";
                        continue;
                    }

                    // 记录变动前的库存
                    $previousStock = $product->quantity;
                    $newStock = $previousStock - $item['quantity'];

                    Log::info('Stock Out Calculation', [
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'previous_stock' => $previousStock,
                        'outgoing_quantity' => $item['quantity'],
                        'new_stock' => $newStock,
                        'calculation' => "{$previousStock} - {$item['quantity']} = {$newStock}"
                    ]);

                    // 更新产品库存
                    $product->quantity = $newStock;
                    $product->save();

                    // 只創建一條庫存變動記錄
                    StockMovement::create([
                        'product_id' => $product->id,
                        'variant_id' => $variant ? $variant->id : null,
                        'movement_type' => 'stock_out',
                        'quantity' => $item['quantity'],
                        'previous_stock' => $previousStock,
                        'current_stock' => $newStock,
                        'reference_number' => $item['reference_number'],
                        'user_id' => Auth::id(),
                        'movement_date' => now()
                    ]);

                    $processedItems[] = [
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'quantity' => $item['quantity'],
                        'previous_stock' => $previousStock,
                        'new_stock' => $newStock
                    ];

                    Log::info('Batch Stock Out recorded', [
                        'product_id' => $product->id,
                        'quantity' => $item['quantity'],
                        'user_id' => Auth::id(),
                        'previous_stock' => $previousStock,
                        'new_stock' => $newStock
                    ]);

                } catch (\Exception $e) {
                    $errors[] = "Product {$item['product_id']}: " . $e->getMessage();
                    Log::error("Batch Stock Out error for product {$item['product_id']}: " . $e->getMessage());
                }
            }

            if (count($errors) > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some items failed to process',
                    'errors' => $errors,
                    'processed_items' => $processedItems
                ], 422);
            }

            return response()->json([
                'success' => true,
                'message' => 'Batch stock out recorded successfully',
                'processed_items' => $processedItems,
                'total_items' => count($processedItems)
            ]);

        } catch (\Exception $e) {
            Log::error('Batch stock out error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to record batch stock out: ' . $e->getMessage()
            ], 500);
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
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'reference_number' => 'nullable|string|max:255'
        ]);

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

            Log::info('Stock Return recorded', [
                'product_id' => $product->id,
                'quantity' => $request->quantity,
                'user_id' => Auth::id(),
                'previous_stock' => $previousStock,
                'new_stock' => $newStock
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Stock return recorded successfully',
                'new_stock' => $newStock
            ]);

        } catch (\Exception $e) {
            Log::error('Stock return error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to record stock return: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 批量库存退货
     */
    private function batchStockReturn(Request $request) {
        $request->validate([
            'stock_return_items' => 'required|array|min:1',
            'stock_return_items.*.product_id' => 'required|exists:products,id',
            'stock_return_items.*.quantity' => 'required|integer|min:1',
            'stock_return_items.*.reference_number' => 'nullable|string|max:255'
        ]);

        try {
            $processedItems = [];
            $errors = [];

            // 按產品ID分組，合併相同產品的數量
            $groupedItems = [];
            Log::info('Received stock_return_items:', $request->stock_return_items);
            Log::info('Total items received:', ['count' => count($request->stock_return_items)]);

            foreach ($request->stock_return_items as $item) {
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

            Log::info('Grouped items:', $groupedItems);
            Log::info('Grouped items count:', ['count' => count($groupedItems)]);

            foreach ($groupedItems as $item) {
                try {
                    $product = Product::findOrFail($item['product_id']);
                    $variant = $product->variants->first();

                    // 记录变动前的库存
                    $previousStock = $product->quantity;
                    $newStock = $previousStock + $item['quantity'];

                    Log::info('Stock Return Calculation', [
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'previous_stock' => $previousStock,
                        'return_quantity' => $item['quantity'],
                        'new_stock' => $newStock,
                        'calculation' => "{$previousStock} + {$item['quantity']} = {$newStock}"
                    ]);

                    // 更新产品库存
                    $product->quantity = $newStock;
                    $product->save();

                    // 只創建一條庫存變動記錄
                    StockMovement::create([
                        'product_id' => $product->id,
                        'variant_id' => $variant ? $variant->id : null,
                        'movement_type' => 'stock_return',
                        'quantity' => $item['quantity'],
                        'previous_stock' => $previousStock,
                        'current_stock' => $newStock,
                        'reference_number' => $item['reference_number'],
                        'user_id' => Auth::id(),
                        'movement_date' => now()
                    ]);

                    $processedItems[] = [
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'quantity' => $item['quantity'],
                        'previous_stock' => $previousStock,
                        'new_stock' => $newStock
                    ];

                    Log::info('Batch Stock Return recorded', [
                        'product_id' => $product->id,
                        'quantity' => $item['quantity'],
                        'user_id' => Auth::id(),
                        'previous_stock' => $previousStock,
                        'new_stock' => $newStock
                    ]);

                } catch (\Exception $e) {
                    $errors[] = "Product {$item['product_id']}: " . $e->getMessage();
                    Log::error("Batch Stock Return error for product {$item['product_id']}: " . $e->getMessage());
                }
            }

            if (count($errors) > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some items failed to process',
                    'errors' => $errors,
                    'processed_items' => $processedItems
                ], 422);
            }

            return response()->json([
                'success' => true,
                'message' => 'Batch stock return recorded successfully',
                'processed_items' => $processedItems,
                'total_items' => count($processedItems)
            ]);

        } catch (\Exception $e) {
            Log::error('Batch stock return error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to record batch stock return: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 获取当前用户的库存变动历史（仅显示自己处理的记录）
     */
    public function getUserStockHistory(Request $request, $id) {
        if ($request->ajax()) {
            try {
                $query = StockMovement::with(['user', 'product', 'variant'])
                    ->where('product_id', $id)
                    ->where('user_id', auth()->id()) // 只显示当前用户的库存变动记录
                    ->orderBy('movement_date', 'desc');

                if ($request->filled('start_date')) {
                    $query->where('movement_date', '>=', $request->start_date);
                }

                if ($request->filled('end_date')) {
                    $query->where('movement_date', '<=', $request->end_date);
                }

                if ($request->filled('movement_type')) {
                    $query->where('movement_type', $request->movement_type);
                }

                $movements = $query->paginate(10);

                return response()->json([
                    'success' => true,
                    'data' => $movements->map(function ($movement) {
                        return [
                            'id' => $movement->id,
                            'movement_type' => $movement->movement_type,
                            'quantity' => $movement->quantity,
                            'previous_stock' => $movement->previous_stock,
                            'current_stock' => $movement->current_stock,
                            'reference_number' => $movement->reference_number,
                            'user_name' => $movement->user->name ?? 'N/A',
                            'movement_date' => $movement->movement_date->format('Y-m-d H:i:s'),
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
                Log::error('Get stock history error: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to get stock history'
                ], 500);
            }
        }

        return response()->json(['error' => 'Invalid request'], 400);
    }

    /**
     * 显示库存历史报告页面
     */
    public function stockHistoryReport()
    {
        return view('product_variants.stock_movement.stock_history');
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

                $movements = $query->paginate(10);

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
                Log::error('Get stock history error: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to get stock history: ' . $e->getMessage()
                ], 500);
            }
        }

        return response()->json(['error' => 'Invalid request'], 400);
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

                $movements = $query->paginate(10);

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
                Log::error('Get product stock history error: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to get product stock history: ' . $e->getMessage()
                ], 500);
            }
        }

        return response()->json(['error' => 'Invalid request'], 400);
    }

    /**
     * 获取库存统计数据
     */
    public function getStockStatistics(Request $request)
    {
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
            Log::error('Get stock statistics error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to get stock statistics: ' . $e->getMessage()
            ], 500);
        }
    }
}
