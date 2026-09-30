import React, { useState, useEffect } from 'react';
import DesktopTitlebar from './components/DesktopTitlebar.jsx';
import Navbar from './components/Navbar.jsx';
import DashboardView from './components/DashboardView.jsx';
import ExcelImportModal from './components/ExcelImportModal.jsx';
import WorkOrderModal from './components/WorkOrderModal.jsx';
import PrintEngineView from './components/PrintEngineView.jsx';
import TauriRustGuide from './components/TauriRustGuide.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import { dbService } from './services/db.js';
import { tauriBridge } from './services/tauriBridge.js';
import { excelParser } from './services/excelParser.js';
import { DEFAULT_CONFIG } from './utils/assets.js';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'import' | 'add' | 'print' | 'tauri' | 'settings'
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  // Modals & Sub-views
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isWoModalOpen, setIsWoModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [printTargetReport, setPrintTargetReport] = useState(null);
  const [batchPrintIds, setBatchPrintIds] = useState([]);

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load data on start
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await tauriBridge.getAllReports();
      setReports(data || []);
      const cfg = await dbService.getConfig();
      setConfig(cfg);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      showToast('Gagal memuat data dari database', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Work Order Handlers
  const handleSaveReport = async (reportData) => {
    try {
      const saved = await tauriBridge.saveReport(reportData);
      showToast(`Work Order ${saved.nomor_wo} berhasil disimpan!`, 'success');
      loadData();
    } catch (err) {
      console.error('Save error:', err);
      showToast('Gagal menyimpan Work Order', 'error');
    }
  };

  const handleDeleteReport = async (id) => {
    try {
      await tauriBridge.deleteReport(id);
      showToast('Work Order berhasil dihapus', 'success');
      loadData();
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Gagal menghapus Work Order', 'error');
    }
  };

  const handleBatchDelete = async (ids) => {
    try {
      await tauriBridge.deleteReports(ids);
      showToast(`${ids.length} Work Order terpilih berhasil dihapus`, 'success');
      loadData();
    } catch (err) {
      console.error('Batch delete error:', err);
      showToast('Gagal menghapus Work Order terpilih', 'error');
    }
  };

  // Excel Import Handler
  const handleImportSuccess = async (importedList) => {
    try {
      const res = await tauriBridge.batchImportReports(importedList);
      showToast(`Berhasil mengimpor ${res.total || importedList.length} Work Order ke database SQLite!`, 'success');
      loadData();
      setIsImportModalOpen(false);
      setActiveTab('dashboard');
    } catch (err) {
      console.error('Import error:', err);
      showToast('Gagal menyimpan hasil import ke database', 'error');
    }
  };

  // Print Handlers
  const handlePrintSingle = (report) => {
    setPrintTargetReport(report);
    setBatchPrintIds([]);
    setActiveTab('print');
  };

  const handleBatchPrint = (ids) => {
    setBatchPrintIds(ids);
    setPrintTargetReport(null);
    setActiveTab('print');
  };

  const handleResetDemo = async () => {
    const fresh = await dbService.resetToDemoData();
    setReports(fresh);
    showToast('Database berhasil di-reset ke data bawaan PLN', 'success');
  };

  // Navigation tab switcher with modal integration
  const handleSelectTab = (tabId) => {
    if (tabId === 'import') {
      setIsImportModalOpen(true);
    } else if (tabId === 'add') {
      setEditingReport(null);
      setIsWoModalOpen(true);
    } else if (tabId === 'settings') {
      setIsSettingsOpen(true);
    } else {
      setActiveTab(tabId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* 1. Desktop Window Chrome / Titlebar */}
      <DesktopTitlebar
        onOpenTauriGuide={() => setActiveTab('tauri')}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 2. PLN Enterprise Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
        reportCount={reports.length}
        onQuickImport={() => setIsImportModalOpen(true)}
        onDownloadTemplate={() => excelParser.generateSampleExcel()}
      />

      {/* 3. Toast Notification Banner */}
      {toast && (
        <div className="no-print fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-5">
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span className="text-xs font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-white p-0.5 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4. Main Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-medium">Memuat data dari database SQLite...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                reports={reports}
                onEditReport={(r) => {
                  setEditingReport(r);
                  setIsWoModalOpen(true);
                }}
                onDeleteReport={handleDeleteReport}
                onBatchDelete={handleBatchDelete}
                onPrintReport={handlePrintSingle}
                onBatchPrint={handleBatchPrint}
                onAddNew={() => {
                  setEditingReport(null);
                  setIsWoModalOpen(true);
                }}
                onOpenImport={() => setIsImportModalOpen(true)}
                onResetDemo={handleResetDemo}
                config={config}
              />
            )}

            {activeTab === 'print' && (
              <PrintEngineView
                reports={reports}
                selectedReport={printTargetReport || reports[0]}
                batchIds={batchPrintIds}
                config={config}
                onBack={() => setActiveTab('dashboard')}
                onSelectSingleReport={(r) => setPrintTargetReport(r)}
              />
            )}

            {activeTab === 'tauri' && (
              <TauriRustGuide onBack={() => setActiveTab('dashboard')} />
            )}
          </>
        )}
      </main>

      {/* 5. Modals */}
      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      <WorkOrderModal
        isOpen={isWoModalOpen}
        onClose={() => {
          setIsWoModalOpen(false);
          setEditingReport(null);
        }}
        onSave={handleSaveReport}
        editingReport={editingReport}
        config={config}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={async (newCfg) => {
          await dbService.saveConfig(newCfg);
          setConfig(newCfg);
          showToast('Pengaturan pejabat & kop dokumen berhasil disimpan');
        }}
      />
    </div>
  );
}
