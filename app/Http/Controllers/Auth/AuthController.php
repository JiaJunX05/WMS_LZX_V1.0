<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use App\Models\Account;
use App\Exports\UserExport;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;

/**
 * 用户认证管理控制器
 * User Authentication Management Controller
 *
 * 功能模块：
 * - 用户列表展示：搜索、筛选、分页
 * - 用户操作：创建、编辑、删除、状态管理
 * - 角色管理：用户角色分配和更改
 * - 图片管理：用户头像上传、更新、删除
 * - 数据导出：Excel 导出功能
 *
 * @author WMS Team
 * @version 3.0.0
 */
class AuthController extends Controller
{
    // 常量定义
    private const ROLES = ['SuperAdmin', 'Admin', 'Staff'];
    private const STATUSES = ['Available', 'Unavailable'];
    private const DEFAULT_PER_PAGE = 10;
    private const MAX_PER_PAGE = 100;

    // =============================================================================
    // 私有辅助方法 (Private Helper Methods)
    // =============================================================================

    /**
     * 获取当前用户角色（带缓存）
     */
    private function getCurrentUserRole(): string
    {
        static $cachedRole = null;
        static $cachedUserId = null;

        $currentUserId = Auth::id();

        // 如果用户ID相同且已缓存，直接返回
        if ($cachedUserId === $currentUserId && $cachedRole !== null) {
            return $cachedRole;
        }

        $user = Auth::user();
        if (!$user) {
            return 'Guest';
        }

        $cachedRole = $user->getAccountRole();
        $cachedUserId = $currentUserId;

        return $cachedRole;
    }

    /**
     * 检查用户权限
     */
    private function checkUserPermission(string $action, $targetUser = null): bool
    {
        $currentRole = $this->getCurrentUserRole();

        switch ($action) {
            case 'create_staff':
                return in_array($currentRole, ['SuperAdmin', 'Admin']);
            case 'create_admin':
                return $currentRole === 'SuperAdmin';
            case 'edit_user':
                if ($currentRole === 'Admin' && $targetUser) {
                    return $targetUser->account->account_role === 'Staff';
                }
                return in_array($currentRole, ['SuperAdmin', 'Admin']);
            case 'delete_user':
                return $currentRole === 'SuperAdmin';
            case 'change_role':
                return $currentRole === 'SuperAdmin';
            default:
                return false;
        }
    }

    /**
     * 构建用户查询，根据角色限制（优化版）
     */
    private function buildUserQuery()
    {
        $query = User::query()->with(['account' => function ($query) {
            $query->select('id', 'user_id', 'username', 'account_role', 'account_status', 'user_image');
        }]);

        $currentRole = $this->getCurrentUserRole();

        if ($currentRole === 'Admin') {
            $query->whereHas('account', function ($accountQuery) {
                $accountQuery->where('account_role', 'Staff');
            });
        }

        return $query;
    }

    /**
     * 应用用户筛选条件（优化版）
     */
    private function applyUserFilters($query, Request $request)
    {
        // 搜索条件 - 使用索引优化
        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            if (strlen($search) >= 2) { // 最小搜索长度
                $query->where(function ($query) use ($search) {
                    $query->where('first_name', 'like', "%$search%")
                          ->orWhere('last_name', 'like', "%$search%")
                          ->orWhere('email', 'like', "%$search%");
                });
            }
        }

        // 根据 role 筛选 - 优化查询
        if ($request->filled('role')) {
            $role = $request->input('role');
            if (in_array($role, self::ROLES)) {
                $query->whereHas('account', function ($accountQuery) use ($role) {
                    $accountQuery->where('account_role', $role);
                });
            }
        }

        // 根据 status 筛选 - 优化查询
        if ($request->filled('status')) {
            $status = $request->input('status');
            if (in_array($status, self::STATUSES)) {
                $query->whereHas('account', function ($accountQuery) use ($status) {
                    $accountQuery->where('account_status', $status);
                });
            }
        }

