import React, { useEffect, useRef, useState } from 'react';
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
  hero_carousel_enabled: string;
  hero_carousel_mode: string;
  hero_carousel_interval: string;
  hero_carousel_height: string;
  hero_carousel_overlay_opacity: string;
  hero_carousel_slides: string;
  cta_title: string;
  cta_background_image: string;
  watermark_enabled: string;
  watermark_text: string;
  watermark_position: string;
  watermark_font_size: string;
  watermark_opacity: string;
  watermark_color: string;
  site_theme: string;
  storage_provider: string;
}

interface HeroSlideConfig {
  tagline: string;
  title: string;
  subtitle: string;
  background: string;
}

// ===== 表单字段图标 =====
const FIELD_ICON_PATHS: Record<string, React.ReactNode> = {
  type: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />,
  globe: (
    <>
      <circle cx={12} cy={12} r={9} />
      <path strokeLinecap="round" d="M3 12h18M12 3c2.5 2.6 3.9 5.7 3.9 9s-1.4 6.4-3.9 9c-2.5-2.6-3.9-5.7-3.9-9S9.5 5.6 12 3z" />
    </>
  ),
  image: (
    <>
      <rect x={3} y={4} width={18} height={16} rx={2} />
      <circle cx={9} cy={9.5} r={1.5} />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 16l-4.5-4.5L7 21" />
    </>
  ),
  star: <path strokeLinecap="round" strokeLinejoin="round" d="M11.05 3.7c.34-1.05 1.83-1.05 2.17 0l1.62 5a1 1 0 00.95.69h5.25c1.1 0 1.56 1.41.67 2.06l-4.25 3.09a1 1 0 00-.36 1.12l1.62 5c.34 1.05-.86 1.92-1.75 1.27l-4.25-3.09a1 1 0 00-1.17 0l-4.25 3.09c-.89.65-2.09-.22-1.75-1.27l1.62-5a1 1 0 00-.36-1.12L2.62 11.4c-.89-.65-.43-2.06.67-2.06h5.25a1 1 0 00.95-.69l1.56-4.95z" />,
  shield: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.5l2 2 4-4.5M12 3l7.5 3v5.2c0 4.9-3.2 9.4-7.5 10.8-4.3-1.4-7.5-5.9-7.5-10.8V6L12 3z" />,
  droplet: <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l5 5.2a7 7 0 11-10 0L12 3z" />,
  tag: (
    <>
      <circle cx={7.5} cy={7.5} r={0.5} />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5.5A1.5 1.5 0 015.5 4h5c.4 0 .78.16 1.06.44l8 8a1.5 1.5 0 010 2.12l-5 5a1.5 1.5 0 01-2.12 0l-8-8A1.5 1.5 0 014 10.5v-5z" />
    </>
  ),
  heading: <path strokeLinecap="round" strokeLinejoin="round" d="M6 4v16M18 4v16M6 12h12" />,
  text: <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h12M4 18h14" />,
  megaphone: <path strokeLinecap="round" strokeLinejoin="round" d="M11 6.5v11l-2.5-1.2a2 2 0 01-1-2.4l.8-2.4a2 2 0 00-.3-1.9L6.6 8a2 2 0 011.6-3.2h11.3a2 2 0 011.9 2.6l-1.3 4a2 2 0 01-1.9 1.4h-4.1L11 17.5V6.5z" />,
  layers: <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5" />,
  clock: (
    <>
      <circle cx={12} cy={12} r={9} />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3.5 2" />
    </>
  ),
  height: <path strokeLinecap="round" strokeLinejoin="round" d="M8 4l4 4 4-4M8 20l4-4 4 4M12 8v8" />,
  link: <path strokeLinecap="round" strokeLinejoin="round" d="M13.8 10.2a4 4 0 00-5.6 0l-3 3a4 4 0 105.6 5.6l1.1-1.1m-.7-4.9a4 4 0 005.6 0l3-3a4 4 0 10-5.6-5.6l-1.1 1.1" />,
  server: (
    <>
      <rect x={3} y={4} width={18} height={7} rx={1.5} />
      <rect x={3} y={13} width={18} height={7} rx={1.5} />
      <path strokeLinecap="round" d="M7 7.5h.01M7 16.5h.01" />
    </>
  ),
  hash: <path strokeLinecap="round" strokeLinejoin="round" d="M10 4L8 20M16 4l-2 16M4.5 9h15M3.5 15h15" />,
  mail: (
    <>
      <rect x={3} y={5} width={18} height={14} rx={2} />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 7l7.3 5.1a2 2 0 002.4 0L20.5 7" />
    </>
  ),
  lock: (
    <>
      <rect x={5} y={11} width={14} height={9} rx={2} />
      <path strokeLinecap="round" d="M8 11V8a4 4 0 018 0v3" />
    </>
  ),
  user: (
    <>
      <circle cx={12} cy={8} r={4} />
      <path strokeLinecap="round" d="M5 20a7 7 0 0114 0" />
    </>
  ),
  send: <path strokeLinecap="round" strokeLinejoin="round" d="M21 3L10 14M21 3l-7 18-4-7-7-4 18-7z" />,
  list: <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />,
  gauge: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 17.5a8.5 8.5 0 1115 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 13.5l3.5-4" />
      <circle cx={12} cy={14.5} r={1.2} />
    </>
  ),
};

