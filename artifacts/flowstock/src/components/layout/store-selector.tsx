import { useStore } from "@/hooks/use-store";
import { useListOrganizations, getListOrganizationsQueryKey, useListStores, getListStoresQueryKey } from "@workspace/api-client-react";
import { Store as StoreIcon, Building2 } from "lucide-react";
import { useEffect } from "react";

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

  useEffect(() => {
    // intentionally empty
  }, [organizations, selectedOrganization]);

  return (
    <div className="px-3 py-3 border-b border-slate-800 space-y-2.5">
      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
          <Building2 className="h-3 w-3" /> Organization
        </label>
        <select
          value={selectedOrganization?.id.toString() || ""}
          onChange={(e) => {
            const org = organizations?.find(o => o.id.toString() === e.target.value);
            setSelectedOrganization(org || null);
            setSelectedStore(null);
          }}
          className="w-full h-8 text-sm rounded-md border border-slate-700 bg-slate-800 text-slate-200 px-2 focus:outline-none focus:ring-1 focus:ring-[hsl(158,42%,45%)] cursor-pointer appearance-none"
        >
          <option value="" disabled>{isLoadingOrgs ? "Loading..." : "Select organization"}</option>
          {organizations?.map(org => (
            <option key={org.id} value={org.id.toString()}>{org.name}</option>
          ))}
        </select>
      </div>

      {selectedOrganization && (
        <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
          <label className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
            <StoreIcon className="h-3 w-3" /> Location
          </label>
          <select
            value={selectedStore?.id.toString() || ""}
            onChange={(e) => {
              const store = stores?.find(s => s.id.toString() === e.target.value);
              setSelectedStore(store || null);
            }}
            className="w-full h-8 text-sm rounded-md border border-[hsl(158,42%,35%)] bg-[hsl(158,42%,18%)] text-[hsl(158,42%,75%)] px-2 focus:outline-none focus:ring-1 focus:ring-[hsl(158,42%,45%)] cursor-pointer appearance-none font-medium"
          >
            <option value="" disabled>{isLoadingStores ? "Loading..." : "Select store"}</option>
            {stores?.map(store => (
              <option key={store.id} value={store.id.toString()}>{store.name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
