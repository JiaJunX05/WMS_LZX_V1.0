{{-- ==========================================
    Gender空状态组件
    功能：显示Gender的空状态提示
    ========================================== --}}

@include('components.empty-list.templates.empty-list', [
    'icon' => 'bi bi-gender-ambiguous',
    'title' => 'No Gender Data',
    'description' => 'No genders have been created in the system yet',
    'buttonText' => 'Create First Gender',
    'buttonUrl' => route('admin.gender.create'),
    'buttonIcon' => 'bi bi-plus-circle-fill me-2',
    'buttonSize' => 'btn-lg'
])

