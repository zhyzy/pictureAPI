// API接口数据
export interface ApiInterface {
  id: number;
  name: string;
  url: string;
  description: string;
  category: string;
  usageCount: number;
}

// API分类
export const apiCategories = [
  { id: 1, name: '动漫图片API', description: '各种二次元动漫图片API接口' },
  { id: 2, name: '壁纸API', description: '高清壁纸和背景图片API' },
  { id: 3, name: 'JSON数据API', description: '各种格式JSON数据API' },
  { id: 4, name: '工具API', description: '各种实用工具类API' },
  { id: 5, name: '其他API', description: '其他分类API' }
];

// API接口数据
export const apiInterfaces: ApiInterface[] = [
  {
    id: 1,
    name: '动漫综合1',
    url: 'https://api.example.com/anime/v1',
    description: '获取随机动漫图片，支持多种分类和标签',
    category: '动漫图片API',
    usageCount: 106087
  },
  {
    id: 2,
    name: '动漫综合2',
    url: 'https://api.example.com/anime/v2',
    description: '高清动漫图片接口，支持分辨率选择',
    category: '动漫图片API',
    usageCount: 65641
  },
  {
    id: 3,
    name: '动漫综合3',
    url: 'https://api.example.com/anime/v3',
    description: '动漫角色图片API，按角色名筛选',
    category: '动漫图片API',
    usageCount: 4452
  },
  {
    id: 4,
    name: '动漫综合4',
    url: 'https://api.example.com/anime/v4',
    description: '二次元表情包API，适合聊天使用',
    category: '动漫图片API',
    usageCount: 3790
  },
  {
    id: 5,
    name: '动漫综合5',
    url: 'https://api.example.com/anime/v5',
    description: '动漫场景图API，高清无水印',
    category: '动漫图片API',
    usageCount: 5968
  },
  {
    id: 6,
    name: '壁纸API-1',
    url: 'https://api.example.com/wallpaper/v1',
    description: '高清手机壁纸，垂直分辨率优化',
    category: '壁纸API',
    usageCount: 89752
  },
  {
    id: 7,
    name: '壁纸API-2',
    url: 'https://api.example.com/wallpaper/v2',
    description: '电脑桌面壁纸，支持多种分辨率',
    category: '壁纸API',
    usageCount: 78564
  },
  {
    id: 8,
    name: 'JSON参数API',
    url: 'https://api.example.com/json/params',
    description: 'JSON格式数据接口，支持自定义参数',
    category: 'JSON数据API',
    usageCount: 25431
  }
];

// 使用统计
export const usageStats = {
  today: 1237,
  yesterday: 28887,
  thisWeek: 106717,
  thisMonth: 579622,
  total: 3336544
}; 