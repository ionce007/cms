const { generateQiniuToken } = require('../../services/qiniu');

async function getQiniuToken(req, res, next) {
    try {
        const { fileName = '', fileType = '', path = 'uploads' } = req.body;
        const result = await generateQiniuToken(fileName, fileType, path);
        return res.json(result);
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

module.exports = { getQiniuToken };