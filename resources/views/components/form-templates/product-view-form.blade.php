{{-- ==========================================
    产品查看表单组件
    功能：显示产品查看表单
    ========================================== --}}

{{-- PHP 变量处理 --}}
@php
    $variant = $product->variants->first();
    $attributeVariant = $variant ? $variant->attributeVariant : null;
    $brand = $attributeVariant && $attributeVariant->brand ? $attributeVariant->brand : null;
    $color = $attributeVariant && $attributeVariant->color ? $attributeVariant->color : null;
    $size = $attributeVariant && $attributeVariant->size ? $attributeVariant->size : null;
    $gender = $attributeVariant && $attributeVariant->gender ? $attributeVariant->gender : null;
@endphp

@include('components.form-templates.templates.product-view-form', [
    'product' => $product,
    'variant' => $variant,
    'attributeVariant' => $attributeVariant,
    'brand' => $brand,
    'color' => $color,
    'size' => $size,
    'gender' => $gender
])

