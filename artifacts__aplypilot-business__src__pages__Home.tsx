import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  Target,
  Zap,
  ShieldCheck,
  Home as HomeIcon,
  BarChart3,
  Trophy,
  LogIn,
  LogOut,
  User,
  Luggage
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";


const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f5f6f8] overflow-hidden font-sans">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ProblemSection />
        <MetricsSection />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}

function Navbar() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();
  const displayName = user?.firstName ?? user?.email ?? "Account";

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
          <Link href="/" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-foreground bg-black/[0.06] hover:bg-black/[0.09] transition-colors">
            <HomeIcon className="w-4 h-4" /> Home
          </Link>
          <Link href="/mca" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-black/[0.05] transition-colors">
            <Trophy className="w-4 h-4" /> MCA
          </Link>
          <Link href="/analyze" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-black/[0.05] transition-colors">
            <Target className="w-4 h-4" /> Analyze
          </Link>
          <Link href="/pricing" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-black/[0.05] transition-colors">
            💳 Packs
          </Link>
          {!isLoading && (
            isAuthenticated ? (
              <div className="flex items-center gap-2 ml-1">
                <button
                  data-testid="nav-btn-logout"
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-black/[0.05] transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            ) : (
              <button
                data-testid="nav-btn-login"
                onClick={login}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-black/[0.05] transition-colors"
              >
                <LogIn className="w-4 h-4" /> Log in
              </button>
            )
          )}
        </nav>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative pt-20 pb-20 md:pt-28 md:pb-28">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3.5 py-1 text-[13px] font-medium text-foreground/70 mb-8 shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            AI-Powered Candidate Screening
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-5xl md:text-[68px] font-extrabold tracking-tight text-foreground mb-6 font-display leading-[1.08]"
          >
            Stop guessing. Start{" "}
            <span className="text-blue-600">hiring right.</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed"
          >
            ApplyPilot Business analyzes every candidate's resume against your job requirements, scores fit with precision, and surfaces the people most likely to succeed in the role — before you read a single CV.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="flex flex-col sm:flex-row gap-3 items-center"
          >
            <Link href="/analyze">
              <Button
                data-testid="hero-cta-start"
                size="lg"
                className="h-13 px-8 text-base rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 bg-foreground text-background hover:bg-foreground/90"
              >
                Get Started <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <section className="py-24 md:py-32 bg-[#f5f6f8]">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <motion.h2 variants={fadeIn} className="text-3xl md:text-5xl font-bold mb-5 font-display">
            Your next great hire is buried in a pile of resumes.
          </motion.h2>
          <motion.p variants={fadeIn} className="text-lg text-muted-foreground leading-relaxed">
            Recruiters spend an average of 7 seconds on each resume. ApplyPilot gives every candidate a fair, thorough evaluation — in milliseconds — so your team only spends time on people who genuinely fit the role.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-5"
        >
          {[
            {
              icon: Target,
              title: "Objective Fit Scoring",
              desc: "Every candidate is scored against your exact job requirements — no unconscious bias, no gut feelings. Just structured, explainable match data."
            },
            {
              icon: Zap,
              title: "Screen Hundreds in Seconds",
              desc: "Upload an entire applicant batch. ApplyPilot returns a ranked shortlist before your first coffee of the morning."
            },
            {
              icon: ShieldCheck,
              title: "Defensible Decisions",
              desc: "Every recommendation comes with detailed reasoning your team can audit, share, and stand behind in any hiring review."
            }
          ].map((feature, i) => (
            <motion.div key={i} variants={fadeIn} className="bg-white border border-black/[0.07] rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-foreground/[0.06] text-foreground flex items-center justify-center mb-5">
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="text-[17px] font-bold mb-2.5 font-display">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function MetricsSection() {
  return (
    <section className="py-20 bg-foreground text-background">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
          {[
            { value: "73%", label: "Faster Shortlisting", delay: 0.1 },
            { value: "4x", label: "Recruiter Capacity", delay: 0.2 },
            { value: "200k+", label: "Candidates Screened", delay: 0.3 },
            { value: "91%", label: "Hiring Manager Satisfaction", delay: 0.4 }
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: stat.delay }}
            >
              <div className="text-4xl md:text-5xl font-bold font-display mb-2">{stat.value}</div>
              <div className="text-background/60 text-sm font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="py-24 md:py-32 bg-[#f5f6f8]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-5xl font-bold mb-5 font-display">
            Hiring teams that switched. Never looked back.
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            From in-house talent teams to enterprise HR departments, ApplyPilot Business changes the way companies find and hire.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              quote: "We were drowning in 400+ applications for a single engineering role. ApplyPilot had a top-10 shortlist ready in under 3 minutes. Every one of them was genuinely strong.",
              author: "Marcus T.",
              role: "Head of Engineering Talent",
              company: "Series B Startup"
            },
            {
              quote: "The scorecard feature alone has cut our panel prep time in half. Every interviewer walks in knowing exactly what to probe for on each candidate.",
              author: "Priya N.",
              role: "VP of People",
              company: "Global SaaS Company"
            },
            {
              quote: "We used to miss good candidates because their resume was badly formatted. ApplyPilot evaluates substance over style — we've made two great hires we would have filtered out manually.",
              author: "James O.",
              role: "Talent Acquisition Director",
              company: "Financial Services Firm"
            }
          ].map((test, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-black/[0.07] rounded-2xl p-7 shadow-sm"
            >
              <div className="flex text-blue-600 mb-5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-foreground text-sm leading-relaxed mb-5">"{test.quote}"</p>
              <div>
                <div className="font-bold text-sm">{test.author}</div>
                <div className="text-xs text-muted-foreground">{test.role} at {test.company}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="py-24 md:py-32 bg-white border-t border-black/[0.07]">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-foreground text-background rounded-3xl p-10 md:p-16 text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-5 font-display">
            Your next great hire is one upload away.
          </h2>
          <p className="text-background/60 mb-9 leading-relaxed max-w-xl mx-auto">
            Stop spending hours on resumes that don't make the cut. Let ApplyPilot do the heavy lifting — so your team focuses on conversations, not screening.
          </p>
          <Button
            data-testid="cta-btn-trial"
            size="lg"
            className="h-13 px-9 text-base rounded-full bg-white text-foreground hover:bg-white/90 shadow-none transition-all hover:-translate-y-0.5"
          >
            Get Started <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-black/[0.07] bg-[#f5f6f8] py-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center text-background">
                <Luggage className="w-3.5 h-3.5" />
              </div>
              <span className="font-display font-bold text-[15px] text-foreground">
                ApplyPilot <span className="text-blue-600">Business</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered resume screening and candidate intelligence for modern hiring teams.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">Resume Screening</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Fit Scoring</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Pipeline Analytics</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">ATS Integrations</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">GDPR</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Security</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-black/[0.07] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ApplyPilot Business. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built to help great companies find great people.
          </p>
        </div>
      </div>
    </footer>
  );
}
