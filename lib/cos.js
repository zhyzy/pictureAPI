// 腾讯云 COS 配置
const COS = require('cos-nodejs-sdk-v5');

const cos = new COS({
  SecretId: process.env.COS_SECRET_ID,
  SecretKey: process.env.COS_SECRET_KEY,
});

const bucket = process.env.COS_BUCKET;
const region = process.env.COS_REGION;
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

async function uploadFile(file, key) {
  const params = {
    Bucket: bucket,
    Region: region,
    Key: key,
    Body: file,
  };
  
  return new Promise((resolve, reject) => {
    cos.putObject(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          url: `${baseUrl}/${key}`,
          cosKey: key,
        });
      }
    });
  });
}

async function deleteFile(key) {
  const params = {
    Bucket: bucket,
    Region: region,
    Key: key,
  };
  
  return new Promise((resolve, reject) => {
    cos.deleteObject(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

async function getFileUrl(key, expires = 3600) {
  const params = {
    Bucket: bucket,
    Region: region,
    Key: key,
    Sign: true,
    Expires: expires,
  };
  
  return new Promise((resolve, reject) => {
    cos.getObjectUrl(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Url);
      }
    });
  });
}

module.exports = { cos, uploadFile, deleteFile, getFileUrl, bucket, region };
