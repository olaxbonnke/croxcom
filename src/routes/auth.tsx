import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, type OnboardingDetails } from "@/lib/AuthContext";
import { isSupabaseConfigured, checkHandleAvailableSupabase } from "@/lib/supabase";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowRight, Check, Github, Mail, Sparkles, Terminal, Users, User, Building2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

type AuthPhase = "loading" | "login" | "check-inbox" | "awaiting-redirect" | "onboarding";

const TOOLS_LIST = [
  "Cursor",
  "Claude",
  "Antigravity",
  "v0",
  "Bolt.new",
  "Windsurf",
  "Supabase",
  "Lovable",
  "Replit",
  "ChatGPT",
  "Ollama",
  "LangChain",
  "Vercel",
];

const INTERESTS_LIST = [
  "Full-Stack Web Apps",
  "Autonomous Agents",
  "Code Generation & Refactoring",
  "RAG & Document QA",
  "Fine-Tuning & Local LLMs",
  "AI Micro-SaaS",
  "Scripting & Automation",
  "UI/UX Design & Prototyping",
];

const ROLE_SUGGESTIONS = [
  "Full-Stack AI Dev",
  "Vibe Coder",
  "Senior ML Engineer",
  "AI Researcher",
  "Founder & Builder",
  "Tech Lead",
];

