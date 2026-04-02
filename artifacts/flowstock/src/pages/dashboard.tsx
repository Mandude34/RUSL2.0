import { useGetDashboardSummary, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Receipt, ChefHat, AlertTriangle, ArrowRight, Loader2, Store as StoreIcon } from "lucide-react";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";

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
    label: "Total Sales Logged",
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
        enabled: !!selectedStore
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
              "border border-border bg-white shadow-xs overflow-hidden border-l-4 transition-all duration-200 hover:shadow-md hover:-translate-y-px",
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
        <Card className="lg:col-span-4 border border-border bg-white shadow-xs">
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
                      <span className="text-xs text-muted-foreground ml-1">sold</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <Receipt className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">No sales logged yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border border-border bg-white shadow-xs overflow-hidden">
          <CardHeader className="border-b border-border/60 pb-3 pt-5 px-5">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              Reorder Status
              {summary.reorderCount > 0 && (
                <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1.5">
                  {summary.reorderCount}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pt-6 pb-5">
            <div className="flex flex-col items-center justify-center space-y-4 py-4 text-center">
              <div className={cn(
                "rounded-2xl p-4 border",
                summary.reorderCount > 0
                  ? "bg-red-50 border-red-200"
                  : "bg-emerald-50 border-emerald-200"
              )}>
                {summary.reorderCount > 0 ? (
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                ) : (
                  <Package className="h-8 w-8 text-emerald-500" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm">
                  {summary.reorderCount > 0 ? `${summary.reorderCount} item${summary.reorderCount === 1 ? '' : 's'} need restocking` : "Stock levels optimal"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">
                  {summary.reorderCount > 0
                    ? "Check Recommendations for suggested order quantities."
                    : "All ingredients are above their minimum threshold."}
                </p>
              </div>
              {summary.reorderCount > 0 && (
                <a href="/recommendations" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                  View recommendations <ArrowRight className="h-3 w-3" />
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
