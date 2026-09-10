// API接口数据 - 与数据库保持一致
export interface ApiInterface {
  id: number;
  name: string;
  url: string;
  description: string;
  category: string;
  usageCount?: number;
  type?: 'image' | 'video';
}

// API分类（与数据库中的 categories 表对应）
export const apiCategories = [
  { id: 1, name: '动漫', slug: 'anime', description: '动漫二次元图片', emoji: '🎌' },
  { id: 2, name: '小姐姐', slug: 'girl', description: '精美小姐姐图片', emoji: '👧' },
  { id: 3, name: '风景', slug: 'scenery', description: '自然风景图片', emoji: '🏔️' },
  { id: 4, name: '动物', slug: 'animal', description: '可爱动物图片', emoji: '🐱' },
  { id: 5, name: '美食', slug: 'food', description: '美食图片', emoji: '🍜' },
  { id: 6, name: '随机', slug: 'random', description: '随机图片', emoji: '🎲' },
];

// API接口数据（usageCount 由 /api/stats/endpoints 实时填充）
export const apiInterfaces: ApiInterface[] = [
  {
    id: 1,
    name: '随机动漫图',
    url: '/api/v1/random/anime',
    description: '获取随机动漫二次元图片，支持多种风格',
    category: '动漫',
  },
  {
    id: 2,
    name: '随机小姐姐图',
    url: '/api/v1/random/girl',
    description: '获取精美小姐姐图片，清新自然',
    category: '小姐姐',
  },
  {
    id: 3,
    name: '随机风景图',
    url: '/api/v1/random/scenery',
    description: '获取自然风景图片，旅行风光',
    category: '风景',
  },
  {
    id: 4,
    name: '随机动物图',
    url: '/api/v1/random/animal',
    description: '获取可爱动物图片，治愈心灵',
    category: '动物',
  },
  {
    id: 5,
    name: '随机美食图',
    url: '/api/v1/random/food',
    description: '获取美食图片，令人垂涎',
    category: '美食',
  },
  {
    id: 6,
    name: '随机图片',
    url: '/api/v1/random/random',
    description: '获取随机图片，各种类型都有',
    category: '随机',
  },
];
