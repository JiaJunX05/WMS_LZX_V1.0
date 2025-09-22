<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\StockMovement;
use App\Models\ProductVariants\Product;
use App\Models\ProductVariants\ProductVariant;

class StockController extends Controller
{
    /**
     * 显示库存历史报告页面
     */
    public function stockHistoryReport()
    {
        return view('staff.stock_history');
    }

    /**
     * 获取所有库存变动历史（分页和筛选）
     */
    public function getStockHistory(Request $request)
    {
        try {
            $query = StockMovement::with([
                'user:id,name,email',
                'product:id,name',
                'variant:id,product_id,sku_code,barcode_number'
            ])->orderBy('movement_date', 'desc');

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
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->whereHas('product', function($productQuery) use ($search) {
                        $productQuery->where('name', 'like', "%{$search}%");
                    })->orWhereHas('variant', function($variantQuery) use ($search) {
                        $variantQuery->where('sku_code', 'like', "%{$search}%")
                                   ->orWhere('barcode_number', 'like', "%{$search}%");
                    })->orWhere('reference_number', 'like', "%{$search}%");
                });
            }

            $movements = $query->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $movements->items(),
                'pagination' => [
                    'current_page' => $movements->currentPage(),
                    'last_page' => $movements->lastPage(),
                    'per_page' => $movements->perPage(),
                    'total' => $movements->total(),
                    'from' => $movements->firstItem(),
                    'to' => $movements->lastItem(),
                ],
                'movements' => $movements->map(function ($movement) {
                    // 确定SKU - 优先使用variant的sku_code
                    $skuCode = 'N/A';
                    if ($movement->variant && $movement->variant->sku_code) {
                        $skuCode = $movement->variant->sku_code;
                    }

                    return [
                        'id' => $movement->id,
                        'date' => $movement->movement_date->format('Y-m-d H:i:s'),
                        'type' => $movement->movement_type,
                        'product_id' => $movement->product_id,
                        'product_name' => $movement->product->name ?? 'N/A',
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
                })
            ]);

        } catch (\Exception $e) {
            Log::error('Get stock history error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to get stock history: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 获取特定产品的库存变动历史
     */
    public function getProductStockHistory(Request $request, $productId)
    {
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

            $movements = $query->paginate(20);

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
