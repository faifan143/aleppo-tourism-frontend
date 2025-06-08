import React, { ReactNode } from 'react';
import {
    Home,
    Map,
    Calendar,
    Settings,
    LogOut,
    User
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

interface AdminLayoutProps {
    children: ReactNode;
    title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        Cookies.remove('admin_token');
        router.push('/admin-login');
    };

    const navigationItems = [
        { name: 'لوحة التحكم', href: '/admin', icon: Home },
        { name: 'الفعاليات', href: '/admin/events', icon: Calendar },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
            {/* Top Navigation Tabs */}
            <div className="bg-white shadow-sm p-4">
                <div className="container mx-auto">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text">
                            لوحة التحكم الإدارية
                        </h1>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleLogout}
                                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white border-b shadow-sm">
                <div className="container mx-auto">
                    <div className="flex overflow-x-auto no-scrollbar">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${pathname === item.href
                                    ? 'border-purple-600 text-purple-600'
                                    : 'border-transparent hover:border-gray-300 hover:text-gray-700'
                                    }`}
                            >
                                <item.icon className="h-5 w-5" />
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Page Content */}
            <main className="flex-grow container mx-auto p-6">
                {children}
            </main>
        </div>
    );
} 