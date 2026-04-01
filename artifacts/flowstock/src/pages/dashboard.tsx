import { useGetDashboardSummary, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Receipt, ChefHat, AlertTriangle, ArrowUpRight, Loader2, Store as StoreIcon } from "lucide-react";
import { useStore } from "@/hooks/use-store";

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
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <StoreIcon className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold">Select a Store</h2>
        <p className="text-muted-foreground max-w-md">Please select an organization and a store from the sidebar to view your dashboard.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const statCards = [
    { title: "Total Items", value: summary.totalInventoryItems, icon: Package, color: "text-blue-500" },
    { title: "Total Sales", value: summary.totalSales, icon: Receipt, color: "text-green-500" },
    { title: "Active Recipes", value: summary.totalRecipes, icon: ChefHat, color: "text-orange-500" },
    { title: "Low Stock", value: summary.lowStockCount, icon: AlertTriangle, color: "text-red-500" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of operations for {selectedStore.name}.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="overflow-hidden border-border/50 bg-card/50 backdrop-blur transition-all duration-200 hover:shadow-md hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Top Menu Items</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.topMenuItems && summary.topMenuItems.length > 0 ? (
              <div className="space-y-4">
                {summary.topMenuItems.map((item, i) => (
                  <div key={i} className="flex items-center group">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium mr-4 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      {i + 1}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{item.menuItem}</p>
                    </div>
                    <div className="font-mono text-sm font-medium">
                      {item.totalQty} <span className="text-muted-foreground text-xs">sold</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Receipt className="h-8 w-8 mb-2 opacity-20" />
                <p>No sales logged yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-border/50 bg-card/50 backdrop-blur overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Recommendations
              {summary.reorderCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {summary.reorderCount}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex flex-col items-center justify-center space-y-4 py-6 text-center">
              <div className="rounded-full bg-primary/10 p-4">
                <ArrowUpRight className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Need to reorder?</h3>
                <p className="text-sm text-muted-foreground">
                  You have {summary.reorderCount} items that need restocking based on recent sales and inventory levels.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}