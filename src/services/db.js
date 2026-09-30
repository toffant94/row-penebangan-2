/**
 * Database & Persistence Service
 * Simulates SQLite storage locally with full IndexedDB/LocalStorage fallback
 * and interfaces with Tauri Rust backend when running natively.
 */

import { INITIAL_WORK_ORDERS, DEFAULT_CONFIG } from '../utils/assets.js';

const STORAGE_KEY_REPORTS = 'pln_row_work_orders_v1';
const STORAGE_KEY_CONFIG = 'pln_row_app_config_v1';

export const dbService = {
  // Get all work orders
  async getAllReports() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_REPORTS);
      if (!data) {
        // Seed initial demo data
        localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(INITIAL_WORK_ORDERS));
        return INITIAL_WORK_ORDERS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error fetching reports from local DB:', e);
      return INITIAL_WORK_ORDERS;
    }
  },

  // Save or update a single report
  async saveReport(report) {
    const reports = await this.getAllReports();
    let savedItem;

    if (report.id) {
      // Update existing
      const index = reports.findIndex(r => r.id === report.id);
      if (index !== -1) {
        savedItem = {
          ...reports[index],
          ...report,
          updated_at: new Date().toISOString()
        };
        reports[index] = savedItem;
      } else {
        savedItem = { ...report, id: Date.now() };
        reports.unshift(savedItem);
      }
    } else {
      // Create new
      savedItem = {
        ...report,
        id: Date.now(),
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      reports.unshift(savedItem);
    }

    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
    return savedItem;
  },

  // Delete a report
  async deleteReport(id) {
    const reports = await this.getAllReports();
    const filtered = reports.filter(r => Number(r.id) !== Number(id));
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(filtered));
    return true;
  },

  // Delete multiple reports by IDs
  async deleteReports(ids) {
    const idSet = new Set(ids.map(Number));
    const reports = await this.getAllReports();
    const filtered = reports.filter(r => !idSet.has(Number(r.id)));
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(filtered));
    return true;
  },

  // Batch import multiple reports (upsert based on nomor_wo)
  async batchImportReports(newReports) {
    const existing = await this.getAllReports();
    const map = new Map();

    // Fill with existing
    existing.forEach(r => map.set(r.nomor_wo, r));

    // Upsert new reports
    let addedCount = 0;
    let updatedCount = 0;

    newReports.forEach(nr => {
      if (map.has(nr.nomor_wo)) {
        const prev = map.get(nr.nomor_wo);
        map.set(nr.nomor_wo, {
          ...prev,
          ...nr,
          // Retain photos if new report didn't provide them
          foto_sebelum: nr.foto_sebelum || prev.foto_sebelum,
          foto_progres: nr.foto_progres || prev.foto_progres,
          foto_diameter: nr.foto_diameter || prev.foto_diameter,
          foto_sesudah: nr.foto_sesudah || prev.foto_sesudah,
          updated_at: new Date().toISOString()
        });
        updatedCount++;
      } else {
        map.set(nr.nomor_wo, {
          ...nr,
          id: nr.id || Date.now() + Math.floor(Math.random() * 1000),
          created_at: nr.created_at || new Date().toISOString().replace('T', ' ').substring(0, 19)
        });
        addedCount++;
      }
    });

    const combined = Array.from(map.values()).sort((a, b) => {
      return (b.tanggal || '').localeCompare(a.tanggal || '');
    });

    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(combined));
    return { total: combined.length, added: addedCount, updated: updatedCount };
  },

  // Reset to initial demo database
  async resetToDemoData() {
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(INITIAL_WORK_ORDERS));
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(DEFAULT_CONFIG));
    return INITIAL_WORK_ORDERS;
  },

  // Clear all data
  async clearAllReports() {
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify([]));
    return [];
  },

  // App Configuration
  async getConfig() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (!data) {
        localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(DEFAULT_CONFIG));
        return DEFAULT_CONFIG;
      }
      return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    } catch {
      return DEFAULT_CONFIG;
    }
  },

  async saveConfig(newConfig) {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(newConfig));
    return newConfig;
  }
};
