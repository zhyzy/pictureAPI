# 樱道 API 部署文档

## 目录

1. [环境准备](#环境准备)
2. [项目安装](#项目安装)
3. [环境配置](#环境配置)
4. [数据库初始化](#数据库初始化)
5. [启动项目](#启动项目)
6. [生产环境部署](#生产环境部署)
7. [Nginx 反向代理配置](#nginx-反向代理配置)
8. [PM2 进程管理](#pm2-进程管理)
9. [SSL 证书配置](#ssl-证书配置)
10. [常见问题排查](#常见问题排查)

---

## 环境准备

### 第一步：安装 Node.js

#### Ubuntu/Debian

```bash
# 更新包列表
sudo apt update

# 安装 Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node -v  # 应显示 v18.x.x
npm -v   # 应显示 9.x.x
```

#### CentOS/RHEL

```bash
# 安装 Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 验证安装
node -v
npm -v
```

#### Windows

1. 访问 https://nodejs.org/
2. 下载 LTS 版本（推荐 18.x 或 20.x）
3. 运行安装程序，按提示完成安装
4. 打开命令提示符，验证：

```cmd
node -v
npm -v
```

### 第二步：安装 Git（可选）

```bash
# Ubuntu/Debian
sudo apt install git

# CentOS/RHEL
sudo yum install git

# Windows
# 下载安装程序：https://git-scm.com/download/win
```

---

## 项目安装

### 第一步：获取项目代码

#### 方式一：Git 克隆

```bash
# 克隆项目
git clone <你的项目仓库地址>

# 进入项目目录
cd pictureAPI
```

#### 方式二：直接下载

1. 下载项目压缩包
2. 解压到目标目录
3. 进入项目目录

### 第二步：安装依赖

```bash
# 安装项目依赖
npm install

# 等待安装完成，这可能需要几分钟
```

---

## 环境配置

### 第一步：创建环境变量文件

在项目根目录创建 `.env.local` 文件：

```bash
# Linux/Mac
touch .env.local

# Windows
# 右键新建文本文件，重命名为 .env.local
```

### 第二步：配置环境变量

编辑 `.env.local` 文件：

```env
# ==========================================
# 必填配置
# ==========================================

# JWT 密钥（用于用户认证）
# 建议：使用随机生成的长字符串
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# 网站 URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ==========================================
# 腾讯云 COS 配置（可选，用于图片存储）
# ==========================================

# 腾讯云 SecretId
# 获取方式：https://console.cloud.tencent.com/cam/capi
COS_SECRET_ID=your-tencent-cloud-secret-id

# 腾讯云 SecretKey
COS_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# COS Bucket 名称
COS_BUCKET=your-bucket-name-1234567890

# COS 所在地域
# 可选：ap-guangzhou, ap-beijing, ap-shanghai, ap-nanjing 等
COS_REGION=ap-guangzhou
```

### 第三步：腾讯云 COS 配置教程

#### 1. 创建腾讯云账号

访问 https://cloud.tencent.com/ 注册账号

#### 2. 开通对象存储 COS

1. 登录腾讯云控制台
2. 搜索"对象存储"或访问 https://console.cloud.tencent.com/cos
3. 点击"创建存储桶"
4. 填写存储桶信息：
   - 名称：自定义（如 `my-image-api`）
   - 地域：选择离你服务器最近的地区
   - 访问权限：公有读私有写
5. 点击"创建"

#### 3. 获取 API 密钥

1. 访问 https://console.cloud.tencent.com/cam/capi
2. 点击"新建密钥"
3. 记录 SecretId 和 SecretKey

#### 4. 配置跨域访问

1. 进入存储桶详情
2. 点击"安全管理" -> "跨域访问 CORS 设置"
3. 点击"添加规则"
4. 配置：
   - 来源 Origin：`*` 或你的域名
   - 操作 Methods：GET, POST, PUT, DELETE, HEAD
   - 允许 Headers：`*`
   - 暴露 Headers：ETag
   - 超时 Max-Age：600

---

## 数据库初始化

### 第一步：自动初始化

项目使用 SQLite 数据库，首次启动时会自动创建数据库文件。

数据库文件位置：`data/pictureapi.db`

### 第二步：创建管理员账号

数据库初始化时会自动创建默认管理员账号：

- 用户名：`admin`
- 密码：`zl939921104`

**建议首次登录后立即修改密码！**

### 第三步：初始化 API 数据

1. 启动项目（见下文）
2. 访问 http://localhost:3000/auth/login
3. 使用管理员账号登录
4. 进入后台管理页面
5. 点击"初始化数据"按钮
6. 系统会自动创建默认分类和 API 接口

---

## 启动项目

### 开发模式

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 生产模式

```bash
# 第一步：构建项目
npm run build

# 第二步：启动生产服务器
npm start

# 访问 http://localhost:3000
```

---

## 生产环境部署

### 第一步：服务器准备

推荐配置：
- CPU：1 核及以上
- 内存：1GB 及以上
- 硬盘：10GB 及以上
- 带宽：1Mbps 及以上
- 系统：Ubuntu 20.04/22.04 LTS

### 第二步：上传项目

#### 方式一：Git 克隆

```bash
# 在服务器上执行
git clone <你的项目仓库地址>
cd pictureAPI
npm install
```

#### 方式二：FTP/SFTP 上传

1. 在本地构建项目：`npm run build`
2. 使用 FileZilla 等工具上传项目文件
3. 在服务器上执行：`npm install --production`

### 第三步：配置防火墙

```bash
# 开放 3000 端口（如果使用 Nginx 反向代理，只需开放 80/443）
sudo ufw allow 3000

# 或者使用 iptables
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
```

---

## Nginx 反向代理配置

### 第一步：安装 Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install epel-release
sudo yum install nginx

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 第二步：配置 Nginx

创建配置文件：

```bash
sudo nano /etc/nginx/sites-available/pictureapi
```

添加以下内容：

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # 日志配置
    access_log /var/log/nginx/pictureapi-access.log;
    error_log /var/log/nginx/pictureapi-error.log;
    
    # 客户端文件上传大小限制
    client_max_body_size 50M;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # 静态文件缓存
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

启用配置：

```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/pictureapi /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 第三步：配置域名

1. 登录你的域名服务商
2. 添加 A 记录指向服务器 IP
3. 等待 DNS 生效（通常几分钟到几小时）

---

## PM2 进程管理

### 第一步：安装 PM2

```bash
sudo npm install -g pm2
```

### 第二步：创建 PM2 配置文件

在项目根目录创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'pictureapi',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/your/pictureAPI',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### 第三步：使用 PM2 启动

```bash
# 创建日志目录
mkdir -p logs

# 启动项目
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs pictureapi

# 重启
pm2 restart pictureapi

# 停止
pm2 stop pictureapi

# 设置开机自启
pm2 startup
pm2 save
```

---

## SSL 证书配置

### 使用 Certbot 免费 SSL

#### 第一步：安装 Certbot

```bash
# Ubuntu/Debian
sudo apt install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx
```

#### 第二步：获取证书

```bash
# 自动配置 Nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 按提示操作，选择重定向 HTTP 到 HTTPS
```

#### 第三步：自动续期

Certbot 会自动配置定时任务，测试续期：

```bash
sudo certbot renew --dry-run
```

---

## 常见问题排查

### 问题一：端口被占用

```bash
# 查看端口占用
sudo lsof -i :3000

# 或
sudo netstat -tulpn | grep 3000

# 结束占用进程
sudo kill -9 <PID>
```

### 问题二：权限错误

```bash
# 修改项目目录权限
sudo chown -R $USER:$USER /path/to/pictureAPI

# 确保 data 目录可写
chmod 755 data
```

### 问题三：构建失败

```bash
# 清除缓存重新构建
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### 问题四：数据库错误

```bash
# 检查数据库文件权限
ls -la data/

# 如果损坏，备份后删除重建
mv data/pictureapi.db data/pictureapi.db.backup
# 然后重启项目
```

### 问题五：邮件发送失败

1. 检查 SMTP 配置是否正确
2. 确认使用的是授权码而非登录密码
3. 检查邮箱是否开启 SMTP 服务
4. 查看服务器日志排查错误

### 问题六：图片上传失败

1. 检查腾讯云 COS 配置
2. 确认 Bucket 访问权限为"公有读私有写"
3. 检查 CORS 配置是否正确
4. 查看服务器日志

---

## 备份与恢复

### 备份数据

```bash
# 备份数据库
cp data/pictureapi.db backup/pictureapi-$(date +%Y%m%d).db

# 备份环境配置
cp .env.local backup/.env.local-$(date +%Y%m%d)

# 备份上传的图片（如果使用本地存储）
# tar -czvf backup/images-$(date +%Y%m%d).tar.gz public/uploads/
```

### 恢复数据

```bash
# 停止服务
pm2 stop pictureapi

# 恢复数据库
cp backup/pictureapi-20240101.db data/pictureapi.db

# 重启服务
pm2 start pictureapi
```

---

## 性能优化

### 1. 启用 Gzip 压缩

在 `next.config.js` 中添加：

```javascript
const nextConfig = {
  compress: true,
  // ...
};
```

### 2. 配置缓存

在 Nginx 配置中添加：

```nginx
location /_next/static {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location /api {
    expires -1;
    add_header Cache-Control "no-store, no-cache, must-revalidate";
}
```

### 3. 使用 CDN

将静态资源上传到 CDN，修改 `next.config.js`：

```javascript
const nextConfig = {
  assetPrefix: 'https://your-cdn-domain.com',
  // ...
};
```

---

## 安全建议

1. **修改默认密码**：首次登录后立即修改管理员密码
2. **使用强 JWT 密钥**：生产环境使用随机生成的长字符串
3. **启用 HTTPS**：使用 SSL 证书加密传输
4. **限制访问**：使用防火墙限制不必要的端口访问
5. **定期备份**：设置定时任务自动备份数据库
6. **更新依赖**：定期更新项目依赖修复安全漏洞

---

## 更新项目

```bash
# 拉取最新代码
git pull

# 安装新依赖
npm install

# 重新构建
npm run build

# 重启服务
pm2 restart pictureapi
```

---

## 获取帮助

- 查看项目日志：`pm2 logs pictureapi`
- 查看 Nginx 日志：`sudo tail -f /var/log/nginx/pictureapi-error.log`
- 提交 Issue：访问项目仓库提交问题

---

**部署完成！** 现在你可以通过域名访问你的樱道 API 服务了。
