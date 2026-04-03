import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { TrendingUp, Package, Receipt, ArrowRight, Flame, DollarSign, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { FlowStockIcon } from "@/components/logo";

const features = [
  {
    icon: Package,
    title: "Real-time Inventory",
    description:
      "Track ingredients across multiple locations. Know exactly what you have on hand and what needs to be ordered before you run out.",
  },
  {
    icon: Receipt,
    title: "Usage Tracking",
    description:
      "Log exactly what gets used from each delivery. Understand consumption patterns and keep your stock levels accurate in real time.",
  },
  {
    icon: Flame,
    title: "Waste Tracking",
    description:
      "Log spoilage and waste events in seconds. Spot patterns by ingredient and reduce costly losses week over week.",
  },
  {
    icon: DollarSign,
    title: "Food Cost Reports",
    description:
      "Instantly see your food cost percentage, total ingredient spend, and cost-per-unit trends — with one-click PDF export.",
  },
  {
    icon: BarChart3,
    title: "Cost Analytics",
    description:
      "Drill into what's coming in and going out. Track price changes over time and identify your highest-cost ingredients at a glance.",
  },
  {
    icon: TrendingUp,
    title: "Smart Reordering",
    description:
      "AI-driven purchase recommendations based on your usage history. Catch price hikes early and never over-order again.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-[100dvh] bg-[hsl(0,0%,95%)] selection:bg-primary/20 flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-[hsl(0,0%,88%)] bg-[hsl(0,0%,97%)]/90 backdrop-blur-md">
        <nav className="flex items-center justify-between px-6 py-4 lg:px-10 max-w-7xl mx-auto" aria-label="Global">
          <div className="flex lg:flex-1">
            <div className="flex items-center gap-2.5 font-bold tracking-tight text-xl">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <FlowStockIcon className="h-5 w-5" />
              </div>
              <span className="text-foreground">RUSL</span>
            </div>
          </div>
          <div className="flex flex-1 justify-end gap-x-4 items-center">
            <Link href="/sign-in" className="text-sm font-semibold leading-6 text-muted-foreground hover:text-foreground transition-colors">
              Log in
            </Link>
            <Button asChild size="sm" className="shadow-sm">
              <Link href="/sign-up">Get started</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero */}
        <section className="relative flex-1 flex items-center justify-center py-28 sm:py-36 overflow-hidden">
          {/* Subtle background gradient */}
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(158 42% 32% / 0.08) 0%, transparent 70%)",
            }}
          />

          <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-widest mb-7">
                Built for professional kitchens
              </span>
              <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl text-balance leading-[1.1]">
                Smart inventory for{" "}
                <span className="text-primary">modern kitchens</span>
              </h1>
              <p className="mt-7 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
                Take control of food costs, track usage, eliminate waste, and always know what to reorder.
                Built for culinary professionals who demand excellence.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-4">
                <Button asChild size="lg" className="h-12 px-8 text-base shadow-sm">
                  <Link href="/sign-up">Start for free</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 text-base group bg-card border-border"
                >
                  <Link href="/sign-in" className="flex items-center gap-2">
                    Log in <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Divider strip */}
        <div className="border-t border-[hsl(220,14%,84%)]" />

        {/* Features */}
        <section className="py-24 sm:py-32 bg-[hsl(220,16%,91%)]">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                Everything you need
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                No more spreadsheets.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                RUSL replaces chaotic spreadsheets with a purpose-built
                platform that understands how real kitchens operate.
              </p>
            </div>

            <div className="grid max-w-2xl grid-cols-1 gap-5 mx-auto sm:grid-cols-2 lg:max-w-none lg:grid-cols-3">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  className="flex flex-col bg-[hsl(220,13%,97%)] border border-[hsl(220,14%,84%)] p-7 rounded-xl shadow-xs hover:shadow-sm transition-shadow"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm leading-6 text-muted-foreground flex-1">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA footer strip */}
        <section className="border-t border-[hsl(220,14%,84%)] bg-[hsl(220,13%,97%)] py-16">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">
              Ready to take control of your kitchen?
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Get started free — no credit card required.
            </p>
            <Button asChild size="lg" className="mt-8 h-12 px-10 text-base shadow-sm">
              <Link href="/sign-up">Create your account</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-[hsl(220,14%,84%)] bg-[hsl(220,16%,91%)] py-6">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <FlowStockIcon className="h-4 w-4 text-primary" />
            RUSL
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} RUSL. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
