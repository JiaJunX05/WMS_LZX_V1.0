<!-- 侧边栏 (Desktop) -->
<aside class="sidebar d-none d-lg-flex">
    <!-- Logo Section -->
    <div class="sidebar-header">
        <a class="sidebar-brand" href="{{ route(Auth::user()->dashboardRoute()) }}">
            <div class="brand-icon-wrapper">
                <i class="bi bi-house-door-fill"></i>
            </div>
            <div class="brand-content">
                <span class="brand-text">WMS Dashboard</span>
                <span class="brand-subtitle">
                    @switch(Auth::user()->getAccountRole())
                        @case('SuperAdmin')
                            Super Admin
                            @break
                        @case('Admin')
                            Administrator
                            @break
                        @case('Staff')
                            Staff Member
                            @break
                        @default
                            Staff Member
                    @endswitch
                </span>
            </div>
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

                <!-- Products -->
                <li class="nav-item">
                    <a class="nav-link {{ request()->routeIs('product.*') ? 'active' : '' }}"
                    href="{{ route('product.index') }}">
                        <i class="bi bi-cart-fill menu-icon me-2"></i>
                        <span>Product Management</span>
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
                <!-- Products -->
                <li class="nav-item">
                    <a class="nav-link {{ request()->routeIs('product.*') ? 'active' : '' }}"
                    href="{{ route('product.index') }}">
                        <i class="bi bi-cart-fill menu-icon me-2"></i>
                        <span>Product Management</span>
                    </a>
                </li>

                <!-- Stock Movement -->
                <li class="nav-item">
                    <button class="nav-link {{ request()->routeIs(['staff.stock_management', 'staff.stock_in_page', 'staff.stock_out_page', 'staff.stock_return_page', 'stock_history']) ? 'active' : '' }} has-dropdown w-100 text-start"
                            type="button" data-bs-toggle="collapse" data-bs-target="#stockMovementCollapse">
                        <i class="bi bi-box-seam-fill menu-icon me-2"></i>
                        <span>Stock Movement</span>
                        <i class="bi bi-chevron-down ms-auto"></i>
                    </button>
                    <div class="collapse nav-collapse {{ request()->routeIs(['staff.stock_management', 'staff.stock_in_page', 'staff.stock_out_page', 'staff.stock_return_page', 'stock_history']) ? 'show' : '' }}"
                        id="stockMovementCollapse">
                        <ul class="nav-list sub-nav">
                            <li>
                                <a href="{{ route('staff.stock_management') }}" class="nav-link {{ request()->routeIs('staff.stock_management') ? 'active' : '' }}">
                                    <i class="bi bi-box-seam me-2"></i>
                                    <span>Stock Management</span>
                                </a>
                            </li>
                            <li>
                                <a href="{{ route('stock_history') }}" class="nav-link {{ request()->routeIs('stock_history') ? 'active' : '' }}">
                                    <i class="bi bi-clock-history me-2"></i>
                                    <span>Stock History</span>
                                </a>
                            </li>
                            <li>
                                <a href="{{ route('staff.stock_in_page') }}" class="nav-link {{ request()->routeIs('staff.stock_in_page') ? 'active' : '' }}">
                                    <i class="bi bi-box-arrow-in-down me-2"></i>
                                    <span>Scan In</span>
                                </a>
                            </li>
                            <li>
                                <a href="{{ route('staff.stock_out_page') }}" class="nav-link {{ request()->routeIs('staff.stock_out_page') ? 'active' : '' }}">
                                    <i class="bi bi-box-arrow-up me-2"></i>
                                    <span>Scan Out</span>
                                </a>
                            </li>
                            <li>
                                <a href="{{ route('staff.stock_return_page') }}" class="nav-link {{ request()->routeIs('staff.stock_return_page') ? 'active' : '' }}">
                                    <i class="bi bi-arrow-return-left me-2"></i>
                                    <span>Scan Return</span>
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
            <button type="submit" class="btn btn-outline-danger w-100">
                <i class="bi bi-box-arrow-right me-2"></i>
                <span>Sign Out</span>
            </button>
        </form>
    </div>
</aside>

