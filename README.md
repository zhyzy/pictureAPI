# 图片 API 服务平台

一个基于 Next.js 14 的图片接口服务平台，适合快速搭建自己的随机图片 API、图库站、内容素材接口和机器人图片接口。

## 你能用它做什么

- 搭建公开图片 API：`/api/v1/random/:category`
- 管理图片分类、图片资源、API 接口和用户
- 给每个用户生成 API Key，并统计调用次数
- 上传图片到腾讯云 COS 或本地存储
- 在后台设置网站名称、Logo、菜单、首页轮播、主题、底部号召区
- 后台检测 GitHub 新版本，并在 Git 部署环境中执行一键更新

## 功能概览

| 模块 | 功能 |
| --- | --- |
| 首页 | 主题背景、轮播图、轮播文字、统计数据、接口搜索 |
| 文档 | 自动同步后台新增分类和接口 |
| 图库 | 按分类浏览图片 |
| 用户中心 | API Key、调用统计、资料编辑、默认随机头像 |
| 管理后台 | 仪表盘、分类、图片、API、用户、系统设置、系统更新 |
| 存储 | 腾讯云 COS、本地存储、按分类设置存储位置 |
| 主题 | 默认自然绿，支持多套主题和深色模式 |

## 环境要求

- Node.js 20 LTS 或更高
- npm 10 或更高
- Git
- 生产环境推荐 PM2、1Panel、宝塔或其他进程守护工具

## 第一步：获取项目

推荐使用 Git 克隆。只有 Git 部署方式才能使用后台一键更新。

```bash
git clone https://github.com/zhyzy/pictureAPI.git
cd pictureAPI
```

不推荐用 GitHub 下载压缩包部署，因为压缩包没有 `.git` 信息，后台无法自动拉取更新。

## 第二步：安装依赖

```bash
npm install
```

如果 npm 提示依赖审计风险，先不要直接 `npm audit fix --force`，它可能升级大版本并破坏项目。确认项目能跑起来后，再按需处理依赖安全升级。

## 第三步：创建环境变量

在项目根目录创建 `.env.local` 文件。

最小可用配置：

```env
JWT_SECRET=请改成一段足够长的随机字符串
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

完整示例：

```env
# 必填：JWT 登录密钥，生产环境必须改
JWT_SECRET=请改成一段足够长的随机字符串

# 网站地址
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# 可选：首次初始化管理员密码
# 不填写时默认管理员密码是 zl939921104
# 填写后会覆盖默认密码，例如 ADMIN_PASSWORD=admin123
ADMIN_PASSWORD=

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

## 第四步：启动开发环境

```bash
npm run dev
```

打开：

```text
http://localhost:3000
```

后台入口：

```text
http://localhost:3000/auth/login
```

## 第五步：登录默认管理员

首次启动时，系统会自动创建数据库和默认管理员。

| 项目 | 值 |
| --- | --- |
| 用户名 | `admin` |
| 默认密码 | `zl939921104` |

非常重要：

- 如果 `.env.local` 没有写 `ADMIN_PASSWORD`，默认密码就是 `zl939921104`。
- 如果 `.env.local` 写了 `ADMIN_PASSWORD=admin123`，那首次初始化的管理员密码就是 `admin123`。
- 管理员只在数据库第一次创建时初始化一次。
- 数据库已经生成后，再修改 `ADMIN_PASSWORD` 不会自动修改已有管理员密码。
- 如果你只是本地测试，想重新初始化管理员，可以停止项目后删除 `data/pictureapi.db`，再重新 `npm run dev`。
- 生产环境不要随便删除数据库，里面有用户、图片、设置和调用数据。

首次登录后请立刻修改管理员密码，并把 `JWT_SECRET` 改成强随机字符串。

## 第六步：后台基础设置

登录后台后，建议按顺序设置：

1. 系统设置：网站名称、Logo、Favicon、备案号。
2. 主题设置：默认已经是自然绿，可以按需要切换。
3. 存储设置：选择腾讯云 COS 或本地存储。
4. 分类管理：新增图片分类，设置 slug。
5. 图片管理：上传图片并归类。
6. API 管理：确认接口是否启用。
7. 首页展示设置：设置轮播内容、背景图、高度和透明度。
8. 菜单设置：设置顶部导航和底部链接。
9. 邮件设置：需要邮箱验证时再配置 SMTP。

## 生产部署

### 方式一：普通 Node 部署

```bash
git clone https://github.com/zhyzy/pictureAPI.git
cd pictureAPI
npm install
npm run build
npm start
```

`npm start` 默认端口是 `3008`。可以在 `package.json` 里调整：

