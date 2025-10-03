@extends("layouts.app")

@section("title", "Stock Management")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/common/dashboard-template.css') }}">
<div class="container-fluid py-4">
    <!-- Alert Messages -->
    @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show d-flex align-items-center" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i>
            {{ session('success') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    @if($errors->any())
        <div class="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            @foreach ($errors->all() as $error)
                <div>{{ $error }}</div>
            @endforeach
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    <!-- 页面标题和功能按钮 -->
    <div class="dashboard-header mb-4">
        <div class="card shadow-sm border-0">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-lg-8">
                        <div class="d-flex align-items-center">
                            <div class="header-icon-wrapper me-4">
                                <i class="bi bi-box-seam-fill"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">Stock Management</h2>
                                <p class="dashboard-subtitle mb-0">Manage product inventory movements</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4 text-lg-end">
                        <button class="btn btn-success me-2" data-bs-toggle="modal" data-bs-target="#stockInModal">
                            <i class="bi bi-plus-circle-fill me-2"></i>
                            Stock In
                        </button>
                        <button class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#stockOutModal">
                            <i class="bi bi-dash-circle-fill me-2"></i>
                            Stock Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 产品搜索和筛选 -->
    <div class="search-filter-section mb-4">
        <div class="card shadow-sm border-0">
            <div class="card-body">
                <div class="row g-3 align-items-end">
                    <div class="col-lg-8">
                        <label class="form-label fw-medium">Search Products</label>
                        <div class="search-input-wrapper">
                            <i class="bi bi-search search-icon"></i>
                            <input type="text" class="form-control search-input" id="search-input"
                                   placeholder="Search by product name, SKU, or barcode...">
                        </div>
                    </div>
                    <div class="col-lg-4">
                        <button class="btn btn-outline-secondary w-100" id="clear-search">
                            <i class="bi bi-x-circle me-2"></i>
                            Clear Search
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 产品列表表格 -->
    <div class="card shadow-sm border-0">
        <div class="card-header bg-transparent border-0 pb-3 mb-3">
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-3">
                    <h5 class="mb-0 fw-semibold">Products List</h5>
                    <span class="badge bg-light text-dark" id="results-count">{{ count($products) }} products</span>
                </div>
            </div>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table custom-table mb-0">
                    <thead>
                        <tr>
                            <th class="ps-4" style="width: 8%"><div class="table-header">ID</div></th>
                            <th style="width: 12%"><div class="table-header">IMAGE</div></th>
                            <th style="width: 20%"><div class="table-header">PRODUCT NAME</div></th>
                            <th style="width: 12%"><div class="table-header">SKU CODE</div></th>
                            <th style="width: 10%"><div class="table-header">BRAND</div></th>
                            <th style="width: 8%"><div class="table-header">SIZE</div></th>
                            <th style="width: 8%"><div class="table-header">STOCK</div></th>
                            <th style="width: 8%"><div class="table-header">STATUS</div></th>
                            <th class="text-end pe-4" style="width: 14%"><div class="table-header">ACTIONS</div></th>
                        </tr>
                    </thead>
                    <tbody id="products-table-body">
                        @foreach($products as $product)
                            @php
                                $variant = $product->variants->first();
                                $attributeVariant = $variant ? $variant->attributeVariant : null;
                                $brand = $attributeVariant && $attributeVariant->brand ? $attributeVariant->brand : null;
                                $size = $attributeVariant && $attributeVariant->size ? $attributeVariant->size : null;
                            @endphp
                            <tr data-product-id="{{ $product->id }}" class="product-row">
                                <td class="ps-4">
                                    <span class="fw-medium">#{{ $product->id }}</span>
                                </td>
                                <td>
                                    @if($product->cover_image)
                                        <img src="{{ asset('assets/images/products/' . $product->cover_image) }}"
                                             alt="Product Image"
                                             class="preview-image"
                                             style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
                                    @else
                                        <div class="no-image" style="width: 50px; height: 50px; border-radius: 8px;">
                                            <i class="bi bi-image"></i>
                                        </div>
                                    @endif
                                </td>
                                <td>
                                    <div class="fw-medium">{{ $product->name }}</div>
                                    <div class="text-muted small">{{ $product->category->category_name ?? 'N/A' }}</div>
                                </td>
                                <td>
                                    <code class="bg-light px-2 py-1 rounded">{{ $variant ? $variant->sku_code : 'N/A' }}</code>
                                </td>
                                <td>
                                    <span class="badge bg-primary">{{ $brand ? $brand->brand_name : 'N/A' }}</span>
                                </td>
                                <td>
                                    <span class="badge bg-info">{{ $size ? $size->size_value : 'N/A' }}</span>
                                </td>
                                <td>
                                    <span class="fw-bold {{ $product->quantity > 10 ? 'text-success' : ($product->quantity > 0 ? 'text-warning' : 'text-danger') }}">
                                        {{ $product->quantity }}
                                    </span>
                                </td>
                                <td>
                                    <span class="status-badge {{ $product->product_status === 'Available' ? 'available' : 'unavailable' }}">
                                        {{ $product->product_status }}
                                    </span>
                                </td>
                                <td class="text-end pe-4">
                                    <div class="btn-group btn-group-sm">
                                        <a href="{{ route('staff.stock_in_page') }}?product_id={{ $product->id }}" class="btn btn-success btn-sm" title="Stock In">
                                            <i class="bi bi-plus-circle"></i>
                                        </a>
                                        <a href="{{ route('staff.stock_out_page') }}?product_id={{ $product->id }}" class="btn btn-danger btn-sm" title="Stock Out">
                                            <i class="bi bi-dash-circle"></i>
                                        </a>
                                        <button class="btn btn-info btn-sm" onclick="viewStockHistory({{ $product->id }}, '{{ $product->name }}')" title="View History">
                                            <i class="bi bi-clock-history"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Pagination and Results Statistics -->
    <div class="d-flex justify-content-between align-items-center mt-4">
        <div class="pagination-info text-muted">
            Showing <span class="fw-medium" id="showing-start">0</span>
            to <span class="fw-medium" id="showing-end">0</span>
            of <span class="fw-medium" id="total-count">0</span> entries
        </div>
        <nav aria-label="Page navigation">
            <ul id="pagination" class="pagination pagination-sm mb-0">
                <li class="page-item disabled" id="prev-page">
                    <a class="page-link" href="#" aria-label="Previous">
                        <i class="bi bi-chevron-left"></i>
                    </a>
                </li>
                <!-- Page numbers generated dynamically by JS -->
                <li class="page-item disabled" id="next-page">
                    <a class="page-link" href="#" aria-label="Next">
                        <i class="bi bi-chevron-right"></i>
                    </a>
                </li>
            </ul>
        </nav>
    </div>
</div>

<!-- Stock In Modal -->
<div class="modal fade" id="stockInModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="bi bi-plus-circle text-success me-2"></i>
                    Stock In
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="stockInForm">
                @csrf
                <div class="modal-body">
                    <input type="hidden" id="stockin-product-id" name="product_id">

                    <div class="mb-3">
                        <label for="stockin-product-select" class="form-label fw-medium">Select Product</label>
                        <select class="form-select" id="stockin-product-select" name="product_id" required>
                            <option value="">Choose a product...</option>
                            @foreach($products as $product)
                                @php
                                    $variant = $product->variants->first();
                                @endphp
                                <option value="{{ $product->id }}" data-stock="{{ $product->quantity }}" data-name="{{ $product->name }}">
                                    {{ $product->name }} (SKU: {{ $variant ? $variant->sku_code : 'N/A' }}) - Stock: {{ $product->quantity }}
                                </option>
                            @endforeach
                        </select>
                    </div>

                    <div class="mb-3" id="stockin-selected-product" style="display: none;">
                        <label class="form-label fw-medium">Selected Product</label>
                        <div class="alert alert-info">
                            <div class="fw-medium" id="stockin-product-name"></div>
                            <div class="text-muted small">Current Stock: <span id="stockin-current-stock"></span></div>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="stockin-quantity" class="form-label fw-medium">Quantity to Add</label>
                        <input type="number" class="form-control" id="stockin-quantity" name="quantity" min="1" required>
                    </div>

                    <div class="mb-3">
                        <label for="stockin-reason" class="form-label fw-medium">Reason</label>
                        <select class="form-select" id="stockin-reason" name="movement_reason" required>
                            <option value="">Select Reason</option>
                            <option value="initial_stock">Initial Stock</option>
                            <option value="purchase">Purchase</option>
                            <option value="adjustment">Adjustment</option>
                            <option value="transfer">Transfer</option>
                            <option value="return">Return</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div class="mb-3">
                        <label for="stockin-reference" class="form-label">Reference Number</label>
                        <input type="text" class="form-control" id="stockin-reference" name="reference_number" placeholder="Optional">
                    </div>

                    <div class="mb-3">
                        <label for="stockin-notes" class="form-label">Notes</label>
                        <textarea class="form-control" id="stockin-notes" name="notes" rows="3" placeholder="Optional notes"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-success">
                        <i class="bi bi-plus-circle me-2"></i>
                        Record Stock In
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Stock Out Modal -->
<div class="modal fade" id="stockOutModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="bi bi-dash-circle text-danger me-2"></i>
                    Stock Out
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="stockOutForm">
                @csrf
                <div class="modal-body">
                    <input type="hidden" id="stockout-product-id" name="product_id">

                    <div class="mb-3">
                        <label for="stockout-product-select" class="form-label fw-medium">Select Product</label>
                        <select class="form-select" id="stockout-product-select" name="product_id" required>
                            <option value="">Choose a product...</option>
                            @foreach($products->where('quantity', '>', 0) as $product)
                                @php
                                    $variant = $product->variants->first();
                                @endphp
                                <option value="{{ $product->id }}" data-stock="{{ $product->quantity }}" data-name="{{ $product->name }}">
                                    {{ $product->name }} (SKU: {{ $variant ? $variant->sku_code : 'N/A' }}) - Stock: {{ $product->quantity }}
                                </option>
                            @endforeach
                        </select>
                    </div>

                    <div class="mb-3" id="stockout-selected-product" style="display: none;">
                        <label class="form-label fw-medium">Selected Product</label>
                        <div class="alert alert-warning">
                            <div class="fw-medium" id="stockout-product-name"></div>
                            <div class="text-muted small">Available Stock: <span id="stockout-current-stock"></span></div>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="stockout-quantity" class="form-label fw-medium">Quantity to Remove</label>
                        <input type="number" class="form-control" id="stockout-quantity" name="quantity" min="1" required>
                        <div class="form-text text-danger" id="stockout-quantity-warning" style="display: none;">
                            Insufficient stock available!
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="stockout-reason" class="form-label fw-medium">Reason</label>
                        <select class="form-select" id="stockout-reason" name="movement_reason" required>
                            <option value="">Select Reason</option>
                            <option value="sale">Sale</option>
                            <option value="adjustment">Adjustment</option>
                            <option value="transfer">Transfer</option>
                            <option value="damage">Damage</option>
                            <option value="expired">Expired</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div class="mb-3">
                        <label for="stockout-reference" class="form-label">Reference Number</label>
                        <input type="text" class="form-control" id="stockout-reference" name="reference_number" placeholder="Optional">
                    </div>

                    <div class="mb-3">
                        <label for="stockout-notes" class="form-label">Notes</label>
                        <textarea class="form-control" id="stockout-notes" name="notes" rows="3" placeholder="Optional notes"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-danger">
                        <i class="bi bi-dash-circle me-2"></i>
                        Record Stock Out
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Stock History Modal -->
<div class="modal fade" id="stockHistoryModal" tabindex="-1">
    <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="bi bi-clock-history text-info me-2"></i>
                    My Stock Movement History
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <div class="mb-3">
                    <div class="alert alert-info">
                        <div class="fw-medium" id="history-product-name"></div>
                        <div class="text-muted small">Current Stock: <span id="history-current-stock"></span></div>
                        <div class="text-muted small mt-1">
                            <i class="bi bi-info-circle me-1"></i>
                            Showing only your stock movement records
                        </div>
                    </div>
                </div>

                <!-- 筛选器 -->
                <div class="row g-3 mb-3">
                    <div class="col-md-4">
                        <label class="form-label">Movement Type</label>
                        <select class="form-select" id="history-movement-type">
                            <option value="">All Types</option>
                            <option value="stock_in">Stock In</option>
                            <option value="stock_out">Stock Out</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Start Date</label>
                        <input type="date" class="form-control" id="history-start-date">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">End Date</label>
                        <input type="date" class="form-control" id="history-end-date">
                    </div>
                </div>

                <!-- 历史记录表格 -->
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Quantity</th>
                                <th>Before</th>
                                <th>After</th>
                                <th>Reason</th>
                                <th>User</th>
                                <th>Reference</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody id="history-table-body">
                            <!-- 动态加载 -->
                        </tbody>
                    </table>
                </div>

                <!-- 分页 -->
                <nav aria-label="History pagination">
                    <ul class="pagination pagination-sm justify-content-center" id="history-pagination">
                        <!-- 动态生成 -->
                    </ul>
                </nav>
            </div>
        </div>
    </div>
</div>

@endsection

@section("scripts")
<script>
    // Set stock management related URLs
    window.stockManagementRoute = "{{ route('staff.stock_management') }}";
    window.stockInPageRoute = "{{ route('staff.stock_in_page') }}";
    window.stockOutPageRoute = "{{ route('staff.stock_out_page') }}";
    window.stockHistoryRoute = "{{ route('staff.staff.stock_history', ['id' => ':id']) }}";
</script>
<script src="{{ asset('assets/js/stock-management.js') }}"></script>
<script>
    let currentProductId = null;
    let currentProductStock = 0;

    // 打开库存入库模态框
    function openStockInModal(productId = null, productName = null, currentStock = null) {
        if (productId) {
            // 从表格按钮调用，预选产品
            currentProductId = productId;
            currentProductStock = currentStock;

            document.getElementById('stockin-product-select').value = productId;
            document.getElementById('stockin-product-name').textContent = productName;
            document.getElementById('stockin-current-stock').textContent = currentStock;
            document.getElementById('stockin-selected-product').style.display = 'block';
            document.getElementById('stockin-product-id').value = productId;
        } else {
            // 从顶部按钮调用，显示产品选择
            document.getElementById('stockin-selected-product').style.display = 'none';
            document.getElementById('stockin-product-select').value = '';
        }

        // 重置表单
        document.getElementById('stockInForm').reset();
        if (productId) {
            document.getElementById('stockin-product-select').value = productId;
            document.getElementById('stockin-product-id').value = productId;
        }
    }

    // 打开库存出库模态框
    function openStockOutModal(productId = null, productName = null, currentStock = null) {
        if (productId) {
            // 从表格按钮调用，预选产品
            currentProductId = productId;
            currentProductStock = currentStock;

            document.getElementById('stockout-product-select').value = productId;
            document.getElementById('stockout-product-name').textContent = productName;
            document.getElementById('stockout-current-stock').textContent = currentStock;
            document.getElementById('stockout-selected-product').style.display = 'block';
            document.getElementById('stockout-product-id').value = productId;
            document.getElementById('stockout-quantity').max = currentStock;
        } else {
            // 从顶部按钮调用，显示产品选择
            document.getElementById('stockout-selected-product').style.display = 'none';
            document.getElementById('stockout-product-select').value = '';
        }

        // 重置表单
        document.getElementById('stockOutForm').reset();
        if (productId) {
            document.getElementById('stockout-product-select').value = productId;
            document.getElementById('stockout-product-id').value = productId;
        }
    }

    // 查看库存历史
    function viewStockHistory(productId, productName) {
        currentProductId = productId;

        document.getElementById('history-product-name').textContent = productName;
        document.getElementById('history-current-stock').textContent = getCurrentStockForProduct(productId);

        loadStockHistory(productId);

        const modal = new bootstrap.Modal(document.getElementById('stockHistoryModal'));
        modal.show();
    }

    // 获取当前库存
    function getCurrentStockForProduct(productId) {
        const row = document.querySelector(`tr[data-product-id="${productId}"]`);
        if (row) {
            const stockCell = row.querySelector('td:nth-child(7) span');
            return stockCell ? stockCell.textContent : '0';
        }
        return '0';
    }

    // 加载库存历史
    function loadStockHistory(productId, page = 1) {
        const movementType = document.getElementById('history-movement-type').value;
        const startDate = document.getElementById('history-start-date').value;
        const endDate = document.getElementById('history-end-date').value;

        const params = new URLSearchParams({
            page: page,
            movement_type: movementType,
            start_date: startDate,
            end_date: endDate
        });

        fetch(`{{ route('staff.staff.stock_history', ':id') }}`.replace(':id', productId) + '?' + params, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderStockHistory(data.data);
                renderHistoryPagination(data.pagination);
            } else {
                showAlert(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error loading stock history:', error);
            showAlert('Failed to load stock history', 'error');
        });
    }

    // 渲染库存历史
    function renderStockHistory(movements) {
        const tbody = document.getElementById('history-table-body');
        tbody.innerHTML = movements.map(movement => `
            <tr>
                <td>${new Date(movement.movement_date).toLocaleString()}</td>
                <td>
                    <span class="badge ${movement.movement_type === 'stock_in' ? 'bg-success' : 'bg-danger'}">
                        ${movement.movement_type === 'stock_in' ? 'In' : 'Out'}
                    </span>
                </td>
                <td class="${movement.quantity > 0 ? 'text-success' : 'text-danger'}">
                    ${movement.quantity > 0 ? '+' : ''}${movement.quantity}
                </td>
                <td>${movement.previous_stock}</td>
                <td>${movement.current_stock}</td>
                <td><span class="badge bg-secondary">${movement.movement_reason}</span></td>
                <td><span class="badge bg-primary">${movement.user_name}</span></td>
                <td>${movement.reference_number || '-'}</td>
                <td>${movement.notes || '-'}</td>
            </tr>
        `).join('');
    }

    // 渲染历史分页
    function renderHistoryPagination(pagination) {
        const paginationEl = document.getElementById('history-pagination');
        let html = '';

        for (let i = 1; i <= pagination.last_page; i++) {
            html += `
                <li class="page-item ${i === pagination.current_page ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="loadStockHistory(${currentProductId}, ${i})">${i}</a>
                </li>
            `;
        }

        paginationEl.innerHTML = html;
    }

    // 表单提交处理
    document.addEventListener('DOMContentLoaded', function() {
        // Stock In 产品选择事件
        document.getElementById('stockin-product-select').addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            if (selectedOption.value) {
                const productId = selectedOption.value;
                const productName = selectedOption.dataset.name;
                const stock = selectedOption.dataset.stock;

                currentProductId = productId;
                currentProductStock = parseInt(stock);

                document.getElementById('stockin-product-name').textContent = productName;
                document.getElementById('stockin-current-stock').textContent = stock;
                document.getElementById('stockin-selected-product').style.display = 'block';
                document.getElementById('stockin-product-id').value = productId;
            } else {
                document.getElementById('stockin-selected-product').style.display = 'none';
                currentProductId = null;
                currentProductStock = 0;
            }
        });

        // Stock Out 产品选择事件
        document.getElementById('stockout-product-select').addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            if (selectedOption.value) {
                const productId = selectedOption.value;
                const productName = selectedOption.dataset.name;
                const stock = selectedOption.dataset.stock;

                currentProductId = productId;
                currentProductStock = parseInt(stock);

                document.getElementById('stockout-product-name').textContent = productName;
                document.getElementById('stockout-current-stock').textContent = stock;
                document.getElementById('stockout-selected-product').style.display = 'block';
                document.getElementById('stockout-product-id').value = productId;
                document.getElementById('stockout-quantity').max = stock;
            } else {
                document.getElementById('stockout-selected-product').style.display = 'none';
                currentProductId = null;
                currentProductStock = 0;
            }
        });
        // Stock In 表单提交
        document.getElementById('stockInForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);

            fetch('{{ route("staff.stock_in") }}', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert(data.message, 'success');
                    updateProductStock(currentProductId, data.new_stock);
                    bootstrap.Modal.getInstance(document.getElementById('stockInModal')).hide();
                } else {
                    showAlert(data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('Failed to record stock in', 'error');
            });
        });

        // Stock Out 表单提交
        document.getElementById('stockOutForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);

            fetch('{{ route("staff.stock_out") }}', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert(data.message, 'success');
                    updateProductStock(currentProductId, data.new_stock);
                    bootstrap.Modal.getInstance(document.getElementById('stockOutModal')).hide();
                } else {
                    showAlert(data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('Failed to record stock out', 'error');
            });
        });

        // 库存出库数量验证
        document.getElementById('stockout-quantity').addEventListener('input', function() {
            const quantity = parseInt(this.value);
            const warning = document.getElementById('stockout-quantity-warning');

            if (quantity > currentProductStock) {
                warning.style.display = 'block';
                this.classList.add('is-invalid');
            } else {
                warning.style.display = 'none';
                this.classList.remove('is-invalid');
            }
        });

        // 搜索功能
        document.getElementById('search-input').addEventListener('keyup', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('.product-row');

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });

            // 更新结果计数
            const visibleRows = document.querySelectorAll('.product-row[style=""]').length;
            document.getElementById('results-count').textContent = `${visibleRows} products`;
        });

        // 清除搜索
        document.getElementById('clear-search').addEventListener('click', function() {
            document.getElementById('search-input').value = '';
            document.querySelectorAll('.product-row').forEach(row => {
                row.style.display = '';
            });
            document.getElementById('results-count').textContent = `{{ count($products) }} products`;
        });

        // 历史筛选器变化时重新加载
        ['history-movement-type', 'history-start-date', 'history-end-date'].forEach(id => {
            document.getElementById(id).addEventListener('change', function() {
                if (currentProductId) {
                    loadStockHistory(currentProductId);
                }
            });
        });
    });

    // 更新产品库存显示
    function updateProductStock(productId, newStock) {
        const row = document.querySelector(`tr[data-product-id="${productId}"]`);
        if (row) {
            const stockCell = row.querySelector('td:nth-child(7) span');
            if (stockCell) {
                stockCell.textContent = newStock;
                // 更新颜色
                stockCell.className = `fw-bold ${newStock > 10 ? 'text-success' : (newStock > 0 ? 'text-warning' : 'text-danger')}`;
            }
        }
    }

    // 显示提示信息
    function showAlert(message, type = 'success') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            <i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}-fill me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        const container = document.querySelector('.container-fluid');
        container.insertBefore(alertDiv, container.firstChild);

        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
</script>
@endsection
