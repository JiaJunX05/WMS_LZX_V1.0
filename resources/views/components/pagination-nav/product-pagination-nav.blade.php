{{-- ==========================================
    产品分页导航组件
    功能：产品页面专用的分页导航和信息
    ========================================== --}}

@include('components.pagination-nav.templates.pagination-nav', [
    'showInfo' => true,
    'infoPrefix' => 'Showing',
    'infoSuffix' => 'entries'
])
