{{-- ==========================================
    Template创建表单组件
    功能：使用专门的尺码模板创建表单
    ========================================== --}}

@include('components.form-templates.templates.template-create-form', [
    'formAction' => route('admin.template.store'),
    'formId' => 'templateForm',
    'categories' => $categories,
    'genders' => $genders
])
