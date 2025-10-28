{{-- ==========================================
    Rack空状态组件
    功能：显示Rack的空状态提示
    ========================================== --}}

@include('components.empty-list.templates.empty-list', [
    'icon' => 'bi bi-box-seam',
    'title' => 'No Rack Data',
    'description' => 'No racks have been created in the system yet',
    'buttonText' => 'Create First Rack',
    'buttonUrl' => route('admin.rack.create'),
    'buttonIcon' => 'bi bi-plus-circle-fill me-2',
    'buttonSize' => 'btn-lg'
])

