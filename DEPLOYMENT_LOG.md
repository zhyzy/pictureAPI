# 樱道 API 部署日志

## 部署日期
2026-05-04

## 环境信息
- **操作系统**：Windows Server / Linux
- **Node.js 版本**：v22.22.2
- **npm 版本**：10.x
- **Next.js 版本**：14.1.0
- **数据库**：SQLite 3.x

---

## 启动日志分析

### ✅ 正常信息
1. **Next.js 启动成功**
   ```
    ▲ Next.js 14.1.0
    - Local:        http://localhost:3001
    - Environments:.env.local
    ✓ Ready in 6.1s
   ```
   - 项目成功启动
   - 端口 3000 被占用，自动切换到 3001（正常）

2. **编译成功**
   ```
   ✓ Compiled /admin/apis in 10s (664 modules)
   ✓ Compiled /api/apis in 1353ms (148 modules)
   ✓ Compiled /api/categories in 310ms (156 modules)
   ```
   - 所有页面和 API 编译成功

### ⚠️ 警告信息（非致命）

#### 1. Browserslist 数据过期
```
Browserslist: browsers data (caniuse-lite) is 12 months old.
Please run: npx update-browserslist-db@latest
```
**影响**：轻微，不影响功能
**修复**：
```bash
npx update-browserslist-db@latest
```
**状态**：已执行，但失败（网络问题）

#### 2. Watchpack 错误
```
Watchpack Error (initial scan): Error: EINVAL: invalid argument, lstat 'D:\System Volume Information'
```
**影响**：文件监听功能无法访问系统文件夹，但不影响编译和热更新
**修复**：无需修复，可忽略
**状态**：已知问题，不影响使用

#### 3. Title 元素警告
```
Warning: A title element received an array with more than 1 element as children.
```
**影响**：可能导致 SEO 问题或 hydration 失败
**原因**：Head 组件中的 title 接收到数组而不是字符串
**修复**：检查所有页面的 Head 组件，确保 title 是字符串
**状态**：待修复

#### 4. Stylesheet 警告
```
Do not add stylesheets using next/head
See more info here: https://nextjs.org/docs/messages/no-stylesheets-in-head-component
```
**影响**：不推荐的做法，但不影响功能
**原因**：在 pages/index.tsx 的 Head 组件中加载 Google Fonts
**修复**：创建自定义 _document.tsx，在 Document 中加载字体
**状态**：✅ 已修复（创建了 pages/_document.tsx）

---

## 修复记录

### 1. 修复 Google Fonts 加载方式
**问题**：在 next/head 中使用 stylesheet 链接
**修复**：
- 创建 `pages/_document.tsx`
- 在 Document 的 Head 中加载 Google Fonts
- 从 `pages/index.tsx` 中移除 Google Fonts 链接

**文件变更**：
- 新增：`pages/_document.tsx`
- 修改：`pages/index.tsx`

### 2. 实现动态 API 列表加载
**问题**：首页 API 卡片数据是硬编码的，后台新增分类不会自动展示
**修复**：
- 创建 `pages/api/apis.js` API
- 创建 `pages/api/categories.js` API
- 修改 `pages/index.tsx`，动态获取 API 列表和分类列表

**文件变更**：
- 新增：`pages/api/apis.js`
- 新增：`pages/api/categories.js`
- 修改：`pages/index.tsx`

### 3. 修复调用量统计
**问题**：首页 API 卡片显示假数字
**修复**：
- 确认 `pages/api/stats/endpoints.js` 正确统计调用次数
- 修改 `pages/index.tsx`，从 API 获取真实调用量

**文件变更**：
- 修改：`pages/index.tsx`

---

## 部署步骤

### 1. 环境准备
```bash
# 检查 Node.js 版本
node -v  # 应该 >= 18.0.0

# 检查 npm 版本
npm -v  # 应该 >= 9.0.0
```

### 2. 安装依赖
```bash
cd /path/to/pictureAPI
npm install
```

