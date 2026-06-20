"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CreditCard, Check, Sparkles, Zap, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    icon: Sparkles,
    features: ["5 AI generations", "Unlimited forms", "100 responses/month", "Basic analytics", "Email support"],
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For professionals and teams",
    icon: Zap,
    popular: true,
    features: ["Unlimited AI", "Unlimited forms", "10,000 responses", "Advanced analytics", "Custom branding", "Priority support", "API access"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$99",
    period: "/month",
    description: "For large organizations",
    icon: Building2,
    popular: false,
    features: ["Everything in Pro", "Unlimited responses", "SSO authentication", "Dedicated support", "Custom integrations", "SLA guarantee"],
  },
];

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState("free");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUserPlan = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setCurrentPlan("free");
      } catch (error) {
        console.error("Error fetching user plan:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getUserPlan();
  }, [supabase.auth]);

  const handleUpgrade = async (planId: string) => {
    setIsUpgrading(planId);
    try {
      toast.info("Billing integration coming soon!");
    } catch (error) {
      toast.error("Failed to process upgrade");
    } finally {
      setIsUpgrading(null);
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-white/60">Manage your subscription and billing</p>
      </div>

      {/* Current Plan */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-600/20">
              <CreditCard className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Current Plan</h3>
              <p className="text-sm text-white/40 capitalize">{currentPlan} Plan</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-sm bg-green-500/20 text-green-400">
            {currentPlan === "free" ? "Free" : "Active"}
          </span>
        </div>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="relative"
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <span className="px-4 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/25">
                  Most Popular
                </span>
              </div>
            )}
            <div className={`h-full rounded-2xl border p-6 ${
              plan.popular
                ? "border-violet-500/50 bg-white/10 shadow-xl shadow-violet-500/10"
                : "border-white/10 bg-white/5"
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-violet-600/20">
                  <plan.icon className="h-5 w-5 text-violet-500" />
                </div>
                <h3 className="text-xl font-semibold">{plan.name}</h3>
              </div>
              <p className="text-white/40 text-sm mb-4">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-white/40">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-violet-500 flex-shrink-0" />
                    <span className="text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full rounded-xl ${
                  plan.popular
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600"
                    : "bg-white/10 hover:bg-white/20"
                }`}
                disabled={currentPlan === plan.id || isUpgrading === plan.id}
                onClick={() => handleUpgrade(plan.id)}
              >
                {isUpgrading === plan.id ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                ) : currentPlan === plan.id ? (
                  "Current Plan"
                ) : (
                  `Upgrade to ${plan.name}`
                )}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Billing History */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center">
        <CreditCard className="h-12 w-12 text-white/20 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Billing History</h3>
        <p className="text-white/40">No billing history yet</p>
      </div>
    </div>
  );
}
