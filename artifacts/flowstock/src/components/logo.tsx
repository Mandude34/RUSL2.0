import { cn } from "@/lib/utils";

export function FlowStockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Inventory box — lower-left */}
      <rect x="1" y="13" width="13" height="9.5" rx="1.4" fillOpacity="0.72" />
      <line x1="1" y1="16.2" x2="14" y2="16.2" stroke="black" strokeOpacity="0.11" strokeWidth="1" />
      <line x1="7.5" y1="13" x2="7.5" y2="22.5" stroke="black" strokeOpacity="0.11" strokeWidth="0.85" />

      {/* Chef hat — upper-right, overlapping box corner */}
      {/* Dome: cubic bezier half-ellipse */}
      <path d="M13.5 18.2C13.5 12.6 23 12.6 23 18.2Z" />
      {/* Brim bar */}
      <rect x="12.5" y="17.6" width="11" height="2.9" rx="1.45" />
    </svg>
  );
}

export function FlowStockWordmark({
  className,
  iconClassName,
  textClassName,
}: {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5 font-bold tracking-tight", className)}>
      <FlowStockIcon className={iconClassName} />
      <span className={textClassName}>FlowStock</span>
    </div>
  );
}
