import { useState } from "react";
import {
  useListInventory,
  getListInventoryQueryKey,
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useDeleteInventoryItem
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Search, Trash2, Edit2, Package, Store as StoreIcon, Boxes } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useStore } from "@/hooks/use-store";

const inventorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  unit: z.string().min(1, "Unit is required"),
  minStock: z.coerce.number().min(0).optional(),
  costPerUnit: z.coerce.number().min(0).optional(),
});

const stockSchema = z.object({
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
});

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isStockOpen, setIsStockOpen] = useState(false);
  const [stockItem, setStockItem] = useState<any>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { selectedStore } = useStore();

  const { data: inventory, isLoading } = useListInventory(
    { storeId: selectedStore?.id },
    {
      query: {
        queryKey: getListInventoryQueryKey({ storeId: selectedStore?.id }),
        enabled: !!selectedStore
      }
    }
  );

  const createItem = useCreateInventoryItem();
  const updateItem = useUpdateInventoryItem();
  const deleteItem = useDeleteInventoryItem();

  const form = useForm<z.infer<typeof inventorySchema>>({
    resolver: zodResolver(inventorySchema),
    defaultValues: { name: "", stock: 0, unit: "kg", minStock: undefined, costPerUnit: undefined },
  });

  const stockForm = useForm<z.infer<typeof stockSchema>>({
    resolver: zodResolver(stockSchema),
    defaultValues: { stock: 0 },
  });

  const onSubmit = (values: z.infer<typeof inventorySchema>) => {
    if (editingItem) {
      updateItem.mutate(
        { id: editingItem.id, data: values },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListInventoryQueryKey({ storeId: selectedStore?.id }) });
            toast({ title: "Item updated" });
            setIsAddOpen(false);
            setEditingItem(null);
            form.reset();
          },
          onError: () => toast({ title: "Failed to update item", variant: "destructive" }),
        }
      );
    } else {
      createItem.mutate(
        { data: { ...values, storeId: selectedStore?.id } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListInventoryQueryKey({ storeId: selectedStore?.id }) });
            toast({ title: "Ingredient added" });
            setIsAddOpen(false);
            form.reset();
          },
          onError: () => toast({ title: "Failed to add item", variant: "destructive" }),
        }
      );
    }
  };

  const onStockSubmit = (values: z.infer<typeof stockSchema>) => {
    if (!stockItem) return;
    updateItem.mutate(
      {
        id: stockItem.id,
        data: {
          name: stockItem.name,
          stock: values.stock,
          unit: stockItem.unit,
          minStock: stockItem.minStock ?? undefined,
          costPerUnit: stockItem.costPerUnit ?? undefined,
        }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListInventoryQueryKey({ storeId: selectedStore?.id }) });
          toast({ title: `Stock updated — ${stockItem.name}: ${values.stock} ${stockItem.unit}` });
          setIsStockOpen(false);
          setStockItem(null);
          stockForm.reset();
        },
        onError: () => toast({ title: "Failed to update stock", variant: "destructive" }),
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteItem.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListInventoryQueryKey({ storeId: selectedStore?.id }) });
          toast({ title: "Item deleted" });
        },
        onError: () => toast({ title: "Failed to delete item", variant: "destructive" }),
      }
    );
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    form.reset({ name: item.name, stock: item.stock, unit: item.unit, minStock: item.minStock ?? undefined, costPerUnit: item.costPerUnit ?? undefined });
    setIsAddOpen(true);
  };

  const openStockEdit = (item: any) => {
    setStockItem(item);
    stockForm.reset({ stock: item.stock });
    setIsStockOpen(true);
  };

  const adjustStock = (delta: number) => {
    const current = stockForm.getValues("stock");
    stockForm.setValue("stock", Math.max(0, Number(current) + delta));
  };

  if (!selectedStore) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
          <StoreIcon className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Select a Store</h2>
          <p className="text-muted-foreground text-sm mt-1 max-w-md">Please select an organization and store from the sidebar to manage inventory.</p>
        </div>
      </div>
    );
  }

  const filteredInventory = inventory?.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Stock Management</p>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{selectedStore.name}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Stock Update Dialog */}
          <Dialog open={isStockOpen} onOpenChange={(open) => {
            setIsStockOpen(open);
            if (!open) { setStockItem(null); stockForm.reset(); }
          }}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Update Stock</DialogTitle>
                <DialogDescription>
                  {stockItem ? `Adjust current stock level for ${stockItem.name}` : "Adjust stock"}
                </DialogDescription>
              </DialogHeader>
              {stockItem && (
                <div className="space-y-5">
                  <div className="rounded-lg bg-muted/60 border border-border px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Current stock</p>
                      <p className="text-2xl font-bold font-mono mt-0.5">{stockItem.stock} <span className="text-sm font-normal text-muted-foreground">{stockItem.unit}</span></p>
                    </div>
                    <Boxes className="h-8 w-8 text-muted-foreground/30" />
                  </div>

                  <Form {...stockForm}>
                    <form onSubmit={stockForm.handleSubmit(onStockSubmit)} className="space-y-4">
                      <FormField
                        control={stockForm.control}
                        name="stock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Stock Level ({stockItem.unit})</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0" className="text-lg font-mono h-11" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div>
                        <p className="text-xs text-muted-foreground mb-2 font-medium">Quick adjust</p>
                        <div className="flex gap-2 flex-wrap">
                          {[-50, -10, -5, +5, +10, +50].map(delta => (
                            <Button
                              key={delta}
                              type="button"
                              variant="outline"
                              size="sm"
                              className={`text-xs font-mono h-7 px-2.5 ${delta > 0 ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50' : 'border-red-200 text-red-600 hover:bg-red-50'}`}
                              onClick={() => adjustStock(delta)}
                            >
                              {delta > 0 ? `+${delta}` : delta}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={updateItem.isPending} className="w-full">
                          {updateItem.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Save Stock Level
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Add / Edit Item Dialog */}
          <Dialog open={isAddOpen} onOpenChange={(open) => {
            setIsAddOpen(open);
            if (!open) { setEditingItem(null); form.reset({ name: "", stock: 0, unit: "kg", minStock: undefined }); }
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 h-9">
                <Plus className="h-4 w-4" />
                Add Ingredient
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Ingredient' : 'Add Ingredient'}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Flour" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Stock</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
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
                            <Input placeholder="kg, L, pcs" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="minStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reorder Alert Threshold</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="e.g. 10" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">When stock falls to or below this level, it appears in Recommendations. Leave blank to disable.</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="costPerUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost Per Unit ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" placeholder="e.g. 2.50" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">Used to calculate food cost in the Food Cost Report. Leave blank if unknown.</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={createItem.isPending || updateItem.isPending}>
                      {createItem.isPending || updateItem.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {editingItem ? 'Save Changes' : 'Add Item'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border border-border bg-white shadow-xs">
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
          ) : filteredInventory.length > 0 ? (
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-border hover:bg-gray-50">
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pl-5 h-9">Ingredient</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right h-9">Current Stock</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide h-9">Unit</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right h-9">Min. Threshold</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right h-9">Cost/Unit</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center h-9">Status</TableHead>
                    <TableHead className="w-[180px] h-9 text-right pr-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item) => {
                    const isLow = item.minStock != null && item.stock <= item.minStock;
                    return (
                      <TableRow key={item.id} className="group border-b border-border/40 hover:bg-gray-50/80 transition-colors">
                        <TableCell className="font-medium text-sm pl-5 py-3">{item.name}</TableCell>
                        <TableCell className="text-right font-mono text-sm font-semibold py-3">
                          <span className={isLow ? "text-red-600" : "text-foreground"}>{item.stock}</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm py-3">{item.unit}</TableCell>
                        <TableCell className="text-right text-muted-foreground font-mono text-sm py-3">
                          {item.minStock != null ? item.minStock : <span className="text-muted-foreground/40">—</span>}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground font-mono text-sm py-3">
                          {item.costPerUnit != null ? `$${item.costPerUnit.toFixed(2)}` : <span className="text-muted-foreground/40">—</span>}
                        </TableCell>
                        <TableCell className="text-center py-3">
                          {isLow ? (
                            <Badge className="bg-red-50 text-red-600 border border-red-200 shadow-none text-xs font-semibold">Low Stock</Badge>
                          ) : (
                            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-none text-xs font-semibold">Optimal</Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-2 pr-4">
                          <div className="flex justify-end items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100 gap-1"
                              onClick={() => openStockEdit(item)}
                            >
                              <Boxes className="h-3 w-3" />
                              Stock
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs text-muted-foreground border-border hover:bg-muted gap-1"
                              onClick={() => openEdit(item)}
                            >
                              <Edit2 className="h-3 w-3" />
                              Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="h-7 px-2 text-xs text-destructive border-red-200 bg-red-50 hover:bg-red-100 gap-1">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete {item.name}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently remove this ingredient from your inventory. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
              <div className="rounded-2xl bg-muted/50 p-5 mb-4 border border-border/60">
                <Package className="h-9 w-9 text-muted-foreground/40" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">No ingredients found</h3>
              <p className="text-xs max-w-xs">
                {searchQuery ? "Try adjusting your search." : "Add your first ingredient to start tracking stock levels."}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsAddOpen(true)} className="mt-4" variant="outline" size="sm">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add Ingredient
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
