// config/permissions.ts

export const PERMISSION_GROUPS = [
    {
        groupName: '概览',
        modules: [
            {
                module: 'dashboard',
                label: '数据仪表盘',
                actions: [
                    { key: 'view', label: '查看' },
                ]
            }
        ]
    },
    {
        groupName: '内容管理',
        modules: [
            {
                module: 'categories',
                label: '栏目管理',
                actions: [
                    { key: 'view', label: '查看' },
                    { key: 'create', label: '新增' },
                    { key: 'edit', label: '修改' },
                    { key: 'delete', label: '删除' },
                ]
            },
            {
                module: 'articles',
                label: '文章管理',
                actions: [
                    { key: 'view', label: '查看' },
                    { key: 'create', label: '新增' },
                    { key: 'edit', label: '修改' },
                    { key: 'delete', label: '删除' },
                ]
            },
            {
                module: 'tags',
                label: '标签管理',
                actions: [
                    { key: 'view', label: '查看' },
                    { key: 'create', label: '新增' },
                    { key: 'edit', label: '修改' },
                    { key: 'delete', label: '删除' },
                ]
            },
            {
                module: 'formulas',
                label: '下载公式',
                actions: [
                    { key: 'view', label: '查看' },
                    { key: 'create', label: '新增' },
                    { key: 'edit', label: '修改' },
                    { key: 'delete', label: '删除' },
                    { key: 'sync', label: '同步网盘' }, // 单独给同步操作授权
                ]
            },
            {
                module: 'frags',
                label: '碎片信息',
                actions: [
                    { key: 'view', label: '查看' },
                    { key: 'create', label: '新增' },
                    { key: 'edit', label: '修改' },
                    { key: 'delete', label: '删除' },
                ]
            },
        ]
    },
    {
        groupName: '互动管理',
        modules: [
            {
                module: 'comments',
                label: '评论管理',
                actions: [
                    { key: 'view', label: '查看' },
                    { key: 'audit', label: '审核' },
                    { key: 'delete', label: '删除' },
                ]
            },
            {
                module: 'likes',
                label: '点赞/收藏',
                actions: [
                    { key: 'view', label: '查看' },
                    { key: 'delete', label: '删除' },
                ]
            },
            {
                module: 'downloads',
                label: '下载管理',
                actions: [
                    { key: 'view', label: '查看' },
                    { key: 'delete', label: '删除' },
                ]
            },
        ]
    },
    {
        groupName: '会员管理',
        modules: [
            {
                module: 'members',
                label: '会员管理',
                actions: [
                    { key: 'view', label: '查看' },
                    { key: 'edit', label: '修改/封禁' },
                    { key: 'delete', label: '删除' },
                ]
            },
        ]
    },
    {
        groupName: '系统管理',
        modules: [
            {
                module: 'users',
                label: '系统用户',
                actions: [
                    { key: 'view', label: '查看' },
                    { key: 'create', label: '新增' },
                    { key: 'edit', label: '修改' },
                    { key: 'delete', label: '删除' },
                ]
            },
            {
                module: 'roles',
                label: '角色权限',
                actions: [
                    { key: 'view', label: '查看' },
                    { key: 'create', label: '新增' },
                    { key: 'edit', label: '修改' },
                    { key: 'delete', label: '删除' },
                ]
            },
            {
                module: 'settings',
                label: '系统设置',
                actions: [
                    { key: 'view', label: '查看' },
                    { key: 'edit', label: '修改' },
                ]
            },
            // ✅ 补充：网盘授权
            {
                module: 'bdpan',
                label: '网盘授权',
                actions: [
                    { key: 'view', label: '查看' },
                    { key: 'edit', label: '授权/同步' },
                ]
            },
            // ✅ 补充：统计授权
            {
                module: 'tongji',
                label: '统计授权',
                actions: [
                    { key: 'view', label: '查看' },
                    { key: 'edit', label: '授权' },
                ]
            },
            {
                module: 'logs',
                label: '日志管理',
                actions: [
                    { key: 'view', label: '查看' },
                ]
            },
        ]
    }
];