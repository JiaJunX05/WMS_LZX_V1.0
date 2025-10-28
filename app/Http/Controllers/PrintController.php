<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Product;

/**
 * Print Management Controller
 *
 * 处理打印管理相关的功能，包括：
 * - 产品列表展示（支持AJAX分页）
 * - 提供产品数据给前端JavaScript处理
 *
 * @author WMS Team
 * @version 1.0.0
 */
class PrintController extends Controller
{
    /**
     * 显示打印管理仪表板
     *
     * @param Request $request
     * @return \Illuminate\View\View|\Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            // AJAX请求：返回分页数据
            if ($request->ajax()) {
                return $this->getPaginatedProducts($request);
            }

            // 普通请求：返回视图
            $products = Product::with('barcode')->paginate(10);
            return view('print_dashboard', compact('products'));

        } catch (\Exception $e) {
            Log::error('Print index error: ' . $e->getMessage());

            if ($request->ajax()) {
                return response()->json(['error' => 'Failed to fetch products'], 500);
            }

            return redirect()->back()
                ->withErrors(['error' => 'Failed to fetch products']);
        }
    }


    /**
     * 获取产品数据 - 提供给前端JavaScript处理
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProducts(Request $request)
    {
        try {
            $productIds = $request->input('products', []);
            $includeBarcode = $request->boolean('include_barcode', true);
            $includeImage = $request->boolean('include_image', true);

            if (empty($productIds)) {
                return response()->json(['error' => 'No products selected'], 400);
            }

            // 获取选中的产品
            $products = Product::with('barcode')
                ->whereIn('id', $productIds)
                ->get();

            if ($products->isEmpty()) {
                return response()->json(['error' => 'No products found'], 404);
            }

            // 返回产品数据给前端JS处理
            return response()->json([
                'success' => true,
                'products' => $products,
                'includeBarcode' => $includeBarcode,
                'includeImage' => $includeImage
            ]);

        } catch (\Exception $e) {
            Log::error('Get products error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to get products'], 500);
        }
    }

    /**
     * 渲染打印标签模板
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function renderPrintLabels(Request $request)
    {
        try {
            $productIds = $request->input('products', []);
            $includeBarcode = $request->boolean('include_barcode', true);
            $includeImage = $request->boolean('include_image', true);

            if (empty($productIds)) {
                return response()->json(['error' => 'No products selected'], 400);
            }

            // 获取选中的产品数据
            $products = Product::with('barcode')
                ->whereIn('id', $productIds)
                ->get()
                ->toArray();

            if (empty($products)) {
                return response()->json(['error' => 'No products found'], 404);
            }

            // 渲染Blade模板并返回HTML
            return response()->make(view('print-labels', [
                'products' => $products,
                'includeBarcode' => $includeBarcode,
                'includeImage' => $includeImage
            ])->render(), 200, ['Content-Type' => 'text/html']);

        } catch (\Exception $e) {
            Log::error('Render print labels error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to render print labels'], 500);
        }
    }

    /**
     * 获取分页产品数据（AJAX）
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    private function getPaginatedProducts(Request $request)
    {
        $query = Product::with('barcode');

        $perPage = $request->input('perPage', 12);
        $page = $request->input('page', 1);

        $products = $query->paginate($perPage, ['*'], 'page', $page);

        // 计算分页显示信息
        $total = $products->total();
        $start = $total > 0 ? ($products->currentPage() - 1) * $perPage + 1 : 0;
        $end = min($start + $perPage - 1, $total);

        return response()->json([
            'data' => $products->items(),
            'current_page' => $products->currentPage(),
            'last_page' => $products->lastPage(),
            'total' => $total,
            'per_page' => $perPage,
            'from' => $start,
            'to' => $end,
            'pagination' => [
                'showing_start' => $start,
                'showing_end' => $end,
                'total_count' => $total,
                'has_more_pages' => $products->hasMorePages(),
                'is_first_page' => $products->onFirstPage(),
                'is_last_page' => $products->currentPage() === $products->lastPage(),
            ]
        ]);
    }

}
