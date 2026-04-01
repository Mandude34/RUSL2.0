import { ReactNode } from "react";
import { Sidebar, MobileNav } from "./sidebar";
import { ChefHat, Building2 } from "lucide-react";
import { Link } from "wouter";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] w-full bg-background font-sans">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-card/50 px-4 sm:px-6 lg:px-8 backdrop-blur-md sticky top-0 z-30">
          <MobileNav />
          <div className="flex flex-1 items-center justify-between lg:justify-end gap-4">
            <div className="flex items-center gap-2 font-bold tracking-tight text-primary lg:hidden">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <ChefHat className="h-3 w-3" />
              </div>
              FlowStock
            </div>
            <div className="flex items-center gap-4">
              <Link href="/organizations" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
                <Building2 className="h-4 w-4" />
                Organizations
              </Link>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}