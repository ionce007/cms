**📊 CMS Dashboard & TechBlog**

一个基于 Next.js 14 + TypeScript + Tailwind CSS 构建的现代化内容管理系统和博客平台。

<https://img.shields.io/badge/Next.js-14.2-black?logo=next.js>
<https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript>
<https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css>
<https://img.shields.io/badge/React-18.3-61DAFB?logo=react>
<https://img.shields.io/badge/License-MIT-green.svg>

**✨ 功能特性**

**🖥️ CMS 管理后台**

* **数据仪表盘** - 关键数据指标可视化展示，支持统计卡片和迷你趋势图
* **文章管理** - 文章列表、状态管理（已发布/草稿/已归档）
* **媒体库** - 图片、视频、文档等媒体资源管理
* **用户管理** - 管理员、编辑、普通用户角色管理
* **系统设置** - 站点配置、SEO设置、权限管理
* **全局搜索** - 支持快捷键 Ctrl+K 快速搜索
* **通知系统** - 实时消息通知，支持已读/未读状态
* **响应式设计** - 完美适配桌面端、平板和移动端
* **可折叠侧边栏** - 最大化内容展示空间

**🌐 前端博客**

* **首页展示** - 精选文章横幅 + 文章列表
* **文章列表** - 分类筛选、标签筛选、搜索、排序
* **文章详情** - 完整文章阅读体验，包含面包屑导航
* **分类导航** - 按分类浏览文章
* **标签系统** - 热门标签云展示
* **热门文章** - 基于阅读量排行
* **邮件订阅** - Newsletter 订阅功能
* **分页功能** - 大量文章的分页浏览
* **相关推荐** - 文章详情页展示相关文章

**🚀 快速开始**

**环境要求**

* **Node.js** 18.0 或更高版本
* **npm** 9.0+ 或 **yarn** 1.22+

**安装**

``` bash

*# 克隆项目*

git clone <your-repository-url>

cd cms-dashboard

*# 安装依赖*

npm install

*# 启动开发服务器*

npm run dev
```

访问 http://localhost:3000 查看前端博客，访问 http://localhost:3000/admin 进入管理后台。

**构建生产版本**

bash

*# 构建*

npm run build

*# 启动生产服务器*

npm start

**📁 项目结构**

cms-dashboard/

├── app/ # Next.js App Router 页面

│ ├── layout.tsx # 根布局（含 HTML/Body）

│ ├── page.tsx # 前端首页

│ ├── globals.css # 全局样式

│ ├── icon.svg # Favicon 图标

│ ├── apple-icon.svg # Apple 设备图标

│ ├── admin/ # 管理后台路由

│ │ ├── layout.tsx # 管理端布局

│ │ ├── AdminLayoutClient.tsx # 管理端客户端布局

│ │ └── page.tsx # 管理端仪表盘

│ └── articles/ # 前端文章路由

│ ├── page.tsx # 文章列表页

│ └── [id]/

│ └── page.tsx # 文章详情页

├── components/ # 组件目录

│ ├── layout/ # 管理端布局组件

│ │ ├── Navbar.tsx # 顶部导航栏

│ │ ├── Sidebar.tsx # 侧边栏菜单

│ │ └── Footer.tsx # 底部信息

│ ├── dashboard/ # 仪表盘组件

│ │ ├── StatCard.tsx # 统计卡片

│ │ └── QuickActions.tsx # 快捷操作按钮

│ ├── content/ # 内容卡片组件

│ │ ├── ContentSection.tsx # 内容区域容器

│ │ ├── ArticleCard.tsx # 文章卡片（管理端）

│ │ ├── MediaCard.tsx # 媒体资源卡片

│ │ ├── UserCard.tsx # 用户信息卡片

│ │ └── SettingCard.tsx # 系统设置卡片

│ └── frontend/ # 前端展示组件

│ ├── Header.tsx # 博客顶部导航

│ ├── HeroSection.tsx # 首页英雄区域

│ ├── ArticleList.tsx # 文章列表容器

│ ├── ArticleCard.tsx # 文章卡片（前端）

│ ├── ArticleFilters.tsx # 文章筛选组件

│ ├── Pagination.tsx # 分页导航组件

│ ├── Sidebar.tsx # 侧边栏容器

│ ├── SidebarWidget.tsx # 侧边栏小部件

│ └── Footer.tsx # 博客底部信息

├── types/ # TypeScript 类型定义

│ ├── index.ts # 管理端类型

│ └── frontend.ts # 前端类型

├── hooks/ # 自定义 React Hooks

│ ├── useContentData.ts # 内容数据获取 Hook

│ └── useMediaQuery.ts # 媒体查询 Hook

├── data/ # 模拟数据

│ ├── mockData.ts # 管理端模拟数据

│ └── articlesData.ts # 前端文章模拟数据

├── lib/ # 工具函数库

