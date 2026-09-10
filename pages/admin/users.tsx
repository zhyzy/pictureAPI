import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';

interface User {
  id: number;
  username: string;
  email: string;
  api_key: string;
  is_admin: number;
  is_active: number;
  rate_limit: number | null;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ username: '', password: '', email: '', is_admin: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = `/api/admin/users?page=${pagination.page}&limit=${pagination.limit}`;
      if (search) url += `&search=${search}`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('获取用户失败:', error);
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
      const method = editingUser ? 'PUT' : 'POST';

      const res = await fetch('/api/admin/users', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(
          editingUser
            ? { ...formData, id: editingUser.id, is_admin: formData.is_admin ? 1 : 0 }
            : { ...formData, is_admin: formData.is_admin ? 1 : 0 }
        ),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || '操作失败');

      setSuccess(editingUser ? '用户更新成功' : '用户创建成功');
      setShowModal(false);
      setEditingUser(null);
      setFormData({ username: '', password: '', email: '', is_admin: false });
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      email: user.email || '',
      is_admin: user.is_admin === 1,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个用户吗？')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '删除失败');

      setSuccess('用户删除成功');
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: user.id,
          is_active: user.is_active === 1 ? 0 : 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '更新失败');

      setSuccess(`用户${user.is_active === 1 ? '禁用' : '启用'}成功`);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ username: '', password: '', email: '', is_admin: false });
    setShowModal(true);
  };

  return (
    <AdminLayout title="用户管理">
      {error && <div className="mb-4 p-3 bg-error-light text-error-DEFAULT rounded-md text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-success-light text-success-DEFAULT rounded-md text-sm">{success}</div>}

      {/* 工具栏 */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="搜索用户名或邮箱..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPagination({ ...pagination, page: 1 }); }}
            className="input max-w-xs"
          />
          <span className="text-sm text-[var(--color-text-tertiary)]">
            共 {pagination.total} 个用户
          </span>
        </div>
        <button onClick={openCreateModal} className="btn-primary text-sm">
          新增用户
        </button>
      </div>

      {/* 表格 */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="p-8 text-center text-[var(--color-text-tertiary)]">加载中...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-[var(--color-text-tertiary)]">暂无用户</div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-[var(--color-bg-subtle)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase">用户名</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase">邮箱</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase">角色</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase">状态</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[var(--color-text-tertiary)] uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[var(--color-bg-subtle)] transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-[var(--color-text)]">{user.username}</td>
                  <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{user.email || '-'}</td>
                  <td className="px-4 py-3">
                    {user.is_admin === 1 ? (
                      <span className="badge badge-primary">管理员</span>
                    ) : (
                      <span className="badge">普通用户</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(user)}
                      className={`text-xs px-2 py-1 rounded-md transition-colors ${
                        user.is_active === 1
                          ? 'bg-success-light text-success-DEFAULT'
                          : 'bg-error-light text-error-DEFAULT'
                      }`}
                    >
                      {user.is_active === 1 ? '正常' : '禁用'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <button onClick={() => handleEdit(user)} className="text-[var(--color-primary)] hover:underline mr-3">
                      编辑
                    </button>
                    <button onClick={() => handleDelete(user.id)} className="text-error-DEFAULT hover:underline">
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 分页 */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-2">
          <button
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            disabled={pagination.page === 1}
            className="px-3 py-1.5 text-sm bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-md disabled:opacity-50 hover:bg-[var(--color-bg-subtle)] transition-colors"
          >
            上一页
          </button>
          <span className="text-sm text-[var(--color-text-secondary)]">
            第 {pagination.page} / {pagination.totalPages} 页
          </span>
          <button
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            disabled={pagination.page === pagination.totalPages}
            className="px-3 py-1.5 text-sm bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-md disabled:opacity-50 hover:bg-[var(--color-bg-subtle)] transition-colors"
          >
            下一页
          </button>
        </div>
      )}

      {/* 弹窗 */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--color-bg-elevated)] rounded-lg shadow-lift p-6 w-full max-w-md border border-[var(--color-border)]">
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">
                {editingUser ? '编辑用户' : '新增用户'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">用户名 *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">邮箱</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">密码 {editingUser && '(留空则不修改)'}</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input"
                    required={!editingUser}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_admin"
                    checked={formData.is_admin}
                    onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
                    className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)]"
                  />
                  <label htmlFor="is_admin" className="ml-2 text-sm text-[var(--color-text-secondary)]">
                    设为管理员
                  </label>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary text-sm">
                    取消
                  </button>
                  <button type="submit" className="btn-primary text-sm">
                    {editingUser ? '保存' : '创建'}
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
