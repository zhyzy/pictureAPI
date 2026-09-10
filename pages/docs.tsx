import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { apiCategories } from '@/data/apiData';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import CopyApiButton from '@/components/ui/CopyApiButton';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  type?: string;
}

interface ApiInterface {
  id: number;
  name: string;
  url: string;
  description: string;
  category: string;
}

const ApiDocs = () => {
  const siteSettings = useSiteSettings();
  const [activeTab, setActiveTab] = useState<string>('新手入门');
  const [categories, setCategories] = useState<Category[]>([]);
  const [apiList, setApiList] = useState<ApiInterface[]>([]);

  // 从 API 动态获取分类列表
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`/api/categories?_t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch (e) {
        console.error('获取分类列表失败:', e);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchApis = async () => {
      try {
        const res = await fetch(`/api/apis?_t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          setApiList(data.apis || []);
        }
      } catch (e) {
        console.error('获取API列表失败:', e);
      }
    };
    fetchApis();
  }, []);

  // 获取要显示的分类列表（优先使用动态数据，fallback 到静态数据）
  const displayCategories = categories.length > 0 ? categories : apiCategories;
  const categoryApis = displayCategories.map((cat) => {
    const isVideo = (cat as any).type === 'video';
    const matchedApi = apiList.find((api) => api.category === cat.name || api.url.endsWith(`/${cat.slug}`));

    return matchedApi || {
      id: cat.id,
      name: isVideo ? `${cat.name}随机视频` : `${cat.name}随机图`,
      url: isVideo ? `/api/v1/video/${cat.slug}` : `/api/v1/random/${cat.slug}`,
      description: isVideo
        ? cat.description || `获取${cat.name}分类随机视频`
        : cat.description || `获取${cat.name}分类随机图片`,
      category: cat.name,
    };
  });
  const extraApis = apiList.filter((api) => !categoryApis.some((item) => item.id === api.id || item.url === api.url));
  const displayApis = [...categoryApis, ...extraApis];

  const exampleCodes = {
    curl: `# 获取随机动漫图片（必须携带 API Key）
curl -X GET "https://api.zxiaolin.com/api/v1/random/anime" \\
  -H "X-API-Key: your_api_key"

# 直链模式：加 type=img 直接返回图片本身，可用于 <img> 标签
curl -L "https://api.zxiaolin.com/api/v1/random/anime?key=your_api_key&type=img" -o random.jpg

# 指定分类获取
curl -X GET "https://api.zxiaolin.com/api/v1/random/{category}" \\
  -H "X-API-Key: your_api_key"`,
    javascript: `// 使用 Fetch API 获取随机图片（必须携带 API Key）
const API_KEY = 'your_api_key';

fetch('https://api.zxiaolin.com/api/v1/random/anime', {
  headers: { 'X-API-Key': API_KEY }
})
  .then(response => response.json())
  .then(data => {
    if (data.url) {
      console.log('图片URL:', data.url);
      document.getElementById('image').src = data.url;
    } else {
      console.error('请求失败:', data.error);
    }
  })
  .catch(error => console.error('网络错误:', error));`,
    python: `import requests

# 必须携带 API Key
API_KEY = 'your_api_key'
headers = {'X-API-Key': API_KEY}

response = requests.get(
    'https://api.zxiaolin.com/api/v1/random/anime',
    headers=headers
)
data = response.json()

if data.get('url'):
    print(f"图片URL: {data['url']}")
    img_response = requests.get(data['url'])
    with open('image.jpg', 'wb') as f:
        f.write(img_response.content)
else:
    print(f"请求失败: {data.get('error')}")`,
    html: `<!-- 方式一：直链模式（推荐）——接口地址直接当图片链接，每次刷新随机换图 -->
<img src="https://api.zxiaolin.com/api/v1/random/anime?key=your_api_key&type=img" alt="随机图片" />

<!-- 方式二：JSON 模式——先取数据再设置 src（需要图片信息时用） -->
<img id="random-image" src="" alt="随机图片" />

<script>
const API_KEY = 'your_api_key';

fetch('https://api.zxiaolin.com/api/v1/random/anime', {
  headers: { 'X-API-Key': API_KEY }
})
  .then(response => response.json())
  .then(data => {
    if (data.url) {
      document.getElementById('random-image').src = data.url;
    } else {
      console.error('请求失败:', data.error);
    }
  });
</script>`,
    video: `<!-- 方式一：直链模式——接口地址直接当视频链接，每次刷新随机换视频 -->
<video src="https://api.zxiaolin.com/api/v1/video/{category}?key=your_api_key&type=video" controls width="640" />

<!-- 方式二：JSON 模式——先取数据再设置 src -->
<video id="random-video" src="" controls width="640" />

<script>
const API_KEY = 'your_api_key';

fetch('https://api.zxiaolin.com/api/v1/video/{category}', {
  headers: { 'X-API-Key': API_KEY }
})
  .then(response => response.json())
  .then(data => {
    if (data.url) {
      console.log('视频URL:', data.url);
      document.getElementById('random-video').src = data.url;
    } else {
      console.error('请求失败:', data.error);
    }
  });
</script>`,
  };

  const tabs = ['新手入门', '接口列表', '参数说明', '代码示例', '常见问题'];

  // URL 结构拆解数据（图片直链示例）
  const urlParts = [
    { text: 'https://api.zxiaolin.com', label: '站点地址（固定不变）', color: 'text-blue-600 dark:text-blue-400' },
    { text: '/api/v1/random/', label: '图片接口路径', color: 'text-purple-600 dark:text-purple-400' },
    { text: 'anime', label: '分类 slug（换成别的分类名）', color: 'text-green-600 dark:text-green-400' },
    { text: '?key=ak_xxx', label: '你的 API Key（必填）', color: 'text-red-600 dark:text-red-400' },
    { text: '&type=img', label: '输出为图片直链（可选）', color: 'text-orange-600 dark:text-orange-400' },
  ];

  const queryParams = [
    { name: 'key', required: '二选一', desc: 'API 密钥（ak_ 开头）。写在网址参数里，适合浏览器直接访问、<img> 标签等网页场景' },
    { name: 'type', required: '可选', desc: '输出格式。图片接口：不填=JSON 数据，img / image / redirect=直接返回图片；视频接口：不填=JSON 数据，video / redirect=直接返回视频' },
  ];

  const headerParams = [
    { name: 'X-API-Key', required: '二选一', desc: 'API 密钥写在请求头里。与 ?key= 参数效果完全相同，程序集成（fetch / requests 等）推荐这种方式' },
  ];

  const responseFields = [
    { name: 'url', type: 'string', desc: '本次随机到的资源地址，拿到即可直接访问' },
    { name: 'id', type: 'number', desc: '资源编号，可用于反馈或排查问题' },
    { name: 'category', type: 'string', desc: '分类 slug（英文标识）' },
    { name: 'category_name', type: 'string', desc: '分类名称（中文）' },
  ];

  const errorCodes = [
    { code: '401', meaning: 'API Key 缺失或无效', fix: '检查 ?key= 参数或 X-API-Key 请求头是否携带；到个人中心重新复制完整的 Key（ak_ 开头）' },
    { code: '404', meaning: '分类不存在', fix: '分类名写错了，到「接口列表」标签复制正确的接口地址' },
    { code: '429', meaning: '调用频率超过限制', fix: '稍等一会儿再试；如需更高频率请联系站长调整' },
    { code: '500', meaning: '服务器内部错误', fix: '临时故障，稍后重试即可' },
  ];

  const faqs = [
    {
      q: '为什么我打开接口地址，看到的是一段 JSON 代码而不是图片？',
      a: '这是默认的 JSON 模式，专为程序集成设计。想要浏览器直接显示图片，在地址末尾加上 &type=img 即可，例如：https://api.zxiaolin.com/api/v1/random/anime?key=你的Key&type=img，打开就是一张图，每次刷新随机换一张。',
    },
    {
      q: '两种模式到底该用哪种？',
      a: '不需要写代码、只是想把图挂到网页 / 博客 / 帖子里 → 用直链模式（加 &type=img），把接口地址当普通图片链接贴上去即可。需要拿到图片信息、下载到本地、或在程序里做进一步处理 → 用默认 JSON 模式，从返回的 url 字段里取地址。',
    },
    {
      q: '每次请求是同一张图还是随机换？',
      a: '每次请求都会随机。直链模式已在响应里禁用了缓存（no-store），浏览器刷新就会换图；JSON 模式每次调用返回的 url 也不相同。',
    },
    {
      q: 'API Key 怎么获取？',
      a: '注册并登录本站 → 点击右上角头像进入「个人中心」→ 在 API Key 区域复制你的专属密钥（ak_ 开头的一串字符）。未登录或没有 Key 将无法调用接口（返回 401）。',
    },
    {
      q: '返回 401 怎么解决？',
      a: '说明 Key 缺失或不对。逐项检查：① 是否复制了完整的 ak_ 开头字符串；② ?key= 是否写对（问号开头、等号连接）；③ 用请求头方式时是否写的是 X-API-Key。个人中心可以随时重置 Key。',
    },
    {
      q: '返回 429 是什么意思？',
      a: '你的 Key 调用频率超过了限制（防止滥用）。等一会儿再试即可恢复；有更高频率需求请联系站长。',
    },
    {
      q: 'Key 不小心泄露了怎么办？',
      a: '进入「个人中心」重置 API Key，旧 Key 立即失效。网页直链场景 Key 会出现在网址里，这是正常且可接受的（有频率限制兜底）；请勿在公开场合扩散你的 Key。',
    },
    {
      q: '图片 / 视频链接打不开或失效？',
      a: '① 检查 url 是否复制完整；② 个别资源可能已被管理员删除，重新请求一次获取新的即可；③ 直链模式请确认加了 &type=img（图片）或 &type=video（视频）。',
    },
    {
      q: '不写代码能先试试效果吗？',
      a: '可以。用网站顶部导航的「体验」页面，选择分类点击获取按钮，就能在线试每个接口的实际效果，试满意了再把地址复制去用。',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>{`API文档 - ${siteSettings.site_name}`}</title>
        <meta name="description" content={`${siteSettings.site_name}接口详细文档和使用说明`} />
      </Head>

      <Header />

      <main className="flex-grow py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* 页面标题 */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--color-text)] mb-3">
              API 文档
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              5 分钟上手：注册拿 Key → 复制地址 → 直接用
            </p>
          </div>

          {/* 选项卡 */}
          <div className="flex gap-1 p-1 bg-[var(--color-bg-subtle)] rounded-lg mb-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text)] shadow-subtle'
                    : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* 选项卡内容 */}
          <div>
            {/* ============ 新手入门 ============ */}
            {activeTab === '新手入门' && (
              <div className="space-y-6">
                {/* 三步上手 */}
                <div className="card">
                  <h2 className="text-lg font-semibold text-[var(--color-text)] mb-5">三步用上随机图片 API</h2>
                  <div className="space-y-5">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold shrink-0">1</div>
                      <div>
                        <h3 className="font-medium text-[var(--color-text)] mb-1">注册登录，拿到你的 API Key</h3>
                        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                          点击本站右上角登录 → 进入<strong>「个人中心」</strong>→ 复制你的专属 API Key（<code className="text-xs font-mono text-[var(--color-primary)]">ak_</code> 开头的一串字符）。它是你的调用凭证，所有接口都要带上它。
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold shrink-0">2</div>
                      <div>
                        <h3 className="font-medium text-[var(--color-text)] mb-1">选一种用法（见下方对比）</h3>
                        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                          <strong>不想写代码</strong> → 用直链模式，把接口地址直接当图片链接；<strong>要写程序</strong> → 用 JSON 模式，从返回数据里取图片地址。两种用法见下面的详细说明。
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold shrink-0">3</div>
                      <div>
                        <h3 className="font-medium text-[var(--color-text)] mb-1">复制地址就能用了</h3>
                        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                          到「接口列表」标签页，每个接口都配了一键复制按钮。想换分类，把地址里的分类名换掉即可；想先看效果，去网站顶部「体验」页面在线试。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 两种模式对比 */}
                <div className="card">
                  <h2 className="text-lg font-semibold text-[var(--color-text)] mb-1">两种用法，看你的场景选</h2>
                  <p className="text-sm text-[var(--color-text-tertiary)] mb-5">同一个接口，加不加 type 参数决定输出内容</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border-2 border-[var(--color-primary)] bg-[var(--color-primary-subtle)]">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="badge badge-primary">推荐</span>
                        <h3 className="font-semibold text-[var(--color-text)]">直链模式（不写代码）</h3>
                      </div>
                      <p className="text-xs text-[var(--color-text-tertiary)] mb-3">地址末尾加 <code className="font-mono">&amp;type=img</code>，接口地址直接就是一张图</p>
                      <code className="block text-[11px] font-mono bg-white/70 dark:bg-black/30 text-[var(--color-primary)] p-2.5 rounded break-all mb-3">
                        https://api.zxiaolin.com/api/v1/random/anime?key=你的Key&amp;type=img
                      </code>
                      <ul className="text-sm text-[var(--color-text-secondary)] space-y-1.5">
                        <li>• 浏览器打开直接显示图片，刷新换一张</li>
                        <li>• 挂网页：放进 &lt;img src=&quot;这里&quot;&gt;</li>
                        <li>• 发帖子：Markdown 里当图片链接贴</li>
                        <li>• 视频同理：加 <code className="font-mono text-xs">&amp;type=video</code></li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg border border-[var(--color-border)]">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="badge">默认</span>
                        <h3 className="font-semibold text-[var(--color-text)]">JSON 模式（写程序）</h3>
                      </div>
                      <p className="text-xs text-[var(--color-text-tertiary)] mb-3">什么参数都不加，返回一段 JSON 数据</p>
                      <pre className="text-[11px] font-mono bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] p-2.5 rounded mb-3 overflow-x-auto">{`{
  "url": "https://...图片地址",
  "id": 15,
  "category": "anime",
  "category_name": "二次元"
}`}</pre>
                      <ul className="text-sm text-[var(--color-text-secondary)] space-y-1.5">
                        <li>• 程序里 fetch / requests 调用</li>
                        <li>• 从 <code className="font-mono text-xs">url</code> 字段拿图片地址</li>
                        <li>• 可拿到编号、分类等信息做业务逻辑</li>
                        <li>• 适合下载、批量处理、二次开发</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* URL 结构拆解 */}
                <div className="card">
                  <h2 className="text-lg font-semibold text-[var(--color-text)] mb-1">接口地址是怎么构成的？</h2>
                  <p className="text-sm text-[var(--color-text-tertiary)] mb-4">看懂这一段，所有接口你都会拼了</p>
                  <div className="flex flex-wrap items-start gap-x-1 gap-y-4 mb-5">
                    {urlParts.map((part, i) => (
                      <React.Fragment key={i}>
                        <div className="flex flex-col gap-1 max-w-full">
                          <code className={`text-xs sm:text-sm font-mono font-semibold ${part.color} bg-[var(--color-bg-subtle)] px-2 py-1 rounded break-all`}>
                            {part.text}
                          </code>
                          <span className="text-[10px] text-[var(--color-text-tertiary)]">{part.label}</span>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="text-sm text-[var(--color-text-secondary)] space-y-2 border-t border-[var(--color-border)] pt-4">
                    <p><strong>换分类</strong>：把 <code className="font-mono text-xs text-[var(--color-primary)]">anime</code> 换成其他分类的 slug（见下方分类列表），比如 <code className="font-mono text-xs">landscape</code>、<code className="font-mono text-xs">food</code>。</p>
                    <p><strong>用视频接口</strong>：把路径里的 <code className="font-mono text-xs text-[var(--color-primary)]">/api/v1/random/</code> 换成 <code className="font-mono text-xs text-[var(--color-primary)]">/api/v1/video/</code>，type 参数换成 <code className="font-mono text-xs">video</code>。</p>
                    <p><strong>Key 的两种带法（等效）</strong>：网址参数 <code className="font-mono text-xs">?key=ak_xxx</code> 或请求头 <code className="font-mono text-xs">X-API-Key: ak_xxx</code>。网页里用前者，程序里推荐后者。</p>
                  </div>
                </div>

                {/* 可用分类 */}
                <div className="card">
                  <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">可用分类</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {displayCategories.map((cat) => {
                      const isVideo = (cat as any).type === 'video';
                      return (
                        <div key={cat.id} className="p-3 bg-[var(--color-bg-subtle)] rounded-md">
                          <h3 className="font-medium text-[var(--color-text)] text-sm">
                            {isVideo ? '🎬' : '🖼️'} {cat.name}
                            <span className="ml-1.5 text-[10px] font-normal text-[var(--color-text-tertiary)]">
                              {isVideo ? '视频' : '图片'}
                            </span>
                          </h3>
                          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{cat.description || cat.slug}</p>
                          <code className="text-[10px] font-mono text-[var(--color-primary)] block mt-1">
                            /api/v1/{isVideo ? 'video' : 'random'}/{cat.slug}
                          </code>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ============ 接口列表 ============ */}
            {activeTab === '接口列表' && (
              <div className="space-y-3">
                <div className="card border-l-4 border-l-orange-400 bg-orange-50/50 dark:bg-orange-950/10 p-4 rounded-r-lg">
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    每个接口提供两个复制按钮：<strong>复制直链</strong>得到可直接当图片/视频链接用的地址（自动带 key 和 type 参数），<strong>复制 cURL</strong>得到程序调试用的命令。记得把地址里的 <code className="text-xs font-mono">your_api_key</code> 换成你自己的 Key。
                  </p>
                </div>
                {displayApis.map((api) => {
                  const isVideoApi = api.url.includes('/video/');
                  const typeParam = isVideoApi ? 'type=video' : 'type=img';
                  return (
                    <div key={api.id} className="card">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-[var(--color-text)]">
                          {isVideoApi ? '🎬' : '🖼️'} {api.name}
                        </h3>
                        <span className="badge badge-primary">{api.category}</span>
                      </div>
                      <p className="text-sm text-[var(--color-text-secondary)] mb-3">{api.description}</p>
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <code className="text-xs font-mono bg-[var(--color-bg-subtle)] px-2 py-1 rounded">
                          {api.url}
                        </code>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <CopyApiButton
                          buildText={(base, apiKey) => `${base}${api.url}?key=${apiKey}&${typeParam}`}
                          label="复制直链"
                          className="text-xs px-3 py-1.5 shrink-0"
                        />
                        <CopyApiButton
                          buildText={(base, apiKey) => `curl -X GET "${base}${api.url}" -H "X-API-Key: ${apiKey}"`}
                          label="复制 cURL"
                          className="text-xs px-3 py-1.5 shrink-0"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ============ 参数说明 ============ */}
            {activeTab === '参数说明' && (
              <div className="space-y-6">
                <div className="card">
                  <h2 className="text-lg font-semibold text-[var(--color-text)] mb-1">请求参数（写在网址里）</h2>
                  <p className="text-sm text-[var(--color-text-tertiary)] mb-4">即 URL 中问号后面的部分，多个参数用 &amp; 连接</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[var(--color-border)] text-left">
                          <th className="py-2 pr-4 font-medium text-[var(--color-text)]">参数名</th>
                          <th className="py-2 pr-4 font-medium text-[var(--color-text)]">是否必填</th>
                          <th className="py-2 font-medium text-[var(--color-text)]">说明</th>
                        </tr>
                      </thead>
                      <tbody>
                        {queryParams.map((p) => (
                          <tr key={p.name} className="border-b border-[var(--color-border-subtle)]">
                            <td className="py-2.5 pr-4"><code className="text-xs font-mono text-[var(--color-primary)]">{p.name}</code></td>
                            <td className="py-2.5 pr-4 text-xs">{p.required}</td>
                            <td className="py-2.5 text-[var(--color-text-secondary)]">{p.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="card">
                  <h2 className="text-lg font-semibold text-[var(--color-text)] mb-1">请求头（写在程序请求里）</h2>
                  <p className="text-sm text-[var(--color-text-tertiary)] mb-4">与 ?key= 参数二选一即可，两者都带时请求头优先</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[var(--color-border)] text-left">
                          <th className="py-2 pr-4 font-medium text-[var(--color-text)]">请求头</th>
                          <th className="py-2 pr-4 font-medium text-[var(--color-text)]">是否必填</th>
                          <th className="py-2 font-medium text-[var(--color-text)]">说明</th>
                        </tr>
                      </thead>
                      <tbody>
                        {headerParams.map((p) => (
                          <tr key={p.name} className="border-b border-[var(--color-border-subtle)]">
                            <td className="py-2.5 pr-4"><code className="text-xs font-mono text-[var(--color-primary)]">{p.name}</code></td>
                            <td className="py-2.5 pr-4 text-xs">{p.required}</td>
                            <td className="py-2.5 text-[var(--color-text-secondary)]">{p.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="card">
                  <h2 className="text-lg font-semibold text-[var(--color-text)] mb-1">返回字段（JSON 模式）</h2>
                  <p className="text-sm text-[var(--color-text-tertiary)] mb-4">默认模式下接口返回的 JSON 各字段含义</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[var(--color-border)] text-left">
                          <th className="py-2 pr-4 font-medium text-[var(--color-text)]">字段</th>
                          <th className="py-2 pr-4 font-medium text-[var(--color-text)]">类型</th>
                          <th className="py-2 font-medium text-[var(--color-text)]">说明</th>
                        </tr>
                      </thead>
                      <tbody>
                        {responseFields.map((f) => (
                          <tr key={f.name} className="border-b border-[var(--color-border-subtle)]">
                            <td className="py-2.5 pr-4"><code className="text-xs font-mono text-[var(--color-primary)]">{f.name}</code></td>
                            <td className="py-2.5 pr-4 text-xs text-[var(--color-text-tertiary)]">{f.type}</td>
                            <td className="py-2.5 text-[var(--color-text-secondary)]">{f.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-3">视频接口额外多一个 <code className="font-mono">type: &quot;video&quot;</code> 字段用于标识资源类型。</p>
                </div>

                <div className="card">
                  <h2 className="text-lg font-semibold text-[var(--color-text)] mb-1">错误码一览</h2>
                  <p className="text-sm text-[var(--color-text-tertiary)] mb-4">出错时接口返回 JSON：{'{'} &quot;error&quot;: &quot;原因&quot; {'}'}</p>
                  <div className="space-y-3">
                    {errorCodes.map((e) => (
                      <div key={e.code} className="flex gap-3 p-3 bg-[var(--color-bg-subtle)] rounded-lg">
                        <code className={`font-mono font-bold text-sm shrink-0 ${e.code === '429' ? 'text-orange-500' : 'text-red-500'}`}>{e.code}</code>
                        <div>
                          <p className="text-sm font-medium text-[var(--color-text)]">{e.meaning}</p>
                          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">解决：{e.fix}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ============ 代码示例 ============ */}
            {activeTab === '代码示例' && (
              <div className="space-y-4">
                <div className="card border-l-4 border-l-orange-400 bg-orange-50/50 dark:bg-orange-950/10 p-4 rounded-r-lg">
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    把示例里的 <code className="text-xs font-mono">your_api_key</code> 替换成你在个人中心复制的 Key（<code className="text-xs font-mono">ak_</code> 开头）即可运行。
                  </p>
                </div>
                {Object.entries(exampleCodes).map(([lang, code]) => (
                  <div key={lang} className="card overflow-hidden">
                    <div className="px-4 py-2.5 bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)]">
                      <h3 className="text-sm font-medium text-[var(--color-text)] capitalize">
                        {lang === 'curl' ? 'cURL（命令行）' : lang === 'javascript' ? 'JavaScript（浏览器 / Node）' : lang === 'python' ? 'Python' : lang === 'html' ? 'HTML（网页嵌图）' : 'HTML（网页嵌视频）'}
                      </h3>
                    </div>
                    <div className="p-4 overflow-x-auto">
                      <pre className="text-sm">
                        <code>{code}</code>
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ============ 常见问题 ============ */}
            {activeTab === '常见问题' && (
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <details key={i} className="card group">
                    <summary className="cursor-pointer font-medium text-[var(--color-text)] text-sm sm:text-base flex items-center gap-2 select-none list-none">
                      <span className="text-[var(--color-primary)] transition-transform group-open:rotate-90">▸</span>
                      {faq.q}
                    </summary>
                    <div className="mt-3 pl-6 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                      {faq.a}
                    </div>
                  </details>
                ))}

                <div className="card border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20 mt-6">
                  <h3 className="text-base font-semibold text-[var(--color-text)] mb-3">使用规范</h3>
                  <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                    <li>• 每个 API Key 有调用频率限制，超限返回 429，请合理调用</li>
                    <li>• 图片 / 视频内容来自本站整理，如有侵权请联系我们删除</li>
                    <li>• 建议程序中添加错误处理，避免接口异常影响你的应用</li>
                    <li>• 如需商业使用或更高调用频率，请联系站长</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ApiDocs;
