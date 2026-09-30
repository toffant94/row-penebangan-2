import React, { useState } from 'react';
import { Minus, Square, X, Terminal, Database, ShieldCheck, Download } from 'lucide-react';

export default function DesktopTitlebar({ onOpenTauriGuide, onOpenSettings }) {
  const [isMaximized, setIsMaximized] = useState(false);

  return (
    <div className="no-print bg-slate-900 text-slate-200 border-b border-slate-800 flex items-center justify-between px-3 py-1.5 select-none text-xs">
      {/* Left: Window branding and status */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 font-semibold text-slate-100">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block animate-pulse"></span>
          <span>PLN ROW Trimming Manager</span>
        </div>
        <span className="text-slate-500">|</span>
        <div className="flex items-center gap-2 text-slate-400">
          <span className="flex items-center gap-1">
            <Database className="w-3 h-3 text-cyan-400" />
            <span>SQLite Embedded</span>
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>K3 ROW Compliant</span>
          </span>
        </div>
      </div>

      {/* Center: System Badge */}
      <div className="hidden md:flex items-center gap-2 text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 font-mono text-[11px]">
        <span>Tauri v2 + Rust</span>
        <span className="text-slate-600">/</span>
        <span>React</span>
        <span className="text-slate-600">/</span>
        <span>Tailwind</span>
      </div>

      {/* Right: Quick actions & Window Chrome controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenTauriGuide}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
          title="Petunjuk Instalasi & Kode Rust Desktop"
        >
          <Terminal className="w-3 h-3" />
          <span className="hidden sm:inline">Tauri + Rust Hub</span>
        </button>

        {/* Window controls */}
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => {}}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-800 text-slate-400 hover:text-white"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-800 text-slate-400 hover:text-white"
            title={isMaximized ? "Restore" : "Maximize"}
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={() => {}}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-600 text-slate-400 hover:text-white"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
