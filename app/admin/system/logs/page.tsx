// app/admin/logs/page.tsx
'use client';

import { Activity, Search } from 'lucide-react';

export default function LogsPage() {
    return (
        <div className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    系统日志管理
                </h1>

                {/* 保留搜索框的 UI，但不做实际功能 */}
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="搜索日志..."
                            disabled
                            className="pl-7 pr-2 py-1.5 border border-gray-200 rounded text-sm w-48 bg-gray-50 cursor-not-allowed outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                {/* 静态表头 */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs">
                            <tr>
                                <th className="py-2.5 px-3 font-medium">ID</th>
                                <th className="py-2.5 px-3 font-medium">操作人</th>
                                <th className="py-2.5 px-3 font-medium">操作模块</th>
                                <th className="py-2.5 px-3 font-medium">操作行为</th>
                                <th className="py-2.5 px-3 font-medium">IP 地址</th>
                                <th className="py-2.5 px-3 font-medium">操作时间</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {/* ✅ 静态空状态展示 */}
                            <tr>
                                <td colSpan={6} className="py-24 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-400">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                            <Activity className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <p className="text-base font-medium">暂无数据</p>
                                        <p className="text-xs mt-1">当前没有产生任何系统日志</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* 静态底部分页 */}
                <div className="px-3 py-2 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-400">
                    <span>共 0 条记录</span>
                    <div className="flex items-center gap-1">
                        <button disabled className="px-2 py-1 border rounded bg-gray-50 opacity-50 cursor-not-allowed">上一页</button>
                        <span className="px-2">第 1 / 1 页</span>
                        <button disabled className="px-2 py-1 border rounded bg-gray-50 opacity-50 cursor-not-allowed">下一页</button>
                    </div>
                </div>
            </div>
        </div>
    );
}