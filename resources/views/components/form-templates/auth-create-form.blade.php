{{-- ==========================================
    用户创建表单组件
    功能：显示用户创建表单
    ========================================== --}}

@include('components.form-templates.templates.auth-create-form', [
    'formAction' => route('register.submit'),
    'formId' => 'userForm',
    'badgeText' => 'Create',
    'formTitle' => 'Create User Information',
    'formSubtitle' => 'Fill in user information below.',
    'submitButtonText' => 'Create User',
    'submitButtonClass' => 'btn-primary',
    'cancelUrl' => $userRole === 'SuperAdmin' ? route('superadmin.users.management') : route('admin.users.management'),
    'showRoleSelection' => true,
    'showStatusSelection' => false
])
