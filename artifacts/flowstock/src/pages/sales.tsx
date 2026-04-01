import { useState } from "react";
import { 
  useListSales, 
  getListSalesQueryKey,
  getListInventoryQueryKey,
  getGetRecommendationsQueryKey,
  useCreateSale,
  useDeleteSale
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { format } from "date-fns";
import { useStore } from "@/hooks/use-store";

const saleSchema = z.object({
  menuItem: z.string().min(1, "Menu item name is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

export default function Sales() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  
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
    defaultValues: {
      menuItem: "",
      quantity: 1,
    },
  });

  const onSubmit = (values: z.infer<typeof saleSchema>) => {
    createSale.mutate(
      { data: { ...values, storeId: selectedStore?.id } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSalesQueryKey({ storeId: selectedStore?.id }) });
          queryClient.invalidateQueries({ queryKey: getListInventoryQueryKey({ storeId: selectedStore?.id }) });
          queryClient.invalidateQueries({ queryKey: getGetRecommendationsQueryKey({ storeId: selectedStore?.id }) });
          toast({ title: "Sale logged successfully" });
          setIsAddOpen(false);
          form.reset();
        },
        onError: () => {
          toast({ title: "Failed to log sale", variant: "destructive" });
        }
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
          toast({ title: "Sale deleted" });
        },
        onError: () => {
          toast({ title: "Failed to delete sale", variant: "destructive" });
        }
      }
    );
  };

  if (!selectedStore) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <StoreIcon className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold">Select a Store</h2>
        <p className="text-muted-foreground max-w-md">Please select an organization and a store from the sidebar to manage sales.</p>
      </div>
    );
  }

  const filteredSales = sales?.filter(sale => 
    sale.menuItem.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
          <p className="text-muted-foreground mt-1">Log and track sold menu items for {selectedStore.name}.</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="hover-elevate">
              <Plus className="mr-2 h-4 w-4" />
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
                        <Input placeholder="e.g. Burger" {...field} />
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

      <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm">
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search sales..." 
              className="pl-9 max-w-sm bg-background/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredSales.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Menu Item</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id} className="group transition-colors">
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(sale.createdAt), "MMM d, yyyy HH:mm")}
                      </TableCell>
                      <TableCell className="font-medium">{sale.menuItem}</TableCell>
                      <TableCell className="text-right font-mono font-medium">{sale.quantity}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                          onClick={() => handleDelete(sale.id)}
                          disabled={deleteSale.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground animate-in fade-in zoom-in-95">
              <div className="rounded-full bg-muted/50 p-6 mb-4">
                <Receipt className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">No sales recorded</h3>
              <p className="max-w-sm text-sm">
                {searchQuery ? "No sales match your search." : "Log your first sale to track what's selling."}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsAddOpen(true)} className="mt-4" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Log Sale
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}