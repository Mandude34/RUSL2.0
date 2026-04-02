import { useState, useMemo } from "react";
import {
  useListWasteLogs,
  getListWasteLogsQueryKey,
  useCreateWasteLog,
  useDeleteWasteLog,
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Plus, Search, Trash2, Flame, Store as StoreIcon, Download } from "lucide-react";
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
import { format } from "date-fns";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";

const wasteSchema = z.object({
  ingredientName: z.string().min(1, "Ingredient name is required"),
  quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0"),
  unit: z.string().min(1, "Unit is required"),
  reason: z.string().optional(),
});

type Tab = "log" | "summary";

export default function Waste() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("log");

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { selectedStore } = useStore();

  const { data: wasteLogs, isLoading } = useListWasteLogs(
    { storeId: selectedStore?.id },
    {
      query: {
        queryKey: getListWasteLogsQueryKey({ storeId: selectedStore?.id }),
        enabled: !!selectedStore,
      },
    }
  );

  const createWasteLog = useCreateWasteLog();
  const deleteWasteLog = useDeleteWasteLog();

  const form = useForm<z.infer<typeof wasteSchema>>({
    resolver: zodResolver(wasteSchema),
    defaultValues: { ingredientName: "", quantity: 0, unit: "", reason: "" },
  });

  const onSubmit = (values: z.infer<typeof wasteSchema>) => {
    createWasteLog.mutate(
      { data: { ...values, storeId: selectedStore?.id } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListWasteLogsQueryKey({ storeId: selectedStore?.id }) });
          toast({ title: "Waste logged" });
          setIsAddOpen(false);
          form.reset();
        },
        onError: () => toast({ title: "Failed to log waste", variant: "destructive" }),
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteWasteLog.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListWasteLogsQueryKey({ storeId: selectedStore?.id }) });
          toast({ title: "Waste entry removed" });
        },
        onError: () => toast({ title: "Failed to remove entry", variant: "destructive" }),
      }
    );
  };

  const ingredientSummary = useMemo(() => {
    if (!wasteLogs) return [];
    const map: Record<string, { ingredientName: string; unit: string; totalQty: number; count: number }> = {};
    for (const log of wasteLogs) {
      const key = log.ingredientName.toLowerCase();
      if (!map[key]) {
        map[key] = { ingredientName: log.ingredientName, unit: log.unit, totalQty: 0, count: 0 };
      }
      map[key].totalQty += log.quantity;
      map[key].count++;
    }
    return Object.values(map).sort((a, b) => b.totalQty - a.totalQty);
  }, [wasteLogs]);

  const exportToPDF = async () => {
    if (!wasteLogs || wasteLogs.length === 0) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const store = selectedStore?.name ?? "All Stores";
    const now = format(new Date(), "MMM d, yyyy");

    doc.setFontSize(18);
    doc.text("Waste & Spoilage Report", 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Store: ${store}`, 14, 30);
    doc.text(`Generated: ${now}`, 14, 36);

    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text("Ingredient Summary", 14, 48);

    let y = 55;
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text("Ingredient", 14, y);
    doc.text("Total Qty", 100, y);
    doc.text("Unit", 140, y);
    doc.text("Entries", 170, y);
    doc.setTextColor(0);
    y += 4;
    doc.line(14, y, 196, y);
    y += 5;

    doc.setFontSize(10);
    for (const row of ingredientSummary) {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(row.ingredientName, 14, y);
      doc.text(row.totalQty.toFixed(2), 100, y);
      doc.text(row.unit, 140, y);
      doc.text(String(row.count), 170, y);
      y += 7;
    }

    y += 5;
    doc.setFontSize(12);
    doc.text("Waste Log", 14, y);
    y += 7;
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text("Date", 14, y);
    doc.text("Ingredient", 60, y);
    doc.text("Qty", 120, y);
    doc.text("Unit", 140, y);
    doc.text("Reason", 165, y);
    doc.setTextColor(0);
    y += 4;
    doc.line(14, y, 196, y);
    y += 5;

    doc.setFontSize(9);
    const sorted = [...wasteLogs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    for (const log of sorted) {
      if (y > 275) { doc.addPage(); y = 20; }
      doc.text(format(new Date(log.createdAt), "MMM d, yy HH:mm"), 14, y);
      doc.text(log.ingredientName.substring(0, 25), 60, y);
      doc.text(log.quantity.toFixed(2), 120, y);
      doc.text(log.unit, 140, y);
      doc.text((log.reason ?? "—").substring(0, 20), 165, y);
      y += 6;
    }

    doc.save(`waste-report-${store.replace(/\s+/g, "-").toLowerCase()}-${now.replace(/\s+/g, "-")}.pdf`);
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
          <p className="text-muted-foreground text-sm mt-1 max-w-md">Please select an organization and store from the sidebar to manage waste tracking.</p>
        </div>
      </div>
    );
  }

  const filteredLogs = (wasteLogs ?? []).filter((log) =>
    log.ingredientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.reason ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSummary = ingredientSummary.filter((row) =>
    row.ingredientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Operations</p>
          <h1 className="text-2xl font-bold tracking-tight">Waste Tracking</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{selectedStore.name}</p>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 h-9" onClick={exportToPDF}>
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 h-9">
                <Plus className="h-4 w-4" />
                Log Waste
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Waste / Spoilage</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="ingredientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ingredient</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Chicken Breast" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit</FormLabel>
                          <FormControl>
                            <Input placeholder="kg, lbs, oz..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Expired, dropped, overcooked..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={createWasteLog.isPending}>
                      {createWasteLog.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Log Waste
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="border border-border bg-card shadow-xs">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Total Entries</p>
            <p className="text-2xl font-bold">{wasteLogs?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border border-border bg-card shadow-xs">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Ingredients Wasted</p>
            <p className="text-2xl font-bold">{ingredientSummary.length}</p>
          </CardContent>
        </Card>
        <Card className="border border-border bg-card shadow-xs col-span-2 sm:col-span-1">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Most Wasted</p>
            <p className="text-xl font-bold truncate">{ingredientSummary[0]?.ingredientName ?? "—"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border">
        {[
          { key: "log" as Tab, label: "Waste Log" },
          { key: "summary" as Tab, label: "By Ingredient" },
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

      {activeTab === "log" && (
        <Card className="border border-border bg-card shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search waste logs..."
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
            ) : filteredLogs.length > 0 ? (
              <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-border hover:bg-gray-50">
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pl-5 h-9">Date & Time</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide h-9">Ingredient</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right h-9">Quantity</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide h-9">Reason</TableHead>
                      <TableHead className="w-[60px] h-9"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...filteredLogs].reverse().map((log) => (
                      <TableRow key={log.id} className="group border-b border-border/40 hover:bg-gray-50/80 transition-colors">
                        <TableCell className="pl-5 py-3 text-muted-foreground text-sm font-mono">
                          {format(new Date(log.createdAt), "MMM d, yyyy · HH:mm")}
                        </TableCell>
                        <TableCell className="font-medium text-sm py-3">{log.ingredientName}</TableCell>
                        <TableCell className="text-right font-mono font-semibold text-sm py-3">
                          {log.quantity} {log.unit}
                        </TableCell>
                        <TableCell className="text-sm py-3 text-muted-foreground">
                          {log.reason ?? <span className="text-muted-foreground/40">—</span>}
                        </TableCell>
                        <TableCell className="py-3 pr-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                            onClick={() => handleDelete(log.id)}
                            disabled={deleteWasteLog.isPending}
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
                  <Flame className="h-9 w-9 text-muted-foreground/40" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">No waste logged</h3>
                <p className="text-xs max-w-xs">
                  {searchQuery ? "No entries match your search." : "Start tracking waste and spoilage to spot patterns."}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setIsAddOpen(true)} className="mt-4" variant="outline" size="sm">
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Log Waste
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "summary" && (
        <Card className="border border-border bg-card shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ingredients..."
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
            ) : filteredSummary.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-border hover:bg-gray-50">
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pl-5 h-9">Ingredient</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right h-9">Total Wasted</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide h-9">Unit</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right h-9">Entries</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSummary.map((row) => (
                    <TableRow key={row.ingredientName} className="border-b border-border/40 hover:bg-gray-50/80 transition-colors">
                      <TableCell className="pl-5 py-3 font-medium text-sm">{row.ingredientName}</TableCell>
                      <TableCell className="text-right font-mono font-semibold text-sm py-3">{row.totalQty.toFixed(2)}</TableCell>
                      <TableCell className="text-sm py-3 text-muted-foreground">{row.unit}</TableCell>
                      <TableCell className="text-right font-mono text-sm py-3">{row.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                <div className="rounded-2xl bg-muted/50 p-5 mb-4 border border-border/60">
                  <Flame className="h-9 w-9 text-muted-foreground/40" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">No summary available</h3>
                <p className="text-xs max-w-xs">Log waste entries to see a breakdown by ingredient.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
