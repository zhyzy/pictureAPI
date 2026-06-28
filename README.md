# 图片 API 服务平台

一个基于 Next.js 14 的图片接口服务平台，内置前台展示、图库、API 文档、用户中心、管理员后台、存储管理、主题切换和版本更新能力。适合个人站长、内容工具、机器人接口、图库 API 服务快速搭建。

## 功能亮点

- 首页轮播：支持只轮播文字、轮播背景图、背景图和文字一起轮播，可在后台设置高度、透明度和切换间隔。
- 动态 API 文档：文档页接口列表会同步后台新增的分类和接口，不再依赖写死数据。
- 存储管理：支持腾讯云 COS、本地存储，并可为不同分类单独设置存储位置。
- 用户系统：注册、登录、API Key、调用统计、资料编辑、默认随机头像。
- 管理后台：分类、图片、API、用户、系统设置、菜单链接、首页展示、SMTP、存储配置统一管理。
- 站点品牌同步：网站名称、Logo、页脚、邮件模板、页面标题会同步后台设置。
- 深色模式适配：自然主题、首页轮播背景、顶部菜单和按钮已做明暗模式匹配。
- 系统更新：后台可检测 GitHub 最新版本，并支持在 Git 部署环境中执行一键更新。

## 技术栈

| 模块 | 技术 |
| --- | --- |
| 框架 | Next.js 14 Pages Router |
| 前端 | React 18、TypeScript、Tailwind CSS |
| 动画 | Framer Motion |
| 数据库 | sql.js / SQLite 文件 |
| 认证 | JWT、bcryptjs |
| 邮件 | Nodemailer |
| 云存储 | 腾讯云 COS |
| 本地存储 | public/uploads |

## 快速开始

```bash
git clone https://github.com/zhyzy/pictureAPI.git
cd pictureAPI
npm install
npm run dev
```

开发环境默认访问：

```text
http://localhost:3000
```

生产启动脚本默认端口是 `3008`：

```bash
npm run build
npm start
```

## 环境变量

在项目根目录创建 `.env.local`：

```env
JWT_SECRET=请改成强随机字符串
NEXT_PUBLIC_SITE_URL=http://localhost:3008

# 腾讯云 COS，可选
COS_SECRET_ID=
COS_SECRET_KEY=
COS_BUCKET=
COS_REGION=

# 后台一键更新，可选
PICTURE_API_UPDATE_REPO=zhyzy/pictureAPI
PICTURE_API_UPDATE_BRANCH=master
PICTURE_API_UPDATE_ENABLED=false
PICTURE_API_UPDATE_RESTART_COMMAND=
```

一键更新默认关闭。生产环境确认用 Git 部署并做好备份后，可以设置：

```env
PICTURE_API_UPDATE_ENABLED=true
```

如果使用 PM2，可以把重启命令写成一个脚本，再通过 `PICTURE_API_UPDATE_RESTART_COMMAND` 调用。很多面板环境不建议由网页直接重启进程，可以更新完成后在面板里手动重启。

## 默认管理员

首次启动会自动初始化数据库和管理员账号：

| 项目 | 值 |
| --- | --- |
| 用户名 | `admin` |
| 密码 | `zl939921104` |

首次登录后请立即修改密码和 `JWT_SECRET`。

## 后台更新功能原理

后台“系统更新”页面会执行两步：

1. 检测更新：优先读取 GitHub Releases 最新版本；如果仓库还没有 Release，则读取指定分支的 `package.json` 版本。
2. 一键更新：在服务器项目目录执行备份、`git fetch`、`git pull --ff-only`、`npm install`、清理 `.next`、`npm run build`，最后按配置提示或执行重启。

使用限制：

- 项目必须通过 `git clone` 部署，压缩包解压目录无法自动更新。
- 需要服务器能访问 GitHub。
- 运行用户需要有项目目录写权限。
- 自动更新前会备份 `.env.local`、`data/pictureapi.db`、`public/uploads` 到 `backups/update-*`。
- `backups/`、数据库文件、环境变量不会提交到 GitHub。

推荐发布流程：

```bash
npm version patch
git push
git push --tags
```

然后在 GitHub 创建 Release。后台检测到 Release 版本高于本地版本时，会显示可更新。

## API 示例

随机获取某分类图片：

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

## 常用目录

```text
components/          公共组件
hooks/               前端 Hooks
lib/                 数据库、认证、邮件、存储、更新逻辑
pages/               页面和 API 路由
pages/admin/         管理后台页面
pages/api/admin/     管理后台 API
public/avatars/      默认头像
public/uploads/      本地上传图片
styles/              全局样式和主题
data/                运行时数据库
backups/             一键更新备份
```

## 部署建议

推荐生产环境使用：

- Node.js 20 LTS 或更高
- PM2 或 1Panel/宝塔进程守护
- Nginx 反向代理
- HTTPS 证书
- Git clone 部署，方便后续后台更新

PM2 示例：

```bash
npm install
npm run build
pm2 start npm --name pictureapi -- start
pm2 save
```

## License

MIT
