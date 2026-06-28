// SQLite 数据库初始化 - 使用 sql.js（纯 WebAssembly，无 native 依赖，无 glibc 问题）
const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'zl939921104';

// 生成随机 API Key
function generateApiKey() {
  return 'ak_' + crypto.randomBytes(16).toString('hex');
}

const dbPath = path.join(process.cwd(), 'data', 'pictureapi.db');
let db = null;
let SQL = null;
let initPromise = null;

// 初始化数据库（只执行一次）
async function initDb() {
  if (db) return;

  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  createTables();
  saveDb();
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

function createTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      email_verified INTEGER DEFAULT 0,
      email_verify_code TEXT,
      email_verify_expires TEXT,
      avatar TEXT DEFAULT '',
      api_key TEXT UNIQUE,
      is_admin INTEGER DEFAULT 0,
      rate_limit INTEGER DEFAULT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 如果 avatar 字段不存在，则添加（向后兼容旧数据库）
  try {
    db.run("ALTER TABLE users ADD COLUMN avatar TEXT DEFAULT ''");
  } catch (e) {
    // 字段已存在，忽略
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      storage_provider TEXT DEFAULT 'inherit',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  try {
    db.run("ALTER TABLE categories ADD COLUMN storage_provider TEXT DEFAULT 'inherit'");
  } catch (e) {
    // 字段已存在，忽略
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS apis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      endpoint TEXT UNIQUE NOT NULL,
      category_id INTEGER,
      method TEXT DEFAULT 'GET',
      params TEXT,
      example TEXT,
      is_active INTEGER DEFAULT 1,
      rate_limit INTEGER DEFAULT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      cos_key TEXT,
      storage_provider TEXT DEFAULT 'cos',
      category_id INTEGER,
      api_id INTEGER,
      uploaded_by INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (api_id) REFERENCES apis(id),
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    )
  `);

  try {
    db.run("ALTER TABLE images ADD COLUMN storage_provider TEXT DEFAULT 'cos'");
  } catch (e) {
    // 字段已存在，忽略
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS api_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      api_id INTEGER,
      endpoint TEXT NOT NULL,
      ip TEXT,
      user_agent TEXT,
      status INTEGER,
      response_time INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (api_id) REFERENCES apis(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  // 插入默认设置
  const defaultSettings = [
    ['site_name', '樱道 API'],
    ['site_url', 'https://api.zxiaolin.com'],
    ['site_logo', ''],
    ['site_icp', ''],
    ['site_theme', 'nature'],
    ['storage_provider', 'cos'],
    ['rate_limit_enabled', 'true'],
    ['rate_limit_global', '100'],
    ['rate_limit_window', '3600000'],
    ['smtp_host', ''],
    ['smtp_port', '587'],
    ['smtp_user', ''],
    ['smtp_pass', ''],
    ['smtp_from', ''],
    ['smtp_secure', 'false'],
    ['hero_tagline', '图片 API 服务平台'],
    ['hero_title', '樱道 API'],
    ['hero_subtitle', '稳定、高效的图片接口服务，为你的项目提供丰富的视觉内容。\n支持多种分类，一键接入，即刻使用。'],
    ['hero_carousel_enabled', 'true'],
    ['hero_carousel_mode', 'text'],
    ['hero_carousel_interval', '6000'],
    ['hero_carousel_height', '460'],
    ['hero_carousel_overlay_opacity', '72'],
    ['hero_carousel_slides', JSON.stringify([
      {
        tagline: '图片 API 服务平台',
        title: '智晓科创图片 API',
        subtitle: '稳定、高效的图片接口服务，为你的项目提供丰富的视觉内容。\n支持多种分类，一键接入，即刻使用。',
        background: '',
      },
      {
        tagline: '灵活存储管理',
        title: '云端与本地都能从容切换',
        subtitle: '支持腾讯云 COS、本地存储，并可为不同分类单独设置存储位置。',
        background: '',
      },
      {
        tagline: '快速接入图片服务',
        title: '用一条接口点亮你的应用',
        subtitle: '获取 API Key 后即可调用随机图片接口，适合网站、机器人、应用和内容工具。',
        background: '',
      },
    ])],
    ['cta_title', '开始使用樱道 API'],
    ['cta_background_image', ''],
    ['footer_links', '[{"label":"API文档","href":"/docs"},{"label":"使用示例","href":"/example"},{"label":"图库","href":"/gallery"},{"label":"管理后台","href":"/auth/login"}]'],
    ['header_links', '[{"label":"首页","href":"/"},{"label":"图库","href":"/gallery"},{"label":"文档","href":"/docs"},{"label":"示例","href":"/example"}]'],
    ['site_favicon', '/favicon.svg'],
    ['watermark_enabled', 'false'],
  ];

  for (const [key, value] of defaultSettings) {
    db.run('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)', [key, value]);
  }
  db.run("UPDATE settings SET value = 'nature' WHERE key = 'site_theme' AND value = 'default'");

  // 插入默认分类
  const defaultCategories = [
    ['动漫', 'anime', '动漫二次元图片'],
    ['小姐姐', 'girl', '精美小姐姐图片'],
    ['风景', 'scenery', '自然风景图片'],
    ['动物', 'animal', '可爱动物图片'],
    ['美食', 'food', '美食图片'],
    ['随机', 'random', '随机图片'],
  ];

  for (const [name, slug, desc] of defaultCategories) {
    db.run('INSERT OR IGNORE INTO categories (name, slug, description) VALUES (?, ?, ?)', [name, slug, desc]);
  }

  // 创建管理员用户（如果不存在）
  const adminCheck = db.exec("SELECT * FROM users WHERE username = 'admin'");
  if (adminCheck.length === 0 || adminCheck[0].values.length === 0) {
    const adminPasswordSource = process.env.ADMIN_PASSWORD ? '环境变量 ADMIN_PASSWORD' : '系统默认密码';

    const hashedPassword = bcrypt.hashSync(defaultAdminPassword, 10);
    const apiKey = generateApiKey();
    db.run(
      'INSERT INTO users (username, password, email, api_key, is_admin, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      ['admin', hashedPassword, 'admin@zxiaolin.com', apiKey, 1, 1]
    );
    console.info(`已创建默认管理员：admin，密码来源：${adminPasswordSource}`);
  }
}

// sql.js 的同步查询 API（模拟 better-sqlite3）
function run(sql, params = []) {
  if (!db) throw new Error('Database not initialized. Call getDb() in an async context first.');
  db.run(sql, params);
  saveDb();
}

function get(sql, params = []) {
  if (!db) throw new Error('Database not initialized. Call getDb() in an async context first.');
  const stmt = db.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return undefined;
}

function all(sql, params = []) {
  if (!db) throw new Error('Database not initialized. Call getDb() in an async context first.');
  const stmt = db.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function exec(sql) {
  if (!db) throw new Error('Database not initialized. Call getDb() in an async context first.');
  db.exec(sql);
  saveDb();
}

// 懒加载代理：等待初始化完成后将调用转发给真实 db
const dbProxy = {
  get(target, prop) {
    if (prop === 'run') return run;
    if (prop === 'get') return get;
    if (prop === 'all') return all;
    if (prop === 'exec') return exec;
    if (prop === 'saveDb') return saveDb;
    return target[prop];
  }
};

// 对外 API：等待初始化后返回数据库代理（同步，兼容旧代码）
function getDb() {
  if (!initPromise) {
    initPromise = initDb();
  }
  // 返回一个 Promise 包装的代理对象
  // 旧代码需要 await 或在 .then() 中使用
  // 为了最大兼容性，同时导出 async 版本
  return initPromise.then(() => {
    // 返回一个带有同步方法的对象
    return {
      run,
      get,
      all,
      exec,
      saveDb,
      _db: db,  // 直接访问底层 Database（谨慎使用）
    };
  });
}

// 纯 async 版本（推荐使用）
async function getDbAsync() {
  if (!initPromise) {
    initPromise = initDb();
  }
  await initPromise;
  return {
    run,
    get,
    all,
    exec,
    saveDb,
    _db: db,
  };
}

// 预初始化（可在 Next.js API 路由之外调用）
async function ensureDb() {
  if (!initPromise) {
    initPromise = initDb();
  }
  await initPromise;
}

module.exports = { getDb, getDbAsync, ensureDb, generateApiKey };
