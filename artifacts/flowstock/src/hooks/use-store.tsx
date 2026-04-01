import { createContext, useContext, useState, ReactNode } from "react";
import { Store, Organization } from "@workspace/api-client-react";

type StoreContextType = {
  selectedStore: Store | null;
  setSelectedStore: (store: Store | null) => void;
  selectedOrganization: Organization | null;
  setSelectedOrganization: (org: Organization | null) => void;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);

  return (
    <StoreContext.Provider value={{ selectedStore, setSelectedStore, selectedOrganization, setSelectedOrganization }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