```json
"start": "next start -p 3008"
```

### 方式二：PM2 部署

```bash
npm install -g pm2
git clone https://github.com/zhyzy/pictureAPI.git
cd pictureAPI
npm install
npm run build
pm2 start npm --name pictureapi -- start
pm2 save
```

常用命令：

```bash
pm2 status
pm2 logs pictureapi
pm2 restart pictureapi
pm2 stop pictureapi
```

### 方式三：1Panel / 宝塔部署

1. 在服务器安装 Node.js 20 LTS。
2. 用 Git 克隆项目到网站目录。
3. 在项目根目录创建 `.env.local`。
4. 执行 `npm install`。
5. 执行 `npm run build`。
6. 启动命令填写 `npm start`。
7. 面板反向代理到项目端口 `3008`。

## Nginx 反向代理示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 50M;

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

## 后台一键更新

后台路径：

```text
/admin/update
```

检测逻辑：

1. 优先读取 GitHub Release 最新版本。
2. 如果没有 Release，读取 GitHub tag，例如 `v0.2.0`。
3. 如果 tag 也没有，再读取 `master` 分支的 `package.json`。

执行更新前提：

- 项目必须是 `git clone` 部署。
- `.env.local` 必须设置 `PICTURE_API_UPDATE_ENABLED=true`。
- 服务器运行用户必须有项目目录写权限。
- 服务器必须能访问 GitHub。

更新过程：

1. 备份 `.env.local`、`data/pictureapi.db`、`public/uploads` 到 `backups/update-*`。
2. 执行 `git fetch` 和 `git pull --ff-only`。
3. 执行 `npm install`。
4. 删除 `.next` 并重新 `npm run build`。
5. 如果配置了 `PICTURE_API_UPDATE_RESTART_COMMAND`，会执行该命令；否则需要你在面板或 PM2 里手动重启。

PM2 重启脚本示例：

```bash
pm2 restart pictureapi
```

可以把它写进服务器脚本，再把脚本路径配置到：

```env
PICTURE_API_UPDATE_RESTART_COMMAND=/path/to/restart-pictureapi.sh
```

## 本地存储和腾讯云 COS

后台系统设置里可以选择：

- 腾讯云 COS：适合生产环境、大文件和公网访问。
- 本地存储：图片会保存到 `public/uploads`。

注意：

- `public/uploads` 是运行时数据，不会提交到 GitHub。
- 使用一键更新前会自动备份 `public/uploads`。
- 分类可以单独设置存储位置，不同分类可使用不同存储。

## API 调用示例

```http
GET /api/v1/random/:category
```

示例：

```bash
curl "https://your-domain.com/api/v1/random/anime?key=YOUR_API_KEY"
```

响应：

```json
{
  "url": "https://example.com/image.jpg",
  "id": 1,
  "category": "anime",
  "category_name": "动漫"
}
```

## 常见问题

### 1. README 写的默认密码登录不了？

先看 `.env.local` 里有没有 `ADMIN_PASSWORD`。

- 没有：密码是 `zl939921104`。
- 有：密码是你自己设置的 `ADMIN_PASSWORD`。

如果数据库已经初始化过，再改 `ADMIN_PASSWORD` 不会修改已有密码。本地测试可以删除 `data/pictureapi.db` 后重新启动；生产环境请在后台用户管理或数据库里重置。

### 2. 检测更新时没有 GitHub Release 怎么办？

没关系。系统会自动回退到 Git tag，再回退到分支 `package.json`。推荐每次发布时创建 tag 和 Release，这样更新日志展示更完整。

### 3. 为什么后台提示不能一键更新？

常见原因：

- 项目不是 Git 克隆部署。
- 没有设置 `PICTURE_API_UPDATE_ENABLED=true`。
- 当前运行用户没有写权限。
- 服务器无法访问 GitHub。

### 4. 图片上传到本地后，更新会不会丢？

不会直接提交到 GitHub。执行一键更新前会备份 `public/uploads`。生产环境仍建议定期做服务器级备份。

### 5. 默认主题是什么？

新部署默认使用“自然绿”。旧的红色默认主题不再作为后台可选主题显示。

## 目录说明

```text
components/          公共组件
hooks/               前端 Hooks
lib/                 数据库、认证、邮件、存储、更新逻辑
pages/               页面和 API 路由
pages/admin/         管理后台页面
pages/api/admin/     管理后台 API
public/avatars/      默认头像
public/uploads/      本地上传图片，运行时生成
styles/              全局样式和主题
data/                运行时数据库，首次启动生成
backups/             一键更新备份，运行时生成
```

## License

MIT
