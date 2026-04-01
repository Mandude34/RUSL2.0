import { useGetRecommendations, getGetRecommendationsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Loader2, TrendingUp, AlertTriangle, ArrowRight, PackageOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Recommendations() {
  const { data: recommendations, isLoading } = useGetRecommendations({
    query: { queryKey: getGetRecommendationsQueryKey() }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reorder Recommendations</h1>
        <p className="text-muted-foreground mt-1">Smart restock suggestions based on your sales and recipes.</p>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Suggested Restock Actions
          </CardTitle>
          <CardDescription>
            These recommendations compare your current stock against the total ingredients used in logged sales.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : recommendations && recommendations.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Ingredient</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                    <TableHead className="text-right">Total Used</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right bg-primary/5">Suggested Order</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recommendations.map((rec, i) => (
                    <TableRow key={i} className="group hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{rec.ingredientName}</TableCell>
                      <TableCell className="text-right font-mono">
                        {rec.currentStock} <span className="text-muted-foreground text-xs">{rec.unit}</span>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {rec.totalUsed} <span className="text-muted-foreground text-xs">{rec.unit}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center items-center">
                          {rec.currentStock < rec.totalUsed ? (
                            <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 shadow-none flex gap-1 items-center">
                              <AlertTriangle className="h-3 w-3" />
                              Deficit
                            </Badge>
                          ) : rec.currentStock === 0 ? (
                            <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 shadow-none">
                              Out of Stock
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20 shadow-none">
                              Low
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right bg-primary/5 font-bold text-primary font-mono">
                        <div className="flex items-center justify-end gap-2">
                          <ArrowRight className="h-4 w-4 text-primary/50 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                          {rec.orderAmount > 0 ? `+${rec.orderAmount}` : '0'} <span className="text-xs font-normal">{rec.unit}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground animate-in fade-in zoom-in-95">
              <div className="rounded-full bg-primary/10 p-6 mb-4">
                <PackageOpen className="h-10 w-10 text-primary/60" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">Inventory Looking Good</h3>
              <p className="max-w-sm text-sm">
                No reorder recommendations right now. Check back after logging more sales.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}