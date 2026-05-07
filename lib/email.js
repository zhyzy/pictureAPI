// 邮件发送工具
const nodemailer = require('nodemailer');
const { getDbAsync } = require('./db');

// 获取邮件配置（单次查询，避免重复读取数据库）
async function getEmailConfig() {
  const db = await getDbAsync();
  const rows = db.all("SELECT key, value FROM settings WHERE key LIKE 'smtp_%'");
  const map = {};
  rows.forEach(r => { map[r.key] = r.value; });
  return {
    host: map['smtp_host'] || '',
    port: parseInt(map['smtp_port'] || '587'),
    user: map['smtp_user'] || '',
    pass: map['smtp_pass'] || '',
    from: map['smtp_from'] || '',
    secure: map['smtp_secure'] === 'true',
  };
}

// 创建邮件传输器
async function createTransport() {
  const config = await getEmailConfig();

  if (!config.host || !config.user || !config.pass) {
    console.error('SMTP 配置不完整:', {
      host: !!config.host,
      user: !!config.user,
      pass: !!config.pass,
    });
    return null;
  }

  try {
    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  } catch (err) {
    console.error('创建 SMTP 传输器失败:', err);
    return null;
  }
}

// 发送邮件
async function sendEmail({ to, subject, html, text }) {
  try {
    const transporter = await createTransport();

    if (!transporter) {
      return { success: false, error: '邮件服务器未配置或配置错误，请检查 SMTP 设置' };
    }

    const config = await getEmailConfig();
    // from 必须是合法邮箱格式，带显示名时用 "Name" <user@domain> 格式
    const from = config.from
      ? config.from.includes('@')
        ? config.from
        : `"${config.from}" <${config.user}>`
      : config.user;

    // 先验证 SMTP 连接是否可用
    try {
      await transporter.verify();
    } catch (verifyErr) {
      console.error('SMTP 连接验证失败:', verifyErr);
      return {
        success: false,
        error: `SMTP 连接失败: ${verifyErr.message}（请检查主机/端口/账号/授权码）`,
      };
    }

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });

    console.log('邮件发送成功:', info.messageId, info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('邮件发送失败:', error);
    return { success: false, error: error.message };
  }
}

// 发送验证码邮件
async function sendVerificationEmail(email, code) {
  return sendEmail({
    to: email,
    subject: '邮箱验证 - 樱道 API',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #c75b39;">樱道 API - 邮箱验证</h2>
        <p>您好，</p>
        <p>您的邮箱验证码是：</p>
        <div style="background: #f5f3ef; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #c75b39; border-radius: 8px; margin: 20px 0;">
          ${code}
        </div>
        <p>此验证码将在30分钟后过期，请尽快完成验证。</p>
        <p>如果您没有请求此验证码，请忽略此邮件。</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">樱道 API - 图片接口服务平台</p>
      </div>
    `,
  });
}

module.exports = { sendEmail, sendVerificationEmail, getEmailConfig };
