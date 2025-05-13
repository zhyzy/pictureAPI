# 樱道 API 接口平台启动指南

## 项目概述

樱道API是一个美观、现代的API接口展示平台，用于展示各种随机图片API接口。该项目使用Next.js和React构建，拥有流畅的动画效果和响应式设计。

## 快速开始

### 安装依赖

首先，确保您已经安装了Node.js (建议14.x或更高版本)。然后安装项目依赖：

```bash
# 使用npm
npm install

# 或者使用yarn
yarn install
```

### 启动开发服务器

安装完依赖后，您可以启动开发服务器：

```bash
# 使用npm
npm run dev

# 或者使用yarn
yarn dev
```

然后在浏览器中访问 [http://localhost:3000](http://localhost:3000) 查看项目。

## 项目结构

```
/
├── components/           # React组件
│   ├── layout/           # 布局组件 (Header, Footer等)
│   └── ui/               # UI组件 (ApiCard, CategoryButton等)
├── data/                 # 数据文件
│   └── apiData.ts        # API接口数据
├── pages/                # Next.js页面
│   ├── _app.tsx          # Next.js应用入口
│   └── index.tsx         # 主页面
├── public/               # 静态资源
├── styles/               # 样式文件
│   └── globals.css       # 全局样式
├── package.json          # 项目依赖
└── tsconfig.json         # TypeScript配置
```

## 自定义API数据

您可以通过修改 `data/apiData.ts` 文件来自定义API接口信息。

## 功能特点

- 🌈 美观的UI设计，支持暗黑/明亮主题
- ✨ 流畅的动画效果和交互体验
- 🔍 强大的搜索和分类功能
- 📊 实时显示API调用统计数据
- 📱 响应式设计，完美支持各种设备
- 🌓 支持暗黑/明亮主题切换

## 部署

构建生产版本：

```bash
# 使用npm
npm run build
npm run start

# 或者使用yarn
yarn build
yarn start
```

您也可以将项目部署到Vercel、Netlify等平台，只需连接您的Git仓库即可。

## 技术支持

如有任何问题，请提交issue或联系管理员。 