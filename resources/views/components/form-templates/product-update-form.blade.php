{{-- ==========================================
    产品更新表单组件
    功能：显示产品更新表单
    ========================================== --}}

{{-- PHP 变量处理 --}}
@php
    $variant = $product->variants->first();
    $attributeVariant = $variant ? $variant->attributeVariant : null;
    $brand = $attributeVariant && $attributeVariant->brand ? $attributeVariant->brand : null;
    $color = $attributeVariant && $attributeVariant->color ? $attributeVariant->color : null;
    $size = $attributeVariant && $attributeVariant->size ? $attributeVariant->size : null;
    $currentSizeId = $attributeVariant ? $attributeVariant->size_id : '';
@endphp

@include('components.form-templates.templates.product-update-form', [
    'formAction' => route('product.update', $product->id),
    'formId' => 'product-form',
    'product' => $product,
    'variant' => $variant,
    'attributeVariant' => $attributeVariant,
    'brand' => $brand,
    'color' => $color,
    'size' => $size,
    'zones' => $zones,
    'racks' => $racks,
    'categories' => $categories,
    'subcategories' => $subcategories,
    'brands' => $brands,
    'colors' => $colors,
    'sizes' => $sizes,
    'mappings' => $mappings,
    'locations' => $locations,
    'rackCapacities' => $rackCapacities,
    'currentSizeId' => $currentSizeId
])

