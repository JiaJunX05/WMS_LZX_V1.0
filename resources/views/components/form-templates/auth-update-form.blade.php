{{-- ==========================================
    用户更新表单组件
    功能：显示用户更新表单
    ========================================== --}}

@include('components.form-templates.templates.auth-update-form', [
    'formAction' => $userRole === 'SuperAdmin' ? route('superadmin.users.update', $user->id) : route('admin.users.update', $user->id),
    'formId' => 'updateUserForm',
    'badgeText' => 'Update',
    'formTitle' => 'Update User Information',
    'formSubtitle' => 'Modify user configuration below.',
    'submitButtonText' => 'Update User Information',
    'submitButtonClass' => 'btn-warning',
    'cancelUrl' => $userRole === 'SuperAdmin' ? route('superadmin.users.management') : route('admin.users.management'),
    'showRoleSelection' => true,
    'showStatusSelection' => true,
    'user' => $user,
    'isUpdatingSelf' => $isUpdatingSelf ?? false
])
