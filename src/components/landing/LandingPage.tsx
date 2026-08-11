import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowRight, Terminal, Sparkles, Code2, Users, Cpu } from "lucide-react";

export function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-between bg-background px-4 py-8 overflow-hidden font-sans select-none">
      {/* Top Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between z-20">
        <Logo size="md" />
        <div className="flex items-center gap-4">
          <Link
            to="/auth"
            className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
          >
            Log in
          </Link>
          <ThemeToggle />
        </div>
      </div>

      {/* Ambient Radial Mesh & Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,255,159,0.12),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Main Hero Content (Single Viewport) */}
      <main className="flex-1 flex flex-col items-center justify-center text-center max-w-3xl z-10 my-auto py-12 px-4">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs text-primary mb-6 backdrop-blur-sm"
        >
          <Terminal className="h-3.5 w-3.5" />
          <span>croxcom v0.1.0</span>
          <span className="text-primary/40">•</span>
          <span className="text-muted-foreground">AI Developer Network</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.15]"
        >
          A community for AI developers to share updates, resources, and build together
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed font-sans"
        >
          Connect with ML engineers, discover open-source models, discuss research, share bounties, and showcase what you're building.
        </motion.p>

        {/* Feature Highlights Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-6 flex flex-wrap justify-center gap-2 font-mono text-xs text-muted-foreground"
        >
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-card/60 px-2.5 py-1">
            <Cpu className="h-3 w-3 text-primary" /> Model Fine-Tuning
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-card/60 px-2.5 py-1">
            <Sparkles className="h-3 w-3 text-primary" /> Autonomous Agents
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-card/60 px-2.5 py-1">
            <Code2 className="h-3 w-3 text-primary" /> RAG & Vector DBs
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-card/60 px-2.5 py-1">
            <Users className="h-3 w-3 text-primary" /> Dev Bounties
          </span>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-sm"
        >
          <Link
            to="/auth"
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary py-3.5 px-6 font-mono text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20 cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            to="/auth"
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 rounded-lg border border-border bg-card/80 py-3.5 px-5 font-mono text-sm font-medium text-foreground transition-all hover:border-primary/60 hover:bg-accent/40 cursor-pointer"
          >
            <span>Log in</span>
          </Link>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl flex items-center justify-between font-mono text-xs text-muted-foreground/60 z-20 py-2 border-t border-border/30">
        <span>© {new Date().getFullYear()} CroxCom</span>
        <div className="flex items-center gap-4">
          <span className="hover:text-muted-foreground transition-colors cursor-pointer">Terminal UI</span>
          <span>•</span>
          <span className="hover:text-muted-foreground transition-colors cursor-pointer">Open Source</span>
        </div>
      </footer>
    </div>
  );
}
