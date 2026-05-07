// 主题配置
export const themes = [
  {
    id: 'default',
    name: '日式极简',
    description: '温暖赭红，日式杂志风格',
    color: '#c75b39',
  },
  {
    id: 'tech',
    name: '科技未来',
    description: '深色代码感，科技蓝',
    color: '#58a6ff',
  },
  {
    id: 'anime',
    name: '二次元萌系',
    description: '樱花粉色，可爱萌系',
    color: '#ff6b9d',
  },
  {
    id: 'business',
    name: '商务专业',
    description: '商务蓝色，专业稳重',
    color: '#2563eb',
  },
  {
    id: 'nature',
    name: '自然清新',
    description: '自然绿色，有机温暖',
    color: '#16a34a',
  },
  {
    id: 'retro',
    name: '复古怀旧',
    description: '复古棕色，像素怀旧',
    color: '#c17817',
  },
  {
    id: 'cyberpunk',
    name: '赛博朋克',
    description: '紫色霓虹，赛博风格',
    color: '#b026ff',
  },
  {
    id: 'magazine',
    name: '杂志编辑',
    description: '经典黑白，编辑排版',
    color: '#1a1a1a',
  },
  {
    id: 'minimal',
    name: '纯粹极简',
    description: '纯黑纯白，极致简约',
    color: '#000000',
  },
  {
    id: 'ocean',
    name: '海洋深蓝',
    description: '蓝色渐变，海洋风格',
    color: '#0284c7',
  },
];

export function getCurrentTheme() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('site_theme') || 'default';
  }
  return 'default';
}

export function setTheme(themeId) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('site_theme', themeId);
    document.documentElement.setAttribute('data-theme', themeId);
  }
}

export function getThemeById(themeId) {
  return themes.find(t => t.id === themeId) || themes[0];
}
