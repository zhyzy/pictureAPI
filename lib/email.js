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

async function getSiteName() {
  const db = await getDbAsync();
  const row = db.get("SELECT value FROM settings WHERE key = 'site_name'");
  return row?.value || 'ZL-综合API';
}

// 创建邮件传输器
// 全局单例：复用同一 SMTP 连接池，避免每次发信都重新握手
// （QQ/163 等服务商对频繁新建连接限流，表现为"测试邮件能发、连续发送被拒"）
let cachedTransporter = null;
let cachedConfigKey = '';

function configKey(config) {
  return [config.host, config.port, config.secure, config.user, config.pass].join('|');
}

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

  const key = configKey(config);
  if (cachedTransporter && cachedConfigKey === key) {
    return cachedTransporter;
  }

  try {
    // 配置变更时先关闭旧连接池，避免泄漏
    if (cachedTransporter) {
      try { cachedTransporter.close(); } catch (_) { /* 忽略关闭错误 */ }
      cachedTransporter = null;
    }

    cachedTransporter = nodemailer.createTransport({
      pool: true,           // 真正的连接池：多封邮件复用同一条 SMTP 连接
      maxConnections: 1,
      maxMessages: 100,     // 一条连接最多发 100 封后重建，防长连接老化
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      greetingTimeout: 10000,  // SMTP 握手 10 秒未完成即失败，避免请求挂死
      socketTimeout: 20000,    // 单次发送 20 秒超时
      tls: {
        rejectUnauthorized: false,
      },
    });
    cachedConfigKey = key;
    return cachedTransporter;
  } catch (err) {
    console.error('创建 SMTP 传输器失败:', err);
    cachedTransporter = null;
    cachedConfigKey = '';
    return null;
  }
}

// 判断是否为连接被远端回收/中断类瞬态错误（值得重试一次）
function isTransientConnectionError(err) {
  const code = err && (err.code || err.errno);
  const msg = (err && err.message) || '';
  return ['ECONNRESET', 'EPIPE', 'ETIMEDOUT', 'ECONNABORTED'].includes(code)
    || /connection closed|socket closed|connection timeout/i.test(msg);
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

    const mailOptions = {
      from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    };

    let info;
    try {
      info = await transporter.sendMail(mailOptions);
    } catch (err) {
      // 连接池里的空闲连接可能已被服务商回收：断开旧池重连后再试一次
      if (!isTransientConnectionError(err)) throw err;
      console.warn('SMTP 连接瞬断，重建连接池后重试:', err.code || err.message);
      try { transporter.close(); } catch (_) { /* 忽略 */ }
      cachedTransporter = null;
      cachedConfigKey = '';
      const fresh = await createTransport();
      if (!fresh) throw err;
      info = await fresh.sendMail(mailOptions);
    }

    console.log('邮件发送成功:', info.messageId, info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('邮件发送失败:', error);
    return { success: false, error: error.message };
  }
}

// 发送验证码邮件
async function sendVerificationEmail(email, code) {
  const siteName = await getSiteName();

  return sendEmail({
    to: email,
    subject: `邮箱验证 - ${siteName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #c75b39;">${siteName} - 邮箱验证</h2>
        <p>您好，</p>
        <p>您的邮箱验证码是：</p>
        <div style="background: #f5f3ef; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #c75b39; border-radius: 8px; margin: 20px 0;">
          ${code}
        </div>
        <p>此验证码将在30分钟后过期，请尽快完成验证。</p>
        <p>如果您没有请求此验证码，请忽略此邮件。</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">${siteName} - 图片接口服务平台</p>
      </div>
    `,
  });
}

module.exports = { sendEmail, sendVerificationEmail, getEmailConfig, getSiteName };
