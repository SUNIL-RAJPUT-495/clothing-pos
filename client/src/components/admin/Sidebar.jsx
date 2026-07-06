import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const menuData = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
  },
  {
    name: "Point of Sale (POS)",
    path: "/admin/pos",
  },
  {
    name: "Catalog",
    path: "/admin/products",
  },
  {
    name: "Stitching & Alteration",
    path: "/admin/stitching",
  },
  {
    name: "Purchase Orders",
    path: "/admin/purchases",
  },
  {
    name: "Customers CRM",
    path: "/admin/users",
  },
  {
    name: "Reports & Analytics",
    path: "/admin/reports",
  },
  {
    name: "Settings",
    path: "/admin/settings",
  },
];

const getIcon = (name) => {
  const size = "w-4 h-4";
  switch (name) {
    case "Dashboard":
      return (
        <svg className={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );
    case "Point of Sale (POS)":
      return (
        <svg className={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    case "Catalog":
      return (
        <svg className={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    case "Stitching & Alteration":
      return (
        <svg className={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.121 14.121L19 19m-7-7l7-7m-7 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case "Purchase Orders":
      return (
        <svg className={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case "Customers CRM":
      return (
        <svg className={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case "WhatsApp Hub":
      return (
        <svg className={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    case "Reports & Analytics":
      return (
        <svg className={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case "Settings":
      return (
        <svg className={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    default:
      return <span>📌</span>;
  }
};

function Sidebar({ isOpen = false, onClose = () => {} }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("admin_logged_in");
    navigate("/admin/login");
  };

  const isItemActive = (item) => {
    if (item.path === location.pathname) return true;
    
    // Custom checks for parent routes when on child pages
    if (item.name === "Catalog") {
      const catalogRoutes = ['/admin/products', '/admin/barcode', '/admin/inventory', '/admin/categories', '/admin/brands'];
      return catalogRoutes.includes(location.pathname);
    }
    
    if (item.name === "Settings") {
      const settingsRoutes = ['/admin/settings', '/admin/shipping', '/admin/payments', '/admin/whatsapp'];
      return settingsRoutes.includes(location.pathname);
    }
    
    return false;
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={
          "fixed lg:relative top-0 left-0 z-50 h-screen w-72 flex-shrink-0 bg-[#0F172A] border-r border-slate-800 shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between " +
          (isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")
        }
      >
        <div>
          {/* Header & Logo */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
            <h1 className="font-black text-sm tracking-widest uppercase flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white shadow-md shadow-blue-950/20">
                <svg className="w-5 h-5 text-[#3B82F6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3h6a3 3 0 0 0-3-3z" />
                  <path d="M21 16V10a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6" />
                  <path d="M12 8v12" />
                  <path d="M7 16h10" />
                </svg>
              </span>
              <div className="flex flex-col">
                <span className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent text-xs tracking-wider">Downtown</span>
                <span className="text-[9px] text-[#8B5CF6] font-extrabold tracking-widest uppercase -mt-0.5">Control Panel</span>
              </div>
            </h1>
            <button
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-red-500 p-1.5 rounded-lg focus:outline-none cursor-pointer"
              title="Close Menu"
            >
              ✕
            </button>
          </div>

          {/* Menu */}
          <div className="h-[calc(100vh-140px)] overflow-y-auto scrollbar-none no-scrollbar p-4 space-y-1.5">
            {menuData.map((item) => {
              const isActive = isItemActive(item);

              return (
                <div key={item.name}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 group " +
                      (isActive
                        ? "bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white shadow-md shadow-blue-500/15"
                        : "hover:bg-slate-800/40 text-slate-400 hover:text-white")
                    }
                  >
                    <span className={"transition-colors " + (isActive ? "text-white" : "text-slate-500 group-hover:text-slate-200")}>
                      {getIcon(item.name)}
                    </span>
                    <span>{item.name}</span>
                  </NavLink>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer / Profile */}
        <div className="border-t border-slate-800 p-4 flex items-center justify-between gap-3 bg-slate-900/40 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center text-white text-xs font-black shadow-md shadow-blue-500/20">
                AD
              </span>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#10B981] rounded-full border-2 border-[#0F172A] animate-pulse" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-slate-200 truncate">Downtown Admin</p>
              <p className="text-[10px] text-slate-505 font-bold uppercase tracking-wider">Super Admin</p>
            </div>
          </div>
          <button
            onClick={() => {
              handleLogout();
              onClose();
            }}
            className="w-8.5 h-8.5 rounded-xl bg-blue-500/10 text-[#3B82F6] hover:bg-blue-500/20 flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
            title="Logout"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
