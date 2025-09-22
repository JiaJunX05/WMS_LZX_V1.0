<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\Account;

class SuperController extends Controller
{
    public function index() {
        return view('super_admin.dashboard');
    }

    public function showUserList(Request $request) {
        // 如果是 AJAX 请求，返回 JSON 数据
        if ($request->ajax()) {
            try {
                $query = User::query()->with('account');

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
                Log::error('SuperAdmin staff management error: ' . $e->getMessage());
                return response()->json(['error' => 'Failed to fetch users'], 500);
            }
        }

        // 如果不是 AJAX 请求，返回视图
        $globalUserRole = Auth::user()->getAccountRole();
        return view('staff_management', compact('globalUserRole'));
    }

    public function showUpdateForm($id) {
        $user = User::with('account')->findOrFail($id);
        return view('super_admin.update', compact('user'));
    }

    public function update(Request $request, $id) {
        try {
            // 获取用户及关联账户
            $user = User::with('account')->findOrFail($id);

            // 验证请求
            $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
                'password' => ['nullable', 'string', 'min:6', 'confirmed'],
                'account_role' => ['required', 'string', 'in:SuperAdmin,Admin,Staff'],
                'account_status' => ['required', 'string', 'in:Available,Unavailable'],
            ]);

            // 更新用户信息
            $user->name = $request->name;
            $user->email = $request->email;
            if ($request->filled('password')) {
                $user->password = Hash::make($request->password);
            }
            $user->save();

            // 更新或创建账户信息
            if ($user->account) {
                $user->account->account_role = $request->account_role;
                $user->account->account_status = $request->account_status;
                $user->account->save();
            } else {
                Account::create([
                    'user_id' => $user->id,
                    'account_role' => $request->account_role,
                    'account_status' => $request->account_status,
                ]);
            }

            // 成功日志
            Log::info('User updated successfully', [
                'user_id' => $user->id,
                'updated_by' => Auth::id(),
                'data' => $request->except('password', 'password_confirmation')
            ]);

            return redirect()->route('superadmin.staff_management')
                            ->with('success', 'User updated successfully.');

        } catch (\Exception $e) {
            // 错误日志
            Log::error('User update failed', [
                'user_id' => $id,
                'updated_by' => Auth::id(),
                'error_message' => $e->getMessage()
            ]);

            return redirect()->back()
                            ->withErrors(['error' => 'An error occurred while updating the user. Please try again.'])
                            ->withInput();
        }
    }

    public function unavailableAccount(Request $request, $id) {
        try {
            // 检查是否尝试将自己设置为不可用
            if (Auth::id() == $id) {
                return redirect()->back()
                                ->withErrors(['error' => 'You cannot set yourself to unavailable status'])
                                ->withInput();
            }

            $user = User::with('account')->findOrFail($id);

            if ($user->account) {
                $user->account->account_status = 'Unavailable';
                $user->account->save();

                Log::info('Account set to Unavailable', [
                    'user_id' => $user->id,
                    'updated_by' => Auth::id()
                ]);

                return redirect()->route('superadmin.staff_management')
                                ->with('success', 'Account has been set to unavailable status');
            } else {
                return redirect()->back()
                                ->withErrors(['error' => 'Account not found'])
                                ->withInput();
            }
        } catch (\Exception $e) {
            Log::error('Failed to set account to Unavailable', [
                'user_id' => $id,
                'updated_by' => Auth::id(),
                'error_message' => $e->getMessage()
            ]);

            return redirect()->back()
                            ->withErrors(['error' => 'An error occurred while setting account status. Please try again.'])
                            ->withInput();
        }
    }

    public function availableAccount(Request $request, $id) {
        try {
            $user = User::with('account')->findOrFail($id);

            if ($user->account) {
                $user->account->account_status = 'Available';
                $user->account->save();

                Log::info('Account set to Available', [
                    'user_id' => $user->id,
                    'updated_by' => Auth::id()
                ]);

                return redirect()->route('superadmin.staff_management')
                                ->with('success', 'Account has been set to available status');
            } else {
                return redirect()->back()
                                ->withErrors(['error' => 'Account not found'])
                                ->withInput();
            }
        } catch (\Exception $e) {
            Log::error('Failed to set account to Available', [
                'user_id' => $id,
                'updated_by' => Auth::id(),
                'error_message' => $e->getMessage()
            ]);

            return redirect()->back()
                            ->withErrors(['error' => 'An error occurred while setting account status. Please try again.'])
                            ->withInput();
        }
    }

    public function changeAccountRole(Request $request, $id) {
        try {
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

                return redirect()->route('superadmin.staff_management')
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

    public function deleteAccount(Request $request, $id) {
        try {
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

            return redirect()->route('superadmin.staff_management')
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

    public function changeRole(Request $request, $id) {
        try {
            // 验证请求
            $request->validate([
                'account_role' => ['required', 'string', 'in:SuperAdmin,Admin,Staff'],
            ]);

            // 获取用户及关联账户
            $user = User::with('account')->findOrFail($id);

            // 检查是否尝试更改自己的角色
            if (Auth::id() == $id) {
                return redirect()->back()
                                ->withErrors(['error' => 'You cannot change your own role'])
                                ->withInput();
            }

            // 更新账户角色
            if ($user->account) {
                $user->account->account_role = $request->account_role;
                $user->account->save();
            } else {
                Account::create([
                    'user_id' => $user->id,
                    'account_role' => $request->account_role,
                    'account_status' => 'Available',
                ]);
            }

            // 成功日志
            Log::info('User role changed successfully', [
                'user_id' => $user->id,
                'new_role' => $request->account_role,
                'changed_by' => Auth::id()
            ]);

            return redirect()->route('superadmin.staff_management')
                            ->with('success', 'Role changed successfully!');

        } catch (\Exception $e) {
            // 错误日志
            Log::error('User role change failed', [
                'user_id' => $id,
                'changed_by' => Auth::id(),
                'error_message' => $e->getMessage()
            ]);

            return redirect()->back()
                            ->withErrors(['error' => 'Role change failed. Please try again.'])
                            ->withInput();
        }
    }
}
