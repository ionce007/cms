// common/mailer.js
const nodemailer = require('nodemailer');

// ✅ 邮件配置（从环境变量读取）
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.qq.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,  // 465 端口用 true
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,  // 授权码，不是登录密码
    },
});

/**
 * 发送邮件
 */
async function sendMail({ to, subject, html, text }) {
    try {
        const info = await transporter.sendMail({
            from: `"${process.env.SMTP_FROM_NAME || 'TechBlog'}" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text: text || '',
            html: html || '',
        });

        console.log('📧 邮件发送成功:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('📧 邮件发送失败:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 发送密码重置邮件
 */
async function sendPasswordResetEmail({ to, username, resetUrl, expireMinutes = 30 }) {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 500; margin: 20px 0; }
                .button:hover { background: #2563eb; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
                .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; border-radius: 4px; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 密码重置</h1>
                </div>
                <div class="content">
                    <p>您好，<strong>${username}</strong>：</p>
                    <p>我们收到了您的密码重置请求。点击下方按钮设置新密码：</p>
                    <div style="text-align: center;">
                        <a href="${resetUrl}" class="button">重置密码</a>
                    </div>
                    <p>或复制以下链接到浏览器打开：</p>
                    <p style="background: #e5e7eb; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 13px;">
                        ${resetUrl}
                    </p>
                    <div class="warning">
                        ⏰ 此链接将在 <strong>${expireMinutes} 分钟</strong>后失效，请尽快操作。
                    </div>
                    <p>如果这不是您的操作，请忽略此邮件，您的密码不会被修改。</p>
                    <div class="footer">
                        <p>此邮件由系统自动发送，请勿回复。</p>
                        <p>© ${new Date().getFullYear()} TechBlog. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendMail({
        to,
        subject: '【TechBlog】密码重置',
        html,
        text: `您好 ${username}，请点击以下链接重置密码：${resetUrl}（${expireMinutes} 分钟内有效）`,
    });
}

module.exports = {
    sendMail,
    sendPasswordResetEmail,
};