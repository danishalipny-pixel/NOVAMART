import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Smartphone, Tablet, Laptop, Monitor, Maximize2, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

export default function ResponsiveTesterBar() {
  const { viewportMode, setViewportMode, setIsImageAuditOpen } = useStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const presets = [
    { id: 'responsive', label: 'Full Responsive', icon: Maximize2, width: '100%' },
    { id: 'mobile', label: 'Mobile (375px)', icon: Smartphone, width: '375px' },
    { id: 'tablet', label: 'Tablet (768px)', icon: Tablet, width: '768px' },
    { id: 'laptop', label: 'Laptop (1024px)', icon: Laptop, width: '1024px' },
    { id: 'desktop', label: 'Desktop (1440px)', icon: Monitor, width: '1440px' }
  ];

  return (
    <aside aria-label="Responsive Viewport &amp; Image Health Audit Toolbar" className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-slate-200 text-xs px-3 py-1.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Indicator */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-100 hidden sm:inline tracking-wide">
            NOVAMART QA &amp; RESPONSIVE CONTROLLER
          </span>
          <span className="font-medium text-slate-400 text-[11px] sm:hidden">
            Viewport Tester
          </span>
        </div>

        {/* Center: Viewport buttons (when not collapsed) */}
        {!isCollapsed && (
          <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 overflow-x-auto no-scrollbar">
            {presets.map((p) => {
              const Icon = p.icon;
              const isActive = viewportMode === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setViewportMode(p.id)}
                  title={`Switch viewport preview to ${p.label}`}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{p.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Right: Image Health Audit & Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsImageAuditOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-md text-[11px] font-semibold transition-colors"
            title="Inspect all product, banner, and category images for zero errors & CLS"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Image Health Audit</span>
            <span className="sm:hidden">Audit</span>
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors"
            title={isCollapsed ? 'Expand Toolbar' : 'Collapse Toolbar'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
