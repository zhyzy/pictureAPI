/**
 * 图片批量导入脚本
 *
 * 把手动传到服务器的图片批量登记进数据库，使随机图片 API 可以返回它们。
 *
 * 用法：
 *   node scripts/import-images.js [图片目录] [--category=分类slug]
 *
 * 规则：
 *   - 目录下有子文件夹时：每个子文件夹名 = 分类 slug，图片归入对应分类
 *   - 目录下是散图时：全部归入 --category 指定的分类（未指定则不分类）
 *   - 支持格式：jpg / jpeg / png / gif / webp / avif / bmp
 *   - 按 cos_key 去重，重复执行不会产生重复记录
 *
 * 示例：
 *   node scripts/import-images.js                                  # 扫描 public/uploads/images/
 *   node scripts/import-images.js /data/my-pics --category=scenery # 散图导入 scenery 分类
 */

const fs = require('fs');
const path = require('path');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.bmp']);
const DEFAULT_DIR = path.join(process.cwd(), 'public', 'uploads', 'images');

async function main() {
  const args = process.argv.slice(2);
  const categoryArg = (args.find((a) => a.startsWith('--category=')) || '').split('=')[1] || '';
  const dirArg = args.find((a) => !a.startsWith('--')) || DEFAULT_DIR;
  const scanDir = path.resolve(dirArg);

  if (!fs.existsSync(scanDir)) {
    console.error(`目录不存在: ${scanDir}`);
    process.exit(1);
  }

  const { getDbAsync } = require(path.join(process.cwd(), 'lib', 'db'));
  const db = await getDbAsync();

  // 分辨子文件夹与散图
  const entries = fs.readdirSync(scanDir, { withFileTypes: true });
  const subDirs = entries.filter((e) => e.isDirectory());
  const rootFiles = entries.filter(
    (e) => e.isFile() && IMAGE_EXTENSIONS.has(path.extname(e.name).toLowerCase())
  );

  let total = 0;
  let skipped = 0;

  const importFile = (relativeKey, categoryId) => {
    // 去重：同一路径已登记则跳过
    const existed = db.get('SELECT id FROM images WHERE cos_key = ?', [relativeKey]);
    if (existed) {
      skipped += 1;
      return;
    }
    const url = `/uploads/${relativeKey.split(path.sep).join('/')}`
      .split('/')
      .map((seg, i) => (i === 0 ? seg : encodeURIComponent(seg)))
      .join('/');
    db.run(
      `INSERT INTO images (url, cos_key, storage_provider, category_id, api_id, uploaded_by, created_at)
       VALUES (?, ?, 'local', ?, NULL, NULL, ?)`,
      [url, relativeKey.split(path.sep).join('/'), categoryId, new Date().toISOString()]
    );
    total += 1;
  };

  const getOrCreateCategory = (slug) => {
    const existing = db.get('SELECT id FROM categories WHERE slug = ?', [slug]);
    if (existing) return existing.id;
    db.run(
      `INSERT INTO categories (name, slug, description, storage_provider, created_at, updated_at)
       VALUES (?, ?, '', 'inherit', ?, ?)`,
      [slug, slug, new Date().toISOString(), new Date().toISOString()]
    );
    const created = db.get('SELECT id FROM categories WHERE slug = ?', [slug]);
    console.log(`  新建分类: ${slug} (id=${created.id})`);
    return created.id;
  };

  // ① 子文件夹模式：文件夹名 = 分类 slug
  for (const sub of subDirs) {
    const categoryId = getOrCreateCategory(sub.name);
    const walk = (current, relParts) => {
      for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
        const abs = path.join(current, entry.name);
        if (entry.isDirectory()) {
          walk(abs, [...relParts, entry.name]);
        } else if (IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
          importFile(path.join('images', ...relParts, entry.name), categoryId);
        }
      }
    };
    walk(path.join(scanDir, sub.name), [sub.name]);
  }

  // ② 散图模式：全部归入 --category（或不分类）
  if (rootFiles.length > 0) {
    const categoryId = categoryArg ? getOrCreateCategory(categoryArg) : null;
    for (const file of rootFiles) {
      importFile(path.join('images', file.name), categoryId);
    }
  }

  console.log(`\n导入完成：新增 ${total} 条记录，跳过 ${skipped} 条（已存在）`);
  console.log('提示：若之前是 COS 存储模式，请到 管理后台 → 系统设置 把存储模式切换为「本地存储」');
  process.exit(0);
}

main().catch((e) => {
  console.error('导入失败:', e);
  process.exit(1);
});
