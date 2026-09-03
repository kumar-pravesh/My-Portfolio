import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  LayoutDashboard,
  FolderKanban,
  Wrench,
  BookOpen,
  PenTool,
  Image,
  Star,
  Users,
  Settings,
  Activity,
  BarChart3,
  MessageSquare,
  Briefcase,
  LogOut,
  ShieldCheck,
} from "lucide-react";

const NAV = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { section: "Content" },
  { to: "/admin/projects", icon: FolderKanban, label: "Projects" },
  { to: "/admin/services", icon: Wrench, label: "Services" },
  { to: "/admin/case-studies", icon: BookOpen, label: "Case Studies" },
  { to: "/admin/blog", icon: PenTool, label: "Blog" },
  { to: "/admin/media", icon: Image, label: "Media Library" },
  { section: "CRM" },
  { to: "/admin/leads", icon: Briefcase, label: "Leads" },
  { to: "/admin/contacts", icon: MessageSquare, label: "Contact Messages" },
  { section: "Insights" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/admin/activity-logs", icon: Activity, label: "Activity Logs" },
  { section: "Administration" },
  { to: "/admin/users", icon: Users, label: "Users & Roles" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
];

const ROLE_COLORS = {
  SUPER_ADMIN: "text-amber-400",
  ADMIN: "text-sky-400",
  CONTENT_EDITOR: "text-emerald-400",
  SALES_MANAGER: "text-purple-400",
  VIEWER: "text-slate-400",
};

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen w-64 bg-slate-900/85 backdrop-blur-xl border-r border-white/10 flex flex-col z-50 transition-transform duration-300 ${
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-tight">
              Admin Panel
            </div>
            <div className="text-[11px] font-medium text-slate-400">
              Portfolio CMS & CRM
            </div>
          </div>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {NAV.map((item, i) => {
          if (item.section) {
            return (
              <div
                key={i}
                className="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase px-3 pt-4 pb-1"
              >
                {item.section}
              </div>
            );
          }
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all relative ${
                  isActive
                    ? "bg-indigo-500/15 text-indigo-300 font-semibold ring-1 ring-indigo-500/30 shadow-inner"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r shadow-[0_0_8px_#6366f1]" />
                  )}
                  <Icon
                    size={17}
                    className={isActive ? "text-indigo-400" : "text-slate-400"}
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User profile footer */}
      {user && (
        <div className="p-4 border-t border-white/10 bg-black/20 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-md shadow-indigo-500/20 shrink-0">
            {user.full_name?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">
              {user.full_name}
            </div>
            <div
              className={`text-[10px] font-bold uppercase tracking-wider ${ROLE_COLORS[user.role] || "text-slate-400"}`}
            >
              {user.role?.replace("_", " ")}
            </div>
          </div>
          <button
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            onClick={handleLogout}
            title="Logout of Admin Panel"
          >
            <LogOut size={15} />
          </button>
        </div>
      )}
    </aside>
  );
}
