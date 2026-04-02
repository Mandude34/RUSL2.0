import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, Receipt, ChefHat, TrendingUp, Sparkles, Menu, Building2, LogOut } from "lucide-react";
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
  { name: "Sales", href: "/sales", icon: Receipt },
  { name: "Recipes", href: "/recipes", icon: ChefHat },
  { name: "Recommendations", href: "/recommendations", icon: TrendingUp },
  { name: "AI Predictions", href: "/ai-predictions", icon: Sparkles },
];

function UserNav() {
  const { user } = useUser();
  const { signOut } = useClerk();

  if (!user) return null;

  const initials = user.firstName && user.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user.primaryEmailAddress?.emailAddress[0].toUpperCase() || "U";

  return (
    <div className="flex items-center justify-between p-4 border-t border-border/50 bg-card/50">
      <div className="flex items-center gap-3 overflow-hidden">
        <Avatar className="h-9 w-9 border border-border shadow-sm">
          <AvatarImage src={user.imageUrl} />
          <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-medium truncate text-foreground">{user.fullName || user.primaryEmailAddress?.emailAddress}</span>
          <span className="text-xs text-muted-foreground truncate">{user.primaryEmailAddress?.emailAddress}</span>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={() => signOut()} title="Sign out" className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="hidden border-r bg-card/50 lg:flex lg:w-64 lg:shrink-0 lg:flex-col backdrop-blur-md">
      <div className="flex h-16 shrink-0 items-center border-b px-6">
        <div className="flex items-center gap-2 font-bold tracking-tight text-lg text-primary">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <ChefHat className="h-5 w-5" />
          </div>
          FlowStock
        </div>
      </div>
      <StoreSelector />
      <nav className="flex flex-1 flex-col gap-1 p-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location === item.href || (item.href === "/dashboard" && location === "/");
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform duration-200",
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:scale-110 group-hover:text-foreground"
                  )}
                />
                {item.name}
              </div>
            </Link>
          );
        })}
        
        <div className="mt-4 pt-4 border-t border-border/50">
          <Link href="/organizations">
            <div
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer",
                location.startsWith("/organizations")
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Building2 className={cn(
                "h-4 w-4 shrink-0 transition-transform duration-200",
                location.startsWith("/organizations") ? "text-primary-foreground" : "text-muted-foreground group-hover:scale-110 group-hover:text-foreground"
              )} />
              Organizations
            </div>
          </Link>
        </div>
      </nav>
      <UserNav />
    </div>
  );
}

export function MobileNav() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 flex flex-col">
        <div className="flex h-16 shrink-0 items-center border-b px-6">
          <div className="flex items-center gap-2 font-bold tracking-tight text-lg text-primary">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
              <ChefHat className="h-5 w-5" />
            </div>
            FlowStock
          </div>
        </div>
        <StoreSelector />
        <nav className="flex flex-1 flex-col gap-1 p-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href === "/dashboard" && location === "/");
            return (
              <Link key={item.name} href={item.href} onClick={() => setOpen(false)}>
                <div
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {item.name}
                </div>
              </Link>
            );
          })}
          
          <div className="mt-4 pt-4 border-t border-border/50">
            <Link href="/organizations" onClick={() => setOpen(false)}>
              <div
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
                  location.startsWith("/organizations")
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Building2 className={cn(
                  "h-4 w-4 shrink-0",
                  location.startsWith("/organizations") ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )} />
                Organizations
              </div>
            </Link>
          </div>
        </nav>
        <UserNav />
      </SheetContent>
    </Sheet>
  );
}