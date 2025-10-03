<!-- 侧边栏 -->
<aside class="sidebar">
    <!-- Logo Section -->
    <div class="sidebar-header">
        <a class="sidebar-brand" href="{{ route(Auth::user()->dashboardRoute()) }}">
            <i class="bi bi-house-door-fill me-2"></i>
            <span class="brand-text">
                @switch(Auth::user()->getAccountRole())
                    @case('SuperAdmin')
                        Super Admin Dashboard
                        @break
                    @case('Admin')
                        Admin Dashboard
                        @break
                    @case('Staff')
                        Staff Dashboard
                        @break
                    @default
                        Staff Dashboard
                @endswitch
            </span>
        </a>
        <button class="sidebar-toggle d-xl-none">
            <i class="bi bi-x-lg"></i>
        </button>
    </div>

    <!-- Sidebar Navigation -->
    <nav class="sidebar-nav">
        <ul class="nav-list">
            <!-- Shared by SuperAdmin and Admin -->
            @if(Auth::user()->getAccountRole() === 'SuperAdmin' || Auth::user()->getAccountRole() === 'Admin')
                <!-- Staff Management -->
                <li class="nav-item">
                    <a class="nav-link {{ request()->routeIs('staff_management.*') ? 'active' : '' }}"
                       href="{{ route('staff_management') }}">
                        <i class="bi bi-people-fill menu-icon me-2"></i>
                        <span>Staff Management</span>
                    </a>
                </li>

                <!-- Stock History -->
                <li class="nav-item">
                    <a class="nav-link {{ request()->routeIs('stock_history') ? 'active' : '' }}"
                       href="{{ route('stock_history') }}">
                        <i class="bi bi-file-earmark-spreadsheet-fill menu-icon me-2"></i>
                        <span>Stock History</span>
                    </a>
                </li>
            @endif

            <!-- Products -->
            <li class="nav-item">
                <a class="nav-link {{ request()->routeIs('product.*') ? 'active' : '' }}"
                href="{{ route('product.index') }}">
                    <i class="bi bi-cart-fill menu-icon me-2"></i>
                    <span>Product Management</span>
                </a>
            </li>

            @if(Auth::user()->getAccountRole() === 'Admin')
                <!-- Storage Location -->
                <li class="nav-item">
                    <button class="nav-link {{ request()->routeIs(['admin.storage_locations.zone.*', 'admin.storage_locations.rack.*', 'admin.storage_locations.location.*']) ? 'active' : '' }} has-dropdown w-100 text-start"
                            type="button" data-bs-toggle="collapse" data-bs-target="#storageCollapse">
                        <i class="bi bi-hdd menu-icon me-2"></i>
                        <span>Storage Location</span>
                        <i class="bi bi-chevron-down ms-auto"></i>
                    </button>
                    <div class="collapse nav-collapse {{ request()->routeIs(['admin.storage_locations.zone.*', 'admin.storage_locations.rack.*', 'admin.storage_locations.location.*']) ? 'show' : '' }}"
                        id="storageCollapse">
                        <ul class="nav-list sub-nav">
                            <li>
                                <a href="{{ route('admin.storage_locations.zone.index')}}" class="nav-link {{ request()->routeIs('admin.storage_locations.zone.*') ? 'active' : '' }}">
                                    <i class="bi bi-map me-2"></i>
                                    <span>Zone Management</span>
                                </a>
                            </li>
                            <li>
                                <a href="{{ route('admin.storage_locations.rack.index') }}" class="nav-link {{ request()->routeIs('admin.storage_locations.rack.*') ? 'active' : '' }}">
                                    <i class="bi bi-bar-chart-steps me-2"></i>
                                    <span>Rack Management</span>
                                </a>
                            </li>
                            <li>
                                <a href="{{ route('admin.storage_locations.location.index') }}" class="nav-link {{ request()->routeIs('admin.storage_locations.location.*') ? 'active' : '' }}">
                                    <i class="bi bi-bezier2 me-2"></i>
                                    <span>Location Management</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </li>

                <!-- Categories -->
                <li class="nav-item">
                    <button class="nav-link {{ request()->routeIs(['admin.category_mapping.category.*', 'admin.category_mapping.subcategory.*', 'admin.category_mapping.mapping.*']) ? 'active' : '' }} has-dropdown w-100 text-start"
                            type="button" data-bs-toggle="collapse" data-bs-target="#categoryCollapse">
                        <i class="bi bi-diagram-3 menu-icon me-2"></i>
                        <span>Category Mapping</span>
                        <i class="bi bi-chevron-down ms-auto"></i>
                    </button>
                    <div class="collapse nav-collapse {{ request()->routeIs(['admin.category_mapping.category.*', 'admin.category_mapping.subcategory.*', 'admin.category_mapping.mapping.*']) ? 'show' : '' }}"
                        id="categoryCollapse">
                        <ul class="nav-list sub-nav">
                            <li>
                                <a href="{{ route('admin.category_mapping.category.index') }}" class="nav-link {{ request()->routeIs('admin.category_mapping.category.*') ? 'active' : '' }}">
                                    <i class="bi bi-folder-plus me-2"></i>
                                    <span>Category Management</span>
                                </a>
                            </li>
                            <li>
                                <a href="{{ route('admin.category_mapping.subcategory.index') }}" class="nav-link {{ request()->routeIs('admin.category_mapping.subcategory.*') ? 'active' : '' }}">
                                    <i class="bi bi-folder-symlink me-2"></i>
                                    <span>Subcategory Management</span>
                                </a>
                            </li>
                            <li>
                                <a href="{{ route('admin.category_mapping.mapping.index') }}" class="nav-link {{ request()->routeIs('admin.category_mapping.mapping.*') ? 'active' : '' }}">
                                    <i class="bi bi-folder-fill me-2"></i>
                                    <span>Mapping Management</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </li>

                <!-- Management Tools -->
                <li class="nav-item">
                    <button class="nav-link {{ request()->routeIs(['admin.management_tool.brand.*', 'admin.management_tool.color.*', 'admin.management_tool.gender.*', 'admin.size_library.type.*']) ? 'active' : '' }} has-dropdown w-100 text-start"
                            type="button" data-bs-toggle="collapse" data-bs-target="#attributeCollapse">
                        <i class="bi bi-tools menu-icon me-2"></i>
                        <span>Management Tools</span>
                        <i class="bi bi-chevron-down ms-auto"></i>
                    </button>
                    <div class="collapse nav-collapse {{ request()->routeIs(['admin.management_tool.brand.*', 'admin.management_tool.color.*', 'admin.management_tool.gender.*', 'admin.size_library.type.*']) ? 'show' : '' }}"
                        id="attributeCollapse">
                        <ul class="nav-list sub-nav">
                            <li>
                                <a href="{{ route('admin.management_tool.brand.index') }}" class="nav-link {{ request()->routeIs('admin.management_tool.brand.*') ? 'active' : '' }}">
                                    <i class="bi bi-award-fill me-2"></i>
                                    <span>Brand Management</span>
                                </a>
                            </li>
                            <li>
                                <a href="{{ route('admin.management_tool.color.index') }}" class="nav-link {{ request()->routeIs('admin.management_tool.color.*') ? 'active' : '' }}">
                                    <i class="bi bi-droplet-fill me-2"></i>
                                    <span>Color Management</span>
                                </a>
                            </li>
                            <li>
                                <a href="{{ route('admin.management_tool.gender.index') }}" class="nav-link {{ request()->routeIs('admin.management_tool.gender.*') ? 'active' : '' }}">
                                    <i class="bi bi-person-fill me-2"></i>
                                    <span>Gender Management</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </li>

                {{-- <!-- Size Management -->
                <li class="nav-item">
                    <button class="nav-link {{ request()->routeIs(['admin.size_library.type.*', 'admin.size_library.library.*', 'admin.size_library.template.*']) ? 'active' : '' }} has-dropdown w-100 text-start"
                            type="button" data-bs-toggle="collapse" data-bs-target="#sizeManagementCollapse">
                        <i class="bi bi-rulers menu-icon me-2"></i>
                        <span>Size Management</span>
                        <i class="bi bi-chevron-down ms-auto"></i>
                    </button>
                    <div class="collapse nav-collapse {{ request()->routeIs(['admin.size_library.type.*', 'admin.size_library.library.*', 'admin.size_library.template.*']) ? 'show' : '' }}"
                        id="sizeManagementCollapse">
                        <ul class="nav-list sub-nav">
                            <li>
                                <a href="{{ route('admin.size_library.library.index') }}" class="nav-link {{ request()->routeIs('admin.size_library.library.*') ? 'active' : '' }}">
                                    <i class="bi bi-person-badge me-2"></i>
                                    <span>Clothing Sizes</span>
                                </a>
                            </li>
                            <li>
                                <a href="{{ route('admin.size_library.template.index') }}" class="nav-link {{ request()->routeIs('admin.size_library.template.*') ? 'active' : '' }}">
                                    <i class="bi bi-bootstrap me-2"></i>
                                    <span>Shoe Sizes</span>
                                </a>
                            </li>
                            <li>
                                <a href="{{ route('admin.size_library.type.index') }}" class="nav-link {{ request()->routeIs('admin.size_library.type.*') ? 'active' : '' }}">
                                    <i class="bi bi-diagram-3 me-2"></i>
                                    <span>Size Types Mapping</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </li> --}}

                <!-- Size Library Management -->
                <li class="nav-item">
                    <button class="nav-link {{ request()->routeIs(['admin.size_library.type.*', 'admin.size_library.library.*', 'admin.size_library.template.*']) ? 'active' : '' }} has-dropdown w-100 text-start"
                            type="button" data-bs-toggle="collapse" data-bs-target="#sizeLibraryCollapse">
                        <i class="bi bi-rulers menu-icon me-2"></i>
                        <span>Size Management</span>
                        <i class="bi bi-chevron-down ms-auto"></i>
                    </button>
                    <div class="collapse nav-collapse {{ request()->routeIs(['admin.size_library.type.*', 'admin.size_library.library.*', 'admin.size_library.template.*']) ? 'show' : '' }}"
                        id="sizeLibraryCollapse">
                        <ul class="nav-list sub-nav">
                            <li>
                                <a href="{{ route('admin.size_library.library.index') }}" class="nav-link {{ request()->routeIs('admin.size_library.library.*') ? 'active' : '' }}">
                                    <i class="bi bi-collection me-2"></i>
                                    <span>Size Libraries</span>
                                </a>
                            </li>
                            <li>
                                <a href="{{ route('admin.size_library.template.index') }}" class="nav-link {{ request()->routeIs('admin.size_library.template.*') ? 'active' : '' }}">
                                    <i class="bi bi-layout-text-window-reverse me-2"></i>
                                    <span>Size Templates</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </li>
            @endif

            @if (Auth::user()->getAccountRole() === 'Staff')
                <!-- Stock Movement -->
                <li class="nav-item">
                    <button class="nav-link {{ request()->routeIs(['staff.stock_management', 'staff.stock_in_page', 'staff.stock_out_page']) ? 'active' : '' }} has-dropdown w-100 text-start"
                            type="button" data-bs-toggle="collapse" data-bs-target="#stockMovementCollapse">
                        <i class="bi bi-box-seam-fill menu-icon me-2"></i>
                        <span>Stock Movement</span>
                        <i class="bi bi-chevron-down ms-auto"></i>
                    </button>
                    <div class="collapse nav-collapse {{ request()->routeIs(['staff.stock_management', 'staff.stock_in_page', 'staff.stock_out_page']) ? 'show' : '' }}"
                        id="stockMovementCollapse">
                        <ul class="nav-list sub-nav">
                            <li>
                                <a href="{{ route('staff.stock_management') }}" class="nav-link {{ request()->routeIs('staff.stock_management') ? 'active' : '' }}">
                                    <i class="bi bi-box-seam me-2"></i>
                                    <span>Stock Management</span>
                                </a>
                            </li>
                            <li>
                                <a href="{{ route('staff.stock_in_page') }}" class="nav-link {{ request()->routeIs('staff.stock_in_page') ? 'active' : '' }}">
                                    <i class="bi bi-box-arrow-in-down me-2"></i>
                                    <span>Quick Scan In</span>
                                </a>
                            </li>
                            <li>
                                <a href="{{ route('staff.stock_out_page') }}" class="nav-link {{ request()->routeIs('staff.stock_out_page') ? 'active' : '' }}">
                                    <i class="bi bi-box-arrow-up me-2"></i>
                                    <span>Quick Scan Out</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </li>
            @endif
        </ul>
    </nav>

    <!-- Bottom Logout Button -->
    <div class="sidebar-footer">
        <form action="{{ route('logout') }}" method="POST">
            @csrf
            <button type="submit" class="btn custom-logout-btn w-100">
                <i class="bi bi-box-arrow-right me-2"></i>
                <span>Sign Out</span>
            </button>
        </form>
    </div>
