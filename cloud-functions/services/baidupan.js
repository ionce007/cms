// controllers/admin/FormulaController.js
const { Op } = require('sequelize');
const request = require('sync-request');
const { Token, Formula } = require('../models')
const { DateAdd, dateFormat } = require('../common/utils');

const bdSupplier = 'baidupan';

async function getAccessTokenFromDB(supplier = bdSupplier) {
    let result = { code: 1, msg: 'success', data: {} };
    try {
        const token = await Token.findByPk(supplier);
        result.data = token;
    }
    catch (err) {
        console.log('getAccessTokenFromDB error: ', err);
        result = { code: -1, msg: err.message, data: {} };
    }
    return result;
}

async function getAuthUrl() {
    var json = {};
    try {
        var code = 'code'
        const state = Math.random().toString(36).substring(2);
        var client_id = process.env.PAN_APIKEY
        var redirect_uri = 'oob';  // process.env.PAN_REDIRECT_URI;
        var scope = 'basic,netdisk';
        var device_id = process.env.PAN_APPID;
        var display = process.env.PAN_AUTH_DISPLAY;
        const codeUrl = `https://openapi.baidu.com/oauth/2.0/authorize?response_type=${code}&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}&device_id=${device_id}&state=bdauth_code&display=${display}&force_login=1&state=${state}`;//${refUrl}`;
        var header = {};  //  {'Host':'d.pcs.baidu.com'};
        var body = request("GET", codeUrl, header);
        json = { code: 1, status: 200, msg: 'ok', url: body.url };
        return json;
    }
    catch (e) {
        json = { code: -1, status: 500, msg: e.message, url: '' };
        return json;
    }
}
async function refreshAccessToken(refresh_token) {
    try {
        var appKey = process.env.PAN_APIKEY;
        var secretKey = process.env.PAN_SECRETKEY;

        const url = `https://openapi.baidu.com/oauth/2.0/token?grant_type=refresh_token&refresh_token=${refresh_token}&client_id=${appKey}&client_secret=${secretKey}`;
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
        json.updatedAt = dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');
        json.access_token = token.access_token;
        json.refresh_token = token.refresh_token;
        json.expires_in = token.expires_in;
        const ret = await Token.update(json, { where: { supplier: bdSupplier } });
        return ret ? true : false;
    }
    catch (err) {
        console.error(err);
        return false;
    }
}
async function getToken() {
    try {
        const token = await getAccessTokenWithRefresh();
        return token;
        //res.json(token);
    }
    catch (err) {
        console.error('services.baidupan -> getPanToken error:', err);
        return { code: -1, msg: err.message, data: {} };
    }
}
//访问百度网盘平台更新access_token
/*function refresh_access_token(refresh_token) {
    var json = {}
    try {
        var appKey = process.env.PAN_APIKEY;
        var secretKey = process.env.PAN_SECRETKEY;

        var url = `https://openapi.baidu.com/oauth/2.0/token?grant_type=refresh_token&refresh_token=${refresh_token}&client_id=${appKey}&client_secret=${secretKey}`;
        var ret = request('GET', url);
        json = { code: 1, state: 'successed', msg: '刷新 token 成功！', data: JSON.parse(ret.getBody('utf8')) };
        return json;
    }
    catch (e) {
        json = { code: -1, state: 'failed', msg: e.message, data: null };
        return json;
    }
}*/
async function getAuthCode(code) {
    //const refUrl = req.query.state || '/admin/#/formula/auth';
    try {
        //var code = req.query.code;
        var client_id = process.env.PAN_APIKEY;
        var client_secret = process.env.PAN_SECRETKEY;
        var redirect_uri = 'oob';  //process.env.PAN_REDIRECT_URI;

        var reqUrl = `https://openapi.baidu.com/oauth/2.0/token?grant_type=authorization_code&code=${code}&client_id=${client_id}&client_secret=${client_secret}&redirect_uri=${redirect_uri}`;
        var header = { 'User-Agent': 'pan.baidu.com' };
        var ret = request("GET", reqUrl, header);
        var retJson = JSON.parse(ret.getBody('utf8'));
        if (retJson.error) {
            return { code: -2, msg: retJson.error_description || '获取Token失败', data: null };
        }

        const token = await saveAuthToken(retJson);
        return { code: 1, message: '授权成功', data: token }
        return token;
        //res.redirect(refUrl);
    } catch (e) {
        console.log('获取授权失败！error:' + e.message);
        return { code: -1, msg: e.message, data: null }
        //res.redirect(refUrl);
    }
}
async function saveAuthToken(token) {
    try {
        /*await Token.destroy({ where: { supplier: 'baidupan' } });

        const date = dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');
        token.supplier = 'baidupan';
        token.remark = '百度网盘Access Token'
        token.updatedAt = date;
        token.createdAt = date;
        const newToken = await Token.create(token);
        return newToken.dataValues;*/
        const [record, created] = await Token.upsert({
            supplier: bdSupplier,
            access_token: token.access_token,
            expires_in: token.expires_in,
            refresh_token: token.refresh_token,
            scope: 'basic netdisk',
            remark: '百度网盘Access Token',
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
async function getFileDownloadUrl(fs_id, userId = null) {
    try {
        if (!fs_id) {
            return { code: -2, status: 400, msg: '缺少参数 fs_id！', data: {} }
        }
        // ✅ 必须登录
        if (!userId) {
            return { code: -3, status: 401, message: '请先登录', }
        }
        const token = await getAccessTokenWithRefresh();
        if (token.code !== 200) {
            return { code: -4, status: 500, msg: '获取百度网盘Token失败！', data: {} };
        }
        if (!token.data) {
            return { code: -5, status: 500, msg: '百度网盘Token不存在！', data: {} };
        }
        const access_token = token.data.access_token;
        if (!access_token) {
            return { code: -6, status: 500, msg: '百度网盘Access Token不存在！', data: {} };
        }
        if (isExpires(token)) {
            return { code: -7, status: 500, msg: '百度网盘Access Token已过期！', data: {} };
        }

        const file = await Formula.findByPk(fs_id, { raw: true });
        if (!file) {
            return { code: -8, status: 404, msg: '未找到对应的文件信息！', data: {} };
        }
        if (file.isdir) {
            return { code: -8, status: 400, msg: '该文件是目录，无法获取文件信息！', data: {} };
        }
        if (!file.path) {
            return { code: -9, status: 500, msg: '文件路径不存在！', data: {} };
        }
        const path = encodeURIComponent(file.path);
        const url = `https://pan.baidu.com/rest/2.0/xpan/multimedia?method=filemetas&access_token=${access_token}&fsids=[${fs_id}]&dlink=1`;
        const header = { 'Host': 'pan.baidu.com' };
        const options = { headers: header };
        const ret = request("GET", url, options);
        const pan_res = JSON.parse(ret.getBody('utf8'));
        if (!pan_res || !pan_res.list || pan_res.list.length === 0) {
            return { code: -10, status: 500, msg: '未获取到文件信息！', data: {} };
        }
        const fileInfo = pan_res.list[0];
        if (!fileInfo.dlink) {
            return { code: -11, status: 500, msg: '未获取到文件下载链接！', data: {} };
        }
        const fileUrl = `${fileInfo.dlink}&access_token=${access_token}`;// fileInfo.dlink + "&access_token={0}".format(access_token);

        // ✅ 记录下载历史
        const [record, created] = await MemberDownload.findOrCreate({
            where: {
                memberId: userId,
                targetType: 'formula',
                targetId: fs_id,
            },
            defaults: {
                memberId: userId,
                targetType: 'formula',
                targetId: fs_id,
                downloadCount: 1,
                lastDownloadAt: new Date(),
            },
        });

        if (!created) {
            await record.update({
                downloadCount: record.downloadCount + 1,
                lastDownloadAt: new Date(),
            });
        }
        let result = {};
        const body = request("GET", fileUrl, header);
        if (body && body.statusCode === 200) result = { code: 1, status: 200, msg: '获取文件成功！', url: body.url };
        else result = { code: -12, status: 500, msg: '获取文件失败（未知原因）！', url: '' };
        return result;
    }
    catch (err) {
        console.error(err);
        return { code: -1, status: 500, msg: err.message, data: {} }
    }
}

function getKind(path) {
    var arr = path.split('/');
    return arr[2];
}

// ✅ 全局变量记录同步状态
let isSyncing = false;

// ✅ 同步网盘数据到数据库
async function syncFromPan(path = "/Formula") {
    // ✅ 如果在同步中，直接拒绝
    if (isSyncing) {
        return res.json({ code: -1, message: '正在同步中，请勿重复操作' });
    }
    isSyncing = true; // 上锁
    var json = { code: 1, msg: '网盘文件同步成功！', data: null }
    try {
        var token = await getToken(); //await getAccessToken();
        var access_token = token.data.access_token;
        var path = encodeURIComponent(path);
        var url = `https://pan.baidu.com/rest/2.0/xpan/multimedia?method=listall&access_token=${access_token}&path=${path}&recursion=1`
        var header = { 'Host': 'pan.baidu.com' };  //, 'Cookie': cookie };
        var options = { headers: header };
        var ret = request("GET", url, options);
        var pan_res = JSON.parse(ret.getBody('utf8'));

        const formulas = await Formula.findAll();// await knex('cms_formula').select('*');
        var dbNo = pan_res.list.filter(item => !formulas.some(dbItem => dbItem.fs_id == item.fs_id));
        var date = new Date();// dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS');
        dbNo.forEach((node) => {
            node.price = 0, node.isSell = 0, node.xhsUrl = '', node.kind = getKind(node.path),
                node.img = '', node.summary = '', node.content = '', node.views = 0, node.likes = 0,
                node.status = 0, node.createtime = date, node.lastupdate = date
        });
        if (dbNo && dbNo.length > 0) {//网盘存在，数据库不存在的数据，批量插入数据库
            await Formula.bulkCreate(dbNo);
        }

        var panNo = formulas.filter(item => item.isSell == 1 && !pan_res.list.some(pItem => pItem.fs_id == item.fs_id));
        if (panNo && panNo.length > 0) { //数据库存在，网盘不存在的数据，批量修改其在售标志
            //var valueArr = panNo.map(function (item) { return { fs_id: item.fs_id, isSell: 0, lastupdate: date } });
            const fsIdList = panNo.map(item => item.fs_id);
            await Formula.update(
                { status: 0, /*isSell: 0,*/ lastupdate: date },   // 要修改的字段和值
                {
                    where: { fs_id: { [Op.in]: fsIdList } },      // 批量匹配条件
                    fields: ['status', 'isSell', 'lastupdate'], // ✅ 强制指定只更新这两个字段
                    validate: false         // 可选：是否验证数据
                }
            );
        }
        json = {
            code: 1,
            msg: '同步完成',
            data: {
                inserted: dbNo ? dbNo.length : 0,
                updated: panNo ? panNo.length : 0,
                panNo,
                dbNo
            }
        }
        //json.data = { dbNo: dbNo, panNo: panNo };
    }
    catch (e) {
        json.code = -1;
        json.msg = e.message;
        json.data = null;
        console.log('error = ' + e.message);
    } finally {
        isSyncing = false; // ✅ 无论成功失败，释放锁
    }
    return json;
}

module.exports = {
    getAuthUrl,
    getAccessTokenFromDB,
    getToken,
    getAuthCode,
    getFileDownloadUrl,
    syncFromPan
}