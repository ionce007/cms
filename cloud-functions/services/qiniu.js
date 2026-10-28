const { Config } = require('../models');
const qiniu = require('qiniu');
const crypto = require('crypto');
import { defaultQiniuParams } from '../common/constant'
const { ALLOWED_IMAGE_TYPES } = require('../../config/constants')

async function getQiniuParams() {
    let result = {}
    try {
        const attributes = ['accessKey', 'secretKey', 'domain', 'bucket'];
        result = await Config.findOne({ attributes, raw: true });
        if (!result) result = defaultQiniuParams
    }
    catch (error) {
        console.error('getQiniuParams -> error: ', error);
        result = defaultQiniuParams;
    }
    finally {
        return result;
    }
}

async function generateQiniuToken(fileName = '', fileType = '', path = 'uploads') {
    try {
        const config = await getQiniuParams();
        // ✅ 初始化七牛鉴权对象
        const mac = new qiniu.auth.digest.Mac(config.accessKey, config.secretKey);
        const BUCKET = config.bucket;
        const DOMAIN = config.domain;
        // ✅ 文件类型白名单
        //const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (fileType && !ALLOWED_IMAGE_TYPES.includes(fileType)) {
            return { code: -1, message: '只支持 jpg、png、gif、webp、bmp 和 svg 格式', }
        }

        // ✅ 生成唯一文件名：comments/年/月/随机名.扩展名
        const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg';
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = crypto.randomBytes(8).toString('hex');

        // ✅ 存储路径
        const key = `${path}/${year}/${month}/${random}.${ext}`;

        // ✅ 上传策略
        const putPolicy = new qiniu.rs.PutPolicy({
            scope: `${BUCKET}:${key}`,   // 指定上传路径
            expires: 3600,                // Token 有效期 1 小时
            returnBody: JSON.stringify({
                key: '$(key)',
                hash: '$(etag)',
                size: '$(fsize)',
                url: `http://${DOMAIN}/$(key)`,
            }),
        });

        const uploadToken = putPolicy.uploadToken(mac);
        const result = { code: 1, message: 'success', data: { token: uploadToken, key, domain: DOMAIN, uploadUrl: 'https://upload.qiniup.com', } };
        return result
    } catch (error) {
        console.error('getQiniuToken error:', error);
        return { code: -1, message: error.message };
    }
}

module.exports = { getQiniuParams, generateQiniuToken };