</aside>

<!-- Mobile Overlay -->
<div class="sidebar-overlay"></div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // 获取元素
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    const dropdownButtons = document.querySelectorAll('.nav-link.has-dropdown');
    const headerToggle = document.querySelector('.navbar-toggler');

    // 移动端侧边栏切换
    function toggleSidebar() {
        sidebar.classList.toggle('show');
        document.body.style.overflow = sidebar.classList.contains('show') ? 'hidden' : '';
    }

    // 点击切换按钮
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }

    // 点击遮罩层
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', toggleSidebar);
    }

    // 点击header按钮
    if (headerToggle) {
        headerToggle.addEventListener('click', toggleSidebar);
    }

    // 处理子菜单展开/收起
    dropdownButtons.forEach(button => {
        const collapseId = button.getAttribute('data-bs-target');
        const collapseElement = document.querySelector(collapseId);

        if (collapseElement) {
            // 使用 Bootstrap 的 collapse 事件
            collapseElement.addEventListener('show.bs.collapse', function () {
                const arrow = button.querySelector('.bi-chevron-down');
                if (arrow) {
                    arrow.style.transform = 'rotate(-180deg)';
                }
            });

            collapseElement.addEventListener('hide.bs.collapse', function () {
                const arrow = button.querySelector('.bi-chevron-down');
                if (arrow) {
                    arrow.style.transform = 'rotate(0deg)';
                }
            });

            // 初始化箭头状态
            const arrow = button.querySelector('.bi-chevron-down');
            if (arrow && collapseElement.classList.contains('show')) {
                arrow.style.transform = 'rotate(-180deg)';
            }
        }
    });
});
</script>
