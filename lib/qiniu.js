// 七牛云 Kodo 配置（环境变量见 README）
const qiniu = require('qiniu');

const accessKey = process.env.QINIU_ACCESS_KEY;
const secretKey = process.env.QINIU_SECRET_KEY;
const bucket = process.env.QINIU_BUCKET;
// 外链域名，如 https://cdn.example.com；未带协议时自动补 https://
function normalizeDomain(raw) {
  const trimmed = (raw || '').trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  return /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
}
const domain = normalizeDomain(process.env.QINIU_DOMAIN);

function isConfigured() {
  return Boolean(accessKey && secretKey && bucket && domain);
}

function getMac() {
  return new qiniu.auth.digest.Mac(accessKey, secretKey);
}

function encodeKey(key) {
  // key 按路径段编码，保证中文/空格文件名可访问
  return key.split('/').map(encodeURIComponent).join('/');
}

async function uploadFile(file, key) {
  if (!isConfigured()) {
    throw new Error('七牛云未配置，请在环境变量中设置 QINIU_ACCESS_KEY / QINIU_SECRET_KEY / QINIU_BUCKET / QINIU_DOMAIN');
  }

  const putPolicy = new qiniu.rs.PutPolicy({ scope: `${bucket}:${key}` });
  const uploadToken = putPolicy.uploadToken(getMac());

  const putExtra = new qiniu.form_up.PutExtra();
  const config = new qiniu.conf.Config();
  const formUploader = new qiniu.form_up.FormUploader(config);
  return new Promise((resolve, reject) => {
    formUploader.put(uploadToken, key, file, putExtra, (err, _body) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          url: `${domain}/${encodeKey(key)}`,
          key,
        });
      }
    });
  });
}

// 从本地文件路径流式上传（大文件不占内存）
async function uploadFileFromPath(filePath, key) {
  if (!isConfigured()) {
    throw new Error('七牛云未配置，请在环境变量中设置 QINIU_ACCESS_KEY / QINIU_SECRET_KEY / QINIU_BUCKET / QINIU_DOMAIN');
  }

  const putPolicy = new qiniu.rs.PutPolicy({ scope: `${bucket}:${key}` });
  const uploadToken = putPolicy.uploadToken(getMac());

  const putExtra = new qiniu.form_up.PutExtra();
  const config = new qiniu.conf.Config();
  const formUploader = new qiniu.form_up.FormUploader(config);
  return new Promise((resolve, reject) => {
    formUploader.putFile(uploadToken, key, filePath, putExtra, (err, _body) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          url: `${domain}/${encodeKey(key)}`,
          key,
        });
      }
    });
  });
}

async function deleteFile(key) {
  if (!isConfigured()) {
    throw new Error('七牛云未配置，无法删除文件');
  }

  const config = new qiniu.conf.Config();
  const bucketManager = new qiniu.rs.BucketManager(getMac(), config);
  return new Promise((resolve, reject) => {
    bucketManager.delete(bucket, key, (err, body) => {
      if (err) {
        reject(err);
      } else {
        resolve(body);
      }
    });
  });
}

function getFileUrl(key) {
  if (!isConfigured()) {
    throw new Error('七牛云未配置，无法生成文件地址');
  }
  // 公开空间直接用外链域名；私有空间需要签名下载 URL，如需要再扩展
  return `${domain}/${encodeKey(key)}`;
}

// 同源代理路径：部分浏览器会对第三方存储域名的新图片请求做 ORB/信誉拦截，
// 让展示层统一走本站 /api/media 代理，彻底规避跨域加载失败
function getProxiedFileUrl(key) {
  return `/api/media/${encodeKey(key)}`;
}

// 将本桶外链 URL 重写为同源代理路径（用于设置项里的背景图/Logo 等）；非本桶 URL 原样返回
function rewriteToProxyUrl(url) {
  const value = String(url || '').trim();
  if (!value || !domain) return url;
  const prefix = `${domain}/`;
  if (!value.startsWith(prefix)) return url;
  try {
    const key = value
      .slice(prefix.length)
      .split('/')
      .map((segment) => {
        try {
          return decodeURIComponent(segment);
        } catch {
          return segment;
        }
      })
      .join('/');
    return getProxiedFileUrl(key);
  } catch {
    return url;
  }
}

module.exports = { qiniu, uploadFile, uploadFileFromPath, deleteFile, getFileUrl, getProxiedFileUrl, rewriteToProxyUrl, encodeKey, isConfigured, bucket, domain };
