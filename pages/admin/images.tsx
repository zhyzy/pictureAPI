// pages/admin/images.tsx - 图片管理
import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';

interface Image {
  id: number;
  url: string;
  cos_key: string;
  category_id: number;
  category_name: string;
  api_id: number;
  uploaded_by: number;
  uploaded_by_username: string;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  type?: string;
}

export default function ImagesPage() {
  const [images, setImages] = useState<Image[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [filterCategory, setFilterCategory] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [watermarkConfig, setWatermarkConfig] = useState({ text: '', position: 'bottom-right', fontSizePct: 1.7, opacityPct: 8, color: '#ffffff' });

  useEffect(() => {
    fetchCategories();
    fetchImages();
    fetchWatermarkSetting();
  }, [pagination.page, filterCategory]);

  const fetchWatermarkSetting = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const s = data.settings || {};
        setWatermarkEnabled(s.watermark_enabled === 'true');
        setWatermarkConfig({
          text: s.watermark_text || '',
          position: s.watermark_position || 'bottom-right',
          fontSizePct: parseFloat(s.watermark_font_size) || 1.7,
          opacityPct: Math.min(Math.max(parseFloat(s.watermark_opacity) || 8, 1), 100),
          color: s.watermark_color || '#ffffff',
        });
      }
    } catch (error) {
      console.error('获取水印设置失败:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        // 图片上传只允许选择图片分类
        setCategories((data.categories || []).filter((c: Category) => c.type !== 'video'));
      }
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  const fetchImages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = `/api/admin/images?page=${pagination.page}&limit=${pagination.limit}`;
      if (filterCategory) {
        url += `&category_id=${filterCategory}`;
      }

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setImages(data.images);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('获取图片失败:', error);
    } finally {
      setLoading(false);
    }
  };

  /** 给图片 base64 添加文字水印（Canvas 客户端处理，不增加服务器负担）
   *  几何规则与 settings.tsx 的预览绘制保持一致：边距 = 字号，字号 = 图宽百分比 */
  const addWatermark = (base64: string): Promise<string> =>
    new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);

        const text = (watermarkConfig.text || '').trim();
        if (text) {
          const fontSize = Math.max(Math.round((img.naturalWidth * watermarkConfig.fontSizePct) / 100), 12);
          const pad = fontSize;

          // 九宫格位置 → 对齐方式与坐标
          const pos = watermarkConfig.position || 'bottom-right';
          const row = pos.startsWith('top') ? 'top' : pos === 'center' || pos.startsWith('middle') ? 'middle' : 'bottom';
          const col = pos.endsWith('left') ? 'left' : pos.endsWith('right') ? 'right' : 'center';
          const x = col === 'left' ? pad : col === 'right' ? img.naturalWidth - pad : img.naturalWidth / 2;
          const y = row === 'top' ? pad : row === 'bottom' ? img.naturalHeight - pad : img.naturalHeight / 2;

          ctx.font = `lighter ${fontSize}px sans-serif`;
          ctx.globalAlpha = watermarkConfig.opacityPct / 100;
          ctx.fillStyle = watermarkConfig.color || '#ffffff';
          ctx.textAlign = col as CanvasTextAlign;
          ctx.textBaseline = row as CanvasTextBaseline;
          ctx.shadowColor = 'rgba(0,0,0,0.15)';
          ctx.shadowBlur = 2;
          ctx.fillText(text, x, y);
        }

        resolve(canvas.toDataURL('image/jpeg', 0.92));
      };
      img.onerror = () => resolve(base64); // 加水印失败则原图上传
      img.src = base64;
    });

  /** 将 File 转为 base64（Promise 包装，修复原回调无法被 catch 的问题） */
  const readFileAsBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error(`文件 ${file.name} 读取失败`));
      reader.readAsDataURL(file);
    });

  // 分批上传参数：每批最多 5 张、base64 总量 ≤ 12MB（接口限 20MB，留出余量）
  const CHUNK_MAX_COUNT = 5;
  const CHUNK_MAX_BYTES = 12 * 1024 * 1024;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const categoryId = (document.getElementById('upload-category') as HTMLSelectElement)?.value;
    if (!categoryId) {
      setError('请选择分类');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError('');
    setSuccess('');

    const total = files.length;
    const token = localStorage.getItem('token');
    let done = 0;
    let failed = 0;
    let chunk: string[] = [];
    let chunkBytes = 0;

    // 上传当前批次；普通失败只记失败数继续下一批，鉴权失败则终止全部
    const flushChunk = async () => {
      if (chunk.length === 0) return;
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          images: chunk,
          category_id: parseInt(categoryId),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error(data.error || '登录已过期，请重新登录');
        }
        failed += chunk.length;
      } else {
        done += data.images?.length || chunk.length;
      }
      chunk = [];
      chunkBytes = 0;
    };

    try {
      for (let i = 0; i < total; i++) {
        setUploadStatus(`正在处理 ${i + 1}/${total}...`);
        let base64 = await readFileAsBase64(files[i]);

        // 只有启用水印时才添加
        if (watermarkEnabled) {
          base64 = await addWatermark(base64);
        }

        chunk.push(base64);
        chunkBytes += base64.length;

        // 达到批上限或是最后一张时，发送这一批
        if (chunk.length >= CHUNK_MAX_COUNT || chunkBytes >= CHUNK_MAX_BYTES || i === total - 1) {
          setUploadStatus(`正在上传 ${done + 1}-${done + chunk.length}/${total}...`);
          await flushChunk();
        }
        setUploadProgress(Math.round((done / total) * 100));
      }

      setUploadProgress(100);
      setUploadStatus('');
      if (failed > 0) {
        setSuccess(`上传完成：成功 ${done} 张，失败 ${failed} 张`);
      } else {
        setSuccess(`成功上传 ${done} 张图片！`);
      }
      setShowUploadModal(false);
      fetchImages();

      setTimeout(() => {
        setUploadProgress(0);
        setSuccess('');
      }, 3000);
    } catch (err: any) {
      setError(`${err.message}${done > 0 ? `（此前已成功 ${done} 张）` : ''}`);
      setUploadStatus('');
      fetchImages();
    } finally {
      setUploading(false);
      // 清空 file input，允许重复选同一批文件
      e.target.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这张图片吗？')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/images', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '删除失败');
      }

      setSuccess('图片删除成功');
      fetchImages();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
  };

  return (
    <AdminLayout title="图片管理">
      {/* 提示信息 */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg"
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 工具栏 */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setPagination({ ...pagination, page: 1 });
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            <option value="">全部分类</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <span className="text-gray-600 dark:text-gray-400">
            共 {pagination.total} 张图片
          </span>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition shadow-lg flex items-center"
        >
          <span className="mr-2">⬆️</span>
          上传图片
        </button>
      </div>

      {/* 图片网格 */}
      {loading ? (
        <div className="columns-3 md:columns-4 lg:columns-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse break-inside-avoid mb-4"></div>
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">🖼️</div>
          <p className="text-gray-500 dark:text-gray-400">暂无图片</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">点击上方按钮上传第一张图片</p>
        </div>
      ) : (
        <>
          <div className="columns-3 md:columns-4 lg:columns-6 gap-4">
            {images.map((image) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden break-inside-avoid mb-4"
              >
                <img
                  src={image.url}
                  alt={`Image ${image.id}`}
                  crossOrigin="anonymous"
                  className="w-full h-auto"
                  onError={(e) => {
                    const t = e.target as HTMLImageElement;
                    t.onerror = null;
                    t.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='13' fill='%239ca3af'%3E%E5%9B%BE%E7%89%87%E5%8A%A0%E8%BD%BD%E5%A4%B1%E8%B4%A5%3C/text%3E%3C/svg%3E";
                  }}
                />
                {/* 悬停遮罩 */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-all flex space-x-2">
                    <a
                      href={image.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition"
                      title="查看大图"
                    >
                      👁️
                    </a>
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition text-white"
                      title="删除"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                {/* 分类标签 */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <span className="text-white text-xs">{image.category_name || '未分类'}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 分页 */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                上一页
              </button>
              <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                第 {pagination.page} / {pagination.totalPages} 页
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}

      {/* 上传弹窗 */}
      <AnimatePresence>
        {showUploadModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => !uploading && setShowUploadModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">上传图片</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      选择分类 *
                    </label>
                    <select
                      id="upload-category"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-primary)]"
                    >
                      <option value="">请选择分类</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      选择图片 *
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-[var(--color-primary)] transition cursor-pointer">
                      <div className="space-y-1 text-center">
                        <div className="text-4xl mb-2">📁</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <label className="cursor-pointer text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]">
                            <span>点击选择图片</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleFileUpload}
                              disabled={uploading}
                              className="sr-only"
                            />
                          </label>
                          <p className="text-xs text-gray-500 mt-1">支持 JPG, PNG, GIF, WEBP</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {uploading && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <span>{uploadStatus || '上传中...'}</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-[var(--color-primary)] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    disabled={uploading}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50"
                  >
                    取消
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
