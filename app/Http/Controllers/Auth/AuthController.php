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
                return redirect()->route('superadmin.staff_management')
                                ->with('success', 'User has been created successfully.');
            } elseif ($currentUserRole === 'Admin') {
                return redirect()->route('admin.staff_management')
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
}
