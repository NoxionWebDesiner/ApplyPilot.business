import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2, AlertCircle, Plus, Trash2,
  Trophy, ChevronDown, ChevronUp,
  Star
} from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";
import { AppNavbar } from "@/components/AppNavbar";
import { SignInGate } from "@/components/SignInGate";
import { recommendationConfig } from "@/components/recommendationConfig";

interface RankedCandidate {
  rank: number;
  candidateIndex: number;
  candidateLabel: string;
  candidateName: string | null;
  fitScore: number;
  recommendation: "Strong Hire" | "Hire" | "Maybe" | "No Hire";
  summary: string;
  topStrengths: string[];
  mainGap: string;
  yearsExperience: number;
  seniorityLevel: string;
}

interface MCAResult {
  rankings: RankedCandidate[];
  totalCandidates: number;
  roleTitle: string;
}

const rankColors = ["text-yellow-500", "text-slate-400", "text-amber-600"];
const rankBg = ["bg-yellow-50 border-yellow-200", "bg-slate-50 border-slate-200", "bg-amber-50 border-amber-200"];

function FitBar({ score, bar }: { score: number; bar: string }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-2 bg-black/[0.06] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${bar}`}
        />
      </div>
      <span className="text-sm font-bold text-foreground tabular-nums w-10 text-right">{score}%</span>
    </div>
  );
}

function CandidateCard({ candidate, index }: { candidate: RankedCandidate; index: number }) {
  const [expanded, setExpanded] = useState(index < 3);
  const cfg = recommendationConfig[candidate.recommendation] ?? recommendationConfig["Maybe"];
  const isTopThree = candidate.rank <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${isTopThree ? rankBg[candidate.rank - 1] : "border-black/[0.07]"}`}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg font-display ${isTopThree ? rankColors[candidate.rank - 1] : "text-muted-foreground"} bg-black/[0.04]`}>
            {candidate.rank <= 3 ? (
              <Star className={`w-5 h-5 ${rankColors[candidate.rank - 1]}`} fill="currentColor" />
            ) : (
              <span className="text-base font-bold text-muted-foreground">{candidate.rank}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-bold text-foreground text-base">
                {candidate.candidateLabel}{candidate.candidateName ? ` · ${candidate.candidateName}` : ""}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${cfg.color}`}>
                {cfg.icon} {candidate.recommendation}
              </span>
              <span className="text-xs text-muted-foreground ml-auto">{candidate.seniorityLevel} · ~{candidate.yearsExperience}y exp</span>
            </div>
            <FitBar score={candidate.fitScore} bar={cfg.bar} />
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? "Collapse" : "View details"}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-0 border-t border-black/[0.06] mt-0">
              <p className="text-sm text-muted-foreground leading-relaxed mt-4 mb-3">{candidate.summary}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Top Strengths</div>
                  <ul className="space-y-1">
                    {candidate.topStrengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-sm text-foreground">
                        <span className="text-emerald-500 mt-0.5">✓</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Main Concern</div>
                  <p className="text-sm text-foreground flex items-start gap-1.5">
                    <span className="text-amber-500 mt-0.5">!</span> {candidate.mainGap}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function MCA() {
  const { isLoading, isAuthenticated, login, logout } = useAuth();

  const [jobDescription, setJobDescription] = useState("");
  const [resumes, setResumes] = useState<string[]>(["", ""]);
  const [countInput, setCountInput] = useState("2");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MCAResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetch("/api/credits", { credentials: "include" })
        .then((r) => r.json())
        .then((d: { credits?: number }) => setCredits(d.credits ?? 0))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  function setCount(n: number) {
    const clamped = Math.max(1, Math.min(999, n));
    setResumes((prev) => {
      if (clamped > prev.length) return [...prev, ...Array(clamped - prev.length).fill("")];
      return prev.slice(0, clamped);
    });
  }

  function removeResume(i: number) {
    if (resumes.length > 1) {
      const next = resumes.filter((_, idx) => idx !== i);
      setResumes(next);
      setCountInput(String(next.length));
    }
  }

  function updateResume(i: number, value: string) {
    const next = [...resumes];
    next[i] = value;
    setResumes(next);
  }

  const validCount = resumes.filter((r) => r.trim().length >= 50).length;
  const canSubmit = jobDescription.trim().length >= 30 && validCount >= 2 && resumes.length >= 2;

  async function handleAnalyze() {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/mca", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, resumes }),
      });
      const data = await res.json() as MCAResult & { error?: string; creditsRemaining?: number };
      if (!res.ok || data.error) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setResult(data);
        if (data.creditsRemaining !== undefined) setCredits(data.creditsRemaining);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] font-sans">
      <AppNavbar
        isLoading={isLoading}
        isAuthenticated={isAuthenticated}
        credits={credits}
        onLogout={logout}
        maxWidth="max-w-5xl"
      />

      <main className="max-w-5xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-[13px] font-medium text-foreground/60 mb-5 shadow-sm">
              <Trophy className="w-3.5 h-3.5 text-blue-600" />
              Multiple Candidate Analysis
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground font-display mb-3">
              Rank your candidates instantly
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Paste a job description and up to 999 resumes. AI ranks every candidate by role fit, with hire strength and key insights.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-7 h-7 animate-spin text-muted-foreground" />
            </div>
          ) : !isAuthenticated ? (
            <SignInGate
              title="Sign in to use MCA"
              subtitle="Sign in to start ranking multiple candidates against your job requirements instantly."
              onLogin={login}
            />
          ) : result ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="bg-white rounded-2xl border border-black/[0.07] shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Role</div>
                  <div className="text-xl font-bold font-display text-foreground">{result.roleTitle}</div>
                  <div className="text-sm text-muted-foreground mt-0.5">{result.totalCandidates} candidates evaluated · showing top {result.rankings.length}</div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => { setResult(null); setJobDescription(""); setResumes(["", ""]); }}
                  className="rounded-full border-black/15 hover:bg-black/[0.04] shrink-0"
                >
                  New analysis
                </Button>
              </div>

              <div className="space-y-3">
                {result.rankings.map((candidate, i) => (
                  <CandidateCard key={i} candidate={candidate} index={i} />
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-black/[0.07] shadow-sm p-6">
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <Textarea
                  data-testid="input-job-description"
                  placeholder="Paste the full job description here — the more detail, the more accurate the ranking..."
                  className="min-h-40 text-sm resize-none border-black/10 focus-visible:ring-foreground/20 rounded-xl bg-[#f9fafb]"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
                <div className="mt-1 text-xs text-muted-foreground text-right">{jobDescription.length} chars</div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-foreground">Candidate Resumes</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {validCount} of {resumes.length} ready · minimum 2 to compare
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <label className="text-sm text-muted-foreground font-medium whitespace-nowrap">Number of candidates:</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={countInput}
                      data-testid="input-candidate-count"
                      onChange={(e) => setCountInput(e.target.value.replace(/\D/g, ""))}
                      onBlur={() => {
                        const val = parseInt(countInput, 10);
                        const clamped = isNaN(val) ? 1 : Math.max(1, Math.min(999, val));
                        setCountInput(String(clamped));
                        setCount(clamped);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                      }}
                      className="w-16 h-9 rounded-lg border border-black/15 bg-white text-center text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {resumes.map((resume, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.18 }}
                      className="bg-white rounded-xl border border-black/[0.07] shadow-sm px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-foreground/40 w-5 text-center">{i + 1}</span>
                        {resume.trim().length >= 50 && (
                          <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">✓</span>
                        )}
                        <div className="flex-1" />
                        {resumes.length > 1 && (
                          <button
                            onClick={() => removeResume(i)}
                            className="text-muted-foreground/40 hover:text-red-400 transition-colors"
                            data-testid={`button-remove-candidate-${i}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <Textarea
                        data-testid={`input-resume-${i}`}
                        placeholder={`Candidate ${i + 1} resume...`}
                        className="min-h-20 text-xs resize-y border-black/10 focus-visible:ring-foreground/20 rounded-lg bg-[#f9fafb]"
                        value={resume}
                        onChange={(e) => updateResume(i, e.target.value)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                <button
                  onClick={() => {
                    const next = [...resumes, ""];
                    setResumes(next);
                    setCountInput(String(next.length));
                  }}
                  className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-dashed border-black/15 rounded-xl py-2.5 hover:border-black/30 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add candidate
                </button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 flex items-center gap-3 text-sm"
                  data-testid="error-message"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </motion.div>
              )}

              <Button
                data-testid="button-analyze"
                onClick={handleAnalyze}
                disabled={loading || !canSubmit}
                size="lg"
                className="w-full h-12 rounded-xl text-base bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Ranking {validCount} candidates...
                  </>
                ) : (
                  <>
                    <Trophy className="w-4 h-4 mr-2" />
                    Rank {validCount >= 2 ? validCount : ""} Candidates
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground -mt-1">
                {validCount >= 2
                  ? <>Uses <span className="font-semibold text-foreground">{validCount} credit{validCount !== 1 ? "s" : ""}</span>{credits !== null ? ` · You have ${credits}` : ""}</>
                  : jobDescription.trim().length < 30
                    ? "Add a job description · add at least 2 resumes (50+ chars each)"
                    : `Add at least ${2 - validCount} more resume${2 - validCount > 1 ? "s" : ""} (50+ chars each)`}
              </p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