const FieldIcon = ({ name }: { name: string }) => (
  <svg
    className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] shrink-0"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    {FIELD_ICON_PATHS[name]}
  </svg>
);

interface LinkConfig {
  label: string;
  href: string;
}

// 主题列表定义
const THEMES = [
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
  hero_carousel_enabled: 'true',
  hero_carousel_mode: 'text',
  hero_carousel_interval: '6000',
  hero_carousel_height: '460',
  hero_carousel_overlay_opacity: '72',
  hero_carousel_slides: JSON.stringify([
    {
      tagline: '图片 API 服务平台',
      title: '智晓科创图片 API',
      subtitle: '稳定、高效的图片接口服务，为你的项目提供丰富的视觉内容。\n支持多种分类，一键接入，即刻使用。',
      background: '',
    },
    {
      tagline: '灵活存储管理',
      title: '云端与本地都能从容切换',
      subtitle: '支持腾讯云 COS、七牛云、本地存储，并可为不同分类单独设置存储位置。',
      background: '',
    },
    {
      tagline: '快速接入图片服务',
      title: '用一条接口点亮你的应用',
      subtitle: '获取 API Key 后即可调用随机图片接口，适合网站、机器人、应用和内容工具。',
      background: '',
    },
  ], null, 2),
  cta_title: '',
  cta_background_image: '',
  watermark_enabled: 'false',
  watermark_text: 'zhihuiyun.work',
  watermark_position: 'bottom-right',
  watermark_font_size: '1.7',
  watermark_opacity: '8',
  watermark_color: '#ffffff',
  site_theme: 'nature',
  storage_provider: 'cos',
};

// SMTP 快捷预设
const smtpPresets: Record<string, { host: string; port: string; secure: string }> = {
  qq: { host: 'smtp.qq.com', port: '465', secure: 'true' },
  '163': { host: 'smtp.163.com', port: '465', secure: 'true' },
  outlook: { host: 'smtp.office365.com', port: '587', secure: 'false' },
  gmail: { host: 'smtp.gmail.com', port: '587', secure: 'false' },
};

// ===== 水印设置 =====
const WATERMARK_POSITIONS = [
  'top-left', 'top-center', 'top-right',
  'middle-left', 'center', 'middle-right',
  'bottom-left', 'bottom-center', 'bottom-right',
] as const;

/** 解析九宫格位置为对齐参数（预览与实际上传绘制共用同一套几何规则） */
function parseWatermarkPosition(position: string) {
  const row = position.startsWith('top') ? 'top' : position === 'center' || position.startsWith('middle') ? 'middle' : 'bottom';
  const col = position.endsWith('left') ? 'left' : position.endsWith('right') ? 'right' : 'center';
  return {
    align: col as CanvasTextAlign,
    baseline: (row === 'top' ? 'top' : row === 'middle' ? 'middle' : 'bottom') as CanvasTextBaseline,
    x: (width: number, pad: number) => (col === 'left' ? pad : col === 'right' ? width - pad : width / 2),
    y: (height: number, pad: number) => (row === 'top' ? pad : row === 'bottom' ? height - pad : height / 2),
  };
}

