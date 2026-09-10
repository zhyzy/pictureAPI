const fs = require('fs');
const path = require('path');
const { uploadFile: uploadCosFile, deleteFile: deleteCosFile, getFileUrl: getCosFileUrl, bucket, region } = require('./cos');
const {
  uploadFile: uploadQiniuFile,
  uploadFileFromPath: uploadQiniuFileFromPath,
  deleteFile: deleteQiniuFile,
  getProxiedFileUrl: getQiniuProxiedUrl,
  isConfigured: isQiniuConfigured,
  bucket: qiniuBucket,
  domain: qiniuDomain,
} = require('./qiniu');

const STORAGE_PROVIDERS = {
  cos: '腾讯云 COS',
  qiniu: '七牛云',
  local: '本地存储',
  other: '其他存储',
};

function normalizeProvider(provider) {
  return Object.prototype.hasOwnProperty.call(STORAGE_PROVIDERS, provider) ? provider : 'cos';
}

function getPublicUrl(reqPath) {
  const normalized = reqPath.startsWith('/') ? reqPath : `/${reqPath}`;
  return normalized.replace(/\\/g, '/');
}

function getLocalUploadRoot() {
  return path.join(process.cwd(), 'public', 'uploads');
}

async function getGlobalStorageProvider(db) {
  const setting = db.get('SELECT value FROM settings WHERE key = ?', ['storage_provider']);
  return normalizeProvider(setting?.value || 'cos');
}

async function resolveStorageProvider(db, categoryId) {
  if (categoryId) {
    const category = db.get('SELECT storage_provider FROM categories WHERE id = ?', [categoryId]);
    if (category?.storage_provider && category.storage_provider !== 'inherit') {
      return normalizeProvider(category.storage_provider);
    }
  }

  return getGlobalStorageProvider(db);
}

// 把存储 key 安全解析为 uploads 根目录内的绝对路径，越界时返回 null
function resolveLocalPath(key) {
  const root = getLocalUploadRoot();
  const absolutePath = path.resolve(root, String(key).replace(/^\/+/, '').replace(/\\/g, '/'));
  const rel = path.relative(root, absolutePath);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) {
    return null;
  }
  return absolutePath;
}

async function uploadLocalFile(file, key) {
  const absolutePath = resolveLocalPath(key);
  if (!absolutePath) {
    throw new Error('非法的存储路径');
  }
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, file);

  const safeKey = path.relative(getLocalUploadRoot(), absolutePath).replace(/\\/g, '/');
  return {
    url: getPublicUrl(`/uploads/${safeKey}`),
    storageKey: safeKey,
  };
}

async function uploadFileToStorage(db, file, key, categoryId) {
  const provider = await resolveStorageProvider(db, categoryId);

  if (provider === 'local') {
    const result = await uploadLocalFile(file, key);
    return { url: result.url, storageKey: result.storageKey, provider };
  }

  if (provider === 'qiniu') {
    const result = await uploadQiniuFile(file, key);
    return { url: result.url, storageKey: result.key, provider };
  }

  if (provider === 'other') {
    throw new Error('其他存储暂未配置，请先切换为腾讯云 COS、七牛云或本地存储');
  }

  const result = await uploadCosFile(file, key);
  return { url: result.url, storageKey: result.cosKey, provider: 'cos' };
}

// 从本地临时文件路径流式上传（大文件不占内存）
async function uploadFileToStorageFromPath(db, filePath, key, categoryId) {
  const provider = await resolveStorageProvider(db, categoryId);

  if (provider === 'local') {
    const absolutePath = resolveLocalPath(key);
    if (!absolutePath) {
      throw new Error('非法的存储路径');
    }
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.copyFileSync(filePath, absolutePath);
    const safeKey = path.relative(getLocalUploadRoot(), absolutePath).replace(/\\/g, '/');
    return { url: getPublicUrl(`/uploads/${safeKey}`), storageKey: safeKey, provider };
  }

  if (provider === 'qiniu') {
    const result = await uploadQiniuFileFromPath(filePath, key);
    return { url: result.url, storageKey: result.key, provider };
  }

  if (provider === 'other') {
    throw new Error('其他存储暂未配置，请先切换为腾讯云 COS、七牛云或本地存储');
  }

  // cos：读取文件流为 buffer（cos SDK 该接口用 buffer；视频场景不建议 cos，建议七牛/本地）
  const buffer = fs.readFileSync(filePath);
  const result = await uploadCosFile(buffer, key);
  return { url: result.url, storageKey: result.cosKey, provider: 'cos' };
}

async function deleteStoredFile(image) {
  const provider = normalizeProvider(image.storage_provider || (image.cos_key ? 'cos' : 'local'));

  if (!image.cos_key) return;

  if (provider === 'local') {
    const absolutePath = resolveLocalPath(image.cos_key);
    if (absolutePath && fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
    return;
  }

  if (provider === 'qiniu') {
    await deleteQiniuFile(image.cos_key);
    return;
  }

  if (provider === 'cos') {
    await deleteCosFile(image.cos_key);
  }
}

async function getStoredFileUrl(image, expires = 7200) {
  const provider = normalizeProvider(image.storage_provider || (image.cos_key ? 'cos' : 'local'));

  if (!image.cos_key || provider === 'local') {
    return image.url;
  }

  if (provider === 'qiniu') {
    // 展示统一走同源代理，规避浏览器对第三方存储域名的 ORB/信誉拦截
    return image.cos_key ? getQiniuProxiedUrl(image.cos_key) : image.url;
  }

  if (provider === 'cos') {
    return getCosFileUrl(image.cos_key, expires);
  }

  return image.url;
}

function getStorageStatus() {
  return {
    providers: STORAGE_PROVIDERS,
    cos: {
      bucket: bucket || '',
      region: region || '',
      configured: Boolean(bucket && region && process.env.COS_SECRET_ID && process.env.COS_SECRET_KEY),
      secretIdMasked: process.env.COS_SECRET_ID
        ? `${process.env.COS_SECRET_ID.slice(0, 6)}***${process.env.COS_SECRET_ID.slice(-4)}`
        : '',
    },
    qiniu: {
      bucket: qiniuBucket || '',
      domain: qiniuDomain || '',
      configured: isQiniuConfigured(),
    },
    local: {
      path: getLocalUploadRoot(),
      publicPath: '/uploads',
    },
  };
}

module.exports = {
  STORAGE_PROVIDERS,
  getStorageStatus,
  getStoredFileUrl,
  uploadFileToStorage,
  uploadFileToStorageFromPath,
  deleteStoredFile,
  resolveStorageProvider,
  normalizeProvider,
};
