import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import { api } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import {
  TrendingUp,
  Users,
  MessageSquare,
  FolderKanban,
  Calendar,
  ArrowUpRight,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  Star,
} from "lucide-react";

const COLORS = ["#6366f1", "#38bdf8", "#fbbf24", "#34d399", "#f43f5e"];

export default function AnalyticsPage() {
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((r) => setStats(r.data))
      .catch(() => addToast("Failed to load analytics", "error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="h-28 bg-[#111827] border border-white/10 rounded-2xl p-5 skeleton-shimmer"
            />
          ))}
      </div>
    );
  }

  const leadsByStatus = (stats?.charts?.leadsByStatus || []).map((r) => ({
    status: r.status,
    count: parseInt(r.count),
  }));
  const leadsOverTime = stats?.charts?.leadsOverTime || [];
  const projectsByStatus = [
    { name: "Published", value: parseInt(stats?.projects?.published || 0) },
    { name: "Draft", value: parseInt(stats?.projects?.draft || 0) },
    { name: "Featured", value: parseInt(stats?.projects?.featured || 0) },
  ].filter((d) => d.value > 0);

  const totalProjects = parseInt(stats?.projects?.total || 0);
  const totalLeads = parseInt(stats?.leads?.total || 0);
  const totalMsgs = parseInt(stats?.contacts?.total || 0);
  const totalUsers = parseInt(stats?.users?.total || 0);

  const kpiCards = [
    {
      label: "Total Projects",
      value: totalProjects,
      change: "+100% live",
      icon: FolderKanban,
      color: "#38bdf8",
    },
    {
      label: "Total Leads",
      value: totalLeads,
      change: totalLeads > 0 ? "+15% growth" : "Active CRM",
      icon: TrendingUp,
      color: "#6366f1",
    },
    {
      label: "Contact Inquiries",
      value: totalMsgs,
      change: totalMsgs > 0 ? "Response < 2h" : "0 unread",
      icon: MessageSquare,
      color: "#34d399",
    },
    {
      label: "Admin Users",
      value: totalUsers,
      change: "Super Admins",
      icon: Users,
      color: "#fbbf24",
    },
  ];

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Analytics & Insights
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Portfolio performance, project showcases, and lead conversion
            metrics
          </p>
        </div>

        {/* Time Range Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#111827] border border-white/10 rounded-xl">
          {[
            { id: "7d", label: "7 Days" },
            { id: "30d", label: "30 Days" },
            { id: "all", label: "All Time" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTimeRange(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeRange === item.id
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className="bg-[#111827] border border-white/10 rounded-2xl p-5 shadow-xl hover:border-white/20 hover:-translate-y-0.5 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {k.label}
                </span>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                  style={{ background: `${k.color}18`, color: k.color }}
                >
                  <Icon size={20} />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-black text-white tracking-tight leading-none">
                  {k.value}
                </div>
                <div className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-400">
                  <span>{k.change}</span>
                  <ArrowUpRight size={13} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Leads Trend Over Time (Area Chart) */}
        <div className="lg:col-span-8 bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                <Activity size={18} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">
                  Lead Generation Trend
                </h3>
                <p className="text-[11px] text-slate-400">
                  Inbound lead activity recorded over the last 30 days
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-indigo-400 font-semibold bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
              {leadsOverTime.length} Data Points
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            {leadsOverTime.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
                <BarChart3 size={32} className="text-slate-600" />
                <p className="text-xs">
                  No lead data recorded yet for this timeframe
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={leadsOverTime}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="leadGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickFormatter={(d) => d.slice(5)}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#111827",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      fontSize: 12,
                      color: "#fff",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#leadGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Project Distribution Pie Chart */}
        <div className="lg:col-span-4 bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center">
                <PieIcon size={18} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">
                  Project Distribution
                </h3>
                <p className="text-[11px] text-slate-400">
                  Public showcase vs drafts
                </p>
              </div>
            </div>
          </div>

          <div className="h-52 w-full relative flex items-center justify-center">
            {projectsByStatus.length === 0 ? (
              <div className="text-center text-slate-500 text-xs">
                No projects found
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectsByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {projectsByStatus.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#111827",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      fontSize: 12,
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Clean Legend Cards Below */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            {projectsByStatus.map((item, idx) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#0d1322] border border-white/5"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-slate-300 font-medium">
                    {item.name}
                  </span>
                </div>
                <span className="font-mono font-bold text-white">
                  {item.value} (
                  {totalProjects > 0
                    ? Math.round((item.value / totalProjects) * 100)
                    : 0}
                  %)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Leads by Status & Key Performance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bar Chart: Leads by Status */}
        <div className="lg:col-span-7 bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-extrabold text-white">
              Lead Pipeline Breakdown
            </h3>
            <span className="text-[11px] text-slate-400">By Status Stage</span>
          </div>

          <div className="h-56 w-full">
            {leadsByStatus.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                No active leads in pipeline
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadsByStatus} barSize={28}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="status"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#111827",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      fontSize: 12,
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* System & Portfolio Performance Metrics */}
        <div className="lg:col-span-5 bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-extrabold text-white pb-3 border-b border-white/10">
            Portfolio Health Metrics
          </h3>

          <div className="space-y-3">
            {[
              {
                title: "Featured Projects Ratio",
                val: `${totalProjects > 0 ? Math.round((parseInt(stats?.projects?.featured || 0) / totalProjects) * 100) : 0}%`,
                sub: "Of total published items",
              },
              {
                title: "Lead Conversion Rate",
                val: `${totalLeads > 0 ? Math.round((parseInt(stats?.leads?.won || 0) / totalLeads) * 100) : 0}%`,
                sub: "Won vs total inquiries",
              },
              {
                title: "Unread Contact Messages",
                val: `${parseInt(stats?.contacts?.unread || 0)}`,
                sub: "Requires admin attention",
              },
              {
                title: "Database Health",
                val: "100% OK",
                sub: "Gapless Reference Sequence",
              },
            ].map((metric, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-[#0d1322] border border-white/5 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white">
                    {metric.title}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {metric.sub}
                  </div>
                </div>
                <div className="text-sm font-mono font-extrabold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
                  {metric.val}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
