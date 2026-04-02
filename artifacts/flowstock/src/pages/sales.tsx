import { useState, useMemo } from "react";
import {
  useListSales,
  getListSalesQueryKey,
  getListInventoryQueryKey,
  getGetRecommendationsQueryKey,
  useCreateSale,
  useDeleteSale
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Loader2, Plus, Search, Trash2, Receipt, Store as StoreIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { format, parseISO } from "date-fns";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";

const saleSchema = z.object({
  menuItem: z.string().min(1, "Menu item name is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  salePrice: z.coerce.number().min(0).optional(),
});

type Tab = "log" | "summary";

export default function Sales() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("log");

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { selectedStore } = useStore();

  const { data: sales, isLoading } = useListSales(
    { storeId: selectedStore?.id },
    {
      query: {
        queryKey: getListSalesQueryKey({ storeId: selectedStore?.id }),
        enabled: !!selectedStore
      }
    }
  );

  const createSale = useCreateSale();
  const deleteSale = useDeleteSale();

  const form = useForm<z.infer<typeof saleSchema>>({
    resolver: zodResolver(saleSchema),
    defaultValues: { menuItem: "", quantity: 1, salePrice: undefined },
  });

  const onSubmit = (values: z.infer<typeof saleSchema>) => {
    createSale.mutate(
      { data: { ...values, storeId: selectedStore?.id } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSalesQueryKey({ storeId: selectedStore?.id }) });
          queryClient.invalidateQueries({ queryKey: getListInventoryQueryKey({ storeId: selectedStore?.id }) });
          queryClient.invalidateQueries({ queryKey: getGetRecommendationsQueryKey({ storeId: selectedStore?.id }) });
          toast({ title: "Sale logged" });
          setIsAddOpen(false);
          form.reset();
        },
        onError: () => toast({ title: "Failed to log sale", variant: "destructive" }),
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteSale.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSalesQueryKey({ storeId: selectedStore?.id }) });
          queryClient.invalidateQueries({ queryKey: getListInventoryQueryKey({ storeId: selectedStore?.id }) });
          queryClient.invalidateQueries({ queryKey: getGetRecommendationsQueryKey({ storeId: selectedStore?.id }) });
          toast({ title: "Sale removed" });
        },
        onError: () => toast({ title: "Failed to remove sale", variant: "destructive" }),
      }
    );
  };

  // Build daily summary: group by date → { menuItem → qty }
  const dailySummary = useMemo(() => {
    if (!sales) return [];
    const map: Record<string, { date: string; items: Record<string, number>; total: number }> = {};
    for (const sale of sales) {
      const dateKey = new Date(sale.createdAt).toISOString().split("T")[0];
      if (!map[dateKey]) map[dateKey] = { date: dateKey, items: {}, total: 0 };
      map[dateKey].items[sale.menuItem] = (map[dateKey].items[sale.menuItem] || 0) + sale.quantity;
      map[dateKey].total += sale.quantity;
    }
    return Object.values(map).sort((a, b) => b.date.localeCompare(a.date));
  }, [sales]);

  // All unique menu items (for summary table columns)
  const allMenuItems = useMemo(() => {
    if (!sales) return [];
    const set = new Set(sales.map(s => s.menuItem));
    return Array.from(set).sort();
  }, [sales]);

  if (!selectedStore) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
          <StoreIcon className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Select a Store</h2>
          <p className="text-muted-foreground text-sm mt-1 max-w-md">Please select an organization and store from the sidebar to manage sales.</p>
        </div>
      </div>
    );
  }

  const filteredSales = sales?.filter(sale =>
    sale.menuItem.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredSummary = dailySummary.filter(day =>
    searchQuery === "" ||
    Object.keys(day.items).some(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Revenue</p>
          <h1 className="text-2xl font-bold tracking-tight">Sales</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{selectedStore.name}</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 h-9">
              <Plus className="h-4 w-4" />
              Log Sale
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log New Sale</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="menuItem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Menu Item</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Chow Mein" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity Sold</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sale Price per Unit ($) <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" placeholder="e.g. 12.99" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">Used to calculate revenue in Food Cost reports.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={createSale.isPending}>
                    {createSale.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Log Sale
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border">
        {[
          { key: "log" as Tab, label: "Transaction Log" },
          { key: "summary" as Tab, label: "Daily Summary" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Transaction Log Tab ── */}
      {activeTab === "log" && (
        <Card className="border border-border bg-white shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sales..."
                className="pl-9 bg-muted/40 border-border/70 h-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            ) : filteredSales.length > 0 ? (
              <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-border hover:bg-gray-50">
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pl-5 h-9">Date & Time</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide h-9">Menu Item</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right h-9">Qty</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right h-9">Price/Unit</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right h-9">Revenue</TableHead>
                      <TableHead className="w-[60px] h-9"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.map((sale) => (
                      <TableRow key={sale.id} className="group border-b border-border/40 hover:bg-gray-50/80 transition-colors">
                        <TableCell className="pl-5 py-3 text-muted-foreground text-sm font-mono">
                          {format(new Date(sale.createdAt), "MMM d, yyyy · HH:mm")}
                        </TableCell>
                        <TableCell className="font-medium text-sm py-3">{sale.menuItem}</TableCell>
                        <TableCell className="text-right font-mono font-semibold text-sm py-3">{sale.quantity}</TableCell>
                        <TableCell className="text-right font-mono text-sm py-3 text-muted-foreground">
                          {sale.salePrice != null ? `$${sale.salePrice.toFixed(2)}` : <span className="text-muted-foreground/40">—</span>}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold text-sm py-3">
                          {sale.salePrice != null ? `$${(sale.salePrice * sale.quantity).toFixed(2)}` : <span className="text-muted-foreground/40">—</span>}
                        </TableCell>
                        <TableCell className="py-3 pr-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                            onClick={() => handleDelete(sale.id)}
                            disabled={deleteSale.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                <div className="rounded-2xl bg-muted/50 p-5 mb-4 border border-border/60">
                  <Receipt className="h-9 w-9 text-muted-foreground/40" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">No sales recorded</h3>
                <p className="text-xs max-w-xs">
                  {searchQuery ? "No sales match your search." : "Log your first sale to start tracking what's selling."}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setIsAddOpen(true)} className="mt-4" variant="outline" size="sm">
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Log Sale
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Daily Summary Tab ── */}
      {activeTab === "summary" && (
        <Card className="border border-border bg-white shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter by menu item..."
                  className="pl-9 bg-muted/40 border-border/70 h-9 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {!isLoading && (
                <span className="text-xs text-muted-foreground shrink-0">
                  {dailySummary.length} {dailySummary.length === 1 ? "day" : "days"} of sales
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            ) : filteredSummary.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-border hover:bg-gray-50">
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pl-5 h-9 min-w-[120px]">Date</TableHead>
                      {allMenuItems.map(item => (
                        <TableHead key={item} className="text-xs font-semibold text-muted-foreground uppercase tracking-wide h-9 text-right whitespace-nowrap">
                          {item}
                        </TableHead>
                      ))}
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide h-9 text-right pr-5 min-w-[80px]">
                        Total
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSummary.map((day) => {
                      const displayedItems = searchQuery
                        ? allMenuItems.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
                        : allMenuItems;
                      return (
                        <TableRow key={day.date} className="border-b border-border/40 hover:bg-gray-50/80 transition-colors">
                          <TableCell className="pl-5 py-2.5 font-medium text-sm min-w-[120px]">
                            {(() => { try { return format(parseISO(day.date), "EEE, MMM d"); } catch { return day.date; } })()}
                          </TableCell>
                          {allMenuItems.map(item => {
                            const qty = day.items[item];
                            const highlighted = searchQuery && item.toLowerCase().includes(searchQuery.toLowerCase());
                            return (
                              <TableCell
                                key={item}
                                className={cn(
                                  "text-right font-mono text-sm py-2.5",
                                  highlighted ? "text-primary font-semibold" : qty ? "text-foreground" : "text-muted-foreground/30"
                                )}
                              >
                                {qty ?? "—"}
                              </TableCell>
                            );
                          })}
                          <TableCell className="text-right font-mono font-bold text-sm py-2.5 pr-5 text-foreground">
                            {day.total}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {/* Totals row */}
                    <TableRow className="bg-gray-50 border-t-2 border-border font-semibold">
                      <TableCell className="pl-5 py-2.5 text-sm font-bold">All Time</TableCell>
                      {allMenuItems.map(item => {
                        const total = dailySummary.reduce((sum, day) => sum + (day.items[item] || 0), 0);
                        return (
                          <TableCell key={item} className="text-right font-mono text-sm py-2.5 font-bold">
                            {total > 0 ? total : "—"}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-right font-mono font-bold text-sm py-2.5 pr-5">
                        {dailySummary.reduce((sum, day) => sum + day.total, 0)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                <div className="rounded-2xl bg-muted/50 p-5 mb-4 border border-border/60">
                  <Receipt className="h-9 w-9 text-muted-foreground/40" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">No daily data</h3>
                <p className="text-xs max-w-xs">
                  {searchQuery ? "No days match your search." : "Log sales to see a daily breakdown."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
