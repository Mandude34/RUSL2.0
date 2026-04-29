import { useEffect, useRef } from "react";
import { Show, useClerk } from '@clerk/react';
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Shell } from "@/components/layout/shell";
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory";
import Sales from "@/pages/sales";
import Recommendations from "@/pages/recommendations";
import AIPredictions from "@/pages/ai-predictions";
import Analytics from "@/pages/analytics";
import Organizations from "@/pages/organizations/index";
import OrganizationDetails from "@/pages/organizations/[id]";
import { StoreProvider } from "@/hooks/use-store";
import { LandingPage } from "@/pages/landing";
import { SignInPage, SignUpPage } from "@/pages/auth";
import { VeteranBadge } from "@/components/veteran-badge";
import Waste from "@/pages/waste";
import FoodCost from "@/pages/food-cost";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const queryClient = new QueryClient();

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <LandingPage />
      </Show>
    </>
  );
}

function ProtectedRoute({ component: Component, ...rest }: any) {
  return (
    <Route {...rest}>
      {(params) => (
        <>
          <Show when="signed-in">
            <Shell>
              <Component params={params} />
            </Shell>
          </Show>
          <Show when="signed-out">
            <Redirect to="/" />
          </Show>
        </>
      )}
    </Route>
  );
}

function AppRoutes() {
  return (
    <QueryClientProvider client={queryClient}>
      <ClerkQueryClientCacheInvalidator />
      <StoreProvider>
        <TooltipProvider>
          <Switch>
            <Route path="/" component={HomeRedirect} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />

            <ProtectedRoute path="/dashboard" component={Dashboard} />
            <ProtectedRoute path="/inventory" component={Inventory} />
            <ProtectedRoute path="/sales" component={Sales} />
            <ProtectedRoute path="/recommendations" component={Recommendations} />
            <ProtectedRoute path="/ai-predictions" component={AIPredictions} />
            <ProtectedRoute path="/analytics" component={Analytics} />
            <ProtectedRoute path="/waste" component={Waste} />
            <ProtectedRoute path="/food-cost" component={FoodCost} />
            <ProtectedRoute path="/organizations" component={Organizations} />
            <ProtectedRoute path="/organizations/:orgId" component={OrganizationDetails} />

            <Route>
              <Shell>
                <NotFound />
              </Shell>
            </Route>
          </Switch>
          <Toaster />
          <VeteranBadge />
        </TooltipProvider>
      </StoreProvider>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <AppRoutes />
    </WouterRouter>
  );
}

export default App;