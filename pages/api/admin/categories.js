// pages/api/admin/categories.js
import { getDbAsync } from '../../../lib/db';
import { withAdminAuth } from '../../../lib/auth';

async function handler(req, res) {
  try {
    const db = await getDbAsync();

    if (req.method === 'GET') {
      const categories = db.all('SELECT * FROM categories ORDER BY id ASC');
      return res.status(200).json({ categories });
    }

    if (req.method === 'POST') {
      const { name, slug, description } = req.body;

      if (!name || !slug) {
        return res.status(400).json({ error: '分类名称name和slug必填' });
      }

      const now = new Date().toISOString();

      try {
        db.run(
          'INSERT INTO categories (name, slug, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
          [name, slug, description || null, now, now]
        );

        const lastId = db.get('SELECT last_insert_rowid() as id');
        const category = db.get('SELECT * FROM categories WHERE id = ?', [lastId.id]);
        return res.status(201).json({ message: '分类创建成功', category });
      } catch (error) {
        if (error.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'slug已存在' });
        }
        throw error;
      }
    }

    if (req.method === 'PUT') {
      const { id, name, slug, description } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'id必填' });
      }

      const now = new Date().toISOString();

      try {
        db.run(
          'UPDATE categories SET name = ?, slug = ?, description = ?, updated_at = ? WHERE id = ?',
          [name, slug, description || null, now, id]
        );

        const category = db.get('SELECT * FROM categories WHERE id = ?', [id]);
        return res.status(200).json({ message: '分类更新成功', category });
      } catch (error) {
        if (error.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'slug已存在' });
        }
        throw error;
      }
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'id必填' });
      }

      const apisUsingCategory = db.get('SELECT COUNT(*) as count FROM apis WHERE category_id = ?', [id]);
      if (apisUsingCategory && apisUsingCategory.count > 0) {
        return res.status(400).json({ error: '该分类下有API接口，无法删除' });
      }

      db.run('DELETE FROM categories WHERE id = ?', [id]);
      return res.status(200).json({ message: '分类删除成功' });
    }

    return res.status(405).json({ error: '方法不允许' });
  } catch (error) {
    console.error('Admin categories API error:', error);
    return res.status(500).json({ error: '服务器内部错误', message: error.message });
  }
}

export default withAdminAuth(handler);
