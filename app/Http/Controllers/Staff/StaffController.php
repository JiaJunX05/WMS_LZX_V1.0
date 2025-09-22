<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\Account;
use App\Models\StockMovement;
use App\Models\ProductVariants\Product;
use App\Models\ProductVariants\ProductVariant;

class StaffController extends Controller
{
    public function index() {
        return view('staff.dashboard');
    }

    /**
     * 显示库存管理页面
     */
    public function stockManagement(Request $request) {
        if ($request->ajax()) {
            $query = Product::with([
                'category',
                'subcategory',
                'variants.attributeVariant.brand',
                'variants.attributeVariant.color',
                'variants.attributeVariant.size.clothingSize.gender',
                'variants.attributeVariant.size.shoeSize.gender'
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
        }

        $products = Product::with([
            'category',
            'subcategory',
            'variants.attributeVariant.brand',
            'variants.attributeVariant.color',
            'variants.attributeVariant.size.clothingSize.gender',
                'variants.attributeVariant.size.shoeSize.gender'
        ])->paginate(10);

        return view('product_variants.stock_movement.dashboard', compact('products'));
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
                'variants.attributeVariant.size.clothingSize.gender',
                'variants.attributeVariant.size.shoeSize.gender'
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
            'variants.attributeVariant.size.clothingSize.gender',
                'variants.attributeVariant.size.shoeSize.gender'
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
                'variants.attributeVariant.size.clothingSize.gender',
                'variants.attributeVariant.size.shoeSize.gender'
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
            'variants.attributeVariant.size.clothingSize.gender',
            'variants.attributeVariant.size.shoeSize.gender'
        ])->where('quantity', '>', 0)->paginate(10); // 只显示有库存的产品

        $selectedProductId = $request->get('product_id');

        // 调试信息
        \Log::info('Stock Out Page - Selected Product ID: ' . $selectedProductId);

        return view('product_variants.stock_movement.stock_out', compact('products', 'selectedProductId'));
    }

    /**
     * 库存入库
     */
    public function stockIn(Request $request) {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'reference_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
            'movement_reason' => 'required|in:initial_stock,purchase,adjustment,transfer,return,other'
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
                'notes' => $request->notes,
                'movement_reason' => $request->movement_reason,
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
     * 库存出库
     */
    public function stockOut(Request $request) {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'reference_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
            'movement_reason' => 'required|in:sale,adjustment,transfer,damage,expired,other'
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
                'quantity' => -$request->quantity, // 负数表示出库
                'previous_stock' => $previousStock,
                'current_stock' => $newStock,
                'reference_number' => $request->reference_number,
                'notes' => $request->notes,
                'movement_reason' => $request->movement_reason,
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
     * 获取当前用户的库存变动历史（仅显示自己处理的记录）
     */
    public function getStockHistory(Request $request, $id) {
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

            $movements = $query->paginate(20);

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
                        'notes' => $movement->notes,
                        'movement_reason' => $movement->movement_reason,
                        'user_name' => $movement->user->name ?? 'N/A',
                        'movement_date' => $movement->movement_date->format('Y-m-d H:i:s'),
                    ];
                }),
                'pagination' => [
                    'current_page' => $movements->currentPage(),
                    'last_page' => $movements->lastPage(),
                    'total' => $movements->total(),
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
}
