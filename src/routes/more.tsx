import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/AuthContext";
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Download,
  Eye,
  EyeOff,
  Globe,
  HelpCircle,
  Info,
  Key,
  Languages,
  Lock,
  LogOut,
  Mail,
  Monitor,
  Moon,
  Shield,
  Smartphone,
  Sparkles,
  Star,
  Trash2,
  User,
  UserMinus,
  UserX,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

export const Route = createFileRoute("/more")({
  component: MorePage,
});

export function MorePage() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<"about" | "deactivate" | null>(null);

  // Toggle states for settings
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [qualityFilter, setQualityFilter] = useState(true);
  const [sensitiveContent, setSensitiveContent] = useState(false);
  const [dmPrivacy, setDmPrivacy] = useState<"everyone" | "followers">("followers");
  const [discoverByEmail, setDiscoverByEmail] = useState(true);
  const [discoverByPhone, setDiscoverByPhone] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState<"default" | "large" | "xl">("default");
  const [language, setLanguage] = useState("en");

  // Apply font size DOM effect
  useEffect(() => {
    const sizeMap: Record<string, string> = { default: "16px", large: "18px", xl: "20px" };
    document.documentElement.style.fontSize = sizeMap[fontSize] || "16px";
  }, [fontSize]);

  // Apply reduced motion DOM effect
  useEffect(() => {
    if (reducedMotion) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }
  }, [reducedMotion]);

  // Apply html lang DOM effect
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const handleLogout = () => {
    logout();
    navigate({ to: "/auth" });
  };

  const toggleSection = (section: string) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  const initials = currentUser.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <AppShell>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border/70 bg-background/80 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() =>
            window.history.length > 1 ? window.history.back() : navigate({ to: "/" })
          }
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-base font-semibold text-foreground">Settings & Preferences</h1>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>

      {/* User Card */}
      <Link
        to="/profile"
        className="flex items-center gap-3 border-b border-border/70 px-4 py-4 transition-colors hover:bg-accent/20"
      >
        <div
          className="grid h-12 w-12 shrink-0 place-items-center rounded-lg font-mono text-sm overflow-hidden"
          style={{ background: currentUser.avatarColor, color: "#0a0a0a" }}
        >
          {currentUser.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground">{currentUser.name}</p>
          <p className="font-mono text-xs text-muted-foreground">@{currentUser.handle}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
      </Link>

      {/* ─── 1. YOUR ACCOUNT ─── */}
      <SettingsSection
        title="Your Account"
        icon={<User className="h-4 w-4" />}
        isOpen={expandedSection === "account"}
        onToggle={() => toggleSection("account")}
      >
        <SettingsRow
          icon={<User className="h-4 w-4 text-muted-foreground" />}
          label="Account information"
          description="View your username, handle, role, and account ID"
        >
          <div className="mt-2 space-y-1.5 pl-7 font-mono text-xs text-muted-foreground">
            <div><span className="text-foreground font-semibold">Name:</span> {currentUser.name}</div>
            <div><span className="text-foreground font-semibold">Handle:</span> @{currentUser.handle}</div>
            <div><span className="text-foreground font-semibold">Role:</span> {currentUser.role || "Developer"}</div>
            <div><span className="text-foreground font-semibold">Account ID:</span> <span className="text-[10px] opacity-70">{currentUser.id}</span></div>
          </div>
        </SettingsRow>
        <SettingsRow
          icon={<Key className="h-4 w-4 text-muted-foreground" />}
          label="Change password"
          description="Update your password"
        >
          <div className="mt-2 space-y-2 pl-7">
            <input
              type="password"
              placeholder="Current password"
              className="w-full rounded-md border border-border/70 bg-card/60 px-3 py-1.5 font-mono text-xs text-foreground focus:border-primary/60 focus:outline-none"
            />
            <input
              type="password"
              placeholder="New password"
              className="w-full rounded-md border border-border/70 bg-card/60 px-3 py-1.5 font-mono text-xs text-foreground focus:border-primary/60 focus:outline-none"
            />
            <button className="rounded-md bg-primary px-3 py-1.5 font-mono text-xs text-primary-foreground hover:opacity-90">
              Update password
            </button>
          </div>
        </SettingsRow>
        <SettingsRow
          icon={<Download className="h-4 w-4 text-muted-foreground" />}
          label="Download your data"
          description="Request a copy of your CroxCom data"
        >
          <div className="mt-2 pl-7">
            <button className="rounded-md border border-border px-3 py-1.5 font-mono text-xs text-foreground hover:border-primary hover:text-primary transition-colors">
              Request archive
            </button>
          </div>
        </SettingsRow>
        <SettingsRow
          icon={<Trash2 className="h-4 w-4 text-destructive" />}
          label="Deactivate account"
          description="Temporarily disable your account"
          onClick={() => setActiveModal("deactivate")}
          danger
        />
      </SettingsSection>

      {/* ─── 2. PREMIUM ─── */}
      <SettingsSection
        title="Premium"
        icon={<Star className="h-4 w-4 text-accent-orange" />}
        isOpen={expandedSection === "premium"}
        onToggle={() => toggleSection("premium")}
      >
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-accent-orange" />
            <span className="font-mono text-xs text-accent-orange font-semibold border border-accent-orange/30 bg-accent-orange/10 px-2 py-0.5 rounded">
              PRO
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Unlock advanced analytics, priority support, verified badge, and longer posts.
          </p>
          <Link
            to="/premium"
            className="inline-block rounded-md bg-primary px-4 py-2 font-mono text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            View Premium Plans
          </Link>
        </div>
      </SettingsSection>

      {/* ─── 3. SECURITY AND ACCOUNT ACCESS ─── */}
      <SettingsSection
        title="Security and Account Access"
        icon={<Shield className="h-4 w-4" />}
        isOpen={expandedSection === "security"}
        onToggle={() => toggleSection("security")}
      >
        <SettingsToggle
          icon={<Lock className="h-4 w-4 text-muted-foreground" />}
          label="Two-factor authentication"
          description="Add an extra layer of security"
          enabled={twoFactorEnabled}
          onToggle={() => setTwoFactorEnabled(!twoFactorEnabled)}
        />
        <SettingsRow
          icon={<Smartphone className="h-4 w-4 text-muted-foreground" />}
          label="Connected apps"
          description="Manage apps connected to your account"
        >
          <div className="mt-2 pl-7 font-mono text-xs text-muted-foreground">No connected apps</div>
        </SettingsRow>
        <SettingsRow
          icon={<Monitor className="h-4 w-4 text-muted-foreground" />}
          label="Login activity"
          description="Review recent login sessions"
        >
          <div className="mt-2 pl-7 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground">Windows · Chrome</span>
              <span className="font-mono text-muted-foreground">Active now</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">iPhone · Safari</span>
              <span className="font-mono text-muted-foreground">2 days ago</span>
            </div>
          </div>
        </SettingsRow>
        <SettingsRow
          icon={<Key className="h-4 w-4 text-muted-foreground" />}
          label="Password & security"
          description="Manage password recovery options"
        />
      </SettingsSection>

      {/* ─── 4. PRIVACY AND SAFETY ─── */}
      <SettingsSection
        title="Privacy and Safety"
        icon={<EyeOff className="h-4 w-4" />}
        isOpen={expandedSection === "privacy"}
        onToggle={() => toggleSection("privacy")}
      >
        <SettingsRow
          icon={<Eye className="h-4 w-4 text-muted-foreground" />}
          label="Audience and tagging"
          description="Control who can see your posts and tag you"
        >
          <div className="mt-2 pl-7 space-y-2">
            <label className="flex items-center justify-between text-xs">
              <span className="text-foreground">Protect your posts</span>
              <ToggleSwitch enabled={false} onToggle={() => {}} />
            </label>
            <label className="flex items-center justify-between text-xs">
              <span className="text-foreground">Allow photo tagging</span>
              <ToggleSwitch enabled={true} onToggle={() => {}} />
            </label>
          </div>
        </SettingsRow>
        <SettingsToggle
          icon={<Eye className="h-4 w-4 text-muted-foreground" />}
          label="Sensitive content"
          description="Show media that may contain sensitive content"
          enabled={sensitiveContent}
          onToggle={() => setSensitiveContent(!sensitiveContent)}
        />
        <SettingsRow
          icon={<UserMinus className="h-4 w-4 text-muted-foreground" />}
          label="Mute and block"
          description="Manage muted and blocked accounts"
        >
          <div className="mt-2 pl-7 font-mono text-xs text-muted-foreground">
            No muted or blocked accounts
          </div>
        </SettingsRow>
        <SettingsRow
          icon={<Mail className="h-4 w-4 text-muted-foreground" />}
          label="Direct Messages"
          description="Control who can message you"
        >
          <div className="mt-2 pl-7 space-y-1.5">
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="radio"
                name="dm-privacy"
                checked={dmPrivacy === "everyone"}
                onChange={() => setDmPrivacy("everyone")}
                className="accent-primary"
              />
              <span className="text-foreground">Everyone</span>
            </label>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="radio"
                name="dm-privacy"
                checked={dmPrivacy === "followers"}
                onChange={() => setDmPrivacy("followers")}
                className="accent-primary"
              />
              <span className="text-foreground">Only people you follow</span>
            </label>
          </div>
        </SettingsRow>
        <SettingsRow
          icon={<Globe className="h-4 w-4 text-muted-foreground" />}
          label="Discoverability"
          description="Control how people find you"
        >
          <div className="mt-2 pl-7 space-y-2">
            <label className="flex items-center justify-between text-xs">
              <span className="text-foreground">Find by email address</span>
              <ToggleSwitch
                enabled={discoverByEmail}
                onToggle={() => setDiscoverByEmail(!discoverByEmail)}
              />
            </label>
            <label className="flex items-center justify-between text-xs">
              <span className="text-foreground">Find by phone number</span>
              <ToggleSwitch
                enabled={discoverByPhone}
                onToggle={() => setDiscoverByPhone(!discoverByPhone)}
              />
            </label>
          </div>
        </SettingsRow>
      </SettingsSection>

      {/* ─── 5. NOTIFICATIONS ─── */}
      <SettingsSection
        title="Notifications"
        icon={<Bell className="h-4 w-4" />}
        isOpen={expandedSection === "notifications"}
        onToggle={() => toggleSection("notifications")}
      >
        <SettingsRow
          icon={<Bell className="h-4 w-4 text-muted-foreground" />}
          label="Filters and preferences"
          description="Choose what notifications you receive"
          onClick={() => navigate({ to: "/notifications" })}
        />
        <SettingsToggle
          icon={<Smartphone className="h-4 w-4 text-muted-foreground" />}
          label="Push notifications"
          description="Receive push notifications on this device"
          enabled={pushNotifications}
          onToggle={() => setPushNotifications(!pushNotifications)}
        />
        <SettingsToggle
          icon={<Mail className="h-4 w-4 text-muted-foreground" />}
          label="Email notifications"
          description="Get notified via email"
          enabled={emailNotifications}
          onToggle={() => setEmailNotifications(!emailNotifications)}
        />
        <SettingsToggle
          icon={<VolumeX className="h-4 w-4 text-muted-foreground" />}
          label="Quality filter"
          description="Filter lower-quality notifications"
          enabled={qualityFilter}
          onToggle={() => setQualityFilter(!qualityFilter)}
        />
        <SettingsRow
          icon={<Volume2 className="h-4 w-4 text-muted-foreground" />}
          label="Muted notifications"
          description="Manage muted notification types"
        />
      </SettingsSection>

      {/* ─── 6. ACCESSIBILITY, DISPLAY AND LANGUAGES ─── */}
      <SettingsSection
        title="Accessibility, Display and Languages"
        icon={<Monitor className="h-4 w-4" />}
        isOpen={expandedSection === "display"}
        onToggle={() => toggleSection("display")}
      >
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
          <div className="flex items-center gap-3 text-sm text-foreground">
            <Moon className="h-4 w-4 text-muted-foreground" />
            <div>
              <span>Appearance</span>
              <p className="text-xs text-muted-foreground">Toggle dark/light mode</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
        <SettingsRow
          icon={<Languages className="h-4 w-4 text-muted-foreground" />}
          label="Language"
          description="Choose your display language"
        >
          <div className="mt-2 pl-7">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-md border border-border/70 bg-card/60 px-3 py-1.5 font-mono text-xs text-foreground focus:border-primary/60 focus:outline-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語</option>
              <option value="zh">中文</option>
            </select>
          </div>
        </SettingsRow>
        <SettingsToggle
          icon={<Monitor className="h-4 w-4 text-muted-foreground" />}
          label="Reduce motion"
          description="Minimize animations and transitions"
          enabled={reducedMotion}
          onToggle={() => setReducedMotion(!reducedMotion)}
        />
      </SettingsSection>

      {/* ─── 7. HELP CENTER ─── */}
      <SettingsSection
        title="Help Center"
        icon={<HelpCircle className="h-4 w-4" />}
        isOpen={expandedSection === "help"}
        onToggle={() => toggleSection("help")}
      >
        <SettingsRow
          icon={<HelpCircle className="h-4 w-4 text-muted-foreground" />}
          label="Help articles"
          description="Find answers to common questions"
        />
        <SettingsRow
          icon={<Mail className="h-4 w-4 text-muted-foreground" />}
          label="Contact support"
          description="Get help from the CroxCom team"
        />
        <SettingsRow
          icon={<Info className="h-4 w-4 text-muted-foreground" />}
          label="About CroxCom"
          description="Version info and credits"
          onClick={() => setActiveModal("about")}
        />
      </SettingsSection>

      {/* Log out Button */}
      <button
        onClick={handleLogout}
        className="flex w-full items-center gap-3 px-4 py-3 text-sm font-mono text-destructive transition-colors hover:bg-destructive/10 mt-6 border-y border-border/60 cursor-pointer"
      >
        <LogOut className="h-4 w-4" />
        <span>$ croxcom --logout</span>
      </button>

      {/* Footer */}
      <div className="px-4 py-8 text-center font-mono text-[10px] text-muted-foreground/50">
        CroxCom v0.1.0 — terminal community for AI builders
      </div>

      {/* ── DEACTIVATE CONFIRMATION MODAL ── */}
      {activeModal === "deactivate" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border/80 bg-background p-5 shadow-2xl space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-destructive font-bold">$ account --deactivate</span>
              <button
                onClick={() => setActiveModal(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-foreground text-sm leading-relaxed">
              Are you sure you want to deactivate your account? Your profile will be hidden and your
              posts will no longer be visible.
            </p>
            <div className="rounded bg-destructive/10 p-2 text-[11px] text-destructive">
              ⚠ This action can be reversed by logging in again within 30 days.
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 rounded-md border border-border py-2 text-muted-foreground hover:bg-accent cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  handleLogout();
                }}
                className="flex-1 rounded-md bg-destructive py-2 text-destructive-foreground font-bold cursor-pointer"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ABOUT MODAL ── */}
      {activeModal === "about" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border/80 bg-background p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-2 font-mono text-xs">
              <span className="text-primary font-bold">$ croxcom --version</span>
              <button
                onClick={() => setActiveModal(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-foreground">CroxCom AI Developer Community</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Designed for ML engineers, researchers, and AI developers to collaborate, share code
              snippets, run evaluations, and exchange visual prompts.
            </p>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full font-mono text-xs rounded bg-primary py-2 text-primary-foreground font-bold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SettingsSection({
  title,
  icon,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border/60">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-foreground hover:bg-accent/20 transition-colors cursor-pointer"
      >
        <span className="text-accent-purple">{icon}</span>
        <span className="flex-1 text-left font-medium">{title}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && <div className="border-t border-border/40 bg-card/30">{children}</div>}
    </div>
  );
}

function SettingsRow({
  icon,
  label,
  description,
  onClick,
  danger,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick?: () => void;
  danger?: boolean;
  children?: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const isExpandable = !!children && !onClick;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (isExpandable) {
      setExpanded(!expanded);
    }
  };

  return (
    <div className="border-b border-border/30">
      <button
        onClick={handleClick}
        className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-accent/20 text-left cursor-pointer ${
          danger ? "text-destructive" : "text-foreground"
        }`}
      >
        {icon}
        <div className="flex-1 min-w-0">
          <span className={danger ? "text-destructive" : ""}>{label}</span>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        {(onClick || isExpandable) && (
          <ChevronRight
            className={`h-4 w-4 text-muted-foreground/40 transition-transform ${expanded ? "rotate-90" : ""}`}
          />
        )}
      </button>
      {expanded && children && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}

function SettingsToggle({
  icon,
  label,
  description,
  enabled,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-border/30 px-4 py-3">
      {icon}
      <div className="flex-1 min-w-0">
        <span className="text-sm text-foreground">{label}</span>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <ToggleSwitch enabled={enabled} onToggle={onToggle} />
    </div>
  );
}

function ToggleSwitch({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
        enabled ? "bg-primary" : "bg-border"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
          enabled ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
