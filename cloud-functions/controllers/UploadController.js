// controllers/uploadController.js
//import sequelize from '../common/db';  // 导入 sequelize 实例

const { generateQiniuToken } = require('../services/qiniu');

/**
 * 生成七牛上传 Token
 * POST /api/upload/qiniu-token
 * 
 * Body: { fileName: string, fileType: string }
 */
async function getQiniuToken(req, res) {
    try {
        const { fileName = '', fileType = '', path = 'uploads' } = req.body;
        const result = await generateQiniuToken(fileName, fileType, path);
        console.log('getQiniuToken -> result = ', result)
        return res.json(result);

        /*const config = await getQiniuParams();
        // ✅ 初始化七牛鉴权对象
        const mac = new qiniu.auth.digest.Mac(config.accessKey, config.secretKey);
        const BUCKET = config.bucket;
        const DOMAIN = config.domain;
        // ✅ 文件类型白名单
        //const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (fileType && !ALLOWED_IMAGE_TYPES.includes(fileType)) {
            return res.json({ code: -1, message: '只支持 jpg、png、gif、webp 格式', });
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

        res.json({
            code: 1,
            message: 'success',
            data: {
                token: uploadToken,
                key,
                domain: DOMAIN,
                uploadUrl: 'https://upload.qiniup.com',  // 上传地址
            },
        });*/
    } catch (error) {
        console.error('getQiniuToken error:', error);
        res.json({ code: -1, message: error.message });
    }
}

module.exports = { getQiniuToken };