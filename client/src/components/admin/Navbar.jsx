import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../store/slices/themeSlice';

const pageTitles = {
    '/admin': 'Dashboard',
    '/admin/dashboard': 'Dashboard',
    '/admin/products': 'Products',
    '/admin/products/upload': 'Upload Product',
    '/admin/categories': 'Categories',
    '/admin/subcategories': 'Sub Categories',
    '/admin/brands': 'Brands',
    '/admin/orders': 'Orders',
    '/admin/users': 'Customers',
    '/admin/coupons': 'Coupons',
    '/admin/reviews': 'Reviews',
    '/admin/reports': 'Reports & Analytics',
    '/admin/inventory': 'Inventory Management',
    '/admin/settings': 'Settings',
    '/admin/marketing': 'Banners',
    '/admin/cms': 'CMS',
    '/admin/profile': 'Admin Profile',
    '/admin/barcode': 'Barcode System Printer',
    '/admin/pos': 'Point of Sale (POS)',
    '/admin/stitching': 'Stitching & Alteration',
    '/admin/purchases': 'Purchase Orders Ledger',
    '/admin/whatsapp': 'WhatsApp Integration Hub',
};

const Navbar = ({ onMenuClick }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { mode } = useSelector((s) => s.theme);

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    const currentPage = pageTitles[location.pathname] || 'Admin Panel';
    const timeStr = currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const dateStr = currentTime.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 h-16 flex items-center justify-between px-6 md:px-8 z-20 flex-shrink-0 shadow-sm transition-colors duration-300">
            {/* Left: Mobile Toggle & Page Title & Global Search Bar */}
            <div className="flex items-center gap-5 flex-1 min-w-0">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden text-slate-600 dark:text-slate-355 hover:text-[#3B82F6] transition-colors p-2 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none cursor-pointer flex-shrink-0"
                    title="Open Navigation Menu"
                >
                    <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                
                {/* Page Title & Breadcrumbs */}
                <div className="hidden sm:flex flex-col flex-shrink-0">
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest">Downtown POS</span>
                    <h1 className="text-xs md:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{currentPage}</h1>
                </div>

                <div className="hidden sm:block h-5 w-px bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
                
                {/* Search Bar */}
                <div className="relative max-w-xs w-full">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Search products, orders, bills..."
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all text-slate-700 dark:text-slate-200"
                    />
                </div>
            </div>

            {/* Right: Actions, Theme, Notification, Info */}
            <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
                {/* Scan Barcode Quick Action */}
                <button
                    onClick={() => navigate('/admin/barcode')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-[10px] md:text-xs font-bold text-slate-750 dark:text-slate-305 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-sm transform active:scale-97 hover:scale-[1.02] hover:text-[#3B82F6]"
                    title="Scan Barcode"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7V5a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2M12 7v10m-3-10v10m6-10v10" />
                    </svg>
                    <span className="hidden sm:inline">Scan Barcode</span>
                </button>

                {/* Create Bill Quick Action */}
                <button
                    onClick={() => navigate('/admin/pos')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#2563EB] hover:to-[#7C3AED] text-white shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 text-[10px] md:text-xs font-black transition-all duration-200 cursor-pointer transform active:scale-97 hover:scale-[1.02]"
                    title="Create Bill (POS)"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Create Bill</span>
                </button>

                {/* Theme Toggle */}
                <button 
                    onClick={() => dispatch(toggleTheme())} 
                    className="w-9.5 h-9.5 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-all transform active:scale-95 hover:scale-[1.02]" 
                    title="Toggle Theme"
                >
                    {mode === 'dark' ? '☀️' : '🌙'}
                </button>

                {/* Notification Button */}
                <button
                    className="relative w-9.5 h-9.5 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-all transform active:scale-95 hover:scale-[1.02]"
                    title="Notifications"
                >
                    <svg className="w-4 h-4 text-slate-650 dark:text-slate-350" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute top-2.5 right-2.5 w-2 w-2 bg-[#8B5CF6] rounded-full animate-pulse border-2 border-white dark:border-slate-800" />
                </button>

                {/* Date/Time (desktop) */}
                <div className="hidden xl:flex flex-col items-end pl-2">
                    <span className="text-[10px] text-slate-700 dark:text-slate-300 font-extrabold">{timeStr}</span>
                    <span className="text-[9px] text-slate-450 font-bold">{dateStr}</span>
                </div>

                <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
                <div className="flex items-center space-x-1.5 pl-1">
                    <span className="w-2.5 h-2.5 bg-[#10B981] rounded-full animate-pulse" />
                    <span className="hidden sm:block text-[10px] text-slate-500 font-black uppercase tracking-widest">Live</span>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