│ └── utils.ts # cn() 类名合并工具

├── public/ # 静态资源目录

├── next.config.js # Next.js 配置

├── tailwind.config.ts # Tailwind CSS 配置

├── postcss.config.js # PostCSS 配置

├── tsconfig.json # TypeScript 配置

└── package.json # 项目依赖和脚本

**🛠️ 技术栈**

| 技术 | 版本 | 用途 |
| --- | --- | --- |
| Next.js | 14.2 | React 全栈框架，App Router |
| React | 18.3 | 用户界面库 |
| TypeScript | 5.4 | 类型安全 |
| Tailwind CSS | 3.4 | 实用优先的 CSS 框架 |
| clsx | 2.1 | 条件类名工具 |
| tailwind-merge | 2.3 | Tailwind 类名智能合并 |

**🎨 设计特点**

* **深色导航栏** - 专业的深色主题头部设计
* **渐变色图标** - 使用渐变色增强视觉吸引力
* **卡片式布局** - 现代化卡片设计，清晰的信息层级
* **微交互动画** - 悬停效果、过渡动画提升用户体验
* **股票主题 Favicon** - 上涨趋势线图标的品牌标识
* **响应式设计** - 完美适配桌面端、平板和移动端
* **可折叠侧边栏** - 管理后台最大化内容展示空间

**📝 页面路由**

| 路径 | 说明 | 类型 |
| --- | --- | --- |
| / | 前端首页 | 服务端组件 |
| /articles | 文章列表页（含筛选、搜索、分页） | 客户端组件 |
| /articles/[id] | 文章详情页 | 服务端组件 |
| /admin | 管理后台仪表盘 | 客户端组件 |

**🔧 自定义配置**

**修改主题色**

在 tailwind.config.ts 中修改 primary 颜色配置：

``` typescript

colors: {

    primary: {

        50: '#eff6ff',

        100: '#dbeafe',

        200: '#bfdbfe',

        300: '#93c5fd',

        400: '#60a5fa',

        500: '#3b82f6',

        600: '#2563eb', *// 主色调*

        700: '#1d4ed8',

        800: '#1e40af',

        900: '#1e3a8a',

        950: '#172554',

    },

}
```

**修改网站信息**

在 data/articlesData.ts 中修改 siteInfo 对象：

``` typescript

export const siteInfo: SiteInfo = {

    name: '你的网站名称',

    description: '你的网站描述',

    logo: '📝',

    socialLinks: {

        github: 'https://github.com/your-username',

        twitter: 'https://twitter.com/your-handle',

        weibo: 'https://weibo.com/your-profile',

        email: 'mailto:contact@yourdomain.com',

    },

};
```

**添加新页面**

1. 在 app/ 目录下创建新的路由文件夹
2. 创建 page.tsx 文件
3. 如需布局，创建 layout.tsx 文件

示例：

app/

├── about/

│ └── page.tsx # /about 页面

├── contact/

│ └── page.tsx # /contact 页面

└── categories/

└── [slug]/

└── page.tsx # /categories/frontend 等分类页面

**自定义 Favicon**

修改 app/icon.svg 文件，或替换为以下格式的图标文件：

* favicon.ico - 传统 ICO 格式
* icon.png - PNG 格式
* icon.svg - SVG 矢量格式（推荐）
* apple-icon.png - Apple 设备图标

**📦 部署**

**Vercel 部署（推荐）**

1. 将项目推送到 GitHub、GitLab 或 Bitbucket
2. 在 Vercel 中导入项目仓库
3. Vercel 自动检测 Next.js 项目配置
4. 点击部署按钮，自动完成构建和发布

每次推送到主分支时，Vercel 会自动重新部署。

**自托管部署**

``` bash

*# 1. 克隆项目到服务器*

git clone <your-repository-url>

cd cms-dashboard

*# 2. 安装依赖*

npm ci --only=production

*# 3. 构建项目*

npm run build

*# 4. 启动生产服务器*

npm start

*# 5. 使用 PM2 守护进程（推荐）*

npm install -g pm2

pm2 start npm --name "cms-dashboard" -- start

pm2 save

pm2 startup
```

**Docker 部署**

创建 Dockerfile：

``` dockerfile

# 多阶段构建

FROM node:18-alpine AS base

WORKDIR /app

# 安装依赖阶段

FROM base AS deps

COPY package\*.json ./

RUN npm ci

# 构建阶段

FROM base AS build

COPY --from=deps /app/node\_modules ./node\_modules

COPY . .

RUN npm run build

# 生产运行阶段

FROM base AS production

ENV NODE\_ENV=production

COPY --from=build /app/public ./public

COPY --from=build /app/.next/standalone ./

COPY --from=build /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
```

构建和运行 Docker 镜像：

``` bash

*# 构建镜像*

docker build -t cms-dashboard .

*# 运行容器*

docker run -p 3000:3000 cms-dashboard
```

