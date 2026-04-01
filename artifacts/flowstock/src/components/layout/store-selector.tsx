import { useStore } from "@/hooks/use-store";
import { useListOrganizations, getListOrganizationsQueryKey, useListStores, getListStoresQueryKey } from "@workspace/api-client-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store as StoreIcon, Building2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export function StoreSelector() {
  const { selectedStore, setSelectedStore, selectedOrganization, setSelectedOrganization } = useStore();

  const { data: organizations, isLoading: isLoadingOrgs } = useListOrganizations({
    query: { queryKey: getListOrganizationsQueryKey() }
  });

  const { data: stores, isLoading: isLoadingStores } = useListStores(
    selectedOrganization?.id || 0,
    {
      query: {
        queryKey: getListStoresQueryKey(selectedOrganization?.id || 0),
        enabled: !!selectedOrganization?.id
      }
    }
  );

  // Auto-select first org if none selected and orgs exist
  useEffect(() => {
    if (!selectedOrganization && organizations && organizations.length > 0) {
      // We don't auto-select to avoid confusion, or maybe we do? Let's leave it null until user selects.
    }
  }, [organizations, selectedOrganization]);

  return (
    <div className="px-4 py-4 border-b bg-card/50 space-y-3">
      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Building2 className="h-3 w-3" /> Organization
        </label>
        <Select
          value={selectedOrganization?.id.toString() || ""}
          onValueChange={(val) => {
            const org = organizations?.find(o => o.id.toString() === val);
            setSelectedOrganization(org || null);
            setSelectedStore(null); // Reset store when org changes
          }}
        >
          <SelectTrigger className="w-full h-8 text-sm">
            <SelectValue placeholder={isLoadingOrgs ? "Loading..." : "Select Organization"} />
          </SelectTrigger>
          <SelectContent>
            {organizations?.map(org => (
              <SelectItem key={org.id} value={org.id.toString()}>{org.name}</SelectItem>
            ))}
            {(!organizations || organizations.length === 0) && !isLoadingOrgs && (
              <SelectItem value="none" disabled>No organizations</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {selectedOrganization && (
        <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <StoreIcon className="h-3 w-3" /> Store
          </label>
          <Select
            value={selectedStore?.id.toString() || ""}
            onValueChange={(val) => {
              const store = stores?.find(s => s.id.toString() === val);
              setSelectedStore(store || null);
            }}
          >
            <SelectTrigger className="w-full h-8 text-sm bg-primary/5 border-primary/20">
              <SelectValue placeholder={isLoadingStores ? "Loading..." : "Select Store"} />
            </SelectTrigger>
            <SelectContent>
              {stores?.map(store => (
                <SelectItem key={store.id} value={store.id.toString()}>{store.name}</SelectItem>
              ))}
              {(!stores || stores.length === 0) && !isLoadingStores && (
                <SelectItem value="none" disabled>No stores found</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
