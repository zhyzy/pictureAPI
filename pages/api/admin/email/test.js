// pages/api/admin/email/test.js - 测试邮件发送
import { withAdminAuth } from '../../../../lib/auth';
import { sendEmail, getEmailConfig, getSiteName } from '../../../../lib/email';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({ error: '收件人邮箱必填' });
    }

    const cfg = await getEmailConfig();
    const siteName = await getSiteName();
    console.info('[Email Test] SMTP 配置检查:', {
      hostConfigured: !!cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      userConfigured: !!cfg.user,
      fromConfigured: !!cfg.from,
      passConfigured: !!cfg.pass,
    });

    const result = await sendEmail({
      to,
      subject: `测试邮件 - ${siteName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #c75b39;">${siteName} - 邮件测试</h2>
          <p>这是一封测试邮件，如果您收到此邮件，说明邮件服务器配置正确。</p>
          <p>发送时间：${new Date().toLocaleString('zh-CN')}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">${siteName} - 图片接口服务平台</p>
        </div>
      `,
    });

    if (result.success) {
      return res.status(200).json({ message: '测试邮件发送成功' });
    } else {
      return res.status(500).json({
        error: '测试邮件发送失败',
        message: result.error,
        smtp: { hostConfigured: !!cfg.host, port: cfg.port, secure: cfg.secure, userConfigured: !!cfg.user },
      });
    }
  } catch (error) {
    console.error('Email test API error:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
}

export default withAdminAuth(handler);
