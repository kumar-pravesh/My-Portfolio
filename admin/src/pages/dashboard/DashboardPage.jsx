import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { api, useAuth } from "../../context/AuthContext.jsx";
import {
  FolderKanban,
  Briefcase,
  MessageSquare,
  TrendingUp,
  Plus,
  Eye,
  Star,
  AlertCircle,
  Wrench,
  BookOpen,
  PenTool,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  Activity,
  Zap,
  CheckCircle2,
} from "lucide-react";
import {
  RefBadge,
  StatusBadge,
  PriorityBadge,
} from "../../components/shared/index.jsx";

const STATUS_COLORS = {
  new: "#38bdf8",
  contacted: "#fbbf24",
  qualified: "#c084fc",
  won: "#34d399",
  lost: "#f43f5e",
  proposal_sent: "#fbbf24",
  negotiation: "#06b6d4",
};

function KpiCard({
  title,
  value,
  subtext,
  icon: Icon,
  gradient,
  badgeText,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className="bg-gradient-to-b from-[#151c2d] to-[#0d1322] border border-white/10 hover:border-indigo-500/50 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[160px]"
    >
      <div
        className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-br ${gradient} opacity-15 rounded-full blur-2xl pointer-events-none group-hover:opacity-30 transition-opacity`}
      />

      {/* Top Header Row */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
            {title}
          </span>
          {Icon && (
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} p-0.5 shadow-lg shadow-indigo-500/20 shrink-0 flex items-center justify-center`}
            >
              <div className="w-full h-full bg-[#0d1322]/80 backdrop-blur-md rounded-[9px] flex items-center justify-center">
                <Icon size={18} className="text-white" />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="text-3xl font-black text-white tracking-tight leading-none">
            {value ?? 0}
          </div>
          {subtext && (
            <div className="text-[11px] text-slate-400 font-medium truncate">
              {subtext}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer Row - Aligned at exact same vertical bottom across all cards */}
      {badgeText && (
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold text-slate-400 group-hover:text-indigo-300 transition-colors relative z-10">
          <span>{badgeText}</span>
          <ArrowUpRight
            size={14}
            className="text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
          />
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 h-36 skeleton-shimmer" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="bg-[#111827] border border-white/10 rounded-2xl p-5 h-28 skeleton-shimmer"
              />
            ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <AlertCircle size={40} className="text-rose-500 mb-3" />
        <h3 className="text-base font-bold text-white mb-1">
          Could not load dashboard metrics
        </h3>
        <p className="text-xs text-slate-400">
          Ensure the backend API service is active.
        </p>
      </div>
    );
  }

  const { projects: p = {}, leads: l = {}, contacts: c = {} } = data;

  return (
    <div className="space-y-7 w-full max-w-full pb-12">
      {/* Executive Hero Banner */}
      <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />{" "}
            Live Portfolio CMS & CRM Active
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-white bg-clip-text text-transparent">
              {user?.name || "Pravesh Kumar"}
            </span>
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Monitor content modules, active leads, pipeline conversion rates,
            and recent admin activity logs from your executive control hub.
          </p>
        </div>

        {/* Quick Action Trigger Group */}
        <div className="flex items-center gap-2 flex-wrap relative z-10 shrink-0">
          <button
            onClick={() => navigate("/admin/projects/new")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-xs transition-all shadow-md"
          >
            <Plus size={14} className="text-indigo-400" /> New Project
          </button>
          <button
            onClick={() => navigate("/admin/blog/new")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-xs transition-all shadow-md"
          >
            <Plus size={14} className="text-purple-400" /> New Article
          </button>
          <button
            onClick={() => navigate("/admin/leads/new")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all"
          >
            <Plus size={14} /> New CRM Lead
          </button>
        </div>
      </div>

      {/* Top 4 Key KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Projects"
          value={p.total || 0}
          subtext={`${p.published || 0} Published • ${p.draft || 0} Drafts`}
          icon={FolderKanban}
          gradient="from-sky-500 to-indigo-600"
          badgeText="View Projects"
          onClick={() => navigate("/admin/projects")}
        />
        <KpiCard
          title="CRM Leads"
          value={l.total || 0}
          subtext={`${l.new || 0} New • ${l.won || 0} Won Deals`}
          icon={Briefcase}
          gradient="from-emerald-500 to-teal-600"
          badgeText="Manage Leads"
          onClick={() => navigate("/admin/leads")}
        />
        <KpiCard
          title="Contact Messages"
          value={c.total || 0}
          subtext={`${c.unread || 0} Unread Inquiries`}
          icon={MessageSquare}
          gradient="from-amber-500 to-rose-600"
          badgeText="Review Messages"
          onClick={() => navigate("/admin/contacts")}
        />
        <KpiCard
          title="Featured Showcases"
          value={p.featured || 0}
          subtext="Active Featured Portfolio Cards"
          icon={Star}
          gradient="from-purple-500 to-indigo-600"
          badgeText="View Showcases"
          onClick={() => navigate("/admin/projects")}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leads Trend Bar Chart */}
        <div className="lg:col-span-2 bg-[#111827] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp size={15} className="text-indigo-400" /> CRM Lead
                Inflow (Last 30 Days)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Track daily prospective client inquiries and incoming project
                leads
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-mono text-[10px] font-bold">
              {l.total || 0} Total
            </span>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={data.charts?.leadsOverTime || []}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#64748b" }}
                tickFormatter={(d) => d.slice(5)}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#64748b" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#0d1322",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  fontSize: 12,
                  color: "#fff",
                }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Status Distribution Donut Chart */}
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Zap size={15} className="text-purple-400" /> Deal Status Pipeline
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Stage distribution of active CRM leads
            </p>
          </div>

          {(data.charts?.leadsByStatus || []).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-xs text-slate-500 font-mono">
              No lead distribution data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data.charts.leadsByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  fontSize={10}
                >
                  {data.charts.leadsByStatus.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={STATUS_COLORS[entry.status] || "#6366f1"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#0d1322",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    fontSize: 12,
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span>
              Won Deals:{" "}
              <strong className="text-emerald-400 font-bold">
                {l.won || 0}
              </strong>
            </span>
            <span>
              Lost Deals:{" "}
              <strong className="text-rose-400 font-bold">{l.lost || 0}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom 3 Module Stream Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <FolderKanban size={15} className="text-sky-400" /> Recent
              Projects
            </h3>
            <button
              onClick={() => navigate("/admin/projects")}
              className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View All &rarr;
            </button>
          </div>

          {data.recentProjects.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 font-mono">
              No projects recorded
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {data.recentProjects.map((pr) => (
                <div
                  key={pr.id}
                  onClick={() => navigate(`/admin/projects/${pr.reference_id}`)}
                  className="py-3 flex justify-between items-center cursor-pointer hover:bg-white/[0.02] px-2 rounded-xl transition-colors"
                >
                  <div className="space-y-1 min-w-0 pr-2">
                    <div className="text-xs font-bold text-white truncate">
                      {pr.title}
                    </div>
                    <RefBadge refId={pr.reference_id} />
                  </div>
                  <StatusBadge status={pr.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent CRM Leads */}
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <Briefcase size={15} className="text-emerald-400" /> Recent CRM
              Leads
            </h3>
            <button
              onClick={() => navigate("/admin/leads")}
              className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View All &rarr;
            </button>
          </div>

          {data.recentLeads.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 font-mono">
              No active leads in pipeline
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {data.recentLeads.map((ld) => (
                <div
                  key={ld.id}
                  onClick={() => navigate(`/admin/leads/${ld.reference_id}`)}
                  className="py-3 flex justify-between items-center cursor-pointer hover:bg-white/[0.02] px-2 rounded-xl transition-colors"
                >
                  <div className="space-y-1 min-w-0 pr-2">
                    <div className="text-xs font-bold text-white truncate">
                      {ld.full_name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {ld.company || ld.email}
                    </div>
                    <RefBadge refId={ld.reference_id} />
                  </div>
                  <div className="text-right space-y-1 shrink-0">
                    <StatusBadge status={ld.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Audit Log Activity */}
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <Activity size={15} className="text-purple-400" /> System Audit
              Trail
            </h3>
            <button
              onClick={() => navigate("/admin/activity-logs")}
              className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View All &rarr;
            </button>
          </div>

          {data.recentActivity.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 font-mono">
              No recent activity logged
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {data.recentActivity.map((act) => (
                <div key={act.id} className="py-2.5 flex gap-3 items-start">
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0">
                    {act.user_name?.[0] || "S"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-300">
                      <span className="font-bold text-white">
                        {act.user_name}
                      </span>{" "}
                      <span className="text-slate-400">
                        {act.action.toLowerCase()}
                      </span>{" "}
                      <span className="font-mono text-[11px] text-indigo-400 font-bold">
                        {act.record_ref_id}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1 font-mono">
                      <Clock size={10} />{" "}
                      {new Date(act.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
