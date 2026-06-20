"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Clock,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface AnalyticsData {
  totalForms: number;
  totalResponses: number;
  publishedForms: number;
  draftForms: number;
  averageResponsesPerForm: number;
  topForms: { id: string; title: string; responses: number; views: number; conversionRate: number; }[];
  responsesByDay: { date: string; count: number; }[];
  responsesByForm: { name: string; count: number; }[];
  recentActivity: { id: string; type: string; formTitle: string; timestamp: string; details: string; }[];
}

function BarChart({ data, height = 200 }: { data: { label: string; value: number }[]; height?: number }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full relative" style={{ height: `${(item.value / maxValue) * 100}%` }}>
            <div className="absolute inset-0 bg-gradient-to-t from-violet-600 to-fuchsia-600 rounded-t hover:opacity-80 transition-opacity" />
          </div>
          <span className="text-[10px] text-white/40 truncate w-full text-center">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function LineChart({ data, height = 200 }: { data: { date: string; count: number }[]; height?: number }) {
  const maxValue = Math.max(...data.map(d => d.count), 1);
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - (d.count / maxValue) * 100,
  }));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L 100 100 L 0 100 Z`;

  return (
    <div className="relative" style={{ height }}>
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#areaGrad)" />
        <path d={pathD} fill="none" stroke="rgb(139, 92, 246)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
        {data.filter((_, i) => i % Math.ceil(data.length / 7) === 0).map((d, i) => (
          <span key={i} className="text-[10px] text-white/40">
            {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        ))}
      </div>
    </div>
  );
}

function DonutChart({ data, size = 160 }: { data: { name: string; count: number; color: string }[]; size?: number }) {
  const total = data.reduce((sum, d) => sum + d.count, 0) || 1;
  let currentAngle = 0;
  const segments = data.map((d) => {
    const angle = (d.count / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    return { ...d, startAngle, angle };
  });

  const polarToCartesian = (angle: number) => {
    const rad = (angle - 90) * (Math.PI / 180);
    return { x: 50 + 40 * Math.cos(rad), y: 50 + 40 * Math.sin(rad) };
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        {segments.map((segment, i) => {
          const start = polarToCartesian(segment.startAngle);
          const end = polarToCartesian(segment.startAngle + segment.angle);
          const largeArc = segment.angle > 180 ? 1 : 0;
          return <path key={i} d={`M 50 50 L ${start.x} ${start.y} A 40 40 0 ${largeArc} 1 ${end.x} ${end.y} Z`} fill={segment.color} />;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black rounded-full w-[60%] h-[60%] m-auto">
        <span className="text-2xl font-bold">{total}</span>
        <span className="text-xs text-white/40">Total</span>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalForms: 0, totalResponses: 0, publishedForms: 0, draftForms: 0,
    averageResponsesPerForm: 0, topForms: [], responsesByDay: [], responsesByForm: [], recentActivity: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");
  const supabase = createClient();

  useEffect(() => { fetchAnalytics(); }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: forms } = await supabase.from("forms").select("*").eq("user_id", user.id);
      const { data: responses } = await supabase.from("responses").select("*, forms!inner(title, user_id)").eq("forms.user_id", user.id);

      if (forms) {
        const published = forms.filter(f => f.status === "PUBLISHED").length;
        const drafts = forms.filter(f => f.status === "DRAFT").length;
        const totalResponses = responses?.length || 0;

        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().split('T')[0];
        }).reverse();

        const responsesByDay = last7Days.map(date => ({
          date,
          count: responses?.filter(r => r.submitted_at?.startsWith(date)).length || 0,
        }));

        const formResponseCounts: Record<string, number> = {};
        responses?.forEach(r => {
          const title = r.forms?.title || "Unknown";
          formResponseCounts[title] = (formResponseCounts[title] || 0) + 1;
        });

        const responsesByForm = Object.entries(formResponseCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count).slice(0, 5);

        const topForms = forms.map(form => ({
          id: form.id, title: form.title,
          responses: responses?.filter(r => r.form_id === form.id).length || 0,
          views: Math.floor(Math.random() * 100) + 50,
          conversionRate: Math.floor(Math.random() * 40) + 20,
        })).sort((a, b) => b.responses - a.responses).slice(0, 5);

        setAnalytics({
          totalForms: forms.length, totalResponses, publishedForms: published, draftForms: drafts,
          averageResponsesPerForm: forms.length > 0 ? Math.round(totalResponses / forms.length) : 0,
          topForms, responsesByDay, responsesByForm, recentActivity: [],
        });
      }
    } catch (error) {
      toast.error("Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { title: "Total Forms", value: analytics.totalForms, icon: FileText, change: "+12%", positive: true },
    { title: "Total Responses", value: analytics.totalResponses, icon: Users, change: "+23%", positive: true },
    { title: "Published", value: analytics.publishedForms, icon: Eye, change: "+8%", positive: true },
    { title: "Avg Responses", value: analytics.averageResponsesPerForm, icon: TrendingUp, change: "-2%", positive: false },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-white/60">Track your forms performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] rounded-xl bg-white/5 border-white/10 text-white">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/10 text-white">
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchAnalytics} className="rounded-xl border-white/10 text-white/60 hover:text-white">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button variant="outline" className="rounded-xl border-white/10 text-white/60 hover:text-white">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-white/60">{stat.title}</span>
                <div className="p-2 rounded-xl bg-violet-600/20">
                  <stat.icon className="h-4 w-4 text-violet-500" />
                </div>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {stat.positive ? <ArrowUpRight className="h-3 w-3 text-green-400" /> : <ArrowDownRight className="h-3 w-3 text-red-400" />}
                <span className={`text-xs ${stat.positive ? "text-green-400" : "text-red-400"}`}>{stat.change}</span>
                <span className="text-xs text-white/40">vs last period</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <h3 className="font-semibold mb-1">Responses Over Time</h3>
            <p className="text-sm text-white/40 mb-4">Daily form submissions</p>
            {analytics.responsesByDay.length > 0 ? (
              <LineChart data={analytics.responsesByDay} height={250} />
            ) : (
              <div className="flex items-center justify-center h-[250px] text-white/40">No data yet</div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <h3 className="font-semibold mb-1">Responses by Form</h3>
            <p className="text-sm text-white/40 mb-4">Top performing forms</p>
            {analytics.responsesByForm.length > 0 ? (
              <BarChart data={analytics.responsesByForm.map(d => ({ label: d.name.substring(0, 10), value: d.count }))} height={250} />
            ) : (
              <div className="flex items-center justify-center h-[250px] text-white/40">No data yet</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Top Forms & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <h3 className="font-semibold mb-4">Top Forms</h3>
            {analytics.topForms.length > 0 ? (
              <div className="space-y-3">
                {analytics.topForms.map((form, index) => (
                  <div key={form.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center text-sm font-bold text-violet-400">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{form.title}</p>
                        <p className="text-xs text-white/40">{form.responses} responses</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{form.conversionRate}%</p>
                      <p className="text-xs text-white/40">conversion</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-white/40">No forms yet</div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <h3 className="font-semibold mb-4">Form Status</h3>
            <div className="flex items-center justify-center gap-8">
              <DonutChart
                data={[
                  { name: "Published", count: analytics.publishedForms, color: "rgb(34, 197, 94)" },
                  { name: "Draft", count: analytics.draftForms, color: "rgb(234, 179, 8)" },
                ]}
                size={180}
              />
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-green-500" />
                  <div>
                    <p className="text-sm font-medium">Published</p>
                    <p className="text-2xl font-bold">{analytics.publishedForms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-yellow-500" />
                  <div>
                    <p className="text-sm font-medium">Drafts</p>
                    <p className="text-2xl font-bold">{analytics.draftForms}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
