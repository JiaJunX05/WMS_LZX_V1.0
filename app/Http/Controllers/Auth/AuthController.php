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
        return view('auth.register');
    }

    public function register(Request $request) {
        try {
            $currentUserRole = Auth::user()->getAccountRole();
            $requestedRole = $request->account_role ?? 'Staff';

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

            $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
                'password' => ['required', 'string', 'min:6', 'confirmed'],
                'account_role' => ['nullable', 'string', 'in:SuperAdmin,Admin,Staff'],
                'account_status' => ['nullable', 'string', 'in:Available,Unavailable'],
            ]);

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            Account::create([
                'user_id' => $user->id,
                'account_role' => $requestedRole,
                'account_status' => $request->account_status ?? 'Available',
            ]);

            Log::info('Registration success', [
                'user_id' => $user->id,
                'email' => $user->email,
                'role' => $requestedRole,
                'created_by' => Auth::user()->id
            ]);

            // Redirect based on current user role
            $currentUserRole = Auth::user()->getAccountRole();
            if ($currentUserRole === 'SuperAdmin') {
                return redirect()->route('superadmin.users.management')
                                ->with('success', 'User has been created successfully.');
            } elseif ($currentUserRole === 'Admin') {
                return redirect()->route('admin.users.management')
                                ->with('success', 'User has been created successfully.');
            } else {
                return redirect()->route('staff_management')
                                ->with('success', 'User has been created successfully.');
            }
        } catch (\Exception $e) {
            Log::error('Registration error: ' . $e->getMessage());
            return redirect()->back()
                            ->withErrors(['error' => 'An error occurred during registration. Please try again.'])
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
                return response()->json(['error' => 'Failed to fetch users'], 500);
            }
        }

        // 如果不是 AJAX 请求，返回视图
        $globalUserRole = Auth::user()->getAccountRole();
        return view('auth.user-dashboard', compact('globalUserRole'));
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
                    return redirect()->back()
                                    ->withErrors(['error' => 'You can only edit staff accounts'])
                                    ->withInput();
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

            // 根据当前用户角色重定向
            if ($currentUserRole === 'SuperAdmin') {
                return redirect()->route('superadmin.users.management')
                                ->with('success', 'User updated successfully.');
            } else {
                return redirect()->route('admin.users.management')
                                ->with('success', 'Staff information updated successfully!');
            }

        } catch (\Exception $e) {
            // 错误日志
            Log::error('User update failed', [
                'user_id' => $id,
                'updated_by' => Auth::id(),
                'updated_by_role' => Auth::user()->getAccountRole(),
                'error_message' => $e->getMessage()
            ]);

            return redirect()->back()
                            ->withErrors(['error' => 'An error occurred while updating the user. Please try again.'])
                            ->withInput();
        }
    }

    /**
     * 设置账户为不可用
     */
    public function unavailableAccount(Request $request, $id) {
        try {
            // 检查是否尝试将自己设置为不可用
            if (Auth::id() == $id) {
                return redirect()->back()
                                ->withErrors(['error' => 'You cannot set yourself to unavailable status'])
                                ->withInput();
            }

            $user = User::with('account')->findOrFail($id);
            $currentUserRole = Auth::user()->getAccountRole();

            // 权限检查
            if ($currentUserRole === 'Admin') {
                // Admin 只能管理 Staff 用户
                if ($user->account && $user->account->account_role !== 'Staff') {
                    return redirect()->back()
                                    ->withErrors(['error' => 'You can only manage staff accounts'])
                                    ->withInput();
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

                // 根据当前用户角色重定向
                if ($currentUserRole === 'SuperAdmin') {
                    return redirect()->route('superadmin.users.management')
                                    ->with('success', 'Account has been set to unavailable status');
                } else {
                    return redirect()->route('admin.users.management')
                                    ->with('success', 'Staff account has been set to unavailable status');
                }
            } else {
                return redirect()->back()
                                ->withErrors(['error' => 'Account not found'])
                                ->withInput();
            }
        } catch (\Exception $e) {
            Log::error('Failed to set account to Unavailable', [
                'user_id' => $id,
                'updated_by' => Auth::id(),
                'updated_by_role' => Auth::user()->getAccountRole(),
                'error_message' => $e->getMessage()
            ]);

            return redirect()->back()
                            ->withErrors(['error' => 'An error occurred while setting account status. Please try again.'])
                            ->withInput();
        }
    }

    /**
     * 设置账户为可用
     */
    public function availableAccount(Request $request, $id) {
        try {
            $user = User::with('account')->findOrFail($id);
            $currentUserRole = Auth::user()->getAccountRole();

            // 权限检查
            if ($currentUserRole === 'Admin') {
                // Admin 只能管理 Staff 用户
                if ($user->account && $user->account->account_role !== 'Staff') {
                    return redirect()->back()
                                    ->withErrors(['error' => 'You can only manage staff accounts'])
                                    ->withInput();
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

                // 根据当前用户角色重定向
                if ($currentUserRole === 'SuperAdmin') {
                    return redirect()->route('superadmin.users.management')
                                    ->with('success', 'Account has been set to available status');
                } else {
                    return redirect()->route('admin.users.management')
                                    ->with('success', 'Staff account has been set to available status');
                }
            } else {
                return redirect()->back()
                                ->withErrors(['error' => 'Account not found'])
                                ->withInput();
            }
        } catch (\Exception $e) {
            Log::error('Failed to set account to Available', [
                'user_id' => $id,
                'updated_by' => Auth::id(),
                'updated_by_role' => Auth::user()->getAccountRole(),
                'error_message' => $e->getMessage()
            ]);

            return redirect()->back()
                            ->withErrors(['error' => 'An error occurred while setting account status. Please try again.'])
                            ->withInput();
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
                return redirect()->back()
                                ->withErrors(['error' => 'You do not have permission to change roles'])
                                ->withInput();
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

                return redirect()->route('superadmin.users.management')
                                ->with('success', 'Account role changed successfully.');
            } else {
                return redirect()->back()
                                ->withErrors(['error' => 'Account not found.'])
                                ->withInput();
            }
        } catch (\Exception $e) {
            Log::error('Failed to change account role', [
                'user_id' => $id,
                'updated_by' => Auth::id(),
                'error_message' => $e->getMessage()
            ]);

            return redirect()->back()
                            ->withErrors(['error' => 'An error occurred. Please try again.'])
                            ->withInput();
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
                return redirect()->back()
                                ->withErrors(['error' => 'You do not have permission to delete accounts'])
                                ->withInput();
            }

            // 检查是否尝试删除自己
            if (Auth::id() == $id) {
                return redirect()->back()
                                ->withErrors(['error' => 'You cannot delete your own account'])
                                ->withInput();
            }

            $user = User::findOrFail($id);
            $user->delete();

            Log::info('User deleted', [
                'user_id' => $id,
                'deleted_by' => Auth::id()
            ]);

            return redirect()->route('superadmin.users.management')
                            ->with('success', 'User deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to delete user', [
                'user_id' => $id,
                'deleted_by' => Auth::id(),
                'error_message' => $e->getMessage()
            ]);

            return redirect()->back()
                            ->withErrors(['error' => 'An error occurred while deleting the user. Please try again.'])
                            ->withInput();
        }
    }
}
