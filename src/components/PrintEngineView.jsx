import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  Eye, 
  FileText, 
  ArrowLeft, 
  Layers, 
  CheckCircle, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { PLN_LOGO_SVG, SAMPLE_PHOTOS } from '../utils/assets.js';

export default function PrintEngineView({ 
  reports, 
  selectedReport, 
  batchIds, 
  config, 
  onBack,
  onSelectSingleReport 
}) {
  const [paperSize, setPaperSize] = useState('A4_PORTRAIT'); // A4_PORTRAIT, A4_LANDSCAPE, F4_PORTRAIT
  const [scale, setScale] = useState(100);

  // Determine which reports to render
  const targetReports = React.useMemo(() => {
    if (batchIds && batchIds.length > 0) {
      return reports.filter(r => batchIds.includes(r.id));
    }
    if (selectedReport) {
      return [selectedReport];
    }
    return reports.slice(0, 1);
  }, [reports, selectedReport, batchIds]);

  const handleDirectPrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    // Uses native browser high-fidelity PDF driver
    window.print();
  };

  // Dimensions based on paper size
  const getPageStyle = () => {
    switch (paperSize) {
      case 'A4_LANDSCAPE':
        return 'w-[297mm] min-h-[210mm]';
      case 'F4_PORTRAIT':
        return 'w-[215mm] min-h-[330mm]';
      case 'A4_PORTRAIT':
      default:
        return 'w-[210mm] min-h-[297mm]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controller Bar (Hidden during print) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Printer className="w-4 h-4 text-cyan-600" />
              <span>Reporting &amp; Print-Out Engine</span>
            </h2>
            <p className="text-xs text-slate-500">
              Menyiapkan {targetReports.length} lembar formulir Berita Acara Perabasan ROW resmi
            </p>
          </div>
        </div>

        {/* Paper Size & Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Paper Size Selector */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setPaperSize('A4_PORTRAIT')}
              className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-colors ${
                paperSize === 'A4_PORTRAIT' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              A4 Portrait (210×297)
            </button>
            <button
              onClick={() => setPaperSize('F4_PORTRAIT')}
              className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-colors ${
                paperSize === 'F4_PORTRAIT' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              F4 / Folio (215×330)
            </button>
            <button
              onClick={() => setPaperSize('A4_LANDSCAPE')}
              className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-colors ${
                paperSize === 'A4_LANDSCAPE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              A4 Landscape
            </button>
          </div>

          {/* Quick WO Selector */}
          {reports.length > 1 && (
            <select
              value={targetReports[0]?.id || ''}
              onChange={(e) => {
                const found = reports.find(r => r.id === Number(e.target.value));
                if (found) onSelectSingleReport(found);
              }}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700"
            >
              {reports.map((r, i) => (
                <option key={r.id} value={r.id}>
                  WO #{i + 1}: {r.nomor_wo} ({r.tanggal})
                </option>
              ))}
            </select>
          )}

          {/* Print & PDF Action Buttons */}
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg shadow-xs transition-colors"
            title="Export / Simpan sebagai dokumen PDF"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export to PDF</span>
          </button>

          <button
            onClick={handleDirectPrint}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg shadow-xs transition-colors"
            title="Cetak langsung ke printer fisik"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Direct Print</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Viewport */}
      <div className="flex justify-center overflow-x-auto p-2 bg-slate-200/60 rounded-2xl">
        <div className="print-container space-y-8">
          {targetReports.map((report, idx) => (
            <OfficialPLNPrintSheet
              key={report.id || idx}
              report={report}
              config={config}
              paperSize={paperSize}
              pageIndex={idx + 1}
              totalPages={targetReports.length}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Official Form Component - Strict PLN Corporate Standards
 */
function OfficialPLNPrintSheet({ report, config, paperSize, pageIndex, totalPages }) {
  const isLandscape = paperSize === 'A4_LANDSCAPE';
  const isF4 = paperSize === 'F4_PORTRAIT';

  return (
    <div 
      className={`print-page bg-white shadow-xl mx-auto border border-slate-300 p-8 flex flex-col justify-between text-slate-900 relative ${
        isLandscape 
          ? 'w-[297mm] min-h-[210mm]' 
          : isF4 
            ? 'w-[215mm] min-h-[330mm]' 
            : 'w-[210mm] min-h-[297mm]'
      }`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Top Header / Kop Surat Resmi PT PLN (Persero) */}
      <div>
        <div className="flex items-start justify-between pb-3 border-b-2 border-slate-900">
          <div className="flex items-center gap-3">
            <img 
              src={PLN_LOGO_SVG} 
              alt="Logo PLN" 
              className="h-14 w-auto shrink-0" 
            />
            <div>
              <div className="text-xs font-extrabold tracking-wide uppercase text-slate-900">
                {config.nama_holding || 'PT PLN (PERSERO)'}
              </div>
              <div className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">
                {config.nama_uid || 'DISTRIBUSI JAWA TENGAH & D.I.Y'}
              </div>
              <div className="text-[11px] font-semibold text-slate-700 uppercase">
                {config.nama_up3 || 'UP3 SEMARANG'} — {config.nama_ulp || 'ULP SEMARANG BARAT'}
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">
                {config.alamat_ulp || 'Jl. Jenderal Sudirman No. 128, Semarang'}
              </div>
            </div>
          </div>

          <div className="text-right text-[10px] font-mono text-slate-600">
            <div className="border border-slate-400 px-2 py-1 rounded bg-slate-50 text-[10px] inline-block font-bold text-slate-800">
              FORMULIR RESMI K3 ROW
            </div>
            <div className="mt-1">No. Dok: {config.no_dokumen || 'BA-ROW/PLN-SB/2024'}</div>
            <div>Hal: {pageIndex} dari {totalPages}</div>
          </div>
        </div>

        {/* Document Title Banner */}
        <div className="my-3 text-center">
          <h1 className="text-sm font-black uppercase tracking-wider text-slate-900">
            BERITA ACARA &amp; LAPORAN HASIL PEKERJAAN PEMELIHARAAN ROW
          </h1>
          <p className="text-[11px] font-medium text-slate-700">
            JARINGAN DISTRIBUSI TEGANGAN MENENGAH 20 kV (PERABASAN &amp; PENEBANGAN POHON)
          </p>
        </div>

        {/* Structured Data Table / Form Kotak */}
        <div className="border border-slate-800 rounded-xs overflow-hidden mb-3 text-[10px]">
          <table className="w-full border-collapse">
            <tbody>
              <tr className="border-b border-slate-400">
                <td className="w-28 bg-slate-100 p-1.5 font-bold border-r border-slate-400">Tanggal Pekerjaan</td>
                <td className="p-1.5 border-r border-slate-400 font-mono font-medium">{report.tanggal}</td>
                <td className="w-28 bg-slate-100 p-1.5 font-bold border-r border-slate-400">Nomor Work Order</td>
                <td className="p-1.5 font-mono font-bold text-slate-900">{report.nomor_wo}</td>
              </tr>
              <tr className="border-b border-slate-400">
                <td className="bg-slate-100 p-1.5 font-bold border-r border-slate-400">Unit Pelaksana</td>
                <td className="p-1.5 border-r border-slate-400">{report.unit}</td>
                <td className="bg-slate-100 p-1.5 font-bold border-r border-slate-400">Penyulang (Feeder)</td>
                <td className="p-1.5 font-semibold text-slate-900">{report.penyulang}</td>
              </tr>
              <tr className="border-b border-slate-400">
                <td className="bg-slate-100 p-1.5 font-bold border-r border-slate-400">Regu Petugas</td>
                <td className="p-1.5 border-r border-slate-400">{report.petugas}</td>
                <td className="bg-slate-100 p-1.5 font-bold border-r border-slate-400">Jenis Vegetasi/Pohon</td>
                <td className="p-1.5 font-semibold">{report.pohon}</td>
              </tr>
              <tr className="border-b border-slate-400">
                <td className="bg-slate-100 p-1.5 font-bold border-r border-slate-400">Titik Koordinat GPS</td>
                <td className="p-1.5 border-r border-slate-400 font-mono">{report.koordinat}</td>
                <td className="bg-slate-100 p-1.5 font-bold border-r border-slate-400">Diameter Batang</td>
                <td className="p-1.5 font-mono font-bold">Ø {report.diameter} cm</td>
              </tr>
              <tr>
                <td className="bg-slate-100 p-1.5 font-bold border-r border-slate-400">Jarak Bebas SUTM</td>
                <td className="p-1.5 border-r border-slate-400 font-mono font-semibold text-emerald-700">
                  {report.jarak_sutm || 3.0} Meter (Standar Aman &gt; 3.0 m)
                </td>
                <td className="bg-slate-100 p-1.5 font-bold border-r border-slate-400">Tindakan Eksekusi</td>
                <td className="p-1.5 font-medium">{report.tindakan || 'Pemangkasan Cabang Pucuk'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 4 Documentation Photos Grid (Quadrant) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-800">
              DOKUMENTASI FOTO LAPANGAN (4 SUDUT PEMERIKSAAN K3 ROW):
            </span>
            <span className="text-[9px] text-slate-500 font-mono">
              Resolusi Penuh &amp; Watermark Geotagging
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[9px]">
            {/* Foto 1: Sebelum */}
            <PrintPhotoSlot
              number="1"
              title="KONDISI SEBELUM"
              description="Ranting/cabang berada dalam jarak kritis (< 2.5m) ke SUTM 20kV"
              imageSrc={report.foto_sebelum || SAMPLE_PHOTOS.sebelum}
              date={report.tanggal}
              coords={report.koordinat}
            />

            {/* Foto 2: Progres */}
            <PrintPhotoSlot
              number="2"
              title="PROGRES PENGERJAAN"
              description="Eksekusi pemotongan menggunakan alat insulasi dan APD K3 lengkap"
              imageSrc={report.foto_progres || SAMPLE_PHOTOS.progres}
              date={report.tanggal}
              coords={report.koordinat}
            />

            {/* Foto 3: Pengukuran Diameter */}
            <PrintPhotoSlot
              number="3"
              title="PENGUKURAN DIAMETER"
              description={`Pengukuran diameter fisik batang/cabang: Ø ${report.diameter} cm`}
              imageSrc={report.foto_diameter || SAMPLE_PHOTOS.diameter}
              date={report.tanggal}
              coords={report.koordinat}
            />

            {/* Foto 4: Sesudah */}
            <PrintPhotoSlot
              number="4"
              title="KONDISI SESUDAH"
              description={`Right of Way (ROW) bebas dan jarak aman ${report.jarak_sutm || 3.0}m tercapai`}
              imageSrc={report.foto_sesudah || SAMPLE_PHOTOS.sesudah}
              date={report.tanggal}
              coords={report.koordinat}
            />
          </div>
        </div>

        {/* Catatan Khusus */}
        {report.keterangan && (
          <div className="mt-2 text-[9px] p-1.5 border border-slate-300 rounded bg-slate-50">
            <span className="font-bold">Keterangan / Catatan Lapangan:</span> {report.keterangan}
          </div>
        )}
      </div>

      {/* Bottom Sign-off Section (Tanda Tangan Resmi) */}
      <div className="mt-4 pt-3 border-t border-slate-900 text-[10px]">
        <div className="text-right text-[10px] mb-2 font-medium">
          Semarang, {report.tanggal}
        </div>

        <div className="grid grid-cols-3 text-center gap-4">
          {/* Kolom 1: Pelaksana */}
          <div>
            <div className="text-slate-600">Pelaksana Lapangan:</div>
            <div className="font-bold text-slate-800">Regu Harjar ROW</div>
            <div className="h-16 flex items-center justify-center text-slate-300 italic text-[11px]">
              ( Tanda Tangan )
            </div>
            <div className="font-bold underline text-slate-900 uppercase">
              {report.petugas.split('(')[0] || 'REGU HARJAR LAPANGAN'}
            </div>
            <div className="text-slate-500 text-[9px]">Pengawas K3 Lapangan</div>
          </div>

          {/* Kolom 2: Koordinator ULP */}
          <div>
            <div className="text-slate-600">Diperiksa Oleh:</div>
            <div className="font-bold text-slate-800">Koordinator ULP / Spv. Teknik</div>
            <div className="h-16 flex items-center justify-center text-slate-300 italic text-[11px]">
              ( Tanda Tangan )
            </div>
            <div className="font-bold underline text-slate-900 uppercase">
              {config.nama_koordinator || 'EKO SETIAWAN, A.Md.'}
            </div>
            <div className="text-slate-500 font-mono text-[9px]">
              NIP: {config.nip_koordinator || '92151028ZY'}
            </div>
          </div>

          {/* Kolom 3: Mengetahui Manager ULP */}
          <div>
            <div className="text-slate-600">Mengetahui:</div>
            <div className="font-bold text-slate-800">Manager ULP {config.nama_ulp?.replace('ULP ', '') || 'SEMARANG BARAT'}</div>
            <div className="h-16 flex items-center justify-center text-slate-300 italic text-[11px]">
              ( Tanda Tangan &amp; Stempel )
            </div>
            <div className="font-bold underline text-slate-900 uppercase">
              {config.nama_manager || 'BAMBANG HERMANTO, S.T.'}
            </div>
            <div className="text-slate-500 font-mono text-[9px]">
              NIP: {config.nip_manager || '87122049ZY'}
            </div>
          </div>
        </div>

        <div className="mt-2 text-center text-[8px] text-slate-400 font-mono">
          Dokumen ini dicetak secara otomatis melalui Sistem Laporan Pemeliharaan ROW Jaringan PLN (Tauri + React + Rust Engine)
        </div>
      </div>
    </div>
  );
}

function PrintPhotoSlot({ number, title, description, imageSrc, date, coords }) {
  return (
    <div className="border border-slate-700 rounded-xs overflow-hidden flex flex-col bg-white">
      {/* Title Bar */}
      <div className="bg-slate-800 text-white font-bold px-2 py-0.5 flex items-center justify-between text-[9px]">
        <span>{number}. {title}</span>
        <span className="font-mono text-[8px] text-cyan-300">DOK. RESMI</span>
      </div>

      {/* Photo Area */}
      <div className="w-full aspect-16/10 bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-400">
        <img
          src={imageSrc}
          alt={title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        {/* Geotag Stamp Overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-white px-1.5 py-0.5 text-[7.5px] font-mono flex items-center justify-between">
          <span>GPS: {coords}</span>
          <span>{date}</span>
        </div>
      </div>

      {/* Description */}
      <div className="p-1 text-[8.5px] text-slate-700 leading-tight">
        {description}
      </div>
    </div>
  );
}