/** 在预览 canvas 上绘制模拟照片 + 水印（与上传时的绘制规则一致） */
function drawWatermarkPreview(canvas: HTMLCanvasElement, opts: { text: string; position: string; fontSizePct: number; opacityPct: number; color: string }) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;

  // 模拟一张风景照片：天空渐变 + 太阳 + 远山
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.62);
  sky.addColorStop(0, '#5b8fc9');
  sky.addColorStop(1, '#cfe0f0');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.62);
  ctx.fillStyle = 'rgba(255, 244, 214, 0.9)';
  ctx.beginPath();
  ctx.arc(W * 0.76, H * 0.22, W * 0.055, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#6f9a6f';
  ctx.beginPath();
  ctx.moveTo(0, H * 0.62);
  ctx.quadraticCurveTo(W * 0.28, H * 0.4, W * 0.55, H * 0.62);
  ctx.lineTo(0, H * 0.62);
  ctx.fill();
  ctx.fillStyle = '#547d54';
  ctx.beginPath();
  ctx.moveTo(W * 0.4, H * 0.62);
  ctx.quadraticCurveTo(W * 0.72, H * 0.44, W, H * 0.62);
  ctx.lineTo(W * 0.4, H * 0.62);
  ctx.fill();
  ctx.fillStyle = '#436b48';
  ctx.fillRect(0, H * 0.62, W, H * 0.38);

  // 水印文字（规则与 images.tsx 的 addWatermark 保持一致：边距 = 字号）
  const text = opts.text.trim();
  if (!text) return;
  const fontSize = Math.max(Math.round((W * opts.fontSizePct) / 100), 10);
  const pad = fontSize;
  const pos = parseWatermarkPosition(opts.position);
  ctx.font = `lighter ${fontSize}px sans-serif`;
  ctx.globalAlpha = Math.min(Math.max(opts.opacityPct, 1), 100) / 100;
  ctx.fillStyle = opts.color;
  ctx.textAlign = pos.align;
  ctx.textBaseline = pos.baseline;
  ctx.shadowColor = 'rgba(0,0,0,0.15)';
  ctx.shadowBlur = 2;
  ctx.fillText(text, pos.x(W, pad), pos.y(H, pad));
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

function parseArraySetting<T>(value: string, fallback: T[]): T[] {
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function stringifySetting(value: unknown) {
  return JSON.stringify(value, null, 2);
}

const defaultHeroSlides = [
  {
    tagline: '图片 API 服务平台',
    title: '智晓科创图片 API',
    subtitle: '稳定、高效的图片接口服务，为你的项目提供丰富的视觉内容。\n支持多种分类，一键接入，即刻使用。',
    background: '',
  },
  {
    tagline: '灵活存储管理',
    title: '云端与本地都能从容切换',
    subtitle: '支持腾讯云 COS、七牛云、本地存储，并可为不同分类单独设置存储位置。',
    background: '',
  },
  {
    tagline: '快速接入图片服务',
    title: '用一条接口点亮你的应用',
    subtitle: '获取 API Key 后即可调用随机图片接口，适合网站、机器人、应用和内容工具。',
    background: '',
  },
];

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
  const [storageInfo, setStorageInfo] = useState<any>(null);

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
        const nextSettings = { ...defaultSettings, ...data.settings };
        if (nextSettings.site_theme === 'default') {
          nextSettings.site_theme = 'nature';
        }
        setSettings(nextSettings);
        setStorageInfo(data.storage || null);
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

  // ===== 水印实时预览 =====
  const watermarkPreviewRef = useRef<HTMLCanvasElement>(null);
  const watermarkEnabled = settings.watermark_enabled === 'true';
  const watermarkFontSizePct = parseFloat(settings.watermark_font_size) || 1.7;
  const watermarkOpacityPct = parseFloat(settings.watermark_opacity) || 8;

  useEffect(() => {
    if (!watermarkEnabled || !watermarkPreviewRef.current) return;
    drawWatermarkPreview(watermarkPreviewRef.current, {
      text: settings.watermark_text,
      position: settings.watermark_position,
      fontSizePct: watermarkFontSizePct,
      opacityPct: watermarkOpacityPct,
      color: settings.watermark_color || '#ffffff',
    });
  }, [watermarkEnabled, settings.watermark_text, settings.watermark_position, watermarkFontSizePct, watermarkOpacityPct, settings.watermark_color]);

  // ===== 分区块保存 =====
  const [savedSection, setSavedSection] = useState<string | null>(null);

  const saveSection = async (sectionId: string, keys: (keyof Settings)[]) => {
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const partial: Record<string, string> = {};
      keys.forEach((k) => { partial[k] = settings[k]; });
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ settings: partial }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '保存失败');
      setSavedSection(sectionId);
      setSuccess(`${SECTION_TITLES[sectionId]}已保存`);
      setTimeout(() => {
        setSavedSection((prev) => (prev === sectionId ? null : prev));
        setSuccess('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const SECTION_TITLES: Record<string, string> = {
    theme: '主题样式',
    site: '网站设置',
    home: '首页展示设置',
    storage: '存储设置',
    menu: '菜单设置',
    smtp: '邮件服务设置',
    ratelimit: 'API 限流设置',
  };

  const renderSectionSave = (sectionId: string, keys: (keyof Settings)[]) => (
    <button
      type="button"
      onClick={() => saveSection(sectionId, keys)}
      disabled={saving}
      className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors shrink-0 ${
        savedSection === sectionId
          ? 'bg-success-light text-success-DEFAULT'
          : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50'
      }`}
    >
      {savedSection === sectionId ? (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          已保存
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          保存此项
        </>
      )}
    </button>
  );

  const fillDefaultHeroSlides = () => {
    setSettings({
      ...settings,
      hero_carousel_slides: JSON.stringify(defaultHeroSlides, null, 2),
      hero_carousel_enabled: 'true',
    });
  };

  const heroSlides = parseArraySetting<HeroSlideConfig>(settings.hero_carousel_slides, defaultHeroSlides);
  const footerLinks = parseArraySetting<LinkConfig>(settings.footer_links, []);
  const headerLinks = parseArraySetting<LinkConfig>(settings.header_links, []);

  const updateHeroSlide = (index: number, key: keyof HeroSlideConfig, value: string) => {
    const next = [...heroSlides];
    next[index] = { ...next[index], [key]: value };
    handleChange('hero_carousel_slides', stringifySetting(next));
  };

  const addHeroSlide = () => {
    handleChange('hero_carousel_slides', stringifySetting([
      ...heroSlides,
      { tagline: '', title: '', subtitle: '', background: '' },
    ]));
  };

  const removeHeroSlide = (index: number) => {
    handleChange('hero_carousel_slides', stringifySetting(heroSlides.filter((_, i) => i !== index)));
  };

  const updateLinkList = (key: 'footer_links' | 'header_links', list: LinkConfig[]) => {
    handleChange(key, stringifySetting(list));
  };

  const updateLinkItem = (key: 'footer_links' | 'header_links', index: number, field: keyof LinkConfig, value: string) => {
    const list = key === 'footer_links' ? [...footerLinks] : [...headerLinks];
    list[index] = { ...list[index], [field]: value };
    updateLinkList(key, list);
  };

  const addLinkItem = (key: 'footer_links' | 'header_links') => {
    const list = key === 'footer_links' ? footerLinks : headerLinks;
    updateLinkList(key, [...list, { label: '', href: '' }]);
  };

  const removeLinkItem = (key: 'footer_links' | 'header_links', index: number) => {
    const list = key === 'footer_links' ? footerLinks : headerLinks;
    updateLinkList(key, list.filter((_, i) => i !== index));
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
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: THEMES.find(t => t.id === (settings.site_theme || 'nature'))?.primary || '#16a34a' }}
                />
                <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                  {THEMES.find(t => t.id === (settings.site_theme || 'nature'))?.name || '自然绿'}
                </span>
              </div>
              {renderSectionSave('theme', ['site_theme'])}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {THEMES.map((theme) => {
              const isActive = (settings.site_theme || 'nature') === theme.id;
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[var(--color-text)]">网站设置</h3>
            {renderSectionSave('site', ['site_name', 'site_url', 'site_logo', 'site_favicon', 'site_icp', 'watermark_enabled', 'watermark_text', 'watermark_position', 'watermark_font_size', 'watermark_opacity', 'watermark_color'])}
          </div>
          <div className="space-y-4 max-w-5xl">
            <div>
              <label className="label flex items-center gap-1.5"><FieldIcon name="type" />网站名称</label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => handleChange('site_name', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label flex items-center gap-1.5"><FieldIcon name="globe" />网站地址</label>
              <input
                type="url"
                value={settings.site_url}
                onChange={(e) => handleChange('site_url', e.target.value)}
                placeholder="https://api.zxiaolin.com"
                className="input"
              />
            </div>
            <div>
              <label className="label flex items-center gap-1.5"><FieldIcon name="image" />网站 Logo</label>
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
              <label className="label flex items-center gap-1.5"><FieldIcon name="star" />网站 Favicon（浏览器图标）</label>
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
              <label className="label flex items-center gap-1.5"><FieldIcon name="shield" />备案号</label>
              <input
                type="text"
                value={settings.site_icp}
                onChange={(e) => handleChange('site_icp', e.target.value)}
                placeholder="京ICP备xxxxxxxx号"
                className="input"
              />
              <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">显示在网站底部，留空不显示</p>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="label flex items-center gap-1.5"><FieldIcon name="droplet" />上传时添加水印</label>
                  <p className="text-xs text-[var(--color-text-tertiary)]">启用后，新上传的图片将按以下配置自动添加文字水印</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange('watermark_enabled', settings.watermark_enabled === 'true' ? 'false' : 'true')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    watermarkEnabled ? 'bg-[var(--color-primary)]' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      watermarkEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* 水印详细配置（开关关闭时置灰禁用） */}
              <div className={`mt-4 pt-4 border-t border-[var(--color-border)] transition-opacity ${watermarkEnabled ? '' : 'opacity-50 pointer-events-none'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label flex items-center gap-1.5"><FieldIcon name="text" />水印内容</label>
                    <input
                      type="text"
                      value={settings.watermark_text}
                      onChange={(e) => handleChange('watermark_text', e.target.value)}
                      placeholder="例如：zhihuiyun.work"
                      className="input"
                    />
                    <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">留空则只叠加透明层，不绘制文字</p>
                  </div>
                  <div>
                    <label className="label flex items-center gap-1.5"><FieldIcon name="droplet" />水印颜色</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={/^#[0-9a-fA-F]{6}$/.test(settings.watermark_color) ? settings.watermark_color : '#ffffff'}
                        onChange={(e) => handleChange('watermark_color', e.target.value)}
                        className="h-9 w-14 cursor-pointer rounded-md border border-[var(--color-border)] bg-transparent p-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleChange('watermark_color', '#ffffff')}
                        className="px-2.5 py-1.5 text-xs rounded-md border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-primary)] transition-colors"
                      >白色</button>
                      <button
                        type="button"
                        onClick={() => handleChange('watermark_color', '#000000')}
                        className="px-2.5 py-1.5 text-xs rounded-md border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-primary)] transition-colors"
                      >黑色</button>
                    </div>
                    <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">默认白色，深色图片上更易读可选黑色</p>
                  </div>
                  <div>
                    <label className="label flex items-center justify-between gap-1.5">
                      <span className="flex items-center gap-1.5"><FieldIcon name="height" />水印大小</span>
                      <span className="text-xs font-normal text-[var(--color-text-tertiary)]">{watermarkFontSizePct}% 图宽</span>
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="10"
                      step="0.1"
                      value={watermarkFontSizePct}
                      onChange={(e) => handleChange('watermark_font_size', e.target.value)}
                      className="w-full accent-[var(--color-primary)] cursor-pointer"
                    />
                    <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">按图片宽度百分比缩放，大小图都能自适应</p>
                  </div>
                  <div>
                    <label className="label flex items-center justify-between gap-1.5">
                      <span className="flex items-center gap-1.5"><FieldIcon name="droplet" />不透明度</span>
                      <span className="text-xs font-normal text-[var(--color-text-tertiary)]">{watermarkOpacityPct}%</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      step="1"
                      value={watermarkOpacityPct}
                      onChange={(e) => handleChange('watermark_opacity', e.target.value)}
                      className="w-full accent-[var(--color-primary)] cursor-pointer"
                    />
                    <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">默认 8%（极淡不影响观感），防盜图建议 20% 以上</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-4">
                  <div className="shrink-0">
                    <label className="label">水印位置</label>
                    <div className="grid grid-cols-3 gap-1 w-fit">
                      {WATERMARK_POSITIONS.map((p) => (
                        <button
                          key={p}
                          type="button"
                          title={p}
                          onClick={() => handleChange('watermark_position', p)}
                          className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors ${
                            settings.watermark_position === p
                              ? 'bg-[var(--color-primary)] border-transparent'
                              : 'bg-black/5 dark:bg-white/10 border-[var(--color-border)] hover:border-[var(--color-primary)]'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${settings.watermark_position === p ? 'bg-white' : 'bg-gray-400 dark:bg-gray-500'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="label">效果预览（与实际上传效果一致）</label>
                    <canvas
                      ref={watermarkPreviewRef}
                      width={640}
                      height={300}
                      className="w-full rounded-md border border-[var(--color-border)]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== 首页展示设置 ===== */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[var(--color-text)]">首页展示设置</h3>
            {renderSectionSave('home', ['hero_tagline', 'hero_title', 'hero_subtitle', 'hero_carousel_enabled', 'hero_carousel_mode', 'hero_carousel_interval', 'hero_carousel_height', 'hero_carousel_overlay_opacity', 'hero_carousel_slides', 'cta_title', 'cta_background_image'])}
          </div>
          <div className="space-y-4 max-w-5xl">
            <div>
              <label className="label flex items-center gap-1.5"><FieldIcon name="tag" />小标题</label>
              <input
                type="text"
                value={settings.hero_tagline}
                onChange={(e) => handleChange('hero_tagline', e.target.value)}
                placeholder="图片 API 服务平台"
                className="input"
              />
            </div>
            <div>
              <label className="label flex items-center gap-1.5"><FieldIcon name="heading" />大标题</label>
              <input
                type="text"
                value={settings.hero_title}
                onChange={(e) => handleChange('hero_title', e.target.value)}
                placeholder={settings.site_name || '网站名称'}
                className="input"
              />
            </div>
            <div>
              <label className="label flex items-center gap-1.5"><FieldIcon name="text" />描述文字</label>
              <textarea
                value={settings.hero_subtitle}
                onChange={(e) => handleChange('hero_subtitle', e.target.value)}
                placeholder="稳定、高效的图片接口服务，为你的项目提供丰富的视觉内容。&#10;支持多种分类，一键接入，即刻使用。"
                className="input min-h-[80px]"
                rows={3}
              />
            </div>
            <div>
              <label className="label flex items-center gap-1.5"><FieldIcon name="megaphone" />底部号召语</label>
              <input
                type="text"
                value={settings.cta_title}
                onChange={(e) => handleChange('cta_title', e.target.value)}
                placeholder={`开始使用${settings.site_name || '网站名称'}`}
                className="input"
              />
            </div>
            <div>
              <label className="label flex items-center gap-1.5"><FieldIcon name="image" />底部号召语背景图</label>
              <div className="flex gap-3 items-start">
                <input
                  type="url"
                  value={settings.cta_background_image}
                  onChange={(e) => handleChange('cta_background_image', e.target.value)}
                  placeholder="https://example.com/cta-bg.jpg 或 /uploads/xxx.jpg"
                  className="input flex-1"
                />
                {settings.cta_background_image && (
                  <img
                    src={settings.cta_background_image}
                    alt="号召语背景预览"
                    className="w-20 h-12 object-cover rounded border border-[var(--color-border)]"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
              </div>
              <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">留空使用主题主色背景；填写图片地址后首页底部号召区域会使用该图片</p>
            </div>
            <div className="pt-4 border-t border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="label flex items-center gap-1.5"><FieldIcon name="layers" />头部区域轮播</label>
                  <p className="text-xs text-[var(--color-text-tertiary)]">按钮区域会固定保留，只切换轮播内容</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange('hero_carousel_enabled', settings.hero_carousel_enabled === 'true' ? 'false' : 'true')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.hero_carousel_enabled === 'true' ? 'bg-[var(--color-primary)]' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.hero_carousel_enabled === 'true' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                <div>
                  <label className="label flex items-center gap-1.5"><FieldIcon name="layers" />轮播模式</label>
                  <select
                    value={settings.hero_carousel_mode}
                    onChange={(e) => handleChange('hero_carousel_mode', e.target.value)}
                    className="input"
                  >
                    <option value="text">只轮播文字</option>
                    <option value="full">背景和文字一起轮播</option>
                  </select>
                </div>
                <div>
                  <label className="label flex items-center gap-1.5"><FieldIcon name="clock" />切换间隔（毫秒）</label>
                  <input
                    type="number"
                    min="3000"
                    step="500"
                    value={settings.hero_carousel_interval}
                    onChange={(e) => handleChange('hero_carousel_interval', e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label flex items-center gap-1.5"><FieldIcon name="height" />轮播高度（像素）</label>
                  <input
                    type="number"
                    min="320"
                    max="760"
                    step="20"
                    value={settings.hero_carousel_height}
                    onChange={(e) => handleChange('hero_carousel_height', e.target.value)}
                    className="input"
                  />
                  <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">首页头部区域会固定为这个高度，文字始终居中显示。</p>
                </div>
                <div>
                  <label className="label flex items-center gap-1.5"><FieldIcon name="droplet" />背景透明度（%）</label>
                  <input
                    type="number"
                    min="0"
                    max="95"
                    step="5"
                    value={settings.hero_carousel_overlay_opacity}
                    onChange={(e) => handleChange('hero_carousel_overlay_opacity', e.target.value)}
                    className="input"
                  />
                  <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">数值越大，背景图越淡，文字越清晰。</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div>
                    <label className="label mb-0 flex items-center gap-1.5"><FieldIcon name="list" />轮播内容</label>
                    <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                      每一张轮播由小标题、大标题、描述文字和背景图组成。背景图可为空；选择“背景和文字一起轮播”时才会应用背景图。
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={fillDefaultHeroSlides} className="btn-secondary text-xs px-3 py-1.5">
                      填入示例
                    </button>
                    <button type="button" onClick={addHeroSlide} className="btn-primary text-xs px-3 py-1.5">
                      新增轮播
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {heroSlides.map((slide, index) => (
                    <div key={index} className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-[var(--color-text)]">第 {index + 1} 张轮播</p>
                        <button
                          type="button"
                          onClick={() => removeHeroSlide(index)}
                          disabled={heroSlides.length <= 1}
                          className="text-xs text-error-DEFAULT hover:underline disabled:opacity-40 disabled:no-underline"
                        >
                          删除
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="label flex items-center gap-1.5"><FieldIcon name="tag" />小标题</label>
                          <input
                            type="text"
                            value={slide.tagline || ''}
                            onChange={(e) => updateHeroSlide(index, 'tagline', e.target.value)}
                            placeholder="例如：图片 API 服务平台"
                            className="input"
                          />
                        </div>
                        <div>
                          <label className="label flex items-center gap-1.5"><FieldIcon name="heading" />大标题</label>
                          <input
                            type="text"
                            value={slide.title || ''}
                            onChange={(e) => updateHeroSlide(index, 'title', e.target.value)}
                            placeholder="例如：智晓科创图片 API"
                            className="input"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="label flex items-center gap-1.5"><FieldIcon name="text" />描述文字</label>
                          <textarea
                            value={slide.subtitle || ''}
                            onChange={(e) => updateHeroSlide(index, 'subtitle', e.target.value)}
                            placeholder="支持换行，会在首页保留换行显示"
                            className="input min-h-[72px]"
                            rows={2}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="label flex items-center gap-1.5"><FieldIcon name="link" />背景图地址（可选）</label>
                          <div className="flex gap-3 items-start">
                            <input
                              type="url"
                              value={slide.background || ''}
                              onChange={(e) => updateHeroSlide(index, 'background', e.target.value)}
                              placeholder="https://example.com/hero.jpg 或 /uploads/hero.jpg"
                              className="input flex-1"
                            />
                            {slide.background && (
                              <img
                                src={slide.background}
                                alt={`第 ${index + 1} 张轮播背景预览`}
                                className="w-20 h-12 object-cover rounded border border-[var(--color-border)]"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* 预览 */}
            <div className="p-4 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-text-tertiary)] mb-2">预览效果</p>
              <div className="text-center">
                <p className="text-xs tracking-wider text-[var(--color-primary)] uppercase mb-1">
                  {settings.hero_tagline || '图片 API 服务平台'}
                </p>
                <p className="text-xl font-bold text-[var(--color-text)] mb-1">
                  {settings.hero_title || settings.site_name || '网站名称'}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-line">
                  {settings.hero_subtitle || '稳定、高效的图片接口服务，为你的项目提供丰富的视觉内容。\n支持多种分类，一键接入，即刻使用。'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== 存储设置 ===== */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-[var(--color-text)]">存储设置</h3>
            {renderSectionSave('storage', ['storage_provider'])}
          </div>
          <p className="text-sm text-[var(--color-text-tertiary)] mb-4">设置默认图片存储位置；分类管理中可为每个分类单独覆盖</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 max-w-5xl">
            {[
              { id: 'cos', name: '腾讯云 COS', desc: storageInfo?.cos?.configured ? `${storageInfo.cos.bucket} / ${storageInfo.cos.region}` : '使用环境变量中的 COS 配置' },
              { id: 'qiniu', name: '七牛云', desc: storageInfo?.qiniu?.configured ? `${storageInfo.qiniu.bucket} / ${storageInfo.qiniu.domain}` : '使用环境变量中的七牛配置' },
              { id: 'local', name: '本地存储', desc: storageInfo?.local?.publicPath ? `保存到 ${storageInfo.local.publicPath}` : '保存到 public/uploads' },
              { id: 'other', name: '其他存储', desc: '预留扩展，当前不建议用于上传' },
            ].map((provider) => {
              const active = settings.storage_provider === provider.id;
              return (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => handleChange('storage_provider', provider.id)}
                  className={`text-left p-4 rounded-lg border transition-colors ${
                    active
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary-subtle)]'
                      : 'border-[var(--color-border)] bg-[var(--color-bg-subtle)] hover:border-[var(--color-primary)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-[var(--color-text)]">{provider.name}</span>
                    {active && (
                      <span className="text-xs text-[var(--color-primary)]">当前默认</span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-[var(--color-text-tertiary)] leading-relaxed">{provider.desc}</p>
                </button>
              );
            })}
          </div>

          {storageInfo && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl">
              <div className="p-3 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
                <p className="text-xs font-medium text-[var(--color-text)] mb-2">腾讯云 COS 当前配置</p>
                <div className="space-y-1 text-xs text-[var(--color-text-secondary)]">
                  <p>Bucket：{storageInfo.cos?.bucket || '未配置'}</p>
                  <p>Region：{storageInfo.cos?.region || '未配置'}</p>
                  <p>SecretId：{storageInfo.cos?.secretIdMasked || '未配置'}</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
                <p className="text-xs font-medium text-[var(--color-text)] mb-2">七牛云当前配置</p>
                <div className="space-y-1 text-xs text-[var(--color-text-secondary)]">
                  <p>Bucket：{storageInfo.qiniu?.bucket || '未配置'}</p>
                  <p className="break-all">外链域名：{storageInfo.qiniu?.domain || '未配置'}</p>
                  <p>状态：{storageInfo.qiniu?.configured ? '已配置' : '未配置（需设置 QINIU_* 环境变量）'}</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
                <p className="text-xs font-medium text-[var(--color-text)] mb-2">本地存储当前配置</p>
                <div className="space-y-1 text-xs text-[var(--color-text-secondary)]">
                  <p>访问路径：{storageInfo.local?.publicPath || '/uploads'}</p>
                  <p className="break-all">磁盘目录：{storageInfo.local?.path || 'public/uploads'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===== 菜单设置 ===== */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[var(--color-text)]">菜单设置</h3>
            {renderSectionSave('menu', ['header_links', 'footer_links'])}
          </div>
          <p className="text-sm text-[var(--color-text-tertiary)] mb-4">自定义页尾和顶部导航菜单。填写“显示文字”和“链接地址”即可，链接地址可以是站内路径，也可以是完整网址。</p>
          
          <div className="space-y-6 max-w-5xl">
            {/* 页尾链接 */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <div>
                  <label className="label mb-0 flex items-center gap-1.5"><FieldIcon name="link" />页尾链接</label>
                  <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">显示在网站底部。示例：显示文字“API文档”，链接地址“/docs”。</p>
                </div>
                <button type="button" onClick={() => addLinkItem('footer_links')} className="btn-primary text-xs px-3 py-1.5">
                  新增页尾链接
                </button>
              </div>
              <div className="space-y-2">
                {footerLinks.map((link, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr_auto] gap-2 p-3 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
                    <div>
                      <label className="label flex items-center gap-1.5"><FieldIcon name="text" />显示文字</label>
                      <input
                        type="text"
                        value={link.label || ''}
                        onChange={(e) => updateLinkItem('footer_links', index, 'label', e.target.value)}
                        placeholder="例如：API文档"
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label flex items-center gap-1.5"><FieldIcon name="link" />链接地址</label>
                      <input
                        type="text"
                        value={link.href || ''}
                        onChange={(e) => updateLinkItem('footer_links', index, 'href', e.target.value)}
                        placeholder="例如：/docs 或 https://example.com"
                        className="input"
                      />
                    </div>
                    <div className="flex md:items-end">
                      <button
                        type="button"
                        onClick={() => removeLinkItem('footer_links', index)}
                        className="w-full md:w-auto px-3 py-2 text-sm text-error-DEFAULT hover:underline"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
                {footerLinks.length === 0 && (
                  <div className="p-4 rounded-lg bg-[var(--color-bg-subtle)] text-sm text-[var(--color-text-tertiary)] border border-dashed border-[var(--color-border)]">
                    暂无页尾链接，点击“新增页尾链接”添加。
                  </div>
                )}
              </div>
            </div>

            {/* 顶部导航链接 */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <div>
                  <label className="label mb-0 flex items-center gap-1.5"><FieldIcon name="link" />顶部导航链接</label>
                  <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">显示在首页顶部导航栏。建议保留“首页 / 图库 / 文档 / 示例”等常用入口。</p>
                </div>
                <button type="button" onClick={() => addLinkItem('header_links')} className="btn-primary text-xs px-3 py-1.5">
                  新增顶部链接
                </button>
              </div>
              <div className="space-y-2">
                {headerLinks.map((link, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr_auto] gap-2 p-3 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
                    <div>
                      <label className="label flex items-center gap-1.5"><FieldIcon name="text" />显示文字</label>
                      <input
                        type="text"
                        value={link.label || ''}
                        onChange={(e) => updateLinkItem('header_links', index, 'label', e.target.value)}
                        placeholder="例如：首页"
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label flex items-center gap-1.5"><FieldIcon name="link" />链接地址</label>
                      <input
                        type="text"
                        value={link.href || ''}
                        onChange={(e) => updateLinkItem('header_links', index, 'href', e.target.value)}
                        placeholder="例如：/ 或 /gallery"
                        className="input"
                      />
                    </div>
                    <div className="flex md:items-end">
                      <button
                        type="button"
                        onClick={() => removeLinkItem('header_links', index)}
                        className="w-full md:w-auto px-3 py-2 text-sm text-error-DEFAULT hover:underline"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
                {headerLinks.length === 0 && (
                  <div className="p-4 rounded-lg bg-[var(--color-bg-subtle)] text-sm text-[var(--color-text-tertiary)] border border-dashed border-[var(--color-border)]">
                    暂无顶部导航链接，点击“新增顶部链接”添加。
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===== 邮件服务设置 ===== */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-[var(--color-text)]">邮件服务设置</h3>
            {renderSectionSave('smtp', ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_from', 'smtp_secure'])}
          </div>
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

          <div className="space-y-4 max-w-5xl">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="label flex items-center gap-1.5"><FieldIcon name="server" />SMTP 服务器</label>
                <input
                  type="text"
                  value={settings.smtp_host}
                  onChange={(e) => handleChange('smtp_host', e.target.value)}
                  placeholder="smtp.qq.com"
                  className="input"
                />
              </div>
              <div>
                <label className="label flex items-center gap-1.5"><FieldIcon name="hash" />端口</label>
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
              <label className="label flex items-center gap-1.5"><FieldIcon name="mail" />发件邮箱</label>
              <input
                type="email"
                value={settings.smtp_user}
                onChange={(e) => handleChange('smtp_user', e.target.value)}
                placeholder="your@qq.com"
                className="input"
              />
            </div>
            <div>
              <label className="label flex items-center gap-1.5"><FieldIcon name="lock" />授权码 / 密码</label>
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
              <label className="label flex items-center gap-1.5"><FieldIcon name="user" />发件人名称</label>
              <input
                type="text"
                value={settings.smtp_from}
                onChange={(e) => handleChange('smtp_from', e.target.value)}
                placeholder={`"${settings.site_name || 'ZL-综合API'}" <${settings.smtp_user || 'your@qq.com'}>`}
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
              <label className="label flex items-center gap-1.5"><FieldIcon name="send" />测试邮件发送</label>
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[var(--color-text)]">API 限流设置</h3>
            {renderSectionSave('ratelimit', ['rate_limit_enabled', 'rate_limit_global', 'rate_limit_window'])}
          </div>
          <div className="space-y-4 max-w-5xl">
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
              <label className="label flex items-center gap-1.5"><FieldIcon name="gauge" />全局限流速率（次/小时）</label>
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
              <label className="label flex items-center gap-1.5"><FieldIcon name="clock" />限流时间窗口（毫秒）</label>
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
