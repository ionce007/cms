
async function getBaiduAuthCode(req, res, next){
    try{
        var code = req.query.code;
        var client_id = process.env.PAN_APIKEY;
        var client_secret = process.env.PAN_SECRETKEY;
        var redirect_uri =  process.env.PAN_REDIRECT_URI;
        var reqUrl = `https://openapi.baidu.com/oauth/2.0/token?grant_type=authorization_code&code=${code}&client_id=${client_id}&client_secret=${client_secret}&redirect_uri=${redirect_uri}`;
        var header = {'User-Agent': 'pan.baidu.com'};  
        var ret = request("GET", reqUrl, header);
        var retJson = JSON.parse(ret.getBody('utf8'));
        var token = await AccessToken.findOne({where: { supplier: 'bdpan'  }}, { raw: true });
        var date = (new Date()).toDateString('yyyy-MM-dd HH:mm:ss.SSS');// dateFormat( new Date(),'yyyy-MM-dd HH:mm:ss.S');
          
        if(!token){
            var newToken = {supplier:'bdpan',access_token:retJson.access_token,expires_in:retJson.expires_in,refresh_token:retJson.refresh_token,
                scope:retJson.scope,remark:'百度网盘Access Token',createdAt:date,updatedAt:date};
            await AccessToken.create(newToken);
        }
        else{
            accToken = await AccessToken.update(
                {access_token: retJson.access_token, refresh_token: retJson.refresh_token, expires_in: retJson.expires_in, updatedAt: date },
                { where: {supplier:'bdpan'} }
            );
        }
        //res.redirect('/admin/#/accesstoken');
    }catch(e){
        console.log('获取授权失败！error:' + e.message);
        res.redirect('/accesstoken');
    }
}

export default {
    getBaiduAuthCode,
}