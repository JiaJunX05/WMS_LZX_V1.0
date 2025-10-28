{{-- ==========================================
    Template分页导航组件
    功能：显示Size Template的分页导航和信息
    ========================================== --}}

@include('components.pagination-nav.templates.pagination-nav', [
    'showInfo' => true,
    'infoPrefix' => 'Showing',
    'infoSuffix' => 'entries'
])
