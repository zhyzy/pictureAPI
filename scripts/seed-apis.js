// 脚本：初始化API数据到数据库
// 运行方式: node scripts/seed-apis.js

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

async function seedApis() {
  const SQL = await initSqlJs();
  const dbPath = path.join(__dirname, '..', 'data', 'pictureapi.db');

  let db;
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
    console.log('已加载现有数据库');
  } else {
    db = new SQL.Database();
    console.log('创建新数据库');
  }

  // 检查现有API
  const existingApis = db.exec('SELECT COUNT(*) as count FROM apis');
  const count = existingApis[0]?.values[0][0] || 0;
  console.log('当前数据库中的API数量:', count);

  if (count === 0) {
    // 插入默认API
    const defaultApis = [
      ['随机动漫图', '获取随机高质量动漫二次元图片，支持自定义筛选', '/api/v1/random/anime', 1, 'GET', '{}', 'https://api.zxiaolin.com/api/v1/random/anime', 1, 100],
      ['随机小姐姐图', '获取随机精美小姐姐图片，支持自定义筛选', '/api/v1/random/girl', 2, 'GET', '{}', 'https://api.zxiaolin.com/api/v1/random/girl', 1, 100],
      ['随机风景图', '获取随机自然风景图片，支持自定义筛选', '/api/v1/random/scenery', 3, 'GET', '{}', 'https://api.zxiaolin.com/api/v1/random/scenery', 1, 100],
      ['随机动物图', '获取随机可爱动物图片，支持自定义筛选', '/api/v1/random/animal', 4, 'GET', '{}', 'https://api.zxiaolin.com/api/v1/random/animal', 1, 100],
      ['随机美食图', '获取随机美食图片，支持自定义筛选', '/api/v1/random/food', 5, 'GET', '{}', 'https://api.zxiaolin.com/api/v1/random/food', 1, 100],
      ['随机图片', '获取随机图片，支持所有分类', '/api/v1/random/random', 6, 'GET', '{}', 'https://api.zxiaolin.com/api/v1/random/random', 1, 100],
    ];

    for (const api of defaultApis) {
      db.run(
        'INSERT OR IGNORE INTO apis (name, description, endpoint, category_id, method, params, example, is_active, rate_limit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        api
      );
    }

    // 保存
    fs.writeFileSync(dbPath, Buffer.from(db.export()));
    console.log('已插入6个API到数据库');
  } else {
    console.log('数据库已有数据，跳过插入');
  }

  // 验证
  const verifyApis = db.exec('SELECT id, name, endpoint, is_active FROM apis');
  console.log('\n数据库中的API列表:');
  verifyApis[0]?.values.forEach(row => {
    console.log('  ID:', row[0], '| 名称:', row[1], '| 端点:', row[2], '| 启用:', row[3] === 1 ? '是' : '否');
  });

  db.close();
  console.log('\n完成！请重启 Next.js 服务以使更改生效。');
}

seedApis().catch(console.error);
