import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  LayoutDashboard,
  Users,
  HeartHandshake,
  ClipboardList,
  Star,
  FileText,
  LogOut,
  Menu,
  X,
  Shield,
} from "lucide-react";

const navItems = [
  { to: "/admin/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { to: "/admin/users/disabled", label: "ذوو الإعاقة", icon: Users },
  { to: "/admin/users/volunteers", label: "المتطوعون", icon: HeartHandshake },
  { to: "/admin/requests", label: "الطلبات", icon: ClipboardList },
  { to: "/admin/ratings", label: "التقييمات", icon: Star },
  { to: "/admin/reports", label: "التقارير", icon: FileText },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        navigate("/admin/login");
        return;
      }

      const { data: userRow } = await supabase
        .from("users")
        .select("id, name, user_type")
        .eq("email", authData.user.email)
        .eq("user_type", "admin")
        .maybeSingle();

      if (!userRow) {
        await supabase.auth.signOut();
        navigate("/admin/login");
        return;
      }

      const { data: adminRow } = await supabase
        .from("admins")
        .select("id")
        .eq("user_id", userRow.id)
        .maybeSingle();

      if (!adminRow) {
        await supabase.auth.signOut();
        navigate("/admin/login");
        return;
      }

      setAdminName(userRow.name || "مسؤول");
      setLoading(false);
    };

    checkAdmin();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div
        className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 flex items-center justify-center'
        dir='rtl'
      >
        <p className='text-white/70'>جاري التحقق من الصلاحيات...</p>
      </div>
    );
  }

  return (
    <div
      className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 flex'
      dir='rtl'
    >
      {/* Sidebar - Desktop */}
      <aside className='hidden lg:flex w-64 flex-col bg-slate-950/80 border-l border-white/10 backdrop-blur'>
        <div className='p-6 border-b border-white/10'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center'>
              <Shield size={20} />
            </div>
            <div>
              <p className='font-bold text-white text-sm'>
                Easy<span className='text-teal-400'>Move</span>
              </p>
              <p className='text-[11px] text-white/40'>لوحة الإدارة</p>
            </div>
          </div>
        </div>

        <nav className='flex-1 p-4 space-y-1'>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className='p-4 border-t border-white/10'>
          <div className='px-4 py-2 mb-2'>
            <p className='text-white text-sm font-semibold'>{adminName}</p>
            <p className='text-[11px] text-white/40'>مسؤول النظام</p>
          </div>
          <button
            type='button'
            onClick={handleLogout}
            className='w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all'
          >
            <LogOut size={18} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className='lg:hidden fixed inset-0 z-50 bg-black/60'
          onClick={() => setSidebarOpen(false)}
        >
          <aside
            className='absolute right-0 top-0 bottom-0 w-72 bg-slate-950 border-l border-white/10 flex flex-col'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='p-4 flex items-center justify-between border-b border-white/10'>
              <span className='font-bold text-white'>
                Easy<span className='text-teal-400'>Move</span>
              </span>
              <button
                type='button'
                onClick={() => setSidebarOpen(false)}
                className='p-2 text-white/60'
              >
                <X size={20} />
              </button>
            </div>
            <nav className='flex-1 p-4 space-y-1'>
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
                      isActive
                        ? "bg-teal-500/20 text-teal-300"
                        : "text-white/60 hover:bg-white/5"
                    }`
                  }
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className='p-4 border-t border-white/10'>
              <button
                type='button'
                onClick={handleLogout}
                className='w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400'
              >
                <LogOut size={18} />
                تسجيل الخروج
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className='flex-1 flex flex-col min-w-0'>
        <header className='lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-950/50'>
          <button
            type='button'
            onClick={() => setSidebarOpen(true)}
            className='p-2 text-white/70'
          >
            <Menu size={22} />
          </button>
          <span className='font-bold text-white text-sm'>
            Easy<span className='text-teal-400'>Move</span> Admin
          </span>
          <div className='w-9' />
        </header>

        <div className='flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8'>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