**📊 数据说明**

项目当前使用模拟数据进行展示，数据文件位于 data/ 目录：

* mockData.ts - 管理后台仪表盘数据
  + 统计数据（文章数、访问量、用户数、存储使用）
  + 文章列表（含标签、作者、阅读量）
  + 媒体资源（图片、视频、文档）
  + 用户角色（管理员、编辑、普通用户）
  + 系统设置项
* articlesData.ts - 前端博客文章数据
  + 文章内容（标题、摘要、封面图）
  + 分类和标签
  + 作者信息
  + 网站基本信息

**接入真实 API**

1. 修改 hooks/useContentData.ts 中的数据获取逻辑
2. 将模拟数据替换为真实的 API 调用
3. 更新类型定义以匹配 API 返回的数据结构

示例代码：

``` typescript

*// hooks/useContentData.ts*

const fetchData = useCallback(async () => {

    setLoading(true);

    setError(null);

    try {

        const response = await fetch('/api/dashboard');

        if (!response.ok) throw new Error('网络请求失败');

        const data = await response.json();

        setStats(data.stats);

        setSections(data.sections);

    } catch (err) {

        setError('获取数据失败，请稍后重试');

        console.error('API Error:', err);

    } finally {

        setLoading(false);

    }

}, []);
```

**🤝 贡献指南**

我们欢迎任何形式的贡献！无论是新功能、Bug 修复、文档改进还是问题反馈。

**贡献流程**

1. **Fork** 本仓库到你的 GitHub 账号
2. **克隆** Fork 后的仓库到本地

``` bash

git clone https://github.com/your-username/cms-dashboard.git
```

3. **创建**特性分支

``` bash

git checkout -b feature/amazing-feature
```

4. **提交**你的更改

``` bash

git add .

git commit -m 'feat: add amazing feature'
```

5. **推送**到远程分支

``` bash

git push origin feature/amazing-feature
```

6. **创建** Pull Request 到主仓库

**代码规范**

* 使用 TypeScript 严格模式（strict: true）
* 遵循 ESLint 推荐的代码规范
* 组件使用函数式组件 + React Hooks
* 样式统一使用 Tailwind CSS 类名
* 提交信息遵循 Conventional Commits 规范：
  + feat: 新功能
  + fix: Bug 修复
  + docs: 文档更新
  + style: 代码格式调整
  + refactor: 代码重构
  + test: 测试相关
  + chore: 构建/工具相关

**问题反馈**

* 在 Issues 页面提交 Bug 报告
* 使用 Bug Report 模板提供详细信息
* 附上复现步骤和截图
* 在 Discussions 中讨论新功能建议

**📄 许可证**

本项目采用 MIT 许可证。

MIT 许可证是一种宽松的自由软件许可证，允许用户：

* ✅ 自由使用、复制、修改、合并、出版发行、散布、再授权
* ✅ 商业使用
* ✅ 私有使用

详细条款请参阅项目根目录下的 LICENSE 文件。

``` text

MIT License

Copyright (c) 2026 CMS Dashboard

Permission is hereby granted, free of charge, to any person obtaining a copy

of this software and associated documentation files (the "Software"), to deal

in the Software without restriction, including without limitation the rights

to use, copy, modify, merge, publish, distribute, sublicense, and/or sell

copies of the Software, and to permit persons to whom the Software is

furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all

copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR

IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,

FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE

AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER

LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,

OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE

SOFTWARE.
```

**🙏 致谢**

感谢以下开源项目和服务：

* [Next.js](https://nextjs.org/) - 优秀的 React 全栈框架
* [Tailwind CSS](https://tailwindcss.com/) - 实用的原子化 CSS 框架
* [TypeScript](https://www.typescriptlang.org/) - 类型安全的 JavaScript 超集
* [Unsplash](https://unsplash.com/) - 高质量的免费图片资源
* [Vercel](https://vercel.com/) - 便捷的部署平台

**📧 联系方式**

| 渠道 | 地址 |
| --- | --- |
| 项目仓库 | [GitHub Repository](https://github.com/your-username/cms-dashboard) |
| 问题反馈 | [GitHub Issues](https://github.com/your-username/cms-dashboard/issues) |
| 功能建议 | [GitHub Discussions](https://github.com/your-username/cms-dashboard/discussions) |
| 邮件联系 | contact@yourdomain.com |

**📋 更新日志**

**v1.0.0 (2026-08-09)**

* 🎉 初始版本发布
* ✨ 完整的管理后台仪表盘
* 📝 文章管理和展示功能
* 🖼️ 媒体库管理
* 👥 用户角色管理
* ⚙️ 系统设置模块
* 🌐 前端博客展示
* 📱 全面响应式适配

Made with ❤️ by Your Team
© 2026 CMS Dashboard. All rights reserved.