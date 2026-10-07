// lib/analyticsParser.ts

/**
 * 从完整的 HTML 字符串中提取 <script> 内的 JS 代码
 * 支持：
 * - <script>...</script>
 * - <script src="...">...</script>（外链）
 * - 纯 JS 代码
 */
export interface ParsedScript {
    inline: string[];      // 内联 JS 代码
    external: string[];    // 外链 JS URL
}

export function parseAnalyticsCode(code: string): ParsedScript {
    const result: ParsedScript = {
        inline: [],
        external: [],
    };

    if (!code || code.trim() === '') {
        return result;
    }

    // ✅ 匹配所有 <script> 标签
    const scriptRegex = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
    let match: RegExpExecArray | null;
    let found = false;

    while ((match = scriptRegex.exec(code)) !== null) {
        found = true;
        const attrs = match[1] || '';
        const content = match[2] || '';

        // ✅ 判断是否有 src 属性
        const srcMatch = attrs.match(/src=["']([^"']+)["']/i);
        if (srcMatch) {
            result.external.push(srcMatch[1]);
        } else if (content.trim()) {
            result.inline.push(content.trim());
        }
    }

    // ✅ 如果没有 <script> 标签，把整段代码当作内联 JS
    if (!found && code.trim()) {
        result.inline.push(code.trim());
    }

    return result;
}