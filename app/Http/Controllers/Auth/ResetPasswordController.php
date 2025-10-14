<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Str;
use App\Models\User;

/**
 * Reset Password Controller
 * 处理密码重置相关功能
 *
 * @author WMS Team
 * @version 1.0.0
 */
class ResetPasswordController extends Controller
{
    /**
     * 显示密码重置请求表单
     *
     * @return \Illuminate\View\View
     */
    public function ShowRequestForm()
    {
        return view('auth.reset_password.email_verify');
    }

    /**
     * 发送密码重置邮件
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ]);

        // 删除该邮箱的旧重置令牌
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // 生成新的重置令牌
        $token = Str::random(60);

        // 存储重置令牌
        DB::table('password_reset_tokens')->insert([
            'email' => $request->email,
            'token' => Hash::make($token),
            'created_at' => Carbon::now()
        ]);

        // 生成重置链接
        $link = url('/password/reset/' . $token . '?email=' . urlencode($request->email));

        // 发送重置邮件
        Mail::send('auth.reset_password.email_template', ['link' => $link], function($message) use ($request) {
            $message->to($request->email)->subject('Reset Password');
        });

        return back()->with('success', 'We have sent you a link to reset your password!');
    }

    /**
     * 显示密码重置表单
     *
     * @param string|null $token
     * @param Request $request
     * @return \Illuminate\View\View
     */
    public function ShowResetForm($token = null, Request $request)
    {
        return view('auth.reset_password.reset_dashboard', [
            'token' => $token,
            'email' => $request->email
        ]);
    }

    /**
     * 处理密码重置
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'password' => 'required|string|min:8|confirmed',
            'token' => 'required'
        ]);

        // 验证重置令牌
        $reset = DB::table('password_reset_tokens')->where('email', $request->email)->first();

        if (!$reset || !Hash::check($request->token, $reset->token)) {
            return back()->with('error', 'Invalid token!');
        }

        // 更新用户密码
        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        // 删除已使用的重置令牌
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return redirect()->route('login')->with('success', 'Password reset successfully!');
    }
}