        return $query;
    }


    /**
     * 创建用户记录
     */
    private function createUserRecord(array $userData): User
    {
        $user = User::create([
            'first_name' => $userData['first_name'],
            'last_name' => $userData['last_name'],
            'email' => $userData['email'],
            'password' => Hash::make($userData['password']),
        ]);

        Account::create([
            'user_id' => $user->id,
            'username' => $userData['username'],
            'account_role' => $userData['account_role'],
            'account_status' => $userData['account_status'] ?? 'Available',
            'user_image' => $userData['user_image'] ?? null,
        ]);

        return $user;
    }

    /**
     * 處理用戶圖片上傳
     */
    private function handleUserImageUpload($file): string
    {
        // 確保目錄存在
        $uploadPath = public_path('assets/images/auth');
        if (!file_exists($uploadPath)) {
            mkdir($uploadPath, 0755, true);
        }

        // 生成唯一文件名
        $filename = 'user_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

        // 移動文件到指定目錄
        $file->move($uploadPath, $filename);

        return $filename;
    }

    /**
     * 记录操作日志（优化版）
     */
    private function logOperation(string $operation, array $data = []): void
    {
        try {
            $logData = array_merge([
                'user_id' => Auth::id(),
                'user_role' => $this->getCurrentUserRole(),
                'timestamp' => now()->toISOString(),
                'ip' => request()->ip(),
            ], $data);

            // 限制日志数据大小，防止内存溢出
            $logData = array_slice($logData, 0, 20);

            Log::info("Auth operation: {$operation}", $logData);
        } catch (\Exception $e) {
            // 日志记录失败不应该影响主流程
            Log::error('Failed to log operation', ['operation' => $operation, 'error' => $e->getMessage()]);
        }
    }

    /**
     * 返回JSON响应
     */
    private function jsonResponse(bool $success, string $message, $data = null, int $status = 200)
    {
        $response = ['success' => $success, 'message' => $message];

        if ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $status);
    }

    /**
     * 处理权限错误
     */
    private function handlePermissionError(Request $request, string $message)
    {
        if ($request->ajax()) {
            return $this->jsonResponse(false, $message, null, 403);
        }

        return redirect()->back()->withErrors(['error' => $message])->withInput();
    }

    /**
     * 处理验证错误
     */
    private function handleValidationError(Request $request, ValidationException $e)
    {
        if ($request->ajax()) {
            return $this->jsonResponse(false, 'Validation failed', $e->errors(), 422);
        }

        return redirect()->back()->withErrors($e->errors())->withInput();
    }

    /**
     * 处理一般错误（优化版）
     */
    private function handleError(Request $request, string $message, \Exception $e = null)
    {
        if ($e) {
            // 限制错误日志大小，防止内存溢出
            $errorData = [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'user_id' => Auth::id(),
                'ip' => $request->ip(),
            ];

            // 只在开发环境记录完整堆栈跟踪
            if (config('app.debug')) {
                $errorData['trace'] = $e->getTraceAsString();
            }

            Log::error('Auth operation error', $errorData);
        }

        if ($request->ajax()) {
            return $this->jsonResponse(false, $message, null, 500);
        }

        return redirect()->back()->withErrors(['error' => $message])->withInput();
    }

    /**
     * 重定向到管理页面
     */
    private function redirectToManagement(string $role, string $message)
    {
        $route = $role === 'SuperAdmin' ? 'superadmin.users.management' : 'admin.users.management';
        return redirect()->route($route)->with('success', $message);
    }

    // =============================================================================
    // 公共方法 (Public Methods)
    // =============================================================================
    public function showLoginForm() {
        return view('auth.auth_login');
    }

    public function login(Request $request) {
        try {
            $credentials = $request->validate([
                'email' => 'required|email',
                'password' => 'required|min:6',
            ]);

            $remember = $request->boolean('remember');

            if (!Auth::attempt($credentials, $remember)) {
                Log::warning('Login failed', ['email' => $request->email]);
                return redirect()->back()
                                ->withErrors(['email' => 'The provided credentials do not match our records.'])
                                ->onlyInput('email');
            }

            $request->session()->regenerate();
            $user = $request->user()->load('account');

            if (!$user->hasAvailableAccount()) {
                Log::notice('Account unavailable', ['user_id' => $user->id]);
                Auth::logout();
                return redirect()->back()
                                ->withErrors(['email' => 'Account is missing or unavailable. Please contact the administrator.'])
                                ->onlyInput('email');
            }

            Log::info('Login success', ['user_id' => $user->id, 'role' => $user->getAccountRole()]);

            // 根据用户角色重定向到相应的页面
            return $user->dashboardRoute()
                ? redirect()->route($user->dashboardRoute())
                : redirect()->intended('/');
        } catch (\Throwable $e) {
            Log::error('Login error: '.$e->getMessage(), ['trace' => $e->getTraceAsString()]);

            if (Auth::check()) {
                Auth::logout();
            }

            return redirect()->back()
                            ->withErrors(['error' => 'An unexpected error occurred. Please try again.'])
                            ->onlyInput('email');
        }
    }


    /**
     * 存儲新用戶
     */
    public function register(Request $request) {
        try {
            $currentRole = $this->getCurrentUserRole();

            // 权限检查
            if (!$this->checkUserPermission('create_staff') ||
                ($currentRole === 'Admin' && $request->account_role !== 'Staff')) {
                return $this->handlePermissionError($request, 'You can only create Staff accounts.');
            }

            $rules = [
                'username' => 'required|string|max:255',
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:6|confirmed',
                'account_role' => 'required|string|in:' . implode(',', self::ROLES),
                'user_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
            ];

            $request->validate($rules);

            $userData = $request->only(['username', 'first_name', 'last_name', 'email', 'password', 'account_role']);
            $userData['account_status'] = 'Available';

            // 處理用戶圖片
            if ($request->hasFile('user_image')) {
                $userData['user_image'] = $this->handleUserImageUpload($request->file('user_image'));
            }

            $user = $this->createUserRecord($userData);

            $this->logOperation('user_created_single', [
                'user_id' => $user->id,
                'role' => $userData['account_role']
            ]);

            $message = 'User created successfully!';

            if ($request->ajax()) {
                return $this->jsonResponse(true, $message, $user);
            }

            return $this->redirectToManagement($currentRole, $message);

        } catch (ValidationException $e) {
            return $this->handleValidationError($request, $e);
        } catch (\Exception $e) {
            return $this->handleError($request, 'Failed to create user: ' . $e->getMessage(), $e);
        }
    }


    public function logout(Request $request) {
        try {
            $user = Auth::user();

            Log::info('User logout', ['user_id' => $user->id ?? 'unknown']);

            Auth::logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();
            $request->session()->flush();

            return redirect()->route('login')
                            ->with('success', 'You have been logged out successfully.');
        } catch (\Exception $e) {
            Log::error('Logout error', ['error' => $e->getMessage()]);

            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')
                            ->withErrors(['error' => 'An error occurred during logout. Please try again.']);
        }
    }

    // =============================================================================
    // 用户管理功能 (User Management Functions)
    // =============================================================================

    /**
     * 显示用户列表（优化版）
     */
    public function showUserList(Request $request) {
        if ($request->ajax()) {
            try {
                $query = $this->buildUserQuery();
                $query = $this->applyUserFilters($query, $request);

                $perPage = min($request->input('perPage', self::DEFAULT_PER_PAGE), self::MAX_PER_PAGE);
                $users = $query->paginate($perPage);

                // 优化数据转换，减少内存使用
                $userData = $users->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => trim($user->first_name . ' ' . $user->last_name),
                        'username' => $user->account->username ?? 'N/A',
                        'email' => $user->email,
                        'user_image' => $user->account->user_image ?? null,
                        'role' => $user->account->account_role ?? 'N/A',
                        'status' => $user->account->account_status ?? 'N/A',
                    ];
                });

                return response()->json([
                    'success' => true,
                    'message' => 'Users fetched successfully',
                    'data' => $userData,
                    'pagination' => [
                        'current_page' => $users->currentPage(),
                        'last_page' => $users->lastPage(),
                        'total' => $users->total(),
                        'per_page' => $users->perPage(),
                        'from' => $users->firstItem(),
                        'to' => $users->lastItem(),
                    ],
                ]);
            } catch (\Exception $e) {
                return $this->handleError($request, 'Failed to fetch users', $e);
            }
        }

        $globalUserRole = $this->getCurrentUserRole();
        return view('auth.auth_dashboard', compact('globalUserRole'));
    }

    /**
     * 显示用户更新表单（用于 Modal）
     */
    public function showUpdateForm(Request $request, $id) {
        $user = User::with('account')->findOrFail($id);
        $userRole = $this->getCurrentUserRole();
        $isUpdatingSelf = Auth::id() == $id;

        // 权限检查
        if (!$this->checkUserPermission('edit_user', $user)) {
            if ($request->expectsJson() || $request->ajax()) {
                return $this->jsonResponse(false, 'You do not have permission to edit this user', null, 403);
            }
            abort(403, 'You do not have permission to edit this user');
        }

        // 如果是 AJAX 请求，返回 JSON 数据（用于 Modal）
        if ($request->expectsJson() || $request->ajax()) {
            return $this->jsonResponse(true, 'User data fetched successfully', [
                'user' => [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                    'account' => [
                        'username' => $user->account->username ?? null,
                        'account_role' => $user->account->account_role ?? 'Staff',
                        'account_status' => $user->account->account_status ?? 'Available',
                        'user_image' => $user->account->user_image ?? null,
                    ]
                ],
                'isUpdatingSelf' => $isUpdatingSelf
            ]);
        }

        // 非 AJAX 请求重定向到管理页面
        $route = $userRole === 'SuperAdmin' ? 'superadmin.users.management' : 'admin.users.management';
        return redirect()->route($route);
    }

    /**
     * 更新用户信息（优化版）
     */
    public function updateUser(Request $request, $id) {
        try {
            $user = User::with('account')->findOrFail($id);
            $currentRole = $this->getCurrentUserRole();
            $isUpdatingSelf = Auth::id() == $id;

            // 权限检查
            if (!$this->checkUserPermission('edit_user', $user)) {
                return $this->handlePermissionError($request, 'You do not have permission to edit this user');
            }

            // 构建验证规则
            $rules = $this->buildUpdateValidationRules($user, $currentRole, $isUpdatingSelf);
            $request->validate($rules);

            // 更新用户信息
            $this->updateUserRecord($user, $request, $currentRole, $isUpdatingSelf);

            $this->logOperation('user_updated', [
                'user_id' => $user->id,
                'updated_data' => $request->except('password', 'password_confirmation')
            ]);

            return $this->jsonResponse(true, 'User updated successfully', [
                'id' => $user->id,
                'name' => trim($user->first_name . ' ' . $user->last_name),
                'username' => $user->account->username ?? 'N/A',
                'email' => $user->email,
                'user_image' => $user->account->user_image ?? null,
                'role' => $user->account->account_role ?? 'N/A',
                'status' => $user->account->account_status ?? 'N/A',
            ]);

        } catch (ValidationException $e) {
            return $this->handleValidationError($request, $e);
        } catch (\Exception $e) {
            return $this->handleError($request, 'An error occurred while updating the user. Please try again.', $e);
        }
    }

    /**
     * 构建更新验证规则
     */
    private function buildUpdateValidationRules(User $user, string $currentRole, bool $isUpdatingSelf): array
    {
        $rules = [
            'username' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6|confirmed',
            'user_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
        ];

        if (!$isUpdatingSelf) {
            $rules['account_status'] = 'required|string|in:' . implode(',', self::STATUSES);

            if ($currentRole === 'SuperAdmin') {
                $rules['account_role'] = 'required|string|in:' . implode(',', self::ROLES);
            }
        }

        return $rules;
    }

    /**
     * 更新用户记录
     */
    private function updateUserRecord(User $user, Request $request, string $currentRole, bool $isUpdatingSelf): void
    {
        // 更新用户基本信息
        $user->first_name = $request->first_name;
        $user->last_name = $request->last_name;
        $user->email = $request->email;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        // 更新账户信息
        if ($user->account) {
            // 更新username
            $user->account->username = $request->username;

            // 處理圖片上傳和移除
            if ($request->hasFile('user_image')) {
                // 刪除舊圖片
                if ($user->account->user_image) {
                    $oldImagePath = public_path('assets/images/auth/' . $user->account->user_image);
                    if (file_exists($oldImagePath)) {
                        unlink($oldImagePath);
                    }
                }

                // 上傳新圖片
                $user->account->user_image = $this->handleUserImageUpload($request->file('user_image'));
            } elseif ($request->has('remove_image') && $request->remove_image === '1') {
                // 處理圖片移除
                if ($user->account->user_image) {
                    $oldImagePath = public_path('assets/images/auth/' . $user->account->user_image);
                    if (file_exists($oldImagePath)) {
                        unlink($oldImagePath);
                    }
                    $user->account->user_image = null;
                }
            }

            // 如果不是更新自己，可以更新角色和狀態
            if (!$isUpdatingSelf) {
                $user->account->account_status = $request->account_status;

                if ($currentRole === 'SuperAdmin' && $request->filled('account_role')) {
                    $user->account->account_role = $request->account_role;
                }
            }

            $user->account->save();
        } else {
            // 創建新的account記錄
            $accountData = [
                'user_id' => $user->id,
                'username' => $request->username,
                'account_role' => ($currentRole === 'Admin') ? 'Staff' : $request->account_role,
                'account_status' => $request->account_status,
            ];

            // 處理圖片上傳
            if ($request->hasFile('user_image')) {
                $accountData['user_image'] = $this->handleUserImageUpload($request->file('user_image'));
            }

            Account::create($accountData);
        }
    }

    /**
     * 设置账户为不可用（优化版）
     */
    public function setUnavailable($id) {
        try {
            // 检查是否尝试将自己设置为不可用
            if (Auth::id() == $id) {
                return $this->jsonResponse(false, 'You cannot set yourself to unavailable status', null, 403);
            }

            $user = User::with('account')->findOrFail($id);

            // 权限检查
            if (!$this->checkUserPermission('edit_user', $user)) {
                return $this->jsonResponse(false, 'You do not have permission to manage this user', null, 403);
            }

            if (!$user->account) {
                return $this->jsonResponse(false, 'Account not found', null, 404);
            }

            $user->account->account_status = 'Unavailable';
            $user->account->save();

            $this->logOperation('account_set_unavailable', ['user_id' => $user->id]);

            return $this->jsonResponse(true, 'Account has been set to unavailable status', [
                'id' => $user->id,
                'name' => trim($user->first_name . ' ' . $user->last_name),
                'username' => $user->account->username ?? 'N/A',
                'email' => $user->email,
                'user_image' => $user->account->user_image ?? null,
                'role' => $user->account->account_role ?? 'N/A',
                'status' => $user->account->account_status ?? 'N/A',
            ]);

        } catch (\Exception $e) {
            return $this->handleError(request(), 'An error occurred while setting account status. Please try again.', $e);
        }
    }

    /**
     * 设置账户为可用（优化版）
     */
    public function setAvailable($id) {
        try {
            $user = User::with('account')->findOrFail($id);

            // 权限检查
            if (!$this->checkUserPermission('edit_user', $user)) {
                return $this->jsonResponse(false, 'You do not have permission to manage this user', null, 403);
            }

            if (!$user->account) {
                return $this->jsonResponse(false, 'Account not found', null, 404);
            }

            $user->account->account_status = 'Available';
            $user->account->save();

            $this->logOperation('account_set_available', ['user_id' => $user->id]);

            return $this->jsonResponse(true, 'Account has been set to available status', [
                'id' => $user->id,
                'name' => trim($user->first_name . ' ' . $user->last_name),
                'username' => $user->account->username ?? 'N/A',
                'email' => $user->email,
                'user_image' => $user->account->user_image ?? null,
                'role' => $user->account->account_role ?? 'N/A',
                'status' => $user->account->account_status ?? 'N/A',
            ]);

        } catch (\Exception $e) {
            return $this->handleError(request(), 'An error occurred while setting account status. Please try again.', $e);
        }
    }

    /**
     * 修改用户角色 (仅 SuperAdmin) - 优化版
     */
    public function changeAccountRole(Request $request, $id) {
        try {
            $currentRole = $this->getCurrentUserRole();

            // 权限检查
            if (!$this->checkUserPermission('change_role')) {
                return $this->jsonResponse(false, 'You do not have permission to change roles', null, 403);
            }

            // 检查是否是修改自己
            if (Auth::id() == $id) {
                return $this->jsonResponse(false, 'You cannot change your own role', null, 403);
            }

            $user = User::with('account')->findOrFail($id);

            $request->validate([
                'account_role' => 'required|string|in:' . implode(',', self::ROLES),
            ]);

            if (!$user->account) {
                return $this->jsonResponse(false, 'Account not found', null, 404);
            }

            $user->account->account_role = $request->account_role;
            $user->account->save();

            $this->logOperation('account_role_changed', [
                'user_id' => $user->id,
                'new_role' => $request->account_role
            ]);

            return $this->jsonResponse(true, 'Account role changed successfully', [
                'id' => $user->id,
                'name' => trim($user->first_name . ' ' . $user->last_name),
                'username' => $user->account->username ?? 'N/A',
                'email' => $user->email,
                'user_image' => $user->account->user_image ?? null,
                'role' => $user->account->account_role ?? 'N/A',
                'status' => $user->account->account_status ?? 'N/A',
            ]);

        } catch (ValidationException $e) {
            return $this->handleValidationError($request, $e);
        } catch (\Exception $e) {
            return $this->handleError($request, 'An error occurred. Please try again.', $e);
        }
    }

    /**
     * 删除用户账户 (仅 SuperAdmin) - 优化版
     */
    public function deleteAccount(Request $request, $id) {
        try {
            $currentRole = $this->getCurrentUserRole();

            // 权限检查
            if (!$this->checkUserPermission('delete_user')) {
                return $this->jsonResponse(false, 'You do not have permission to delete accounts', null, 403);
            }

            // 检查是否尝试删除自己
            if (Auth::id() == $id) {
                return $this->jsonResponse(false, 'You cannot delete your own account', null, 403);
            }

            $user = User::findOrFail($id);
            $userData = [
                'id' => $user->id,
                'name' => trim($user->first_name . ' ' . $user->last_name),
                'email' => $user->email,
            ];

            $user->delete();

            $this->logOperation('user_deleted', $userData);

            return $this->jsonResponse(true, 'User deleted successfully', $userData);

        } catch (\Exception $e) {
            return $this->handleError($request, 'An error occurred while deleting the user. Please try again.', $e);
        }
    }

    /**
     * 導出用戶數據到Excel
     */
    public function exportUsers(Request $request)
    {
        try {
            // 獲取篩選條件
            $filters = [
                'search' => $request->get('search'),
                'role' => $request->get('role'),
                'status' => $request->get('status'),
                'ids' => $request->get('ids') ? explode(',', $request->get('ids')) : null,
            ];

            // 生成文件名
            $timestamp = Carbon::now()->format('Y-m-d_H-i-s');
            $filename = "users_export_{$timestamp}.xlsx";

            // 使用Laravel Excel導出
            return Excel::download(new UserExport($filters), $filename);

        } catch (\Exception $e) {
            Log::error('User export failed: ' . $e->getMessage());

            if ($request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Export failed: ' . $e->getMessage()
                ], 500);
            }

            return redirect()->back()
                ->with('error', 'Export failed. Please try again.');
        }
    }
}
