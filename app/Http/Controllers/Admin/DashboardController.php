<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

        return view('dashboard', compact('stats', 'dashboardData', 'userRole'));
    }

    /**
     * Get dashboard statistics.
     */
    private function getDashboardStats()
    {
        try {
            // 产品统计
            $productStats = [
                'total' => DB::table('products')->count(),
                'active' => DB::table('products')->where('status', 'Active')->count(),
                'inactive' => DB::table('products')->where('status', 'Inactive')->count(),
            ];

            // 库存统计
            $stockStats = [
                'total_items' => DB::table('stock_movements')->count(),
                'in_stock' => DB::table('stock_movements')->where('movement_type', 'in')->sum('quantity'),
                'out_stock' => DB::table('stock_movements')->where('movement_type', 'out')->sum('quantity'),
            ];

            // 员工统计
            $staffStats = [
                'total' => DB::table('users')->count(),
                'admin' => DB::table('users')->where('role', 'admin')->count(),
                'staff' => DB::table('users')->where('role', 'staff')->count(),
            ];

            // 分类统计
            $categoryStats = [
                'categories' => DB::table('categories')->count(),
                'subcategories' => DB::table('subcategories')->count(),
            ];

            // 尺码统计
            $sizeStats = [
                'clothing_sizes' => DB::table('size_clothings')->count(),
                'shoe_sizes' => DB::table('size_shoes')->count(),
                'size_types' => DB::table('size_types')->count(),
            ];

            // 存储位置统计
            $locationStats = [
                'zones' => DB::table('zones')->count(),
                'racks' => DB::table('racks')->count(),
                'locations' => DB::table('storage_locations')->count(),
            ];

            return [
                'products' => $productStats,
                'stock' => $stockStats,
                'staff' => $staffStats,
                'categories' => $categoryStats,
                'sizes' => $sizeStats,
                'locations' => $locationStats,
            ];

        } catch (\Exception $e) {
            // 如果数据库查询失败，返回默认值
            return [
                'products' => ['total' => 0, 'active' => 0, 'inactive' => 0],
                'stock' => ['total_items' => 0, 'in_stock' => 0, 'out_stock' => 0],
                'staff' => ['total' => 0, 'admin' => 0, 'staff' => 0],
                'categories' => ['categories' => 0, 'subcategories' => 0],
                'sizes' => ['clothing_sizes' => 0, 'shoe_sizes' => 0, 'size_types' => 0],
                'locations' => ['zones' => 0, 'racks' => 0, 'locations' => 0],
            ];
        }
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
