# 樱道 API 项目文档

## 项目概述

樱道 API 是一个高质量的图片接口服务平台，提供多种分类的随机图片 API 接口。项目使用 Next.js 14 构建，支持管理员后台、用户中心、实时统计等功能。

- **项目名**：樱道 API (Sakura Dao API)
- **版本**：0.1.0
- **技术栈**：Next.js 14.1.0 + TypeScript + Tailwind CSS + SQLite
- **数据库**：SQLite (better-sqlite3)
- **部署环境**：Windows Server / Linux

---

## 功能特性

### 前端功能
1. **首页**
   - API 接口展示（动态从数据库读取）
   - 实时调用统计（今日、本周、本月、累计）
   - 分类筛选和搜索
   - 响应式设计

2. **管理员后台** (`/admin`)
   - 仪表盘：数据统计可视化
   - API 管理：增删改查 API 接口
   - 分类管理：管理图片分类
   - 图片管理：管理图片库
   - 系统设置：站点名称、描述等

3. **用户中心** (`/user`)
   - 仪表盘：个人调用统计
   - API Key 管理
   - 调用记录查询

4. **文档页面** (`/docs`)
   - API 使用文档
   - 代码示例

5. **图库页面** (`/gallery`)
   - 图片浏览
   - 分类查看

### 后端功能
1. **API 接口** (`/api/v1/random/[category]`)
   - 支持多种分类：动漫、小姐姐、风景、动物、美食、随机
   - JWT 认证（可选）
   - 频率限制
   - COS 存储集成

2. **管理 API**
   - `/api/admin/stats` - 管理员统计
   - `/api/admin/apis` - API 管理
   - `/api/admin/categories` - 分类管理
   - `/api/admin/images` - 图片管理
   - `/api/admin/settings` - 系统设置

3. **用户 API**
   - `/api/user/stats` - 用户统计
   - `/api/user/keys` - API Key 管理
   - `/api/user/logs` - 调用记录

4. **公共 API**
   - `/api/stats/public` - 公开统计数据
   - `/api/stats/endpoints` - 端点调用统计
   - `/api/apis` - API 列表
   - `/api/categories` - 分类列表
   - `/api/settings/public` - 公开设置

5. **认证 API**
   - `/api/auth/register` - 注册
   - `/api/auth/login` - 登录
   - `/api/auth/me` - 获取当前用户信息

---

## 项目结构

```
pictureAPI/
├── pages/                      # Next.js 页面
│   ├── api/                    # API 路由
│   │   ├── v1/random/         # 图片 API
│   │   ├── admin/             # 管理 API
│   │   ├── user/              # 用户 API
│   │   ├── auth/              # 认证 API
│   │   ├── stats/             # 统计 API
│   │   ├── apis.js            # API 列表
│   │   ├── categories.js      # 分类列表
│   │   └── settings/          # 设置 API
│   ├── admin/                 # 管理后台页面
│   ├── user/                  # 用户页面
│   ├── _document.tsx          # 自定义 Document
│   ├── _app.tsx              # 自定义 App
│   ├── index.tsx             # 首页
│   ├── docs.tsx              # 文档页面
│   └── gallery.tsx           # 图库页面
├── components/               # React 组件
│   ├── layout/               # 布局组件
│   └── ui/                  # UI 组件
├── lib/                      # 工具库
│   ├── db.js                 # 数据库初始化
│   ├── auth.js               # 认证工具
│   ├── cos.js                # COS 存储
│   └── middleware/           # 中间件
├── data/                     # 数据文件
│   ├── apiData.ts            # API 数据接口
│   └── init.db              # SQLite 数据库
├── styles/                   # 样式文件
│   ├── globals.css          # 全局样式
│   └── variables.css        # CSS 变量
├── prisma/                   # Prisma 配置（如果有）
├── node_modules/            # 依赖包
├── .env.local               # 环境变量
├── next.config.js           # Next.js 配置
├── tailwind.config.js       # Tailwind 配置
├── tsconfig.json            # TypeScript 配置
├── package.json            # 项目配置
└── README.md              # 项目说明
```

---

## 数据库设计

### 表结构

1. **users** - 用户表
   - id (INTEGER PRIMARY KEY)
   - username (TEXT UNIQUE)
   - email (TEXT UNIQUE)
   - password (TEXT)
   - role (TEXT DEFAULT 'user')
   - created_at (TEXT)
   - updated_at (TEXT)

2. **apis** - API 表
   - id (INTEGER PRIMARY KEY)
   - name (TEXT)
   - description (TEXT)
   - endpoint (TEXT UNIQUE)
   - category_id (INTEGER)
   - method (TEXT DEFAULT 'GET')
   - params (TEXT)
   - example (TEXT)
   - is_active (INTEGER DEFAULT 1)
   - rate_limit (INTEGER)
   - created_at (TEXT)
   - updated_at (TEXT)

3. **categories** - 分类表
   - id (INTEGER PRIMARY KEY)
   - name (TEXT)
   - slug (TEXT UNIQUE)
   - description (TEXT)
   - created_at (TEXT)
   - updated_at (TEXT)

