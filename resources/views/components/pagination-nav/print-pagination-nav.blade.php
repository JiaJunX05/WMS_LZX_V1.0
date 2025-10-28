{{-- ==========================================
    打印管理分页导航组件
    功能：显示分页导航和结果统计
    ========================================== --}}

@include('components.pagination-nav.templates.pagination-nav', [
    'showInfo' => true,
    'infoPrefix' => 'Showing',
    'infoSuffix' => 'entries'
])

