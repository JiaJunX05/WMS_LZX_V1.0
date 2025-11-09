{{-- ==========================================
    分类映射管理分页导航组件
    功能：显示分类映射列表的分页导航和信息
    ========================================== --}}

{{-- 分页导航区域 --}}
<div class="d-flex justify-content-between align-items-center mt-4">
    {{-- 分页信息 --}}
    <div class="text-muted">
        Showing <span class="fw-medium" id="showing-start">0</span>
        to <span class="fw-medium" id="showing-end">0</span>
        of <span class="fw-medium" id="total-count">0</span> entries
    </div>

    {{-- 分页控件 --}}
    <nav aria-label="Page navigation">
        <ul id="pagination" class="pagination">
            <li class="page-item disabled" id="prev-page">
                <a class="page-link" href="#" aria-label="Previous">
                    <i class="bi bi-chevron-left"></i>
                </a>
            </li>
            <li class="page-item active" id="current-page">
                <span class="page-link" id="page-number">1</span>
            </li>
            <li class="page-item disabled" id="next-page">
                <a class="page-link" href="#" aria-label="Next">
                    <i class="bi bi-chevron-right"></i>
                </a>
            </li>
        </ul>
    </nav>
</div>

