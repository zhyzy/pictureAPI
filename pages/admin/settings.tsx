import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';

interface Settings {
  site_name: string;
  site_url: string;
  site_logo: string;
  site_favicon: string;
  site_icp: string;
  footer_links: string;
  header_links: string;
  rate_limit_enabled: string;
  rate_limit_global: string;
  rate_limit_window: string;
  smtp_host: string;
  smtp_port: string;
  smtp_user: string;
  smtp_pass: string;
  smtp_from: string;
  smtp_secure: string;
  hero_tagline: string;
  hero_title: string;
  hero_subtitle: string;
  cta_title: string;
  watermark_enabled: string;
  site_theme: string;
}

// 主题列表定义
const THEMES = [
  {
    id: 'default',
    name: '日式极简',
    desc: '暖赭红 · 和风书卷',
    bg: '#faf9f7',
    primary: '#c75b39',
    text: '#262421',
    border: '#e8e4dd',
    accent: '#f9e8e0',
    dark: false,
    tags: ['浅色', '经典'],
  },
  {
    id: 'minimal',
    name: '纯粹极简',
    desc: '纯黑白 · 留白美学',
    bg: '#ffffff',
    primary: '#000000',
    text: '#000000',
    border: '#eeeeee',
    accent: '#f5f5f5',
    dark: false,
    tags: ['浅色', '极简'],
  },
  {
    id: 'tech',
    name: '科技感',
    desc: '深色代码感 · 科技蓝',
    bg: '#0d1117',
    primary: '#58a6ff',
    text: '#e6edf3',
    border: '#30363d',
    accent: '#1c2128',
    dark: true,
    tags: ['深色', '科技'],
  },
  {
    id: 'anime',
    name: '二次元',
    desc: '樱花粉 · 萌系可爱',
    bg: '#fff5f7',
    primary: '#ff6b9d',
    text: '#4a4a4a',
    border: '#ffd1dc',
    accent: '#ffe4ec',
    dark: false,
    tags: ['浅色', '可爱'],
  },
  {
    id: 'cyberpunk',
    name: '赛博朋克',
    desc: '霓虹紫 · 暗夜未来',
    bg: '#0a0a0f',
    primary: '#b026ff',
    text: '#e0e0ff',
    border: '#2a2a3e',
    accent: '#1a0a2e',
    dark: true,
    tags: ['深色', '酷炫'],
  },
  {
    id: 'ocean',
    name: '海洋蓝',
    desc: '清透蓝 · 海天一色',
    bg: '#f0f9ff',
    primary: '#0284c7',
    text: '#0c4a6e',
    border: '#bae6fd',
    accent: '#e0f2fe',
    dark: false,
    tags: ['浅色', '清爽'],
  },
  {
    id: 'nature',
    name: '自然绿',
    desc: '有机绿 · 森林生机',
    bg: '#f0fdf4',
    primary: '#16a34a',
    text: '#14532d',
    border: '#bbf7d0',
    accent: '#dcfce7',
    dark: false,
    tags: ['浅色', '自然'],
  },
  {
    id: 'retro',
    name: '复古怀旧',
    desc: '牛皮纸 · 像素美学',
    bg: '#faf3e0',
    primary: '#c17817',
    text: '#5c4033',
    border: '#d4c5a9',
    accent: '#f5e6c8',
    dark: false,
    tags: ['浅色', '复古'],
  },
  {
    id: 'business',
    name: '商务专业',
    desc: '深沉蓝 · 稳重信赖',
    bg: '#f8fafc',
    primary: '#1e40af',
    text: '#1e293b',
    border: '#e2e8f0',
    accent: '#eff6ff',
    dark: false,
    tags: ['浅色', '商务'],
  },
  {
    id: 'magazine',
    name: '杂志风',
    desc: '大胆排版 · 视觉冲击',
    bg: '#fafaf9',
    primary: '#dc2626',
    text: '#1c1917',
    border: '#e7e5e4',
    accent: '#fef2f2',
    dark: false,
    tags: ['浅色', '时尚'],
  },
];

const defaultSettings: Settings = {
  site_name: '',
  site_url: '',
  site_logo: '',
  site_favicon: '',
  site_icp: '',
  footer_links: '[{"label":"API文档","href":"/docs"},{"label":"使用示例","href":"/example"},{"label":"图库","href":"/gallery"},{"label":"管理后台","href":"/auth/login"}]',
  header_links: '[{"label":"首页","href":"/"},{"label":"图库","href":"/gallery"},{"label":"文档","href":"/docs"},{"label":"示例","href":"/example"}]',
  rate_limit_enabled: 'true',
  rate_limit_global: '100',
  rate_limit_window: '3600000',
  smtp_host: '',
  smtp_port: '587',
  smtp_user: '',
  smtp_pass: '',
  smtp_from: '',
  smtp_secure: 'false',
  hero_tagline: '',
  hero_title: '',
  hero_subtitle: '',
  cta_title: '',
  watermark_enabled: 'false',
  site_theme: 'default',
};

