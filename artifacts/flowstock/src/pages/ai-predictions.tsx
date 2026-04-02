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
    return <TrendingUp className="h-4 w-4 text-emerald-500" />;
  if (trend === "Decreasing")
    return <TrendingDown className="h-4 w-4 text-red-400" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

function ConfidenceBadge({ confidence }: { confidence: string }) {
  const variants: Record<string, string> = {
    High: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    Medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    Low: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  return (
    <Badge
      variant="outline"
      className={`shadow-none font-medium ${variants[confidence] ?? variants["Medium"]}`}
    >
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

  const { data: prediction, isLoading, isError, error } = useGetAIPredictions(
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
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <StoreIcon className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold">Select a Store</h2>
        <p className="text-muted-foreground max-w-md">
          Please select an organization and a store from the sidebar to generate AI predictions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" />
            AI Order Predictions
          </h1>
          <p className="text-muted-foreground mt-1">
            Predict exactly what to order using AI trend analysis for {selectedStore.name}.
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          className="gap-2"
          size="lg"
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {isLoading ? "Analyzing trends..." : hasRequested ? "Regenerate" : "Generate Predictions"}
        </Button>
      </div>

      {!hasRequested && !isLoading && (
        <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center gap-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-primary/60" />
              </div>
              <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center">
                <TrendingUp className="h-3 w-3 text-white" />
              </div>
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="text-xl font-semibold">Predict Your Week with AI</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                FlowStock analyzes your real sales history — by day of week and weekly trends — then
                maps predicted demand to ingredient usage based on your recipes. The AI tells you
                exactly what to order, how much, and why.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 w-full max-w-sm text-center text-xs text-muted-foreground">
              <div className="space-y-1">
                <div className="font-semibold text-foreground text-sm">Sales Trends</div>
                <div>Day-of-week patterns</div>
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-foreground text-sm">Recipe Mapping</div>
                <div>Usage per menu item</div>
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-foreground text-sm">Smart Orders</div>
                <div>Net of current stock</div>
              </div>
            </div>
            <Button onClick={handleGenerate} size="lg" className="gap-2 mt-2">
              <Sparkles className="h-4 w-4" />
              Generate Predictions
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              <div className="relative h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold text-lg">Analyzing your sales trends...</p>
              <p className="text-sm text-muted-foreground">
                Reviewing sales history, recipes, and inventory to build your forecast
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isError && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-start gap-3 py-6">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-destructive">Failed to generate predictions</p>
              <p className="text-sm text-muted-foreground mt-1">
                Make sure you have sales history and recipes logged for this store, then try again.
              </p>
              <Button variant="outline" size="sm" className="mt-3" onClick={handleGenerate}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {prediction && !isLoading && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-400">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2 text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Forecast Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{prediction.summary}</p>
                {prediction.notes && (
                  <p className="text-xs text-muted-foreground mt-3 border-t pt-3">{prediction.notes}</p>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Predicted Period
                  </div>
                  <p className="font-semibold text-sm">{prediction.predictedPeriod}</p>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm">
                <CardContent className="pt-4 pb-3">
                  <div className="text-muted-foreground text-xs mb-2">Forecast Confidence</div>
                  <ConfidenceBadge confidence={prediction.confidence} />
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm">
                <CardContent className="pt-4 pb-3">
                  <div className="text-muted-foreground text-xs mb-1">Generated</div>
                  <p className="text-xs text-foreground">
                    {new Date(prediction.generatedAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Ingredient Order Forecast
              </CardTitle>
              <CardDescription>
                Predicted usage and suggested order quantities for next week, accounting for current stock.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {prediction.items.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <p>No ingredient predictions available. Add more sales and recipes for better insights.</p>
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Ingredient</TableHead>
                        <TableHead className="text-right">Current Stock</TableHead>
                        <TableHead className="text-right">Predicted Usage</TableHead>
                        <TableHead className="text-center">Trend</TableHead>
                        <TableHead className="text-left">Insight</TableHead>
                        <TableHead className="text-right bg-primary/5">Order Qty</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prediction.items.map((item, i) => (
                        <TableRow key={i} className="group hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium">{item.ingredientName}</TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {item.currentStock}{" "}
                            <span className="text-muted-foreground text-xs">{item.unit}</span>
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {item.predictedUsage}{" "}
                            <span className="text-muted-foreground text-xs">{item.unit}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1.5">
                              <TrendIcon trend={item.trend} />
                              <span className="text-xs text-muted-foreground">{item.trend}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[240px]">
                            {item.insight}
                          </TableCell>
                          <TableCell className="text-right bg-primary/5 font-bold text-primary font-mono">
                            <div className="flex items-center justify-end gap-2">
                              <ArrowRight className="h-4 w-4 text-primary/40 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                              {item.suggestedOrder > 0 ? (
                                <span>
                                  +{item.suggestedOrder}{" "}
                                  <span className="text-xs font-normal text-primary/70">{item.unit}</span>
                                </span>
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
