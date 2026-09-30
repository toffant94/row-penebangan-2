/**
 * Excel Parser Engine for PLN ROW Tree Trimming Reports
 * Supports:
 * 1. Multi-sheet Excel files (each sheet can be a Date e.g. '2024-10-01')
 * 2. Horizontal 2-column paired layout per Work Order (Col A & B = WO 1, Col C & D = WO 2, etc.)
 * 3. Fallback standard tabular layout detection
 * 4. Sample Excel template generator
 * 5. Export database back to Excel
 */

import * as XLSX from 'xlsx';
import { SAMPLE_PHOTOS } from '../utils/assets.js';

// Helper to normalize field keys
function normalizeKey(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

// Map Indonesian labels to work order properties
function mapField(label) {
  const k = normalizeKey(label);
  if (k.includes('tanggal') || k.includes('tgl') || k.includes('date')) return 'tanggal';
  if (k.includes('nomorwo') || k.includes('nowo') || k.includes('noorder') || k.includes('workorder') || k === 'wo') return 'nomor_wo';
  if (k.includes('unit') || k.includes('ulp') || k.includes('rayon')) return 'unit';
  if (k.includes('penyulang') || k.includes('feeder') || k.includes('jurusan')) return 'penyulang';
  if (k.includes('petugas') || k.includes('regu') || k.includes('pelaksana') || k.includes('tim')) return 'petugas';
  if (k.includes('pohon') || k.includes('tanaman') || k.includes('vegetasi') || k.includes('spesies')) return 'pohon';
  if (k.includes('koordinat') || k.includes('gps') || k.includes('lat') || k.includes('titik')) return 'koordinat';
  if (k.includes('diameter') || k.includes('dia') || k.includes('keliling')) return 'diameter';
  if (k.includes('jarak') || k.includes('sutm') || k.includes('bebas')) return 'jarak_sutm';
  if (k.includes('tindakan') || k.includes('pekerjaan') || k.includes('eksekusi')) return 'tindakan';
  if (k.includes('keterangan') || k.includes('catatan') || k.includes('ket') || k.includes('note')) return 'keterangan';
  if (k.includes('sebelum') || k.includes('before')) return 'foto_sebelum';
  if (k.includes('progres') || k.includes('progress') || k.includes('proses')) return 'foto_progres';
  if (k.includes('ukur') || (k.includes('foto') && k.includes('dia'))) return 'foto_diameter';
  if (k.includes('sesudah') || k.includes('after') || k.includes('selesai')) return 'foto_sesudah';
  return null;
}

export const excelParser = {
  /**
   * Parse an uploaded file (ArrayBuffer or File)
   */
  async parseExcelFile(file) {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array', cellDates: true });
    
    const results = {
      sheetNames: workbook.SheetNames,
      workOrders: [],
      errors: [],
      stats: {
        totalSheets: workbook.SheetNames.length,
        totalParsed: 0,
        horizontalCount: 0,
        tabularCount: 0
      }
    };

    // Iterate through every sheet in the workbook
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      // Convert sheet to 2D array of rows
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      if (!rows || rows.length === 0) continue;

      // Try parsing as Horizontal (2-column paired layout per WO)
      const horizontalWOs = this.parseHorizontalSheet(rows, sheetName);
      if (horizontalWOs.length > 0) {
        results.workOrders.push(...horizontalWOs);
        results.stats.horizontalCount += horizontalWOs.length;
      } else {
        // Fallback: try parsing as Tabular (row-based)
        const tabularWOs = this.parseTabularSheet(rows, sheetName);
        if (tabularWOs.length > 0) {
          results.workOrders.push(...tabularWOs);
          results.stats.tabularCount += tabularWOs.length;
        }
      }
    }

    results.stats.totalParsed = results.workOrders.length;
    return results;
  },

  /**
   * Parse Horizontal Sheet Structure:
   * Where each pair of columns (e.g., [Col 0, Col 1], [Col 2, Col 3], etc.)
   * represents 1 Work Order.
   */
  parseHorizontalSheet(rows, sheetName) {
    const detectedWOs = [];
    if (rows.length < 2) return [];

    // Find the maximum number of columns across all rows
    let maxCols = 0;
    rows.forEach(r => {
      if (Array.isArray(r) && r.length > maxCols) maxCols = r.length;
    });

    // Check every pair of columns (step by 2)
    for (let c = 0; c < maxCols; c += 2) {
      const woData = {};
      let matchedFieldsCount = 0;

      for (let r = 0; r < rows.length; r++) {
        const row = rows[r];
        if (!row) continue;
        const rawLabel = String(row[c] || '').trim();
        const rawVal = row[c + 1] !== undefined ? row[c + 1] : '';

        const fieldKey = mapField(rawLabel);
        if (fieldKey) {
          matchedFieldsCount++;
          let val = rawVal;
          if (val instanceof Date) {
            val = val.toISOString().split('T')[0];
          } else {
            val = String(val).trim();
          }

          if (fieldKey === 'diameter' || fieldKey === 'jarak_sutm') {
            const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
            woData[fieldKey] = isNaN(num) ? 0 : num;
          } else {
            woData[fieldKey] = val;
          }
        }
      }

      // If at least 2 distinct PLN attributes matched in this column pair, treat as valid WO
      if (matchedFieldsCount >= 2) {
        // Fallback for missing fields
        const dateMatch = sheetName.match(/\d{4}-\d{2}-\d{2}/) || sheetName.match(/\d{2}-\d{2}-\d{4}/);
        const inferredDate = dateMatch ? dateMatch[0] : new Date().toISOString().split('T')[0];
        
        const woNumber = woData.nomor_wo || `WO/PLN-AUTO/${sheetName.replace(/\s+/g, '_')}/${Math.floor(c / 2) + 1}`;
        
        detectedWOs.push({
          id: Date.now() + detectedWOs.length + Math.floor(Math.random() * 1000),
          tanggal: woData.tanggal || inferredDate,
          nomor_wo: woNumber,
          unit: woData.unit || 'ULP SEMARANG BARAT',
          penyulang: woData.penyulang || 'PYL-UTAMA-01',
          petugas: woData.petugas || 'Regu Harjar PLN',
          pohon: woData.pohon || 'Pohon Peneduh',
          koordinat: woData.koordinat || '-6.992000, 110.384000',
          diameter: Number(woData.diameter) || 30.0,
          jarak_sutm: Number(woData.jarak_sutm) || 3.0,
          tindakan: woData.tindakan || 'Pemangkasan Cabang ROW',
          foto_sebelum: woData.foto_sebelum && woData.foto_sebelum.startsWith('data:') ? woData.foto_sebelum : SAMPLE_PHOTOS.sebelum,
          foto_progres: woData.foto_progres && woData.foto_progres.startsWith('data:') ? woData.foto_progres : SAMPLE_PHOTOS.progres,
          foto_diameter: woData.foto_diameter && woData.foto_diameter.startsWith('data:') ? woData.foto_diameter : SAMPLE_PHOTOS.diameter,
          foto_sesudah: woData.foto_sesudah && woData.foto_sesudah.startsWith('data:') ? woData.foto_sesudah : SAMPLE_PHOTOS.sesudah,
          keterangan: woData.keterangan || `Imported dari sheet ${sheetName} (Kolom ${c + 1}-${c + 2})`,
          created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
        });
      }
    }

    return detectedWOs;
  },

  /**
   * Parse Standard Tabular Sheet Structure:
   * Header on row 0 or 1, subsequent rows are individual records.
   */
  parseTabularSheet(rows, sheetName) {
    if (rows.length < 2) return [];

    let headerRowIdx = -1;
    let colMap = {};

    // Scan first 5 rows for header row
    for (let r = 0; r < Math.min(5, rows.length); r++) {
      const row = rows[r];
      let matches = 0;
      const tempMap = {};

      row.forEach((cell, idx) => {
        const fieldKey = mapField(cell);
        if (fieldKey) {
          tempMap[idx] = fieldKey;
          matches++;
        }
      });

      if (matches >= 3) {
        headerRowIdx = r;
        colMap = tempMap;
        break;
      }
    }

    if (headerRowIdx === -1) return [];

    const list = [];
    for (let r = headerRowIdx + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length === 0) continue;

      const woData = {};
      Object.entries(colMap).forEach(([colIdx, fieldKey]) => {
        let val = row[colIdx];
        if (val instanceof Date) {
          val = val.toISOString().split('T')[0];
        } else {
          val = String(val || '').trim();
        }

        if (fieldKey === 'diameter' || fieldKey === 'jarak_sutm') {
          const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
          woData[fieldKey] = isNaN(num) ? 0 : num;
        } else {
          woData[fieldKey] = val;
        }
      });

      if (woData.nomor_wo || woData.penyulang || woData.pohon) {
        list.push({
          id: Date.now() + list.length + Math.floor(Math.random() * 1000),
          tanggal: woData.tanggal || new Date().toISOString().split('T')[0],
          nomor_wo: woData.nomor_wo || `WO/TAB/${sheetName}/${r}`,
          unit: woData.unit || 'ULP SEMARANG BARAT',
          penyulang: woData.penyulang || 'PYL-UTAMA-01',
          petugas: woData.petugas || 'Regu Harjar PLN',
          pohon: woData.pohon || 'Pohon',
          koordinat: woData.koordinat || '-6.992000, 110.384000',
          diameter: Number(woData.diameter) || 30.0,
          jarak_sutm: Number(woData.jarak_sutm) || 3.0,
          tindakan: woData.tindakan || 'Pemangkasan',
          foto_sebelum: SAMPLE_PHOTOS.sebelum,
          foto_progres: SAMPLE_PHOTOS.progres,
          foto_diameter: SAMPLE_PHOTOS.diameter,
          foto_sesudah: SAMPLE_PHOTOS.sesudah,
          keterangan: woData.keterangan || `Imported tabular ${sheetName} baris ${r + 1}`,
          created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
        });
      }
    }

    return list;
  },

  /**
   * Generate & Download Official Horizontal Multi-Sheet Sample Excel
   * Demonstrating the exact format specified by the user:
   * - Multi-sheet based on dates
   * - Multi-column horizontal format where every 2 columns is 1 Work Order
   */
  generateSampleExcel() {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Date 2024-10-01 (Contains 2 Work Orders horizontally side-by-side)
    const sheet1Data = [
      // Row 0: Work Order Title Header
      ["WORK ORDER #1", "", "WORK ORDER #2", "", "WORK ORDER #3", ""],
      // Row 1..13: 2-column paired parameters
      ["Tanggal", "2024-10-01", "Tanggal", "2024-10-01", "Tanggal", "2024-10-01"],
      ["Nomor WO", "WO/PLN-SB/ROW/20241001-01", "Nomor WO", "WO/PLN-SB/ROW/20241001-02", "Nomor WO", "WO/PLN-SB/ROW/20241001-03"],
      ["Unit", "ULP SEMARANG BARAT", "Unit", "ULP SEMARANG BARAT", "Unit", "ULP SEMARANG BARAT"],
      ["Penyulang", "PYL-CENDRAWASIH-02", "Penyulang", "PYL-CENDRAWASIH-02", "Penyulang", "PYL-MERAK-04"],
      ["Petugas", "Regu Harjar A (Joko P. & Bambang)", "Petugas", "Regu Harjar A (Joko P. & Bambang)", "Petugas", "Regu Harjar B (Dedi K.)"],
      ["Pohon", "Pohon Trembesi (Pucuk menyentuh SUTM)", "Pohon", "Pohon Sengon Condong", "Pohon", "Pohon Mahoni"],
      ["Koordinat", "-6.992150, 110.384210", "Koordinat", "-6.994520, 110.388740", "Koordinat", "-7.001840, 110.401220"],
      ["Diameter", 45, "Diameter", 38, "Diameter", 50],
      ["Jarak Bebas SUTM (m)", 3.2, "Jarak Bebas SUTM (m)", 3.5, "Jarak Bebas SUTM (m)", 3.0],
      ["Tindakan", "Topping Pucuk Pohon", "Tindakan", "Penebangan Cabang Condong", "Tindakan", "Side Trimming"],
      ["Keterangan", "Pekerjaan tuntas, jalur aman", "Keterangan", "Izin pemilik lahan terpenuhi", "Keterangan", "Dekat trafo gardu SB-88"],
      ["Slot Foto 1 (Sebelum)", "[TERSEDIA DI SISTEM]", "Slot Foto 1 (Sebelum)", "[TERSEDIA DI SISTEM]", "Slot Foto 1 (Sebelum)", "[TERSEDIA DI SISTEM]"],
      ["Slot Foto 2 (Progres)", "[TERSEDIA DI SISTEM]", "Slot Foto 2 (Progres)", "[TERSEDIA DI SISTEM]", "Slot Foto 2 (Progres)", "[TERSEDIA DI SISTEM]"],
      ["Slot Foto 3 (Diameter)", "[TERSEDIA DI SISTEM]", "Slot Foto 3 (Diameter)", "[TERSEDIA DI SISTEM]", "Slot Foto 3 (Diameter)", "[TERSEDIA DI SISTEM]"],
      ["Slot Foto 4 (Sesudah)", "[TERSEDIA DI SISTEM]", "Slot Foto 4 (Sesudah)", "[TERSEDIA DI SISTEM]", "Slot Foto 4 (Sesudah)", "[TERSEDIA DI SISTEM]"]
    ];

    const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
    // Set column widths
    ws1['!cols'] = [
      { wch: 22 }, { wch: 34 },
      { wch: 22 }, { wch: 34 },
      { wch: 22 }, { wch: 34 }
    ];
    XLSX.utils.book_append_sheet(wb, ws1, "2024-10-01");

    // Sheet 2: Date 2024-10-02 (Contains another 2 Work Orders horizontally)
    const sheet2Data = [
      ["WORK ORDER #4", "", "WORK ORDER #5", ""],
      ["Tanggal", "2024-10-02", "Tanggal", "2024-10-02"],
      ["Nomor WO", "WO/PLN-SB/ROW/20241002-01", "Nomor WO", "WO/PLN-SB/ROW/20241002-02"],
      ["Unit", "ULP SEMARANG BARAT", "Unit", "ULP SEMARANG BARAT"],
      ["Penyulang", "PYL-FLAMBOYAN-01", "Penyulang", "PYL-FLAMBOYAN-01"],
      ["Petugas", "Regu Harjar C (Suryo & Rudi)", "Petugas", "Regu Harjar C (Suryo & Rudi)"],
      ["Pohon", "Rumpun Bambu Petung", "Pohon", "Pohon Kelapa Berbuah"],
      ["Koordinat", "-7.004110, 110.405600", "Koordinat", "-7.012550, 110.419030"],
      ["Diameter", 25, "Diameter", 35],
      ["Jarak Bebas SUTM (m)", 4.0, "Jarak Bebas SUTM (m)", 3.8],
      ["Tindakan", "Penebangan Rumpun Melengkung", "Tindakan", "Pemangkasan Pelepah Kering"],
      ["Keterangan", "Bambu dibersihkan dari jalur kabel", "Keterangan", "Kabel aman dari rontokan pelepah"],
      ["Slot Foto 1 (Sebelum)", "[TERSEDIA DI SISTEM]", "Slot Foto 1 (Sebelum)", "[TERSEDIA DI SISTEM]"],
      ["Slot Foto 2 (Progres)", "[TERSEDIA DI SISTEM]", "Slot Foto 2 (Progres)", "[TERSEDIA DI SISTEM]"],
      ["Slot Foto 3 (Diameter)", "[TERSEDIA DI SISTEM]", "Slot Foto 3 (Diameter)", "[TERSEDIA DI SISTEM]"],
      ["Slot Foto 4 (Sesudah)", "[TERSEDIA DI SISTEM]", "Slot Foto 4 (Sesudah)", "[TERSEDIA DI SISTEM]"]
    ];

    const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
    ws2['!cols'] = [
      { wch: 22 }, { wch: 34 },
      { wch: 22 }, { wch: 34 }
    ];
    XLSX.utils.book_append_sheet(wb, ws2, "2024-10-02");

    // Write file and trigger download
    XLSX.writeFile(wb, "Template_Laporan_Perabasan_PLN_Horizontal.xlsx");
    return true;
  },

  /**
   * Export all database work orders to Excel (both Horizontal paired sheets & Master List)
   */
  exportReportsToExcel(reports, config) {
    const wb = XLSX.utils.book_new();

    // 1. Master Tabular Sheet
    const masterData = reports.map((r, idx) => ({
      "No": idx + 1,
      "Tanggal": r.tanggal,
      "Nomor WO": r.nomor_wo,
      "Unit": r.unit,
      "Penyulang": r.penyulang,
      "Petugas Regu": r.petugas,
      "Jenis Pohon": r.pohon,
      "Titik Koordinat": r.koordinat,
      "Diameter (cm)": r.diameter,
      "Jarak Bebas (m)": r.jarak_sutm || 3.0,
      "Tindakan": r.tindakan,
      "Status Foto": (r.foto_sebelum && r.foto_progres && r.foto_diameter && r.foto_sesudah) ? "Lengkap (4 Foto)" : "Belum Lengkap",
      "Keterangan": r.keterangan || ""
    }));

    const wsMaster = XLSX.utils.json_to_sheet(masterData);
    XLSX.utils.book_append_sheet(wb, wsMaster, "Master Daftar WO");

    // 2. Group by date and create Horizontal 2-column sheets
    const groups = {};
    reports.forEach(r => {
      const d = r.tanggal || 'Tanpa-Tanggal';
      if (!groups[d]) groups[d] = [];
      groups[d].push(r);
    });

    Object.entries(groups).forEach(([dateStr, items]) => {
      const rows = [
        items.map((_, i) => [`WORK ORDER #${i + 1}`, ""]).flat(),
        items.map(r => ["Tanggal", r.tanggal]).flat(),
        items.map(r => ["Nomor WO", r.nomor_wo]).flat(),
        items.map(r => ["Unit", r.unit]).flat(),
        items.map(r => ["Penyulang", r.penyulang]).flat(),
        items.map(r => ["Petugas", r.petugas]).flat(),
        items.map(r => ["Pohon", r.pohon]).flat(),
        items.map(r => ["Koordinat", r.koordinat]).flat(),
        items.map(r => ["Diameter (cm)", r.diameter]).flat(),
        items.map(r => ["Jarak SUTM (m)", r.jarak_sutm || 3.0]).flat(),
        items.map(r => ["Tindakan", r.tindakan || "-"]).flat(),
        items.map(r => ["Keterangan", r.keterangan || "-"]).flat(),
        items.map(r => ["Foto 1 Sebelum", r.foto_sebelum ? "Tersimpan" : "Kosong"]).flat(),
        items.map(r => ["Foto 2 Progres", r.foto_progres ? "Tersimpan" : "Kosong"]).flat(),
        items.map(r => ["Foto 3 Diameter", r.foto_diameter ? "Tersimpan" : "Kosong"]).flat(),
        items.map(r => ["Foto 4 Sesudah", r.foto_sesudah ? "Tersimpan" : "Kosong"]).flat()
      ];

      const wsHorizontal = XLSX.utils.aoa_to_sheet(rows);
      // Clean sheet name (max 31 chars, no invalid chars)
      const cleanName = dateStr.replace(/[/\\?*[\]]/g, '-').substring(0, 30);
      XLSX.utils.book_append_sheet(wb, wsHorizontal, `Tgl_${cleanName}`);
    });

    const fileName = `Laporan_Perabasan_PLN_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    return true;
  }
};
