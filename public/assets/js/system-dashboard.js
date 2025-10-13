// 仪表板管理类 - 优化版
class DashboardManager {
    constructor() {
        this.refreshInterval = null;
        this.animationQueue = [];
        this.isInitialized = false;
        this.cache = new Map();

        this.init();
    }

    init() {
        if (this.isInitialized) return;

        this.bindEvents();
        this.initializeDashboard();
        this.startAutoRefresh();
        this.addAccessibilityFeatures();
        this.isInitialized = true;
    }

    bindEvents() {
        // 卡片悬停效果
        $(document).on('mouseenter', '.dashboard-card', this.handleCardHover.bind(this));
        $(document).on('mouseleave', '.dashboard-card', this.handleCardLeave.bind(this));

        // 统计项悬停效果
        $(document).on('mouseenter', '.stat-item', this.handleStatHover.bind(this));
        $(document).on('mouseleave', '.stat-item', this.handleStatLeave.bind(this));

        // 页面可见性变化
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

        // 窗口大小变化
        window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));
    }

    initializeDashboard() {
        this.addLoadingAnimation();

        // 使用 requestAnimationFrame 优化动画
        requestAnimationFrame(() => {
            setTimeout(() => {
                this.removeLoadingAnimation();
                this.animateNumbers();
            }, 1000);
        });
    }

    addLoadingAnimation() {
        $('.stat-value').addClass('loading-skeleton');
    }

    removeLoadingAnimation() {
        $('.stat-value').removeClass('loading-skeleton');
    }

    animateNumbers() {
        $('.stat-value').each((index, element) => {
            const $this = $(element);
            const targetValue = parseInt($this.text()) || 0;

            if (targetValue === 0) return;

            $this.text('0');

            // 使用更平滑的动画
            this.animateValue($this, 0, targetValue, 1500);
        });
    }

    animateValue($element, start, end, duration) {
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // 使用 easeOutCubic 缓动函数
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(start + (end - start) * easeProgress);

            $element.text(currentValue);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                $element.text(end);
            }
        };

        requestAnimationFrame(animate);
    }

    startAutoRefresh() {
        // 暂时禁用自动刷新，避免认证问题
        // this.refreshInterval = setInterval(() => {
        //     if (!document.hidden) {
        //         this.refreshDashboard();
        //     }
        // }, 30000);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    async refreshDashboard() {
        try {
            const url = this.getRefreshUrl();
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();

            if (data.success) {
                this.updateDashboardData(data.data);
            }
        } catch (error) {
            console.error('Failed to refresh dashboard data:', error);
        }
    }

    getRefreshUrl() {
        const userRole = window.userRole || 'Admin';
        return userRole === 'SuperAdmin'
            ? '/superadmin/dashboard/data'
            : '/admin/dashboard/data';
    }

    updateDashboardData(data) {
        // 批量更新DOM
        const updates = [];

        // 产品数据
        updates.push(
            this.updateStatValue('total-products', data.products.total),
            this.updateStatValue('active-products', data.products.active),
            this.updateStatValue('inactive-products', data.products.inactive)
        );

        // 员工数据
        updates.push(
            this.updateStatValue('total-staff', data.staff.total),
            this.updateStatValue('admin-staff', data.staff.admin),
            this.updateStatValue('staff-members', data.staff.staff)
        );

        // 分类数据
        updates.push(
            this.updateStatValue('main-categories', data.categories.categories),
            this.updateStatValue('subcategories', data.categories.subcategories),
            this.updateStatValue('mappings', data.categories.mappings)
        );

        // 尺码数据
        updates.push(
            this.updateStatValue('size-libraries', data.sizes.size_libraries),
            this.updateStatValue('size-templates', data.sizes.size_templates)
        );

        // 存储位置数据
        updates.push(
            this.updateStatValue('zones', data.locations.zones),
            this.updateStatValue('racks', data.locations.racks),
            this.updateStatValue('locations', data.locations.locations)
        );

        // 库存数据
        updates.push(
            this.updateStatValue('stock-in', data.stock.in_stock),
            this.updateStatValue('stock-out', data.stock.out_stock),
            this.updateStatValue('stock-return', data.stock.return_stock),
            this.updateStatValue('total-movements', data.stock.total_items)
        );

        // 品牌数据
        updates.push(
            this.updateStatValue('total-brands', data.brands.total),
            this.updateStatValue('active-brands', data.brands.active),
            this.updateStatValue('inactive-brands', data.brands.inactive)
        );

        // 颜色数据
        updates.push(
            this.updateStatValue('total-colors', data.colors.total),
            this.updateStatValue('active-colors', data.colors.active),
            this.updateStatValue('inactive-colors', data.colors.inactive)
        );

        // 性别数据
        updates.push(
            this.updateStatValue('total-gender', data.gender.total),
            this.updateStatValue('active-gender', data.gender.active),
            this.updateStatValue('inactive-gender', data.gender.inactive)
        );

        // 更新进度条
        this.updateProgressBar(data.products.total, data.products.active);

        // 执行所有更新
        Promise.all(updates);
    }

    updateStatValue(elementId, newValue) {
        return new Promise((resolve) => {
            const element = document.getElementById(elementId);
            if (!element) {
                resolve();
                return;
            }

            const currentValue = parseInt(element.textContent) || 0;
            if (currentValue !== newValue) {
                element.textContent = newValue;
                element.classList.add('updated');

                setTimeout(() => {
                    element.classList.remove('updated');
                    resolve();
                }, 600);
            } else {
                resolve();
            }
        });
    }

    updateProgressBar(total, active) {
        const percentage = total > 0 ? (active / total) * 100 : 0;
        const progressFill = document.querySelector('.progress-fill');
        const activeRate = document.getElementById('active-rate');

        if (progressFill) {
            progressFill.style.width = percentage + '%';
        }

        if (activeRate) {
            activeRate.textContent = percentage.toFixed(1) + '%';
        }
    }

    handleCardHover(e) {
        $(e.currentTarget).addClass('shadow-custom');
    }

    handleCardLeave(e) {
        $(e.currentTarget).removeClass('shadow-custom');
    }

    handleStatHover(e) {
        $(e.currentTarget).addClass('stat-hover');
    }

    handleStatLeave(e) {
        $(e.currentTarget).removeClass('stat-hover');
    }

    handleVisibilityChange() {
        if (document.hidden) {
            this.stopAutoRefresh();
        } else {
            this.startAutoRefresh();
            this.refreshDashboard();
        }
    }

    handleResize() {
        // 响应式调整
        this.adjustLayout();
    }

    adjustLayout() {
        // Bootstrap的row/col系统会自动处理响应式布局
        // 无需手动调整grid布局
        console.log('Layout adjusted for Bootstrap row/col system');
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    addAccessibilityFeatures() {
        // 添加键盘导航支持
        $(document).on('keydown', '.dashboard-card', this.handleKeyboardNavigation.bind(this));

        // 添加屏幕阅读器支持
        this.announceChanges();

        // 添加焦点管理
        this.manageFocus();
    }

    handleKeyboardNavigation(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            $(e.currentTarget).trigger('click');
        }
    }

    announceChanges() {
        // 为屏幕阅读器添加变化通知
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        announcer.id = 'dashboard-announcer';
        document.body.appendChild(announcer);
    }

    manageFocus() {
        // 管理焦点顺序
        const focusableElements = $('.dashboard-card, .stat-item').filter(':visible');
        focusableElements.attr('tabindex', '0');
    }

    announceToScreenReader(message) {
        const announcer = document.getElementById('dashboard-announcer');
        if (announcer) {
            announcer.textContent = message;
        }
    }

    enhanceAnimations() {
        // 根据用户偏好调整动画
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            $('.dashboard-card').removeClass('entering');
            $('.welcome-banner').removeClass('entering');
        }
    }

    addPerformanceMonitoring() {
        // 性能监控
        if ('performance' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'measure') {
                        console.log(`Performance: ${entry.name} took ${entry.duration}ms`);
                    }
                }
            });
            observer.observe({ entryTypes: ['measure'] });
        }
    }

    destroy() {
        this.stopAutoRefresh();
        $(document).off('mouseenter mouseleave', '.dashboard-card');
        $(document).off('mouseenter mouseleave', '.stat-item');
        $(document).off('keydown', '.dashboard-card');
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        window.removeEventListener('resize', this.handleResize);

        // 清理DOM
        const announcer = document.getElementById('dashboard-announcer');
        if (announcer) {
            announcer.remove();
        }
    }
}

// 初始化仪表板
$(document).ready(function() {
    // 设置用户角色
    window.userRole = window.userRole || 'Admin';

    // 性能标记开始
    if ('performance' in window) {
        performance.mark('dashboard-init-start');
    }

    // 创建仪表板管理器实例
    window.dashboardManager = new DashboardManager();

    // 性能标记结束
    if ('performance' in window) {
        performance.mark('dashboard-init-end');
        performance.measure('dashboard-init', 'dashboard-init-start', 'dashboard-init-end');
    }

    // 页面卸载时清理
    $(window).on('beforeunload', function() {
        if (window.dashboardManager) {
            window.dashboardManager.destroy();
        }
    });

    // 添加错误处理
    window.addEventListener('error', function(e) {
        console.error('Dashboard Error:', e.error);
    });

    // 添加未处理的Promise拒绝处理
    window.addEventListener('unhandledrejection', function(e) {
        console.error('Unhandled Promise Rejection:', e.reason);
    });
});
