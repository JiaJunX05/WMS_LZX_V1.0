{{-- ==========================================
    库存详情模态框 - 显示产品库存信息和变动历史
    ========================================== --}}

<div class="modal fade" id="stockDetailModal" tabindex="-1" aria-labelledby="stockDetailModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title fw-bold" id="stockDetailModalLabel">
                    <i class="bi bi-box-seam me-2"></i>Stock Detail
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                {{-- 产品基本信息卡片 --}}
                <div class="card shadow-sm border-0 mb-4">
                    <div class="card-header bg-transparent border-0 pb-3">
                        <h5 class="mb-0 fw-semibold">Product Information</h5>
                    </div>
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-lg-4 text-center">
                                <img id="modal-product-image" src="{{ asset('assets/img/no-image.png') }}"
                                     alt="Product Image" class="img-fluid rounded shadow-sm"
                                     style="max-width: 180px; max-height: 180px; object-fit: cover;">
                            </div>
                            <div class="col-lg-8">
                                <div class="row g-4">
                                    <div class="col-12">
                                        <label class="form-label fw-medium text-muted mb-2">Product Name</label>
                                        <h4 class="mb-0" id="modal-product-name">-</h4>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-medium text-muted mb-2">Current Stock</label>
                                        <div class="d-flex align-items-center">
                                            <span class="fs-3 fw-bold me-2" id="modal-current-stock">-</span>
                                            <small class="text-muted">units</small>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-medium text-muted mb-2">Status</label>
                                        <div>
                                            <span class="badge fs-6" id="modal-product-status">-</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {{-- 库存历史表格 --}}
                <div class="card shadow-sm border-0">
                    <div class="card-header bg-transparent border-0 pb-3 mb-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="d-flex align-items-center gap-3">
                                <h5 class="mb-0 fw-semibold">Stock Movement History</h5>
                                <span class="badge bg-light text-dark" id="modal-detail-history-count">0 records</span>
                            </div>
                        </div>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th class="ps-4" style="width: 10%">
                                            <div class="fw-bold text-muted small text-uppercase">ID</div>
                                        </th>
                                        <th style="width: 10%">
                                            <div class="fw-bold text-muted small text-uppercase">DATE</div>
                                        </th>
                                        <th style="width: 10%">
                                            <div class="fw-bold text-muted small text-uppercase">TYPE</div>
                                        </th>
                                        <th style="width: 10%">
                                            <div class="fw-bold text-muted small text-uppercase">QUANTITY</div>
                                        </th>
                                        <th style="width: 10%">
                                            <div class="fw-bold text-muted small text-uppercase">BEFORE</div>
                                        </th>
                                        <th style="width: 10%">
                                            <div class="fw-bold text-muted small text-uppercase">AFTER</div>
                                        </th>
                                        <th style="width: 10%">
                                            <div class="fw-bold text-muted small text-uppercase">USER</div>
                                        </th>
                                        <th style="width: 10%">
                                            <div class="fw-bold text-muted small text-uppercase">REFERENCE</div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody id="modal-history-table-body">
                                    <tr>
                                        <td colspan="8" class="text-center py-4">
                                            <div class="spinner-border text-primary" role="status">
                                                <span class="visually-hidden">Loading...</span>
                                            </div>
                                            <p class="mt-2 text-muted">Loading history...</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {{-- 空状态显示 --}}
                <div id="modal-empty-state" class="text-center p-5 d-none">
                    <div class="mb-4">
                        <i class="bi bi-box-seam text-muted fs-1"></i>
                    </div>
                    <h4 class="text-secondary fw-semibold mb-3">No Stock Details</h4>
                    <p class="text-muted small mb-4">No stock movement details available for this product</p>
                </div>

                {{-- 分页和结果统计 --}}
                <div class="d-flex justify-content-between align-items-center mt-4">
                    {{-- 分页信息 --}}
                    <div class="text-muted">
                        Showing <span class="fw-medium" id="modal-showing-start">0</span>
                        to <span class="fw-medium" id="modal-showing-end">0</span>
                        of <span class="fw-medium" id="modal-total-count">0</span> entries
                    </div>

                    {{-- 分页控件 --}}
                    <nav aria-label="Page navigation">
                        <ul id="modal-pagination" class="pagination">
                            <li class="page-item disabled" id="modal-prev-page">
                                <a class="page-link" href="#" aria-label="Previous">
                                    <i class="bi bi-chevron-left"></i>
                                </a>
                            </li>
                            <li class="page-item active" id="modal-current-page">
                                <span class="page-link" id="modal-page-number">1</span>
                            </li>
                            <li class="page-item disabled" id="modal-next-page">
                                <a class="page-link" href="#" aria-label="Next">
                                    <i class="bi bi-chevron-right"></i>
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    </div>
</div>

{{-- 库存详情相关 URL --}}
<script>
    // 库存详情相关 URL
    window.stockHistoryApiRoute = "{{ route('api.stock_history') }}";
    window.productImagePath = "{{ asset('assets/images') }}";
    window.defaultProductImage = "{{ asset('assets/img/no-image.png') }}";
</script>

