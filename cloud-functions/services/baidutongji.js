const request = require('sync-request');
const { Token } = require('../models')
const { DateAdd } = require('../common/utils');

const bdSupplier = 'baidutongji'; // 百度网盘供应商标识

async function getAuthUrl() {
    try {
        const clientId = process.env.BAIDU_TONGJI_API_KEY;

        // 生成随机 state 防止 CSRF
        const state = Math.random().toString(36).substring(2);

        // 百度统计授权 URL，scope 固定为 basic
        const authUrl = `http://openapi.baidu.com/oauth/2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=oob&scope=basic&display=popup&state=${state}`;

        return { code: 1, status: 200, data: { url: authUrl, state } };
    } catch (error) {
        console.log('services -> baidutongji error: ', error);
        return { code: -1, status: 500, message: error.message };
    }
}

async function getAuthCode(code) {
    try {
        const client_id = process.env.BAIDU_TONGJI_API_KEY;
        const client_secret = process.env.BAIDU_TONGJI_SECRET_KEY;

        var reqUrl = `http://openapi.baidu.com/oauth/2.0/token?grant_type=authorization_code&code=${code}&client_id=${client_id}&client_secret=${client_secret}&redirect_uri=oob`;//${redirect_uri}`;
        var ret = request("GET", reqUrl);
        var retJson = JSON.parse(ret.getBody('utf8'));
        console.log('baidutongji -> getAuthCode.retJson = ', retJson);
        const token = await saveAuthToken(retJson);
        return { code: 1, status: 200, msg: 'ok', data: token };
    } catch (e) {
        console.log('获取授权失败！error:' + e.message);
        return { code: 11, status: 500, msg: e.message, data: null };
    }
}
async function getAccessTokenFromDB(supplier = bdSupplier) {
    let result = { code: 1, status: 200, msg: 'success', data: {} };
    try {
        const token = await Token.findByPk(supplier);
        result.data = token;
    }
    catch (err) {
        console.log('getAccessTokenFromDB error: ', err);
        result = { code: -1, status: 500, msg: err.message, data: {} };
    }
    return result;
}

async function refreshAccessToken(refresh_token) {
    try {
        var client_id = process.env.BAIDU_TONGJI_API_KEY;
        var client_secret = process.env.BAIDU_TONGJI_SECRET_KEY;

        const url = `http://openapi.baidu.com/oauth/2.0/token?grant_type=refresh_token&refresh_token=${refresh_token}&client_id=${client_id}&client_secret=${client_secret}`;
        const ret = request('GET', url);
        const token = JSON.parse(ret.getBody('utf8'));
        return token;
    }
    catch (err) {
        console.log('refreshAccessToken error: ', err);
        return null
    }
}
async function getAccessTokenWithRefresh() {
    try {
        let token = await getAccessTokenFromDB(bdSupplier);
        if (!isExpires(token)) { return token; }
        const newToken = await refreshAccessToken(token.data.refresh_token);
        if (newToken) {
            const ret = await update(newToken);
            if (ret) token = await getAccessTokenFromDB(bdSupplier);
        }
        return token;
    }
    catch (err) {
        console.error(err);
        throw err;
    }
}
async function update(token) {
    try {
        let json = {};
        json.access_token = token.access_token;
        json.expires_in = token.expires_in;
        json.refresh_token = token.refresh_token;
        json.scope = 'basic';
        json.remark = token.session_key;
        json.spare = token.session_secret;
        const ret = await Token.update(json, { where: { supplier: bdSupplier } });
        return ret ? true : false;
    }
    catch (err) {
        console.error(err);
        return false;
    }
}
async function saveAuthToken(token) {
    try {
        const [record, created] = await Token.upsert({
            supplier: bdSupplier,
            access_token: token.access_token,
            expires_in: token.expires_in,
            refresh_token: token.refresh_token,
            scope: 'basic',
            remark: token.session_key,
            spare: token.session_secret
            // 如果 Token 模型有 createdAt/updatedAt 会自动处理
        });
        return record;
    }
    catch (err) {
        console.error(err);
        throw err;
    }
}
function isExpires(token) {
    var expireTime = DateAdd(new Date(token.data.updatedAt), 's', token.data.expires_in);
    if (Date.parse(expireTime) <= Date.parse(new Date())) return true;
    return false;
}
async function getToken() {
    try {
        const token = await getAccessTokenWithRefresh();
        return { code: 1, msg: 'ok', data: token };
    }
    catch (err) {
        console.error('services.baidutongji -> getToken error:', err);
        return { code: -1, msg: err.message, data: {} };
    }
}
async function getSiteID() {
    try {
        const token = await getToken();
        const url = `https://openapi.baidu.com/rest/2.0/tongji/config/getSiteList?access_token=${token.data.access_token}`;
        const ret = request('GET', url);
        const siteList = JSON.parse(ret.getBody('utf8'));
        if (!siteList) return { code: -2, msg: '未能获取网站列表', siteId: 0 };
        const site = siteList.list.find(x => x.domain === 'cms.foryet.com');
        if (!site) return { code: -3, msg: '未能获取目标网站', siteId: 0 };
        if (site.status !== 0) return { code: -4, msg: '目标网站已暂停使用', siteId: 0 };
        return { code: 1, msg: 'ok', siteId: site.site_id };
    }
    catch (error) {
        console.log('services -> baidutongji.getSiteID error: ', error);
        return { code: -1, msg: error.message, siteId: 0 };
    }
}
module.exports = {
    getToken,
    getAccessTokenFromDB,
    getAccessTokenWithRefresh,
    getAuthUrl,
    getAuthCode
}