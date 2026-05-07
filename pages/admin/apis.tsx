import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';

interface Api {
  id: number;
  name: string;
  description: string;
  endpoint: string;
  category_id: number;
  category_name: string;
  method: string;
  is_active: number;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function ApisPage() {
  const [apis, setApis] = useState<Api[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingApi, setEditingApi] = useState<Api | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    endpoint: '',
    category_id: '',
    method: 'GET',
    is_active: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchApis();
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
    }
  };

  const fetchApis = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/apis', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setApis(data.apis);
      }
    } catch (error) {
      console.error('获取API失败:', error);
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
      const method = editingApi ? 'PUT' : 'POST';

      const res = await fetch('/api/admin/apis', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          category_id: formData.category_id ? parseInt(formData.category_id) : null,
          is_active: formData.is_active ? 1 : 0,
          id: editingApi?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '操作失败');

      setSuccess(editingApi ? 'API更新成功' : 'API创建成功');
      setShowModal(false);
      setEditingApi(null);
      resetForm();
      fetchApis();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (api: Api) => {
    setEditingApi(api);
    setFormData({
      name: api.name,
      description: api.description || '',
      endpoint: api.endpoint,
      category_id: api.category_id?.toString() || '',
      method: api.method,
      is_active: api.is_active === 1,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个API吗？')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/apis', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '删除失败');

      setSuccess('API删除成功');
      fetchApis();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleActive = async (api: Api) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/apis', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: api.id,
          name: api.name,
          description: api.description,
          endpoint: api.endpoint,
          category_id: api.category_id,
          method: api.method,
          is_active: api.is_active === 1 ? 0 : 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '更新失败');

      setSuccess(`API${api.is_active === 1 ? '禁用' : '启用'}成功`);
      fetchApis();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      endpoint: '',
      category_id: '',
      method: 'GET',
      is_active: true,
    });
  };

  const openCreateModal = () => {
    setEditingApi(null);
    resetForm();
    setShowModal(true);
  };

  return (
    <AdminLayout title="API管理">
      {error && <div className="mb-4 p-3 bg-error-light text-error-DEFAULT rounded-md text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-success-light text-success-DEFAULT rounded-md text-sm">{success}</div>}

      {/* 工具栏 */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-[var(--color-text-tertiary)]">
          共 {apis.length} 个接口
        </p>
        <button onClick={openCreateModal} className="btn-primary text-sm">
          新增API
        </button>
      </div>

      {/* API列表 */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="p-8 text-center text-[var(--color-text-tertiary)]">加载中...</div>
        ) : apis.length === 0 ? (
          <div className="p-8 text-center text-[var(--color-text-tertiary)]">暂无API接口</div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-[var(--color-bg-subtle)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase">API名称</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase">端点</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase">分类</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase">方法</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase">状态</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[var(--color-text-tertiary)] uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {apis.map((api) => (
                <tr key={api.id} className="hover:bg-[var(--color-bg-subtle)] transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-[var(--color-text)]">{api.name}</div>
                    <div className="text-xs text-[var(--color-text-tertiary)]">{api.description || '-'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-[var(--color-bg-subtle)] px-2 py-0.5 rounded">{api.endpoint}</code>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{api.category_name || '-'}</td>
                  <td className="px-4 py-3">
                    <span className="badge badge-primary">{api.method}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(api)}
                      className={`text-xs px-2 py-1 rounded-md transition-colors ${
                        api.is_active === 1
                          ? 'bg-success-light text-success-DEFAULT'
                          : 'bg-error-light text-error-DEFAULT'
                      }`}
                    >
                      {api.is_active === 1 ? '启用' : '禁用'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <button onClick={() => handleEdit(api)} className="text-[var(--color-primary)] hover:underline mr-3">
                      编辑
                    </button>
                    <button onClick={() => handleDelete(api.id)} className="text-error-DEFAULT hover:underline">
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
            <div className="bg-[var(--color-bg-elevated)] rounded-lg shadow-lift p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-[var(--color-border)]">
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">
                {editingApi ? '编辑API' : '新增API'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">API名称 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="例如：随机动漫图"
                    required
                  />
                </div>
                <div>
                  <label className="label">端点 *</label>
                  <input
                    type="text"
                    value={formData.endpoint}
                    onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                    className="input"
                    placeholder="例如：/api/v1/random/anime"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">分类</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="input"
                    >
                      <option value="">请选择</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">请求方法</label>
                    <select
                      value={formData.method}
                      onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                      className="input"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">描述</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input"
                    placeholder="API描述（可选）"
                    rows={3}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)]"
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm text-[var(--color-text-secondary)]">
                    启用此API
                  </label>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary text-sm">
                    取消
                  </button>
                  <button type="submit" className="btn-primary text-sm">
                    {editingApi ? '保存' : '创建'}
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
