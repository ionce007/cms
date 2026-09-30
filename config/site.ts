// config/site.ts

export interface SiteConfig {
    id: number;
    name: string;
    domain: string;
    wx: string;
    icp: string;
    code: string;
    json: {
        logo: string;
        github?: string;
        twitter?: string;
        weibo?: string;
        email: string;
    };
    title: string;
    keywords: string;
    description: string;
}

/**
 * 站点基础信息
 */
export const DEFAULT_SITE_CONFIG: SiteConfig = {
    id: 0,
    name: '缠说・股经',
    domain: 'cms.foryet.com',
    wx: '-ionce',
    icp: '京ICP备14010346号',
    code: '',
    json: {
        logo: '✨',
        github: 'https://github.com/ionce007',
        twitter: 'https://twitter.com',
        weibo: 'https://weibo.com',
        email: 'ionce@163.com',
    },
    title: '股市赚钱不再难',
    keywords: '通达信,同花顺,指标公式,选股公式,量化交易,量化炒股,量化策略,股票,财经,证券,金融,港股,行情,基金,债券,期货,外汇,科创板,保险,银行,博客,股吧,财迷,论坛,数据,stock,quote,news,fund,bank,blog,data,bbs,股票,投资,交易,行情,上市公司,大盘,上证指数,基金,直播,股评,荐股,博客 ,外汇,黄金,期货,港股,美股, 财经日历,银行,新闻, 证券',
    description: '股票交易技术交流,指标公式,选股公式编写,股票投资经验汇集,量化交易策略编写及技术分享,“缠中说禅”博文。',
};

/**
 * 站点统计数据（用于首页/关于页展示）
 */
export const SITE_STATS = {
    articles: 1000,
    users: 10000,
    visits: 50000,
};

/**
 * ✅ 合并数据库配置与默认值（保证字段完整）
 */
export function mergeSiteConfig(remote: Partial<SiteConfig> | null | undefined): SiteConfig {
    if (!remote) return DEFAULT_SITE_CONFIG;

    return {
        id: remote.id || DEFAULT_SITE_CONFIG.id,
        name: remote.name || DEFAULT_SITE_CONFIG.name,
        domain: remote.domain || DEFAULT_SITE_CONFIG.domain,
        wx: remote.wx || DEFAULT_SITE_CONFIG.wx,
        icp: remote.icp || DEFAULT_SITE_CONFIG.icp,
        code: remote.code || DEFAULT_SITE_CONFIG.code,
        json: {
            ...DEFAULT_SITE_CONFIG.json,
            ...remote.json,
        },
        title: remote.title || DEFAULT_SITE_CONFIG.title,
        keywords: remote.keywords || DEFAULT_SITE_CONFIG.keywords,
        description: remote.description || DEFAULT_SITE_CONFIG.description,
    };
}