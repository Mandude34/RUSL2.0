import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, Receipt, TrendingUp, Sparkles, BarChart3, Menu, Building2, LogOut, Flame, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { StoreSelector } from "./store-selector";
import { useUser, useClerk } from "@clerk/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Usage", href: "/sales", icon: Receipt },
  { name: "Waste Tracking", href: "/waste", icon: Flame },
  { name: "Food Cost", href: "/food-cost", icon: DollarSign },
  { name: "Recommendations", href: "/recommendations", icon: TrendingUp },
  { name: "AI Predictions", href: "/ai-predictions", icon: Sparkles },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

function NavItem({ item, isActive, onClick }: { item: typeof navigation[0]; isActive: boolean; onClick?: () => void }) {
  return (
    <Link href={item.href} onClick={onClick}>
      <div
        className={cn(
          "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium tracking-wide transition-all duration-200 cursor-pointer overflow-hidden",
          isActive
            ? "text-[#22D3EE]"
            : "text-gray-400 hover:text-gray-200 hover:bg-[#161B22]/60"
        )}
      >
        {isActive && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-[#22D3EE]/10 to-transparent pointer-events-none" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-1/2 rounded-r-full bg-[#22D3EE] shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
          </>
        )}
        <item.icon
          className={cn(
            "h-[15px] w-[15px] shrink-0 relative z-10 transition-colors duration-200",
            isActive ? "text-[#22D3EE]" : "text-gray-500 group-hover:text-gray-400"
          )}
          strokeWidth={isActive ? 2.5 : 2}
        />
        <span className="relative z-10">{item.name}</span>
      </div>
    </Link>
  );
}

function UserNav() {
  const { user } = useUser();
  const { signOut } = useClerk();

  if (!user) return null;

  const initials = user.firstName && user.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user.primaryEmailAddress?.emailAddress[0].toUpperCase() || "U";

  return (
    <div className="flex items-center justify-between px-3 py-3 border-t border-gray-800/30">
      <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
        <Avatar className="h-7 w-7 border border-gray-800/50 shrink-0">
          <AvatarImage src={user.imageUrl} />
          <AvatarFallback className="bg-[#161B22] text-[#22D3EE] text-xs font-medium">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col overflow-hidden min-w-0">
          <span className="text-sm font-medium truncate text-gray-200">{user.fullName || user.primaryEmailAddress?.emailAddress}</span>
          <span className="text-[11px] text-gray-500 truncate leading-tight">{user.primaryEmailAddress?.emailAddress}</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => signOut()}
        title="Sign out"
        className="shrink-0 h-7 w-7 text-gray-500 hover:text-gray-300 hover:bg-[#161B22]"
      >
        <LogOut className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const [location] = useLocation();

  return (
    <>
      <div className="flex h-16 shrink-0 items-center px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-[#22D3EE]/10">
            <div className="h-3.5 w-3.5 rounded-[3px] bg-[#22D3EE]" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white leading-none mt-0.5">RUSL</span>
        </div>
      </div>

      <StoreSelector />

      <nav className="flex flex-1 flex-col overflow-y-auto py-2 px-2">
        <div className="px-2 mb-1.5">
          <span className="text-[10px] font-bold tracking-widest text-gray-600/80">MENU</span>
        </div>
        <div className="space-y-0.5 mb-5">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href === "/dashboard" && location === "/");
            return (
              <NavItem key={item.name} item={item} isActive={isActive} onClick={onNavClick} />
            );
          })}
        </div>

        <div className="px-2 mb-1.5">
          <span className="text-[10px] font-bold tracking-widest text-gray-600/80">SETTINGS</span>
        </div>
        <div className="space-y-0.5">
          <Link href="/organizations" onClick={onNavClick}>
            <div
              className={cn(
                "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium tracking-wide transition-all duration-200 cursor-pointer overflow-hidden",
                location.startsWith("/organizations")
                  ? "text-[#22D3EE]"
                  : "text-gray-400 hover:text-gray-200 hover:bg-[#161B22]/60"
              )}
            >
              {location.startsWith("/organizations") && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#22D3EE]/10 to-transparent pointer-events-none" />
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-1/2 rounded-r-full bg-[#22D3EE] shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                </>
              )}
              <Building2 className={cn(
                "h-[15px] w-[15px] shrink-0 relative z-10 transition-colors duration-200",
                location.startsWith("/organizations") ? "text-[#22D3EE]" : "text-gray-500 group-hover:text-gray-400"
              )} strokeWidth={location.startsWith("/organizations") ? 2.5 : 2} />
              <span className="relative z-10">Organizations</span>
            </div>
          </Link>
        </div>
      </nav>

      <UserNav />
    </>
  );
}

export function Sidebar() {
  return (
    <div className="hidden bg-[#0D1117] border-r border-gray-800/30 lg:flex lg:w-60 lg:shrink-0 lg:flex-col">
      <SidebarContent />
    </div>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden text-gray-400 hover:text-gray-200 hover:bg-[#161B22]">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-60 p-0 flex flex-col bg-[#0D1117] border-r border-gray-800/30">
        <SidebarContent onNavClick={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
