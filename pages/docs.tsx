import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { apiInterfaces, apiCategories } from '@/data/apiData';

const ApiDocs = () => {
  const [activeTab, setActiveTab] = useState<string>('参数说明');

  // 定义API参数
  const apiParameters = [
    {
      name: 'category',
      type: 'string',
      required: true,
      default: 'anime',
      description: '图片分类，可选值：anime(动漫)、scenery(风景)、game(游戏)、girl(美女)等',
      example: 'anime'
    },
    {
      name: 'type',
      type: 'string',
      required: false,
      default: 'json',
      description: '返回类型，可选值：json(返回JSON数据)、redirect(直接重定向到图片)、random(随机返回类型)',
      example: 'redirect'
    },
    {
      name: 'size',
      type: 'string',
      required: false,
      default: 'regular',
      description: '图片尺寸，可选值：small(小图)、regular(普通)、large(大图)、original(原图)',
      example: 'large'
    },
    {
      name: 'r18',
      type: 'number',
      required: false,
      default: '0',
      description: '是否返回成人内容，可选值：0(否)、1(是)、2(混合)',
      example: '0'
    },
    {
      name: 'proxy',
      type: 'number',
      required: false,
      default: '0',
      description: '是否通过代理获取图片，可选值：0(否)、1(是)',
      example: '0'
    },
    {
      name: 'format',
      type: 'string',
      required: false,
      default: 'all',
      description: '图片格式，可选值：jpg、png、gif、all(全部)',
      example: 'jpg'
    }
  ];

  // 定义API响应示例
  const apiResponses = {
    json: `{
  "code": 200,
  "msg": "success",
  "data": {
    "url": "https://example.com/images/anime/123.jpg",
    "width": 1920,
    "height": 1080,
    "size": 1024000,
    "format": "jpg",
    "tags": ["anime", "girl", "kawaii"],
    "source": "pixiv",
    "source_id": "98765432"
  }
}`,
    error: `{
  "code": 400,
  "msg": "参数错误",
  "data": null
}`
  };

  // 定义示例代码
  const exampleCodes = {
    javascript: `// 使用Fetch API获取图片
fetch('https://api.zhihuiyun.work/image/api/image.php?category=anime&type=json')
  .then(response => response.json())
  .then(data => {
    console.log(data);
    const imgElement = document.createElement('img');
    imgElement.src = data.data.url;
    document.body.appendChild(imgElement);
  })
  .catch(error => console.error('Error:', error));`,
    python: `# 使用Python requests库获取图片
import requests

response = requests.get('https://api.zhihuiyun.work/image/api/image.php?category=anime&type=json')
data = response.json()

if data['code'] == 200:
    image_url = data['data']['url']
    print(f"获取到图片URL: {image_url}")
else:
    print(f"请求失败: {data['msg']}")`,
    html: `<!-- 在HTML中直接使用 -->
<img src="https://api.zhihuiyun.work/image/api/image.php?category=anime&type=redirect" alt="随机动漫图片">

<!-- 带参数的完整示例 -->
<img src="https://api.zhihuiyun.work/image/api/image.php?category=scenery&type=redirect&size=large&format=jpg" alt="随机风景图片">`
  };

  return (
    <div className="min-h-screen flex flex-col text-gray-900 dark:text-gray-100">
      <Head>
        <title>API文档 - 樱道API</title>
        <meta name="description" content="樱道API接口详细文档和使用说明" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold mb-6 text-center text-primary dark:text-accent"
          >
            API文档
          </motion.h1>

          {/* 基本信息 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-10"
          >
            <h2 className="text-2xl font-bold mb-4 text-secondary dark:text-accent">基本信息</h2>
            <div className="card p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">API 基础URL</h3>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  <code className="text-primary dark:text-accent">https://api.zhihuiyun.work/image/api/image.php</code>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">请求方式</h3>
                <p>GET</p>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">返回格式</h3>
                <p>JSON 或 直接重定向到图片，取决于 <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">type</code> 参数</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">调用频率限制</h3>
                <p>普通用户：每分钟60次请求</p>
                <p>高级用户：每分钟300次请求</p>
                <p>特殊用户：无限制</p>
              </div>
            </div>
          </motion.section>

          {/* 选项卡导航 */}
          <div className="flex border-b mb-6">
            {['参数说明', '响应示例', '调用示例'].map((tab, index) => (
              <button
                key={tab}
                className={`px-4 py-2 font-medium ${
                  activeTab === tab
                    ? 'text-primary dark:text-accent border-b-2 border-primary dark:border-accent'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* 选项卡内容 */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* 参数说明 */}
            {activeTab === '参数说明' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">参数名</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">类型</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">是否必须</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">默认值</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">说明</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">示例</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {apiParameters.map((param, index) => (
                      <tr key={param.name} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary dark:text-accent">{param.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{param.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {param.required ? (
                            <span className="text-red-500">是</span>
                          ) : (
                            <span className="text-green-500">否</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{param.default}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{param.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{param.example}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 响应示例 */}
            {activeTab === '响应示例' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">成功响应 (JSON格式)</h3>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">{apiResponses.json}</code>
                  </pre>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">错误响应</h3>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">{apiResponses.error}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* 调用示例 */}
            {activeTab === '调用示例' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">JavaScript</h3>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">{exampleCodes.javascript}</code>
                  </pre>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Python</h3>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">{exampleCodes.python}</code>
                  </pre>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">HTML</h3>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">{exampleCodes.html}</code>
                  </pre>
                </div>
              </div>
            )}
          </motion.div>

          {/* 示例链接 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10"
          >
            <h2 className="text-2xl font-bold mb-4 text-secondary dark:text-accent">API示例链接</h2>
            <div className="card p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow duration-300">
                  <h3 className="font-semibold mb-2">获取随机动漫图片 (JSON)</h3>
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded mb-3 overflow-x-auto">
                    <code className="text-sm text-primary dark:text-accent">https://api.zhihuiyun.work/image/api/image.php?category=anime&type=json</code>
                  </div>
                  <button 
                    className="btn-primary text-sm py-1 px-3"
                    onClick={() => {
                      navigator.clipboard.writeText('https://api.zhihuiyun.work/image/api/image.php?category=anime&type=json');
                    }}
                  >
                    复制链接
                  </button>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow duration-300">
                  <h3 className="font-semibold mb-2">获取随机动漫图片 (直接显示)</h3>
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded mb-3 overflow-x-auto">
                    <code className="text-sm text-primary dark:text-accent">https://api.zhihuiyun.work/image/api/image.php?category=anime&type=redirect</code>
                  </div>
                  <button 
                    className="btn-primary text-sm py-1 px-3"
                    onClick={() => {
                      navigator.clipboard.writeText('https://api.zhihuiyun.work/image/api/image.php?category=anime&type=redirect');
                    }}
                  >
                    复制链接
                  </button>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow duration-300">
                  <h3 className="font-semibold mb-2">获取高清风景图片</h3>
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded mb-3 overflow-x-auto">
                    <code className="text-sm text-primary dark:text-accent">https://api.zhihuiyun.work/image/api/image.php?category=scenery&type=redirect&size=large</code>
                  </div>
                  <button 
                    className="btn-primary text-sm py-1 px-3"
                    onClick={() => {
                      navigator.clipboard.writeText('https://api.zhihuiyun.work/image/api/image.php?category=scenery&type=redirect&size=large');
                    }}
                  >
                    复制链接
                  </button>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow duration-300">
                  <h3 className="font-semibold mb-2">获取JPG格式游戏图片</h3>
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded mb-3 overflow-x-auto">
                    <code className="text-sm text-primary dark:text-accent">https://api.zhihuiyun.work/image/api/image.php?category=game&format=jpg&type=redirect</code>
                  </div>
                  <button 
                    className="btn-primary text-sm py-1 px-3"
                    onClick={() => {
                      navigator.clipboard.writeText('https://api.zhihuiyun.work/image/api/image.php?category=game&format=jpg&type=redirect');
                    }}
                  >
                    复制链接
                  </button>
                </div>
              </div>
            </div>
          </motion.section>

          {/* 注意事项 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10"
          >
            <h2 className="text-2xl font-bold mb-4 text-secondary dark:text-accent">注意事项</h2>
            <div className="card p-6">
              <ul className="list-disc list-inside space-y-2">
                <li>请合理调用API，避免频繁请求导致IP被封禁</li>
                <li>图片内容来自互联网，如有侵权请联系我们删除</li>
                <li>建议在使用时添加错误处理，以防API服务不可用时影响您的应用</li>
                <li>如需商业使用或更高调用频率，请联系我们获取授权</li>
                <li>API服务可能会不定期更新，请关注文档变化</li>
              </ul>
            </div>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ApiDocs; 