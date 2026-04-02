import { ReactNode } from "react";
import { Sidebar, MobileNav } from "./sidebar";
import { FlowStockIcon } from "@/components/logo";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] w-full bg-background font-sans">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-card px-4 sm:px-6 lg:px-8 sticky top-0 z-30 lg:hidden shadow-xs">
          <MobileNav />
          <div className="flex flex-1 items-center justify-end gap-4">
            <div className="flex items-center gap-2 font-bold tracking-tight text-primary">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                <FlowStockIcon className="h-3.5 w-3.5" />
              </div>
              FlowStock
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background pb-16">
          <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
