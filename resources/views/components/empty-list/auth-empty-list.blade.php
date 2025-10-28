{{-- ==========================================
    Auth空状态组件
    功能：显示User的空状态提示
    ========================================== --}}

@include('components.empty-list.templates.empty-list', [
    'icon' => 'bi bi-people',
    'title' => 'No User Data',
    'description' => 'No users have been created in the system yet',
    'buttonText' => 'Create First User',
    'buttonUrl' => route('admin.users.create'),
    'buttonIcon' => 'bi bi-plus-circle-fill me-2',
    'buttonSize' => 'btn-lg'
])

