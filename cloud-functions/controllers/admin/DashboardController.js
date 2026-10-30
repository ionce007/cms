const { Article, Comment, Category, Member, Formula, VisitLog, MemberLike, MemberBookmark, Token } = require('../../models');
const { Op, fn, col, literal } = require('sequelize');
const { getAccessTokenWithRefresh } = require('../../services/baidutongji')

async function stats(req, res, next) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 并行执行所有统计查询
        const [
            totalArticles, totalFormulas, totalMembers, totalComments, todayVisits,
            articleStats, formulaStats
        ] = await Promise.all([
            // 基础总数
            Article.count(),
            Formula.count(),
            Member.count(),
            Comment.count(),
            VisitLog.count({ where: { createdAt: { [Op.gte]: today } } }),

            // ✅ 文章的浏览、点赞、收藏统计
            Article.findOne({
                attributes: [
                    [fn('SUM', col('pv')), 'totalViews'],
                    [fn('SUM', col('likes')), 'totalLikes'],
                    [fn('SUM', col('marked')), 'totalBookmarks']
                ],
                raw: true
            }),

            // ✅ 公式的浏览、点赞、收藏、下载统计
            Formula.findOne({
                attributes: [
                    [fn('SUM', col('views')), 'totalViews'],
                    [fn('SUM', col('likes')), 'totalLikes'],
                    [fn('SUM', col('marked')), 'totalBookmarks'],
                    [fn('SUM', col('downloads')), 'totalDownloads']
                ],
                raw: true
            })
        ]);

        res.json({
            code: 1,
            data: {
                totalArticles,
                totalFormulas,
                totalMembers,
                totalComments,
                todayVisits,
                articleStats: {
                    views: parseInt(articleStats?.totalViews || 0),
                    likes: parseInt(articleStats?.totalLikes || 0),
                    bookmarks: parseInt(articleStats?.totalBookmarks || 0)
                },
                formulaStats: {
                    views: parseInt(formulaStats?.totalViews || 0),
                    likes: parseInt(formulaStats?.totalLikes || 0),
                    bookmarks: parseInt(formulaStats?.totalBookmarks || 0),
                    downloads: parseInt(formulaStats?.totalDownloads || 0)
                }
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
        // ... 前面的获取 Token 和计算日期逻辑保持不变
        const tokenRecord = await getAccessTokenWithRefresh();// Token.findOne({ where: { supplier: 'baidu_tongji' } });
        if (!tokenRecord || tokenRecord.code !== 1 || !tokenRecord.data.access_token) {
            return res.json({ code: -1, message: '未授权百度统计' });
        }
        const access_token = tokenRecord.data.access_token;
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 29);

        const formatDate = (d) => {
            const pad = (n) => n.toString().padStart(2, '0');
            return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
        };

        const params = new URLSearchParams({
            access_token: access_token,
            site_id: await getSiteIdByDomain(access_token, process.env.SITE_DOMAIN || 'supercms.onrender.com'),
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

        const items = data.result?.items || [];
        const dates = items[0] || [];
        const pvCounts = items[1] || [];

        // ✅ 1. 组装趋势数据
        let trend = dates.map((date, index) => ({
            date: date,
            count: parseInt(pvCounts[index] || 0),
        }));

        // ✅ 2. 核心修复：百度统计 API 默认返回倒序（今天到30天前），我们需要反转成正序（30天前到今天）
        trend.reverse();

        // ✅ 3. 此时数组的最后一个元素就是今天，正确提取今日访问量
        const todayVisits = trend.length > 0 ? trend[trend.length - 1].count : 0;
        // ✅ 4. 返回给前端
        res.json({
            code: 1,
            data: trend,
            todayVisits: todayVisits
        });
    } catch (error) {
        console.error('获取百度统计PV趋势失败:', error);
        res.status(500).json({ code: -1, message: '服务器内部错误' });
    }
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

// ✅ 全局搜索
async function globalSearch(req, res) {
    try {
        const { keyword } = req.query;
        if (!keyword || keyword.trim() === '') {
            return res.json({ code: 1, data: [] });
        }

        const searchStr = `%${keyword}%`;

        // 并行查询：文章、公式、栏目、会员
        const [articles, formulas, categories, members] = await Promise.all([
            Article.findAll({
                where: { title: { [Op.like]: searchStr } },
                attributes: ['id', 'title'],
                limit: 5
            }),
            Formula.findAll({
                where: { server_filename: { [Op.like]: searchStr } },
                attributes: ['fs_id', 'server_filename'],
                limit: 5
            }),
            Category.findAll({
                where: { name: { [Op.like]: searchStr } },
                attributes: ['id', 'name'],
                limit: 5
            }),
            Member.findAll({
                where: {
                    [Op.or]: [
                        { username: { [Op.like]: searchStr } },
                        { nickname: { [Op.like]: searchStr } }
                    ]
                },
                attributes: ['id', 'username', 'nickname'],
                limit: 5
            })
        ]);

        // 将结果统一格式化为前端可用的结构
        const results = [
            ...articles.map(a => ({ type: '文章', label: a.title, url: `/admin/contents/articles/${a.id}` })),
            ...formulas.map(f => ({ type: '公式', label: f.server_filename, url: `/admin/contents/formulas/${f.fs_id}` })),
            ...categories.map(c => ({ type: '栏目', label: c.name, url: `/admin/contents/categories` })),
            ...members.map(m => ({ type: '会员', label: m.nickname || m.username, url: `/admin/users/members` })),
        ];

        res.json({ code: 1, data: results });
    } catch (error) {
        console.error('搜索失败:', error);
        res.status(500).json({ code: -1, message: error.message });
    }
}

module.exports = {
    stats,
    visitTrend,
    getBaiduPvTrend,
    globalSearch,
}