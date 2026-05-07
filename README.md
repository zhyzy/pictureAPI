# 🌸 樱道 API — 高质量图片接口服务平台

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14.1-black?logo=next.js)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178c6?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwindcss)
![SQLite](https://img.shields.io/badge/SQLite-sql.js-003b57?logo=sqlite)
![License](https://img.shields.io/badge/License-MIT-green)

**一个功能完善、开箱即用的图片 API 服务平台。**  
支持多主题、用户体系、后台管理、腾讯云 COS 存储、邮箱验证等全套能力。

[快速开始](#-快速开始) · [功能特性](#-功能特性) · [部署指南](#-生产部署) · [API 文档](#-api-文档) · [常见问题](#-常见问题)

</div>

---

## 📖 项目简介

樱道 API 是一个基于 Next.js 全栈构建的图片接口服务平台，适合个人站长、开发者快速搭建自己的图床 API 服务。

**核心亮点：**

- 🎨 **10 套精美主题**：日式极简、赛博朋克、二次元萌系等风格任意切换
- 🔑 **完整用户体系**：注册/登录/邮箱验证/API Key 管理/个人资料编辑
- 🛠️ **强大后台管理**：图片、分类、用户、API 接口、系统设置一站式管理
- 📦 **零额外依赖**：内嵌 SQLite（sql.js），无需单独安装数据库
- ☁️ **云存储支持**：集成腾讯云 COS，轻松扩展图片存储容量
- 📧 **邮件服务**：支持 SMTP 配置，验证码 / 通知邮件开箱即用

---

## ✨ 功能特性

### 前台功能

| 功能 | 说明 |
|------|------|
| 首页展示 | 平台介绍、统计数据、快速开始引导 |
| 文档页 | 动态读取分类，API 调用说明完整展示 |
| 示例页 | 可视化测试各分类 API，实时预览图片 |
| 图片瀑布流 | 分类浏览全部图片 |
| 主题切换 | 10 种主题，实时预览并保存到本地 |

### 用户中心

| 功能 | 说明 |
|------|------|
| 注册 / 登录 | 用户名 + 密码，支持邮箱绑定验证 |
| API Key 管理 | 一键复制、查看调用统计 |
| 个人资料编辑 | 修改头像（URL）、用户名 |
| 密码修改 | 验证旧密码后安全更新 |
| 调用记录 | 查看 API 使用趋势 |

### 后台管理

| 模块 | 功能 |
|------|------|
| 仪表盘 | 用户数、图片数、调用次数统计 |
| 用户管理 | 查看/禁用/删除用户，单独配置限流 |
| 分类管理 | 增删改查分类（slug + 中文名） |
| 图片管理 | 批量上传（COS）、删除、分类归属 |
| API 管理 | 查看/维护对外接口 |
| 系统设置 | 网站名称、Logo、Favicon、备案号、SMTP、COS、主题等 |

---

## 🛠️ 技术栈

| 层次 | 技术 |
|------|------|
| 框架 | Next.js 14.1 (App Router 兼容 Pages Router) |
| UI | React 18 + TypeScript 5.3 + TailwindCSS 3.4 |
| 动画 | Framer Motion 11 |
| 数据库 | SQLite（运行时 sql.js，无 GLIBC 依赖） |
| 认证 | JSON Web Token (jsonwebtoken) |
| 密码 | bcryptjs |
| 邮件 | Nodemailer |
| 存储 | 腾讯云 COS (cos-nodejs-sdk-v5) |
| ID 生成 | nanoid |
| 运行时 | Node.js 18+ |

---

## 🚀 快速开始

### 环境要求

- **Node.js** `>= 18.0.0`（推荐 22.x LTS）
- **npm** `>= 9.x` 或 **yarn**
- **Git**（可选，用于克隆项目）

### 第一步：获取项目

```bash
# 方式一：Git 克隆
git clone https://github.com/your-username/your-repo.git
cd your-repo

# 方式二：直接解压项目压缩包后进入目录
```

### 第二步：安装依赖

```bash
npm install
```

### 第三步：配置环境变量

在项目根目录创建 `.env.local` 文件：

```env
# ==============================
# 必填
# ==============================

# JWT 密钥（生产环境请使用随机长字符串）
JWT_SECRET=your-super-secret-jwt-key

# 网站访问地址
NEXT_PUBLIC_SITE_URL=http://localhost:3008

# ==============================
# 腾讯云 COS（可选，图片云存储）
# ==============================

COS_SECRET_ID=your-cos-secret-id
COS_SECRET_KEY=your-cos-secret-key
COS_BUCKET=your-bucket-name-1234567890
COS_REGION=ap-guangzhou
```

### 第四步：启动开发服务器

```bash
npm run dev
# 访问 http://localhost:3000
```

### 第五步：登录后台初始化数据

数据库首次启动时自动创建，默认管理员账号：

| 项目 | 值 |
|------|----|
| 用户名 | `admin` |
| 密码 | `zl939921104` |

> ⚠️ **首次登录后请立即修改密码！**

登录后进入后台 → 点击 **"初始化数据"** 按钮，系统将自动创建默认分类和 API 接口。

---

## 📦 生产部署

### 方式一：直接部署（推荐）

```bash
# 1. 安装依赖
npm install

# 2. 构建项目
npm run build

# 3. 启动（默认端口 3008）
npm start
```

### 方式二：PM2 守护进程

```bash
# 安装 PM2
npm install -g pm2

# 启动
pm2 start npm --name "pictureapi" -- start

# 开机自启
pm2 startup
pm2 save

# 常用命令
pm2 status          # 查看状态
pm2 logs pictureapi # 查看日志
pm2 restart pictureapi
pm2 stop pictureapi
```

### 方式三：1Panel 面板部署

> 适合通过宝塔/1Panel 面板管理服务器的用户

1. 上传项目文件到服务器目录（如 `~/pictureAPI`）
2. 在面板中配置 Node.js 运行时
3. 安装依赖：`npm install`
4. 构建：`npm run build`
5. 启动命令：`npm start`（端口 3008）

**⚠️ 重要：每次更新代码后必须清除构建缓存再重建：**

```bash
rm -rf .next
npm run build
```

### Nginx 反向代理配置

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    access_log /var/log/nginx/pictureapi-access.log;
    error_log  /var/log/nginx/pictureapi-error.log;
    
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3008;
        proxy_http_version 1.1;
        proxy_set_header Upgrade    $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host       $host;
        proxy_set_header X-Real-IP  $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # 静态资源长缓存
    location /_next/static {
        proxy_pass http://localhost:3008;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

### SSL 证书（推荐）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 申请并自动配置证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 测试自动续期
sudo certbot renew --dry-run
```

---

## 📁 项目结构

```
pictureAPI/
├── components/            # 公共 React 组件
├── pages/                 # Next.js 页面 & API 路由
│   ├── api/
│   │   ├── admin/         # 后台管理 API
│   │   ├── auth/          # 认证 API（登录/注册/邮箱验证）
│   │   ├── categories.js  # 分类列表（公开）
│   │   ├── images/        # 图片 API
│   │   ├── settings/      # 系统设置
│   │   ├── stats/         # 统计数据
│   │   ├── user/          # 用户个人 API（profile/password）
│   │   └── v1/            # 对外图片接口（/api/v1/random/:slug）
│   ├── admin/             # 后台管理页面
│   ├── auth/              # 登录 / 注册页面
│   ├── user/              # 用户中心
│   ├── docs.tsx           # API 文档页
│   ├── example.tsx        # API 示例演示页
│   ├── gallery.tsx        # 图片画廊页
│   └── index.tsx          # 首页
├── lib/                   # 核心工具库
│   ├── db.js              # sql.js 数据库（自动初始化 & 迁移）
│   ├── auth.js            # JWT 鉴权 & withAuth 高阶函数
│   ├── email.js           # Nodemailer 邮件服务
│   ├── cos.js             # 腾讯云 COS 工具
│   └── themes.js          # 主题配置
├── styles/
│   ├── globals.css
│   └── themes/            # 10 套主题 CSS 变量文件
├── data/
│   └── pictureapi.db      # SQLite 数据库文件（运行后自动生成）
├── public/                # 静态资源（favicon、logo 等）
├── .env.local             # 环境变量（不提交到 Git）
└── package.json
```

---

## 📡 API 文档

### 公开接口

#### 获取随机图片

```
GET /api/v1/random/:category
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `category` | path | ✅ | 分类 slug（从后台分类管理获取） |
| `api_key` | query | ❌ | 用于限流统计，不传则使用全局限流 |

**响应示例：**

```json
{
  "url": "https://your-cos-bucket.cos.ap-guangzhou.myqcloud.com/anime/001.jpg",
  "id": 42,
  "category": "anime",
  "category_name": "动漫"
}
```

#### 获取分类列表

```
GET /api/categories
```

#### 获取图片列表

```
GET /api/images?page=1&limit=20&category_id=1
```

#### 获取网站设置（公开）

```
GET /api/settings/public
```

#### 获取统计数据

```
GET /api/stats/public
```

---

### 认证接口

#### 注册

```
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",   // 2-20 字符
  "password": "string",   // 6-50 字符
  "email": "string"       // 可选
}
```

#### 登录

```
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

#### 获取当前用户

```
GET /api/auth/me
Authorization: Bearer <token>
```

---

### 用户接口

#### 更新个人资料

```
PUT /api/user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "string",   // 可选，2-20 字符
  "avatar": "string"      // 可选，头像 URL
}
```

#### 修改密码

```
PUT /api/user/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "string",
  "newPassword": "string",      // 6-50 字符
  "confirmPassword": "string"
}
```

---

### 后台管理接口

> 所有后台接口需管理员 Token：`Authorization: Bearer <admin_token>`

```
# 用户管理
GET    /api/admin/users
POST   /api/admin/users
PUT    /api/admin/users
DELETE /api/admin/users

# 分类管理
GET    /api/admin/categories
POST   /api/admin/categories
PUT    /api/admin/categories
DELETE /api/admin/categories

# 图片管理
GET    /api/admin/images
POST   /api/admin/images
DELETE /api/admin/images

# 系统设置
GET    /api/admin/settings
PUT    /api/admin/settings
POST   /api/admin/settings      # 批量更新

# 统计数据
GET    /api/admin/stats
```

---

## 🎨 主题开发

项目支持 10 套主题，样式文件位于 `styles/themes/`，每套主题通过 CSS 变量实现。

### 添加新主题

1. 在 `styles/themes/` 创建新 CSS 文件（如 `my-theme.css`）
2. 定义 CSS 变量：

```css
[data-theme="my-theme"] {
  --color-bg: #ffffff;
  --color-bg-elevated: #f9f9f9;
  --color-bg-subtle: #f0f0f0;
  --color-text: #111111;
  --color-text-secondary: #555555;
  --color-text-tertiary: #999999;
  --color-border: #e0e0e0;
  --color-border-subtle: #f0f0f0;
  --color-primary: #e85d7e;
  --color-primary-hover: #d44a6b;
  --color-primary-subtle: #fef0f3;
  --font-serif: "Noto Serif SC", Georgia, serif;
  --font-sans: "Noto Sans SC", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;
  --shadow-subtle: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-soft: 0 4px 12px rgba(0,0,0,0.1);
  --shadow-medium: 0 8px 24px rgba(0,0,0,0.15);
}
```

3. 在 `lib/themes.js` 中注册主题信息
4. 在 `styles/globals.css` 中导入该文件

---

## ❓ 常见问题

### Q1：数据库文件在哪里？

`data/pictureapi.db`，首次启动自动生成，备份时直接复制该文件即可。

### Q2：如何修改管理员密码？

登录后进入用户中心 → 修改密码，或在后台用户管理中操作。

### Q3：邮件发送失败？

- 确认使用的是**授权码**（非登录密码）
- 确认 SMTP 服务器地址、端口正确
- QQ 邮箱：`smtp.qq.com:587`；163 邮箱：`smtp.163.com:25`

### Q4：图片上传失败？

- 检查 COS SecretId / SecretKey / Bucket / Region 是否正确
- 确认存储桶访问权限为**公有读私有写**
- 检查 CORS 配置是否允许来源

### Q5：更新代码后页面没变化？

必须清除 Next.js 构建缓存并重新构建：

```bash
rm -rf .next
npm run build
npm start   # 或通过面板重启
```

### Q6：部署后端口冲突？

项目默认端口为 **3008**，可在 `package.json` 的 `start` 脚本中修改：

```json
"start": "next start -p 3008"
```

---

## 📋 开发计划

- [x] 多主题系统（10 套主题）
- [x] 完整用户体系（注册/登录/邮箱验证）
- [x] API Key 管理与限流
- [x] 后台全功能管理
- [x] 腾讯云 COS 集成
- [x] 动态分类管理（前后台同步）
- [x] 用户资料编辑（头像/用户名/密码）
- [x] Favicon 配置支持
- [ ] 图片批量上传
- [ ] 更多统计图表
- [ ] 多语言支持
- [ ] API 文档自动生成

---

## 📄 License

[MIT](./LICENSE) © 2024 樱道 API

---

<div align="center">
  如有问题欢迎提交 <a href="../../issues">Issue</a> 或 <a href="../../pulls">Pull Request</a>
</div>
