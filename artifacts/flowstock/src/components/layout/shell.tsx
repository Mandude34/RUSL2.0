import { ReactNode } from "react";
import { Sidebar, MobileNav } from "./sidebar";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] w-full bg-background font-sans">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-4 border-b border-gray-800/30 bg-[#0D1117] px-4 sm:px-6 lg:px-8 sticky top-0 z-30 lg:hidden">
          <MobileNav />
          <div className="flex flex-1 items-center justify-end gap-4">
            <div className="flex items-center gap-2 font-bold tracking-tight text-white">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-[#22D3EE]/10">
                <div className="h-3 w-3 rounded-[2px] bg-[#22D3EE]" />
              </div>
              sToK
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
