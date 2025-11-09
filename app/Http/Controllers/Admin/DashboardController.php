<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\User;
use App\Models\Category;
use App\Models\Subcategory;
use App\Models\SizeLibrary;
use App\Models\SizeTemplate;
use App\Models\Zone;
use App\Models\Brand;
use App\Models\Color;
use App\Models\StockMovement;

/**
 * 系统仪表板控制器
 * System Dashboard Controller
 *
 * 功能模块：
 * - 系统统计数据显示
 * - 各模块数据汇总
 * - 仪表板数据接口
 *
 * @author WMS Team
 * @version 3.0.0
 */
class DashboardController extends Controller
{
    /**
     * Display the dashboard for both admin and superadmin.
     */
    public function index()
    {
        // 获取当前用户角色
        $userRole = auth()->user()->getAccountRole();

        // 获取统计数据
        $stats = $this->getDashboardStats();

        // 根据角色决定显示的数据
        $dashboardData = $this->getRoleBasedData($userRole, $stats);

        // 获取最近的库存历史记录（最近10条）
        $recentStockHistory = $this->getRecentStockHistory();

        return view('system_dashboard', compact('stats', 'dashboardData', 'userRole', 'recentStockHistory'));
    }

    /**
     * Get dashboard statistics.
     */
    private function getDashboardStats()
    {
        // 产品统计
        $productStats = [
            'total' => Product::where('product_status', 'Available')->count(),
        ];

        // 员工统计 - 通过 User 关联 Account 进行 inner join 查询
        $staffStats = [
            'total' => User::whereHas('account', function($query) {
                $query->where('account_status', 'Available');
            })->count(),
        ];

        // 分类统计
        $categoryStats = [
            'categories' => Category::where('category_status', 'Available')->count(),
            'subcategories' => Subcategory::where('subcategory_status', 'Available')->count(),
        ];

        // 尺码统计
        $sizeStats = [
            'size_libraries' => SizeLibrary::selectRaw('category_id, count(*) as count')->groupBy('category_id')->get()->count(),
            'size_templates' => SizeTemplate::selectRaw('category_id, gender, count(*) as count')->groupBy('category_id', 'gender')->get()->count(),
        ];

        // 存储位置统计
        $locationStats = [
            'zones' => Zone::where('zone_status', 'Available')->count(),
        ];

        // 品牌统计
        $brandStats = [
            'total' => Brand::where('brand_status', 'Available')->count(),
        ];

        // 颜色统计
        $colorStats = [
            'total' => Color::where('color_status', 'Available')->count(),
        ];

        // 库存统计
        $userRole = auth()->user()->getAccountRole();
        $stockQuery = StockMovement::query();

        // 权限控制：Staff 只能看到自己的记录
        if ($userRole === 'Staff') {
            $stockQuery->where('user_id', auth()->id());
        }

        $stockStats = [
            'total' => (int) $stockQuery->count(),
            'stock_in' => (int) (clone $stockQuery)->where('movement_type', 'stock_in')->count(),
            'stock_out' => (int) (clone $stockQuery)->where('movement_type', 'stock_out')->count(),
            'stock_return' => (int) (clone $stockQuery)->where('movement_type', 'stock_return')->count(),
        ];

        return [
            'products' => $productStats,
            'staff' => $staffStats,
            'categories' => $categoryStats,
            'sizes' => $sizeStats,
            'locations' => $locationStats,
            'brands' => $brandStats,
            'colors' => $colorStats,
            'stock' => $stockStats,
        ];
    }


    /**
     * Get role-based dashboard data.
     */
    private function getRoleBasedData($userRole, $stats)
    {
        $baseData = [
            'products' => $stats['products'],
            'categories' => $stats['categories'],
            'sizes' => $stats['sizes'],
            'locations' => $stats['locations'],
            'brands' => $stats['brands'],
            'colors' => $stats['colors'],
            'stock' => $stats['stock'],
        ];

        // SuperAdmin 可以看到所有数据包括员工管理
        if ($userRole === 'SuperAdmin') {
            $baseData['staff'] = $stats['staff'];
            $baseData['superAdminFeatures'] = true;
            $baseData['userManagement'] = true;
        } else {
            // Admin 只能看到基本统计数据，不显示员工详情
            $baseData['staff'] = [
                'total' => $stats['staff']['total'],
                'admin' => null, // 隐藏具体数量
                'staff' => null, // 隐藏具体数量
            ];
            $baseData['superAdminFeatures'] = false;
            $baseData['userManagement'] = false;
        }

        return $baseData;
    }

    /**
     * Get dashboard data via AJAX.
     */
    public function getData(Request $request)
    {
        try {
            $userRole = auth()->user()->getAccountRole();
            $stats = $this->getDashboardStats();
            $dashboardData = $this->getRoleBasedData($userRole, $stats);

            return response()->json([
                'success' => true,
                'data' => $dashboardData,
                'userRole' => $userRole,
                'timestamp' => now()->format('Y-m-d H:i:s')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get recent stock history for dashboard.
     */
    private function getRecentStockHistory()
    {
        $userRole = auth()->user()->getAccountRole();

        $query = StockMovement::with([
            'user:id,first_name,last_name,email',
            'user.account:id,user_id,username',
            'product:id,name,cover_image',
            'variant:id,product_id,sku_code,barcode_number'
        ])
        ->orderBy('movement_date', 'desc')
        ->limit(10);

        // 权限控制：Staff 只能看到自己的记录
        if ($userRole === 'Staff') {
            $query->where('user_id', auth()->id());
        }

        return $query->get()->map(function ($movement) {
            return [
                'id' => $movement->id,
                'date' => $movement->movement_date->format('Y-m-d H:i:s'),
                'movement_type' => $movement->movement_type,
                'product_name' => $movement->product->name ?? 'N/A',
                'product_image' => $movement->product->cover_image ?? null,
                'sku_code' => $movement->variant->sku_code ?? 'N/A',
                'quantity' => $movement->quantity,
                'previous_stock' => $movement->previous_stock,
                'current_stock' => $movement->current_stock,
                'reference_number' => $movement->reference_number,
                'user_name' => $movement->user->account->username ?? ($movement->user->first_name . ' ' . $movement->user->last_name) ?? 'Unknown User',
                'user_email' => $movement->user->email ?? '',
            ];
        });
    }
}
