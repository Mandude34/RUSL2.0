import './_group.css';
import React, { useState } from 'react';
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
} from 'lucide-react';

export function ArcticMinimal() {
  const [activeItem, setActiveItem] = useState('Dashboard');

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Inventory', icon: Package },
    { name: 'Usage', icon: Activity },
    { name: 'Waste Tracking', icon: Trash2 },
    { name: 'Food Cost', icon: DollarSign },
    { name: 'Recommendations', icon: Lightbulb },
    { name: 'AI Predictions', icon: BrainCircuit },
    { name: 'Analytics', icon: BarChart3 },
  ];

  const settingsItems = [
    { name: 'Organizations', icon: Building2 },
  ];

  return (
    <div className="flex h-screen w-full bg-white font-sans text-slate-900 overflow-hidden tracking-tight">
      {/* Sidebar */}
      <aside className="w-[240px] flex-shrink-0 bg-gray-50 flex flex-col border-r border-gray-200">
        
        {/* Header */}
        <div className="h-14 flex items-center px-5 border-b border-gray-200/50">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-slate-800 rounded flex items-center justify-center">
              <span className="text-[10px] font-bold text-white tracking-widest">S</span>
            </div>
            <span className="font-semibold text-sm tracking-tight text-slate-800">sToK</span>
          </div>
        </div>

        {/* Dropdowns */}
        <div className="px-3 py-4 space-y-2 border-b border-gray-200/50">
          <button className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors bg-white border border-gray-200 rounded shadow-sm">
            <span className="truncate">Acme Corp</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
          <button className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors bg-white border border-gray-200 rounded shadow-sm">
            <span className="truncate">Downtown Kitchen</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-2 no-scrollbar">
          <div className="space-y-0.5">
            {menuItems.map((item) => {
              const isActive = activeItem === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveItem(item.name)}
                  className={`w-full flex items-center gap-3 px-3 py-1.5 text-xs transition-colors relative group ${
                    isActive ? 'text-indigo-700 font-medium' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-indigo-600 rounded-r-sm" />
                  )}
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} strokeWidth={1.5} />
                  {item.name}
                </button>
              );
            })}
          </div>

          <div className="mt-8 mb-2 px-3">
            <div className="h-px w-full bg-gray-200"></div>
          </div>

          <div className="space-y-0.5">
            {settingsItems.map((item) => {
              const isActive = activeItem === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveItem(item.name)}
                  className={`w-full flex items-center gap-3 px-3 py-1.5 text-xs transition-colors relative group ${
                    isActive ? 'text-indigo-700 font-medium' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-indigo-600 rounded-r-sm" />
                  )}
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} strokeWidth={1.5} />
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-gray-200/50">
          <div className="flex items-center justify-between px-2 py-2 rounded hover:bg-gray-100/50 transition-colors cursor-pointer group">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-[10px] font-medium border border-indigo-200">
                JD
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-slate-700 leading-tight">Jane Doe</span>
                <span className="text-[10px] text-slate-500 leading-tight">jane@acmecorp.com</span>
              </div>
            </div>
            <LogOut className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-white">
        <div className="h-14 flex items-center px-8 border-b border-gray-100">
          <h1 className="text-sm font-medium text-slate-800">{activeItem}</h1>
        </div>
        
        <div className="flex-1 flex items-center justify-center bg-white p-8">
          <div className="max-w-md w-full flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
              <Store className="w-5 h-5 text-slate-400" strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-medium text-slate-900 mb-2 tracking-tight">Select a Store</h2>
            <p className="text-sm text-slate-500 max-w-[260px] leading-relaxed">
              Choose a store from the sidebar dropdown to view inventory and analytics.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
