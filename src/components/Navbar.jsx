import React from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  PlusCircle, 
  Printer, 
  Settings, 
  Terminal,
  Zap,
  FolderDown
} from 'lucide-react';
import { PLN_LOGO_SVG } from '../utils/assets.js';

export default function Navbar({ activeTab, setActiveTab, reportCount, onQuickImport, onDownloadTemplate }) {
  const navItems = [
    { id: 'dashboard', label: 'Data Dashboard & WO', icon: FileSpreadsheet, badge: reportCount },
    { id: 'import', label: 'Import Excel', icon: FolderDown },
    { id: 'add', label: 'Tambah WO Baru', icon: PlusCircle },
    { id: 'print', label: 'Cetak Laporan (A4/F4)', icon: Printer },
    { id: 'tauri', label: 'Tauri + Rust Backend', icon: Terminal },
    { id: 'settings', label: 'Pengaturan & Pejabat', icon: Settings },
  ];

  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand lockup */}
          <div className="flex items-center gap-3">
            <img 
              src={PLN_LOGO_SVG} 
              alt="PLN Logo" 
              className="h-10 w-auto drop-shadow-xs" 
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-slate-900">
                  PLN ROW MONITOR
                </span>
                <span className="text-[10px] font-semibold uppercase bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded tracking-wider">
                  ULP Edition
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Sistem Pelaporan Pemeliharaan ROW Jaringan 20kV
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums ${
                      isActive ? 'bg-slate-800 text-cyan-300' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onDownloadTemplate}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
              title="Download Template Excel Multi-Sheet Horizontal"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Template Excel</span>
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg shadow-xs transition-colors"
            >
              <FolderDown className="w-3.5 h-3.5" />
              <span>Import WO</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav Scrollable */}
        <div className="lg:hidden flex items-center gap-1 py-2 overflow-x-auto border-t border-slate-100">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="text-[10px] font-mono">({item.badge})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
