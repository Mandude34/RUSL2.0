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
    <div className="px-3 pb-4 space-y-1.5 shrink-0">
      <div className="relative">
        <select
          value={selectedOrganization?.id.toString() || ""}
          onChange={(e) => {
            const org = organizations?.find(o => o.id.toString() === e.target.value);
            setSelectedOrganization(org || null);
            setSelectedStore(null);
          }}
          className="w-full appearance-none bg-[#161B22] border border-transparent hover:border-gray-800 text-gray-300 py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#22D3EE] transition-all cursor-pointer"
        >
          <option value="" disabled>{isLoadingOrgs ? "Loading..." : "Select organization"}</option>
          {organizations?.map(org => (
            <option key={org.id} value={org.id.toString()}>{org.name}</option>
          ))}
        </select>
        <Building2 className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-500 pointer-events-none" />
      </div>

      {selectedOrganization && (
        <div className="relative animate-in fade-in slide-in-from-top-1">
          <select
            value={selectedStore?.id.toString() || ""}
            onChange={(e) => {
              const store = stores?.find(s => s.id.toString() === e.target.value);
              setSelectedStore(store || null);
            }}
            className="w-full appearance-none bg-[#161B22] border border-transparent hover:border-gray-800 text-gray-300 py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#22D3EE] transition-all cursor-pointer font-medium"
          >
            <option value="" disabled>{isLoadingStores ? "Loading..." : "Select store"}</option>
            {stores?.map(store => (
              <option key={store.id} value={store.id.toString()}>{store.name}</option>
            ))}
          </select>
          <StoreIcon className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      )}
    </div>
  );
}
