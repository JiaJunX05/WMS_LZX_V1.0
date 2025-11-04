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
        this.init();
    }

    init() {
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
        $('#total-gender').text(data.gender?.total || 0);
    }
}

// 初始化仪表板
$(document).ready(function() {
    // 检查当前页面是否是dashboard页面（有stats-number元素）
    if ($('.stats-number').length > 0) {
        window.dashboardManager = new DashboardManager();
    }
});
