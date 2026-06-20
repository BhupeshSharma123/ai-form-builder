"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  FileText,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Copy,
  BarChart3,
  Users,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Form {
  id: string;
  title: string;
  description: string;
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  responses_count: number;
  created_at: string;
  updated_at: string;
}

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [filteredForms, setFilteredForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const supabase = createClient();

  useEffect(() => {
    fetchForms();
  }, []);

  useEffect(() => {
    filterForms();
  }, [forms, searchQuery, statusFilter]);

  const fetchForms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("forms")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false });
        if (error) throw error;
        setForms(data || []);
      }
    } catch (error: any) {
      toast.error("Failed to fetch forms");
    } finally {
      setIsLoading(false);
    }
  };

  const filterForms = () => {
    let filtered = [...forms];
    if (searchQuery) {
      filtered = filtered.filter(f => f.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(f => f.status === statusFilter);
    }
    setFilteredForms(filtered);
  };

  const handleDelete = async (formId: string) => {
    if (!confirm("Are you sure you want to delete this form?")) return;
    try {
      const { error } = await supabase.from("forms").delete().eq("id", formId);
      if (error) throw error;
      setForms(forms.filter(f => f.id !== formId));
      toast.success("Form deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete form");
    }
  };

  const handleDuplicate = async (form: Form) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: originalForm } = await supabase.from("forms").select("*").eq("id", form.id).single();
      if (originalForm) {
        const { error } = await supabase.from("forms").insert({
          title: `${form.title} (Copy)`,
          description: originalForm.description,
          sections: originalForm.sections,
          settings: originalForm.settings,
          status: "DRAFT",
          user_id: user.id,
        });
        if (error) throw error;
        toast.success("Form duplicated successfully");
        fetchForms();
      }
    } catch (error: any) {
      toast.error("Failed to duplicate form");
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED": return "bg-green-500/20 text-green-400";
      case "DRAFT": return "bg-yellow-500/20 text-yellow-400";
      case "CLOSED": return "bg-gray-500/20 text-gray-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Forms</h1>
          <p className="text-white/60">Manage and organize your forms</p>
        </div>
        <Link href="/dashboard/create">
          <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500">
            <Plus className="mr-2 h-4 w-4" />
            Create Form
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            placeholder="Search forms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] rounded-xl bg-white/5 border-white/10 text-white">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-white/10 text-white">
            <SelectItem value="all">All Forms</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="DRAFT">Drafts</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Forms Grid */}
      {filteredForms.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-12 text-center">
          <FileText className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery || statusFilter !== "all" ? "No forms found" : "No forms yet"}
          </h3>
          <p className="text-white/60 mb-4">
            {searchQuery || statusFilter !== "all" ? "Try adjusting your search or filters" : "Create your first form with AI in seconds"}
          </p>
          {!searchQuery && statusFilter === "all" && (
            <Link href="/dashboard/create">
              <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Form
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredForms.map((form, index) => (
            <motion.div
              key={form.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 hover:bg-white/10 transition-all h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{form.title}</h3>
                    <p className="text-sm text-white/40 truncate mt-1">{form.description || "No description"}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-gray-900 border-white/10 text-white">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/forms/${form.id}`}><Eye className="mr-2 h-4 w-4" /> View</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/forms/${form.id}/edit`}><Edit className="mr-2 h-4 w-4" /> Edit</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(form)}>
                        <Copy className="mr-2 h-4 w-4" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/forms/${form.id}/responses`}><BarChart3 className="mr-2 h-4 w-4" /> Responses</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem onClick={() => handleDelete(form.id)} className="text-red-400 focus:text-red-400">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex-1" />
                <div className="flex items-center justify-between text-sm text-white/40 mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(form.status)}`}>
                      {form.status.charAt(0).toUpperCase() + form.status.slice(1).toLowerCase()}
                    </span>
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {form.responses_count || 0}
                    </span>
                  </div>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(form.updated_at)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
