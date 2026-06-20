"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Users,
  BarChart3,
  Sparkles,
  Plus,
  TrendingUp,
  Clock,
  Eye,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface DashboardStats {
  totalForms: number;
  totalResponses: number;
  publishedForms: number;
  draftForms: number;
  aiCreditsRemaining: number;
}

interface RecentForm {
  id: string;
  title: string;
  status: string;
  responsesCount: number;
  updatedAt: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalForms: 0,
    totalResponses: 0,
    publishedForms: 0,
    draftForms: 0,
    aiCreditsRemaining: 50,
  });
  const [recentForms, setRecentForms] = useState<RecentForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: forms } = await supabase
            .from("forms")
            .select("*")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false })
            .limit(5);

          if (forms) {
            const published = forms.filter(f => f.status === "PUBLISHED").length;
            const drafts = forms.filter(f => f.status === "DRAFT").length;
            const totalResponses = forms.reduce((acc, f) => acc + (f.responses_count || 0), 0);

            setStats({
              totalForms: forms.length,
              totalResponses,
              publishedForms: published,
              draftForms: drafts,
              aiCreditsRemaining: 50,
            });

            setRecentForms(forms.map(f => ({
              id: f.id,
              title: f.title,
              status: f.status,
              responsesCount: f.responses_count || 0,
              updatedAt: f.updated_at,
            })));
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [supabase]);

  const statCards = [
    { title: "Total Forms", value: stats.totalForms, icon: FileText, color: "from-violet-600/20 to-violet-600/5", iconColor: "text-violet-500" },
    { title: "Total Responses", value: stats.totalResponses, icon: Users, color: "from-fuchsia-600/20 to-fuchsia-600/5", iconColor: "text-fuchsia-500" },
    { title: "Published", value: stats.publishedForms, icon: TrendingUp, color: "from-green-600/20 to-green-600/5", iconColor: "text-green-500" },
    { title: "AI Credits", value: stats.aiCreditsRemaining, icon: Sparkles, color: "from-amber-600/20 to-amber-600/5", iconColor: "text-amber-500" },
  ];

  const quickActions = [
    { title: "New AI Form", description: "Generate with AI", icon: Sparkles, href: "/dashboard/create", gradient: "from-violet-600 to-fuchsia-600" },
    { title: "Blank Form", description: "Start from scratch", icon: Plus, href: "/dashboard/create?mode=blank", gradient: "from-cyan-600 to-blue-600" },
    { title: "Templates", description: "Use a template", icon: FileText, href: "/dashboard/templates", gradient: "from-green-600 to-emerald-600" },
    { title: "Analytics", description: "View insights", icon: BarChart3, href: "/dashboard/analytics", gradient: "from-orange-600 to-red-600" },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

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
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-white/60 mt-1">Welcome back! Here's an overview of your forms.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-white/60">{stat.title}</span>
                <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="text-3xl font-bold">{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
            >
              <Link href={action.href}>
                <div className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 hover:bg-white/10 transition-all cursor-pointer">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold">{action.title}</h3>
                  <p className="text-sm text-white/60">{action.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Forms */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Forms</h2>
          <Link href="/dashboard/forms">
            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        {recentForms.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-12 text-center">
            <FileText className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No forms yet</h3>
            <p className="text-white/60 mb-4">Create your first form with AI in seconds</p>
            <Link href="/dashboard/create">
              <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600">
                <Sparkles className="mr-2 h-4 w-4" />
                Create Your First Form
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentForms.map((form, index) => (
              <motion.div
                key={form.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
              >
                <Link href={`/dashboard/forms/${form.id}`}>
                  <div className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 hover:bg-white/10 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-xl bg-violet-600/20">
                          <FileText className="h-5 w-5 text-violet-500" />
                        </div>
                        <div>
                          <h3 className="font-medium">{form.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-white/40">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              form.status === "PUBLISHED" ? "bg-green-500/20 text-green-400" :
                              form.status === "DRAFT" ? "bg-yellow-500/20 text-yellow-400" :
                              "bg-gray-500/20 text-gray-400"
                            }`}>
                              {form.status.charAt(0).toUpperCase() + form.status.slice(1).toLowerCase()}
                            </span>
                            <span className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {form.responsesCount}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDate(form.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="h-4 w-4 text-white/60" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
