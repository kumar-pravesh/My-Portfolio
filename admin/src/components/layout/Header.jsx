import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, Bell, ChevronRight } from "lucide-react";
import { useAuth, api } from "../../context/AuthContext.jsx";

const CRUMBS = {
  "/admin": ["Dashboard"],
  "/admin/projects": ["Content", "Projects"],
  "/admin/leads": ["CRM", "Leads"],
  "/admin/contacts": ["CRM", "Contacts"],
  "/admin/services": ["Content", "Services"],
  "/admin/blog": ["Content", "Blog"],
  "/admin/case-studies": ["Content", "Case Studies"],
  "/admin/testimonials": ["Content", "Testimonials"],
  "/admin/analytics": ["Insights", "Analytics"],
  "/admin/activity-logs": ["Insights", "Activity Logs"],
  "/admin/users": ["Administration", "Users & Roles"],
  "/admin/settings": ["Administration", "Settings"],
};

export default function Header({ onHamburger }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState(null);
  const [notifs, setNotifs] = useState({ unread: 0 });
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifData, setNotifData] = useState([]);
  const searchRef = useRef();

  const crumbs = (() => {
    const base = Object.entries(CRUMBS).find(
      ([k]) => location.pathname === k || location.pathname.startsWith(k + "/"),
    );
    return base ? base[1] : ["Admin"];
  })();

  useEffect(() => {
    api
      .get("/notifications")
      .then((r) => setNotifs(r.data))
      .catch(() => {});
  }, [location.pathname]);

  useEffect(() => {
    if (!search.trim() || search.length < 2) {
      setResults(null);
      return;
    }
    const t = setTimeout(() => {
      api
        .get(`/search?q=${encodeURIComponent(search)}`)
        .then((r) => setResults(r.data.results))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const openNotifs = async () => {
    setShowNotifs((v) => !v);
    if (!showNotifs) {
      const r = await api.get("/notifications");
      setNotifData(r.data.data || []);
      setNotifs(r.data);
    }
  };

  const markAllRead = async () => {
    await api.put("/notifications/read-all");
    setNotifs((n) => ({ ...n, unread: 0 }));
    setNotifData((d) => d.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <header className="h-16 bg-[#0b111e]/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 md:px-7 sticky top-0 z-40">
      {/* Left section: Hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3.5">
        <button
          className="md:hidden w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white"
          onClick={onHamburger}
        >
          <Menu size={20} />
        </button>

        <nav className="flex items-center gap-2 text-xs text-slate-400">
          {crumbs.map((c, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight size={12} className="text-slate-500" />}
              <span
                className={
                  i === crumbs.length - 1 ? "font-semibold text-white" : ""
                }
              >
                {c}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right section: Search & Notifications */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div
          className="relative hidden sm:flex items-center gap-2 bg-[#0d1322] border border-white/10 rounded-lg px-3.5 h-9.5 w-64 focus-within:w-80 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all"
          ref={searchRef}
        >
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-full"
            placeholder="Search anything... (PROJ-2026-xxxxx)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onBlur={() => setTimeout(() => setResults(null), 200)}
          />

          {results && (
            <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-[#111827] border border-white/10 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto divide-y divide-white/5">
              {Object.entries(results).map(
                ([group, items]) =>
                  items.length > 0 && (
                    <div key={group} className="p-2">
                      <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {group}
                      </div>
                      {items.map((item) => (
                        <div
                          key={item.reference_id}
                          onMouseDown={() => {
                            navigate(`/admin/${group}/${item.reference_id}`);
                            setSearch("");
                          }}
                          className="px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer flex justify-between items-center"
                        >
                          <span>{item.label}</span>
                          <span className="font-mono text-[11px] text-indigo-400">
                            {item.reference_id}
                          </span>
                        </div>
                      ))}
                    </div>
                  ),
              )}
              {Object.values(results).every((a) => a.length === 0) && (
                <div className="p-4 text-center text-xs text-slate-400">
                  No results found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white relative transition-colors"
            onClick={openNotifs}
          >
            <Bell size={18} />
            {notifs.unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-80 bg-[#111827] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="p-3.5 border-b border-white/10 flex justify-between items-center">
                <span className="font-bold text-xs text-white">
                  Notifications
                </span>
                {notifs.unread > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                {notifData.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No notifications
                  </div>
                ) : (
                  notifData.slice(0, 15).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        api.put(`/notifications/${n.id}/read`);
                        if (n.related_ref_id)
                          navigate(
                            `/admin/${n.related_table}/${n.related_ref_id}`,
                          );
                        setShowNotifs(false);
                      }}
                      className={`p-3 text-xs cursor-pointer hover:bg-white/5 transition-colors ${
                        n.is_read
                          ? "text-slate-400"
                          : "text-white font-medium bg-indigo-500/10"
                      }`}
                    >
                      <div>{n.title}</div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {new Date(n.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
