{{-- ==========================================
    Category更新表单组件
    功能：显示Category更新表单
    ========================================== --}}

@include('components.form-templates.templates.normal-update-form', [
    'formAction' => route('admin.category.update', $category->id),
    'formId' => 'updateCategoryForm',
    'entityName' => 'Category',
    'entityNameLower' => 'category',
    'entity' => $category,
    'fields' => [
        'icon' => 'tags',
        'nameLabel' => 'Category Name',
        'nameField' => 'category_name',
        'namePlaceholder' => 'Enter category name',
        'nameHelp' => 'Enter a unique category name',
        'statusHelp' => 'Choose whether the category can be used for product organization'
    ],
    'hasImage' => true,
    'hasLocation' => false,
    'hasColorHex' => false,
    'hasCapacity' => false,
    'hasColorRgb' => false
])
