<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\Account;

class AuthController extends Controller
{
    public function showLoginForm() {
        return view('auth.login');
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
        $userRole = Auth::user()->getAccountRole();
        return view('auth.register', compact('userRole'));
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
     * 單個存儲用戶
     */
    private function storeSingleUser(Request $request) {
        try {
            $currentUserRole = Auth::user()->getAccountRole();

            // Permission check
            if ($currentUserRole === 'Admin' && $request->account_role !== 'Staff') {
                return redirect()->back()
                                ->withErrors(['error' => 'You can only create Staff accounts.'])
                                ->withInput();
            }

            if ($currentUserRole === 'Staff') {
                return redirect()->back()
                                ->withErrors(['error' => 'You do not have permission to create accounts.'])
                                ->withInput();
            }

            $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
                'password' => ['required', 'string', 'min:6', 'confirmed'],
                'account_role' => ['required', 'string', 'in:SuperAdmin,Admin,Staff'],
                'account_status' => ['required', 'string', 'in:Available,Unavailable'],
            ]);

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            Account::create([
                'user_id' => $user->id,
                'account_role' => $request->account_role,
                'account_status' => $request->account_status,
            ]);

            Log::info('User created successfully (single)', [
                'user_id' => $user->id,
                'created_by' => Auth::id(),
                'role' => $request->account_role,
                'status' => $request->account_status
            ]);

            $message = 'User created successfully!';

            if ($request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $user
                ]);
            }

            // Redirect based on current user role
            if ($currentUserRole === 'SuperAdmin') {
                return redirect()->route('superadmin.users.management')
                                ->with('success', $message);
            } else {
                return redirect()->route('admin.users.management')
                                ->with('success', $message);
            }

        } catch (\Exception $e) {
            Log::error('User creation failed (single): ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            if ($request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create user: ' . $e->getMessage()
                ], 500);
            }

            return redirect()->back()
                            ->withErrors(['error' => 'Failed to create user: ' . $e->getMessage()])
                            ->withInput();
        }
    }

    /**
     * 批量存儲用戶（統一入口）
     */
    private function storeMultipleUsers(Request $request) {
        try {
            $currentUserRole = Auth::user()->getAccountRole();

            // 僅處理批量數組
            $users = $request->input('users', []);
            $createdUsers = [];
            $errors = [];

            foreach ($users as $index => $userData) {
                // 兼容前端字段命名（camelCase -> snake_case）
                // 前端：userName / userEmail / userPassword / accountRole / accountStatus
                // 后端期望：name / email / password / account_role / account_status
                if (isset($userData['userName']) && !isset($userData['name'])) {
                    $userData['name'] = $userData['userName'];
                }
                if (isset($userData['userEmail']) && !isset($userData['email'])) {
                    $userData['email'] = $userData['userEmail'];
                }
                if (isset($userData['userPassword']) && !isset($userData['password'])) {
                    $userData['password'] = $userData['userPassword'];
                }
                if (isset($userData['accountRole']) && !isset($userData['account_role'])) {
                    $userData['account_role'] = $userData['accountRole'];
                }
                if (isset($userData['accountStatus']) && !isset($userData['account_status'])) {
                    $userData['account_status'] = $userData['accountStatus'];
                }

                $validator = \Validator::make($userData, [
                    'name' => 'required|string|max:255',
                    'email' => 'required|string|email|max:255',
                    'password' => 'required|string|min:6',
                    'account_role' => 'required|string|in:SuperAdmin,Admin,Staff',
                    'account_status' => 'required|string|in:Available,Unavailable',
                ]);

                if ($validator->fails()) {
                    $errors[] = "User " . ($index + 1) . ": " . implode(', ', $validator->errors()->all());
                    continue;
                }

                // Permission check for each user
                if ($currentUserRole === 'Admin' && $userData['account_role'] !== 'Staff') {
                    $errors[] = "User " . ($index + 1) . ": You can only create Staff accounts";
                    continue;
                }

                // 檢查郵箱是否已存在
                $existingUser = User::where('email', $userData['email'])->first();

                if ($existingUser) {
                    $errors[] = "User " . ($index + 1) . ": Email '{$userData['email']}' already exists";
                    continue;
                }

                try {
                    $userRecord = [
                        'name' => $userData['name'],
                        'email' => $userData['email'],
                        'password' => Hash::make($userData['password']),
                    ];

                    $user = User::create($userRecord);

                    Account::create([
                        'user_id' => $user->id,
                        'account_role' => $userData['account_role'],
                        'account_status' => $userData['account_status'],
                    ]);

                    $createdUsers[] = $user;
                } catch (\Exception $e) {
                    $errors[] = "User " . ($index + 1) . ": " . $e->getMessage();
                }
            }

            if ($request->ajax()) {
                if (count($errors) > 0) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Some users failed to create',
                        'errors' => $errors,
                        'created_count' => count($createdUsers)
                    ], 422);
                } else {
                    return response()->json([
                        'success' => true,
                        'message' => count($createdUsers) . ' users created successfully',
                        'data' => $createdUsers
                    ]);
                }
            }

            if (count($errors) > 0) {
                return redirect()->back()
                                ->withErrors(['error' => implode('; ', $errors)])
                                ->withInput();
            }

            Log::info('Users created successfully (bulk)', [
                'created_count' => count($createdUsers),
                'created_by' => Auth::id(),
                'created_by_role' => $currentUserRole
            ]);

            // Redirect based on current user role
            if ($currentUserRole === 'SuperAdmin') {
                return redirect()->route('superadmin.users.management')
                                ->with('success', count($createdUsers) . ' users created successfully');
            } else {
                return redirect()->route('admin.users.management')
                                ->with('success', count($createdUsers) . ' users created successfully');
            }

        } catch (\Exception $e) {
            Log::error('Bulk user creation error: ' . $e->getMessage());
            return redirect()->back()
                            ->withErrors(['error' => 'An error occurred during bulk user creation. Please try again.'])
                            ->withInput();
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
     * 显示用户列表
     */
    public function showUserList(Request $request) {
        // 如果是 AJAX 请求，返回 JSON 数据
        if ($request->ajax()) {
            try {
                $query = User::query()->with('account');
                $currentUserRole = Auth::user()->getAccountRole();

                // 根据角色限制查看权限
                if ($currentUserRole === 'Admin') {
                    // Admin 只能查看 Staff 用户
                    $query->whereHas('account', function ($accountQuery) {
                        $accountQuery->where('account_role', 'Staff');
                    });
                }
                // SuperAdmin 可以查看所有用户，无需限制

                // 搜索条件
                if ($request->filled('search')) {
                    $search = $request->input('search');
                    $query->where(function ($query) use ($search) {
                        $query->where('name', 'like', "%$search%")
                              ->orWhere('email', 'like', "%$search%");
                    });
                }

                // 根据 role 筛选
                if ($request->filled('role')) {
                    $query->whereHas('account', function ($accountQuery) use ($request) {
                        $accountQuery->where('account_role', $request->input('role'));
                    });
                }

                // 根据 status 筛选
                if ($request->filled('status')) {
                    $query->whereHas('account', function ($accountQuery) use ($request) {
                        $accountQuery->where('account_status', $request->input('status'));
                    });
                }

                // 分页设置
                $perPage = $request->input('perPage', 10);
                $users = $query->paginate($perPage);

                // 返回分页数据
                return response()->json([
                    'success' => true,
                    'data' => $users->map(function ($user) {
                        return [
                            'id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                            'role' => $user->account->account_role ?? 'N/A',
                            'status' => $user->account->account_status ?? 'N/A',
                        ];
                    }),
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
                Log::error('User management error: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch users',
                    'error' => $e->getMessage()
                ], 500);
            }
        }

        // 如果不是 AJAX 请求，返回视图
        $globalUserRole = Auth::user()->getAccountRole();
        return view('auth.dashboard', compact('globalUserRole'));
    }

    /**
     * 获取用户统计数据
     */
    public function getUserStats(Request $request) {
        try {
            $currentUserRole = Auth::user()->getAccountRole();

            $query = User::query()->with('account');

            // 根据角色限制查看权限
            if ($currentUserRole === 'Admin') {
                $query->whereHas('account', function ($accountQuery) {
                    $accountQuery->where('account_role', 'Staff');
                });
            }

            $totalUsers = $query->count();

            // Available和Unavailable統計也需要重新計算，不受當前查詢限制影響
            if ($currentUserRole === 'Admin') {
                // Admin用戶只能看到Staff用戶的狀態
                $availableUsers = $query->whereHas('account', function ($accountQuery) {
                    $accountQuery->where('account_status', 'Available');
                })->count();
                $unavailableUsers = $query->whereHas('account', function ($accountQuery) {
                    $accountQuery->where('account_status', 'Unavailable');
                })->count();
            } else {
                // SuperAdmin可以看到所有用戶的狀態
                $availableUsers = User::query()->whereHas('account', function ($accountQuery) {
                    $accountQuery->where('account_status', 'Available');
                })->count();
                $unavailableUsers = User::query()->whereHas('account', function ($accountQuery) {
                    $accountQuery->where('account_status', 'Unavailable');
                })->count();
            }

            // Admin Users 統計需要重新計算，不受當前查詢限制影響
            $adminUsersQuery = User::query()->with('account');
            if ($currentUserRole === 'Admin') {
                // Admin用戶只能看到Staff，所以Admin Users為0
                $adminUsers = 0;
            } else {
                // SuperAdmin可以看到所有Admin和SuperAdmin用戶
                $adminUsers = $adminUsersQuery->whereHas('account', function ($accountQuery) {
                    $accountQuery->whereIn('account_role', ['Admin', 'SuperAdmin']);
                })->count();
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'total_users' => $totalUsers,
                    'available_users' => $availableUsers,
                    'unavailable_users' => $unavailableUsers,
                    'admin_users' => $adminUsers,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('User stats error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch user statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 显示用户更新表单
     */
    public function showUpdateForm($id) {
        $user = User::with('account')->findOrFail($id);
        $currentUserRole = Auth::user()->getAccountRole();

        // 权限检查
        if ($currentUserRole === 'Admin') {
            // Admin 只能编辑 Staff 用户
            if ($user->account && $user->account->account_role !== 'Staff') {
                abort(403, 'You can only edit staff accounts');
            }
        }

        // 传递当前用户角色到视图
        $userRole = $currentUserRole;

        return view('auth.update', compact('user', 'userRole'));
    }

    /**
     * 更新用户信息
     */
    public function updateUser(Request $request, $id) {
        try {
            // 获取用户及关联账户
            $user = User::with('account')->findOrFail($id);
            $currentUserRole = Auth::user()->getAccountRole();

            // 权限检查
            if ($currentUserRole === 'Admin') {
                // Admin 只能编辑 Staff 用户
                if ($user->account && $user->account->account_role !== 'Staff') {
                    return response()->json([
                        'success' => false,
                        'message' => 'You can only edit staff accounts'
                    ], 403);
                }
            }

            // 验证规则根据角色不同
            $validationRules = [
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
                'password' => ['nullable', 'string', 'min:6', 'confirmed'],
                'account_status' => ['required', 'string', 'in:Available,Unavailable'],
            ];

            // SuperAdmin 可以修改角色
            if ($currentUserRole === 'SuperAdmin') {
                $validationRules['account_role'] = ['required', 'string', 'in:SuperAdmin,Admin,Staff'];
            }

            $request->validate($validationRules);

            // 更新用户信息
            $user->name = $request->name;
            $user->email = $request->email;
            if ($request->filled('password')) {
                $user->password = Hash::make($request->password);
            }
            $user->save();

            // 更新账户信息
            if ($user->account) {
                $user->account->account_status = $request->account_status;
                if ($currentUserRole === 'SuperAdmin' && $request->filled('account_role')) {
                    $user->account->account_role = $request->account_role;
                }
                $user->account->save();
            } else {
                $accountRole = ($currentUserRole === 'Admin') ? 'Staff' : $request->account_role;
                Account::create([
                    'user_id' => $user->id,
                    'account_role' => $accountRole,
                    'account_status' => $request->account_status,
                ]);
            }

            // 成功日志
            Log::info('User updated successfully', [
                'user_id' => $user->id,
                'updated_by' => Auth::id(),
                'updated_by_role' => $currentUserRole,
                'data' => $request->except('password', 'password_confirmation')
            ]);

            return response()->json([
                'success' => true,
                'message' => 'User updated successfully',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->account->account_role ?? 'N/A',
                    'status' => $user->account->account_status ?? 'N/A',
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            // 错误日志
            Log::error('User update failed', [
                'user_id' => $id,
                'updated_by' => Auth::id(),
                'updated_by_role' => Auth::user()->getAccountRole(),
                'error_message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating the user. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 设置账户为不可用
     */
    public function setUnavailable($id) {
        try {
            // 检查是否尝试将自己设置为不可用
            if (Auth::id() == $id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You cannot set yourself to unavailable status'
                ], 403);
            }

            $user = User::with('account')->findOrFail($id);
            $currentUserRole = Auth::user()->getAccountRole();

            // 权限检查
            if ($currentUserRole === 'Admin') {
                // Admin 只能管理 Staff 用户
                if ($user->account && $user->account->account_role !== 'Staff') {
                    return response()->json([
                        'success' => false,
                        'message' => 'You can only manage staff accounts'
                    ], 403);
                }
            }

            if ($user->account) {
                $user->account->account_status = 'Unavailable';
                $user->account->save();

                Log::info('Account set to Unavailable', [
                    'user_id' => $user->id,
                    'updated_by' => Auth::id(),
                    'updated_by_role' => $currentUserRole
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Account has been set to unavailable status',
                    'data' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->account->account_role ?? 'N/A',
                        'status' => $user->account->account_status ?? 'N/A',
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Account not found'
                ], 404);
            }
        } catch (\Exception $e) {
            Log::error('Failed to set account to Unavailable', [
                'user_id' => $id,
                'updated_by' => Auth::id(),
                'updated_by_role' => Auth::user()->getAccountRole(),
                'error_message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while setting account status. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 设置账户为可用
     */
    public function setAvailable($id) {
        try {
            $user = User::with('account')->findOrFail($id);
            $currentUserRole = Auth::user()->getAccountRole();

            // 权限检查
            if ($currentUserRole === 'Admin') {
                // Admin 只能管理 Staff 用户
                if ($user->account && $user->account->account_role !== 'Staff') {
                    return response()->json([
                        'success' => false,
                        'message' => 'You can only manage staff accounts'
                    ], 403);
                }
            }

            if ($user->account) {
                $user->account->account_status = 'Available';
                $user->account->save();

                Log::info('Account set to Available', [
                    'user_id' => $user->id,
                    'updated_by' => Auth::id(),
                    'updated_by_role' => $currentUserRole
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Account has been set to available status',
                    'data' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->account->account_role ?? 'N/A',
                        'status' => $user->account->account_status ?? 'N/A',
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Account not found'
                ], 404);
            }
        } catch (\Exception $e) {
            Log::error('Failed to set account to Available', [
                'user_id' => $id,
                'updated_by' => Auth::id(),
                'updated_by_role' => Auth::user()->getAccountRole(),
                'error_message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while setting account status. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 修改用户角色 (仅 SuperAdmin)
     */
    public function changeAccountRole(Request $request, $id) {
        try {
            $currentUserRole = Auth::user()->getAccountRole();

            // 只有 SuperAdmin 可以修改角色
            if ($currentUserRole !== 'SuperAdmin') {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to change roles'
                ], 403);
            }

            $user = User::with('account')->findOrFail($id);

            $request->validate([
                'account_role' => ['required', 'string', 'in:SuperAdmin,Admin,Staff'],
            ]);

            if ($user->account) {
                $user->account->account_role = $request->account_role;
                $user->account->save();

                Log::info('Account role changed', [
                    'user_id' => $user->id,
                    'new_role' => $request->account_role,
                    'updated_by' => Auth::id()
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Account role changed successfully',
                    'data' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->account->account_role ?? 'N/A',
                        'status' => $user->account->account_status ?? 'N/A',
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Account not found'
                ], 404);
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Failed to change account role', [
                'user_id' => $id,
                'updated_by' => Auth::id(),
                'error_message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 删除用户账户 (仅 SuperAdmin)
     */
    public function deleteAccount(Request $request, $id) {
        try {
            $currentUserRole = Auth::user()->getAccountRole();

            // 只有 SuperAdmin 可以删除用户
            if ($currentUserRole !== 'SuperAdmin') {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to delete accounts'
                ], 403);
            }

            // 检查是否尝试删除自己
            if (Auth::id() == $id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You cannot delete your own account'
                ], 403);
            }

            $user = User::findOrFail($id);
            $userName = $user->name;
            $userEmail = $user->email;
            $user->delete();

            Log::info('User deleted', [
                'user_id' => $id,
                'user_name' => $userName,
                'user_email' => $userEmail,
                'deleted_by' => Auth::id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully',
                'data' => [
                    'id' => $id,
                    'name' => $userName,
                    'email' => $userEmail,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete user', [
                'user_id' => $id,
                'deleted_by' => Auth::id(),
                'error_message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while deleting the user. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
