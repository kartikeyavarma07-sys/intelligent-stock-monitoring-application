import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Boxes,
  Receipt,
  ShoppingCart,
  Truck,
  PackagePlus,
  TrendingUp,
  BarChart3,
  History,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Package },
  { to: "/inventory", label: "Inventory", icon: Boxes },
  { to: "/billing", label: "Billing", icon: Receipt },
  { to: "/sales", label: "Sales", icon: ShoppingCart },
  { to: "/suppliers", label: "Suppliers", icon: Truck, adminOnly: true },
  { to: "/purchases", label: "Purchases", icon: PackagePlus, adminOnly: true },
  { to: "/replenishment", label: "Replenishment", icon: TrendingUp },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/inventory-history", label: "Inventory History", icon: History },
  { to: "/profile", label: "Profile", icon: User },
];

const DashboardLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-slate-950 text-white shadow-2xl">

        <SidebarContent
          visibleItems={visibleItems}
          user={user}
          logout={logout}
        />

      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">

          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="absolute left-0 top-0 h-full w-72 bg-slate-950 text-white shadow-2xl">

            <div className="absolute right-3 top-4">
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <SidebarContent
              visibleItems={visibleItems}
              user={user}
              logout={logout}
              onNavigate={() => setMobileOpen(false)}
            />

          </aside>
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-7 shadow-sm">

          <div className="flex items-center gap-4">

            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={23} />
            </button>

            <div className="hidden sm:block">
              <p className="text-xs text-gray-400">
                Intelligent Stock System
              </p>

              <h2 className="text-sm font-semibold text-gray-800">
                Welcome back, {user?.name?.split(" ")[0] || "User"} 👋
              </h2>
            </div>

          </div>

          <div className="flex items-center gap-3">

            {/* AI Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-semibold">
              <Sparkles size={14} />
              Smart Inventory
            </div>

            {/* User */}
            <div className="flex items-center gap-2">

              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div className="hidden lg:block">
                <p className="text-sm font-semibold text-gray-800">
                  {user?.name || "User"}
                </p>

                <p className="text-[11px] text-gray-400 capitalize">
                  {user?.role || "staff"}
                </p>
              </div>

            </div>

          </div>

        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-7">
          <Outlet />
        </main>

      </div>
    </div>
  );
};


const SidebarContent = ({
  visibleItems,
  user,
  logout,
  onNavigate,
}) => (
  <div className="flex flex-col h-full">

    {/* Logo */}
    <div className="h-20 px-5 flex items-center border-b border-white/10">

      <div className="flex items-center gap-3">

        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Boxes size={23} />
        </div>

        <div>
          <h1 className="font-bold text-sm tracking-wide">
            Stock<span className="text-blue-400">Smart</span>
          </h1>

          <p className="text-[10px] text-slate-400 mt-0.5">
            Inventory Intelligence
          </p>
        </div>

      </div>

    </div>


    {/* Navigation */}
    <nav className="flex-1 overflow-y-auto py-5 px-3">

      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-3 mb-3">
        Main Menu
      </p>

      <div className="space-y-1">

        {visibleItems.map(({ to, label, icon: Icon }) => (

          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/30"
                  : "text-slate-400 hover:text-white hover:bg-white/10"
              }`
            }
          >

            <Icon
              size={18}
              className="transition-transform duration-200 group-hover:scale-110"
            />

            <span>{label}</span>

          </NavLink>

        ))}

      </div>

    </nav>


    {/* Bottom User Section */}
    <div className="p-3 border-t border-white/10">

      <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-white/5">

        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-sm">
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">
            {user?.name || "User"}
          </p>

          <p className="text-[11px] text-slate-400 capitalize">
            {user?.role || "Staff"}
          </p>
        </div>

      </div>

      <button
        onClick={logout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full transition"
      >
        <LogOut size={18} />
        Logout
      </button>

    </div>

  </div>
);

export default DashboardLayout;