### 3. 配置环境变量
创建 `.env.local` 文件：
```env
# 数据库
DATABASE_URL=./data/init.db

# JWT 密钥
JWT_SECRET=your-secret-key-change-this

# COS 配置（如果使用腾讯云 COS 存储）
COS_SECRET_ID=your-cos-secret-id
COS_SECRET_KEY=your-cos-secret-key
COS_BUCKET=your-bucket-name
COS_REGION=ap-guangzhou

# 其他配置
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. 初始化数据库
```bash
npm run init-db
```
**注意**：如果数据库已存在，需要先备份 `data/init.db` 文件。

### 5. 启动开发服务器
```bash
npm run dev
```
访问 http://localhost:3000

### 6. 构建生产版本
```bash
npm run build
```

### 7. 启动生产服务器
```bash
npm run start
```

---

## 部署检查清单

### ✅ 部署前检查
- [x] 所有依赖已安装（`npm install`）
- [x] 环境变量已配置（`.env.local`）
- [x] 数据库已初始化（`npm run init-db`）
- [x] 构建成功（`npm run build` 无错误）
- [x] 所有 API 端点正常响应
- [x] 前端页面正常渲染
- [x] 调用量统计显示正确
- [x] 动态 API 列表加载正常
- [x] 动态分类列表加载正常

### ✅ 部署后检查
- [ ] 网站可访问（http://your-domain.com）
- [ ] HTTPS 已配置（如果使用）
- [ ] 数据库备份策略已设置
- [ ] 日志监控已配置
- [ ] 错误监控已配置（如 Sentry）
- [ ] 性能监控已配置（如 Vercel Analytics）

---

## 已知问题

### 1. Title 元素警告
**状态**：未修复
**优先级**：低
**计划**：在下次更新中修复

### 2. Browserslist 数据过期
**状态**：未修复
**优先级**：低
**计划**：定期运行 `npx update-browserslist-db@latest`

### 3. Watchpack 错误
**状态**：已知问题，可忽略
**优先级**：无
**说明**：Windows 系统文件夹访问权限问题，不影响功能

---

## 性能优化建议

### 1. 数据库优化
- 为 `api_logs` 表的 `endpoint` 和 `created_at` 字段添加索引
- 定期清理旧的 API 调用日志（如保留最近 6 个月的数据）

### 2. 前端优化
- 启用 Next.js 的静态生成（ISR） for 不经常变化的页面
- 使用 CDN 加速静态资源
- 优化图片加载（使用 Next.js Image 组件）

### 3. 缓存策略
- API 响应缓存（如 Redis）
- 浏览器缓存策略
- CDN 缓存策略

---

## 安全建议

### 1. 认证安全
- 使用强 JWT 密钥
- 启用 HTTPS
- 实施 API 频率限制

### 2. 数据库安全
- 定期备份数据库
- 不要将数据库文件放在公开目录
- 使用参数化查询防止 SQL 注入

### 3. 服务器安全
- 使用防火墙限制端口访问
- 定期更新系统补丁
- 使用非 root 用户运行应用

---

## 监控和维护

### 1. 日志监控
- 应用日志：`npm run dev` 输出
- 错误日志：使用 Sentry 等工具
- 访问日志：使用 Nginx 或 Apache 日志

### 2. 性能监控
- 使用 Vercel Analytics 或 Google Analytics
- 监控 API 响应时间
- 监控数据库查询性能

### 3. 定期维护
- 每周检查日志文件
- 每月更新依赖包
- 每季度备份数据库

---

## 回滚计划

### 如果出现问题
1. 保留当前版本备份
2. 回滚到上一个稳定版本
3. 检查数据库兼容性
4. 重启应用

### 回滚步骤
```bash
# 1. 停止当前应用
pm2 stop picture-api

# 2. 回滚代码
git checkout <previous-commit>

# 3. 重新安装依赖（如果有变化）
npm install

# 4. 重启应用
pm2 start picture-api
```

---

## 联系人

- **部署负责人**：[姓名]
- **技术负责人**：[姓名]
- **紧急联系方式**：[电话/邮箱]

---

## 更新记录

| 日期 | 版本 | 更新内容 | 操作人 |
|------|------|----------|--------|
| 2026-05-04 | v0.1.0 | 初始部署，修复启动警告 | AI Assistant |
| | | 实现动态 API 列表加载 | |
| | | 修复调用量统计显示 | |

---

**文档结束**
