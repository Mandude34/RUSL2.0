import {
  useGetDashboardSummary,
  getGetDashboardSummaryQueryKey,
  useListInventory,
  getListInventoryQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Receipt, ChefHat, AlertTriangle, ArrowRight, Loader2, Store as StoreIcon, Bell } from "lucide-react";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

const statCards = [
  {
    key: "totalInventoryItems",
    label: "Inventory Items",
    icon: Package,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    accent: "border-l-blue-500",
  },
  {
    key: "totalSales",
    label: "Total Usage Logged",
    icon: Receipt,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    accent: "border-l-emerald-500",
  },
  {
    key: "totalRecipes",
    label: "Active Recipes",
    icon: ChefHat,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    accent: "border-l-amber-500",
  },
  {
    key: "lowStockCount",
    label: "Low Stock Alerts",
    icon: AlertTriangle,
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    accent: "border-l-red-500",
  },
];

export default function Dashboard() {
  const { selectedStore, selectedOrganization } = useStore();

  const { data: summary, isLoading } = useGetDashboardSummary(
    { storeId: selectedStore?.id, organizationId: selectedOrganization?.id },
    {
      query: {
        queryKey: getGetDashboardSummaryQueryKey({ storeId: selectedStore?.id, organizationId: selectedOrganization?.id }),
        enabled: !!selectedStore,
      }
    }
  );

  const { data: inventory } = useListInventory(
    { storeId: selectedStore?.id },
    {
      query: {
        queryKey: getListInventoryQueryKey({ storeId: selectedStore?.id }),
        enabled: !!selectedStore,
      }
    }
  );

  if (!selectedStore) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
          <StoreIcon className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Select a Store</h2>
          <p className="text-muted-foreground mt-1 text-sm max-w-md">Choose an organization and store from the sidebar to view your operations dashboard.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!summary) return null;

  const values: Record<string, number> = {
    totalInventoryItems: summary.totalInventoryItems,
    totalSales: summary.totalSales,
    totalRecipes: summary.totalRecipes,
    lowStockCount: summary.lowStockCount,
  };

  // Items below minimum stock threshold
  const lowStockItems = (inventory ?? []).filter(
    (item) => item.minStock != null && item.stock < item.minStock
  );

  // Items within 20% above their minimum (approaching low)
  const warningItems = (inventory ?? []).filter(
    (item) =>
      item.minStock != null &&
      item.stock >= item.minStock &&
      item.stock <= item.minStock * 1.2
  );

  const alertCount = lowStockItems.length + warningItems.length;

  return (
    <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Overview</p>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{selectedStore.name}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card
            key={stat.key}
            className={cn(
              "border border-border bg-card shadow-xs overflow-hidden border-l-4 transition-all duration-200 hover:shadow-md hover:-translate-y-px",
              stat.accent
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-5 px-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{stat.label}</p>
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", stat.iconBg)}>
                <stat.icon className={cn("h-4 w-4", stat.iconColor)} />
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-3xl font-bold tracking-tight text-foreground">
                {values[stat.key] ?? 0}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-7">
        {/* Top menu items */}
        <Card className="lg:col-span-4 border border-border bg-card shadow-xs">
          <CardHeader className="border-b border-border/60 pb-3 pt-5 px-5">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              Top Menu Items
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pt-4 pb-5">
            {summary.topMenuItems && summary.topMenuItems.length > 0 ? (
              <div className="space-y-2">
                {summary.topMenuItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-border/40 last:border-0">
                    <div className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold shrink-0",
                      i === 0 ? "bg-amber-100 text-amber-700" :
                      i === 1 ? "bg-slate-100 text-slate-600" :
                      i === 2 ? "bg-orange-50 text-orange-600" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.menuItem}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-sm font-semibold text-foreground">{item.totalQty}</span>
                      <span className="text-xs text-muted-foreground ml-1">used</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <Receipt className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">No usage logged yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts panel */}
        <Card className="lg:col-span-3 border border-border bg-card shadow-xs overflow-hidden">
          <CardHeader className="border-b border-border/60 pb-3 pt-5 px-5">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              Alerts
              {alertCount > 0 && (
                <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1.5">
                  {alertCount}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {alertCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-5 text-center text-muted-foreground">
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 mb-3">
                  <Package className="h-7 w-7 text-emerald-500" />
                </div>
                <p className="text-sm font-semibold text-foreground">All levels look good</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                  All ingredients are above their minimum stock threshold.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {lowStockItems.map((item) => {
                  const pct = item.minStock! > 0 ? Math.round((item.stock / item.minStock!) * 100) : 0;
                  return (
                    <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-red-50">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.stock} {item.unit} left · min {item.minStock} {item.unit}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="text-xs font-bold text-red-600 bg-red-50 rounded px-1.5 py-0.5">
                          {pct}% of min
                        </span>
                      </div>
                    </div>
                  );
                })}
                {warningItems.map((item) => {
                  const pct = item.minStock! > 0 ? Math.round((item.stock / item.minStock!) * 100) : 0;
                  return (
                    <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-50">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.stock} {item.unit} left · min {item.minStock} {item.unit}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 rounded px-1.5 py-0.5">
                          {pct}% of min
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div className="px-5 py-3">
                  <Link href="/recommendations">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer">
                      View reorder recommendations <ArrowRight className="h-3 w-3" />
                    </span>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
