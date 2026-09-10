// pages/api/media/[...key].js - 同源媒体代理
// 部分浏览器会对第三方存储域名的新图片/视频请求做 ORB（不透明响应拦截）或域名信誉拦截，
// 导致 <img>/<video> 首次加载直接失败。展示层统一走本站代理后请求同源，彻底规避该问题。
// 说明：媒体流量经服务器中转（不再直连 CDN），响应带 immutable 强缓存，浏览器二次查看不重复回源。
import { Readable } from 'node:stream';
import { encodeKey, domain as qiniuDomain, isConfigured } from '../../../lib/qiniu';

export const config = {
  api: {
    bodyParser: false,
    // 上传后的图片/视频体积可能较大，不限制响应大小
    responseLimit: false,
  },
};

// 允许透传给客户端的响应头（保留 Range/缓存协商能力，视频拖动进度条依赖这些）
const PASS_THROUGH_HEADERS = [
  'content-type',
  'content-length',
  'content-range',
  'accept-ranges',
  'etag',
  'last-modified',
];

function buildTarget(keySegments) {
  // req.query.key 由 Next.js 解码为原始段，这里逐段重新编码，还原成合法的七牛 key
  const safeKey = keySegments
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    })
    .map((segment) => segment.replace(/\\/g, '/'))
    .join('/');
  return `${qiniuDomain}/${encodeKey(safeKey)}`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: '方法不允许' });
  }

  if (!isConfigured()) {
    return res.status(404).json({ error: '存储未配置' });
  }

  const rawKey = req.query.key;
  const segments = Array.isArray(rawKey) ? rawKey : [rawKey];
  if (!segments.length || segments.some((s) => !s || s === '.' || s === '..')) {
    return res.status(400).json({ error: '非法路径' });
  }

  const target = buildTarget(segments);
  const controller = new AbortController();
  req.on('close', () => controller.abort());

  try {
    const upstream = await fetch(target, {
      method: req.method,
      // 透传 Range 头，保证视频拖动进度条可用
      headers: req.headers.range ? { range: req.headers.range } : undefined,
      redirect: 'follow',
      signal: controller.signal,
    });

    res.status(upstream.status);
    PASS_THROUGH_HEADERS.forEach((header) => {
      const value = upstream.headers.get(header);
      if (value) res.setHeader(header, value);
    });
    // key 全局唯一且内容不可变，可放心强缓存
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    // 同源响应存在 XSS 风险：仅允许以图片/视频身份输出，
    // 其他类型（html/svg 脚本等）强制按附件下载，避免在本站域内执行
    const contentType = (upstream.headers.get('content-type') || '').toLowerCase();
    const isMedia = contentType.startsWith('image/') || contentType.startsWith('video/');
    if (!isMedia) {
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', 'attachment');
    }

    if (req.method === 'HEAD' || !upstream.body) {
      res.end();
      return;
    }

    Readable.fromWeb(upstream.body).pipe(res);
  } catch (error) {
    if (controller.signal.aborted) return; // 客户端主动断开，无需处理
    if (!res.headersSent) {
      res.status(502).json({ error: '获取媒体文件失败' });
    } else {
      res.end();
    }
  }
}
