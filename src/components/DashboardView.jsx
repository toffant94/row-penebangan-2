import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Printer, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Image, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet, 
  Plus, 
  FolderDown,
  RotateCcw,
  Sparkles,
  MapPin
} from 'lucide-react';
import { excelParser } from '../services/excelParser.js';
import ConfirmDeleteModal from './ConfirmDeleteModal.jsx';

export default function DashboardView({ 
  reports, 
  onEditReport, 
  onDeleteReport, 
  onBatchDelete,
  onPrintReport, 
  onBatchPrint,
  onAddNew, 
  onOpenImport,
  onResetDemo,
  config 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPenyulang, setSelectedPenyulang] = useState('ALL');
  const [selectedTanggal, setSelectedTanggal] = useState('ALL');
  const [photoFilter, setPhotoFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Available unique feeders & dates
  const penyulangList = useMemo(() => {
    const set = new Set(reports.map(r => r.penyulang).filter(Boolean));
    return Array.from(set);
  }, [reports]);

  const tanggalList = useMemo(() => {
    const set = new Set(reports.map(r => r.tanggal).filter(Boolean));
    return Array.from(set).sort().reverse();
  }, [reports]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      // Search
      const searchMatch = !searchTerm || 
        r.nomor_wo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.petugas?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.pohon?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.penyulang?.toLowerCase().includes(searchTerm.toLowerCase());

      // Penyulang
      const penyulangMatch = selectedPenyulang === 'ALL' || r.penyulang === selectedPenyulang;

      // Tanggal
      const tanggalMatch = selectedTanggal === 'ALL' || r.tanggal === selectedTanggal;

      // Photo completeness
      const isComplete = Boolean(r.foto_sebelum && r.foto_progres && r.foto_diameter && r.foto_sesudah);
      const photoMatch = photoFilter === 'ALL' ||
        (photoFilter === 'COMPLETE' && isComplete) ||
        (photoFilter === 'INCOMPLETE' && !isComplete);

      return searchMatch && penyulangMatch && tanggalMatch && photoMatch;
    });
  }, [reports, searchTerm, selectedPenyulang, selectedTanggal, photoFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = reports.length;
    const completePhotos = reports.filter(r => r.foto_sebelum && r.foto_progres && r.foto_diameter && r.foto_sesudah).length;
    const totalDiam = reports.reduce((acc, r) => acc + (Number(r.diameter) || 0), 0);
    const avgDiam = total > 0 ? (totalDiam / total).toFixed(1) : 0;
    return {
      total,
      completePhotos,
      incompletePhotos: total - completePhotos,
      avgDiam,
      feederCount: penyulangList.length
    };
  }, [reports, penyulangList]);

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredReports.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleExportExcel = () => {
    excelParser.exportReportsToExcel(filteredReports, config);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Total Work Order</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">{stats.total}</span>
            <span className="text-xs text-slate-500">Laporan</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Dokumentasi 4 Foto Lengkap</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-600">{stats.completePhotos}</span>
            <span className="text-xs text-slate-500">/ {stats.total} WO</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Rata-Rata Diameter Pohon</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">{stats.avgDiam}</span>
            <span className="text-xs text-slate-500">cm</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Jumlah Penyulang Terjadwal</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-cyan-700">{stats.feederCount}</span>
            <span className="text-xs text-slate-500">Feeder 20kV</span>
          </div>
        </div>
      </div>

      {/* Action Toolbar & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Nomor WO, Petugas, Pohon, atau Penyulang..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 bg-slate-50"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {selectedIds.length > 0 && (
              <>
                <button
                  onClick={() => onBatchPrint(selectedIds)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Cetak Terpilih ({selectedIds.length})</span>
                </button>
                <button
                  onClick={() => setDeleteTarget({ type: 'batch', ids: [...selectedIds] })}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors"
                  title="Hapus semua Work Order yang dicentang"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Terpilih ({selectedIds.length})</span>
                </button>
              </>
            )}

            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
              title="Export database ke file Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={onOpenImport}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
            >
              <FolderDown className="w-3.5 h-3.5 text-cyan-600" />
              <span>Import Excel</span>
            </button>

            <button
              onClick={onAddNew}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah WO</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-medium">Filter:</span>
          </div>

          {/* Tanggal Filter */}
          <select
            value={selectedTanggal}
            onChange={(e) => setSelectedTanggal(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">Semua Tanggal ({tanggalList.length})</option>
            {tanggalList.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Penyulang Filter */}
          <select
            value={selectedPenyulang}
            onChange={(e) => setSelectedPenyulang(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">Semua Penyulang ({penyulangList.length})</option>
            {penyulangList.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {/* Photo completeness filter */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
            <button
              onClick={() => setPhotoFilter('ALL')}
              className={`px-2.5 py-1 rounded-md transition-colors text-[11px] font-medium ${
                photoFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Foto
            </button>
            <button
              onClick={() => setPhotoFilter('COMPLETE')}
              className={`px-2.5 py-1 rounded-md transition-colors text-[11px] font-medium ${
                photoFilter === 'COMPLETE' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              4 Foto Lengkap
            </button>
            <button
              onClick={() => setPhotoFilter('INCOMPLETE')}
              className={`px-2.5 py-1 rounded-md transition-colors text-[11px] font-medium ${
                photoFilter === 'INCOMPLETE' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Belum Lengkap
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-slate-400 font-mono tabular-nums">
              Menampilkan {filteredReports.length} dari {reports.length} data
            </span>
            <button
              onClick={onResetDemo}
              className="text-slate-400 hover:text-slate-600 p-1 rounded"
              title="Reset ke database contoh bawaan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filteredReports.length > 0 && selectedIds.length === filteredReports.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                  />
                </th>
                <th className="p-3">Tanggal / No. WO</th>
                <th className="p-3">Penyulang & Unit</th>
                <th className="p-3">Regu Petugas</th>
                <th className="p-3">Pohon & Diameter</th>
                <th className="p-3">Titik Koordinat</th>
                <th className="p-3 text-center">Slot 4 Foto</th>
                <th className="p-3 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium text-slate-700">Tidak ada data Work Order yang cocok</p>
                    <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau import file Excel baru</p>
                    <button
                      onClick={onOpenImport}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 text-white text-xs font-semibold hover:bg-cyan-700"
                    >
                      <FolderDown className="w-3.5 h-3.5" />
                      <span>Import Excel Sekarang</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => {
                  const isSelected = selectedIds.includes(report.id);
                  const isComplete = Boolean(
                    report.foto_sebelum && 
                    report.foto_progres && 
                    report.foto_diameter && 
                    report.foto_sesudah
                  );

                  return (
                    <tr 
                      key={report.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-cyan-50/40' : ''
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(report.id)}
                          className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                        />
                      </td>

                      <td className="p-3">
                        <div className="font-semibold text-slate-900 font-mono text-[11px]">
                          {report.nomor_wo}
                        </div>
                        <div className="text-slate-500 font-mono text-[11px]">
                          {report.tanggal}
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="font-medium text-slate-800">{report.penyulang}</div>
                        <div className="text-[11px] text-slate-500">{report.unit}</div>
                      </td>

                      <td className="p-3">
                        <div className="text-slate-800">{report.petugas}</div>
                        <div className="text-[11px] text-slate-500">{report.tindakan || 'Pemangkasan ROW'}</div>
                      </td>

                      <td className="p-3">
                        <div className="font-medium text-slate-900">{report.pohon}</div>
                        <div className="text-slate-500 font-mono tabular-nums text-[11px]">
                          Ø {report.diameter} cm · Jarak Bebas {report.jarak_sutm || 3.0} m
                        </div>
                      </td>

                      <td className="p-3">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(report.koordinat)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-cyan-700 hover:text-cyan-900 font-mono text-[11px] hover:underline"
                          title="Buka peta Google Maps"
                        >
                          <MapPin className="w-3 h-3 text-cyan-600" />
                          <span>{report.koordinat}</span>
                        </a>
                      </td>

                      <td className="p-3 text-center">
                        <div className="inline-flex items-center gap-1.5 p-1 bg-slate-100 rounded-md">
                          <span 
                            title={report.foto_sebelum ? "1. Foto Sebelum: Ada" : "1. Foto Sebelum: Belum ada"}
                            className={`w-2 h-2 rounded-full ${report.foto_sebelum ? 'bg-emerald-500' : 'bg-slate-300'}`}
                          />
                          <span 
                            title={report.foto_progres ? "2. Foto Progres: Ada" : "2. Foto Progres: Belum ada"}
                            className={`w-2 h-2 rounded-full ${report.foto_progres ? 'bg-emerald-500' : 'bg-slate-300'}`}
                          />
                          <span 
                            title={report.foto_diameter ? "3. Foto Diameter: Ada" : "3. Foto Diameter: Belum ada"}
                            className={`w-2 h-2 rounded-full ${report.foto_diameter ? 'bg-emerald-500' : 'bg-slate-300'}`}
                          />
                          <span 
                            title={report.foto_sesudah ? "4. Foto Sesudah: Ada" : "4. Foto Sesudah: Belum ada"}
                            className={`w-2 h-2 rounded-full ${report.foto_sesudah ? 'bg-emerald-500' : 'bg-slate-300'}`}
                          />
                        </div>
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onPrintReport(report)}
                            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 hover:text-cyan-700 transition-colors"
                            title="Print Preview / Cetak Formulir BA-ROW Resmi"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditReport(report)}
                            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 hover:text-blue-700 transition-colors"
                            title="Edit Data & Upload 4 Foto"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ type: 'single', item: report })}
                            className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                            title="Hapus Laporan WO"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* In-app Confirmation Modal for Deletion */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          if (deleteTarget.type === 'single') {
            await onDeleteReport(deleteTarget.item.id);
            setSelectedIds(prev => prev.filter(id => id !== deleteTarget.item.id));
          } else if (deleteTarget.type === 'batch') {
            await onBatchDelete(deleteTarget.ids);
            setSelectedIds([]);
          }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
