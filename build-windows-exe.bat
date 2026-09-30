@echo off
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
    echo [ERROR] Node.js belum terinstall!
    echo Silakan install Node.js (LTS) dari https://nodejs.org/
    pause
    exit /b 1
)

:: 2. Cek Rust / Cargo
where cargo >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Rust / Cargo belum terinstall!
    echo Silakan install Rust dari https://rustup.rs/
    echo Pastikan memilih opsi default (msvc toolchain) saat instalasi.
    pause
    exit /b 1
)

echo [1/4] Menginstall dependencies npm frontend...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Gagal npm install.
    pause
    exit /b 1
)

echo.
echo [2/4] Menginstall Tauri CLI (jika belum ada)...
call npm install -g @tauri-apps/cli >nul 2>nul

echo.
echo [3/4] Melakukan build frontend production...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Gagal build frontend.
    pause
    exit /b 1
)

echo.
echo [4/4] Mengompilasi backend Rust dan mem-bundle file .EXE & .MSI...
echo Proses ini membutuhkan waktu beberapa menit untuk mengunduh crates dan compile...
call cargo tauri build

if %errorlevel% equ 0 (
    color 0A
    echo.
    echo ==============================================================================
    echo    BERHASIL! File .EXE dan .MSI telah selesai dibuat!
    echo ==============================================================================
    echo File aplikasi berada di folder:
    echo  - src-tauri\target\release\pln-row-trimming-manager.exe
    echo  - src-tauri\target\release\bundle\msi\
    echo.
    explorer src-tauri\target\release\
) else (
    color 0C
    echo.
    echo [ERROR] Terjadi kesalahan saat kompilasi Tauri.
    echo Pastikan Microsoft C++ Build Tools sudah terpasang di sistem Windows.
)

pause