// SMTP 快捷预设
const smtpPresets: Record<string, { host: string; port: string; secure: string }> = {
  qq: { host: 'smtp.qq.com', port: '465', secure: 'true' },
  '163': { host: 'smtp.163.com', port: '465', secure: 'true' },
  outlook: { host: 'smtp.office365.com', port: '587', secure: 'false' },
  gmail: { host: 'smtp.gmail.com', port: '587', secure: 'false' },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // 邮件测试
  const [testEmail, setTestEmail] = useState('');
  const [testingEmail, setTestingEmail] = useState(false);
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setSettings({ ...defaultSettings, ...data.settings });
      }
    } catch (error) {
      console.error('获取设置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ settings }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '保存失败');

      setSuccess('设置保存成功，正在刷新页面...');
      // 同步主题到 localStorage
      if (settings.site_theme) {
        localStorage.setItem('site_theme', settings.site_theme);
        document.documentElement.setAttribute('data-theme', settings.site_theme);
      }
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: keyof Settings, value: string) => {
    setSettings({ ...settings, [key]: value });
    // 主题实时预览
    if (key === 'site_theme') {
      document.documentElement.setAttribute('data-theme', value);
      localStorage.setItem('site_theme', value);
    }
  };

  const applySmtpPreset = (preset: string) => {
    const p = smtpPresets[preset];
    if (!p) return;
    setSettings({ ...settings, smtp_host: p.host, smtp_port: p.port, smtp_secure: p.secure });
  };

  const handleTestEmail = async () => {
    if (!testEmail) return;
    setTestingEmail(true);
    setTestResult('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ to: testEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setTestResult('success');
      } else {
        setTestResult(`失败: ${data.error || data.message || '未知错误'}`);
      }
    } catch (err: any) {
      setTestResult(`失败: ${err.message}`);
    } finally {
      setTestingEmail(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="系统设置">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-primary)] border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="系统设置">
      <form onSubmit={handleSubmit}>
        {error && <div className="mb-4 p-3 bg-error-light text-error-DEFAULT rounded-md text-sm">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm border border-green-200">{success}</div>}

        {/* ===== 主题样式设置 ===== */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-[var(--color-text)]">主题样式</h3>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">点击选择主题，即时预览效果，保存后全站生效</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: THEMES.find(t => t.id === (settings.site_theme || 'default'))?.primary || '#c75b39' }}
              />
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                {THEMES.find(t => t.id === (settings.site_theme || 'default'))?.name || '日式极简'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {THEMES.map((theme) => {
              const isActive = (settings.site_theme || 'default') === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleChange('site_theme', theme.id)}
                  className="group relative rounded-xl overflow-hidden transition-all duration-200"
                  style={{
                    outline: isActive ? `2px solid ${theme.primary}` : '2px solid transparent',
                    outlineOffset: '2px',
                  }}
                >
                  {/* 主题预览卡 */}
                  <div
                    className="relative p-3 pb-2"
                    style={{ backgroundColor: theme.bg }}
                  >
                    {/* 选中标记 */}
                    {isActive && (
                      <div
                        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center z-10"
                        style={{ backgroundColor: theme.primary }}
                      >
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}

                    {/* 模拟页面结构 */}
                    <div className="space-y-1.5">
                      {/* 模拟导航栏 */}
                      <div
                        className="h-2 rounded-sm opacity-30"
                        style={{ backgroundColor: theme.text, width: '60%' }}
                      />
                      {/* 模拟标题 */}
                      <div
                        className="h-3 rounded-sm font-bold"
                        style={{ backgroundColor: theme.primary, width: '80%' }}
                      />
                      {/* 模拟文字行 */}
                      <div
                        className="h-1.5 rounded-sm opacity-20"
                        style={{ backgroundColor: theme.text, width: '90%' }}
                      />
                      <div
                        className="h-1.5 rounded-sm opacity-20"
                        style={{ backgroundColor: theme.text, width: '70%' }}
                      />
                      {/* 模拟卡片 */}
                      <div className="flex gap-1.5 mt-2">
                        {[0.9, 0.7, 0.85].map((w, i) => (
                          <div
                            key={i}
                            className="h-6 rounded flex-1"
                            style={{
                              backgroundColor: theme.accent,
                              border: `1px solid ${theme.border}`,
                              opacity: w,
                            }}
                          />
                        ))}
                      </div>
                      {/* 模拟按钮 */}
                      <div className="flex gap-1.5">
                        <div
                          className="h-4 rounded-md flex-1"
                          style={{ backgroundColor: theme.primary }}
                        />
                        <div
                          className="h-4 rounded-md flex-1"
                          style={{ backgroundColor: theme.border }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 主题信息 */}
                  <div
                    className="px-3 py-2 text-left"
                    style={{
                      backgroundColor: isActive ? theme.accent : theme.bg,
                      borderTop: `1px solid ${theme.border}`,
                    }}
                  >
                    <div
                      className="text-xs font-semibold leading-tight"
                      style={{ color: theme.text }}
                    >
                      {theme.name}
                    </div>
                    <div
                      className="text-xs leading-tight mt-0.5 opacity-60"
                      style={{ color: theme.text }}
                    >
                      {theme.desc}
                    </div>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {theme.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: tag === '深色' ? theme.text : theme.primary + '22',
                            color: tag === '深色' ? theme.bg : theme.primary,
                            border: `1px solid ${theme.primary}33`,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 深色模式提示 */}
          <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
            <svg className="w-4 h-4 text-[var(--color-primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              标记为「深色」的主题（科技感、赛博朋克）天然是暗色风格，无需开启深色模式切换。其余主题可通过右上角深色模式开关切换亮暗。
            </p>
          </div>
        </div>

        {/* ===== 网站设置 ===== */}
        <div className="card mb-6">
          <h3 className="text-base font-semibold text-[var(--color-text)] mb-4">网站设置</h3>
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="label">网站名称</label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => handleChange('site_name', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">网站地址</label>
              <input
                type="url"
                value={settings.site_url}
                onChange={(e) => handleChange('site_url', e.target.value)}
                placeholder="https://api.zxiaolin.com"
                className="input"
              />
            </div>
            <div>
              <label className="label">网站 Logo</label>
              <div className="flex gap-3 items-start">
                <input
                  type="url"
                  value={settings.site_logo}
                  onChange={(e) => handleChange('site_logo', e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="input flex-1"
                />
                {settings.site_logo && (
                  <img
                    src={settings.site_logo}
                    alt="Logo 预览"
                    className="w-10 h-10 object-contain rounded border border-[var(--color-border)]"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
              </div>
              <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">留空则显示文字 Logo，填入图片 URL 则显示图片</p>
            </div>
            <div>
              <label className="label">网站 Favicon（浏览器图标）</label>
              <div className="flex gap-3 items-start">
                <input
                  type="url"
                  value={settings.site_favicon}
                  onChange={(e) => handleChange('site_favicon', e.target.value)}
                  placeholder="https://example.com/favicon.ico"
                  className="input flex-1"
                />
                {settings.site_favicon && (
                  <img
                    src={settings.site_favicon}
                    alt="Favicon 预览"
                    className="w-8 h-8 object-contain rounded border border-[var(--color-border)]"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
              </div>
              <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">填写图标 URL（支持 .ico/.png），将显示在浏览器标签页和书签中</p>
            </div>
            <div>
              <label className="label">备案号</label>
              <input
                type="text"
                value={settings.site_icp}
                onChange={(e) => handleChange('site_icp', e.target.value)}
                placeholder="京ICP备xxxxxxxx号"
                className="input"
              />
              <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">显示在网站底部，留空不显示</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="label">上传时添加水印</label>
                <p className="text-xs text-[var(--color-text-tertiary)]">启用后，上传的图片将自动添加极淡的域名水印（不影响观感）</p>
              </div>
              <button
                type="button"
                onClick={() => handleChange('watermark_enabled', settings.watermark_enabled === 'true' ? 'false' : 'true')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.watermark_enabled === 'true' ? 'bg-[var(--color-primary)]' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.watermark_enabled === 'true' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* ===== 首页展示设置 ===== */}
        <div className="card mb-6">
          <h3 className="text-base font-semibold text-[var(--color-text)] mb-4">首页展示设置</h3>
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="label">小标题</label>
              <input
                type="text"
                value={settings.hero_tagline}
                onChange={(e) => handleChange('hero_tagline', e.target.value)}
                placeholder="图片 API 服务平台"
                className="input"
              />
            </div>
            <div>
              <label className="label">大标题</label>
              <input
                type="text"
                value={settings.hero_title}
                onChange={(e) => handleChange('hero_title', e.target.value)}
                placeholder="樱道 API"
                className="input"
              />
            </div>
            <div>
              <label className="label">描述文字</label>
              <textarea
                value={settings.hero_subtitle}
                onChange={(e) => handleChange('hero_subtitle', e.target.value)}
                placeholder="稳定、高效的图片接口服务，为你的项目提供丰富的视觉内容。&#10;支持多种分类，一键接入，即刻使用。"
                className="input min-h-[80px]"
                rows={3}
              />
            </div>
            <div>
              <label className="label">底部号召语</label>
              <input
                type="text"
                value={settings.cta_title}
                onChange={(e) => handleChange('cta_title', e.target.value)}
                placeholder="开始使用樱道 API"
                className="input"
              />
            </div>
            {/* 预览 */}
            <div className="p-4 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-text-tertiary)] mb-2">预览效果</p>
              <div className="text-center">
                <p className="text-xs tracking-wider text-[var(--color-primary)] uppercase mb-1">
                  {settings.hero_tagline || '图片 API 服务平台'}
                </p>
                <p className="text-xl font-bold text-[var(--color-text)] mb-1">
                  {settings.hero_title || '樱道 API'}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-line">
                  {settings.hero_subtitle || '稳定、高效的图片接口服务，为你的项目提供丰富的视觉内容。\n支持多种分类，一键接入，即刻使用。'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== 菜单设置 ===== */}
        <div className="card mb-6">
          <h3 className="text-base font-semibold text-[var(--color-text)] mb-4">菜单设置</h3>
          <p className="text-sm text-[var(--color-text-tertiary)] mb-4">自定义页尾和顶部导航菜单，使用 JSON 格式编辑链接列表</p>
          
          <div className="space-y-6 max-w-lg">
            {/* 页尾链接 */}
            <div>
              <label className="label">页尾链接（JSON 数组）</label>
              <textarea
                value={settings.footer_links || ''}
                onChange={(e) => handleChange('footer_links', e.target.value)}
                placeholder='[{"label":"API文档","href":"/docs"},{"label":"使用示例","href":"/example"}]'
                className="input font-mono text-xs min-h-[80px]"
                rows={3}
              />
              <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">格式：[ {"{"}"label":"显示文字", "href":"/链接路径" {"}"}]</p>
              {/* 预览 */}
              {settings.footer_links && (
                <div className="mt-2 p-3 bg-[var(--color-bg-subtle)] rounded-md">
                  <p className="text-xs text-[var(--color-text-tertiary)] mb-2">预览：</p>
                  <div className="flex flex-wrap gap-4">
                    {(() => {
                      try {
                        const links = JSON.parse(settings.footer_links);
                        return links.map((link: any, i: number) => (
                          <span key={i} className="text-xs text-[var(--color-text-secondary)]">{link.label} → {link.href}</span>
                        ));
                      } catch {
                        return <span className="text-xs text-error-DEFAULT">JSON 格式错误</span>;
                      }
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* 顶部导航链接 */}
            <div>
              <label className="label">顶部导航链接（JSON 数组）</label>
              <textarea
                value={settings.header_links || ''}
                onChange={(e) => handleChange('header_links', e.target.value)}
                placeholder='[{"label":"首页","href":"/"},{"label":"图库","href":"/gallery"}]'
                className="input font-mono text-xs min-h-[80px]"
                rows={3}
              />
              <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">格式：[ {"{"}"label":"显示文字", "href":"/链接路径" {"}"}]</p>
              {/* 预览 */}
              {settings.header_links && (
                <div className="mt-2 p-3 bg-[var(--color-bg-subtle)] rounded-md">
                  <p className="text-xs text-[var(--color-text-tertiary)] mb-2">预览：</p>
                  <div className="flex flex-wrap gap-4">
                    {(() => {
                      try {
                        const links = JSON.parse(settings.header_links);
                        return links.map((link: any, i: number) => (
                          <span key={i} className="text-xs text-[var(--color-text-secondary)]">{link.label} → {link.href}</span>
                        ));
                      } catch {
                        return <span className="text-xs text-error-DEFAULT">JSON 格式错误</span>;
                      }
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== 邮件服务设置 ===== */}
        <div className="card mb-6">
          <h3 className="text-base font-semibold text-[var(--color-text)] mb-4">邮件服务设置</h3>
          <p className="text-sm text-[var(--color-text-tertiary)] mb-3">配置 SMTP 邮件服务，用于发送注册验证码等邮件</p>

          {/* 快捷预设 */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-sm text-[var(--color-text-secondary)] leading-8">快捷配置：</span>
            {Object.keys(smtpPresets).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => applySmtpPreset(key)}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  settings.smtp_host === smtpPresets[key].host
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                }`}
              >
                {key === 'qq' ? 'QQ 邮箱' : key === '163' ? '163 邮箱' : key === 'outlook' ? 'Outlook' : 'Gmail'}
              </button>
            ))}
          </div>

          <div className="space-y-4 max-w-lg">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="label">SMTP 服务器</label>
                <input
                  type="text"
                  value={settings.smtp_host}
                  onChange={(e) => handleChange('smtp_host', e.target.value)}
                  placeholder="smtp.qq.com"
                  className="input"
                />
              </div>
              <div>
                <label className="label">端口</label>
                <input
                  type="text"
                  value={settings.smtp_port}
                  onChange={(e) => handleChange('smtp_port', e.target.value)}
                  placeholder="465"
                  className="input"
                />
              </div>
            </div>
            <div>
              <label className="label">发件邮箱</label>
              <input
                type="email"
                value={settings.smtp_user}
                onChange={(e) => handleChange('smtp_user', e.target.value)}
                placeholder="your@qq.com"
                className="input"
              />
            </div>
            <div>
              <label className="label">授权码 / 密码</label>
              <input
                type="password"
                value={settings.smtp_pass}
                onChange={(e) => handleChange('smtp_pass', e.target.value)}
                placeholder="QQ邮箱请填授权码"
                className="input"
              />
              <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">QQ邮箱需使用授权码而非QQ密码，在邮箱设置→账户中获取</p>
            </div>
            <div>
              <label className="label">发件人名称</label>
              <input
                type="text"
                value={settings.smtp_from}
                onChange={(e) => handleChange('smtp_from', e.target.value)}
                placeholder={`"${settings.site_name || '樱道 API'}" <${settings.smtp_user || 'your@qq.com'}>`}
                className="input"
              />
              <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">留空则使用发件邮箱地址</p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="smtp_secure"
                checked={settings.smtp_secure === 'true'}
                onChange={(e) => handleChange('smtp_secure', e.target.checked ? 'true' : 'false')}
                className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)]"
              />
              <label htmlFor="smtp_secure" className="ml-2 text-sm text-[var(--color-text-secondary)]">
                使用 SSL 加密（端口 465 通常开启）
              </label>
            </div>

            {/* 测试发送 */}
            <div className="pt-3 border-t border-[var(--color-border)]">
              <label className="label">测试邮件发送</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="收件人邮箱"
                  className="input flex-1"
                />
                <button
                  type="button"
                  onClick={handleTestEmail}
                  disabled={testingEmail || !testEmail}
                  className="btn-secondary whitespace-nowrap disabled:opacity-50 text-sm"
                >
                  {testingEmail ? '发送中...' : '测试'}
                </button>
              </div>
              {testResult && (
                <p className={`mt-2 text-sm ${testResult === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {testResult === 'success' ? '✓ 测试邮件发送成功，请检查收件箱' : testResult}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ===== API 限流 ===== */}
        <div className="card mb-6">
          <h3 className="text-base font-semibold text-[var(--color-text)] mb-4">API 限流设置</h3>
          <div className="space-y-4 max-w-lg">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rate_limit_enabled"
                checked={settings.rate_limit_enabled === 'true'}
                onChange={(e) => handleChange('rate_limit_enabled', e.target.checked ? 'true' : 'false')}
                className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)]"
              />
              <label htmlFor="rate_limit_enabled" className="ml-2 text-sm text-[var(--color-text-secondary)]">
                启用 API 限流
              </label>
            </div>
            
            <div>
              <label className="label">全局限流速率（次/小时）</label>
              <input
                type="number"
                min="1"
                value={settings.rate_limit_global}
                onChange={(e) => handleChange('rate_limit_global', e.target.value)}
                disabled={settings.rate_limit_enabled !== 'true'}
                className="input disabled:opacity-50"
              />
              <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">单个用户每小时最多请求次数</p>
            </div>
            
            <div>
              <label className="label">限流时间窗口（毫秒）</label>
              <input
                type="number"
                min="1000"
                value={settings.rate_limit_window}
                onChange={(e) => handleChange('rate_limit_window', e.target.value)}
                disabled={settings.rate_limit_enabled !== 'true'}
                className="input disabled:opacity-50"
              />
              <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">3600000 = 1小时</p>
            </div>
          </div>
        </div>

        {/* 保存 */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存设置'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
