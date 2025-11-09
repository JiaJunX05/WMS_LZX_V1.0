{{-- ==========================================
    更改用户角色 Modal
    功能：在 modal 中更改用户角色
    ========================================== --}}

<div class="modal fade" id="roleChangeModal" tabindex="-1" aria-labelledby="roleChangeModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="roleChangeModalLabel">
                    <i class="bi bi-arrow-repeat me-2"></i>Change User Role
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p class="text-muted mb-4">Please select a new user role:</p>
                <div class="row g-3">
                    <div class="col-lg-4 col-md-6 col-sm-12">
                        <div class="card h-100 border role-card" data-role="Staff">
                            <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                <input type="radio" name="new_role" value="Staff" class="form-check-input me-3">
                                <div>
                                    <h6 class="card-title mb-1">
                                        <i class="bi bi-person-badge me-2 text-success"></i>Staff
                                    </h6>
                                    <p class="card-text text-muted small mb-0">Basic user permissions</p>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div class="col-lg-4 col-md-6 col-sm-12">
                        <div class="card h-100 border role-card" data-role="Admin">
                            <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                <input type="radio" name="new_role" value="Admin" class="form-check-input me-3">
                                <div>
                                    <h6 class="card-title mb-1">
                                        <i class="bi bi-shield-check me-2 text-warning"></i>Admin
                                    </h6>
                                    <p class="card-text text-muted small mb-0">Full management permissions</p>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div class="col-lg-4 col-md-6 col-sm-12">
                        <div class="card h-100 border role-card" data-role="SuperAdmin">
                            <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                <input type="radio" name="new_role" value="SuperAdmin" class="form-check-input me-3">
                                <div>
                                    <h6 class="card-title mb-1">
                                        <i class="bi bi-person-fill-gear me-2 text-danger"></i>Super Admin
                                    </h6>
                                    <p class="card-text text-muted small mb-0">Highest system permissions</p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-warning" id="confirmRoleChange">
                    <i class="bi bi-check-circle me-2"></i>Confirm Change
                </button>
            </div>
        </div>
    </div>
</div>

