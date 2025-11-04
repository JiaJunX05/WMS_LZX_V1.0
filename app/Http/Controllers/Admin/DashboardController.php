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
            'size_templates' => SizeTemplate::selectRaw('category_id, count(*) as count')->groupBy('category_id')->get()->count(),
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

        // 性别统计
        $genderStats = [
            'total' => Gender::where('gender_status', 'Available')->count(),
        ];

        return [
            'products' => $productStats,
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
