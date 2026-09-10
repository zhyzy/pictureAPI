// SQLite 数据库 - better-sqlite3（原生 SQLite，增量写盘 + WAL 日志模式）
// 相比早期 sql.js（内存库整库导出落盘）：
//   1. 写入直接落盘，进程崩溃不丢已提交数据，也不再需要防抖全量保存
//   2. WAL 模式下读写不互斥，性能与库体积解耦
//   3. data/pictureapi.db 就是标准 SQLite 文件，与旧 sql.js 库文件直接兼容，无需迁移
// 注意：SQLite 文件库，进程只能单实例运行（禁止多副本/集群），否则互相覆盖
const Database = require('better-sqlite3');
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
const backupDir = path.join(process.cwd(), 'data', 'backups');
const BACKUP_KEEP = 7; // 每日备份保留份数

// 数据库实例挂到 globalThis：Next dev 会把 lib 复制进多个路由的模块图，
// 模块级变量会各自建立连接导致状态不一致，必须全局单例
const DB_GLOBAL = (globalThis.__zlDbInstance = globalThis.__zlDbInstance || {
  db: null,
  initPromise: null,
});

// 初始化数据库（进程内只执行一次）
function initDb() {
  if (DB_GLOBAL.initPromise) return DB_GLOBAL.initPromise;

  DB_GLOBAL.initPromise = (async () => {
    if (DB_GLOBAL.db) return;

    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // 直接打开库文件；旧 sql.js 创建的库就是标准 SQLite 格式，可无缝读取
    const db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    // WAL + NORMAL：应用崩溃不丢已提交事务，仅在断电时可能丢最后一个事务，性能最佳
    db.pragma('synchronous = NORMAL');
    DB_GLOBAL.db = db;

    createTables();
    pruneOldApiLogs();

    // 启动时做一次当天备份（幂等，当天已有则跳过）
    backupDb();

    // 每小时清理一次过期调用日志（全局只注册一次）
    if (!globalThis.__zlDbPruneTimer) {
      globalThis.__zlDbPruneTimer = setInterval(() => {
        try {
          pruneOldApiLogs();
        } catch (e) {
          console.error('清理调用日志失败:', e);
        }
      }, 60 * 60 * 1000);
      globalThis.__zlDbPruneTimer.unref?.();
    }

    // 每天自动备份一次（全局只注册一次）
    if (!globalThis.__zlDbBackupTimer) {
      globalThis.__zlDbBackupTimer = setInterval(
        () => {
          try {
            backupDb();
          } catch (e) {
            console.error('数据库备份失败:', e);
          }
        },
        24 * 60 * 60 * 1000
      );
      globalThis.__zlDbBackupTimer.unref?.();
    }
  })();

  return DB_GLOBAL.initPromise;
}

// 调用日志保留天数
const API_LOG_RETENTION_DAYS = 30;