function AuthPage() {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    hasCompletedOnboarding,
    currentUser,
    login,
    completeOnboarding,
    updateUser,
  } = useAuth();

  const [phase, setPhase] = useState<AuthPhase>("login");
  const [email, setEmail] = useState("");

  // Onboarding state with automatic pre-fill from OAuth/session
  const [displayName, setDisplayName] = useState(() => currentUser?.name || "");
  const [userHandle, setUserHandle] = useState(() => currentUser?.handle || "");
  const [isHandleAvailable, setIsHandleAvailable] = useState<boolean | null>(null);
  const [isCheckingHandle, setIsCheckingHandle] = useState(false);

  const [selectedTools, setSelectedTools] = useState<string[]>(["Cursor", "Claude"]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Full-Stack Web Apps",
    "Autonomous Agents",
  ]);
  const [devPosition, setDevPosition] = useState<"Solo" | "Team">("Solo");
  const [companyName, setCompanyName] = useState("");
  const [teamRole, setTeamRole] = useState("Full-Stack AI Dev");

  // Keep displayName and userHandle pre-filled from currentUser
  useEffect(() => {
    if (currentUser?.name && !displayName) {
      setDisplayName(currentUser.name);
    }
    if (currentUser?.handle && !userHandle) {
      setUserHandle(currentUser.handle);
    }
  }, [currentUser, displayName, userHandle]);

  // Real-time handle availability checker
  useEffect(() => {
    let isMounted = true;
    const clean = userHandle.trim().toLowerCase().replace(/^@/, "");
    if (!clean) {
      setIsHandleAvailable(null);
      return;
    }

    setIsCheckingHandle(true);
    const timer = setTimeout(async () => {
      const free = await checkHandleAvailableSupabase(clean, currentUser?.id);
      if (isMounted) {
        setIsHandleAvailable(free);
        setIsCheckingHandle(false);
      }
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [userHandle, currentUser?.id]);

  // If already authenticated AND completed onboarding, redirect to root feed
  useEffect(() => {
    if (isAuthenticated && hasCompletedOnboarding) {
      navigate({ to: "/", replace: true });
    }
  }, [isAuthenticated, hasCompletedOnboarding, navigate]);

  // Transition to onboarding phase for any authenticated user who has not completed onboarding
  useEffect(() => {
    if (isAuthenticated && !hasCompletedOnboarding) {
      setPhase("onboarding");
    }
  }, [isAuthenticated, hasCompletedOnboarding]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter a valid email address");
      return;
    }
    try {
      await login("email", email.trim());
      if (!isSupabaseConfigured) {
        setPhase("onboarding");
      } else {
        setPhase("check-inbox");
      }
    } catch (err: any) {
      toast.error(err?.message || "Sign-in failed. Please try again.");
    }
  };

  const handleGithubLogin = async () => {
    try {
      await login("github");
      if (!isSupabaseConfigured) {
        setPhase("onboarding");
      } else {
        setPhase("awaiting-redirect");
      }
    } catch (err: any) {
      toast.error(err?.message || "GitHub sign-in failed. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await login("google");
      if (!isSupabaseConfigured) {
        setPhase("onboarding");
      } else {
        setPhase("awaiting-redirect");
      }
    } catch (err: any) {
      toast.error(err?.message || "Google sign-in failed. Please try again.");
    }
  };

  const toggleItem = (list: string[], setList: (l: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isHandleAvailable === false) {
      toast.error("Handle @ " + userHandle + " is already taken. Please choose another handle.");
      return;
    }

    const finalName = displayName.trim() || currentUser?.name || email.split("@")[0] || "AI Developer";
    const finalHandle = (userHandle || currentUser?.handle || email.split("@")[0] || "dev")
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_");

    updateUser({
      name: finalName,
      handle: finalHandle,
    });

    const details: OnboardingDetails = {
      preferences: selectedInterests,
      tools: selectedTools,
      interests: selectedInterests,
      devPosition,
      teamRole: devPosition === "Team" ? teamRole || "Team Member" : "Solo Builder",
      companyName: devPosition === "Team" ? companyName.trim() : undefined,
    };

    completeOnboarding(details);
    toast.success("Profile setup complete! Welcome to CroxCom.");
    navigate({ to: "/", replace: true });
  };

  // 1-Click Quick Entry Skip Option
  const handleSkipOnboarding = () => {
    const finalName = currentUser?.name || displayName.trim() || email.split("@")[0] || "AI Developer";
    const finalHandle = (currentUser?.handle || userHandle || email.split("@")[0] || "dev")
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_");

    updateUser({
      name: finalName,
      handle: finalHandle,
    });

    const details: OnboardingDetails = {
      preferences: selectedInterests.length > 0 ? selectedInterests : ["Full-Stack Web Apps"],
      tools: selectedTools.length > 0 ? selectedTools : ["Cursor", "Claude"],
      interests: selectedInterests.length > 0 ? selectedInterests : ["Full-Stack Web Apps"],
      devPosition: "Solo",
      teamRole: "Solo Builder",
    };

    completeOnboarding(details);
    toast.success("Welcome to CroxCom!");
    navigate({ to: "/", replace: true });
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4 overflow-hidden font-sans select-none">
      {/* Top Bar */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20 max-w-5xl mx-auto">
        <Logo size="md" />
        <ThemeToggle />
      </div>

      {/* Ambient Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,255,159,0.12),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {/* ── PHASE 1: Sign-In Screen ── */}
        {phase === "login" && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md rounded-xl border border-border/80 bg-card/70 p-6 sm:p-8 shadow-2xl backdrop-blur-md z-10"
          >
            <div className="flex items-center gap-2 font-mono text-xs text-primary mb-2 font-semibold">
              <Terminal className="h-4 w-4" />
              <span>$ croxcom --authenticate</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Welcome to CroxCom
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Sign in to share updates, discover models, and connect with AI developers.
            </p>

            {/* Social Logins */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGithubLogin}
                className="flex items-center justify-center gap-2 rounded-lg border border-border bg-background/80 py-2.5 px-4 font-mono text-xs font-medium text-foreground transition-all hover:border-primary/60 hover:bg-accent/40 cursor-pointer shadow-sm"
              >
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </button>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2 rounded-lg border border-border bg-background/80 py-2.5 px-4 font-mono text-xs font-medium text-foreground transition-all hover:border-primary/60 hover:bg-accent/40 cursor-pointer shadow-sm"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google</span>
              </button>
            </div>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border/60" />
              <span className="font-mono text-[10px] uppercase text-muted-foreground/60">
                Or Magic Link
              </span>
              <div className="h-px flex-1 bg-border/60" />
            </div>

            {/* Email Magic Link Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-xs text-muted-foreground mb-1">
                  Developer Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dev@company.com"
                    className="w-full rounded-lg border border-border/80 bg-background/80 pl-9 pr-3 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 px-4 font-mono text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 cursor-pointer shadow-md"
              >
                <span>Send Magic Link</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}

        {/* ── PHASE 2: Check Inbox ── */}
        {phase === "check-inbox" && (
          <motion.div
            key="check-inbox"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md rounded-xl border border-border/80 bg-card/70 p-6 sm:p-8 shadow-2xl backdrop-blur-md z-10 text-center"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/30">
              <Mail className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Check Your Inbox</h2>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              We sent a magic sign-in link to <span className="text-foreground font-mono font-semibold">{email}</span>. Click the link to complete authentication.
            </p>
            <button
              type="button"
              onClick={() => setPhase("login")}
              className="mt-6 font-mono text-xs text-primary hover:underline cursor-pointer"
            >
              ← Back to sign in
            </button>
          </motion.div>
        )}

        {/* ── PHASE 2B: Awaiting OAuth Redirect ── */}
        {phase === "awaiting-redirect" && (
          <motion.div
            key="awaiting-redirect"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md rounded-xl border border-border/80 bg-card/70 p-6 sm:p-8 shadow-2xl backdrop-blur-md z-10 text-center"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/30 animate-pulse">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Redirecting to Provider...</h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Connecting with provider authentication window.
            </p>
          </motion.div>
        )}

        {/* ── PHASE 3: Streamlined Onboarding Screen ── */}
        {phase === "onboarding" && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg rounded-xl border border-border/80 bg-card/70 p-6 sm:p-8 shadow-2xl backdrop-blur-md z-10 max-h-[90vh] overflow-y-auto scrollbar-none"
          >
            <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2 font-mono text-xs text-primary font-semibold">
                <Terminal className="h-4 w-4" />
                <span>$ croxcom --setup-profile</span>
              </div>
              {/* Quick 1-Click Skip Option */}
              <button
                type="button"
                onClick={handleSkipOnboarding}
                className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer underline decoration-dotted underline-offset-4"
              >
                Skip for now →
              </button>
            </div>

            <div className="mb-5">
              <h2 className="text-lg font-semibold text-foreground">
                Developer Profile Setup
              </h2>
              <p className="text-xs text-muted-foreground">
                Pre-filled from your account. Customize or click finish to enter immediately.
              </p>
            </div>

            <form onSubmit={handleOnboardingSubmit} className="space-y-5">
              {/* Identity Section: Editable Display Name & Handle with Real-Time Checker */}
              <div className="rounded-lg border border-border/80 bg-background/50 p-3.5 space-y-3">
                <label className="block font-mono text-xs text-primary font-bold uppercase tracking-wider">
                  Public Identity
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[11px] text-muted-foreground mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-mono text-[11px] text-muted-foreground">
                        Handle (@username)
                      </label>
                      {/* Handle Availability Feedback */}
                      {isCheckingHandle ? (
                        <span className="font-mono text-[10px] text-muted-foreground">checking...</span>
                      ) : isHandleAvailable === true ? (
                        <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
                          <Check className="h-3 w-3" /> available
                        </span>
                      ) : isHandleAvailable === false ? (
                        <span className="font-mono text-[10px] text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> taken
                        </span>
                      ) : null}
                    </div>

                    <div className="relative">
                      <span className="absolute left-3 top-2 font-mono text-sm text-muted-foreground">
                        @
                      </span>
                      <input
                        type="text"
                        value={userHandle}
                        onChange={(e) =>
                          setUserHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                        }
                        placeholder="alex_rivera"
                        className={`w-full rounded-lg border bg-background pl-7 pr-3 py-2 font-mono text-sm text-foreground focus:outline-none ${
                          isHandleAvailable === false
                            ? "border-destructive focus:border-destructive"
                            : "border-border focus:border-primary"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tools & AI Stack Selection (Optional) */}
              <div>
                <label className="block font-mono text-xs text-muted-foreground mb-2">
                  Tools & AI Stack You Use <span className="text-[10px] text-muted-foreground/60">(Optional)</span>
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

              {/* Primary AI Use Cases (Optional) */}
              <div>
                <label className="block font-mono text-xs text-muted-foreground mb-2">
                  Primary AI Use Cases <span className="text-[10px] text-muted-foreground/60">(Optional)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS_LIST.map((interest) => {
                    const active = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() =>
                          toggleItem(selectedInterests, setSelectedInterests, interest)
                        }
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

              {/* Dev Position: Solo or Team / Lab */}
              <div>
                <label className="block font-mono text-xs text-muted-foreground mb-2">
                  Developer Setup <span className="text-[10px] text-muted-foreground/60">(Optional)</span>
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

              {/* Conditional Team Details (Company/Team Name & Editable Role) */}
              {devPosition === "Team" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-3 rounded-lg border border-border/80 bg-background/40 p-3"
                >
                  <div>
                    <label className="block font-mono text-[11px] text-muted-foreground mb-1 flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-primary" /> Company or Team Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme AI Labs / Vibe Studio"
                      className="w-full rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] text-muted-foreground mb-1">
                      Your Role in Team
                    </label>
                    <input
                      type="text"
                      value={teamRole}
                      onChange={(e) => setTeamRole(e.target.value)}
                      placeholder="e.g. Senior ML Engineer"
                      className="w-full rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none mb-2"
                    />
                    {/* Role Suggestions Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {ROLE_SUGGESTIONS.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => setTeamRole(sug)}
                          className={`font-mono text-[10px] rounded px-2 py-0.5 border cursor-pointer transition-colors ${
                            teamRole === sug
                              ? "border-primary text-primary bg-primary/10"
                              : "border-border/60 text-muted-foreground hover:border-primary/40"
                          }`}
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Submit / Finish Button */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={isHandleAvailable === false}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary py-3 px-4 font-mono text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Finish Setup & Enter Feed</span>
                </button>

                <button
                  type="button"
                  onClick={handleSkipOnboarding}
                  className="sm:w-auto px-4 py-3 font-mono text-xs text-muted-foreground hover:text-foreground border border-border/70 rounded-lg bg-background/50 hover:bg-accent/40 transition-colors cursor-pointer"
                >
                  Skip
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
