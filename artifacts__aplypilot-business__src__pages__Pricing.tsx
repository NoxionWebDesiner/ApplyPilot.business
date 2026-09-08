import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Luggage, Home as HomeIcon, Target, Trophy, LogIn, LogOut, Loader2 } from "lucide-react";
import { Link, useSearch } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";

const BASE_PRICE = 1.99;

interface Pack {
  analyses: number;
  total: number;
  label: string;
  popular?: boolean;
}

const packs: Pack[] = [
  { analyses: 1,   total: 1.99,   label: "Starter" },
  { analyses: 20,  total: 34.99,  label: "Growth" },
  { analyses: 50,  total: 79.99,  label: "Team" },
  { analyses: 100, total: 139.99, label: "Scale" },
  { analyses: 500, total: 499.99, label: "Enterprise", popular: true },
];

function savingsPct(pack: Pack) {
  const fullPrice = pack.analyses * BASE_PRICE;
  return Math.round((1 - pack.total / fullPrice) * 100);
}

const perks = [
  "Credits never expire",
  "Instant activation after purchase",
  "Works for both Analyze & MCA",
  "Secure checkout via Stripe",
  "No subscription required",
];

function Navbar() {
  const { isLoading, isAuthenticated, login, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/[0.07] bg-white/90 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center text-background">
            <Luggage className="w-4 h-4" />
          </div>
          <span className="font-display font-bold text-[17px] tracking-tight text-foreground">
            ApplyPilot <span className="text-blue-600">Business</span>
          </span>
        </div>

        <nav className="flex items-center gap-1">
          <Link href="/" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-black/[0.05] transition-colors">
            <HomeIcon className="w-4 h-4" /> Home
          </Link>
          <Link href="/mca" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-black/[0.05] transition-colors">
            <Trophy className="w-4 h-4" /> MCA
          </Link>
          <Link href="/analyze" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-black/[0.05] transition-colors">
            <Target className="w-4 h-4" /> Analyze
          </Link>
          <Link href="/pricing" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-foreground bg-black/[0.06] hover:bg-black/[0.09] transition-colors">
            💳 Packs
          </Link>
          {!isLoading && (
            isAuthenticated ? (
              <button
                onClick={logout}
                className="flex items-center gap-1.5 ml-1 text-sm text-muted-foreground hover:text-foreground transition-colors px-2"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            ) : (
              <button
                onClick={login}
                className="flex items-center gap-1.5 ml-1 text-sm font-medium text-foreground bg-foreground/[0.07] hover:bg-foreground/[0.12] px-3 py-1.5 rounded-md transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" /> Log in
              </button>
            )
          )}
        </nav>
      </div>
    </header>
  );
}

export default function Pricing() {
  const { isAuthenticated, login } = useAuth();
  const [loadingPack, setLoadingPack] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const search = useSearch();
  const params = new URLSearchParams(search);
  const successCredits = params.get("success") === "1" ? params.get("credits") : null;

  useEffect(() => {
    if (successCredits) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [successCredits]);

  async function handleBuy(credits: number) {
    if (!isAuthenticated) {
      login();
      return;
    }
    setLoadingPack(credits);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok || data.error) {
        setError(data.error ?? "Checkout failed. Please try again.");
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoadingPack(null);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f6f8] font-sans">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">

          {successCredits && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl px-5 py-4 text-sm font-medium shadow-sm"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              Payment successful! <strong>{successCredits} credit{Number(successCredits) !== 1 ? "s" : ""}</strong> have been added to your account.
            </motion.div>
          )}

          {error && (
            <div className="mb-8 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 text-sm">
              {error}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-foreground/60 tracking-wide uppercase mb-6">
              Credit Packs
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-5 font-display leading-tight">
              Pay only for what you use.
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Buy credits in packs — no subscriptions, no hidden fees. The more you buy, the more you save.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
            {packs.map((pack, i) => {
              const isLoading = loadingPack === pack.analyses;
              return (
                <motion.div
                  key={pack.analyses}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.45 }}
                  className={`relative rounded-2xl border p-6 flex flex-col gap-3 ${
                    pack.popular
                      ? "bg-foreground text-background border-foreground shadow-2xl scale-[1.03]"
                      : "bg-white border-black/[0.08] shadow-sm"
                  }`}
                >
                  {pack.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-bold px-3 py-1 rounded-full tracking-wide whitespace-nowrap">
                      MOST POPULAR
                    </div>
                  )}
                  <div className={`text-xs font-semibold uppercase tracking-widest ${pack.popular ? "text-background/50" : "text-muted-foreground"}`}>
                    {pack.label}
                  </div>
                  <div>
                    <span className={`text-3xl font-bold font-display ${pack.popular ? "text-background" : "text-foreground"}`}>
                      ${pack.total.toFixed(2)}
                    </span>
                  </div>
                  <div className={`text-sm font-medium ${pack.popular ? "text-background/70" : "text-muted-foreground"}`}>
                    {pack.analyses === 1 ? "1 credit" : `${pack.analyses} credits`}
                  </div>
                  <div className={`text-xs ${pack.popular ? "text-background/50" : "text-muted-foreground"}`}>
                    ${(pack.total / pack.analyses).toFixed(2)} / credit
                  </div>
                  {savingsPct(pack) > 0 && (
                    <div className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${
                      pack.popular
                        ? "bg-blue-500 text-white"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    }`}>
                      Save {savingsPct(pack)}%
                    </div>
                  )}
                  <Button
                    size="sm"
                    disabled={isLoading || loadingPack !== null}
                    onClick={() => handleBuy(pack.analyses)}
                    className={`mt-auto rounded-full text-sm font-semibold ${
                      pack.popular
                        ? "bg-white text-foreground hover:bg-white/90"
                        : "bg-foreground text-background hover:bg-foreground/90"
                    }`}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buy Pack"}
                  </Button>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl border border-black/[0.07] shadow-sm p-8 max-w-lg mx-auto text-center"
          >
            <h3 className="font-bold text-lg mb-5 font-display">Every pack includes</h3>
            <ul className="space-y-3 text-left">
              {perks.map((perk) => (
                <li key={perk} className="flex items-center gap-3 text-sm text-foreground/80">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  {perk}
                </li>
              ))}
            </ul>
          </motion.div>

        </div>
      </main>

      <footer className="border-t border-black/[0.07] bg-white py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} ApplyPilot Business. All rights reserved.
      </footer>
    </div>
  );
}
