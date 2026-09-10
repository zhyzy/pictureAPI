<div align="center">

# 🖼️ ZL-综合API

**一站式随机图片 / 视频 API 服务平台**

基于 Next.js 14 构建的高性能图床与内容接口平台——开箱即用的图库站、随机素材接口、机器人图片源，一个项目全部搞定。

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57?logo=sqlite&logoColor=white)](https://github.com/WiseLibs/better-sqlite3)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**[快速开始](#-快速开始) · [API 使用](#-api-使用) · [部署指南](#-生产部署) · [常见问题](#-常见问题)**

</div>

---

## ✨ 特性亮点

- 🎯 **双媒体接口** —— 随机图片 `/api/v1/random/:category`、随机视频 `/api/v1/video/:category`，支持 JSON 返回与 302 直链跳转两种模式
- 🔑 **多用户 API Key 体系** —— 每个用户独立 Key，调用次数自动统计，管理后台一目了然
- ☁️ **三种存储后端** —— 七牛云 Kodo、腾讯云 COS、本地磁盘，可按分类灵活切换；媒体统一走同源代理，避免跨域加载失败
- 🎨 **10 套主题 + 深色模式** —— 自然绿、赛博朋克、海洋、复古、杂志……一键切换全站配色
- 🛠 **可视化后台** —— 分类、媒体、API、用户、系统设置、水印、轮播图、菜单全部面板化操作
- 🖋 **图片水印引擎** —— 文字水印支持九宫格位置、字号/透明度/颜色自定义，Canvas 实时预览
- 📈 **调用统计** —— 分类热度、接口调用量、用户用量自动聚合，首页接口按热度排序
- 📧 **邮箱注册** —— 内置 SMTP 验证邮件，连接池 + 自动重试，不怕邮件服务商限流
- 🔄 **后台一键更新** —— 自动检测 GitHub 新版本，备份数据后拉取、构建、重启一条龙
- ⚡ **零配置数据库** —— better-sqlite3 + WAL 模式，首次启动自动建库，无需安装任何数据库服务

## 🧭 页面一览

| 模块 | 说明 |
| --- | --- |
| 🏠 首页 | 主题背景、轮播图、统计数据、接口搜索（按热度排序） |
| 📖 文档页 | 自动同步后台新增的分类和接口，无需手写文档 |
| 🌊 图库 | 图片 / 视频双 Tab，瀑布流按原始比例展示 |
| 👤 用户中心 | API Key 管理、调用统计、资料编辑 |
| 🧑‍💼 管理后台 | 仪表盘、分类、图片、视频、API、用户、系统设置、系统更新 |

## 🚀 快速开始

### 环境要求

| 依赖 | 版本 |
| --- | --- |
| Node.js | 20 LTS 或更高 |
| npm | 10 或更高 |
| Git | 仅后台一键更新必需 |

### 1️⃣ 克隆项目

> 💡 推荐使用 Git 克隆。压缩包方式没有 `.git` 信息，后台无法自动拉取更新。

```bash
git clone https://github.com/zhyzy/pictureAPI.git
cd pictureAPI
```

### 2️⃣ 安装依赖

```bash
npm install
```

> ⚠️ 如果 npm 提示依赖审计风险，先不要直接 `npm audit fix --force`，它可能升级大版本破坏项目。确认能跑起来后再按需处理。

### 3️⃣ 配置环境变量

在项目根目录创建 `.env.local`，最小可用配置只需两行：

```env
JWT_SECRET=请改成一段足够长的随机字符串
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

<details>
<summary><b>完整配置示例（点击展开）</b></summary>

```env
# 必填：JWT 登录密钥，生产环境必须修改
JWT_SECRET=请改成一段足够长的随机字符串

# 网站地址
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# 可选：首次初始化管理员密码（不填默认为 zl939921104）
ADMIN_PASSWORD=

# 可选：七牛云 Kodo（外链域名不带末尾斜杠，需绑定到 Bucket）
QINIU_ACCESS_KEY=
QINIU_SECRET_KEY=
QINIU_BUCKET=
QINIU_DOMAIN=

# 可选：腾讯云 COS
COS_SECRET_ID=
COS_SECRET_KEY=
COS_BUCKET=
COS_REGION=

# 可选：后台一键更新
PICTURE_API_UPDATE_REPO=zhyzy/pictureAPI
PICTURE_API_UPDATE_BRANCH=master
PICTURE_API_UPDATE_ENABLED=false
PICTURE_API_UPDATE_RESTART_COMMAND=
```

</details>

### 4️⃣ 启动

```bash
npm run dev
```

打开 `http://localhost:3000`，后台入口在 `http://localhost:3000/auth/login`。

### 5️⃣ 登录管理员

首次启动自动创建数据库和默认管理员：

| 项目 | 值 |
| --- | --- |
| 用户名 | `admin` |
| 默认密码 | `zl939921104`（可通过 `ADMIN_PASSWORD` 覆盖，仅首次建库时生效） |

> 🔒 首次登录后请立刻修改管理员密码，并把 `JWT_SECRET` 换成强随机字符串。本地想重新初始化：停服后删除 `data/pictureapi.db` 再启动（生产环境切勿删库）。

### 6️⃣ 后台推荐设置顺序

1. 系统设置：网站名称、Logo、Favicon、备案号
2. 主题设置：默认自然绿，可随时切换
3. 存储设置：七牛云 / 腾讯云 COS / 本地存储
4. 分类管理 → 图片 / 视频管理 → API 管理
5. 首页展示、菜单、水印、邮件（按需）

## 📡 API 使用

### 随机图片

```http
GET /api/v1/random/:category?key=YOUR_API_KEY
```

### 随机视频

```http
GET /api/v1/video/:category?key=YOUR_API_KEY
```

### 参数说明

| 参数 | 可选值 | 说明 |
| --- | --- | --- |
| `key` | 用户 API Key | 必填，用于鉴权和调用统计 |
| `type` | `json`（默认）/ `img` / `image` / `redirect` | `img` 等返回 302 跳转到媒体本身，可直接放进 `<img src>` 当随机图床用 |

### 调用示例

```bash
# JSON 模式
curl "https://your-domain.com/api/v1/random/anime?key=YOUR_API_KEY"
```

```json
{
  "url": "https://example.com/image.jpg",
  "id": 1,
  "category": "anime",
  "category_name": "动漫"
}
```

```html
<!-- 直链模式：每次刷新随机一张 -->
<img src="https://your-domain.com/api/v1/random/anime?key=YOUR_API_KEY&type=img" />
```

## ☁️ 存储方案

后台系统设置中可切换存储后端，**不同分类可使用不同存储**：

| 后端 | 适用场景 |
| --- | --- |
| 七牛云 Kodo | 生产环境推荐，CDN 加速，媒体走同源代理加载 |
| 腾讯云 COS | 生产环境、大文件和公网访问 |
| 本地存储 | 小型站点、快速体验，文件保存到 `public/uploads` |

> 💡 前端展示统一走 `/api/media/*` 同源代理转发（支持视频 Range 拖动 + 强缓存），可有效规避对象存储域名跨域加载失败的问题。

## 📦 生产部署

> ⚠️ **建议单实例部署。** 数据库为 SQLite 单文件设计，多实例（多机/多副本）会导致数据分叉；使用本地上传时媒体文件也无法跨实例共享。PM2 请使用默认 fork 模式（不加 `-i` 参数）。如需多实例，请使用对象存储并自行评估数据库共享方案。

### 方式一：Node 直接部署

```bash
git clone https://github.com/zhyzy/pictureAPI.git
cd pictureAPI
npm install
npm run build
npm start        # 默认端口 3008，可在 package.json 中调整
```

### 方式二：PM2 守护部署

```bash
npm install -g pm2
git clone https://github.com/zhyzy/pictureAPI.git
cd pictureAPI
npm install
npm run build
pm2 start npm --name pictureapi -- start
pm2 save
```

```bash
pm2 status          # 查看状态
pm2 logs pictureapi # 查看日志
pm2 restart pictureapi
```

### 方式三：1Panel / 宝塔

1. 服务器安装 Node.js 20 LTS
2. Git 克隆项目到网站目录，创建 `.env.local`
3. 执行 `npm install` → `npm run build`
4. 启动命令 `npm start`，面板反向代理到 `3008` 端口

### 方式四：Docker

```bash
docker compose up -d
```

### Nginx 参考配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 200m;   # 视频上传必需

    location / {
        proxy_pass http://127.0.0.1:3008;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔄 后台一键更新

后台路径：`/admin/update`

**检测逻辑**：优先读取 GitHub Release → 其次 Git tag（如 `v0.2.0`）→ 最后回退到 `master` 分支的 `package.json`。

**前提条件**：

- 项目必须是 `git clone` 部署
- `.env.local` 设置 `PICTURE_API_UPDATE_ENABLED=true`
- 运行用户有项目目录写权限，且服务器能访问 GitHub

**更新流程**：备份 `.env.local`、数据库、`public/uploads` → `git pull --ff-only` → `npm install` → 重新构建 → 执行重启命令。

重启命令可配置：

```env
PICTURE_API_UPDATE_RESTART_COMMAND=/path/to/restart-pictureapi.sh
```

## ❓ 常见问题

<details>
<summary><b>默认密码登录不了？</b></summary>

先看 `.env.local` 有没有 `ADMIN_PASSWORD`：没有则是 `zl939921104`，有则以配置为准。数据库初始化后再改该变量不影响已有密码。本地测试可删 `data/pictureapi.db` 重新初始化；生产环境请在后台用户管理中重置。
</details>

<details>
<summary><b>为什么后台提示不能一键更新？</b></summary>

常见原因：非 Git 克隆部署、未设置 `PICTURE_API_UPDATE_ENABLED=true`、运行用户无写权限、服务器无法访问 GitHub。
</details>

<details>
<summary><b>本地上传的图片，更新后会丢吗？</b></summary>

不会。`public/uploads` 不参与版本控制，一键更新前会自动备份。生产环境仍建议定期做服务器级备份。
</details>

<details>
<summary><b>检测更新时没有 GitHub Release 怎么办？</b></summary>

系统会自动回退到 Git tag，再回退到分支 `package.json`。推荐发布时创建 tag 和 Release，更新日志展示更完整。
</details>

## 🗂 目录结构

```text
components/          公共组件
hooks/               前端 Hooks
lib/                 数据库、认证、邮件、存储、水印、更新逻辑
pages/               页面和 API 路由
pages/admin/         管理后台页面
pages/api/v1/        对外媒体接口（random / video）
pages/api/admin/     管理后台 API
styles/themes/       多套站点主题
public/avatars/      默认头像
public/uploads/      本地上传媒体（运行时生成，不入库）
data/                SQLite 数据库（首次启动自动创建）
backups/             一键更新备份（运行时生成）
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

本项目基于 [MIT License](LICENSE) 开源。

---

<div align="center">

**如果这个项目对你有帮助，欢迎点一个 Star ⭐**

</div>
