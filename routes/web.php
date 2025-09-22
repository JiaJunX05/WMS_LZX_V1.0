<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\SuperAdmin\SuperController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Staff\StaffController;
use App\Http\Controllers\Admin\StorageLocations\ZoneController;
use App\Http\Controllers\Admin\StorageLocations\RackController;
use App\Http\Controllers\Admin\StorageLocations\LocationController;
use App\Http\Controllers\Admin\CategoryMappings\CategoryController;
use App\Http\Controllers\Admin\CategoryMappings\SubcategoryController;
use App\Http\Controllers\Admin\CategoryMappings\MappingController;
use App\Http\Controllers\Admin\AttributeVariants\BrandController;
use App\Http\Controllers\Admin\AttributeVariants\ColorController;
use App\Http\Controllers\Admin\AttributeVariants\SizeMappings\SizeTypeController;
use App\Http\Controllers\Admin\AttributeVariants\SizeMappings\SizeClothingController;
use App\Http\Controllers\Admin\AttributeVariants\SizeMappings\SizeShoesController;
use App\Http\Controllers\Admin\AttributeVariants\GenderController;
use App\Http\Controllers\Admin\ProductController;
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
            'SuperAdmin' => redirect()->route('superadmin.staff_management'),
            'Admin' => redirect()->route('admin.staff_management'),
            default => abort(403, 'Access denied')
        };
    })->name('staff_management');

    // 用户注册页面重定向
    Route::get('/register', function () {
        $user = auth()->user();
        $role = $user->getAccountRole();

        return match($role) {
            'SuperAdmin' => redirect()->route('superadmin.create_user'),
            'Admin' => redirect()->route('admin.create_staff'),
            default => abort(403, 'Access denied')
        };
    })->name('register');

    // 通用注册提交
    Route::post('/register', [AuthController::class, 'register'])->name('register.submit');

    // =============================================================================
    // SuperAdmin 路由 (SuperAdmin Routes)
    // 超级管理员：拥有所有权限，可以管理所有用户
    // =============================================================================
    Route::prefix('superadmin')->middleware(['role:SuperAdmin'])->name('superadmin.')->group(function () {

        // 仪表板
        Route::get('/dashboard', [SuperController::class, 'index'])->name('dashboard');

        // 员工管理
        Route::get('/staff-management', [SuperController::class, 'showUserList'])->name('staff_management');

        // 用户创建
        Route::get('/create-user', [AuthController::class, 'showRegisterForm'])->name('create_user');
        Route::post('/create-user', [AuthController::class, 'register'])->name('create_user.submit');

        // 用户编辑
        Route::get('/staff/{id}/edit', [SuperController::class, 'showUpdateForm'])->name('update_user');
        Route::put('/staff/{id}/update', [SuperController::class, 'update'])->name('update_user_submit');

        // 用户删除
        Route::delete('/staff/{id}/delete', [SuperController::class, 'deleteAccount'])->name('delete_user');

        // 账户状态管理
        Route::patch('/staff/{id}/unavailable', [SuperController::class, 'unavailableAccount'])->name('set_unavailable');
        Route::patch('/staff/{id}/available', [SuperController::class, 'availableAccount'])->name('set_available');

        // 角色更改
        Route::patch('/staff/{id}/change-role', [SuperController::class, 'changeRole'])->name('change_role');
    });

    // =============================================================================
    // Admin 路由 (Admin Routes)
    // 管理员：可以管理员工，但不能更改角色或删除用户
    // =============================================================================
    Route::prefix('admin')->middleware(['role:Admin'])->name('admin.')->group(function () {

        // 仪表板
        Route::get('/dashboard', [AdminController::class, 'index'])->name('dashboard');

        // 员工管理
        Route::get('/staff-management', [AdminController::class, 'showUserList'])->name('staff_management');

        // 员工创建
        Route::get('/create-staff', [AuthController::class, 'showRegisterForm'])->name('create_staff');
        Route::post('/create-staff', [AuthController::class, 'register'])->name('create_staff.submit');

        // 员工编辑
        Route::get('/staff/{id}/edit', [AdminController::class, 'showUpdateForm'])->name('update_user');
        Route::put('/staff/{id}/update', [AdminController::class, 'update'])->name('update_user_submit');

        // 账户状态管理
        Route::patch('/staff/{id}/unavailable', [AdminController::class, 'unavailableAccount'])->name('set_unavailable');
        Route::patch('/staff/{id}/available', [AdminController::class, 'availableAccount'])->name('set_available');

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
                Route::get('/{id}/edit', [LocationController::class, 'edit'])->name('edit');
                Route::put('/{id}/update', [LocationController::class, 'update'])->name('update');
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
                Route::get('/{id}/edit', [MappingController::class, 'edit'])->name('edit');
                Route::put('/{id}/update', [MappingController::class, 'update'])->name('update');
                Route::delete('/{id}/delete', [MappingController::class, 'destroy'])->name('destroy');
            });
        });

        // =============================================================================
        // 属性变量管理路由 (Attribute Variant Management Routes)
        // =============================================================================
        Route::prefix('attribute_variant')->name('attribute_variant.')->group(function () {

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

            // 尺寸类型管理 (Size Type Management)
            Route::prefix('size_type')->name('size_type.')->group(function () {
                Route::get('/index', [SizeTypeController::class, 'index'])->name('index');
                Route::get('/create', [SizeTypeController::class, 'create'])->name('create');
                Route::post('/store', [SizeTypeController::class, 'store'])->name('store');
                Route::get('/{id}/edit', [SizeTypeController::class, 'edit'])->name('edit');
                Route::put('/{id}/update', [SizeTypeController::class, 'update'])->name('update');
                Route::patch('/{id}/available', [SizeTypeController::class, 'setAvailable'])->name('available');
                Route::patch('/{id}/unavailable', [SizeTypeController::class, 'setUnavailable'])->name('unavailable');
                Route::delete('/{id}/delete', [SizeTypeController::class, 'destroy'])->name('destroy');
            });

            // 衣服尺寸管理 (Size Clothing Management)
            Route::prefix('size_clothing')->name('size_clothing.')->group(function () {
                Route::get('/index', [SizeClothingController::class, 'index'])->name('index');
                Route::get('/create', [SizeClothingController::class, 'create'])->name('create');
                Route::post('/store', [SizeClothingController::class, 'store'])->name('store');
                Route::get('/{id}/edit', [SizeClothingController::class, 'edit'])->name('edit');
                Route::put('/{id}/update', [SizeClothingController::class, 'update'])->name('update');
                Route::patch('/{id}/available', [SizeClothingController::class, 'setAvailable'])->name('available');
                Route::patch('/{id}/unavailable', [SizeClothingController::class, 'setUnavailable'])->name('unavailable');
                Route::delete('/{id}/delete', [SizeClothingController::class, 'destroy'])->name('destroy');
            });

            // 鞋子尺寸管理 (Size Shoes Management)
            Route::prefix('size_shoes')->name('size_shoes.')->group(function () {
                Route::get('/index', [SizeShoesController::class, 'index'])->name('index');
                Route::get('/create', [SizeShoesController::class, 'create'])->name('create');
                Route::post('/store', [SizeShoesController::class, 'store'])->name('store');
                Route::get('/{id}/edit', [SizeShoesController::class, 'edit'])->name('edit');
                Route::put('/{id}/update', [SizeShoesController::class, 'update'])->name('update');
                Route::patch('/{id}/available', [SizeShoesController::class, 'setAvailable'])->name('available');
                Route::patch('/{id}/unavailable', [SizeShoesController::class, 'setUnavailable'])->name('unavailable');
                Route::delete('/{id}/delete', [SizeShoesController::class, 'destroy'])->name('destroy');
            });
        });
    });

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
    // Staff 路由 (Staff Routes)
    // 员工：基础权限，只能访问自己的仪表板
    // =============================================================================
    Route::prefix('staff')->middleware(['role:Staff'])->name('staff.')->group(function () {
        Route::get('/dashboard', [StaffController::class, 'index'])->name('dashboard');

        // 库存管理路由
        Route::get('/stock-management', [StaffController::class, 'stockManagement'])->name('stock_management');
        Route::get('/stock-in-page', [StaffController::class, 'stockInPage'])->name('stock_in_page');
        Route::get('/stock-out-page', [StaffController::class, 'stockOutPage'])->name('stock_out_page');
        Route::post('/stock-in', [StaffController::class, 'stockIn'])->name('stock_in');
        Route::post('/stock-out', [StaffController::class, 'stockOut'])->name('stock_out');
        Route::get('/stock-history/{id}', [StaffController::class, 'getStockHistory'])->name('staff.stock_history');

    });

    // 公共库存历史报告功能 - 所有认证用户都可以访问
    Route::get('/stock-history', [StockController::class, 'stockHistoryReport'])->name('stock_history');
    Route::get('/api/stock-history', [StockController::class, 'getStockHistory'])->name('api.stock_history');
    Route::get('/api/product-stock-history/{id}', [StockController::class, 'getProductStockHistory'])->name('api.product_stock_history');
    Route::get('/api/stock-statistics', [StockController::class, 'getStockStatistics'])->name('api.stock_statistics');

});
