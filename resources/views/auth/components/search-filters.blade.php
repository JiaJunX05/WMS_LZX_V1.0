{{-- ==========================================
    用户管理搜索筛选组件
    功能：显示用户搜索和筛选功能
    ========================================== --}}

{{-- 搜索筛选区域 --}}
<div class="mb-4">
    <div class="card shadow-sm border-0">
        <div class="card-body">
            <div class="row g-3 align-items-end">
                <div class="col-lg-5">
                    <label class="form-label fw-medium">Search Users</label>
                    <div class="input-group">
                        <span class="input-group-text">
                            <i class="bi bi-search"></i>
                        </span>
                        <input type="text" class="form-control" id="search-input" placeholder="Search by name, email...">
                    </div>
                </div>
                <div class="col-lg-2">
                    <label class="form-label fw-medium">Filter by Role</label>
                    <select class="form-select" id="role-filter">
                        <option value="">All Roles</option>
                        <option value="SuperAdmin">Super Admin</option>
                        <option value="Admin">Admin</option>
                        <option value="Staff">Staff</option>
                    </select>
                </div>
                <div class="col-lg-2">
                    <label class="form-label fw-medium">Filter by Status</label>
                    <select class="form-select" id="status-filter">
                        <option value="">All Status</option>
                        <option value="Available">Available</option>
                        <option value="Unavailable">Unavailable</option>
                    </select>
                </div>
                <div class="col-lg-3">
                    <button class="btn btn-outline-secondary w-100" id="clear-filters">
                        <i class="bi bi-x-circle me-2"></i>Clear Filters
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

