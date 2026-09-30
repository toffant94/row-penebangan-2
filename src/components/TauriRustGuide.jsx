import React, { useState } from 'react';
import { 
  Terminal, 
  Cpu, 
  ShieldCheck, 
  Check, 
  Copy, 
  Code, 
  FolderTree, 
  Download,
  Boxes,
  Play,
  FileCode,
  Github
} from 'lucide-react';

export default function TauriRustGuide({ onBack }) {
  const [activeTab, setActiveTab] = useState('build_bat');
  const [copiedId, setCopiedId] = useState('');

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const codeSnippets = {
    build_bat: `@echo off
title Kompilasi PLN ROW Trimming Manager ke .EXE
color 0A

echo ==============================================================================
echo    PLN ROW TRIMMING MANAGER - AUTOMATED WINDOWS .EXE BUILD SCRIPT
echo    Stack: Tauri v2 + React + Tailwind CSS + Rust (SQLite)
echo ==============================================================================
echo.

:: 1. Cek Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js belum terinstall! Silakan install dari https://nodejs.org/
    pause
    exit /b 1
)

:: 2. Cek Rust / Cargo
where cargo >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Rust belum terinstall! Silakan install dari https://rustup.rs/
    pause
    exit /b 1
)

echo [1/4] Menginstall dependencies npm frontend...
call npm install

echo.
echo [2/4] Menginstall Tauri CLI...
call npm install -g @tauri-apps/cli >nul 2>nul

echo.
echo [3/4] Melakukan build frontend production...
call npm run build

echo.
echo [4/4] Mengompilasi backend Rust dan mem-bundle file .EXE & .MSI...
call cargo tauri build

if %errorlevel% equ 0 (
    color 0A
    echo ==============================================================================
    echo    BERHASIL! File .EXE dan .MSI telah selesai dibuat!
    echo ==============================================================================
    echo File aplikasi berada di folder:
    echo  - src-tauri\\target\\release\\pln-row-trimming-manager.exe
    echo  - src-tauri\\target\\release\\bundle\\msi\\
    explorer src-tauri\\target\\release\\
)
pause`,

    github_workflow: `# .github/workflows/build-tauri-exe.yml
name: Build Windows EXE (Tauri)

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build-windows:
    runs-on: windows-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Rust stable
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: x86_64-pc-windows-msvc

      - name: Install dependencies
        run: npm ci

      - name: Install Tauri CLI
        run: cargo install tauri-cli --version "^2.0.0" --locked

      - name: Build Windows .EXE & .MSI Installer
        run: cargo tauri build

      - name: Upload Windows Executable Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: PLN-ROW-Trimming-Manager-Windows-EXE
          path: |
            src-tauri/target/release/*.exe
            src-tauri/target/release/bundle/msi/*.msi`,

    main_rs: `// src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WorkOrder {
    pub id: Option<i64>,
    pub tanggal: String,
    pub nomor_wo: String,
    pub unit: String,
    pub penyulang: String,
    pub petugas: String,
    pub pohon: String,
    pub koordinat: String,
    pub diameter: f64,
    pub jarak_sutm: Option<f64>,
    pub tindakan: Option<String>,
    pub foto_sebelum: Option<String>,
    pub foto_progres: Option<String>,
    pub foto_diameter: Option<String>,
    pub foto_sesudah: Option<String>,
    pub keterangan: Option<String>,
}

pub struct DbState {
    pub conn: Mutex<Connection>,
}

fn init_db() -> Result<Connection> {
    let conn = Connection::open("pln_row_reports.db")?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS work_orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tanggal TEXT NOT NULL,
            nomor_wo TEXT NOT NULL UNIQUE,
            unit TEXT NOT NULL,
            penyulang TEXT NOT NULL,
            petugas TEXT NOT NULL,
            pohon TEXT NOT NULL,
            koordinat TEXT NOT NULL,
            diameter REAL NOT NULL,
            jarak_sutm REAL,
            tindakan TEXT,
            foto_sebelum TEXT,
            foto_progres TEXT,
            foto_diameter TEXT,
            foto_sesudah TEXT,
            keterangan TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;
    Ok(conn)
}

#[tauri::command]
fn get_all_reports(state: State<DbState>) -> Result<Vec<WorkOrder>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, tanggal, nomor_wo, unit, penyulang, petugas, pohon, koordinat, diameter, jarak_sutm, tindakan, foto_sebelum, foto_progres, foto_diameter, foto_sesudah, keterangan FROM work_orders ORDER BY tanggal DESC").map_err(|e| e.to_string())?;
    let rows = stmt.query_map([], |row| {
        Ok(WorkOrder {
            id: Some(row.get(0)?),
            tanggal: row.get(1)?,
            nomor_wo: row.get(2)?,
            unit: row.get(3)?,
            penyulang: row.get(4)?,
            petugas: row.get(5)?,
            pohon: row.get(6)?,
            koordinat: row.get(7)?,
            diameter: row.get(8)?,
            jarak_sutm: row.get(9)?,
            tindakan: row.get(10)?,
            foto_sebelum: row.get(11)?,
            foto_progres: row.get(12)?,
            foto_diameter: row.get(13)?,
            foto_sesudah: row.get(14)?,
            keterangan: row.get(15)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut list = Vec::new();
    for r in rows {
        if let Ok(wo) = r { list.push(wo); }
    }
    Ok(list)
}

#[tauri::command]
fn delete_reports(ids: Vec<i64>, state: State<DbState>) -> Result<usize, String> {
    let mut conn = state.conn.lock().map_err(|e| e.to_string())?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;
    let mut deleted = 0;
    for id in ids {
        deleted += tx.execute("DELETE FROM work_orders WHERE id = ?1", params![id]).map_err(|e| e.to_string())?;
    }
    tx.commit().map_err(|e| e.to_string())?;
    Ok(deleted)
}

fn main() {
    let conn = init_db().expect("Gagal inisialisasi SQLite database");
    tauri::Builder::default()
        .manage(DbState { conn: Mutex::new(conn) })
        .invoke_handler(tauri::generate_handler![
            get_all_reports,
            delete_reports
        ])
        .run(tauri::generate_context!())
        .expect("Error menjalankan aplikasi Tauri");
}`,

    cargo_toml: `# src-tauri/Cargo.toml
[package]
name = "pln-row-trimming-manager"
version = "1.0.0"
description = "Aplikasi Desktop Pemeliharaan Jaringan & Laporan Perabasan Pohon PLN"
authors = ["PLN Engineering Team"]
edition = "2021"

[build-dependencies]
tauri-build = { version = "2.0", features = [] }

[dependencies]
tauri = { version = "2.0", features = ["protocol-asset"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
rusqlite = { version = "0.31", features = ["bundled"] }
calamine = "0.24"
chrono = { version = "0.4", features = ["serde"] }`,

    tauri_conf: `// src-tauri/tauri.conf.json
{
  "$schema": "https://raw.githubusercontent.com/tauri-apps/tauri/dev/crates/tauri-cli/schema.json",
  "build": {
    "beforeDevCommand": "npm run dev",
    "devUrl": "http://localhost:3000",
    "beforeBuildCommand": "npm run build",
    "frontendDist": "../dist"
  },
  "package": {
    "productName": "PLN ROW Trimming Manager",
    "version": "1.0.0"
  },
  "app": {
    "windows": [
      {
        "title": "PLN ROW Trimming Manager - Sistem Laporan Perabasan Pohon",
        "width": 1280,
        "height": 860,
        "minWidth": 980,
        "minHeight": 640,
        "resizable": true
      }
    ]
  }
}`
  };

  const steps = [
    {
      title: "1. Download / Clone Repositori Ini",
      desc: "Semua file project (frontend React .jsx, Tailwind, dan backend Rust SQLite di folder /src-tauri) sudah lengkap dan siap di-compile.",
      cmd: "git clone <repo-url> && cd pln-row-trimming-manager"
    },
    {
      title: "2. Cara Otomatis (1-Klik via build-windows-exe.bat)",
      desc: "Cukup klik dua kali (double-click) file 'build-windows-exe.bat' di komputer Windows Anda, script akan otomatis menginstall dependensi dan meng-compile file .EXE.",
      cmd: "build-windows-exe.bat"
    },
    {
      title: "3. Cara Manual via Terminal (Command Prompt / PowerShell)",
      desc: "Jalankan perintah berikut di PowerShell atau Command Prompt pada komputer Windows:",
      cmd: "npm install && npm run build && cargo tauri build"
    },
    {
      title: "4. Cara Otomatis di Cloud (GitHub Actions)",
      desc: "File '.github/workflows/build-tauri-exe.yml' sudah disiapkan. Begitu project di-push ke GitHub, server Windows GitHub Actions akan otomatis membuat file .EXE siap unduh di tab Actions / Releases.",
      cmd: "git push origin main"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono font-medium">
              <Cpu className="w-3.5 h-3.5" />
              <span>Panduan Kompilasi Executable (.EXE) Windows</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Cara Mengompilasi Project Menjadi File .EXE (Tauri Desktop Native)
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Karena lingkungan AI Studio berjalan di web container Linux (cloud), pembuatan binary PE Windows (<code className="text-cyan-300 font-mono">.exe</code>) dilakukan pada sistem operasi Windows atau melalui pipeline CI/CD GitHub Actions. Seluruh konfigurasi, kode backend Rust, dan script otomatisasi <code className="text-cyan-300 font-mono">build-windows-exe.bat</code> telah disiapkan di root folder project.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium border border-slate-700 transition-colors"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* 2 Metode Paling Praktis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Method 1: 1-Click BAT */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Play className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Metode 1: 1-Klik Script Windows</h4>
              <p className="text-[11px] text-slate-500">Otomatis menggunakan file build-windows-exe.bat</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Di root project sudah tersedia file <strong><code className="text-emerald-700 font-mono">build-windows-exe.bat</code></strong>. Di laptop/PC Windows Anda, cukup klik 2x file tersebut. Script akan memverifikasi compiler Rust, menginstall dependensi, dan langsung menghasilkan file installer di:
          </p>
          <div className="p-2.5 bg-slate-100 rounded-lg font-mono text-[11px] text-slate-800">
            src-tauri\target\release\pln-row-trimming-manager.exe
          </div>
        </div>

        {/* Method 2: GitHub Actions */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Metode 2: Cloud Build Otomatis (GitHub)</h4>
              <p className="text-[11px] text-slate-500">Tanpa perlu install Rust di komputer Anda</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            File <strong><code className="text-cyan-700 font-mono">.github/workflows/build-tauri-exe.yml</code></strong> telah dikonfigurasi. Begitu Anda push project ini ke GitHub, server VM Windows GitHub akan otomatis meng-compile dan menghasilkan file <strong>.exe</strong> dan <strong>.msi</strong> yang bisa di-download langsung dari tab <em>Actions</em>.
          </p>
          <div className="p-2.5 bg-slate-100 rounded-lg font-mono text-[11px] text-slate-800">
            Artifacts: PLN-ROW-Trimming-Manager-Windows-EXE.zip
          </div>
        </div>
      </div>

      {/* Langkah-langkah detail */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-600" />
          <span>Panduan Langkah Demi Langkah Kompilasi ke .EXE</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((s, i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{s.title}</span>
                <button
                  onClick={() => copyToClipboard(s.cmd, `step-${i}`)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded"
                  title="Salin Perintah"
                >
                  {copiedId === `step-${i}` ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">{s.desc}</p>
              <div className="bg-slate-900 text-slate-100 font-mono text-xs p-2.5 rounded-lg overflow-x-auto">
                <code>{s.cmd}</code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Source Code Viewer */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-cyan-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              File Konfigurasi &amp; Build Script yang Telah Dibuat
            </h3>
          </div>

          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => setActiveTab('build_bat')}
              className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors ${
                activeTab === 'build_bat' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              build-windows-exe.bat
            </button>
            <button
              onClick={() => setActiveTab('github_workflow')}
              className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors ${
                activeTab === 'github_workflow' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              build-tauri-exe.yml
            </button>
            <button
              onClick={() => setActiveTab('main_rs')}
              className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors ${
                activeTab === 'main_rs' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              src/main.rs
            </button>
            <button
              onClick={() => setActiveTab('cargo_toml')}
              className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors ${
                activeTab === 'cargo_toml' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Cargo.toml
            </button>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => copyToClipboard(codeSnippets[activeTab], 'code-tab')}
            className="absolute top-3 right-3 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs flex items-center gap-1 font-sans border border-slate-700 shadow-sm z-10"
          >
            {copiedId === 'code-tab' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-300" />
                <span>Salin Script</span>
              </>
            )}
          </button>
          <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed">
            <code>{codeSnippets[activeTab]}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
