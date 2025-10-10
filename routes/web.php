<?php

use Illuminate\Support\Facades\Route;

// =============================================================================
// 控制器引用 (Controller Imports)
// =============================================================================
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\ColorController;
use App\Http\Controllers\Admin\GenderController;
use App\Http\Controllers\Admin\LibraryController;
use App\Http\Controllers\Admin\TemplateController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\SubcategoryController;
use App\Http\Controllers\Admin\MappingController;
use App\Http\Controllers\Admin\ZoneController;
use App\Http\Controllers\Admin\RackController;
use App\Http\Controllers\Admin\LocationController;
use App\Http\Controllers\StockController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| 这里定义了应用程序的Web路由。路由被组织成不同的功能模块：
| - 认证路由：登录、注册、登出
| - 智能重定向：根据用户角色自动跳转
| - 角色特定路由：SuperAdmin、Admin、Staff的专属功能
|
*/

// =============================================================================
// 认证路由 (Authentication Routes)
// =============================================================================
Route::get('/', [AuthController::class, 'showLoginForm'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.submit');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth');

// =============================================================================
// 需要认证的路由 (Authenticated Routes)
// =============================================================================
Route::middleware(['auth'])->group(function () {

    // =============================================================================
    // 智能重定向路由 (Smart Redirect Routes)
    // 根据用户角色自动跳转到相应的管理页面
    // =============================================================================

    // 员工管理页面重定向
    Route::get('/staff_management', function () {
        $user = auth()->user();
        $role = $user->getAccountRole();

        return match($role) {
            'SuperAdmin' => redirect()->route('superadmin.users.management'),
            'Admin' => redirect()->route('admin.users.management'),
            default => abort(403, 'Access denied')
        };
    })->name('staff_management');

    // 用户注册页面重定向
    Route::get('/register', function () {
        $user = auth()->user();
        $role = $user->getAccountRole();

        return match($role) {
            'SuperAdmin' => redirect()->route('superadmin.users.create'),
            'Admin' => redirect()->route('admin.users.create'),
            default => abort(403, 'Access denied')
        };
    })->name('register');

    // 通用注册提交
    Route::post('/register', [AuthController::class, 'register'])->name('register.submit');

    // =============================================================================
    // 产品管理路由 (Product Management Routes)
    // 所有认证用户都可以访问产品管理功能
    // =============================================================================
    Route::prefix('product')->name('product.')->group(function () {
        Route::get('/index', [ProductController::class, 'index'])->name('index');
        Route::get('/create', [ProductController::class, 'create'])->name('create');
        Route::post('/store', [ProductController::class, 'store'])->name('store');
        Route::get('/view/{id}', [ProductController::class, 'view'])->name('view');
        Route::get('/edit/{id}', [ProductController::class, 'edit'])->name('edit');
        Route::put('/update/{id}', [ProductController::class, 'update'])->name('update');
        Route::patch('/available/{id}', [ProductController::class, 'setAvailable'])->name('available');
        Route::patch('/unavailable/{id}', [ProductController::class, 'setUnavailable'])->name('unavailable');
        Route::delete('/destroy/{id}', [ProductController::class, 'destroy'])->name('destroy');
    });

    // =============================================================================
    // 库存管理路由 (Stock Management Routes)
    // 所有认证用户都可以访问库存管理功能
    // =============================================================================
    Route::prefix('staff')->middleware(['auth'])->name('staff.')->group(function () {

        // 库存管理页面
        Route::get('/stock-management', [StockController::class, 'stockManagement'])->name('stock_management');
        Route::get('/stock-detail', [StockController::class, 'stockDetail'])->name('stock_detail');
        Route::get('/stock-in-page', [StockController::class, 'stockInPage'])->name('stock_in_page');
        Route::get('/stock-out-page', [StockController::class, 'stockOutPage'])->name('stock_out_page');
        Route::get('/stock-return-page', [StockController::class, 'stockReturnPage'])->name('stock_return_page');
        Route::post('/stock-in', [StockController::class, 'stockIn'])->name('stock_in');
        Route::post('/stock-out', [StockController::class, 'stockOut'])->name('stock_out');
        Route::post('/stock-return', [StockController::class, 'stockReturn'])->name('stock_return');
        Route::get('/stock-history/{id}', [StockController::class, 'getUserStockHistory'])->name('staff.stock_history');
    });

    // 公共库存历史报告功能 - 所有认证用户都可以访问
    Route::get('/stock-history', [StockController::class, 'stockHistoryReport'])->name('stock_history');
    Route::get('/api/stock-history', [StockController::class, 'getStockHistory'])->name('api.stock_history');
    Route::get('/api/product-stock-history/{id}', [StockController::class, 'getProductStockHistory'])->name('api.product_stock_history');
    Route::get('/api/stock-statistics', [StockController::class, 'getStockStatistics'])->name('api.stock_statistics');

    // =============================================================================
    // SuperAdmin 路由 (SuperAdmin Routes)
    // 超级管理员：拥有所有权限，可以管理所有用户
    // =============================================================================
    Route::prefix('superadmin')->middleware(['role:SuperAdmin'])->name('superadmin.')->group(function () {

        // 仪表板
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('/dashboard/data', [DashboardController::class, 'getData'])->name('dashboard.data');

        // 用户管理路由组
        Route::prefix('users')->name('users.')->group(function () {
            // 用户列表
            Route::get('/management', [AuthController::class, 'showUserList'])->name('management');
            Route::get('/stats', [AuthController::class, 'getUserStats'])->name('stats');
            Route::get('/create', [AuthController::class, 'showRegisterForm'])->name('create');
            Route::post('/create', [AuthController::class, 'register'])->name('create.submit');
            Route::get('/{id}/edit', [AuthController::class, 'showUpdateForm'])->name('edit');
            Route::put('/{id}/update', [AuthController::class, 'updateUser'])->name('update');
            Route::delete('/{id}/delete', [AuthController::class, 'deleteAccount'])->name('delete');
            Route::patch('/{id}/unavailable', [AuthController::class, 'setUnavailable'])->name('unavailable');
            Route::patch('/{id}/available', [AuthController::class, 'setAvailable'])->name('available');
            Route::patch('/{id}/change-role', [AuthController::class, 'changeAccountRole'])->name('change_role');
        });
    });

    // =============================================================================
    // Admin 路由 (Admin Routes)
    // 管理员：可以管理员工，但不能更改角色或删除用户
    // =============================================================================
    Route::prefix('admin')->middleware(['role:Admin'])->name('admin.')->group(function () {

        // 仪表板
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('/dashboard/data', [DashboardController::class, 'getData'])->name('dashboard.data');

        // 用户管理路由组
        Route::prefix('users')->name('users.')->group(function () {
            Route::get('/management', [AuthController::class, 'showUserList'])->name('management');
            Route::get('/stats', [AuthController::class, 'getUserStats'])->name('stats');
            Route::get('/create', [AuthController::class, 'showRegisterForm'])->name('create');
            Route::post('/create', [AuthController::class, 'register'])->name('create.submit');
            Route::get('/{id}/edit', [AuthController::class, 'showUpdateForm'])->name('edit');
            Route::put('/{id}/update', [AuthController::class, 'updateUser'])->name('update');
            Route::patch('/{id}/unavailable', [AuthController::class, 'setUnavailable'])->name('unavailable');
            Route::patch('/{id}/available', [AuthController::class, 'setAvailable'])->name('available');
        });

        // =============================================================================
        // 存储位置管理路由 (Storage Locations Management Routes)
        // =============================================================================
        Route::prefix('storage_locations')->name('storage_locations.')->group(function () {

            // 区域管理 (Zone Management)
            Route::prefix('zone')->name('zone.')->group(function () {
                Route::get('/index', [ZoneController::class, 'index'])->name('index');
                Route::get('/create', [ZoneController::class, 'create'])->name('create');
                Route::post('/store', [ZoneController::class, 'store'])->name('store');
                Route::get('/{id}/edit', [ZoneController::class, 'edit'])->name('edit');
                Route::put('/{id}/update', [ZoneController::class, 'update'])->name('update');
                Route::patch('/{id}/available', [ZoneController::class, 'setAvailable'])->name('available');
                Route::patch('/{id}/unavailable', [ZoneController::class, 'setUnavailable'])->name('unavailable');
                Route::delete('/{id}/delete', [ZoneController::class, 'destroy'])->name('destroy');
            });

            // 货架管理 (Rack Management)
            Route::prefix('rack')->name('rack.')->group(function () {
                Route::get('/index', [RackController::class, 'index'])->name('index');
                Route::get('/create', [RackController::class, 'create'])->name('create');
                Route::post('/store', [RackController::class, 'store'])->name('store');
                Route::get('/{id}/edit', [RackController::class, 'edit'])->name('edit');
                Route::put('/{id}/update', [RackController::class, 'update'])->name('update');
                Route::patch('/{id}/available', [RackController::class, 'setAvailable'])->name('available');
                Route::patch('/{id}/unavailable', [RackController::class, 'setUnavailable'])->name('unavailable');
                Route::delete('/{id}/delete', [RackController::class, 'destroy'])->name('destroy');
            });

            // 位置管理 (Location Management)
            Route::prefix('location')->name('location.')->group(function () {
                Route::get('/index', [LocationController::class, 'index'])->name('index');
                Route::get('/create', [LocationController::class, 'create'])->name('create');
                Route::post('/store', [LocationController::class, 'store'])->name('store');
                Route::get('/{id}/view', [LocationController::class, 'view'])->name('view');
                Route::get('/{id}/edit', [LocationController::class, 'edit'])->name('edit');
                Route::put('/{id}/update', [LocationController::class, 'update'])->name('update');
                Route::patch('/{id}/available', [LocationController::class, 'setAvailable'])->name('available');
                Route::patch('/{id}/unavailable', [LocationController::class, 'setUnavailable'])->name('unavailable');
                Route::delete('/{id}/delete', [LocationController::class, 'destroy'])->name('destroy');
            });
        });

        // =============================================================================
        // 分类映射管理路由 (Category Mapping Management Routes)
        // =============================================================================
        Route::prefix('category_mapping')->name('category_mapping.')->group(function () {

            // 分类管理 (Category Management)
            Route::prefix('category')->name('category.')->group(function () {
                Route::get('/index', [CategoryController::class, 'index'])->name('index');
                Route::get('/create', [CategoryController::class, 'create'])->name('create');
                Route::post('/store', [CategoryController::class, 'store'])->name('store');
                Route::get('/{id}/edit', [CategoryController::class, 'edit'])->name('edit');
                Route::put('/{id}/update', [CategoryController::class, 'update'])->name('update');
                Route::patch('/{id}/available', [CategoryController::class, 'setAvailable'])->name('available');
                Route::patch('/{id}/unavailable', [CategoryController::class, 'setUnavailable'])->name('unavailable');
                Route::delete('/{id}/delete', [CategoryController::class, 'destroy'])->name('destroy');
            });

            // 子分类管理 (Subcategory Management)
            Route::prefix('subcategory')->name('subcategory.')->group(function () {
                Route::get('/index', [SubcategoryController::class, 'index'])->name('index');
                Route::get('/create', [SubcategoryController::class, 'create'])->name('create');
                Route::post('/store', [SubcategoryController::class, 'store'])->name('store');
                Route::get('/{id}/edit', [SubcategoryController::class, 'edit'])->name('edit');
                Route::put('/{id}/update', [SubcategoryController::class, 'update'])->name('update');
                Route::patch('/{id}/available', [SubcategoryController::class, 'setAvailable'])->name('available');
                Route::patch('/{id}/unavailable', [SubcategoryController::class, 'setUnavailable'])->name('unavailable');
                Route::delete('/{id}/delete', [SubcategoryController::class, 'destroy'])->name('destroy');
            });

            // 映射管理 (Mapping Management)
            Route::prefix('mapping')->name('mapping.')->group(function () {
                Route::get('/index', [MappingController::class, 'index'])->name('index');
                Route::get('/create', [MappingController::class, 'create'])->name('create');
                Route::post('/store', [MappingController::class, 'store'])->name('store');
                Route::get('/{id}/view', [MappingController::class, 'view'])->name('view');
                Route::get('/{id}/edit', [MappingController::class, 'edit'])->name('edit');
                Route::put('/{id}/update', [MappingController::class, 'update'])->name('update');
                Route::patch('/{id}/available', [MappingController::class, 'setAvailable'])->name('available');
                Route::patch('/{id}/unavailable', [MappingController::class, 'setUnavailable'])->name('unavailable');
                Route::delete('/{id}/delete', [MappingController::class, 'destroy'])->name('destroy');
            });
        });

        // =============================================================================
        // 属性变量管理路由 (Attribute Variant Management Routes)
        // =============================================================================
        Route::prefix('management_tool')->name('management_tool.')->group(function () {

            // 品牌管理 (Brand Management)
            Route::prefix('brand')->name('brand.')->group(function () {
                Route::get('/index', [BrandController::class, 'index'])->name('index');
                Route::get('/create', [BrandController::class, 'create'])->name('create');
                Route::post('/store', [BrandController::class, 'store'])->name('store');
                Route::get('/{id}/edit', [BrandController::class, 'edit'])->name('edit');
                Route::put('/{id}/update', [BrandController::class, 'update'])->name('update');
                Route::patch('/{id}/available', [BrandController::class, 'setAvailable'])->name('available');
                Route::patch('/{id}/unavailable', [BrandController::class, 'setUnavailable'])->name('unavailable');
                Route::delete('/{id}/delete', [BrandController::class, 'destroy'])->name('destroy');
            });

            // 颜色管理 (Color Management)
            Route::prefix('color')->name('color.')->group(function () {
                Route::get('/index', [ColorController::class, 'index'])->name('index');
                Route::get('/create', [ColorController::class, 'create'])->name('create');
                Route::post('/store', [ColorController::class, 'store'])->name('store');
                Route::get('/{id}/edit', [ColorController::class, 'edit'])->name('edit');
                Route::put('/{id}/update', [ColorController::class, 'update'])->name('update');
                Route::patch('/{id}/available', [ColorController::class, 'setAvailable'])->name('available');
                Route::patch('/{id}/unavailable', [ColorController::class, 'setUnavailable'])->name('unavailable');
                Route::delete('/{id}/delete', [ColorController::class, 'destroy'])->name('destroy');
            });

            // 性别管理 (Gender Management)
            Route::prefix('gender')->name('gender.')->group(function () {
                Route::get('/index', [GenderController::class, 'index'])->name('index');
                Route::get('/create', [GenderController::class, 'create'])->name('create');
                Route::post('/store', [GenderController::class, 'store'])->name('store');
                Route::get('/{id}/edit', [GenderController::class, 'edit'])->name('edit');
                Route::put('/{id}/update', [GenderController::class, 'update'])->name('update');
                Route::patch('/{id}/available', [GenderController::class, 'setAvailable'])->name('available');
                Route::patch('/{id}/unavailable', [GenderController::class, 'setUnavailable'])->name('unavailable');
                Route::delete('/{id}/delete', [GenderController::class, 'destroy'])->name('destroy');
            });
        });

        // =============================================================================
        // 尺码库管理路由 (Size Library Management Routes)
        // =============================================================================
        Route::prefix('size_library')->name('size_library.')->group(function () {
            // 尺码库管理 (Size Library Management)
            Route::prefix('library')->name('library.')->group(function () {
                Route::get('/index', [LibraryController::class, 'index'])->name('index');
                Route::get('/create', [LibraryController::class, 'create'])->name('create');
                Route::post('/store', [LibraryController::class, 'store'])->name('store');
                Route::get('/{id}/view', [LibraryController::class, 'view'])->name('view');
                Route::get('/{id}/edit', [LibraryController::class, 'edit'])->name('edit');
                Route::put('/{id}/update', [LibraryController::class, 'update'])->name('update');
                Route::patch('/{id}/available', [LibraryController::class, 'setAvailable'])->name('available');
                Route::patch('/{id}/unavailable', [LibraryController::class, 'setUnavailable'])->name('unavailable');
                Route::delete('/{id}/delete', [LibraryController::class, 'destroy'])->name('destroy');
            });

            // 尺码模板管理 (Size Template Management)
            Route::prefix('template')->name('template.')->group(function () {
                Route::get('/index', [TemplateController::class, 'index'])->name('index');
                Route::get('/create', [TemplateController::class, 'create'])->name('create');
                Route::post('/store', [TemplateController::class, 'store'])->name('store');
                Route::delete('/{id}/delete', [TemplateController::class, 'destroy'])->name('destroy');
                Route::get('/{id}/view', [TemplateController::class, 'view'])->name('view');
                Route::get('/{id}/edit', [TemplateController::class, 'edit'])->name('edit');
                Route::put('/{id}/update', [TemplateController::class, 'update'])->name('update');
                Route::patch('/{id}/available', [TemplateController::class, 'setAvailable'])->name('available');
                Route::patch('/{id}/unavailable', [TemplateController::class, 'setUnavailable'])->name('unavailable');
                Route::post('/available-size-libraries', [TemplateController::class, 'getAvailableSizeLibraries'])->name('available-size-libraries');
            });
        });
    });
});
