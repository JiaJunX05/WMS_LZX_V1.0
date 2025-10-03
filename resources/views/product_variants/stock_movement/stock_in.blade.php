@extends("layouts.app")

@section("title", "Stock In")
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

    <!-- 页面标题 -->
    <div class="dashboard-header mb-4">
        <div class="card shadow-sm border-0">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-lg-8">
                        <div class="d-flex align-items-center">
                            <div class="header-icon-wrapper me-4">
                                <i class="bi bi-box-arrow-in-down-fill text-success"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">Stock In</h2>
                                <p class="dashboard-subtitle mb-0">Add inventory to products</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('staff.stock_management') }}" class="btn btn-primary">
                            <i class="bi bi-arrow-left me-2"></i>
                            Back to List
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 产品搜索区域 -->
    <div class="search-filter-section mb-4">
        <div class="card shadow-sm border-0">
            <div class="card-body">
                <div class="row g-3 align-items-end">
                    <div class="col-lg-8">
                        <label class="form-label fw-medium">Search Products for Stock In</label>
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

    <!-- 产品选择表格 -->
    <div class="card shadow-sm border-0" id="product-selection-card">
        <div class="card-header bg-transparent border-0 pb-3 mb-3">
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-3">
                    <h5 class="mb-0 fw-semibold">Select Product for Stock In</h5>
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
                            <th style="width: 25%"><div class="table-header">PRODUCT NAME</div></th>
                            <th style="width: 15%"><div class="table-header">SKU CODE</div></th>
                            <th style="width: 12%"><div class="table-header">BRAND</div></th>
                            <th style="width: 8%"><div class="table-header">CURRENT STOCK</div></th>
                            <th style="width: 10%"><div class="table-header">STATUS</div></th>
                            <th class="text-end pe-4" style="width: 10%"><div class="table-header">ACTION</div></th>
                        </tr>
                    </thead>
                    <tbody id="products-table-body">
                        @foreach($products as $product)
                            @php
                                $variant = $product->variants->first();
                                $attributeVariant = $variant ? $variant->attributeVariant : null;
                                $brand = $attributeVariant && $attributeVariant->brand ? $attributeVariant->brand : null;
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
                                    <button class="btn btn-success btn-sm" onclick="selectProductForStockIn({{ $product->id }})" title="Select for Stock In">
                                        <i class="bi bi-plus-circle me-1"></i>
                                        Select
                                    </button>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Pagination and Results Statistics -->
    <div class="d-flex justify-content-between align-items-center mt-4" id="pagination-section">
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

    <!-- Stock In Form Card (Hidden initially) -->
    <div class="card shadow-sm border-0 mt-4" id="stock-in-form-card" style="display: none;">
        <div class="card-header bg-success text-white">
            <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                    <i class="bi bi-plus-circle me-2"></i>
                    Stock In Form
                </h5>
                <button type="button" class="btn btn-outline-light btn-sm" onclick="cancelStockIn()">
                    <i class="bi bi-x-circle me-1"></i>
                    Cancel
                </button>
            </div>
        </div>
        <div class="card-body">
            <form id="stockInForm">
                @csrf
                <input type="hidden" id="selected-product-id" name="product_id">

                <!-- Selected Product Info -->
                <div class="row mb-4">
                    <div class="col-md-12">
                        <div class="alert alert-success">
                            <div class="row align-items-center">
                                <div class="col-auto">
                                    <img id="selected-product-image" src="" alt="Product"
                                         style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                                </div>
                                <div class="col">
                                    <h6 class="mb-1 fw-bold" id="selected-product-name"></h6>
                                    <div class="row text-muted small">
                                        <div class="col-md-4">
                                            <strong>SKU:</strong> <span id="selected-product-sku"></span>
                                        </div>
                                        <div class="col-md-4">
                                            <strong>Brand:</strong> <span id="selected-product-brand"></span>
                                        </div>
                                        <div class="col-md-4">
                                            <strong>Current Stock:</strong> <span id="selected-current-stock" class="fw-bold"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Stock In Form Fields -->
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="stockin-quantity" class="form-label fw-medium">
                            Quantity to Add <span class="text-danger">*</span>
                        </label>
                        <input type="number" class="form-control form-control-lg" id="stockin-quantity"
                               name="quantity" min="1" required>
                        <div class="form-text">Enter the number of units to add to inventory</div>
                    </div>

                    <div class="col-md-6 mb-3">
                        <label for="stockin-reason" class="form-label fw-medium">
                            Reason <span class="text-danger">*</span>
                        </label>
                        <select class="form-select form-select-lg" id="stockin-reason" name="movement_reason" required>
                            <option value="">Select Reason</option>
                            <option value="initial_stock">Initial Stock</option>
                            <option value="purchase">Purchase Order</option>
                            <option value="adjustment">Stock Adjustment</option>
                            <option value="transfer">Transfer In</option>
                            <option value="return">Customer Return</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="stockin-reference" class="form-label fw-medium">Reference Number</label>
                        <input type="text" class="form-control" id="stockin-reference" name="reference_number"
                               placeholder="e.g., PO-2024-001, INV-001">
                        <div class="form-text">Optional reference number for tracking</div>
                    </div>

                    <div class="col-md-6 mb-3">
                        <label for="stockin-notes" class="form-label fw-medium">Notes</label>
                        <textarea class="form-control" id="stockin-notes" name="notes" rows="3"
                                  placeholder="Optional notes about this stock movement"></textarea>
                    </div>
                </div>

                <!-- Submit Buttons -->
                <div class="row">
                    <div class="col-12">
                        <div class="d-flex justify-content-end gap-2">
                            <button type="button" class="btn btn-secondary" onclick="cancelStockIn()">
                                <i class="bi bi-x-circle me-2"></i>
                                Cancel
                            </button>
                            <button type="submit" class="btn btn-success btn-lg">
                                <i class="bi bi-plus-circle me-2"></i>
                                Record Stock In
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>


