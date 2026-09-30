import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Download, 
  Layers,
  ArrowRight,
  Database
} from 'lucide-react';
import { excelParser } from '../services/excelParser.js';

export default function ExcelImportModal({ isOpen, onClose, onImportSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFiles = async (file) => {
    if (!file) return;
    setErrorMsg('');
    setParsing(true);
    setParseResult(null);

    try {
      const result = await excelParser.parseExcelFile(file);
      if (result.workOrders.length === 0) {
        setErrorMsg('Tidak ditemukan data Work Order valid dalam file Excel ini. Pastikan format sesuai template.');
      } else {
        setParseResult(result);
      }
    } catch (err) {
      console.error('Parsing error:', err);
      setErrorMsg(`Gagal membaca file Excel: ${err.message || 'Format tidak didukung'}`);
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleSaveToDb = async () => {
    if (!parseResult || parseResult.workOrders.length === 0) return;
    await onImportSuccess(parseResult.workOrders);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-100 text-cyan-800 rounded-lg">
              <FileSpreadsheet className="w-5 h-5 text-cyan-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Excel Importer Engine (Multi-Sheet & Horizontal)
              </h3>
              <p className="text-xs text-slate-500">
                Membaca file Excel per tanggal dengan format 2 kolom per Work Order
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Instruction & Template Link */}
          <div className="bg-cyan-50/70 border border-cyan-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-cyan-900">
            <div>
              <span className="font-semibold block mb-0.5">Format Standar yang Didukung:</span>
              <ul className="list-disc list-inside space-y-0.5 text-cyan-800">
                <li>Struktur Horizontal: Setiap 2 kolom = 1 Work Order (Label di kolom kiri, Data di kolom kanan)</li>
                <li>Multi-Sheet: Setiap sheet dapat dinamai berdasarkan tanggal pekerjaan (cth: "2024-10-01")</li>
                <li>Header wajib: Tanggal, No WO, Unit, Penyulang, Petugas, Pohon, Koordinat, Diameter, Slot Foto</li>
              </ul>
            </div>
            <button
              onClick={() => excelParser.generateSampleExcel()}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-cyan-800 hover:bg-cyan-100 rounded-lg border border-cyan-300 font-semibold shadow-xs shrink-0 transition-colors"
            >
              <Download className="w-4 h-4 text-cyan-700" />
              <span>Download Contoh Excel</span>
            </button>
          </div>

          {/* Upload Drop Zone */}
          {!parseResult && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-cyan-500 bg-cyan-50/50'
                  : 'border-slate-300 hover:border-cyan-400 hover:bg-slate-50/80'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => handleFiles(e.target.files?.[0])}
                className="hidden"
              />
              <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-3">
                <UploadCloud className="w-6 h-6 text-cyan-600" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                Tarik & letakkan file Excel di sini, atau klik untuk memilih
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Mendukung file .xlsx dan .xls (Multi-Sheet per tanggal)
              </p>

              {parsing && (
                <div className="mt-4 flex items-center justify-center gap-2 text-cyan-700 text-xs font-medium">
                  <div className="w-4 h-4 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Sedang memproses struktur multi-sheet horizontal...</span>
                </div>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Parse Result Preview */}
          {parseResult && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm mb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Berhasil Membaca {parseResult.stats.totalParsed} Work Order dari {parseResult.stats.totalSheets} Sheet!</span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-emerald-900">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>Sheet Terdeteksi: <strong>{parseResult.sheetNames.join(', ')}</strong></span>
                  </div>
                  <div>
                    <span>Model Parsing: <strong>{parseResult.stats.horizontalCount} WO Horizontal (2-Kolom)</strong></span>
                  </div>
                </div>
              </div>

              {/* Table Preview */}
              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
                    <tr>
                      <th className="p-2 border-b">No. WO</th>
                      <th className="p-2 border-b">Tanggal</th>
                      <th className="p-2 border-b">Penyulang</th>
                      <th className="p-2 border-b">Petugas</th>
                      <th className="p-2 border-b">Pohon</th>
                      <th className="p-2 border-b">Diameter</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parseResult.workOrders.map((wo, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-2 font-mono font-medium text-slate-900">{wo.nomor_wo}</td>
                        <td className="p-2 text-slate-600 font-mono">{wo.tanggal}</td>
                        <td className="p-2 text-slate-700">{wo.penyulang}</td>
                        <td className="p-2 text-slate-700">{wo.petugas}</td>
                        <td className="p-2 text-slate-700">{wo.pohon}</td>
                        <td className="p-2 font-mono">{wo.diameter} cm</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setParseResult(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg"
                >
                  Pilih File Lain
                </button>
                <button
                  type="button"
                  onClick={handleSaveToDb}
                  className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Simpan {parseResult.workOrders.length} WO ke Database SQLite</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
