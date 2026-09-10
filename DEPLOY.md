# ZL-综合API 1Panel 部署说明

> 架构约束：SQLite 文件数据库，**只能单实例运行**（禁止多副本/集群/负载均衡）。

## 包内容

> **重要**：部署包**不包含数据库**。数据库只存在于服务器的 `/opt/zl-api/data/pictureapi.db`，
> 这样更新代码覆盖文件时绝不会碰到线上数据。首次部署时应用会自动建库并创建默认管理员。

```
zl-api-deploy-<日期>.tar.gz
├── .next/                # 本地已构建好的生产包（无需服务器构建）
├── .env.production       # 生产环境变量（已含随机 JWT_SECRET 和七牛配置）
├── pages/ components/ lib/ hooks/ styles/ public/
└── package.json package-lock.json
```

> 首次部署登录：用户名 `admin`，密码取 `.env.production` 里的 `ADMIN_PASSWORD`；
> 未设置该变量时为 `zl939921104`，**登录后请立即修改密码**。

## 1Panel 部署步骤

### 1. 上传解压
1. 1Panel → **文件** → 进入 `/opt` → 上传 `zl-api-deploy-<日期>.tar.gz`
2. 解压到 `/opt/zl-api`（确保 `/opt/zl-api/package.json` 存在）

### 2. 安装依赖
1. 1Panel → **网站 → 运行环境 → Node.js → 创建运行环境**
   - 名称：`zl-api`
   - 源码目录：`/opt/zl-api`
   - Node 版本：`v20` 或更高
   - 启动命令：`npm run start`
   - 端口：`3008`
2. 创建后先别急着访问，进入该运行环境的**终端**，执行：
   ```bash
   npm install --omit=dev
   ```
3. 回到运行环境页面，点击**启动**

> **注意**：项目使用 better-sqlite3（原生模块）。正常情况下 npm 会自动下载 Linux 预编译包；如果安装日志报 `gyp ERR!`（源码编译失败），先在终端执行 `apt install -y build-essential python3`（CentOS 用 `yum install -y gcc-c++ make python3`）再重新 `npm install --omit=dev`。
>
> 依赖安装只需一次；后续更新代码时如果没有新增依赖，直接替换文件重启即可。

### 3. 创建反向代理
1. 1Panel → **网站 → 创建网站 → 反向代理**
   - 域名：`api.zxiaolin.com`（先去域名 DNS 添加 A 记录指向服务器 IP）
   - 代理地址：`http://127.0.0.1:3008`
2. **重要**：进入该网站 → 配置文件，在 `server` 块中加一行（放开上传体积限制，否则视频上传会被 Nginx 拦截）：
   ```nginx
   client_max_body_size 200m;
   ```
3. **HTTPS**：网站设置 → HTTPS → 申请 Let's Encrypt 证书，开启强制 HTTPS

### 4. 验证
- 打开 `https://api.zxiaolin.com` 首页正常
- 登录后台（首次部署用默认管理员，见包内容说明；已有数据库则用你原来的账号）
- 体验页获取图片正常（图片走 `/api/media/...` 同源代理）

## 日常更新

> ⚠️ **红线**：已部署的服务器上**严禁执行 `rm -rf /opt/zl-api`**——那会连数据库一起删光。
> 数据库不在部署包里，删了没有任何东西能恢复它。

```bash
# 服务器上（或通过 1Panel 终端）：只覆盖代码文件
cd /opt && tar -xzf zl-api-deploy-<日期>.tar.gz   # 解压出 zl-api/ 覆盖代码，data/ 不受影响
# 在 1Panel 运行环境里点"重启"
```

只有**全新部署**（服务器上还没有任何数据）才允许先删除目录再解压。

## 数据说明

- 数据库：`/opt/zl-api/data/pictureapi.db`（better-sqlite3 + WAL 模式，写入实时落盘，崩溃不丢已提交数据）
- 自动备份：每天一次到 `/opt/zl-api/data/backups/`，保留最近 7 份
- 媒体文件：七牛云对象存储，服务器本地不存媒体
- 图片展示统一走 `/api/media/<key>` 同源代理（规避浏览器对七牛域名的拦截），代理响应带一年强缓存
- 如需换服务器迁移：拷贝整个 `/opt/zl-api` 目录即可（含数据库和备份）
