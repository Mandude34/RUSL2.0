import { Flag } from "lucide-react";

export function VeteranBadge() {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex items-center gap-2 rounded-full border border-border/50 bg-background/90 px-3 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground shadow-sm backdrop-blur-md transition-colors hover:text-foreground hover:border-border">
      <Flag className="h-3.5 w-3.5" />
      VETERAN OWNED
    </div>
  );
}