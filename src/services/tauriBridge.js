/**
 * Tauri Bridge Service
 * Handles communication with native Rust backend when running inside Tauri Desktop
 * and seamlessly provides full local database capability when running in web browser.
 */

import { dbService } from './db.js';

export const isTauriEnvironment = () => {
  return typeof window !== 'undefined' && Boolean(window.__TAURI__ || window.__TAURI_INTERNALS__);
};

export const tauriBridge = {
  isTauri: isTauriEnvironment(),

  async getAllReports() {
    if (this.isTauri && window.__TAURI__?.core?.invoke) {
      try {
        return await window.__TAURI__.core.invoke('get_all_reports');
      } catch (err) {
        console.warn('Tauri invoke failed, using local DB:', err);
      }
    }
    return dbService.getAllReports();
  },

  async saveReport(report) {
    if (this.isTauri && window.__TAURI__?.core?.invoke) {
      try {
        const id = await window.__TAURI__.core.invoke('save_report', { report });
        return { ...report, id };
      } catch (err) {
        console.warn('Tauri invoke failed, using local DB:', err);
      }
    }
    return dbService.saveReport(report);
  },

  async batchImportReports(reports) {
    if (this.isTauri && window.__TAURI__?.core?.invoke) {
      try {
        const count = await window.__TAURI__.core.invoke('batch_import_reports', { reports });
        return { total: count, added: count, updated: 0 };
      } catch (err) {
        console.warn('Tauri invoke failed, using local DB:', err);
      }
    }
    return dbService.batchImportReports(reports);
  },

  async deleteReport(id) {
    if (this.isTauri && window.__TAURI__?.core?.invoke) {
      try {
        return await window.__TAURI__.core.invoke('delete_report', { id: Number(id) });
      } catch (err) {
        console.warn('Tauri invoke failed, using local DB:', err);
      }
    }
    return dbService.deleteReport(id);
  },

  async deleteReports(ids) {
    if (this.isTauri && window.__TAURI__?.core?.invoke) {
      try {
        return await window.__TAURI__.core.invoke('delete_reports', { ids: ids.map(Number) });
      } catch (err) {
        console.warn('Tauri invoke failed, using local DB:', err);
      }
    }
    return dbService.deleteReports(ids);
  },

  async getSystemInfo() {
    if (this.isTauri && window.__TAURI__?.core?.invoke) {
      try {
        return await window.__TAURI__.core.invoke('get_system_info');
      } catch (err) {
        console.warn('Tauri invoke failed:', err);
      }
    }
    return {
      backend: "Tauri v2 + Rust (Desktop Mode Ready)",
      database: "Local SQLite / IndexedDB Embedded Engine",
      runtime: isTauriEnvironment() ? "Native Tauri Webview" : "AI Studio Web Preview Mode",
      status: "Online & Functional"
    };
  }
};
