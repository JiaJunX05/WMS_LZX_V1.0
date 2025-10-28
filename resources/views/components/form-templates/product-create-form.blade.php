{{-- ==========================================
    产品创建表单组件
    功能：显示产品创建表单
    ========================================== --}}

@include('components.form-templates.templates.product-create-form', [
    'formAction' => route('product.store'),
    'formId' => 'product-form',
    'zones' => $zones,
    'categories' => $categories,
    'brands' => $brands,
    'colors' => $colors,
    'genders' => $genders,
    'sizes' => $sizes,
    'mappings' => $mappings,
    'locations' => $locations,
    'rackCapacities' => $rackCapacities
])

