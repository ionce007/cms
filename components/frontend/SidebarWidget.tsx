// components/frontend/SidebarWidget.tsx
'use client';
interface SidebarWidgetProps {
    title: string;
    icon: string;
    children: React.ReactNode;
}

export default function SidebarWidget({ title, icon, children }: SidebarWidgetProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="flex items-center space-x-2 text-sm font-semibold text-gray-800">
                    <span>{icon}</span>
                    <span>{title}</span>
                </h3>
            </div>
            <div className="p-5">
                {children}
            </div>
        </div>
    );
}