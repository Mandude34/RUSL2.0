import { ReactNode } from "react";
import { Sidebar, MobileNav } from "./sidebar";
import { ChefHat } from "lucide-react";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] w-full bg-background font-sans">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-card/50 px-4 sm:px-6 lg:px-8 backdrop-blur-md sticky top-0 z-30 lg:hidden">
          <MobileNav />
          <div className="flex flex-1 items-center justify-end gap-4">
            <div className="flex items-center gap-2 font-bold tracking-tight text-primary">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                <ChefHat className="h-3 w-3" />
              </div>
              FlowStock
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-muted/20 pb-16">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}