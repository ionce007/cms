const { Article, Comment, Member, Formula, VisitLog, MemberLike, MemberBookmark, Token } = require('../../models');
const { Op, fn, col, literal } = require('sequelize');

async function stats(req, res, next) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalArticles, totalFormulas, totalMembers, totalComments, totalLikes, totalBookmarks,
            todayVisits
        ] = await Promise.all([
            Article.count(),
            Formula.count(),
            Member.count(),
            Comment.count(),
            MemberLike.count(),
            MemberBookmark.count(),
            VisitLog.count({ where: { createdAt: { [Op.gte]: today } } })
        ]);

        res.json({
            code: 1,
            data: {
                totalArticles, totalFormulas, totalMembers, totalComments, totalLikes, totalBookmarks, todayVisits
            }
        });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

async function visitTrend(req, res, next) {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // 使用原生 SQL 按天分组统计
        const trend = await VisitLog.findAll({
            attributes: [
                [fn('DATE', col('createdAt')), 'date'],
                [fn('COUNT', col('id')), 'count']
            ],
            where: {
                createdAt: { [Op.gte]: sevenDaysAgo }
            },
            group: [fn('DATE', col('createdAt'))],
            order: [[literal('date'), 'ASC']],
            raw: true
        });

        res.json({ code: 1, data: trend });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

// ✅ 辅助函数：通过域名自动获取 site_id
async function getSiteIdByDomain(accessToken, domain) {
    const url = `https://openapi.baidu.com/rest/2.0/tongji/config/getSiteList?access_token=${accessToken}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error_code) {
        throw new Error(data.error_msg || '获取站点列表失败');
    }

    const sites = data.list || [];

    // 遍历站点列表，模糊匹配域名
    const matchedSite = sites.find(site =>
        site.domain && site.domain.toLowerCase().includes(domain.toLowerCase())
    );

    if (!matchedSite) {
        throw new Error(`未找到域名为 ${domain} 的站点，请检查百度统计后台是否已添加该网站`);
    }

    return matchedSite.site_id;
}

async function getBaiduPvTrend(req, res) {
    try {
        const supplier = 'baidutongji'
        // 1. 获取 Token
        const tokenRecord = await Token.findByPk(supplier);//Token.findOne({ where: { supplier: 'baidu_tongji' } });
        if (!tokenRecord || !tokenRecord.access_token) {
            return res.json({ code: -1, message: '未授权百度统计' });
        }

        // 2. 自动获取 site_id（这里以 supercms.onrender.com 为例）
        const targetDomain = process.env.SITE_DOMAIN || 'supercms.onrender.com';
        let siteId;
        try {
            siteId = await getSiteIdByDomain(tokenRecord.access_token, targetDomain);
        } catch (err) {
            return res.json({ code: -1, message: err.message });
        }

        // 3. 计算最近30天日期
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 29);

        const formatDate = (d) => {
            const pad = (n) => n.toString().padStart(2, '0');
            return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
        };

        // 4. 调用趋势接口
        const params = new URLSearchParams({
            access_token: tokenRecord.access_token,
            site_id: siteId, // ✅ 使用动态获取的 siteId
            method: 'trend/time/a',
            start_date: formatDate(startDate),
            end_date: formatDate(endDate),
            metrics: 'pv_count',
            gran: 'day',
            max_results: '0',
        });

        const response = await fetch(`https://openapi.baidu.com/rest/2.0/tongji/report/getData?${params.toString()}`);
        const data = await response.json();

        if (data.error_code) {
            return res.json({ code: -1, message: data.error_msg || '获取趋势数据失败' });
        }

        // 5. 解析并返回数据
        const items = data.result?.items || [];
        const dates = items[0] || [];
        const pvCounts = items[1] || [];

        const trend = dates.map((date, index) => ({
            date: date,
            count: parseInt(pvCounts[index] || 0),
        }));

        res.json({ code: 1, data: trend });
    } catch (error) {
        console.error('获取百度统计PV趋势失败:', error);
        res.status(500).json({ code: -1, message: '服务器内部错误' });
    }
}

module.exports = {
    stats,
    visitTrend,
    getBaiduPvTrend,
}