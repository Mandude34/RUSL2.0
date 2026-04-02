import { useState } from "react";
import { 
  useListRecipes, 
  getListRecipesQueryKey,
  useCreateRecipe,
  useDeleteRecipe,
  useListInventory,
  getListInventoryQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Loader2, Plus, Search, Trash2, ChefHat, X, Store as StoreIcon, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/hooks/use-store";

const recipeSchema = z.object({
  menuItem: z.string().min(1, "Menu item name is required"),
  menuPrice: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z.number().min(0).optional()
  ),
  ingredients: z.array(z.object({
    ingredientName: z.string().min(1, "Ingredient is required"),
    amountPerServing: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
      z.number().min(0.01, "Amount must be greater than 0")
    ),
  })).min(1, "At least one ingredient is required"),
});

export default function Recipes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { selectedStore, selectedOrganization } = useStore();

  const { data: recipes, isLoading: isLoadingRecipes } = useListRecipes(
    { storeId: selectedStore?.id, organizationId: selectedOrganization?.id },
    {
      query: { 
        queryKey: getListRecipesQueryKey({ storeId: selectedStore?.id, organizationId: selectedOrganization?.id }),
        enabled: !!selectedStore
      }
    }
  );

  const { data: inventory } = useListInventory(
    { storeId: selectedStore?.id },
    {
      query: { 
        queryKey: getListInventoryQueryKey({ storeId: selectedStore?.id }),
        enabled: !!selectedStore
      }
    }
  );

  const createRecipe = useCreateRecipe();
  const deleteRecipe = useDeleteRecipe();

  const form = useForm<z.infer<typeof recipeSchema>>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      menuItem: "",
      menuPrice: undefined,
      ingredients: [{ ingredientName: "", amountPerServing: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "ingredients",
    control: form.control,
  });

  const onSubmit = (values: z.infer<typeof recipeSchema>) => {
    createRecipe.mutate(
      { data: { ...values, storeId: selectedStore?.id } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListRecipesQueryKey({ storeId: selectedStore?.id, organizationId: selectedOrganization?.id }) });
          toast({ title: "Recipe created successfully" });
          setIsAddOpen(false);
          form.reset({
            menuItem: "",
            menuPrice: undefined,
            ingredients: [{ ingredientName: "", amountPerServing: 1 }],
          });
        },
        onError: () => {
          toast({ title: "Failed to create recipe", variant: "destructive" });
        }
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteRecipe.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListRecipesQueryKey({ storeId: selectedStore?.id, organizationId: selectedOrganization?.id }) });
          toast({ title: "Recipe deleted" });
        },
        onError: () => {
          toast({ title: "Failed to delete recipe", variant: "destructive" });
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
        <p className="text-muted-foreground max-w-md">Please select an organization and a store from the sidebar to manage recipes.</p>
      </div>
    );
  }

  const filteredRecipes = recipes?.filter(recipe => 
    recipe.menuItem.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recipes</h1>
          <p className="text-muted-foreground mt-1">Define ingredients used per menu item for {selectedStore.name}.</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) {
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="hover-elevate">
              <Plus className="mr-2 h-4 w-4" />
              Create Store Recipe
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Store Recipe</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="menuItem"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Menu Item Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Classic Cheeseburger" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="menuPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Menu Price ($) <span className="text-muted-foreground font-normal text-xs">(optional)</span></FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" placeholder="e.g. 14.99" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium leading-none">Ingredients per Serving</label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => append({ ingredientName: "", amountPerServing: 1 })}
                    >
                      <Plus className="mr-2 h-3 w-3" />
                      Add Ingredient
                    </Button>
                  </div>
                  
                  {fields.map((arrayField, index) => (
                    <div key={arrayField.id} className="flex items-end gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.ingredientName`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel className="text-xs">Ingredient</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select ingredient" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {inventory?.map((item) => (
                                  <SelectItem key={item.id} value={item.name}>
                                    {item.name} ({item.unit})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
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
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="mb-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {form.formState.errors.ingredients?.root && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.ingredients.root.message}
                    </p>
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

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search recipes..." 
          className="pl-9 max-w-sm bg-background/50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoadingRecipes ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredRecipes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <Card key={recipe.id} className="group relative border-border/50 bg-card/50 backdrop-blur hover:shadow-md transition-all duration-200">
              {!recipe.isCompanyRecipe && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive z-10"
                  onClick={() => handleDelete(recipe.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between pr-6">
                  <CardTitle className="pr-2 leading-tight">{recipe.menuItem}</CardTitle>
                  {recipe.isCompanyRecipe && (
                    <Badge variant="secondary" className="flex items-center gap-1 text-[10px] shrink-0 whitespace-nowrap">
                      <Building2 className="h-3 w-3" /> Company
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {recipe.ingredients.length} {recipe.ingredients.length === 1 ? 'ingredient' : 'ingredients'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recipe.ingredients.map((ing, i) => {
                    const invItem = inventory?.find(item => item.name === ing.ingredientName);
                    return (
                      <div key={i} className="flex justify-between items-center text-sm p-2 rounded-md bg-muted/40 group-hover:bg-muted/60 transition-colors">
                        <span className="font-medium">{ing.ingredientName}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{ing.amountPerServing} {invItem?.unit || ''}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground border rounded-lg bg-card/50 border-dashed animate-in fade-in zoom-in-95">
          <div className="rounded-full bg-muted/50 p-6 mb-4">
            <ChefHat className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">No recipes found</h3>
          <p className="max-w-sm text-sm">
            {searchQuery ? "Try adjusting your search query." : "Create your first recipe to map ingredients to sales."}
          </p>
          {!searchQuery && (
            <Button onClick={() => setIsAddOpen(true)} className="mt-4" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Create Recipe
            </Button>
          )}
        </div>
      )}
    </div>
  );
}