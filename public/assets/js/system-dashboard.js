/**
 * System Dashboard JavaScript
 * 系统仪表板统计数据显示
 *
 * 与 auth-management.js 保持相同的简单处理方式
 *
 * @author WMS Team
 * @version 1.0.0
 */

/**
 * Dashboard Manager 类
 * 系统仪表板页面交互逻辑
 */
class DashboardManager {
    constructor() {
        this.isLoading = false;
        this.isInitialized = false;
        this.init();
    }

    init() {
        // 防止重复初始化
        if (this.isInitialized) {
            console.warn('DashboardManager already initialized');
            return;
        }
        this.isInitialized = true;

        // 先将所有数字显示为 0
        this.resetStatsToZero();
        // 延迟一点再加载实际统计数据，让用户能看到从 0 变成目标值的过程
        setTimeout(() => {
            this.loadStats();
        }, 100);
    }

    /**
     * 将所有统计数字重置为 0
     */
    resetStatsToZero() {
        $('.stats-number').text('0');
    }

    /**
     * 加载统计数据
     */
    loadStats() {
        // 防止重复请求
        if (this.isLoading) {
            console.warn('Stats already loading, skipping duplicate request');
            return;
        }

        this.isLoading = true;
        const userRole = window.userRole || 'Admin';
        const apiRoute = userRole === 'SuperAdmin'
            ? '/superadmin/dashboard/data'
            : '/admin/dashboard/data';

        $.get(apiRoute)
            .done((response) => {
                if (response.success && response.data) {
                    this.updateStats(response.data);
                }
            })
            .fail(() => {
                console.error('Failed to load dashboard statistics');
            })
            .always(() => {
                this.isLoading = false;
            });
    }

    /**
     * 更新统计数据显示
     * @param {Object} data 统计数据
     */
    updateStats(data) {
        $('#total-products').text(data.products?.total || 0);
        $('#total-staff').text(data.staff?.total || 0);
        $('#main-categories').text(data.categories?.categories || 0);
        $('#subcategories').text(data.categories?.subcategories || 0);
        $('#size-libraries').text(data.sizes?.size_libraries || 0);
        $('#size-templates').text(data.sizes?.size_templates || 0);
        $('#zones').text(data.locations?.zones || 0);
        $('#total-brands').text(data.brands?.total || 0);
        $('#total-colors').text(data.colors?.total || 0);
        $('#total-stock-movements').text(data.stock?.total || 0);
    }
}

// 初始化仪表板
$(document).ready(function() {
    // 检查当前页面是否是dashboard页面（有stats-number元素）
    // 防止重复初始化
    if ($('.stats-number').length > 0 && !window.dashboardManager) {
        window.dashboardManager = new DashboardManager();
    }
});
