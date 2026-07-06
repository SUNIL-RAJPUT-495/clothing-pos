import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Sidebar from '../components/admin/Sidebar';
import Navbar from '../components/admin/Navbar';
import { fetchProducts } from '../store/slices/productSlice';
import { fetchCustomers } from '../store/slices/customerSlice';
import { fetchStitchingOrders } from '../store/slices/stitchingSlice';
import { fetchOrders } from '../store/slices/salesSlice';
import { fetchInventory } from '../store/slices/inventorySlice';
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

const catalogSubItems = [
    { name: "Products", path: "/admin/products" },
    { name: "Barcode System", path: "/admin/barcode" },
    { name: "Inventory", path: "/admin/inventory" },
    { name: "Categories", path: "/admin/categories" },
    { name: "Brands", path: "/admin/brands" },
];

const settingsSubItems = [
    { name: "Store Settings", path: "/admin/settings" },
    { name: "Shipping", path: "/admin/shipping" },
    { name: "Payments", path: "/admin/payments" },
    { name: "WhatsApp Hub", path: "/admin/whatsapp" },
];

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const isLoggedIn = localStorage.getItem('admin_logged_in') === 'true';
        const token = localStorage.getItem('accessToken');
        if (!isLoggedIn || !token) {
            navigate('/admin/login');
        } else {
            dispatch(fetchProducts());
            dispatch(fetchCustomers());
            dispatch(fetchStitchingOrders());
            dispatch(fetchOrders());
            dispatch(fetchInventory());
        }
    }, [navigate, dispatch]);

    const isCatalogPath = ['/admin/products', '/admin/barcode', '/admin/inventory', '/admin/categories', '/admin/brands'].includes(location.pathname);
    const isSettingsPath = ['/admin/settings', '/admin/shipping', '/admin/payments', '/admin/whatsapp'].includes(location.pathname);

    let subMenuItems = null;
    if (isCatalogPath) {
        subMenuItems = catalogSubItems;
    } else if (isSettingsPath) {
        subMenuItems = settingsSubItems;
    }

    return (
        <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-800 dark:text-slate-100 font-sans overflow-hidden">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-grow flex flex-col min-w-0 overflow-hidden">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                
                {/* Horizontal Sub-Navbar */}
                {subMenuItems && (
                    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 px-6 py-2.5 flex-shrink-0 flex justify-center gap-2 overflow-x-auto scrollbar-none no-scrollbar transition-all duration-300">
                        {subMenuItems.map((sub) => {
                            const isSubActive = location.pathname === sub.path;
                            return (
                                <NavLink
                                    key={sub.path}
                                    to={sub.path}
                                    className={
                                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 " +
                                        (isSubActive
                                            ? "bg-blue-500/10 text-[#3B82F6] border border-blue-500/20"
                                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 border border-transparent")
                                    }
                                >
                                    {sub.name}
                                </NavLink>
                            );
                        })}
                    </div>
                )}

                <main className="flex-1 overflow-y-auto scrollbar-none no-scrollbar bg-[#F8FAFC] dark:bg-[#0B0F19] p-6 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
