{{-- ==========================================
    密码重置邮件模板
    功能：发送密码重置链接的邮件模板
    ========================================== --}}

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password - Warehouse Management System</title>

    {{-- ==========================================
        邮件样式（仅使用邮件客户端兼容的样式）
        ========================================== --}}
    <style>
        /* 邮件兼容样式 */
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .header-gradient {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .btn-reset {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            color: white !important;
            padding: 15px 30px;
            border-radius: 25px;
            text-decoration: none;
            font-size: 16px;
            font-weight: 500;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            display: inline-block;
        }

        .security-border {
            border-left: 4px solid #28a745;
        }

        .logo-circle {
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            margin: 0 auto 15px auto;
            font-size: 24px;
            text-align: center;
            line-height: 60px;
        }

        /* 移动端适配 */
        @media only screen and (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 0;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">

    {{-- ==========================================
        邮件主体容器
        ========================================== --}}
    <div class="email-container">

        {{-- ==========================================
            邮件头部
            ========================================== --}}
        <div class="header-gradient" style="color: white; text-align: center; padding: 30px 20px;">
            <div class="logo-circle">📦</div>
            <h1 style="margin: 0; font-size: 28px; font-weight: 300;">Warehouse Management System</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">WMS Platform</p>
        </div>

        {{-- ==========================================
            邮件内容
            ========================================== --}}
        <div style="padding: 40px 30px;">

            {{-- 邮件标题 --}}
            <h2 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 24px; font-weight: 500;">🔐 Reset Your Password</h2>

            {{-- 问候语 --}}
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #555;">Hello!</p>

            {{-- 说明文字 --}}
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #555;">
                We received a request to reset your password. Please click the button below to reset your password:
            </p>

            {{-- 重置按钮 --}}
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ $link }}" class="btn-reset">🔄 Reset Password</a>
            </div>

            {{-- 分隔线 --}}
            <hr style="border: none; height: 1px; background: linear-gradient(to right, transparent, #ddd, transparent); margin: 30px 0;">

            {{-- ==========================================
                安全提示区域
                ========================================== --}}
            <div class="security-border" style="background-color: #f8f9fa; padding: 20px; margin: 30px 0; border-radius: 0 5px 5px 0;">
                <h3 style="margin: 0 0 10px 0; color: #28a745; font-size: 18px;">🛡️ Security Notice</h3>
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">⏰ This link will expire in 24 hours</p>
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">❌ If you didn't request a password reset, please ignore this email</p>
                <p style="margin: 0; font-size: 14px; color: #666;">🔒 For your account security, please don't share this link with others</p>
            </div>

            {{-- 备用链接说明 --}}
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #555;">
                If you can't click the button above, please copy and paste the following link into your browser:
            </p>

            {{-- 备用链接 --}}
            <div style="background-color: #f8f9fa; padding: 10px; border-radius: 5px;">
                <code style="word-break: break-all; font-family: monospace; font-size: 12px; color: #666;">🔗 {{ $link }}</code>
            </div>
        </div>

        {{-- ==========================================
            邮件底部
            ========================================== --}}
        <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">© 2025 Warehouse Management System. All rights reserved.</p>
            <p style="margin: 0; font-size: 14px; color: #666;">This email was sent automatically by the system. Please do not reply.</p>
        </div>
    </div>
</body>
</html>
