import sequelize from '../common/db';  // 导入 sequelize 实例
import { DateAdd, dateFormat } from '../common/utils'
const { Formula, Token } = require('../models');
const { Op } = require('sequelize');
const request = require('sync-request');


//获取网盘上指定路径下的文件列表
async function getPanFiles(req, res, next) {
    var json = { status: true, msg: '获取网盘文件列表成功！', data: null }
    try {
        var token = await getAccessToken();
        var access_token = token.data.access_token;
        if (token && isExpires(token)) {
            token = refresh_access_token(token.data.refresh_token);
            access_token = token.data.access_token;
        }
        var path = encodeURIComponent("/Formula");
        var url = `https://pan.baidu.com/rest/2.0/xpan/multimedia?method=listall&access_token=${access_token}&path=${path}&recursion=1`
        //var header = { 'Host': 'pan.baidu.com', 'Cookie': cookie };
        var header = { 'Host': 'pan.baidu.com' };
        var options = { headers: header };
        var ret = request("GET", url, options);
        var pan_res = JSON.parse(ret.getBody('utf8'));
        json.data = pan_res.list;
    }
    catch (error) {
        json.status = false;
        json.msg = error.message;
        console.log('error = ' + error);
    }
    res.json(json);
}
//访问百度网盘平台更新access_token
function refresh_access_token(refresh_token) {
    var json = {}
    try {
        var appKey = process.env.PAN_APIKEY;
        var secretKey = process.env.PAN_SECRETKEY;

        var url = "https://openapi.baidu.com/oauth/2.0/token?grant_type=refresh_token&refresh_token={0}&client_id={1}&client_secret={2}".format(refresh_token, appKey, secretKey);
        var ret = request('GET', url);
        json = { code: 1, state: 'successed', msg: '刷新 token 成功！', data: JSON.parse(ret.getBody('utf8')) };
        return json;
    }
    catch (e) {
        json = { code: -1, state: 'failed', msg: e.message, data: null };
        return json;
    }
}
async function panSynchronize(req, res, next) {
    var json = { status: true, msg: '网盘文件同步成功！', data: null }
    try {
        /*var token = await getAccessToken();
        var access_token = token.data.access_token;
        if (token && isExpires(token)) { token = refresh_access_token(token.refresh_access_token); access_token = token.data.access_token; }
        var path = encodeURIComponent("/Formula");
        var url = `https://pan.baidu.com/rest/2.0/xpan/multimedia?method=listall&access_token=${access_token}&path=${path}&recursion=1`
        //var header = { 'Host': 'pan.baidu.com', 'Cookie': cookie };
        var header = { 'Host': 'pan.baidu.com' };
        var options = { headers: header };
        var ret = request("GET", url, options);
        var pan_res = JSON.parse(ret.getBody('utf8'));

        var formulas = await Formula.findAll();
        var dbNo = pan_res.list.filter(item => !formulas.some(dbItem => dbItem.fs_id == item.fs_id));
        var date = (new Date()).toDateString('yyyy-MM-dd HH:mm:ss.SSS')
        dbNo.forEach((node) => { node.price = 0, node.isSell = 0, node.xhsUrl = '', node.kind = getKind(node.path), node.createtime = date, node.lastupdate = date });
        json.data = dbNo;// pan_res.list;
        if (dbNo && dbNo.length > 0) Formula.bulkCreate(dbNo);//网盘存在，数据库不存在的数据，批量插入数据库

        var panNo = formulas.filter(item => item.isSell == 1 && !pan_res.list.some(pItem => pItem.fs_id == item.fs_id));
        if (panNo && panNo.length > 0) { //数据库存在，网盘不存在的数据，批量修改其在售标志
            var valueArr = panNo.map(function (item) { return { fs_id: item.fs_id, isSell: 0, lastupdate: date } });
            Formula.bulkCreate(valueArr, { updateOnDuplicate: ['isSell', 'lastupdate'] });
        }*/
    }
    catch (e) {
        json.status = false;
        json.msg = e.message;
        console.log('error = ' + e.message);
    }
    res.json(json);
}
async function getAccessToken() {
    var json = {};
    try {
        let token = await Token.findOne({ where: { supplier: 'baidupan' }, raw: true });

        if (token) { json = { code: 1, state: 'success', msg: 'ok', data: token }; }
        else json = { code: 0, state: 'failed', msg: '没有token', data: null };
        return json;
    } catch (e) {
        json = { code: -1, state: 'failed', msg: e.message, data: null };
        return json;
    }
}
function isExpires(token) {
    var expireTime = DateAdd(new Date(token.data.updatedAt), 's', token.data.expires_in);
    if (Date.parse(expireTime) <= Date.parse(new Date())) return true;
    return false;
}
String.prototype.format = function () {
    if (arguments.length == 0) {
        return this;
    }
    for (var s = this, i = 0; i < arguments.length; i++) {
        s = s.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
    }
    return s;
};
async function createAuthToken(token) {
    try {
        await Token.destroy({ where: { supplier: 'baidupan' } });

        const date = dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');
        token.supplier = 'baidupan';
        token.remark = '百度网盘Access Token'
        token.updatedAt = date;
        token.createdAt = date;
        console.log('token = ', token)
        const newToken = await Token.create(token);
        console.log('newToken = ', newToken)
        return newToken;

    }
    catch (err) {
        console.error(err);
        throw err;
    }

}
async function getBaiduAuthCode(req, res, next) {
    try {
        var code = req.query.code;
        var client_id = process.env.PAN_APIKEY;
        var client_secret = process.env.PAN_SECRETKEY;
        var redirect_uri = process.env.PAN_REDIRECT_URI;
        console.log('client_id = ', client_id, '    client_secret = ', client_secret, '   redirect_uri = ', redirect_uri);

        var reqUrl = `https://openapi.baidu.com/oauth/2.0/token?grant_type=authorization_code&code=${code}&client_id=${client_id}&client_secret=${client_secret}&redirect_uri=${redirect_uri}`;
        var header = { 'User-Agent': 'pan.baidu.com' };
        var ret = request("GET", reqUrl, header);
        var retJson = JSON.parse(ret.getBody('utf8'));
        console.log('retJson = ', retJson)
        const token = await createAuthToken(retJson);
        console.log('token = ', token)
        //var token = await Token.findOne({ where: { supplier: 'baidupan' } }, { raw: true });

        res.redirect('/admin/#/formula/auth');
    } catch (e) {
        console.log('获取授权失败！error:' + e.message);
        res.redirect('/admin/#/formula/auth');
    }
}

module.exports = {
    getPanFiles,
    panSynchronize,
    getBaiduAuthCode
}