@endsection

@section("scripts")
<script>
    // Set stock in related URLs
    window.stockInPageRoute = "{{ route('staff.stock_in_page') }}";
    window.stockInRoute = "{{ route('staff.stock_in') }}";
</script>
<script src="{{ asset('assets/js/stock-in.js') }}"></script>
<script>
    let selectedProduct = null;

    // 选择产品进行库存入库
    function selectProductForStockIn(productId) {
        // 获取产品行数据
        const row = document.querySelector(`tr[data-product-id="${productId}"]`);
        if (!row) return;

        // 提取产品信息
        const productName = row.querySelector('td:nth-child(3) .fw-medium').textContent;
        const currentStock = parseInt(row.querySelector('td:nth-child(6) span').textContent);
        const sku = row.querySelector('code').textContent;
        const brand = row.querySelector('td:nth-child(5) .badge').textContent;
        const img = row.querySelector('img');

        selectedProduct = {
            id: productId,
            name: productName,
            stock: currentStock
        };

        // 填充表单信息
        document.getElementById('selected-product-id').value = productId;
        document.getElementById('selected-product-name').textContent = productName;
        document.getElementById('selected-current-stock').textContent = currentStock;
        document.getElementById('selected-product-sku').textContent = sku;
        document.getElementById('selected-product-brand').textContent = brand;

        if (img) {
            document.getElementById('selected-product-image').src = img.src;
        } else {
            document.getElementById('selected-product-image').src = '';
        }

        // 重置表单
        document.getElementById('stockInForm').reset();
        document.getElementById('selected-product-id').value = productId;

        // 显示表单卡片，隐藏产品选择表格和分页
        document.getElementById('product-selection-card').style.display = 'none';
        document.getElementById('pagination-section').style.display = 'none';
        document.getElementById('stock-in-form-card').style.display = 'block';

        // 滚动到表单
        document.getElementById('stock-in-form-card').scrollIntoView({ behavior: 'smooth' });
    }

    // 取消库存入库
    function cancelStockIn() {
        // 隐藏表单卡片，显示产品选择表格和分页
        document.getElementById('stock-in-form-card').style.display = 'none';
        document.getElementById('product-selection-card').style.display = 'block';
        document.getElementById('pagination-section').style.display = 'flex';

        // 重置表单
        document.getElementById('stockInForm').reset();
        selectedProduct = null;

        // 滚动到产品表格
        document.getElementById('product-selection-card').scrollIntoView({ behavior: 'smooth' });
    }

    document.addEventListener('DOMContentLoaded', function() {
        // 调试：检查是否有选中的产品ID
        console.log('Stock In Page loaded');
        @if(isset($selectedProductId) && $selectedProductId)
            console.log('Selected Product ID from URL:', {{ $selectedProductId }});
            const selectedProductId = {{ $selectedProductId }};
            const productExists = document.querySelector(`tr[data-product-id="${selectedProductId}"]`);
            console.log('Product exists in table:', !!productExists);
            if (productExists) {
                console.log('Auto-selecting product...');
                setTimeout(() => {
                    selectProductForStockIn(selectedProductId);
                }, 500);
            } else {
                console.log('Product not found in current page');
            }
        @else
            console.log('No selected product ID from URL');
        @endif
        // Stock In 表单提交
        document.getElementById('stockInForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            // 显示加载状态
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Processing...';

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
                    updateProductStock(selectedProduct.id, data.new_stock);

                    // 显示成功结果
                    showStockInResult(selectedProduct.name, formData.get('quantity'), selectedProduct.stock, data.new_stock);

                    // 返回到产品选择页面
                    setTimeout(() => {
                        cancelStockIn();
                    }, 2000);
                } else {
                    showAlert(data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('Failed to record stock in', 'error');
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            });
        });

        // 搜索功能
        document.getElementById('search-input').addEventListener('keyup', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('.product-row');
            let visibleCount = 0;

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    row.style.display = '';
                    visibleCount++;
                } else {
                    row.style.display = 'none';
                }
            });

            document.getElementById('results-count').textContent = `${visibleCount} products`;
        });

        // 清除搜索
        document.getElementById('clear-search').addEventListener('click', function() {
            document.getElementById('search-input').value = '';
            document.querySelectorAll('.product-row').forEach(row => {
                row.style.display = '';
            });
            document.getElementById('results-count').textContent = `{{ count($products) }} products`;
        });
    });

    // 更新产品库存显示
    function updateProductStock(productId, newStock) {
        const row = document.querySelector(`tr[data-product-id="${productId}"]`);
        if (row) {
            const stockCell = row.querySelector('td:nth-child(6) span');
            if (stockCell) {
                stockCell.textContent = newStock;
                stockCell.className = `fw-bold ${newStock > 10 ? 'text-success' : (newStock > 0 ? 'text-warning' : 'text-danger')}`;
            }
        }
    }

    // 显示库存入库结果
    function showStockInResult(productName, quantity, oldStock, newStock) {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'alert alert-success alert-dismissible fade show mt-3';
        resultDiv.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi bi-check-circle-fill me-3 fs-4"></i>
                <div>
                    <h6 class="mb-1">Stock In Successful!</h6>
                    <div><strong>${productName}</strong></div>
                    <div class="small text-muted">
                        Added <strong>+${quantity}</strong> units |
                        Stock: ${oldStock} → <strong>${newStock}</strong>
                    </div>
                </div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        const container = document.querySelector('.container-fluid');
        container.insertBefore(resultDiv, container.children[1]);

        setTimeout(() => {
            resultDiv.remove();
        }, 8000);
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
