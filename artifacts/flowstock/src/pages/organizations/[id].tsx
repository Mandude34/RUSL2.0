import { useRoute } from "wouter";
import { 
  useListStores, 
  getListStoresQueryKey, 
  useCreateStore, 
  useDeleteStore,
  useListCompanyRecipes,
  getListCompanyRecipesQueryKey,
  useCreateCompanyRecipe,
  useDeleteCompanyRecipe,
  useListOrganizations,
  getListOrganizationsQueryKey,
  useListInventory,
  getListInventoryQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Store as StoreIcon, ChefHat, Plus, Trash2, Building2, MapPin, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

const storeSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  address: z.string().optional(),
});

const recipeSchema = z.object({
  menuItem: z.string().min(1, "Menu item name is required"),
  ingredients: z.array(z.object({
    ingredientName: z.string().min(1, "Ingredient is required"),
    amountPerServing: z.coerce.number().min(0.01, "Amount must be greater than 0")
  })).min(1, "At least one ingredient is required"),
});

export default function OrganizationDetails() {
  const [, params] = useRoute("/organizations/:orgId");
  const orgId = params?.orgId ? parseInt(params.orgId) : 0;
  
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [isAddRecipeOpen, setIsAddRecipeOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: organizations } = useListOrganizations({
    query: { queryKey: getListOrganizationsQueryKey() }
  });
  const org = organizations?.find(o => o.id === orgId);

  const { data: stores, isLoading: isLoadingStores } = useListStores(orgId, {
    query: { queryKey: getListStoresQueryKey(orgId), enabled: !!orgId }
  });

  const { data: companyRecipes, isLoading: isLoadingRecipes } = useListCompanyRecipes(orgId, {
    query: { queryKey: getListCompanyRecipesQueryKey(orgId), enabled: !!orgId }
  });

  const createStore = useCreateStore();
  const deleteStore = useDeleteStore();
  const createRecipe = useCreateCompanyRecipe();
  const deleteRecipe = useDeleteCompanyRecipe();

  const storeForm = useForm<z.infer<typeof storeSchema>>({
    resolver: zodResolver(storeSchema),
    defaultValues: { name: "", address: "" },
  });

  const recipeForm = useForm<z.infer<typeof recipeSchema>>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      menuItem: "",
      ingredients: [{ ingredientName: "", amountPerServing: 1 }],
    },
  });

  const { fields: recipeFields, append: appendRecipe, remove: removeRecipe } = useFieldArray({
    name: "ingredients",
    control: recipeForm.control,
  });

  const onStoreSubmit = (values: z.infer<typeof storeSchema>) => {
    createStore.mutate(
      { id: orgId, data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListStoresQueryKey(orgId) });
          toast({ title: "Store added successfully" });
          setIsAddStoreOpen(false);
          storeForm.reset();
        },
        onError: () => toast({ title: "Failed to add store", variant: "destructive" })
      }
    );
  };

  const handleStoreDelete = (id: number) => {
    deleteStore.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListStoresQueryKey(orgId) });
          toast({ title: "Store deleted" });
        },
        onError: () => toast({ title: "Failed to delete store", variant: "destructive" })
      }
    );
  };

  const onRecipeSubmit = (values: z.infer<typeof recipeSchema>) => {
    createRecipe.mutate(
      { id: orgId, data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCompanyRecipesQueryKey(orgId) });
          toast({ title: "Company recipe created" });
          setIsAddRecipeOpen(false);
          recipeForm.reset({ menuItem: "", ingredients: [{ ingredientName: "", amountPerServing: 1 }] });
        },
        onError: () => toast({ title: "Failed to create recipe", variant: "destructive" })
      }
    );
  };

  const handleRecipeDelete = (id: number) => {
    deleteRecipe.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCompanyRecipesQueryKey(orgId) });
          toast({ title: "Company recipe deleted" });
        },
        onError: () => toast({ title: "Failed to delete recipe", variant: "destructive" })
      }
    );
  };

  if (!org) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Building2 className="h-4 w-4" />
          <span className="text-sm font-medium">Organization</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{org.name}</h1>
      </div>

      <Tabs defaultValue="stores" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="stores">Stores</TabsTrigger>
          <TabsTrigger value="recipes">Company Recipes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stores" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Stores</h2>
            <Dialog open={isAddStoreOpen} onOpenChange={(open) => {
              setIsAddStoreOpen(open);
              if (!open) storeForm.reset();
            }}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Store</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Store</DialogTitle>
                </DialogHeader>
                <Form {...storeForm}>
                  <form onSubmit={storeForm.handleSubmit(onStoreSubmit)} className="space-y-4">
                    <FormField
                      control={storeForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Downtown Location" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={storeForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={createStore.isPending}>
                        {createStore.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Add Store
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoadingStores ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : stores && stores.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stores.map(store => (
                <Card key={store.id} className="group border-border/50 bg-card/50 backdrop-blur hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                    <div className="space-y-1.5">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <StoreIcon className="h-4 w-4 text-primary" /> {store.name}
                      </CardTitle>
                      {store.address && (
                        <CardDescription className="flex items-center gap-1.5 text-xs">
                          <MapPin className="h-3 w-3" /> {store.address}
                        </CardDescription>
                      )}
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive -mr-2 -mt-2">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Store?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{store.name}" and all its inventory and sales.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleStoreDelete(store.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">Added {format(new Date(store.createdAt), "MMM d, yyyy")}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-card/50 border-dashed text-muted-foreground">
              <StoreIcon className="h-10 w-10 mx-auto mb-4 opacity-50" />
              <p>No stores added yet.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recipes" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Company Recipes</h2>
              <p className="text-sm text-muted-foreground">Shared across all stores in {org.name}</p>
            </div>
            <Dialog open={isAddRecipeOpen} onOpenChange={(open) => {
              setIsAddRecipeOpen(open);
              if (!open) recipeForm.reset();
            }}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Create Company Recipe</Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Company Recipe</DialogTitle>
                </DialogHeader>
                <Form {...recipeForm}>
                  <form onSubmit={recipeForm.handleSubmit(onRecipeSubmit)} className="space-y-6">
                    <FormField
                      control={recipeForm.control}
                      name="menuItem"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Menu Item Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Signature Burger" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <FormLabel>Ingredients per Serving</FormLabel>
                        <Button type="button" variant="outline" size="sm" onClick={() => appendRecipe({ ingredientName: "", amountPerServing: 1 })}>
                          <Plus className="mr-2 h-3 w-3" /> Add Ingredient
                        </Button>
                      </div>
                      {recipeFields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                          <FormField
                            control={recipeForm.control}
                            name={`ingredients.${index}.ingredientName`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel className="text-xs">Ingredient Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ingredient" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={recipeForm.control}
                            name={`ingredients.${index}.amountPerServing`}
                            render={({ field }) => (
                              <FormItem className="w-[120px]">
                                <FormLabel className="text-xs">Amount</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button 
                            type="button" variant="ghost" size="icon" 
                            className="mb-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeRecipe(index)} disabled={recipeFields.length === 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {recipeForm.formState.errors.ingredients?.root && (
                        <p className="text-sm font-medium text-destructive">{recipeForm.formState.errors.ingredients.root.message}</p>
                      )}
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={createRecipe.isPending}>
                        {createRecipe.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save Recipe
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoadingRecipes ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : companyRecipes && companyRecipes.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {companyRecipes.map(recipe => (
                <Card key={recipe.id} className="group relative border-border/50 bg-card/50 backdrop-blur hover:shadow-md transition-all duration-200">
                  <Button 
                    variant="ghost" size="icon" 
                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive z-10"
                    onClick={() => handleRecipeDelete(recipe.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <CardHeader className="pb-3">
                    <CardTitle className="pr-8">{recipe.menuItem}</CardTitle>
                    <CardDescription>{recipe.ingredients.length} ingredients</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {recipe.ingredients.map((ing, i) => (
                        <div key={i} className="flex justify-between items-center text-sm p-2 rounded-md bg-muted/40 group-hover:bg-muted/60 transition-colors">
                          <span className="font-medium">{ing.ingredientName}</span>
                          <span className="font-mono">{ing.amountPerServing}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-card/50 border-dashed text-muted-foreground">
              <ChefHat className="h-10 w-10 mx-auto mb-4 opacity-50" />
              <p>No company recipes added yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
