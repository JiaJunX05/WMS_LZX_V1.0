<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use App\Models\Account;
use App\Models\Category;
use App\Models\Subcategory;
use App\Models\Mapping;
use App\Models\SizeLibrary;
use App\Models\SizeTemplate;
use App\Models\Zone;
use App\Models\Rack;
use App\Models\Location;
use App\Models\Brand;
use App\Models\Color;
use App\Models\Gender;

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

        return view('system_dashboard', compact('stats', 'dashboardData', 'userRole'));
    }

    /**
     * Get dashboard statistics.
     */
    private function getDashboardStats()
    {
        // 产品统计
        $productStats = [
            'total' => Product::count(),
            'active' => Product::where('product_status', 'Available')->count(),
            'inactive' => Product::where('product_status', 'Unavailable')->count(),
        ];

        // 库存统计 - 使用Eloquent模型
        $stockStats = [
            'total_items' => StockMovement::count(),
            'in_stock' => StockMovement::where('movement_type', 'stock_in')->sum('quantity') ?? 0,
            'out_stock' => StockMovement::where('movement_type', 'stock_out')->sum('quantity') ?? 0,
            'return_stock' => StockMovement::where('movement_type', 'stock_return')->sum('quantity') ?? 0,
        ];

        // 员工统计 - 使用Eloquent模型
        $staffStats = [
            'total' => User::count(),
            'admin' => Account::whereIn('account_role', ['Admin', 'SuperAdmin'])->count(),
            'staff' => Account::where('account_role', 'Staff')->count(),
        ];

        // 分类统计
        $categoryStats = [
            'categories' => Category::count(),
            'subcategories' => Subcategory::count(),
            'mappings' => Mapping::distinct('category_id')->count(),
        ];

        // 尺码统计 - 使用Eloquent模型，按类别分组
        $sizeStats = [
            'size_libraries' => SizeLibrary::selectRaw('category_id, count(*) as count')->groupBy('category_id')->get()->count(),
            'size_templates' => SizeTemplate::selectRaw('category_id, count(*) as count')->groupBy('category_id')->get()->count(),
        ];

        // 存储位置统计 - 使用Eloquent模型
        $locationStats = [
            'zones' => Zone::count(),
            'racks' => Rack::count(),
            'locations' => Location::distinct('zone_id')->count(),
        ];

        // 品牌统计
        $brandStats = [
            'total' => Brand::count(),
            'active' => Brand::where('brand_status', 'Available')->count(),
            'inactive' => Brand::where('brand_status', 'Unavailable')->count(),
        ];

        // 颜色统计
        $colorStats = [
            'total' => Color::count(),
            'active' => Color::where('color_status', 'Available')->count(),
            'inactive' => Color::where('color_status', 'Unavailable')->count(),
        ];

        // 性别统计
        $genderStats = [
            'total' => Gender::count(),
            'active' => Gender::where('gender_status', 'Available')->count(),
            'inactive' => Gender::where('gender_status', 'Unavailable')->count(),
        ];

        return [
            'products' => $productStats,
            'stock' => $stockStats,
            'staff' => $staffStats,
            'categories' => $categoryStats,
            'sizes' => $sizeStats,
            'locations' => $locationStats,
            'brands' => $brandStats,
            'colors' => $colorStats,
            'gender' => $genderStats,
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
            'stock' => $stats['stock'],
            'brands' => $stats['brands'],
            'colors' => $stats['colors'],
            'gender' => $stats['gender'],
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
}
