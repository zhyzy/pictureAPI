# 樱道 API 使用教程

## 目录

1. [快速上手](#快速上手)
2. [用户注册与登录](#用户注册与登录)
3. [获取 API Key](#获取-api-key)
4. [调用 API](#调用-api)
5. [后台管理](#后台管理)
6. [主题切换](#主题切换)
7. [邮箱验证](#邮箱验证)
8. [常见问题](#常见问题)

---

## 快速上手

### 第一步：访问网站

打开浏览器，访问你的樱道 API 地址：

```
http://localhost:3000
```

或你的域名：

```
https://your-domain.com
```

### 第二步：浏览 API 接口

首页会展示所有可用的图片 API 接口，包括：

- 随机动漫图
- 随机小姐姐图
- 随机风景图
- 随机动物图
- 随机美食图
- 随机图片

### 第三步：立即体验

点击任意 API 卡片上的"在线体验"按钮，即可查看该接口返回的图片。

---

## 用户注册与登录

### 注册账号

#### 第一步：进入注册页面

1. 点击页面右上角的"注册"按钮
2. 或访问 `/auth/register`

#### 第二步：填写注册信息

```
用户名：your_username
密码：your_password（至少6位）
确认密码：your_password
邮箱：your_email@example.com（可选，建议填写）
```

#### 第三步：完成注册

- 如果不填邮箱：点击"注册"直接完成
- 如果填写邮箱：需要验证邮箱（见下方邮箱验证教程）

### 登录账号

#### 第一步：进入登录页面

1. 点击页面右上角的"登录"按钮
2. 或访问 `/auth/login`

#### 第二步：输入账号信息

```
用户名：your_username
密码：your_password
```

#### 第三步：点击登录

登录成功后会自动跳转到用户中心或之前访问的页面。

---

## 获取 API Key

### 第一步：登录账号

确保你已登录账号。

### 第二步：进入用户中心

1. 点击右上角用户名
2. 选择"用户中心"
3. 或访问 `/user/dashboard`

### 第三步：复制 API Key

在用户中心页面，你会看到：

```
API Key: ak_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

点击"复制"按钮复制 API Key。

**注意：API Key 是调用接口的凭证，请妥善保管，不要泄露给他人！**

---

## 调用 API

### 基础调用

#### 获取随机动漫图片

```bash
curl http://localhost:3000/api/v1/random/anime
```

响应示例：

```json
{
  "url": "https://your-cos-domain.com/images/anime/1234567890_abc123.png",
  "id": 1,
  "category": "anime",
  "category_name": "动漫"
}
```

#### 获取其他分类图片

```bash
# 小姐姐
curl http://localhost:3000/api/v1/random/girl

# 风景
curl http://localhost:3000/api/v1/random/scenery

# 动物
curl http://localhost:3000/api/v1/random/animal

# 美食
curl http://localhost:3000/api/v1/random/food

# 随机
curl http://localhost:3000/api/v1/random/random
```

### 带 API Key 的调用

#### 方式一：请求头方式（推荐）

```bash
curl -H "X-API-Key: ak_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  http://localhost:3000/api/v1/random/anime
```

#### 方式二：URL 参数方式

```bash
curl "http://localhost:3000/api/v1/random/anime?api_key=ak_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### 在代码中使用

#### JavaScript / TypeScript

```javascript
// 使用 fetch
async function getRandomImage(category = 'anime') {
  const response = await fetch(`http://localhost:3000/api/v1/random/${category}`, {
    headers: {
      'X-API-Key': 'ak_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    }
  });
  
  const data = await response.json();
  return data.url;
}

// 使用
getRandomImage('anime').then(url => {
  console.log('图片地址:', url);
  // 在网页中显示
  document.getElementById('image').src = url;
});
```

#### Python

```python
import requests

def get_random_image(category='anime', api_key=None):
    url = f'http://localhost:3000/api/v1/random/{category}'
    headers = {}
    
    if api_key:
        headers['X-API-Key'] = api_key
    
    response = requests.get(url, headers=headers)
    data = response.json()
    
    return data['url']

# 使用
image_url = get_random_image('anime', 'ak_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
print(f'图片地址: {image_url}')
```

#### PHP

```php
<?php
function getRandomImage($category = 'anime', $apiKey = null) {
    $url = "http://localhost:3000/api/v1/random/{$category}";
    
    $headers = [];
    if ($apiKey) {
        $headers[] = "X-API-Key: {$apiKey}";
    }
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    $data = json_decode($response, true);
    return $data['url'];
}

// 使用
$imageUrl = getRandomImage('anime', 'ak_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
echo "图片地址: {$imageUrl}";
?>
```

#### HTML 直接引用

```html
<!-- 直接在 img 标签中使用 -->
<img src="http://localhost:3000/api/v1/random/anime" alt="随机图片">

<!-- 带 API Key -->
<img src="http://localhost:3000/api/v1/random/anime?api_key=ak_xxxxxxxxxx" alt="随机图片">
```

---

## 后台管理

### 登录后台

1. 使用管理员账号登录
2. 访问 `/admin`
3. 或点击用户菜单中的"后台管理"

### 仪表盘

后台首页展示：
- API 接口总数
- 分类总数
- 总请求数
- 今日请求数
- 总用户数
- 今日新增用户
- 活跃用户
- 图片总数
- API 调用趋势图
- 用户注册趋势图

### 网站设置

#### 修改网站基本信息

1. 点击左侧"系统设置"
2. 修改以下信息：
   - **网站名称**：显示在页面标题和导航栏
   - **网站 LOGO**：图片 URL 地址
   - **备案号**：显示在页脚
   - **默认主题**：新用户访问时的默认主题
3. 点击"保存设置"

#### 配置邮件服务器

1. 在系统设置页面找到"邮件配置"
2. 填写 SMTP 信息：

**QQ 邮箱配置：**
```
SMTP 服务器：smtp.qq.com
端口：587
用户名：你的 QQ 邮箱（如 123456@qq.com）
密码：QQ 邮箱授权码（不是登录密码）
发件人：123456@qq.com
使用 SSL：否
```

**163 邮箱配置：**
```
SMTP 服务器：smtp.163.com
端口：25
用户名：你的 163 邮箱（如 example@163.com）
密码：163 邮箱授权码
发件人：example@163.com
使用 SSL：否
```

3. 点击"测试发送"
4. 输入测试邮箱地址
5. 点击"发送测试邮件"
6. 检查邮箱是否收到测试邮件
7. 收到后点击"保存设置"

**如何获取邮箱授权码：**

- **QQ 邮箱**：
  1. 登录 QQ 邮箱
  2. 设置 -> 账户 -> 开启 SMTP 服务
  3. 按提示发送短信获取授权码

- **163 邮箱**：
  1. 登录 163 邮箱
  2. 设置 -> POP3/SMTP/IMAP
  3. 开启 SMTP 服务
  4. 按提示获取授权码

### 用户管理

#### 查看用户列表

1. 点击左侧"用户管理"
2. 查看所有注册用户
3. 可以搜索特定用户

#### 禁用/启用用户

1. 找到要操作的用户
2. 点击"编辑"
3. 切换"账号状态"
4. 点击"保存"

#### 设置用户限流

1. 找到要设置的用户
2. 点击"编辑"
3. 在"频率限制"中输入数字（每小时最大请求数）
4. 留空表示使用全局设置
5. 点击"保存"

#### 删除用户

1. 找到要删除的用户
2. 点击"删除"
3. 确认删除

**注意：不能删除自己的账号！**

### 分类管理

#### 查看分类

1. 点击左侧"分类管理"
2. 查看所有图片分类

#### 添加分类

1. 点击"添加分类"
2. 填写：
   - 分类名称（如：游戏）
   - 分类标识（如：game，用于 API 路径）
   - 描述（可选）
3. 点击"保存"

#### 编辑分类

1. 找到要编辑的分类
2. 点击"编辑"
3. 修改信息
4. 点击"保存"

#### 删除分类

1. 找到要删除的分类
2. 点击"删除"
3. 确认删除

**注意：如果分类下有 API 接口，无法删除！**

### 图片管理

#### 查看图片

1. 点击左侧"图片管理"
2. 查看所有上传的图片
3. 可以按分类筛选

#### 上传图片

1. 点击"上传图片"
2. 选择分类
3. 拖拽或点击选择图片文件
4. 等待上传完成
5. 图片会自动保存到数据库和腾讯云 COS

#### 删除图片

1. 找到要删除的图片
2. 点击"删除"
3. 确认删除

**注意：删除图片会同时删除腾讯云 COS 中的文件！**

### API 接口管理

#### 查看 API 接口

1. 点击左侧"API 管理"
2. 查看所有 API 接口

#### 添加 API 接口

1. 点击"添加 API"
2. 填写：
   - 名称（如：随机游戏图）
   - 描述（可选）
   - 端点（如：/api/v1/random/game）
   - 分类
   - 请求方法（默认 GET）
3. 点击"保存"

#### 启用/禁用 API

1. 找到要操作的 API
2. 点击"编辑"
3. 切换"状态"
4. 点击"保存"

---

## 主题切换

### 前台切换主题

1. 在网站任意页面
2. 点击右上角的设置/主题图标
3. 选择喜欢的主题
4. 主题会立即生效

### 可用主题

| 主题 | 风格 | 特点 |
|------|------|------|
| 日式极简 | 温暖、杂志风 | 默认主题，赭红色调 |
| 科技未来 | 深色、代码感 | 科技蓝，适合开发者 |
| 二次元萌系 | 粉色、可爱 | 樱花粉，萌系风格 |
| 商务专业 | 蓝色、稳重 | 商务蓝，专业感 |
| 自然清新 | 绿色、有机 | 自然绿，清新感 |
| 复古怀旧 | 棕色、像素 | 复古棕，怀旧感 |
| 赛博朋克 | 紫色、霓虹 | 赛博紫，未来感 |
| 杂志编辑 | 黑白、排版 | 经典黑白，编辑风 |
| 纯粹极简 | 黑白、留白 | 极致简约 |
| 海洋深蓝 | 蓝色、渐变 | 海洋蓝，宁静感 |

### 设置默认主题

1. 登录管理员账号
2. 进入后台"系统设置"
3. 找到"默认主题"
4. 选择主题
5. 保存设置

新用户访问时会自动使用默认主题。

---

## 邮箱验证

### 为什么需要邮箱验证

- 提高账号安全性
- 方便找回密码
- 接收系统通知

### 注册时验证邮箱

#### 第一步：填写注册信息

在注册页面填写用户名、密码、邮箱。

#### 第二步：获取验证码

1. 点击"发送验证码"
2. 等待 60 秒倒计时
3. 检查邮箱收件箱
4. 找到标题为"邮箱验证 - 樱道 API"的邮件
5. 查看 6 位数字验证码

#### 第三步：输入验证码

1. 在验证码输入框中输入 6 位验证码
2. 点击"注册"
3. 完成注册

**注意：**
- 验证码 30 分钟内有效
- 如果未收到邮件，检查垃圾邮件文件夹
- 可以重新发送验证码

### 绑定邮箱

如果注册时未填写邮箱，后续可以绑定：

1. 登录账号
2. 进入用户中心
3. 点击"绑定邮箱"
4. 输入邮箱地址
5. 点击"发送验证码"
6. 输入验证码
7. 完成绑定

---

## 常见问题

### Q: API 返回 404 错误？

A: 检查分类标识是否正确，可用的分类有：anime, girl, scenery, animal, food, random

### Q: API 返回 429 错误？

A: 请求过于频繁，请稍后再试。默认每小时限制 100 次请求。

### Q: 图片无法显示？

A: 检查图片 URL 是否可访问，或尝试刷新页面获取新图片。

### Q: 忘记密码怎么办？

A: 目前版本不支持自助找回密码，请联系管理员重置密码。

### Q: 如何修改 API Key？

A: 登录用户中心，点击"重置 API Key"按钮。

### Q: 如何查看我的 API 调用记录？

A: 登录用户中心，查看"调用记录"部分。

### Q: 主题切换后不生效？

A: 尝试刷新页面，或清除浏览器缓存。

### Q: 邮箱验证码收不到？

A: 
1. 检查邮箱地址是否正确
2. 查看垃圾邮件文件夹
3. 确认邮件服务器配置正确
4. 等待 60 秒后重新发送

### Q: 如何限制某个用户的调用频率？

A: 登录后台管理，进入"用户管理"，编辑该用户，设置"频率限制"。

### Q: 上传图片失败？

A:
1. 检查腾讯云 COS 配置
2. 确认图片格式支持（jpg, png, gif, webp）
3. 检查图片大小（建议不超过 10MB）
4. 查看浏览器控制台错误信息

---

## 进阶使用

### 批量获取图片

```javascript
// 获取多张图片
async function getMultipleImages(category, count) {
  const images = [];
  
  for (let i = 0; i < count; i++) {
    const response = await fetch(`http://localhost:3000/api/v1/random/${category}`, {
      headers: { 'X-API-Key': 'your-api-key' }
    });
    const data = await response.json();
    images.push(data.url);
  }
  
  return images;
}

// 获取 5 张动漫图
getMultipleImages('anime', 5).then(urls => {
  console.log('图片列表:', urls);
});
```

### 随机展示图片

```html
<!DOCTYPE html>
<html>
<head>
  <title>随机图片展示</title>
  <style>
    .image-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      padding: 20px;
    }
    .image-item {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .image-item img {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
  </style>
</head>
<body>
  <div class="image-container" id="container"></div>
  
  <script>
    async function loadImages() {
      const container = document.getElementById('container');
      const categories = ['anime', 'scenery', 'animal'];
      
      for (const category of categories) {
        const response = await fetch(`/api/v1/random/${category}`);
        const data = await response.json();
        
        const div = document.createElement('div');
        div.className = 'image-item';
        div.innerHTML = `<img src="${data.url}" alt="${data.category_name}">`;
        container.appendChild(div);
      }
    }
    
    loadImages();
  </script>
</body>
</html>
```

---

**祝你使用愉快！**
