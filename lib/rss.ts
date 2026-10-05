// lib/rss.ts

interface RSSItem {
    title: string;
    link: string;
    description: string;
    pubDate: string;
    author?: string;
    category?: string;
    guid?: string;
}

interface RSSChannel {
    title: string;
    link: string;
    description: string;
    language?: string;
    copyright?: string;
    lastBuildDate?: string;
    items: RSSItem[];
}

/**
 * 转义 XML 特殊字符
 */
function escapeXml(str: string | undefined | null): string {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * 生成 RSS 2.0 XML
 */
export function generateRSS(channel: RSSChannel): string {
    const {
        title,
        link,
        description,
        language = 'zh-CN',
        copyright,
        lastBuildDate = new Date().toUTCString(),
        items,
    } = channel;

    const itemsXml = items
        .map(item => {
            return `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <description><![CDATA[${item.description || ''}]]></description>
      <pubDate>${new Date(item.pubDate).toUTCString()}</pubDate>
      ${item.author ? `<author>${escapeXml(item.author)}</author>` : ''}
      ${item.category ? `<category>${escapeXml(item.category)}</category>` : ''}
      <guid isPermaLink="true">${escapeXml(item.guid || item.link)}</guid>
    </item>`;
        })
        .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(link)}</link>
    <description>${escapeXml(description)}</description>
    <language>${language}</language>
    ${copyright ? `<copyright>${escapeXml(copyright)}</copyright>` : ''}
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeXml(link)}/rss.xml" rel="self" type="application/rss+xml" />
    <generator>Next.js RSS Generator</generator>
${itemsXml}
  </channel>
</rss>`;
}

/**
 * 生成 Atom 格式（可选）
 */
export function generateAtom(channel: RSSChannel): string {
    // 类似实现...
    return generateRSS(channel);
}