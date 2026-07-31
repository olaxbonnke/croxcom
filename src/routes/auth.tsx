import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, type OnboardingDetails } from "@/lib/AuthContext";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowRight, Check, Github, Mail, Sparkles, Terminal, Users, User } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

type AuthPhase = "loading" | "login" | "onboarding";

const TOOLS_LIST = ["PyTorch", "vLLM", "Transformers", "LangChain", "Ollama", "LlamaIndex", "Next.js", "Triton"];
const INTERESTS_LIST = ["RAG & Vector DBs", "Model Fine-Tuning", "Autonomous Agents", "Interpretability", "Synthetic Data", "Evals"];

function AuthPage() {
  const navigate = useNavigate();
  const { isAuthenticated, hasCompletedOnboarding, login, completeOnboarding } = useAuth();
  
  const [phase, setPhase] = useState<AuthPhase>("loading");
  const [email, setEmail] = useState("");
  
  // Onboarding state
  const [selectedTools, setSelectedTools] = useState<string[]>(["PyTorch", "vLLM"]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Autonomous Agents", "RAG & Vector DBs"]);
  const [devPosition, setDevPosition] = useState<"Solo" | "Team">("Team");
  const [teamRole, setTeamRole] = useState("AI Infrastructure Engineer");

  // Step 1: Handle loading animation timeline (2s logo + slide out text)
  useEffect(() => {
    if (phase === "loading") {
      const timer = setTimeout(() => {
        if (!isAuthenticated) {
          setPhase("login");
        } else if (!hasCompletedOnboarding) {
          setPhase("onboarding");
        } else {
          navigate({ to: "/" });
        }
      }, 2800);
      return () => clearTimeout(timer);
    }
  }, [phase, isAuthenticated, hasCompletedOnboarding, navigate]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    login("email", email.trim());
    setPhase("onboarding");
  };

  const handleGithubLogin = () => {
    login("github", "github_dev@croxcom.ai");
    setPhase("onboarding");
  };

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const details: OnboardingDetails = {
      preferences: selectedInterests,
      tools: selectedTools,
      interests: selectedInterests,
      devPosition,
      teamRole: devPosition === "Team" ? teamRole : "Solo Builder",
    };
    completeOnboarding(details);
    navigate({ to: "/" });
  };

  const toggleItem = (list: string[], setList: (l: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8 relative overflow-hidden font-sans">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Grid background effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {/* ── PHASE 1: Loading Screen (Logo 2s + terminal slide out) ── */}
        {phase === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center text-center z-10"
          >
            <div className="flex items-center gap-4">
              <motion.img
                src="/logo.svg"
                alt="CroxCom Logo"
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1.1, rotate: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-20 w-20 shadow-2xl rounded-xl"
              />
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8, ease: "easeInOut" }}
                className="overflow-hidden whitespace-nowrap font-mono text-3xl font-bold tracking-tight text-foreground flex items-center"
              >
                <span className="text-muted-foreground mr-1">{">"}</span>
                croxcom
                <span className="text-primary animate-pulse">_</span>
              </motion.div>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              className="mt-6 font-mono text-xs text-muted-foreground tracking-widest uppercase"
            >
              initializing developer environment...
            </motion.p>
          </motion.div>
        )}

        {/* ── PHASE 2: Login / Sign up Screen ── */}
        {phase === "login" && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md rounded-xl border border-border/80 bg-card/70 p-6 sm:p-8 shadow-2xl backdrop-blur-md z-10"
          >
            <div className="flex items-center justify-between mb-6">
              <Logo size="lg" />
              <span className="font-mono text-xs border border-primary/30 bg-primary/10 text-primary px-2 py-0.5 rounded">
                v0.1.0
              </span>
            </div>

            <div className="mb-6">
              <h1 className="text-xl font-semibold text-foreground">Welcome to CroxCom</h1>
              <p className="text-sm text-muted-foreground mt-1">
                The terminal-inspired community for AI developers.
              </p>
            </div>

            {/* GitHub OAuth */}
            <button
              type="button"
              onClick={handleGithubLogin}
              className="w-full flex items-center justify-center gap-2.5 rounded-lg border border-border bg-background py-2.5 px-4 font-mono text-sm font-medium text-foreground transition-all hover:border-primary hover:bg-accent/40 cursor-pointer shadow-sm mb-4"
            >
              <Github className="h-4 w-4" />
              <span>Continue with GitHub</span>
            </button>

            <div className="relative flex items-center justify-center my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/70" />
              </div>
              <span className="relative bg-card px-3 font-mono text-xs text-muted-foreground uppercase">
                or email
              </span>
            </div>

            {/* Email Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-xs text-muted-foreground mb-1.5">
                  Developer Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ada@voxel.ai"
                    className="w-full rounded-lg border border-border bg-background/80 pl-9 pr-3 py-2 font-mono text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 px-4 font-mono text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 cursor-pointer shadow-md"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-6 text-center font-mono text-xs text-muted-foreground/70">
              By signing in, you agree to our Code of Conduct & Privacy rules.
            </p>
          </motion.div>
        )}

        {/* ── PHASE 3: Onboarding Screen ── */}
        {phase === "onboarding" && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg rounded-xl border border-border/80 bg-card/70 p-6 sm:p-8 shadow-2xl backdrop-blur-md z-10"
          >
            <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2 font-mono text-xs text-primary font-semibold">
                <Terminal className="h-4 w-4" />
                <span>$ croxcom --setup-profile</span>
              </div>
              <span className="font-mono text-xs text-muted-foreground">Step 2/2</span>
            </div>

            <div className="mb-5">
              <h2 className="text-lg font-semibold text-foreground">Tell us about your stack</h2>
              <p className="text-xs text-muted-foreground">
                Personalize your feed and connect with developers building similar tech.
              </p>
            </div>

            <form onSubmit={handleOnboardingSubmit} className="space-y-5">
              {/* Tools Selection */}
              <div>
                <label className="block font-mono text-xs text-muted-foreground mb-2">
                  1. Tools & Frameworks You Use
                </label>
                <div className="flex flex-wrap gap-2">
                  {TOOLS_LIST.map((tool) => {
                    const active = selectedTools.includes(tool);
                    return (
                      <button
                        key={tool}
                        type="button"
                        onClick={() => toggleItem(selectedTools, setSelectedTools, tool)}
                        className={`font-mono text-xs rounded-md px-3 py-1.5 border transition-all cursor-pointer flex items-center gap-1.5 ${
                          active
                            ? "border-primary bg-primary/10 text-primary font-semibold"
                            : "border-border bg-background/50 text-muted-foreground hover:border-muted-foreground"
                        }`}
                      >
                        {active && <Check className="h-3 w-3 stroke-[3]" />}
                        <span>{tool}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interests Selection */}
              <div>
                <label className="block font-mono text-xs text-muted-foreground mb-2">
                  2. Primary AI Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS_LIST.map((interest) => {
                    const active = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleItem(selectedInterests, setSelectedInterests, interest)}
                        className={`font-mono text-xs rounded-md px-3 py-1.5 border transition-all cursor-pointer flex items-center gap-1.5 ${
                          active
                            ? "border-primary bg-primary/10 text-primary font-semibold"
                            : "border-border bg-background/50 text-muted-foreground hover:border-muted-foreground"
                        }`}
                      >
                        {active && <Check className="h-3 w-3 stroke-[3]" />}
                        <span>{interest}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dev Position: Solo or Team */}
              <div>
                <label className="block font-mono text-xs text-muted-foreground mb-2">
                  3. Developer Position
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDevPosition("Solo")}
                    className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 font-mono text-xs transition-all cursor-pointer ${
                      devPosition === "Solo"
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border bg-background/50 text-muted-foreground hover:bg-accent/40"
                    }`}
                  >
                    <User className="h-4 w-4" />
                    <span>Solo Builder</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDevPosition("Team")}
                    className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 font-mono text-xs transition-all cursor-pointer ${
                      devPosition === "Team"
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border bg-background/50 text-muted-foreground hover:bg-accent/40"
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    <span>Team / Lab</span>
                  </button>
                </div>
              </div>

              {/* Conditional Role input if Team */}
              {devPosition === "Team" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                  <label className="block font-mono text-xs text-muted-foreground mb-1">
                    Your Role in Team
                  </label>
                  <input
                    type="text"
                    required
                    value={teamRole}
                    onChange={(e) => setTeamRole(e.target.value)}
                    placeholder="e.g. Senior ML Engineer, Researcher"
                    className="w-full rounded-lg border border-border bg-background/80 px-3 py-2 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </motion.div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 px-4 font-mono text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 cursor-pointer shadow-md mt-6"
              >
                <Sparkles className="h-4 w-4" />
                <span>Complete Setup & Enter CroxCom</span>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
