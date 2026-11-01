import React from 'react';

export default function Badge({ children, variant = 'primary', className = '' }) {
  const variants = {
    primary: 'bg-indigo-600 text-white font-medium',
    secondary: 'bg-slate-100 text-slate-700 font-medium border border-slate-200',
    sale: 'bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold shadow-xs',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200 font-semibold',
    pro: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-xs'
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] tracking-wide uppercase ${
        variants[variant] || variants.primary
      } ${className}`}
    >
      {children}
    </span>
  );
}
