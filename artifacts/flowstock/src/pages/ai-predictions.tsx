import { useState } from "react";
import { useGetAIPredictions, getGetAIPredictionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Store as StoreIcon,
  CalendarDays,
  ShieldCheck,
  AlertCircle,
  Package,
  ArrowRight,
} from "lucide-react";
import { useStore } from "@/hooks/use-store";
import { useToast } from "@/hooks/use-toast";

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "Increasing")
    return <TrendingUp className="h-4 w-4 text-emerald-600" />;
  if (trend === "Decreasing")
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

function ConfidenceBadge({ confidence }: { confidence: string }) {
  const styles: Record<string, string> = {
    High: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Medium: "bg-amber-50 text-amber-700 border-amber-200",
    Low: "bg-red-50 text-red-600 border-red-200",
  };
  return (
    <Badge className={`shadow-none font-semibold text-xs border ${styles[confidence] ?? styles["Medium"]}`}>
      <ShieldCheck className="h-3 w-3 mr-1" />
      {confidence} Confidence
    </Badge>
  );
}

export default function AIPredictions() {
  const { selectedStore, selectedOrganization } = useStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [hasRequested, setHasRequested] = useState(false);

  const queryKey = getGetAIPredictionsQueryKey({
    storeId: selectedStore?.id,
    organizationId: selectedOrganization?.id,
  });

  const { data: prediction, isLoading, isError } = useGetAIPredictions(
    { storeId: selectedStore?.id, organizationId: selectedOrganization?.id },
    {
      query: {
        queryKey,
        enabled: hasRequested && !!selectedStore,
        staleTime: 5 * 60 * 1000,
        retry: 1,
      },
    }
  );

  const handleGenerate = () => {
    queryClient.invalidateQueries({ queryKey });
    setHasRequested(true);
  };

  if (!selectedStore) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
          <StoreIcon className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Select a Store</h2>
          <p className="text-muted-foreground text-sm mt-1 max-w-md">Please select an organization and store from the sidebar to generate AI predictions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Intelligence</p>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Order Predictions
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{selectedStore.name}</p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          size="sm"
          className="gap-2 h-9"
        >
          {isLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {isLoading ? "Analyzing..." : hasRequested ? "Regenerate" : "Generate Predictions"}
        </Button>
      </div>

      {!hasRequested && !isLoading && (
        <Card className="border border-border bg-card shadow-xs border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center gap-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-2xl bg-primary/8 border border-primary/20 flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-primary/50" />
              </div>
              <div className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-sm">
                <TrendingUp className="h-3 w-3 text-white" />
              </div>
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="text-lg font-semibold">Predict Your Week with AI</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                sToK analyzes your real sales history — by day of week and weekly trends — then
                maps predicted demand to ingredient usage based on your recipes. The AI tells you
                exactly what to order, how much, and why.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-6 w-full max-w-sm">
              {[
                { label: "Sales Trends", sub: "Day-of-week patterns" },
                { label: "Recipe Mapping", sub: "Usage per menu item" },
                { label: "Smart Orders", sub: "Net of current stock" },
              ].map((f) => (
                <div key={f.label} className="text-center space-y-1 border border-border/60 rounded-lg p-3 bg-gray-50">
                  <div className="text-xs font-semibold text-foreground">{f.label}</div>
                  <div className="text-xs text-muted-foreground">{f.sub}</div>
                </div>
              ))}
            </div>
            <Button onClick={handleGenerate} size="sm" className="gap-2 h-9 mt-1">
              <Sparkles className="h-3.5 w-3.5" />
              Generate Predictions
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card className="border border-border bg-card shadow-xs">
          <CardContent className="flex flex-col items-center justify-center py-20 gap-5">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full bg-primary/15 animate-ping" />
              <div className="relative h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold text-base">Analyzing sales trends...</p>
              <p className="text-sm text-muted-foreground">Reviewing sales history, recipes, and inventory to build your forecast</p>
            </div>
          </CardContent>
        </Card>
      )}

      {isError && (
        <Card className="border border-red-200 bg-red-50">
          <CardContent className="flex items-start gap-3 py-5 px-5">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-sm text-red-700">Failed to generate predictions</p>
              <p className="text-xs text-red-600/80 mt-1">Make sure you have sales history and recipes logged for this store, then try again.</p>
              <Button variant="outline" size="sm" className="mt-3 h-7 text-xs" onClick={handleGenerate}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {prediction && !isLoading && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-400">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border border-border bg-card shadow-xs sm:col-span-2">
              <CardHeader className="border-b border-border/60 pb-3 pt-4 px-5">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Forecast Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pt-4 pb-5">
                <p className="text-sm leading-relaxed text-foreground">{prediction.summary}</p>
                {prediction.notes && (
                  <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/60">{prediction.notes}</p>
                )}
              </CardContent>
            </Card>

            <div className="space-y-3">
              {[
                {
                  label: "Predicted Period",
                  icon: CalendarDays,
                  content: <p className="text-sm font-semibold text-foreground mt-1">{prediction.predictedPeriod}</p>,
                },
                {
                  label: "Forecast Confidence",
                  icon: ShieldCheck,
                  content: <div className="mt-1.5"><ConfidenceBadge confidence={prediction.confidence} /></div>,
                },
                {
                  label: "Generated",
                  icon: RefreshCw,
                  content: (
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(prediction.generatedAt).toLocaleString("en-US", {
                        month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                      })}
                    </p>
                  ),
                },
              ].map((card) => (
                <Card key={card.label} className="border border-border bg-card shadow-xs">
                  <CardContent className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <card.icon className="h-3.5 w-3.5" />
                      {card.label}
                    </div>
                    {card.content}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="border border-border bg-card shadow-xs">
            <CardHeader className="border-b border-border/60 pb-3 pt-4 px-5">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
                  <Package className="h-4 w-4 text-primary" />
                </div>
                Ingredient Order Forecast
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Predicted usage and suggested order quantities for next week, accounting for current stock on hand.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {prediction.items.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <p className="text-sm">No ingredient predictions available. Add more sales and recipes for better insights.</p>
                </div>
              ) : (
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 border-b border-border hover:bg-gray-50">
                        <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pl-5 h-9">Ingredient</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right h-9">Current Stock</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right h-9">Predicted Usage</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center h-9">Trend</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide h-9">Insight</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right bg-primary/5 h-9 pr-5">Order Qty</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prediction.items.map((item, i) => (
                        <TableRow key={i} className="group border-b border-border/40 hover:bg-gray-50/80 transition-colors">
                          <TableCell className="font-medium text-sm pl-5 py-3">{item.ingredientName}</TableCell>
                          <TableCell className="text-right font-mono text-sm py-3">
                            {item.currentStock}{" "}
                            <span className="text-muted-foreground text-xs">{item.unit}</span>
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm py-3">
                            {item.predictedUsage}{" "}
                            <span className="text-muted-foreground text-xs">{item.unit}</span>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <TrendIcon trend={item.trend} />
                              <span className="text-xs text-muted-foreground">{item.trend}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[220px] py-3 leading-relaxed">
                            {item.insight}
                          </TableCell>
                          <TableCell className="text-right bg-primary/5 font-bold text-primary font-mono text-sm py-3 pr-5">
                            <div className="flex items-center justify-end gap-2">
                              <ArrowRight className="h-3.5 w-3.5 text-primary/40 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                              {item.suggestedOrder > 0 ? (
                                <span>+{item.suggestedOrder}{" "}<span className="text-xs font-normal text-primary/70">{item.unit}</span></span>
                              ) : (
                                <span className="text-muted-foreground font-normal text-sm">Sufficient</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
