import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, Receipt, TrendingUp, Sparkles, BarChart3, ChefHat, Menu, Building2, LogOut } from "lucide-react";
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
  { name: "Recommendations", href: "/recommendations", icon: TrendingUp },
  { name: "AI Predictions", href: "/ai-predictions", icon: Sparkles },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

function NavItem({ item, isActive, onClick }: { item: typeof navigation[0]; isActive: boolean; onClick?: () => void }) {
  return (
    <Link href={item.href} onClick={onClick}>
      <div
        className={cn(
          "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150 cursor-pointer",
          isActive
            ? "bg-[hsl(158,42%,45%)] text-white shadow-sm"
            : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
        )}
      >
        <item.icon
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-150",
            isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300 group-hover:scale-105"
          )}
        />
        {item.name}
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
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
      <div className="flex items-center gap-3 overflow-hidden min-w-0">
        <Avatar className="h-8 w-8 border border-slate-700 shrink-0">
          <AvatarImage src={user.imageUrl} />
          <AvatarFallback className="bg-[hsl(158,42%,28%)] text-white text-xs font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col overflow-hidden min-w-0">
          <span className="text-xs font-semibold truncate text-slate-200">{user.fullName || user.primaryEmailAddress?.emailAddress}</span>
          <span className="text-[10px] text-slate-500 truncate">{user.primaryEmailAddress?.emailAddress}</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => signOut()}
        title="Sign out"
        className="shrink-0 h-7 w-7 text-slate-500 hover:text-red-400 hover:bg-slate-800"
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
      <div className="flex h-14 shrink-0 items-center border-b border-slate-800 px-5">
        <div className="flex items-center gap-2.5 font-bold tracking-tight text-base">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[hsl(158,42%,40%)] shadow-sm">
            <ChefHat className="h-4 w-4 text-white" />
          </div>
          <span className="text-white">FlowStock</span>
        </div>
      </div>

      <StoreSelector />

      <nav className="flex flex-1 flex-col gap-0.5 p-3 overflow-y-auto">
        <div className="mb-1 px-2 pt-1 pb-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">Menu</span>
        </div>
        {navigation.map((item) => {
          const isActive = location === item.href || (item.href === "/dashboard" && location === "/");
          return (
            <NavItem key={item.name} item={item} isActive={isActive} onClick={onNavClick} />
          );
        })}

        <div className="mt-4 mb-1 px-2 pt-2 pb-1.5 border-t border-slate-800">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">Settings</span>
        </div>
        <Link href="/organizations" onClick={onNavClick}>
          <div
            className={cn(
              "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150 cursor-pointer",
              location.startsWith("/organizations")
                ? "bg-[hsl(158,42%,45%)] text-white shadow-sm"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            )}
          >
            <Building2 className={cn(
              "h-4 w-4 shrink-0 transition-transform duration-150",
              location.startsWith("/organizations") ? "text-white" : "text-slate-500 group-hover:text-slate-300 group-hover:scale-105"
            )} />
            Organizations
          </div>
        </Link>
      </nav>

      <UserNav />
    </>
  );
}

export function Sidebar() {
  return (
    <div className="hidden bg-slate-900 border-r border-slate-800 lg:flex lg:w-60 lg:shrink-0 lg:flex-col">
      <SidebarContent />
    </div>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-60 p-0 flex flex-col bg-slate-900 border-r border-slate-800">
        <SidebarContent onNavClick={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
