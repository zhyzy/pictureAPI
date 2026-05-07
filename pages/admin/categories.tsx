import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  created_at: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/categories', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('获取分类失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch('/api/admin/categories', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(
          editingCategory ? { ...formData, id: editingCategory.id } : formData
        ),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '操作失败');
      }

      setSuccess(editingCategory ? '分类更新成功' : '分类创建成功');
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: '', slug: '', description: '' });
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, slug: category.slug, description: category.description || '' });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个分类吗？')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/categories', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '删除失败');
      }

      setSuccess('分类删除成功');
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '' });
    setShowModal(true);
  };

  return (
    <AdminLayout title="分类管理">
      {/* 提示 */}
      {error && (
        <div className="mb-4 p-3 bg-error-light text-error-DEFAULT rounded-md text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-success-light text-success-DEFAULT rounded-md text-sm">
          {success}
        </div>
      )}

      {/* 工具栏 */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-[var(--color-text-tertiary)]">
          共 {categories.length} 个分类
        </p>
        <button onClick={openCreateModal} className="btn-primary text-sm">
          新增分类
        </button>
      </div>

      {/* 表格 */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="p-8 text-center text-[var(--color-text-tertiary)]">加载中...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-[var(--color-text-tertiary)]">暂无分类</div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-[var(--color-bg-subtle)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase">名称</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase">描述</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[var(--color-text-tertiary)] uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-[var(--color-bg-subtle)] transition-colors">
                  <td className="px-4 py-3 text-sm text-[var(--color-text-tertiary)]">{category.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-[var(--color-text)]">{category.name}</td>
                  <td className="px-4 py-3 text-sm">
                    <code className="text-xs bg-[var(--color-bg-subtle)] px-2 py-0.5 rounded">{category.slug}</code>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{category.description || '-'}</td>
                  <td className="px-4 py-3 text-right text-sm">
                    <button onClick={() => handleEdit(category)} className="text-[var(--color-primary)] hover:underline mr-3">
                      编辑
                    </button>
                    <button onClick={() => handleDelete(category.id)} className="text-error-DEFAULT hover:underline">
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 弹窗 */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--color-bg-elevated)] rounded-lg shadow-lift p-6 w-full max-w-md border border-[var(--color-border)]">
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">
                {editingCategory ? '编辑分类' : '新增分类'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">分类名称 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="例如：动漫"
                    required
                  />
                </div>
                <div>
                  <label className="label">Slug *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="input"
                    placeholder="例如：anime"
                    required
                  />
                  <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">用于URL，建议使用英文小写</p>
                </div>
                <div>
                  <label className="label">描述</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input"
                    placeholder="分类描述（可选）"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary text-sm">
                    取消
                  </button>
                  <button type="submit" className="btn-primary text-sm">
                    {editingCategory ? '保存' : '创建'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
