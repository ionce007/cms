// config/permissions.ts
export const PERMISSION_MODULES = [
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
        module: 'formulas',
        label: '下载公式',
        actions: [
            { key: 'view', label: '查看' },
            { key: 'create', label: '新增' },
            { key: 'edit', label: '修改' },
            { key: 'delete', label: '删除' },
            { key: 'sync', label: '同步网盘' },
        ]
    },
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
        module: 'comments',
        label: '评论管理',
        actions: [
            { key: 'view', label: '查看' },
            { key: 'audit', label: '审核(通过/拒绝)' },
            { key: 'delete', label: '删除' },
        ]
    },
    // ... 其他模块同理
];