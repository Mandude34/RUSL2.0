import { useGetRecommendations, getGetRecommendationsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Loader2, TrendingUp, AlertTriangle, ArrowRight, PackageOpen, Store as StoreIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/hooks/use-store";

export default function Recommendations() {
  const { selectedStore, selectedOrganization } = useStore();

  const { data: recommendations, isLoading } = useGetRecommendations(
    { storeId: selectedStore?.id, organizationId: selectedOrganization?.id },
    {
      query: {
        queryKey: getGetRecommendationsQueryKey({ storeId: selectedStore?.id, organizationId: selectedOrganization?.id }),
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
          <p className="text-muted-foreground text-sm mt-1 max-w-md">Please select an organization and store from the sidebar to view recommendations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Purchasing</p>
        <h1 className="text-2xl font-bold tracking-tight">Reorder Recommendations</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{selectedStore.name}</p>
      </div>

      <Card className="border border-border bg-card shadow-xs">
        <CardHeader className="border-b border-border/60 pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            Suggested Restock Actions
          </CardTitle>
          <CardDescription className="text-xs mt-1">
            These recommendations compare your current stock against ingredients consumed in logged sales.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : recommendations && recommendations.length > 0 ? (
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-border hover:bg-gray-50">
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pl-5 h-9">Ingredient</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right h-9">Current Stock</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right h-9">Total Used</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center h-9">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right bg-primary/5 h-9 pr-5">Order Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recommendations.map((rec, i) => (
                    <TableRow key={i} className="group border-b border-border/40 hover:bg-gray-50/80 transition-colors">
                      <TableCell className="font-medium text-sm pl-5 py-3">{rec.ingredientName}</TableCell>
                      <TableCell className="text-right font-mono text-sm py-3">
                        <span className={rec.currentStock < rec.totalUsed ? "text-red-600 font-semibold" : "text-foreground"}>
                          {rec.currentStock}
                        </span>
                        {" "}<span className="text-muted-foreground text-xs">{rec.unit}</span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm py-3">
                        {rec.totalUsed} <span className="text-muted-foreground text-xs">{rec.unit}</span>
                      </TableCell>
                      <TableCell className="text-center py-3">
                        {rec.currentStock < rec.totalUsed ? (
                          <Badge className="bg-red-50 text-red-600 border border-red-200 shadow-none text-xs font-semibold">
                            <AlertTriangle className="h-3 w-3 mr-1" />Deficit
                          </Badge>
                        ) : rec.currentStock === 0 ? (
                          <Badge className="bg-red-50 text-red-600 border border-red-200 shadow-none text-xs font-semibold">Out of Stock</Badge>
                        ) : (
                          <Badge className="bg-amber-50 text-amber-700 border border-amber-200 shadow-none text-xs font-semibold">Low</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right bg-primary/5 font-bold text-primary font-mono text-sm py-3 pr-5">
                        <div className="flex items-center justify-end gap-2">
                          <ArrowRight className="h-3.5 w-3.5 text-primary/40 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                          {rec.orderAmount > 0 ? (
                            <span>+{rec.orderAmount} <span className="text-xs font-normal text-primary/70">{rec.unit}</span></span>
                          ) : (
                            <span className="text-muted-foreground font-normal text-xs">—</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 mb-4">
                <PackageOpen className="h-9 w-9 text-emerald-500" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Inventory Looking Good</h3>
              <p className="text-xs max-w-xs">
                No reorder recommendations right now. Check back after logging more sales or setting minimum thresholds.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
