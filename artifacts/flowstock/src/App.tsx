import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Shell } from "@/components/layout/shell";
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory";
import Sales from "@/pages/sales";
import Recipes from "@/pages/recipes";
import Recommendations from "@/pages/recommendations";
import Organizations from "@/pages/organizations/index";
import OrganizationDetails from "@/pages/organizations/[id]";
import { StoreProvider } from "@/hooks/use-store";

const queryClient = new QueryClient();

function Router() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/sales" component={Sales} />
        <Route path="/recipes" component={Recipes} />
        <Route path="/recommendations" component={Recommendations} />
        <Route path="/organizations" component={Organizations} />
        <Route path="/organizations/:orgId" component={OrganizationDetails} />
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </StoreProvider>
    </QueryClientProvider>
  );
}

export default App;