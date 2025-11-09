{{-- ==========================================
    产品筛选侧边栏组件
    功能：产品页面的筛选侧边栏
    ========================================== --}}

<div class="filter-sidebar">
    {{-- 篩選頭部 --}}
    <div class="filter-header">
        <div class="d-flex align-items-center">
            <div class="filter-icon"><i class="bi bi-funnel"></i></div>
            <h5 class="mb-0">Filters</h5>
        </div>
        <button class="btn btn-sm btn-outline-secondary" id="clear-filters">
            <i class="bi bi-arrow-clockwise me-1"></i>Clear All
        </button>
    </div>

    {{-- 分類篩選 --}}
    <div class="filter-group">
        <div class="filter-group-header"
             data-bs-toggle="collapse"
             data-bs-target="#filter-categoryCollapse"
             aria-expanded="true">
            <div class="d-flex align-items-center">
                <i class="bi bi-tags me-2"></i>
                <span>Categories</span>
            </div>
            <i class="bi bi-chevron-down filter-arrow"></i>
        </div>
        <div class="collapse show" id="filter-categoryCollapse">
            <div class="filter-group-content">
                <div class="filter-option active" data-category="">
                    <div class="filter-option-icon">
                        <i class="bi bi-grid-3x3-gap-fill"></i>
                    </div>
                    <span>All Categories</span>
                    <div class="filter-option-count">{{ $categories->sum('products_count') }}</div>
                </div>

                @foreach($categories as $category)
                    <div class="filter-option" data-category="{{ $category->id }}">
                        <div class="filter-option-icon">
                            @if($category->category_image)
                                <img src="{{ asset('assets/images/' . $category->category_image) }}"
                                     alt="{{ $category->category_name }}"
                                     class="filter-option-image"
                                     onerror="this.onerror=null; this.src='{{ asset('assets/images/placeholder.png') }}';"
                                     title="Image: {{ $category->category_image }}">
                            @else
                                <i class="bi bi-tag-fill" title="No image for {{ $category->category_name }}"></i>
                            @endif
                        </div>
                        <span>{{ $category->category_name }}</span>
                        <div class="filter-option-count">{{ $category->products_count ?? '0' }}</div>
                    </div>
                @endforeach
            </div>
        </div>
    </div>

    {{-- 子分類篩選 --}}
    <div class="filter-group">
        <div class="filter-group-header"
             data-bs-toggle="collapse"
             data-bs-target="#filter-subcategoryCollapse"
             aria-expanded="false">
            <div class="d-flex align-items-center">
                <i class="bi bi-diagram-3 me-2"></i>
                <span>Subcategories</span>
            </div>
            <i class="bi bi-chevron-down filter-arrow"></i>
        </div>
        <div class="collapse" id="filter-subcategoryCollapse">
            <div class="filter-group-content">
                @foreach($subcategories as $subcategory)
                    <div class="filter-checkbox">
                        <input type="checkbox"
                               id="filter-subcategory-{{ $subcategory->id }}"
                               data-subcategory="{{ $subcategory->id }}"
                               class="filter-checkbox-input">
                        <label for="filter-subcategory-{{ $subcategory->id }}"
                               class="filter-checkbox-label">
                            <span class="filter-checkbox-text">{{ $subcategory->subcategory_name }}</span>
                            <span class="filter-checkbox-count">{{ $subcategory->products_count ?? '0' }}</span>
                        </label>
                    </div>
                @endforeach
            </div>
        </div>
    </div>

    {{-- 品牌篩選 --}}
    <div class="filter-group">
        <div class="filter-group-header"
             data-bs-toggle="collapse"
             data-bs-target="#filter-brandCollapse"
             aria-expanded="false">
            <div class="d-flex align-items-center">
                <i class="bi bi-award me-2"></i>
                <span>Brands</span>
            </div>
            <i class="bi bi-chevron-down filter-arrow"></i>
        </div>
        <div class="collapse" id="filter-brandCollapse">
            <div class="filter-group-content">
                @foreach($brands as $brand)
                    <div class="filter-checkbox">
                        <input type="checkbox"
                               id="filter-brand-{{ $brand->id }}"
                               data-brand="{{ $brand->id }}"
                               class="filter-checkbox-input">
                        <label for="filter-brand-{{ $brand->id }}"
                               class="filter-checkbox-label">
                            <span class="filter-checkbox-text">{{ $brand->brand_name }}</span>
                            <span class="filter-checkbox-count">{{ $brand->products_count ?? '0' }}</span>
                        </label>
                    </div>
                @endforeach
            </div>
        </div>
    </div>
</div>