// 清理过期调用日志，删除行数累加进补偿计数器，保证"累计调用"统计口径不因清理而缩水
function pruneOldApiLogs() {
  if (!DB_GLOBAL.db) return;
  const cutoff = new Date(Date.now() - API_LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  // datetime() 同时兼容 ISO 与 CURRENT_TIMESTAMP 两种时间格式；格式异常的行保守跳过
  const info = DB_GLOBAL.db
    .prepare('DELETE FROM api_logs WHERE datetime(created_at) IS NOT NULL AND datetime(created_at) < datetime(?)')
    .run(cutoff);
  const pruned = info.changes;
  if (pruned > 0) {
    const existing = get("SELECT value FROM settings WHERE key = 'api_logs_pruned_total'");
    const prev = existing ? parseInt(existing.value, 10) || 0 : 0;
    run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', ['api_logs_pruned_total', String(prev + pruned)]);
    console.info(`已清理 ${pruned} 条过期调用日志（累计补偿：${prev + pruned}）`);
  }
}

// 每日备份：在线备份到 data/backups/，保留最近 BACKUP_KEEP 份，当天已有则跳过
function backupDb() {
  if (!DB_GLOBAL.db) return;
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  const day = new Date().toISOString().slice(0, 10);
  const dest = path.join(backupDir, `pictureapi-${day}.db`);
  if (fs.existsSync(dest)) return;
  DB_GLOBAL.db
    .backup(dest)
    .then(() => {
      const files = fs
        .readdirSync(backupDir)
        .filter((f) => /^pictureapi-\d{4}-\d{2}-\d{2}\.db$/.test(f))
        .sort();
      while (files.length > BACKUP_KEEP) {
        fs.unlinkSync(path.join(backupDir, files.shift()));
      }
    })
    .catch((e) => console.error('数据库备份失败:', e));
}

// WAL 模式下写入已实时落盘；保留此函数做兼容，主动触发一次 checkpoint 收缩 WAL 文件
function saveDb() {
  if (!DB_GLOBAL.db) return;
  try {
    DB_GLOBAL.db.pragma('wal_checkpoint(TRUNCATE)');
  } catch (e) {
    console.error('数据库 checkpoint 失败:', e);
  }
}

function createTables() {
  run(`
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
    run("ALTER TABLE users ADD COLUMN avatar TEXT DEFAULT ''");
  } catch (e) {
    // 字段已存在，忽略
  }

  run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      type TEXT DEFAULT 'image',
      storage_provider TEXT DEFAULT 'inherit',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  try {
    run("ALTER TABLE categories ADD COLUMN type TEXT DEFAULT 'image'");
  } catch (e) {
    // 字段已存在，忽略
  }

  try {
    run("ALTER TABLE categories ADD COLUMN storage_provider TEXT DEFAULT 'inherit'");
  } catch (e) {
    // 字段已存在，忽略
  }

  run(`
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

  run(`
    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      cos_key TEXT,
      storage_provider TEXT DEFAULT 'cos',
      media_type TEXT DEFAULT 'image',
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
    run("ALTER TABLE images ADD COLUMN storage_provider TEXT DEFAULT 'cos'");
  } catch (e) {
    // 字段已存在，忽略
  }

  try {
    run("ALTER TABLE images ADD COLUMN media_type TEXT DEFAULT 'image'");
  } catch (e) {
    // 字段已存在，忽略
  }

  run(`
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

  // 限流/统计按 user_id + 时间窗口查询
  run('CREATE INDEX IF NOT EXISTS idx_api_logs_user_created ON api_logs(user_id, created_at)');
  run('CREATE INDEX IF NOT EXISTS idx_api_logs_created ON api_logs(created_at)');

  run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  // 插入默认设置
  const defaultSettings = [
    ['site_name', 'ZL-综合API'],
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
    ['hero_title', 'ZL-综合API'],
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
    ['cta_title', '开始使用ZL-综合API'],
    ['cta_background_image', ''],
    ['footer_links', '[{"label":"API文档","href":"/docs"},{"label":"使用示例","href":"/example"},{"label":"图库","href":"/gallery"},{"label":"管理后台","href":"/auth/login"}]'],
    ['header_links', '[{"label":"首页","href":"/"},{"label":"图库","href":"/gallery"},{"label":"文档","href":"/docs"},{"label":"示例","href":"/example"}]'],
    ['site_favicon', '/favicon.svg'],
    ['watermark_enabled', 'false'],
    ['watermark_text', 'zhihuiyun.work'],
    ['watermark_position', 'bottom-right'],
    ['watermark_font_size', '1.7'],
    ['watermark_opacity', '8'],
    ['watermark_color', '#ffffff'],
  ];

  for (const [key, value] of defaultSettings) {
    run('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)', [key, value]);
  }
  run("UPDATE settings SET value = 'nature' WHERE key = 'site_theme' AND value = 'default'");

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
    run('INSERT OR IGNORE INTO categories (name, slug, description) VALUES (?, ?, ?)', [name, slug, desc]);
  }

  // 创建管理员用户（如果不存在）
  const admin = get("SELECT id FROM users WHERE username = 'admin'");
  if (!admin) {
    const adminPasswordSource = process.env.ADMIN_PASSWORD ? '环境变量 ADMIN_PASSWORD' : '系统默认密码';

    const hashedPassword = bcrypt.hashSync(defaultAdminPassword, 10);
    const apiKey = generateApiKey();
    run('INSERT INTO users (username, password, email, api_key, is_admin, is_active) VALUES (?, ?, ?, ?, ?, ?)', [
      'admin',
      hashedPassword,
      'admin@zxiaolin.com',
      apiKey,
      1,
      1,
    ]);
    console.info(`已创建默认管理员：admin，密码来源：${adminPasswordSource}`);
  }
}

// 事务控制语句不能走预编译参数绑定，路由到 exec
const TRANSACTION_PREFIX = /^(BEGIN|COMMIT|END|ROLLBACK|SAVEPOINT|RELEASE)\b/i;

// 查询 API（与旧 sql.js 包装层同签名，调用方无需改动）
function run(sql, params = []) {
  if (!DB_GLOBAL.db) throw new Error('Database not initialized. Call getDb() in an async context first.');
  const trimmed = String(sql).trim();
  if (params.length === 0 && TRANSACTION_PREFIX.test(trimmed)) {
    DB_GLOBAL.db.exec(trimmed);
    return;
  }
  return DB_GLOBAL.db.prepare(sql).run(...params);
}

function get(sql, params = []) {
  if (!DB_GLOBAL.db) throw new Error('Database not initialized. Call getDb() in an async context first.');
  return DB_GLOBAL.db.prepare(sql).get(...params);
}

function all(sql, params = []) {
  if (!DB_GLOBAL.db) throw new Error('Database not initialized. Call getDb() in an async context first.');
  return DB_GLOBAL.db.prepare(sql).all(...params);
}

function exec(sql) {
  if (!DB_GLOBAL.db) throw new Error('Database not initialized. Call getDb() in an async context first.');
  DB_GLOBAL.db.exec(sql);
}

// 对外 API：等待初始化后返回数据库对象（同步，兼容旧代码）
function getDb() {
  if (!DB_GLOBAL.initPromise) {
    DB_GLOBAL.initPromise = initDb();
  }
  return DB_GLOBAL.initPromise.then(() => {
    return {
      run,
      get,
      all,
      exec,
      saveDb,
      _db: DB_GLOBAL.db,
    };
  });
}

// 纯 async 版本（推荐使用）
async function getDbAsync() {
  if (!DB_GLOBAL.initPromise) {
    DB_GLOBAL.initPromise = initDb();
  }
  await DB_GLOBAL.initPromise;
  return {
    run,
    get,
    all,
    exec,
    saveDb,
    _db: DB_GLOBAL.db,
  };
}

// 预初始化（可在 Next.js API 路由之外调用）
async function ensureDb() {
  if (!DB_GLOBAL.initPromise) {
    DB_GLOBAL.initPromise = initDb();
  }
  await DB_GLOBAL.initPromise;
}

module.exports = { getDb, getDbAsync, ensureDb, generateApiKey, getTotalApiCalls };

// 全站累计调用次数 = 表内现存行数 + 已清理补偿计数（口径不随日志清理缩水）
// store: 传入模块导出的 get 方法
function getTotalApiCalls(store) {
  const result = store.get('SELECT COUNT(*) as count FROM api_logs');
  const pruned = store.get("SELECT value FROM settings WHERE key = 'api_logs_pruned_total'");
  return (result ? result.count : 0) + (pruned ? (parseInt(pruned.value, 10) || 0) : 0);
}
