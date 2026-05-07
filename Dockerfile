# 使用 Node.js 18 LTS（基于 Debian 12 Bookworm，glibc 2.36）
# sql.js 是纯 WebAssembly，无需 native 编译
FROM node:18-bookworm

WORKDIR /app

# 复制 package 文件
COPY package.json package-lock.json ./

# 安装依赖（sql.js 无 native 依赖，标准安装即可）
RUN npm install --omit=dev

# 复制项目文件
COPY . .

# 构建 Next.js
RUN npm run build

# 创建数据目录
RUN mkdir -p data

# 暴露端口
EXPOSE 3008

# 启动
CMD ["npm", "start"]
