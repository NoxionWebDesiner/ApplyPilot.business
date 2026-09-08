import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  Briefcase,
  Brain,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";
import { AppNavbar } from "@/components/AppNavbar";
import { SignInGate } from "@/components/SignInGate";
import { recommendationConfig } from "@/components/recommendationConfig";

interface AnalysisResult {
  overallScore: number;
  recommendation: "Strong Hire" | "Hire" | "Maybe" | "No Hire";
  summary: string;
  strengths: string[];
  gaps: string[];
  skills: { technical: string[]; soft: string[] };
  experience: { yearsEstimate: number; seniorityLevel: string; highlights: string[] };
  interviewQuestions: string[];
  fitScore?: number;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#3b82f6" : score >= 30 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="10" />
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-bold font-display text-foreground">{score}</div>
        <div className="text-[10px] text-muted-foreground font-medium">/100</div>
      </div>
    </div>
  );
}

export default function Analyze() {
  const { isLoading, isAuthenticated, login, logout } = useAuth();
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [showJD, setShowJD] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
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

  async function handleAnalyze() {
    if (resumeText.trim().length < 50) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription: jobDescription || undefined }),
      });
      const data = await res.json() as { analysis?: AnalysisResult; error?: string; creditsRemaining?: number };
      if (!res.ok || data.error) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else if (data.analysis) {
        setResult(data.analysis);
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
      />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-[13px] font-medium text-foreground/60 mb-5 shadow-sm">
              <Brain className="w-3.5 h-3.5 text-blue-600" />
              AI Candidate Analysis
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground font-display mb-3">
              Analyze a candidate resume
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Paste a resume and get an instant AI-powered report — score, strengths, gaps, and interview questions.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-7 h-7 animate-spin text-muted-foreground" />
            </div>
          ) : !isAuthenticated ? (
            <SignInGate
              title="Sign in to analyze resumes"
              subtitle="Sign in to start screening candidates with AI."
              onLogin={login}
            />
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-black/[0.07] shadow-sm p-6 mb-5">
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Candidate Resume <span className="text-red-500">*</span>
                </label>
                <Textarea
                  data-testid="input-resume"
                  placeholder="Paste the candidate's full resume text here..."
                  className="min-h-52 text-sm resize-none border-black/10 focus-visible:ring-foreground/20 rounded-xl bg-[#f9fafb]"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
                <div className="mt-1 text-xs text-muted-foreground text-right">{resumeText.length} chars</div>

                <button
                  data-testid="toggle-job-description"
                  onClick={() => setShowJD(!showJD)}
                  className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  {showJD ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {showJD ? "Hide" : "Add"} job description (optional — improves role-specific scoring)
                </button>

                <AnimatePresence>
                  {showJD && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4">
                        <label className="block text-sm font-semibold text-foreground mb-2">Job Description</label>
                        <Textarea
                          data-testid="input-job-description"
                          placeholder="Paste the job description here to get a role-specific fit score..."
                          className="min-h-36 text-sm resize-none border-black/10 focus-visible:ring-foreground/20 rounded-xl bg-[#f9fafb]"
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  data-testid="button-analyze"
                  onClick={handleAnalyze}
                  disabled={loading || resumeText.trim().length < 50}
                  size="lg"
                  className="w-full mt-5 h-12 rounded-xl text-base bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing candidate...
                    </>
                  ) : (
                    "Analyze Resume"
                  )}
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-2">
                  Uses <span className="font-semibold text-foreground">1 credit</span>
                  {credits !== null && ` · You have ${credits}`}
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 flex items-center gap-3 text-sm mb-5"
                  data-testid="error-message"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                  data-testid="analysis-results"
                >
                  <div className="bg-white rounded-2xl border border-black/[0.07] shadow-sm p-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                      <ScoreRing score={result.overallScore} />
                      <div className="flex-1 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-semibold ${recommendationConfig[result.recommendation]?.color ?? "bg-gray-50 text-gray-700 border-gray-200"}`}>
                            <span className={`w-2 h-2 rounded-full ${recommendationConfig[result.recommendation]?.dot ?? "bg-gray-500"}`} />
                            {result.recommendation}
                          </span>
                          {result.fitScore !== undefined && (
                            <span className="text-sm text-muted-foreground font-medium">
                              Role fit: <strong className="text-foreground">{result.fitScore}/100</strong>
                            </span>
                          )}
                        </div>
                        <p className="text-foreground leading-relaxed">{result.summary}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5" />
                            {result.experience.seniorityLevel}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5" />
                            ~{result.experience.yearsEstimate} yrs experience
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl border border-black/[0.07] shadow-sm p-6">
                      <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Strengths
                      </h3>
                      <ul className="space-y-2">
                        {result.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white rounded-2xl border border-black/[0.07] shadow-sm p-6">
                      <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-400" /> Gaps & Risks
                      </h3>
                      <ul className="space-y-2">
                        {result.gaps.map((g, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                            <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                            {g}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-black/[0.07] shadow-sm p-6">
                    <h3 className="font-bold text-foreground mb-4">Skills</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Technical</div>
                        <div className="flex flex-wrap gap-2">
                          {result.skills.technical.map((s, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Soft Skills</div>
                        <div className="flex flex-wrap gap-2">
                          {result.skills.soft.map((s, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-lg bg-foreground/[0.06] text-foreground/70 text-xs font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-black/[0.07] shadow-sm p-6">
                    <h3 className="font-bold text-foreground mb-2">Career Highlights</h3>
                    <ul className="space-y-1.5 mb-5">
                      {result.experience.highlights.map((h, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span> {h}
                        </li>
                      ))}
                    </ul>
                    <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-600" /> Suggested Interview Questions
                    </h3>
                    <ol className="space-y-2">
                      {result.interviewQuestions.map((q, i) => (
                        <li key={i} className="text-sm text-foreground flex items-start gap-2.5">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-foreground/[0.07] text-foreground/60 text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                          {q}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="text-center pt-2 pb-4">
                    <Button
                      data-testid="button-analyze-another"
                      variant="outline"
                      onClick={() => { setResult(null); setResumeText(""); setJobDescription(""); }}
                      className="rounded-full border-black/15 hover:bg-black/[0.04]"
                    >
                      Analyze another candidate
                    </Button>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
