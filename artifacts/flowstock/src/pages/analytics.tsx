import { useGetAnalytics, getGetAnalyticsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Store as StoreIcon, BarChart3, Package, ShoppingCart, TrendingUp, AlertTriangle } from "lucide-react";
import { useStore } from "@/hooks/use-store";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area,
} from "recharts";
import { format, parseISO } from "date-fns";

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f97316"];

const TABS = [
  { key: "sales", label: "Usage" },
  { key: "stock", label: "Stock Consumption" },
  { key: "daily", label: "Daily Trend" },
];

function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) {
  if (percentage < 5) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${percentage}%`}
    </text>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-white shadow-md px-3 py-2 text-xs">
      {label && <p className="font-semibold text-foreground mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color ?? p.fill }} className="font-medium">
          {p.name}: <span className="font-bold">{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</span>
        </p>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-border bg-white shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-foreground">{item.name}</p>
      <p className="text-muted-foreground">{item.value.toLocaleString()} units · {item.payload.percentage}%</p>
    </div>
  );
}

export default function Analytics() {
  const { selectedStore, selectedOrganization } = useStore();
  const [activeTab, setActiveTab] = useState("sales");

  const { data, isLoading } = useGetAnalytics(
    { storeId: selectedStore?.id, organizationId: selectedOrganization?.id },
    {
      query: {
        queryKey: getGetAnalyticsQueryKey({ storeId: selectedStore?.id, organizationId: selectedOrganization?.id }),
        enabled: !!selectedStore,
        staleTime: 2 * 60 * 1000,
      }
    }
  );

  if (!selectedStore) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
          <StoreIcon className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Select a Store</h2>
          <p className="text-muted-foreground text-sm mt-1 max-w-md">Please select an organization and store from the sidebar to view analytics.</p>
        </div>
      </div>
    );
  }

  const topItem = data?.salesByItem[0];
  const lowStockItems = data?.stockConsumption.filter(s => s.variance < 0).length ?? 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Insights</p>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{selectedStore.name}</p>
      </div>

      {/* Stat summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Units Sold",
            value: isLoading ? "—" : (data?.totalUnitsSold ?? 0).toLocaleString(),
            icon: ShoppingCart,
            accent: "border-l-blue-500",
            iconBg: "bg-blue-50", iconColor: "text-blue-600",
          },
          {
            label: "Transactions",
            value: isLoading ? "—" : (data?.totalTransactions ?? 0).toLocaleString(),
            icon: BarChart3,
            accent: "border-l-emerald-500",
            iconBg: "bg-emerald-50", iconColor: "text-emerald-600",
          },
          {
            label: "Top Menu Item",
            value: isLoading ? "—" : (topItem?.menuItem ?? "—"),
            icon: TrendingUp,
            accent: "border-l-amber-500",
            iconBg: "bg-amber-50", iconColor: "text-amber-600",
          },
          {
            label: "Ingredients Below Stock",
            value: isLoading ? "—" : lowStockItems,
            icon: AlertTriangle,
            accent: "border-l-red-500",
            iconBg: "bg-red-50", iconColor: "text-red-600",
          },
        ].map((stat) => (
          <Card key={stat.label} className={cn("border border-border bg-white shadow-xs border-l-4 overflow-hidden", stat.accent)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{stat.label}</p>
              <div className={cn("flex h-7 w-7 items-center justify-center rounded-md", stat.iconBg)}>
                <stat.icon className={cn("h-3.5 w-3.5", stat.iconColor)} />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold truncate">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-24">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && data && (
        <>
          {/* ── Sales Breakdown Tab ── */}
          {activeTab === "sales" && (
            <div className="grid gap-5 lg:grid-cols-2">
              {/* Pie chart */}
              <Card className="border border-border bg-white shadow-xs">
                <CardHeader className="border-b border-border/60 pb-3 pt-4 px-5">
                  <CardTitle className="text-sm font-semibold">Sales by Menu Item</CardTitle>
                  <CardDescription className="text-xs">All-time distribution of units sold</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 pb-2">
                  {data.salesByItem.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                      <Package className="h-10 w-10 opacity-20 mb-3" />
                      <p className="text-sm">No sales data yet</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={data.salesByItem}
                          dataKey="totalQty"
                          nameKey="menuItem"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={55}
                          paddingAngle={2}
                          strokeWidth={0}
                          label={PieLabel}
                          labelLine={false}
                        >
                          {data.salesByItem.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                        <Legend
                          formatter={(value) => <span className="text-xs text-foreground font-medium">{value}</span>}
                          iconSize={8}
                          iconType="circle"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Sales table */}
              <Card className="border border-border bg-white shadow-xs">
                <CardHeader className="border-b border-border/60 pb-3 pt-4 px-5">
                  <CardTitle className="text-sm font-semibold">Sales Rankings</CardTitle>
                  <CardDescription className="text-xs">Ranked by total units sold</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {data.salesByItem.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground text-sm">No data available</div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {data.salesByItem.map((item, i) => (
                        <div key={item.menuItem} className="flex items-center gap-3 px-5 py-3">
                          <div className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold",
                            i === 0 ? "bg-amber-100 text-amber-700" :
                            i === 1 ? "bg-slate-100 text-slate-600" :
                            i === 2 ? "bg-orange-50 text-orange-600" :
                            "bg-muted text-muted-foreground"
                          )}>
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.menuItem}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="w-20 bg-muted rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${item.percentage}%`,
                                  backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                                }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-8 text-right">{item.percentage}%</span>
                            <span className="font-mono text-sm font-semibold w-16 text-right">{item.totalQty.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── Stock Consumption Tab ── */}
          {activeTab === "stock" && (
            <div className="space-y-5">
              <Card className="border border-border bg-white shadow-xs">
                <CardHeader className="border-b border-border/60 pb-3 pt-4 px-5">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    Ingredient Consumption vs. Current Stock
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Estimated total used is calculated from all-time sales × recipe amounts. A negative variance means current stock is lower than what sales alone explain — indicating waste, manual removal, or unlogged usage.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 pb-2">
                  {data.stockConsumption.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                      <Package className="h-10 w-10 opacity-20 mb-3" />
                      <p className="text-sm">No consumption data — add recipes and log sales to see this.</p>
                    </div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={data.stockConsumption.length * 48 + 40}>
                        <BarChart
                          data={data.stockConsumption}
                          layout="vertical"
                          margin={{ left: 8, right: 24, top: 4, bottom: 4 }}
                          barCategoryGap="30%"
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                          <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                          <YAxis
                            type="category"
                            dataKey="ingredientName"
                            tick={{ fontSize: 11 }}
                            width={100}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                          <Bar dataKey="estimatedUsed" name="Est. Used (all time)" fill="#10b981" radius={[0, 3, 3, 0]} />
                          <Bar dataKey="currentStock" name="Current Stock" fill="#3b82f6" radius={[0, 3, 3, 0]} />
                        </BarChart>
                      </ResponsiveContainer>

                      {/* Loss table */}
                      <div className="mt-5 pt-4 border-t border-border/60">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">Variance Detail</p>
                        <div className="rounded-lg border border-border overflow-hidden">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50 border-b border-border">
                                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-2">Ingredient</th>
                                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-2">Est. Used</th>
                                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-2">Current Stock</th>
                                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-2">Variance</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                              {data.stockConsumption.map((row) => (
                                <tr key={row.ingredientName} className="hover:bg-gray-50/60 transition-colors">
                                  <td className="px-4 py-2.5 font-medium">{row.ingredientName}</td>
                                  <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">
                                    {row.estimatedUsed} <span className="text-xs">{row.unit}</span>
                                  </td>
                                  <td className="px-4 py-2.5 text-right font-mono">
                                    {row.currentStock} <span className="text-xs text-muted-foreground">{row.unit}</span>
                                  </td>
                                  <td className="px-4 py-2.5 text-right font-mono font-semibold">
                                    <span className={row.variance < 0 ? "text-red-600" : "text-emerald-600"}>
                                      {row.variance > 0 ? "+" : ""}{row.variance} <span className="text-xs font-normal">{row.unit}</span>
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 px-1">
                          A <span className="text-red-600 font-medium">negative variance</span> means the ingredient has been used or removed beyond what logged sales explain — potential waste or shrinkage. A <span className="text-emerald-600 font-medium">positive variance</span> means stock is higher than sales predict — may indicate a recent restock.
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── Daily Trend Tab ── */}
          {activeTab === "daily" && (
            <Card className="border border-border bg-white shadow-xs">
              <CardHeader className="border-b border-border/60 pb-3 pt-4 px-5">
                <CardTitle className="text-sm font-semibold">Daily Sales — Last 30 Days</CardTitle>
                <CardDescription className="text-xs">Total units sold per day across all menu items</CardDescription>
              </CardHeader>
              <CardContent className="pt-5 pb-4 pr-5">
                {data.dailySales.every(d => d.totalQty === 0) ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <BarChart3 className="h-10 w-10 opacity-20 mb-3" />
                    <p className="text-sm">No sales in the last 30 days</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data.dailySales} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => {
                          try { return format(parseISO(v), "MMM d"); } catch { return v; }
                        }}
                        interval={4}
                      />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div className="rounded-lg border border-border bg-white shadow-md px-3 py-2 text-xs">
                              <p className="font-semibold text-foreground mb-0.5">
                                {(() => { try { return format(parseISO(label), "EEE, MMM d"); } catch { return label; } })()}
                              </p>
                              <p className="text-emerald-600 font-bold">{payload[0].value} units sold</p>
                            </div>
                          );
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="totalQty"
                        name="Units sold"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="url(#salesGradient)"
                        dot={false}
                        activeDot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