4. **api_logs** - API 调用日志表
   - id (INTEGER PRIMARY KEY)
   - user_id (INTEGER)
   - api_id (INTEGER)
   - endpoint (TEXT)
   - ip (TEXT)
   - user_agent (TEXT)
   - status (INTEGER)
   - response_time (INTEGER)
   - created_at (TEXT)

5. **api_keys** - API Key 表
   - id (INTEGER PRIMARY KEY)
   - user_id (INTEGER)
   - key (TEXT UNIQUE)
   - name (TEXT)
   - is_active (INTEGER DEFAULT 1)
   - created_at (TEXT)
   - updated_at (TEXT)

6. **settings** - 系统设置表
   - id (INTEGER PRIMARY KEY)
   - key (TEXT UNIQUE)
   - value (TEXT)
   - created_at (TEXT)
   - updated_at (TEXT)

7. **images** - 图片表
   - id (INTEGER PRIMARY KEY)
   - category_id (INTEGER)
   - url (TEXT)
   - thumbnail (TEXT)
   - width (INTEGER)
   - height (INTEGER)
   - size (INTEGER)
   - format (TEXT)
   - source (TEXT)
   - is_active (INTEGER DEFAULT 1)
   - created_at (TEXT)
   - updated_at (TEXT)

---

## API 文档

### 公共 API

#### 1. 获取 API 列表
```
GET /api/apis
响应：{ apis: [{ id, name, url, description, category }] }
```

#### 2. 获取分类列表
```
GET /api/categories
响应：{ categories: [{ id, name, slug, description }] }
```

#### 3. 获取公开统计
```
GET /api/stats/public
响应：{ today, thisWeek, thisMonth, total }
```

#### 4. 获取端点统计
```
GET /api/stats/endpoints
响应：{ "/api/v1/random/anime": 123, ... }
```

#### 5. 获取公开设置
```
GET /api/settings/public
响应：{ settings: { site_name, hero_tagline, ... } }
```

### 图片 API

#### 获取随机图片
```
GET /api/v1/random/[category]
Headers:
  Authorization: Bearer <token> (可选)
响应：重定向到图片 URL
```

### 管理 API

所有管理 API 需要管理员权限（JWT Token）。

#### 获取管理统计
```
GET /api/admin/stats
Headers:
  Authorization: Bearer <admin_token>
响应：{ totalApis, totalUsers, totalCalls, ... }
```

#### API 管理
```
GET    /api/admin/apis - 获取 API 列表
POST   /api/admin/apis - 创建 API
PUT    /api/admin/apis/:id - 更新 API
DELETE /api/admin/apis/:id - 删除 API
```

#### 分类管理
```
GET    /api/admin/categories - 获取分类列表
POST   /api/admin/categories - 创建分类
PUT    /api/admin/categories/:id - 更新分类
DELETE /api/admin/categories/:id - 删除分类
```

---

## 安装部署

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0
- SQLite3

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd pictureAPI
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
创建 `.env.local` 文件：
```
DATABASE_URL=./data/init.db
JWT_SECRET=your-secret-key
COS_SECRET_ID=your-cos-secret-id
COS_SECRET_KEY=your-cos-secret-key
COS_BUCKET=your-bucket-name
COS_REGION=your-region
```

4. **初始化数据库**
```bash
npm run init-db
```

5. **启动开发服务器**
```bash
npm run dev
```
访问 http://localhost:3000

6. **构建生产版本**
```bash
npm run build
npm run start
```

---

## 配置说明

### Next.js 配置 (next.config.js)
- 配置了图片域名白名单
- 配置了 COS 存储域名

### Tailwind 配置 (tailwind.config.js)
- 自定义主题颜色
- 自定义字体家族

### TypeScript 配置 (tsconfig.json)
- 配置了路径别名 `@/*`
- 配置了严格模式

---

## 常见问题

### 1. 端口被占用
**问题**：`Port 3000 is in use`
**解决**：Next.js 会自动切换到 3001，或手动指定端口：
```bash
npm run dev -- -p 3002
```

### 2. 数据库锁定
**问题**：`SQLITE_BUSY: database is locked`
**解决**：确保没有其他进程访问数据库文件

### 3. 图片加载失败
**问题**：图片无法显示
**解决**：检查 COS 配置是否正确，检查图片 URL 是否可访问

### 4. JWT 认证失败
**问题**：`Invalid token`
**解决**：检查 JWT_SECRET 环境变量是否正确

---

## 开发指南

### 添加新功能
1. 在 `pages/api/` 创建 API 路由
2. 在 `pages/` 创建页面
3. 在 `components/` 创建组件
4. 更新路由和导航

### 数据库迁移
1. 修改 `lib/db.js` 中的初始化逻辑
2. 备份现有数据库
3. 重新运行 `npm run init-db`

### 部署到生产环境
1. 运行 `npm run build`
2. 配置生产环境变量
3. 使用 PM2 或其他进程管理器启动应用
4. 配置 Nginx 反向代理

---

## 更新日志

### v0.1.0 (2026-05-04)
- ✅ 实现动态 API 列表加载
- ✅ 实现动态分类列表加载
- ✅ 修复调用量统计显示
- ✅ 优化 Google Fonts 加载
- ✅ 创建自定义 _document.tsx
- ✅ 添加 API 文档

---

## 联系方式

- 作者：樱道团队
- 邮箱：support@yingdao-api.com
- 官网：https://api.yingdao.com
