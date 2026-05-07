import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { apiInterfaces, apiCategories } from '@/data/apiData';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

const ApiDocs = () => {
  const [activeTab, setActiveTab] = useState<string>('快速开始');
  const [copied, setCopied] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

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

  // 获取要显示的分类列表（优先使用动态数据，fallback 到静态数据）
  const displayCategories = categories.length > 0 ? categories : apiCategories;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const exampleCodes = {
    curl: `# 获取随机动漫图片（必须携带 API Key）
curl -X GET "https://api.zxiaolin.com/api/v1/random/anime" \\
  -H "X-API-Key: your_api_key"

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
    html: `<!-- 在 HTML 中使用（必须携带 API Key） -->
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
  };

  const tabs = ['快速开始', '接口列表', '代码示例', '注意事项'];

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>API文档 - 樱道 API</title>
        <meta name="description" content="樱道API接口详细文档和使用说明" />
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
              了解如何使用樱道 API 获取图片
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
            {/* 快速开始 */}
            {activeTab === '快速开始' && (
              <div className="space-y-6">
                <div className="card">
                  <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">基础信息</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-[var(--color-border)]">
                      <span className="text-sm text-[var(--color-text-secondary)]">API 基础 URL</span>
                      <code className="text-sm font-mono text-[var(--color-primary)]">https://api.zxiaolin.com</code>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-[var(--color-border)]">
                      <span className="text-sm text-[var(--color-text-secondary)]">请求方式</span>
                      <span className="badge badge-primary">GET</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-[var(--color-border)]">
                      <span className="text-sm text-[var(--color-text-secondary)]">认证方式</span>
                      <code className="text-xs font-mono bg-red-50 dark:bg-red-950/30 text-red-600 px-2 py-1 rounded">X-API-Key: your_api_key</code>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-[var(--color-text-secondary)]">返回格式</span>
                      <span className="badge">JSON</span>
                    </div>
                  </div>
                </div>

                <div className="card border-l-4 border-l-orange-400 bg-orange-50/50 dark:bg-orange-950/10 p-4 rounded-r-lg">
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    <strong>🔑 认证要求：</strong>所有请求必须在 Header 中携带
                    <code className="text-xs font-mono mx-1 px-1.5 py-0.5 bg-white/60 dark:bg-black/20 rounded">X-API-Key</code>
                    ，未携带或无效的 Key 将返回
                    <code className="text-xs font-mono mx-1 px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 rounded">401 Unauthorized</code>。
                    请前往用户中心获取你的 API Key。
                  </p>
                </div>

                <div className="card">
                  <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">可用分类</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {displayCategories.map((cat) => (
                      <div key={cat.id} className="p-3 bg-[var(--color-bg-subtle)] rounded-md">
                        <h3 className="font-medium text-[var(--color-text)] text-sm">{cat.name}</h3>
                        <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{cat.description || cat.slug}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">响应示例</h2>
                  <pre className="text-sm">
                    <code>{`{
  "url": "https://example.com/image.jpg",
  "id": 123,
  "category": "anime",
  "category_name": "动漫"
}`}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* 接口列表 */}
            {activeTab === '接口列表' && (
              <div className="space-y-3">
                {apiInterfaces.map((api) => (
                  <div key={api.id} className="card">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-[var(--color-text)]">{api.name}</h3>
                      <span className="badge badge-primary">{api.category}</span>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-3">{api.description}</p>
                    <div className="flex items-center justify-between gap-3">
                      <code className="text-xs font-mono bg-[var(--color-bg-subtle)] px-2 py-1 rounded">
                        /api/v1/random/{api.category.toLowerCase()}
                      </code>
                      <button
                        onClick={() => copyToClipboard(`curl -X GET "https://api.zxiaolin.com/api/v1/random/${api.category.toLowerCase()}" -H "X-API-Key: your_api_key"`, `api-${api.id}`)}
                        className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                          copied === `api-${api.id}`
                            ? 'bg-success-light text-success-DEFAULT'
                            : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-subtle)] hover:text-[var(--color-primary)]'
                        }`}
                      >
                        {copied === `api-${api.id}` ? '已复制' : '复制'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 代码示例 */}
            {activeTab === '代码示例' && (
              <div className="space-y-4">
                {Object.entries(exampleCodes).map(([lang, code]) => (
                  <div key={lang} className="card overflow-hidden">
                    <div className="px-4 py-2.5 bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)]">
                      <h3 className="text-sm font-medium text-[var(--color-text)] capitalize">
                        {lang === 'curl' ? 'cURL' : lang}
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

            {/* 注意事项 */}
            {activeTab === '注意事项' && (
              <div className="space-y-4">
                <div className="card border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20">
                  <h3 className="text-base font-semibold text-[var(--color-text)] mb-3 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>重要：API Key 是必需的</span>
                  </h3>
                  <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5 font-bold">•</span>
                      <span><strong>所有接口必须在请求头中携带 X-API-Key</strong>，否则请求将被拒绝（返回 401）</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5 font-bold">•</span>
                      <span>请前往用户中心获取你的专属 API Key，并妥善保管，勿泄露给他人</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5 font-bold">•</span>
                      <span>每个 API Key 有调用频率限制，超限后将返回 429（Too Many Requests）</span>
                    </li>
                  </ul>
                </div>

                <div className="card border-l-4 border-l-warning-DEFAULT">
                  <h3 className="text-base font-semibold text-[var(--color-text)] mb-3">使用规范</h3>
                  <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                    <li className="flex items-start gap-2">
                      <span className="text-warning-DEFAULT mt-0.5">•</span>
                      <span>请合理调用 API，避免频繁请求导致账号被限制</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-warning-DEFAULT mt-0.5">•</span>
                      <span>建议添加错误处理，以防 API 服务不可用时影响应用</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-warning-DEFAULT mt-0.5">•</span>
                      <span>图片内容来自互联网，如有侵权请联系我们删除</span>
                    </li>
                  </ul>
                </div>

                <div className="card">
                  <h3 className="text-base font-semibold text-[var(--color-text)] mb-3">使用建议</h3>
                  <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--color-primary)] mt-0.5">•</span>
                      <span>在用户仪表盘查看 API 调用统计和用量情况</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--color-primary)] mt-0.5">•</span>
                      <span>如需商业使用或更高调用频率，请联系我们</span>
                    </li>
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
