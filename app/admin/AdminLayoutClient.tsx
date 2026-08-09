// app/admin/AdminLayoutClient.tsx
'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';

export default function AdminLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar
                onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
                mobileMenuOpen={mobileMenuOpen}
            />

            <div className="flex flex-1 pt-16">
                <Sidebar
                    collapsed={sidebarCollapsed}
                    mobileOpen={mobileMenuOpen}
                    onCloseMobile={() => setMobileMenuOpen(false)}
                />

                <main className={`flex-1 p-4 lg:p-6 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
                    }`}>
                    {children}
                </main>
            </div>

            <Footer sidebarCollapsed={sidebarCollapsed} />
        </div>
    );
}