<!-- Bootstrap Offcanvas for Mobile -->
<div class="offcanvas offcanvas-start d-lg-none" tabindex="-1" id="offcanvasSidebar" aria-labelledby="offcanvasSidebarLabel">
    <div class="offcanvas-header">
        <div class="offcanvas-title d-flex align-items-center" id="offcanvasSidebarLabel">
            <div class="brand-icon-wrapper me-3">
                <i class="bi bi-house-door-fill"></i>
            </div>
            <div class="brand-content">
                <span class="brand-text">WMS Dashboard</span>
                <span class="brand-subtitle">
                    @switch(Auth::user()->getAccountRole())
                        @case('SuperAdmin')
                            Super Admin
                            @break
                        @case('Admin')
                            Administrator
                            @break
                        @case('Staff')
                            Staff Member
                            @break
                        @default
                            Staff Member
                    @endswitch
                </span>
            </div>
        </div>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body p-0">
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

                    <!-- Products -->
                    <li class="nav-item">
                        <a class="nav-link {{ request()->routeIs('product.*') ? 'active' : '' }}"
                        href="{{ route('product.index') }}">
                            <i class="bi bi-cart-fill menu-icon me-2"></i>
                            <span>Product Management</span>
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

                @if(Auth::user()->getAccountRole() === 'Admin')
                    <!-- Storage Location -->
                    <li class="nav-item">
                        <button class="nav-link {{ request()->routeIs(['admin.storage_locations.zone.*', 'admin.storage_locations.rack.*', 'admin.storage_locations.location.*']) ? 'active' : '' }} has-dropdown w-100 text-start"
                                type="button" data-bs-toggle="collapse" data-bs-target="#mobileStorageCollapse">
                            <i class="bi bi-hdd menu-icon me-2"></i>
                            <span>Storage Location</span>
                            <i class="bi bi-chevron-down ms-auto"></i>
                        </button>
                        <div class="collapse nav-collapse {{ request()->routeIs(['admin.storage_locations.zone.*', 'admin.storage_locations.rack.*', 'admin.storage_locations.location.*']) ? 'show' : '' }}"
                            id="mobileStorageCollapse">
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
                                type="button" data-bs-toggle="collapse" data-bs-target="#mobileCategoryCollapse">
                            <i class="bi bi-diagram-3 menu-icon me-2"></i>
                            <span>Category Mapping</span>
                            <i class="bi bi-chevron-down ms-auto"></i>
                        </button>
                        <div class="collapse nav-collapse {{ request()->routeIs(['admin.category_mapping.category.*', 'admin.category_mapping.subcategory.*', 'admin.category_mapping.mapping.*']) ? 'show' : '' }}"
                            id="mobileCategoryCollapse">
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
                                type="button" data-bs-toggle="collapse" data-bs-target="#mobileAttributeCollapse">
                            <i class="bi bi-tools menu-icon me-2"></i>
                            <span>Management Tools</span>
                            <i class="bi bi-chevron-down ms-auto"></i>
                        </button>
                        <div class="collapse nav-collapse {{ request()->routeIs(['admin.management_tool.brand.*', 'admin.management_tool.color.*', 'admin.management_tool.gender.*', 'admin.size_library.type.*']) ? 'show' : '' }}"
                            id="mobileAttributeCollapse">
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

                    <!-- Size Library Management -->
                    <li class="nav-item">
                        <button class="nav-link {{ request()->routeIs(['admin.size_library.type.*', 'admin.size_library.library.*', 'admin.size_library.template.*']) ? 'active' : '' }} has-dropdown w-100 text-start"
                                type="button" data-bs-toggle="collapse" data-bs-target="#mobileSizeLibraryCollapse">
                            <i class="bi bi-rulers menu-icon me-2"></i>
                            <span>Size Management</span>
                            <i class="bi bi-chevron-down ms-auto"></i>
                        </button>
                        <div class="collapse nav-collapse {{ request()->routeIs(['admin.size_library.type.*', 'admin.size_library.library.*', 'admin.size_library.template.*']) ? 'show' : '' }}"
                            id="mobileSizeLibraryCollapse">
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
                    <!-- Products -->
                    <li class="nav-item">
                        <a class="nav-link {{ request()->routeIs('product.*') ? 'active' : '' }}"
                        href="{{ route('product.index') }}">
                            <i class="bi bi-cart-fill menu-icon me-2"></i>
                            <span>Product Management</span>
                        </a>
                    </li>

                    <!-- Stock Movement -->
                    <li class="nav-item">
                        <button class="nav-link {{ request()->routeIs(['staff.stock_management', 'staff.stock_in_page', 'staff.stock_out_page', 'staff.stock_return_page', 'stock_history']) ? 'active' : '' }} has-dropdown w-100 text-start"
                                type="button" data-bs-toggle="collapse" data-bs-target="#mobileStockMovementCollapse">
                            <i class="bi bi-box-seam-fill menu-icon me-2"></i>
                            <span>Stock Movement</span>
                            <i class="bi bi-chevron-down ms-auto"></i>
                        </button>
                        <div class="collapse nav-collapse {{ request()->routeIs(['staff.stock_management', 'staff.stock_in_page', 'staff.stock_out_page', 'staff.stock_return_page', 'stock_history']) ? 'show' : '' }}"
                            id="mobileStockMovementCollapse">
                            <ul class="nav-list sub-nav">
                                <li>
                                    <a href="{{ route('staff.stock_management') }}" class="nav-link {{ request()->routeIs('staff.stock_management') ? 'active' : '' }}">
                                        <i class="bi bi-box-seam me-2"></i>
                                        <span>Stock Management</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="{{ route('stock_history') }}" class="nav-link {{ request()->routeIs('stock_history') ? 'active' : '' }}">
                                        <i class="bi bi-clock-history me-2"></i>
                                        <span>Stock History</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="{{ route('staff.stock_in_page') }}" class="nav-link {{ request()->routeIs('staff.stock_in_page') ? 'active' : '' }}">
                                        <i class="bi bi-box-arrow-in-down me-2"></i>
                                        <span>Scan In</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="{{ route('staff.stock_out_page') }}" class="nav-link {{ request()->routeIs('staff.stock_out_page') ? 'active' : '' }}">
                                        <i class="bi bi-box-arrow-up me-2"></i>
                                        <span>Scan Out</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="{{ route('staff.stock_return_page') }}" class="nav-link {{ request()->routeIs('staff.stock_return_page') ? 'active' : '' }}">
                                        <i class="bi bi-arrow-return-left me-2"></i>
                                        <span>Scan Return</span>
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
                <button type="submit" class="btn btn-outline-danger w-100">
                    <i class="bi bi-box-arrow-right me-2"></i>
                    <span>Sign Out</span>
                </button>
            </form>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // 处理子菜单展开/收起
    const dropdownButtons = document.querySelectorAll('.nav-link.has-dropdown');

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

    // 点击导航链接时关闭侧边栏
    const navLinks = document.querySelectorAll('.nav-link:not(.has-dropdown)');
    const offcanvasSidebar = document.getElementById('offcanvasSidebar');

    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (offcanvasSidebar) {
                const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasSidebar);
                if (offcanvasInstance) {
                    offcanvasInstance.hide();
                }
            }
        });
    });
});
</script>
