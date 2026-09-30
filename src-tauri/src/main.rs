// Prevents additional console window on Windows in release
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
    pub created_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppConfig {
    pub nama_uid: String,
    pub nama_up3: String,
    pub nama_ulp: String,
    pub nama_manager: String,
    pub nip_manager: String,
    pub nama_koordinator: String,
    pub nip_koordinator: String,
    pub no_dokumen: String,
}

pub struct DbState {
    pub conn: Mutex<Connection>,
}

fn init_db() -> Result<Connection> {
    let conn = Connection::open("pln_row_reports.db")?;
    
    // Create Work Orders Table
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

    // Create App Config / Settings Table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS app_config (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )",
        [],
    )?;

    Ok(conn)
}

#[tauri::command]
fn get_all_reports(state: State<DbState>) -> Result<Vec<WorkOrder>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, tanggal, nomor_wo, unit, penyulang, petugas, pohon, koordinat, 
                    diameter, jarak_sutm, tindakan, foto_sebelum, foto_progres, foto_diameter, 
                    foto_sesudah, keterangan, created_at 
             FROM work_orders ORDER BY tanggal DESC, id DESC"
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
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
                created_at: row.get(16)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut list = Vec::new();
    for r in rows {
        if let Ok(wo) = r {
            list.push(wo);
        }
    }
    Ok(list)
}

#[tauri::command]
fn save_report(report: WorkOrder, state: State<DbState>) -> Result<i64, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    
    if let Some(id) = report.id {
        // Update existing report
        conn.execute(
            "UPDATE work_orders SET 
                tanggal = ?1, nomor_wo = ?2, unit = ?3, penyulang = ?4, petugas = ?5, 
                pohon = ?6, koordinat = ?7, diameter = ?8, jarak_sutm = ?9, tindakan = ?10, 
                foto_sebelum = ?11, foto_progres = ?12, foto_diameter = ?13, foto_sesudah = ?14, 
                keterangan = ?15 
             WHERE id = ?16",
            params![
                report.tanggal,
                report.nomor_wo,
                report.unit,
                report.penyulang,
                report.petugas,
                report.pohon,
                report.koordinat,
                report.diameter,
                report.jarak_sutm,
                report.tindakan,
                report.foto_sebelum,
                report.foto_progres,
                report.foto_diameter,
                report.foto_sesudah,
                report.keterangan,
                id
            ],
        ).map_err(|e| e.to_string())?;
        Ok(id)
    } else {
        // Insert new report
        conn.execute(
            "INSERT INTO work_orders (
                tanggal, nomor_wo, unit, penyulang, petugas, pohon, koordinat, 
                diameter, jarak_sutm, tindakan, foto_sebelum, foto_progres, foto_diameter, 
                foto_sesudah, keterangan
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)",
            params![
                report.tanggal,
                report.nomor_wo,
                report.unit,
                report.penyulang,
                report.petugas,
                report.pohon,
                report.koordinat,
                report.diameter,
                report.jarak_sutm,
                report.tindakan,
                report.foto_sebelum,
                report.foto_progres,
                report.foto_diameter,
                report.foto_sesudah,
                report.keterangan
            ],
        ).map_err(|e| e.to_string())?;
        Ok(conn.last_insert_rowid())
    }
}

#[tauri::command]
fn batch_import_reports(reports: Vec<WorkOrder>, state: State<DbState>) -> Result<usize, String> {
    let mut conn = state.conn.lock().map_err(|e| e.to_string())?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;
    
    let mut count = 0;
    for r in reports {
        tx.execute(
            "INSERT INTO work_orders (
                tanggal, nomor_wo, unit, penyulang, petugas, pohon, koordinat, 
                diameter, jarak_sutm, tindakan, foto_sebelum, foto_progres, foto_diameter, 
                foto_sesudah, keterangan
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)
            ON CONFLICT(nomor_wo) DO UPDATE SET
                tanggal=excluded.tanggal,
                unit=excluded.unit,
                penyulang=excluded.penyulang,
                petugas=excluded.petugas,
                pohon=excluded.pohon,
                koordinat=excluded.koordinat,
                diameter=excluded.diameter,
                jarak_sutm=excluded.jarak_sutm,
                tindakan=excluded.tindakan,
                foto_sebelum=COALESCE(excluded.foto_sebelum, work_orders.foto_sebelum),
                foto_progres=COALESCE(excluded.foto_progres, work_orders.foto_progres),
                foto_diameter=COALESCE(excluded.foto_diameter, work_orders.foto_diameter),
                foto_sesudah=COALESCE(excluded.foto_sesudah, work_orders.foto_sesudah),
                keterangan=excluded.keterangan",
            params![
                r.tanggal,
                r.nomor_wo,
                r.unit,
                r.penyulang,
                r.petugas,
                r.pohon,
                r.koordinat,
                r.diameter,
                r.jarak_sutm,
                r.tindakan,
                r.foto_sebelum,
                r.foto_progres,
                r.foto_diameter,
                r.foto_sesudah,
                r.keterangan
            ],
        ).map_err(|e| e.to_string())?;
        count += 1;
    }
    
    tx.commit().map_err(|e| e.to_string())?;
    Ok(count)
}

#[tauri::command]
fn delete_report(id: i64, state: State<DbState>) -> Result<bool, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM work_orders WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(true)
}

#[tauri::command]
fn delete_reports(ids: Vec<i64>, state: State<DbState>) -> Result<usize, String> {
    let mut conn = state.conn.lock().map_err(|e| e.to_string())?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;
    let mut deleted = 0;
    for id in ids {
        deleted += tx.execute("DELETE FROM work_orders WHERE id = ?1", params![id])
            .map_err(|e| e.to_string())?;
    }
    tx.commit().map_err(|e| e.to_string())?;
    Ok(deleted)
}

#[tauri::command]
fn get_system_info() -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "backend": "Tauri v2.0 + Rust",
        "database": "SQLite (rusqlite 0.31)",
        "os": std::env::consts::OS,
        "arch": std::env::consts::ARCH,
        "status": "Running smoothly"
    }))
}

fn main() {
    let conn = init_db().expect("Failed to initialize SQLite database");
    let db_state = DbState {
        conn: Mutex::new(conn),
    };

    tauri::Builder::default()
        .manage(db_state)
        .invoke_handler(tauri::generate_handler![
            get_all_reports,
            save_report,
            batch_import_reports,
            delete_report,
            delete_reports,
            get_system_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
