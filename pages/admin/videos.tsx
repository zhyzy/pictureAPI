// pages/admin/videos.tsx - 视频管理
import React, { useEffect, useRef, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';

interface Video {
  id: number;
  url: string;
  cos_key: string;
  category_id: number;
  category_name: string;
  uploaded_by_username: string;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  type: string;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 });
  const [filterCategory, setFilterCategory] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [pagination.page, filterCategory]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/categories', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCategories((data.categories || []).filter((c: Category) => c.type === 'video'));
      }
    } catch (err) {
      console.error('获取分类失败:', err);
    }
  };

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = `/api/admin/images?media_type=video&page=${pagination.page}&limit=${pagination.limit}`;
      if (filterCategory) {
        url += `&category_id=${filterCategory}`;
      }
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setVideos(data.images);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('获取视频失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 用 XMLHttpRequest 上传 multipart，可获得真实上传进度
  const uploadWithProgress = (formData: FormData, onPct?: (pct: number) => void): Promise<any> =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;
      xhr.open('POST', '/api/admin/upload-video');
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          onPct?.(pct);
        }
      };
      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(data);
          } else {
            reject(new Error(data.error || '上传失败'));
          }
        } catch (parseErr) {
          reject(new Error('服务器响应异常'));
        }
      };
      xhr.onerror = () => reject(new Error('网络错误，上传失败'));
      xhr.onabort = () => reject(new Error('已取消'));
      xhr.send(formData);
    });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const categoryId = (document.getElementById('upload-video-category') as HTMLSelectElement)?.value;
    if (!categoryId) {
      setError('请选择视频分类');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError('');
    setSuccess('');

    const total = files.length;
    let done = 0;
    let cancelled = false;
    const failedNames: string[] = [];

    try {
      // 逐个视频单独请求：单请求体最小化，单个失败不影响其他视频
      for (let i = 0; i < total; i++) {
        const file = files[i];

        // 客户端预检：超过 200MB 会被 Nginx 拦截（413），直接标记失败不发请求
        if (file.size > 200 * 1024 * 1024) {
          failedNames.push(`${file.name}（超过 200MB）`);
          continue;
        }

        const formData = new FormData();
        formData.append('category_id', categoryId);
        formData.append('videos', file);

        setUploadStatus(`正在上传 ${i + 1}/${total}：${file.name}`);
        try {
          await uploadWithProgress(formData, (pct) => {
            const overall = Math.round(((i + pct / 100) / total) * 100);
            setUploadProgress(overall);
            setUploadStatus(`正在上传 ${i + 1}/${total}：${file.name}（${pct}%）`);
          });
          done += 1;
        } catch (err: any) {
          if (err.message === '已取消') {
            cancelled = true;
            break;
          }
          failedNames.push(file.name);
        }
      }

      setUploadProgress(100);
      setUploadStatus('');
      setShowUploadModal(false);
      fetchVideos();

      if (cancelled) {
        setSuccess(`已取消上传，本次成功 ${done} 个视频`);
      } else if (failedNames.length > 0) {
        setSuccess(`成功上传 ${done} 个视频`);
        setError(`以下 ${failedNames.length} 个视频上传失败：${failedNames.join('、')}`);
      } else {
        setSuccess(`成功上传 ${done} 个视频！`);
      }

      setTimeout(() => {
        setUploadProgress(0);
        setSuccess('');
      }, 3000);
    } catch (err: any) {
      setError(`${err.message}${done > 0 ? `（此前已成功 ${done} 个）` : ''}`);
      setUploadStatus('');
      fetchVideos();
    } finally {
      setUploading(false);
      xhrRef.current = null;
      e.target.value = '';
    }
  };

  const handleCancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    setUploading(false);
    setUploadProgress(0);
    setUploadStatus('');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个视频吗？（CDN 缓存可能在短时间内仍可访问）')) return;

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

      setSuccess('视频删除成功');
      fetchVideos();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
  };

  return (
    <AdminLayout title="视频管理">
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
            共 {pagination.total} 个视频
          </span>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition shadow-lg flex items-center"
        >
          <span className="mr-2">⬆️</span>
          上传视频
        </button>
      </div>

      {/* 视频网格 */}
      {loading ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse break-inside-avoid mb-4"></div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">🎬</div>
          <p className="text-gray-500 dark:text-gray-400">暂无视频</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            先在「分类管理」创建视频分类，再点击上方按钮上传视频
          </p>
        </div>
      ) : (
        <>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {videos.map((video) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden break-inside-avoid mb-4"
              >
                <video
                  src={video.url}
                  crossOrigin="anonymous"
                  className="w-full h-auto bg-black"
                  style={{ aspectRatio: '16 / 9' }}
                  onLoadedMetadata={(e) => {
                    // 元数据加载后按视频真实宽高比显示，横竖版都完整展示不裁剪
                    const el = e.currentTarget;
                    if (el.videoWidth && el.videoHeight) {
                      el.style.aspectRatio = `${el.videoWidth} / ${el.videoHeight}`;
                    }
                  }}
                  preload="metadata"
                  muted
                  playsInline
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-all flex space-x-2">
                    <button
                      onClick={() => setPreviewVideo(video)}
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition"
                      title="播放"
                    >
                      ▶️
                    </button>
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition"
                      title="新窗口打开"
                    >
                      🔗
                    </a>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition text-white"
                      title="删除"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <span className="text-white text-xs">{video.category_name || '未分类'}</span>
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
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">上传视频</h3>

                {categories.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="text-4xl mb-3">📂</div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      还没有视频分类。请先到「分类管理」创建一个类型为「视频」的分类。
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        视频分类 *
                      </label>
                      <select
                        id="upload-video-category"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-primary)]"
                      >
                        <option value="">请选择视频分类</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        选择视频 *
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-[var(--color-primary)] transition cursor-pointer">
                        <div className="space-y-1 text-center">
                          <div className="text-4xl mb-2">🎬</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <label className="cursor-pointer text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]">
                              <span>点击选择视频</span>
                              <input
                                type="file"
                                accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska,.mp4,.webm,.mov,.avi,.mkv,.m4v,.flv"
                                multiple
                                onChange={handleFileUpload}
                                disabled={uploading}
                                className="sr-only"
                              />
                            </label>
                            <p className="text-xs text-gray-500 mt-1">支持 MP4/WebM/MOV/AVI/MKV，单个最大 500MB</p>
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
                        <button
                          onClick={handleCancelUpload}
                          className="mt-2 text-xs text-red-500 hover:text-red-600"
                        >
                          取消上传
                        </button>
                      </div>
                    )}
                  </div>
                )}

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

      {/* 视频预览弹窗 */}
      <AnimatePresence>
        {previewVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setPreviewVideo(null)}
          >
            <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
              <video
                src={previewVideo.url}
                crossOrigin="anonymous"
                className="w-full max-h-[80vh] rounded-lg bg-black"
                controls
                autoPlay
                playsInline
              />
              <div className="flex justify-between items-center mt-3 text-white">
                <span className="text-sm">{previewVideo.category_name || '未分类'}</span>
                <button
                  onClick={() => setPreviewVideo(null)}
                  className="text-sm px-3 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
