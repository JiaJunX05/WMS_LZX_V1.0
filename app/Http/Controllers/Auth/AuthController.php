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

class AuthController extends Controller
{
    // 常量定义
    private const ROLES = ['SuperAdmin', 'Admin', 'Staff'];
    private const STATUSES = ['Available', 'Unavailable'];
    private const MAX_BULK_USERS = 10;
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
            $query->select('id', 'user_id', 'account_role', 'account_status');
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
                    $query->where('name', 'like', "%$search%")
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
     * 标准化用户数据（前端字段兼容）
     */
    private function normalizeUserData(array $userData): array
    {
        // 兼容前端字段命名（camelCase -> snake_case）
        $fieldMapping = [
            'userName' => 'name',
            'userEmail' => 'email',
            'userPassword' => 'password',
            'accountRole' => 'account_role',
            'accountStatus' => 'account_status',
        ];

        foreach ($fieldMapping as $frontendField => $backendField) {
            if (isset($userData[$frontendField]) && !isset($userData[$backendField])) {
                $userData[$backendField] = $userData[$frontendField];
            }
        }

        return $userData;
    }

    /**
     * 创建用户记录
     */
    private function createUserRecord(array $userData): User
    {
        $user = User::create([
            'name' => $userData['name'],
            'email' => $userData['email'],
            'password' => Hash::make($userData['password']),
        ]);

        Account::create([
            'user_id' => $user->id,
            'account_role' => $userData['account_role'],
            'account_status' => $userData['account_status'] ?? 'Available',
        ]);

        return $user;
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

    public function showRegisterForm() {
        $userRole = $this->getCurrentUserRole();
        return view('auth.auth_register', compact('userRole'));
    }

    /**
     * 存儲新用戶
     */
    public function register(Request $request) {
        // 與 GenderController 的實現保持一致：有數組走批量，否則走單個
        if ($request->has('users') && is_array($request->input('users'))) {
            return $this->storeMultipleUsers($request);
        }

        return $this->storeSingleUser($request);
    }

    /**
     * 單個存儲用戶（优化版）
     */
    private function storeSingleUser(Request $request) {
        try {
            $currentRole = $this->getCurrentUserRole();

            // 权限检查
            if (!$this->checkUserPermission('create_staff') ||
                ($currentRole === 'Admin' && $request->account_role !== 'Staff')) {
                return $this->handlePermissionError($request, 'You can only create Staff accounts.');
            }

            $rules = [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:6|confirmed',
                'account_role' => 'required|string|in:' . implode(',', self::ROLES),
            ];

            $request->validate($rules);

            $userData = $request->only(['name', 'email', 'password', 'account_role']);
            $userData['account_status'] = 'Available';

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

    /**
     * 批量存儲用戶（統一入口）- 优化版
     */
    private function storeMultipleUsers(Request $request) {
        try {
            $currentUserRole = $this->getCurrentUserRole();
            $users = $request->input('users', []);

            // 限制批量创建数量，防止内存溢出
            if (count($users) > self::MAX_BULK_USERS) {
                return $this->handleError($request, 'Cannot create more than ' . self::MAX_BULK_USERS . ' users at once');
            }

            $createdUsers = [];
            $errors = [];
            $emailsToCheck = [];

            // 预处理：收集所有邮箱用于批量检查
            foreach ($users as $index => $userData) {
                $userData = $this->normalizeUserData($userData);
                if (isset($userData['email'])) {
                    $emailsToCheck[] = $userData['email'];
                }
            }

            // 批量检查邮箱是否存在
            $existingEmails = User::whereIn('email', $emailsToCheck)->pluck('email')->toArray();

            foreach ($users as $index => $userData) {
                $userData = $this->normalizeUserData($userData);

                // 验证数据
                $validator = \Validator::make($userData, [
                    'name' => 'required|string|max:255',
                    'email' => 'required|string|email|max:255',
                    'password' => 'required|string|min:6',
                    'account_role' => 'required|string|in:' . implode(',', self::ROLES),
                ]);

                if ($validator->fails()) {
                    $errors[] = "User " . ($index + 1) . ": " . implode(', ', $validator->errors()->all());
                    continue;
                }

                // 权限检查
                if ($currentUserRole === 'Admin' && $userData['account_role'] !== 'Staff') {
                    $errors[] = "User " . ($index + 1) . ": You can only create Staff accounts";
                    continue;
                }

                // 检查邮箱是否已存在
                if (in_array($userData['email'], $existingEmails)) {
                    $errors[] = "User " . ($index + 1) . ": Email '{$userData['email']}' already exists";
                    continue;
                }

                try {
                    $user = $this->createUserRecord($userData);
                    $createdUsers[] = $user;
                } catch (\Exception $e) {
                    $errors[] = "User " . ($index + 1) . ": " . $e->getMessage();
                }
            }

            if ($request->ajax()) {
                if (count($errors) > 0) {
                    return $this->jsonResponse(false, 'Some users failed to create', [
                        'errors' => $errors,
                        'created_count' => count($createdUsers)
                    ], 422);
                } else {
                    return $this->jsonResponse(true, count($createdUsers) . ' users created successfully', $createdUsers);
                }
            }

            if (count($errors) > 0) {
                return redirect()->back()
                                ->withErrors(['error' => implode('; ', $errors)])
                                ->withInput();
            }

            $this->logOperation('users_created_bulk', [
                'created_count' => count($createdUsers),
                'created_by_role' => $currentUserRole
            ]);

            return $this->redirectToManagement($currentUserRole, count($createdUsers) . ' users created successfully');

        } catch (\Exception $e) {
            return $this->handleError($request, 'An error occurred during bulk user creation. Please try again.', $e);
        }
    }

    /**
     * 显示批量创建用户表单
     */
    public function showBulkCreateForm() {
        $globalUserRole = Auth::user()->getAccountRole();
        return view('auth.bulk-create', compact('globalUserRole'));
    }

    /**
     * 批量创建用户
     */
    public function bulkCreateUsers(Request $request) {
        try {
            $currentUserRole = Auth::user()->getAccountRole();
            $requestedRole = $request->default_role ?? 'Staff';

            // Permission check
            if ($currentUserRole === 'Admin' && $requestedRole !== 'Staff') {
                return redirect()->back()
                                ->withErrors(['error' => 'You can only create Staff accounts.'])
                                ->withInput();
            }

            if ($currentUserRole === 'Staff') {
                return redirect()->back()
                                ->withErrors(['error' => 'You do not have permission to create accounts.'])
                                ->withInput();
            }

            $userCount = (int) $request->user_count;
            if ($userCount < 1 || $userCount > 10) {
                return redirect()->back()
                                ->withErrors(['error' => 'You can only create 1-10 users at once.'])
                                ->withInput();
            }

            $request->validate([
                'default_role' => ['required', 'string', 'in:SuperAdmin,Admin,Staff'],
                'default_status' => ['required', 'string', 'in:Available,Unavailable'],
                'default_password' => ['required', 'string', 'min:6'],
            ]);

            $createdUsers = [];
            $errors = [];

            for ($i = 1; $i <= $userCount; $i++) {
                try {
                    $name = $request->input("user_{$i}_name");
                    $email = $request->input("user_{$i}_email");

                    if (empty($name) || empty($email)) {
                        $errors[] = "User {$i}: Name and email are required";
                        continue;
                    }

                    // Check if email already exists
                    if (User::where('email', $email)->exists()) {
                        $errors[] = "User {$i}: Email {$email} already exists";
                        continue;
                    }

                    $user = User::create([
                        'name' => $name,
                        'email' => $email,
                        'password' => Hash::make($request->default_password),
                    ]);

                    Account::create([
                        'user_id' => $user->id,
                        'account_role' => $requestedRole,
                        'account_status' => $request->default_status,
                    ]);

                    $createdUsers[] = $user;

                } catch (\Exception $e) {
                    $errors[] = "User {$i}: " . $e->getMessage();
                }
            }

            if (count($createdUsers) > 0) {
                Log::info('Bulk user creation completed', [
                    'created_count' => count($createdUsers),
                    'requested_count' => $userCount,
                    'role' => $requestedRole,
                    'status' => $request->default_status,
                    'created_by' => Auth::user()->id
                ]);

                $successMessage = count($createdUsers) . ' users created successfully';
                if (count($errors) > 0) {
                    $successMessage .= '. Some users failed to create: ' . implode(', ', $errors);
                }

                // Redirect based on current user role
                if ($currentUserRole === 'SuperAdmin') {
                    return redirect()->route('superadmin.users.management')
                                    ->with('success', $successMessage);
                } else {
                    return redirect()->route('admin.users.management')
                                    ->with('success', $successMessage);
                }
            } else {
                return redirect()->back()
                                ->withErrors(['error' => 'No users were created. ' . implode(', ', $errors)])
                                ->withInput();
            }

        } catch (\Exception $e) {
            Log::error('Bulk user creation error: ' . $e->getMessage());
            return redirect()->back()
                            ->withErrors(['error' => 'An error occurred during bulk user creation. Please try again.'])
                            ->withInput();
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
                        'name' => $user->name,
                        'email' => $user->email,
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
     * 获取用户统计数据（优化版）
     */
    public function getUserStats(Request $request) {
        try {
            $currentRole = $this->getCurrentUserRole();

            // 构建查询
            $query = $this->buildUserQuery();

            // 一次性获取所有统计数据，减少数据库查询
            $baseQuery = clone $query;

            $stats = [
                'total_users' => $baseQuery->count(),
            ];

            // 批量获取状态统计
            $statusStats = $baseQuery->join('accounts', 'users.id', '=', 'accounts.user_id')
                ->selectRaw('account_status, COUNT(*) as count')
                ->groupBy('account_status')
                ->pluck('count', 'account_status')
                ->toArray();

            $stats['available_users'] = $statusStats['Available'] ?? 0;
            $stats['unavailable_users'] = $statusStats['Unavailable'] ?? 0;

            // 管理员统计
            if ($currentRole === 'SuperAdmin') {
                $adminQuery = clone $query;
                $stats['admin_users'] = $adminQuery->join('accounts', 'users.id', '=', 'accounts.user_id')
                    ->whereIn('account_role', ['Admin', 'SuperAdmin'])
                    ->count();
            } else {
                $stats['admin_users'] = 0;
            }

            return $this->jsonResponse(true, 'User statistics fetched successfully', $stats);
        } catch (\Exception $e) {
            return $this->handleError($request, 'Failed to fetch user statistics', $e);
        }
    }

    /**
     * 显示用户更新表单（优化版）
     */
    public function showUpdateForm($id) {
        $user = User::with('account')->findOrFail($id);
        $userRole = $this->getCurrentUserRole();
        $isUpdatingSelf = Auth::id() == $id;

        // 权限检查
        if (!$this->checkUserPermission('edit_user', $user)) {
            abort(403, 'You do not have permission to edit this user');
        }

        return view('auth.auth_update', compact('user', 'userRole', 'isUpdatingSelf'));
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
                'name' => $user->name,
                'email' => $user->email,
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
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6|confirmed',
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
        $user->name = $request->name;
        $user->email = $request->email;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        // 更新账户信息（如果不是更新自己）
        if (!$isUpdatingSelf) {
            if ($user->account) {
                $user->account->account_status = $request->account_status;

                if ($currentRole === 'SuperAdmin' && $request->filled('account_role')) {
                    $user->account->account_role = $request->account_role;
                }

                $user->account->save();
            } else {
                $accountRole = ($currentRole === 'Admin') ? 'Staff' : $request->account_role;
                Account::create([
                    'user_id' => $user->id,
                    'account_role' => $accountRole,
                    'account_status' => $request->account_status,
                ]);
            }
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
                'name' => $user->name,
                'email' => $user->email,
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
                'name' => $user->name,
                'email' => $user->email,
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
                'name' => $user->name,
                'email' => $user->email,
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
                'name' => $user->name,
                'email' => $user->email,
            ];

            $user->delete();

            $this->logOperation('user_deleted', $userData);

            return $this->jsonResponse(true, 'User deleted successfully', $userData);

        } catch (\Exception $e) {
            return $this->handleError($request, 'An error occurred while deleting the user. Please try again.', $e);
        }
    }
}
