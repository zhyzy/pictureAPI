const fs = require('fs');
const path = require('path');
const { uploadFile: uploadCosFile, deleteFile: deleteCosFile, getFileUrl: getCosFileUrl, bucket, region } = require('./cos');

const STORAGE_PROVIDERS = {
  cos: '腾讯云 COS',
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

async function uploadLocalFile(file, key) {
  const safeKey = key.replace(/^\/+/, '').replace(/\\/g, '/');
  const absolutePath = path.join(getLocalUploadRoot(), safeKey);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, file);

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

  if (provider === 'other') {
    throw new Error('其他存储暂未配置，请先切换为腾讯云 COS 或本地存储');
  }

  const result = await uploadCosFile(file, key);
  return { url: result.url, storageKey: result.cosKey, provider: 'cos' };
}

async function deleteStoredFile(image) {
  const provider = normalizeProvider(image.storage_provider || (image.cos_key ? 'cos' : 'local'));

  if (!image.cos_key) return;

  if (provider === 'local') {
    const absolutePath = path.join(getLocalUploadRoot(), image.cos_key.replace(/^\/+/, ''));
    if (absolutePath.startsWith(getLocalUploadRoot()) && fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
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
  deleteStoredFile,
  resolveStorageProvider,
  normalizeProvider,
};
