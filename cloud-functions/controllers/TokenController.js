
//const bdSupplier = 'baidupan'; // 百度网盘供应商标识

//获取网盘上指定路径下的文件列表
/*async function getPanFiles(req, res, next) {
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
        console.log('error = ', error);
    }
    res.json(json);
}*/
//获取网盘访问的token，过期的token会自动刷新获取新的token
/*async function getToken(req, res, next) {
    const token = getPanToken();
    res.json(token);
}

async function getAccessToken() {
    var json = {};
    try {
        let token = await Token.findOne({ where: { supplier: 'baidupan' }, raw: true });

        if (token) { json = { code: 1, state: 'successed', msg: 'ok', data: token }; }
        else json = { code: 0, state: 'successed', msg: '没有token', data: null };
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
*/

/*async function getAccessTokenFromDB(supplier = bdSupplier) {
    let result = { code: 200, msg: 'success', data: {} };
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
async function getBDToken(req, res, next) {
    const result = await getAccessTokenFromDB(bdSupplier);
    res.json(result);
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
}*/

async function getDownloadUrl(req, res, next) {
    const fs_id = req.params.id;
    const userId = req.user ? req.user.toJSON().id : null;
    const result = getFileDownloadUrl(fs_id, userId);
    return res.status(result.status).json(result);

    /*try {
        const fs_id = req.params.id;
        if (!fs_id) {
            res.status(400).json({ code: -5, msg: '缺少参数 fs_id！', data: {} });
            return;
        }
        // ✅ 必须登录
        const userId = req.user ? req.user.toJSON().id : null;
        if (!userId) {
            return res.status(401).json({ code: 401, message: '请先登录', });
        }
        const token = await getAccessTokenWithRefresh();
        if (token.code !== 200) {
            res.status(500).json({ code: -1, msg: '获取百度网盘Token失败！', data: {} });
            return;
        }
        if (!token.data) {
            res.status(500).json({ code: -2, msg: '百度网盘Token不存在！', data: {} });
            return;
        }
        const access_token = token.data.access_token;
        if (!access_token) {
            res.status(500).json({ code: -3, msg: '百度网盘Access Token不存在！', data: {} });
            return;
        }
        if (isExpires(token)) {
            res.status(500).json({ code: -4, msg: '百度网盘Access Token已过期！', data: {} });
            return;
        }

        const file = await Formula.findByPk(fs_id, { raw: true });
        if (!file) {
            res.status(404).json({ code: -6, msg: '未找到对应的文件信息！', data: {} });
            return;
        }
        if (file.isdir) {
            res.status(400).json({ code: -8, msg: '该文件是目录，无法获取文件信息！', data: {} });
            return;
        }
        if (!file.path) {
            res.status(500).json({ code: -7, msg: '文件路径不存在！', data: {} });
            return;
        }
        const path = encodeURIComponent(file.path);
        const url = `https://pan.baidu.com/rest/2.0/xpan/multimedia?method=filemetas&access_token=${access_token}&fsids=[${fs_id}]&dlink=1`;
        const header = { 'Host': 'pan.baidu.com' };
        const options = { headers: header };
        const ret = request("GET", url, options);
        const pan_res = JSON.parse(ret.getBody('utf8'));
        if (!pan_res || !pan_res.list || pan_res.list.length === 0) {
            res.status(404).json({ code: -9, msg: '未获取到文件信息！', data: {} });
            return;
        }
        const fileInfo = pan_res.list[0];
        if (!fileInfo.dlink) {
            res.status(500).json({ code: -10, msg: '未获取到文件下载链接！', data: {} });
            return;
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
        if (body && body.statusCode === 200) result = { code: 1, state: 'successed', msg: '获取文件成功！', url: body.url };
        else result = { code: -11, state: 'failed', msg: '获取文件失败（未知原因）！', url: '' };
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ code: -1, msg: err.message, data: {} });
    }*/
}

module.exports = {
    //getPanFiles,
    //getBDToken,
    //getToken,
    //getPanAuthUrl,
    //getPanAuthCode,
    //getTongjiAuthCode,
    getDownloadUrl
}