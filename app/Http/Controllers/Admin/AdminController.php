<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\Account;

class AdminController extends Controller
{
    public function index() {
        return view('admin.dashboard');
    }

    public function showUserList(Request $request) {
        // 如果是 AJAX 请求，返回 JSON 数据
        if ($request->ajax()) {
            try {
                $query = User::query()->with('account');

                // Admin 只能查看 Staff 用户
                $query->whereHas('account', function ($accountQuery) {
                    $accountQuery->where('account_role', 'Staff');
                });

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
                Log::error('Admin staff management error: ' . $e->getMessage());
                return response()->json(['error' => 'Failed to fetch users'], 500);
            }
        }

        // 如果不是 AJAX 请求，返回视图
        $globalUserRole = Auth::user()->getAccountRole();
        return view('staff_management', compact('globalUserRole'));
    }

    public function showUpdateForm($id) {
        $user = User::with('account')->findOrFail($id);

        // 检查用户是否为Staff角色
        if ($user->account && $user->account->account_role !== 'Staff') {
            abort(403, 'You can only edit staff accounts');
        }

        return view('admin.update', compact('user'));
    }

    public function update(Request $request, $id) {
        try {
            // 获取用户及关联账户
            $user = User::with('account')->findOrFail($id);

            // 检查用户是否为Staff角色
            if ($user->account && $user->account->account_role !== 'Staff') {
                return redirect()->back()
                                ->withErrors(['error' => 'You can only edit staff accounts'])
                                ->withInput();
            }

            // 验证请求（Admin不能修改角色）
            $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
                'password' => ['nullable', 'string', 'min:6', 'confirmed'],
                'account_status' => ['required', 'string', 'in:Available,Unavailable'],
            ]);

            // 更新用户信息
            $user->name = $request->name;
            $user->email = $request->email;
            if ($request->filled('password')) {
                $user->password = Hash::make($request->password);
            }
            $user->save();

            // 更新账户状态（保持角色为Staff）
            if ($user->account) {
                $user->account->account_status = $request->account_status;
                $user->account->save();
            } else {
                Account::create([
                    'user_id' => $user->id,
                    'account_role' => 'Staff', // Admin只能创建Staff角色
                    'account_status' => $request->account_status,
                ]);
            }

            // 成功日志
            Log::info('Staff updated successfully by Admin', [
                'user_id' => $user->id,
                'updated_by' => Auth::id(),
                'data' => $request->except('password', 'password_confirmation')
            ]);

            return redirect()->route('admin.staff_management')
                            ->with('success', 'Staff information updated successfully!');

        } catch (\Exception $e) {
            // 错误日志
            Log::error('Staff update failed by Admin', [
                'user_id' => $id,
                'updated_by' => Auth::id(),
                'error_message' => $e->getMessage()
            ]);

            return redirect()->back()
                            ->withErrors(['error' => 'An error occurred while updating staff information. Please try again.'])
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

            // 检查用户是否为Staff角色
            if ($user->account && $user->account->account_role !== 'Staff') {
                return redirect()->back()
                                ->withErrors(['error' => 'You can only manage staff accounts'])
                                ->withInput();
            }

            if ($user->account) {
                $user->account->account_status = 'Unavailable';
                $user->account->save();

                Log::info('Staff account set to Unavailable by Admin', [
                    'user_id' => $user->id,
                    'updated_by' => Auth::id()
                ]);

                return redirect()->route('admin.staff_management')
                                ->with('success', 'Staff account has been set to unavailable status');
            } else {
                return redirect()->back()
                                ->withErrors(['error' => 'Account not found'])
                                ->withInput();
            }
        } catch (\Exception $e) {
            Log::error('Failed to set staff account to Unavailable by Admin', [
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

            // 检查用户是否为Staff角色
            if ($user->account && $user->account->account_role !== 'Staff') {
                return redirect()->back()
                                ->withErrors(['error' => 'You can only manage staff accounts'])
                                ->withInput();
            }

            if ($user->account) {
                $user->account->account_status = 'Available';
                $user->account->save();

                Log::info('Staff account set to Available by Admin', [
                    'user_id' => $user->id,
                    'updated_by' => Auth::id()
                ]);

                return redirect()->route('admin.staff_management')
                                ->with('success', 'Staff account has been set to available status');
            } else {
                return redirect()->back()
                                ->withErrors(['error' => 'Account not found'])
                                ->withInput();
            }
        } catch (\Exception $e) {
            Log::error('Failed to set staff account to Available by Admin', [
                'user_id' => $id,
                'updated_by' => Auth::id(),
                'error_message' => $e->getMessage()
            ]);

            return redirect()->back()
                            ->withErrors(['error' => 'An error occurred while setting account status. Please try again.'])
                            ->withInput();
        }
    }
}
