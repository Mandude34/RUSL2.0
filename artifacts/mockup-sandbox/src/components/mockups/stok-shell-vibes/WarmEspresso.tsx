import './_group.css';
import React from 'react';
import {
  LayoutDashboard,
  Package,
  Activity,
  Trash2,
  CircleDollarSign,
  Sparkles,
  BrainCircuit,
  BarChart3,
  Building2,
  Store,
  ChevronDown,
  LogOut,
  ChefHat
} from 'lucide-react';

export function WarmEspresso() {
  return (
    <div className="flex h-screen w-full font-sans overflow-hidden text-[#432A1C]">
      {/* Sidebar */}
      <div className="w-[240px] flex-shrink-0 flex flex-col bg-[#2C1A0E] text-[#E8DFD8]">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-[#432A1C]">
          <div className="w-8 h-8 rounded bg-[#B45309] flex items-center justify-center text-white">
            <ChefHat size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight text-[#FAF6F0]">sToK</span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-8 scrollbar-hide">
          
          {/* Selectors */}
          <div className="flex flex-col gap-3">
            <div className="relative">
              <select className="w-full appearance-none bg-[#3E2616] border border-[#523522] rounded-md py-2 pl-3 pr-8 text-sm text-[#FAF6F0] focus:outline-none focus:ring-1 focus:ring-[#B45309]">
                <option>Acme Hospitality</option>
                <option>Global Foods</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A68F80] pointer-events-none" />
            </div>
            <div className="relative">
              <select className="w-full appearance-none bg-[#3E2616] border border-[#523522] rounded-md py-2 pl-3 pr-8 text-sm text-[#FAF6F0] focus:outline-none focus:ring-1 focus:ring-[#B45309]">
                <option>Downtown Kitchen</option>
                <option>Uptown Bistro</option>
                <option>Riverside Cafe</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A68F80] pointer-events-none" />
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex flex-col gap-1">
            <div className="px-3 mb-2 text-xs font-semibold tracking-wider text-[#A68F80]">MENU</div>
            <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active />
            <NavItem icon={<Package size={18} />} label="Inventory" />
            <NavItem icon={<Activity size={18} />} label="Usage" />
            <NavItem icon={<Trash2 size={18} />} label="Waste Tracking" />
            <NavItem icon={<CircleDollarSign size={18} />} label="Food Cost" />
            <NavItem icon={<Sparkles size={18} />} label="Recommendations" />
            <NavItem icon={<BrainCircuit size={18} />} label="AI Predictions" />
            <NavItem icon={<BarChart3 size={18} />} label="Analytics" />
          </div>

          {/* Settings Items */}
          <div className="flex flex-col gap-1 mb-4">
            <div className="px-3 mb-2 text-xs font-semibold tracking-wider text-[#A68F80]">SETTINGS</div>
            <NavItem icon={<Building2 size={18} />} label="Organizations" />
          </div>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-[#432A1C] bg-[#22130A] flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-[#523522] flex items-center justify-center flex-shrink-0 text-sm font-medium text-[#FAF6F0]">
              JD
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium text-[#FAF6F0] truncate">Jamie Doe</span>
              <span className="text-xs text-[#A68F80] truncate">jamie@acme.com</span>
            </div>
          </div>
          <button className="p-2 text-[#A68F80] hover:text-[#FAF6F0] transition-colors rounded-md hover:bg-[#3E2616]">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-[#FAF6F0] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center text-center max-w-sm p-8 rounded-xl bg-white shadow-sm border border-[#E8DFD8]">
          <div className="w-16 h-16 bg-[#F3EBE3] text-[#B45309] rounded-full flex items-center justify-center mb-6">
            <Store size={32} />
          </div>
          <h2 className="text-xl font-semibold text-[#2C1A0E] mb-2">Select a Store</h2>
          <p className="text-[#8B7355] text-sm leading-relaxed mb-6">
            Choose a location from the sidebar to view inventory, track waste, and manage food costs.
          </p>
          <button className="px-4 py-2 bg-[#B45309] hover:bg-[#92400E] text-white text-sm font-medium rounded-md transition-colors shadow-sm">
            View Organizations
          </button>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button
      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
        active 
          ? 'bg-[#B45309] text-[#FAF6F0] shadow-sm' 
          : 'text-[#D0C2B5] hover:bg-[#3E2616] hover:text-[#FAF6F0]'
      }`}
    >
      <span className={active ? 'text-[#FAF6F0]' : 'text-[#A68F80]'}>{icon}</span>
      {label}
    </button>
  );
}
