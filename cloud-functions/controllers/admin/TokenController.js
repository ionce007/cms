import { Token } from '../../models/Token';
const baidupan = require('../../services/baidupan');
const baidutongji = require('../../services/baidutongji');

async function getPanAuthUrl(req, res, next) {
    const result = await baidupan.getAuthUrl();
    if (result.code === 1) return res.json(result);
    else return res.status(result.status).json(result);
}
async function getTongjiAuthUrl(req, res, next) {
    const result = await baidutongji.getAuthUrl();
    if (result.code === 1) return res.json(result);
    else return res.status(result.status).json(result);
}
// ✅ 3. 获取百度统计的 Token 信息（用于展示在授权页）
async function getPanToken(req, res) {
    const result = await baidupan.getAccessTokenFromDB();
    return res.json(result);
}
async function getTongjiToken(req, res) {
    const result = await baidutongji.getAccessTokenFromDB();
    return res.json(result);
}
async function getPanAuthCode(req, res, next) {
    //const refUrl = req.query.state || '/admin/#/formula/auth';
    const { code } = req.body;
    const result = await baidupan.getAuthCode(code);
    res.json(result);
    //return res.redirect(refUrl);
}
async function getTongjiAuthCode(req, res, next) {
    const { code } = req.body;
    const result = await baidutongji.getAuthCode(code);
    return res.json(result);
}
async function syncFromPan(req, res, next) {
    const { path = '/Formula' } = req.body;
    const result = await baidupan.syncFromPan(path);
    res.json(result);
}
module.exports = {
    getPanAuthUrl,
    getTongjiAuthUrl,
    getPanToken,
    getTongjiToken,
    getPanAuthCode,
    getTongjiAuthCode,
    syncFromPan,
}