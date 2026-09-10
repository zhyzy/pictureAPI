import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';

interface UpdateStatus {
  currentVersion: string;
  latestVersion: string;
  latestName: string;
  latestBody: string;
  latestUrl: string;
  repo: string;
  branch: string;
  updateEnabled: boolean;
  restartConfigured: boolean;
  isGitCheckout: boolean;
  updateSource: 'release' | 'tag' | 'branch';
  hasUpdate: boolean;
  isLatest: boolean;
  releaseError?: string;
}

interface ApplyResult {
  success: boolean;
  message: string;
  code?: string;
  output?: string;
  steps?: string[];
}

export default function AdminUpdatePage() {
  const [status, setStatus] = useState<UpdateStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ApplyResult | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/update/check', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || '检测更新失败');
      }

      setStatus(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '检测更新失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const applyUpdate = async () => {
    if (!status || updating) return;

    const confirmed = window.confirm('更新前系统会备份数据库和运行时文件，然后拉取 GitHub 最新代码并重新构建。确认执行吗？');
    if (!confirmed) return;

    setUpdating(true);
    setResult(null);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/update/apply', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setResult(data);

      if (!res.ok) {
        setError(data.message || data.error || '执行更新失败');
      } else {
        await fetchStatus();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '执行更新失败');
    } finally {
      setUpdating(false);
    }
  };

  const canApply = Boolean(status?.hasUpdate && status?.updateEnabled && status?.isGitCheckout);

  return (
    <AdminLayout title="系统更新">
      <div className="max-w-4xl space-y-6">
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)]">版本检测</h2>
              <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
                优先读取 GitHub Release，其次读取版本标签，最后回退到指定分支 package.json。
              </p>
            </div>
            <button onClick={fetchStatus} disabled={loading || updating} className="btn-secondary">
              {loading ? '检测中...' : '重新检测'}
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-error-DEFAULT/30 bg-error-light/20 p-3 text-sm text-error-DEFAULT">
              {error}
            </div>
          )}

          {status ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4">
                <p className="text-xs text-[var(--color-text-tertiary)] mb-1">当前版本</p>
                <p className="text-2xl font-serif font-bold text-[var(--color-text)]">v{status.currentVersion}</p>
              </div>
              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4">
                <p className="text-xs text-[var(--color-text-tertiary)] mb-1">最新版本</p>
                <p className="text-2xl font-serif font-bold text-[var(--color-primary)]">v{status.latestVersion}</p>
              </div>
              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4">
                <p className="text-xs text-[var(--color-text-tertiary)] mb-1">更新源</p>
                <p className="text-sm text-[var(--color-text)]">{status.repo} / {status.branch}</p>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                  {status.updateSource === 'release' ? 'GitHub Release' : status.updateSource === 'tag' ? 'GitHub Tag' : '分支 package.json'}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4">
                <p className="text-xs text-[var(--color-text-tertiary)] mb-1">运行条件</p>
                <p className="text-sm text-[var(--color-text)]">
                  {status.isGitCheckout ? 'Git 仓库部署' : '非 Git 部署'}
                </p>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                  {status.updateEnabled ? '已允许后台执行更新' : '未开启后台执行更新'}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-[var(--color-text-tertiary)]">
              {loading ? '正在检测版本...' : '暂无版本信息'}
            </div>
          )}
        </div>

        {status && (
          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-text)]">
                  {status.hasUpdate ? '发现新版本' : '当前已是最新版本'}
                </h2>
                <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
                  {status.hasUpdate
                    ? `可以从 v${status.currentVersion} 更新到 v${status.latestVersion}。`
                    : `当前 v${status.currentVersion} 与远端版本一致。`}
                </p>
              </div>
              <button
                onClick={applyUpdate}
                disabled={!canApply || updating}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? '更新中...' : '一键更新'}
              </button>
            </div>

            {!status.updateEnabled && (
              <div className="mt-4 rounded-md border border-warning-DEFAULT/30 bg-warning-light/20 p-3 text-sm text-[var(--color-text-secondary)]">
                为了生产安全，执行更新需要在环境变量中设置 <code>PICTURE_API_UPDATE_ENABLED=true</code>。
              </div>
            )}

            {!status.isGitCheckout && (
              <div className="mt-4 rounded-md border border-warning-DEFAULT/30 bg-warning-light/20 p-3 text-sm text-[var(--color-text-secondary)]">
                当前目录不是 Git 仓库。请用 <code>git clone https://github.com/{status.repo}.git</code> 部署项目后再使用一键更新。
              </div>
            )}

            {status.latestBody && (
              <div className="mt-5">
                <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">版本说明</p>
                <pre className="whitespace-pre-wrap rounded-md bg-[var(--color-bg-subtle)] p-4 text-sm text-[var(--color-text-secondary)]">{status.latestBody}</pre>
              </div>
            )}

            <a
              href={status.latestUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-sm text-[var(--color-primary)] hover:underline"
            >
              查看 GitHub 更新源
            </a>
          </div>
        )}

        {result && (
          <div className="card">
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">执行结果</h2>
            <p className={`text-sm mb-4 ${result.success ? 'text-success-DEFAULT' : 'text-error-DEFAULT'}`}>
              {result.message}
            </p>
            {result.steps && result.steps.length > 0 && (
              <ol className="list-decimal pl-5 space-y-2 text-sm text-[var(--color-text-secondary)]">
                {result.steps.map((step, index) => (
                  <li key={index} className="whitespace-pre-wrap">{step}</li>
                ))}
              </ol>
            )}
            {result.output && (
              <pre className="mt-4 max-h-72 overflow-auto rounded-md bg-[var(--color-bg-subtle)] p-4 text-xs text-[var(--color-text-secondary)]">
                {result.output}
              </pre>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
