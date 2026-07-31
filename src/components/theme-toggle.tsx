import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { applyTheme, getStoredTheme, setTheme, type Theme } from "@/lib/theme";

export function ThemeToggle() {
  const [theme, setState] = useState<Theme>("dark");

  useEffect(() => {
    const t = getStoredTheme();
    setState(t);
    applyTheme(t);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setState(next);
    setTheme(next);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      onClick={toggle}
      className="rounded-md text-muted-foreground hover:text-foreground"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
