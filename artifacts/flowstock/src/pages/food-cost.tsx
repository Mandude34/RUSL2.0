import { useState } from "react";
import {
  useGetFoodCostReport,
  getGetFoodCostReportQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Loader2, ChevronDown, Store as StoreIcon, Download, DollarSign, TrendingDown, BarChart2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";

function foodCostColor(pct: number) {
  if (pct <= 25) return "bg-green-100 text-green-700 border-green-200";
  if (pct <= 35) return "bg-yellow-100 text-yellow-700 border-yellow-200";
  return "bg-red-100 text-red-700 border-red-200";
}

export default function FoodCost() {
  const { selectedStore } = useStore();
  const { toast } = useToast();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const { data: report, isLoading } = useGetFoodCostReport(
    { storeId: selectedStore?.id },
    {
      query: {
        queryKey: getGetFoodCostReportQueryKey({ storeId: selectedStore?.id }),
        enabled: !!selectedStore,
      },
    }
  );

  const toggleItem = (menuItem: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(menuItem)) next.delete(menuItem);
      else next.add(menuItem);
      return next;
    });
  };

  const exportToPDF = async () => {
    if (!report || report.items.length === 0) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const store = selectedStore?.name ?? "All Stores";
    const now = format(new Date(), "MMM d, yyyy");

    doc.setFontSize(18);
    doc.text("Food Cost Report", 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Store: ${store}`, 14, 30);
    doc.text(`Generated: ${now}`, 14, 36);

    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.text(`Total Revenue: $${report.totalRevenue.toFixed(2)}`, 14, 46);
    doc.text(`Total Ingredient Cost: $${report.totalIngredientCost.toFixed(2)}`, 14, 53);
    doc.text(`Avg Food Cost %: ${report.avgFoodCostPct.toFixed(1)}%`, 14, 60);

    let y = 72;
    doc.setFontSize(12);
    doc.text("Recipe Breakdown", 14, y);
    y += 7;

    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text("Menu Item", 14, y);
    doc.text("Menu Price", 90, y);
    doc.text("Ingredient Cost", 125, y);
    doc.text("Food Cost %", 170, y);
    doc.setTextColor(0);
    y += 4;
    doc.line(14, y, 196, y);
    y += 5;

    doc.setFontSize(10);
    for (const item of report.items) {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.text(item.menuItem.substring(0, 35), 14, y);
      doc.text(item.menuPrice != null ? `$${item.menuPrice.toFixed(2)}` : "—", 90, y);
      doc.text(`$${item.ingredientCost.toFixed(2)}`, 125, y);
      doc.text(item.foodCostPct != null ? `${item.foodCostPct.toFixed(1)}%` : "—", 170, y);
      y += 6;

      doc.setFontSize(8);
      doc.setTextColor(100);
      for (const ing of item.ingredients) {
        if (y > 265) { doc.addPage(); y = 20; }
        doc.text(`  ${ing.ingredientName}`, 18, y);
        doc.text(`${ing.amountPerServing} ${ing.unit}`, 90, y);
        if (ing.costPerUnit != null) {
          doc.text(`$${(ing.costPerUnit * ing.amountPerServing).toFixed(2)}`, 125, y);
        }
        y += 5;
      }
      doc.setFontSize(10);
      doc.setTextColor(0);
      y += 2;
    }

    doc.save(`food-cost-report-${store.replace(/\s+/g, "-").toLowerCase()}-${now.replace(/\s+/g, "-")}.pdf`);
    toast({ title: "PDF downloaded" });
  };

  if (!selectedStore) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
          <StoreIcon className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Select a Store</h2>
          <p className="text-muted-foreground text-sm mt-1 max-w-md">Please select an organization and store from the sidebar to view food cost reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Financials</p>
          <h1 className="text-2xl font-bold tracking-tight">Food Cost Report</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{selectedStore.name}</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5 h-9" onClick={exportToPDF}>
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !report || report.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
          <div className="rounded-2xl bg-muted/50 p-5 mb-4 border border-border/60">
            <BarChart2 className="h-9 w-9 text-muted-foreground/40" />
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">No recipe data</h3>
          <p className="text-xs max-w-xs">
            Add recipes with ingredients and set cost per unit on your inventory items to generate food cost reports.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="border border-border bg-card shadow-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center shrink-0">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Total Revenue</p>
                  <p className="text-xl font-bold">${report.totalRevenue.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-border bg-card shadow-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0">
                  <TrendingDown className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Ingredient Cost</p>
                  <p className="text-xl font-bold">${report.totalIngredientCost.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-border bg-card shadow-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn(
                  "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border",
                  report.avgFoodCostPct <= 25 ? "bg-green-50 border-green-200" :
                  report.avgFoodCostPct <= 35 ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200"
                )}>
                  <BarChart2 className={cn(
                    "h-4 w-4",
                    report.avgFoodCostPct <= 25 ? "text-green-600" :
                    report.avgFoodCostPct <= 35 ? "text-yellow-600" : "text-red-600"
                  )} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Avg Food Cost %</p>
                  <p className="text-xl font-bold">{report.avgFoodCostPct.toFixed(1)}%</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-medium">Food Cost %:</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-green-500"></span> &le;25% Good</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-yellow-500"></span> 26–35% Monitor</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-red-500"></span> &gt;35% High</span>
          </div>

          {/* Recipe Breakdown */}
          <Card className="border border-border bg-card shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-semibold">Recipe Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-border hover:bg-gray-50">
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pl-5 h-9 w-8"></TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide h-9">Menu Item</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right h-9">Menu Price</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right h-9">Ingredient Cost</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right h-9 pr-5">Food Cost %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.items.map((item) => (
                    <Collapsible
                      key={item.menuItem}
                      open={openItems.has(item.menuItem)}
                      onOpenChange={() => toggleItem(item.menuItem)}
                      asChild
                    >
                      <>
                        <CollapsibleTrigger asChild>
                          <TableRow className="group border-b border-border/40 hover:bg-gray-50/80 transition-colors cursor-pointer">
                            <TableCell className="pl-5 py-3 w-8">
                              <ChevronDown className={cn(
                                "h-4 w-4 text-muted-foreground transition-transform",
                                openItems.has(item.menuItem) ? "rotate-180" : ""
                              )} />
                            </TableCell>
                            <TableCell className="font-semibold text-sm py-3">{item.menuItem}</TableCell>
                            <TableCell className="text-right font-mono text-sm py-3 text-muted-foreground">
                              {item.menuPrice != null ? `$${item.menuPrice.toFixed(2)}` : <span className="text-muted-foreground/40">—</span>}
                            </TableCell>
                            <TableCell className="text-right font-mono font-semibold text-sm py-3">
                              ${item.ingredientCost.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right py-3 pr-5">
                              {item.foodCostPct != null ? (
                                <Badge variant="outline" className={cn("text-xs font-semibold", foodCostColor(item.foodCostPct))}>
                                  {item.foodCostPct.toFixed(1)}%
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground/40 text-sm">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        </CollapsibleTrigger>
                        <CollapsibleContent asChild>
                          <>
                            {item.ingredients.map((ing, idx) => (
                              <TableRow
                                key={idx}
                                className="border-b border-border/20 bg-gray-50/50 hover:bg-gray-50"
                              >
                                <TableCell className="pl-5 py-2 w-8"></TableCell>
                                <TableCell className="py-2 pl-8 text-xs text-muted-foreground" colSpan={1}>
                                  {ing.ingredientName}
                                </TableCell>
                                <TableCell className="text-right text-xs text-muted-foreground py-2">
                                  {ing.amountPerServing} {ing.unit}
                                </TableCell>
                                <TableCell className="text-right text-xs text-muted-foreground py-2">
                                  {ing.costPerUnit != null
                                    ? `$${ing.costPerUnit.toFixed(2)}/unit`
                                    : <span className="text-muted-foreground/40">no cost set</span>}
                                </TableCell>
                                <TableCell className="text-right text-xs font-mono py-2 pr-5">
                                  {ing.lineCost != null ? `$${ing.lineCost.toFixed(2)}` : <span className="text-muted-foreground/40">—</span>}
                                </TableCell>
                              </TableRow>
                            ))}
                          </>
                        </CollapsibleContent>
                      </>
                    </Collapsible>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            Set &quot;Cost Per Unit&quot; on inventory items and &quot;Menu Price&quot; on recipes to see complete food cost calculations. Revenue is calculated from logged sales with a recorded sale price.
          </p>
        </>
      )}
    </div>
  );
}
