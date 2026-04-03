import './_group.css';
import React from 'react';
import {
  LayoutDashboard,
  Package,
  Activity,
  Trash2,
  DollarSign,
  Lightbulb,
  BrainCircuit,
  BarChart3,
  Building2,
  ChevronDown,
  LogOut,
  Store,
  ChevronRight
} from 'lucide-react';

export function MidnightOps() {
  return (
    <div className="flex h-screen w-full font-sans text-sm selection:bg-[#22D3EE]/30 selection:text-[#22D3EE]" style={{ backgroundColor: '#161B22', color: '#e5e7eb' }}>
      {/* Sidebar */}
      <div 
        className="w-[240px] flex flex-col flex-shrink-0 relative z-10" 
        style={{ backgroundColor: '#0D1117' }}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#22D3EE]/10 flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-[3px] bg-[#22D3EE]" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white leading-none mt-0.5">sToK</span>
          </div>
        </div>

        {/* Store Selectors */}
        <div className="px-3 pb-4 space-y-1.5 shrink-0">
          <div className="relative group">
            <select className="w-full appearance-none bg-[#161B22] border border-transparent hover:border-gray-800 text-gray-300 py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#22D3EE] transition-all cursor-pointer">
              <option>Acme Corp</option>
              <option>Global Foods</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-500 group-hover:text-gray-400 pointer-events-none transition-colors" />
          </div>
          <div className="relative group">
            <select className="w-full appearance-none bg-[#161B22] border border-transparent hover:border-gray-800 text-gray-300 py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#22D3EE] transition-all cursor-pointer">
              <option>Downtown Location</option>
              <option>Uptown Location</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-500 group-hover:text-gray-400 pointer-events-none transition-colors" />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-2 flex flex-col gap-5 scrollbar-none px-2">
          {/* MENU Section */}
          <div>
            <div className="px-2 mb-1.5">
              <span className="text-[10px] font-bold tracking-widest text-gray-600/80">MENU</span>
            </div>
            <div className="space-y-0.5">
              <NavItem icon={<LayoutDashboard size={15} strokeWidth={2.5} />} label="Dashboard" active />
              <NavItem icon={<Package size={15} strokeWidth={2} />} label="Inventory" />
              <NavItem icon={<Activity size={15} strokeWidth={2} />} label="Usage" />
              <NavItem icon={<Trash2 size={15} strokeWidth={2} />} label="Waste Tracking" />
              <NavItem icon={<DollarSign size={15} strokeWidth={2} />} label="Food Cost" />
              <NavItem icon={<Lightbulb size={15} strokeWidth={2} />} label="Recommendations" />
              <NavItem icon={<BrainCircuit size={15} strokeWidth={2} />} label="AI Predictions" />
              <NavItem icon={<BarChart3 size={15} strokeWidth={2} />} label="Analytics" />
            </div>
          </div>

          {/* SETTINGS Section */}
          <div className="mb-4">
            <div className="px-2 mb-1.5">
              <span className="text-[10px] font-bold tracking-widest text-gray-600/80">SETTINGS</span>
            </div>
            <div className="space-y-0.5">
              <NavItem icon={<Building2 size={15} strokeWidth={2} />} label="Organizations" />
            </div>
          </div>
        </div>

        {/* User Footer */}
        <div className="px-3 py-3 bg-[#0D1117] flex items-center justify-between mt-auto shrink-0 border-t border-gray-800/30">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded bg-[#161B22] flex items-center justify-center text-[#22D3EE] font-medium text-xs border border-gray-800/50 shrink-0">
              JD
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-gray-200 truncate">John Doe</span>
              <span className="text-[11px] text-gray-500 truncate leading-tight">john@acme.com</span>
            </div>
          </div>
          <button className="text-gray-500 hover:text-gray-300 transition-colors p-1.5 rounded-md hover:bg-[#161B22] shrink-0">
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Subtle noise texture over main content */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10">
          <div className="max-w-md w-full rounded-2xl bg-[#0D1117]/80 backdrop-blur-xl p-10 flex flex-col items-center text-center border border-white/[0.02] shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-[#22D3EE]/[0.08] flex items-center justify-center mb-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-[#22D3EE]/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-[#22D3EE]/20 to-transparent opacity-50" />
              <Store className="w-8 h-8 text-[#22D3EE] relative z-10" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight">Select a Store</h2>
            <p className="text-gray-400 mb-8 max-w-[280px] text-sm leading-relaxed">
              Choose an organization and store from the sidebar to view your inventory and metrics.
            </p>
            <button className="w-full bg-[#161B22] hover:bg-[#1C2128] text-gray-300 py-3.5 px-4 rounded-xl flex items-center justify-between group transition-all duration-200 border border-transparent hover:border-gray-800/50 shadow-sm">
              <span className="font-medium text-sm">Open Store Selector</span>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-[#22D3EE] group-hover:translate-x-0.5 transition-all duration-200" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button
      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 text-left group relative overflow-hidden ${
        active 
          ? 'text-[#22D3EE] font-medium' 
          : 'text-gray-400 hover:text-gray-200 hover:bg-[#161B22]/60'
      }`}
    >
      {active && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#22D3EE]/10 to-transparent pointer-events-none" />
      )}
      <div className={`relative z-10 transition-colors duration-200 ${active ? "text-[#22D3EE]" : "text-gray-500 group-hover:text-gray-400"}`}>
        {icon}
      </div>
      <span className="relative z-10 tracking-wide text-[13px]">{label}</span>
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 rounded-r-full bg-[#22D3EE] shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
      )}
    </button>
  );
}
