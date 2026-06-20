"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Save, Loader2, Shield, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { toast } from "sonner";

export default function SettingsPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setName(user.user_metadata?.name || "");
        setEmail(user.email || "");
      }
      setIsLoading(false);
    };
    getUser();
  }, [supabase.auth]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { name } });
      if (error) throw error;
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
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
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-white/60">Manage your account settings</p>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-600/20">
                <User className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Profile</h2>
                <p className="text-sm text-white/40">Update your personal information</p>
              </div>
            </div>
          </div>
          <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-white/80">Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80">Email</Label>
              <Input
                value={email}
                disabled
                className="rounded-xl bg-white/5 border-white/10 text-white/50"
              />
              <p className="text-xs text-white/40">Email cannot be changed</p>
            </div>
            <Button type="submit" disabled={isSaving} className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600">
              {isSaving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> Save Changes</>
              )}
            </Button>
          </form>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-xl overflow-hidden">
          <div className="p-6 border-b border-red-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-600/20">
                <Shield className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Danger Zone</h2>
                <p className="text-sm text-white/40">Irreversible actions</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-red-400">Delete Account</h3>
                <p className="text-sm text-white/40">Permanently delete your account and all data</p>
              </div>
              <Button variant="outline" className="rounded-xl border-red-500/30 text-red-400 hover:bg-red-500/10">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
