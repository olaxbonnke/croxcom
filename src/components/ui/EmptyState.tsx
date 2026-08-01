import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="h-12 w-12 rounded-md bg-card border border-border/70 grid place-items-center text-muted-foreground/50 mb-4">
          {icon}
        </div>
      )}
      <div className="font-mono text-xs text-muted-foreground/50 mb-1">~/croxcom $</div>
      <h3 className="text-base font-medium text-foreground">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
