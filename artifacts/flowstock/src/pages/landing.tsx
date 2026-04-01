import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChefHat, TrendingUp, Package, Receipt, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function LandingPage() {
  return (
    <div className="min-h-[100dvh] bg-background selection:bg-primary/20 flex flex-col">
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <div className="flex items-center gap-2 font-bold tracking-tight text-xl text-primary">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                <ChefHat className="h-5 w-5" />
              </div>
              FlowStock
            </div>
          </div>
          <div className="flex flex-1 justify-end gap-x-4 items-center">
            <Link href="/sign-in" className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors">
              Log in
            </Link>
            <Button asChild>
              <Link href="/sign-up">Get started</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="relative isolate flex-1 flex flex-col">
        {/* Hero Section */}
        <div className="relative pt-14 pb-24 sm:pt-24 sm:pb-32 lg:pb-40 overflow-hidden flex-1 flex items-center">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-[#ff80b5] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
          </div>
          
          <div className="mx-auto max-w-7xl px-6 lg:px-8 w-full">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-2xl text-center"
            >
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl text-balance">
                Smart inventory for <span className="text-primary">modern kitchens</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Take control of your food costs, streamline purchasing, and manage recipes with precision. Built for culinary professionals who demand excellence.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button asChild size="lg" className="h-12 px-8 text-base shadow-sm">
                  <Link href="/sign-up">Start for free</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base group bg-background/50 backdrop-blur-sm border-border">
                  <Link href="/sign-in" className="flex items-center gap-2">
                    Log in <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
          
          <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
            <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-primary opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
          </div>
        </div>

        {/* Feature Section */}
        <div className="py-24 sm:py-32 bg-muted/30 border-t border-border/50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl sm:text-center">
              <h2 className="text-base font-semibold leading-7 text-primary tracking-wide uppercase">Everything you need</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">No more spreadsheets.</p>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                FlowStock replaces chaotic spreadsheets with a purpose-built system that understands how a real kitchen operates.
              </p>
            </div>
            
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col bg-card border border-border p-8 rounded-2xl shadow-sm"
                >
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Package className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    Real-time Inventory
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                    <p className="flex-auto">Track ingredients across multiple locations. Know exactly what you have on hand and what needs to be ordered.</p>
                  </dd>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col bg-card border border-border p-8 rounded-2xl shadow-sm"
                >
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <ChefHat className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    Recipe Costing
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                    <p className="flex-auto">Build recipes and automatically calculate portion costs based on your latest ingredient prices. Protect your margins.</p>
                  </dd>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col bg-card border border-border p-8 rounded-2xl shadow-sm"
                >
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    Smart Insights
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                    <p className="flex-auto">Get AI-driven recommendations on purchasing, catch price hikes early, and optimize your menu for maximum profitability.</p>
                  </dd>
                </motion.div>
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}