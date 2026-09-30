/**
 * PLN Official Assets, Sample Documentation Photos, and Defaults
 */

// PLN Official Logo Vector (SVG Data URL)
export const PLN_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 200" width="160" height="200">
  <path d="M10,10 L150,10 C150,90 145,150 80,195 C15,150 10,90 10,10 Z" fill="%230B5C9C" stroke="%23FFD100" stroke-width="6"/>
  <!-- 3 Red Waves -->
  <path d="M35,60 Q80,45 125,60" fill="none" stroke="%23EE3124" stroke-width="6" stroke-linecap="round"/>
  <path d="M35,80 Q80,65 125,80" fill="none" stroke="%23EE3124" stroke-width="6" stroke-linecap="round"/>
  <path d="M35,100 Q80,85 125,100" fill="none" stroke="%23EE3124" stroke-width="6" stroke-linecap="round"/>
  <!-- Yellow Lightning Bolt -->
  <polygon points="85,30 52,105 76,105 60,165 110,88 86,88" fill="%23FFD100" stroke="%23FFFFFF" stroke-width="2"/>
</svg>`;

// Default Initial Settings
export const DEFAULT_CONFIG = {
  nama_holding: "PT PLN (PERSERO)",
  nama_uid: "DISTRIBUSI JAWA TENGAH & D.I.Y",
  nama_up3: "UP3 SEMARANG",
  nama_ulp: "ULP SEMARANG BARAT",
  alamat_ulp: "Jl. Jenderal Sudirman No. 128, Semarang - Telp: (024) 7601234",
  nama_manager: "BAMBANG HERMANTO, S.T.",
  nip_manager: "87122049ZY",
  nama_koordinator: "EKO SETIAWAN, A.Md.",
  nip_koordinator: "92151028ZY",
  nama_pengawas_k3: "HENDRA PRASETYO",
  nip_pengawas_k3: "95183011ZY",
  no_dokumen: "BA-ROW/PLN-SB/X/2024",
  standar_jarak_aman: "Minimal 3.0 Meter dari Penghantar 20 kV (SUTM)"
};

// High-fidelity SVG-generated inspection photos for demonstration and fallback
export const SAMPLE_PHOTOS = {
  sebelum: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
    <defs>
      <linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="%2387CEEB"/><stop offset="100%" stop-color="%23E0F2FE"/></linearGradient>
    </defs>
    <rect width="400" height="300" fill="url(%23sky1)"/>
    <!-- Ground -->
    <rect y="240" width="400" height="60" fill="%233F5E38"/>
    <!-- Power Line Pole & Wires -->
    <rect x="290" y="30" width="12" height="210" fill="%234A5568"/>
    <rect x="250" y="55" width="90" height="6" fill="%232D3748"/>
    <!-- SUTM 3 Wires -->
    <line x1="0" y1="52" x2="400" y2="52" stroke="%231A202C" stroke-width="3"/>
    <line x1="0" y1="58" x2="400" y2="58" stroke="%231A202C" stroke-width="3"/>
    <line x1="0" y1="64" x2="400" y2="64" stroke="%231A202C" stroke-width="3"/>
    <!-- Overgrown Tree touching wire -->
    <path d="M120,240 Q130,150 150,110 Q160,80 180,50 Q200,45 270,50" stroke="%235C4033" stroke-width="18" fill="none" stroke-linecap="round"/>
    <!-- Tree Foliage touching line -->
    <circle cx="160" cy="110" r="55" fill="%232D5A27"/>
    <circle cx="210" cy="80" r="60" fill="%231E4620"/>
    <circle cx="270" cy="55" r="40" fill="%23386631"/>
    <!-- Danger zone highlight -->
    <circle cx="275" cy="54" r="28" fill="none" stroke="%23DC2626" stroke-width="3" stroke-dasharray="4,4"/>
    <!-- Watermark Banner -->
    <rect x="10" y="250" width="380" height="40" rx="4" fill="%23000000" opacity="0.75"/>
    <text x="20" y="268" fill="%23FBBF24" font-size="11" font-weight="bold" font-family="sans-serif">KONDISI SEBELUM: RANTING &lt; 0.5M DARI SUTM 20kV</text>
    <text x="20" y="282" fill="%23FFFFFF" font-size="10" font-family="monospace">GPS: -7.00514, 110.43819 | 08:30 WIB</text>
  </svg>`,

  progres: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
    <defs>
      <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="%237DD3FC"/><stop offset="100%" stop-color="%23BAE6FD"/></linearGradient>
    </defs>
    <rect width="400" height="300" fill="url(%23sky2)"/>
    <rect y="240" width="400" height="60" fill="%233F5E38"/>
    <rect x="290" y="30" width="12" height="210" fill="%234A5568"/>
    <rect x="250" y="55" width="90" height="6" fill="%232D3748"/>
    <line x1="0" y1="52" x2="400" y2="52" stroke="%231A202C" stroke-width="3"/>
    <line x1="0" y1="58" x2="400" y2="58" stroke="%231A202C" stroke-width="3"/>
    <line x1="0" y1="64" x2="400" y2="64" stroke="%231A202C" stroke-width="3"/>
    <!-- Tree Trunk -->
    <path d="M120,240 Q130,150 150,110" stroke="%235C4033" stroke-width="18" fill="none" stroke-linecap="round"/>
    <circle cx="140" cy="130" r="50" fill="%232D5A27"/>
    <!-- Technician with Safety Helmet, Telescopic Stick Pruner -->
    <line x1="200" y1="240" x2="200" y2="170" stroke="%231E293B" stroke-width="6"/>
    <circle cx="200" cy="160" r="10" fill="%23F59E0B"/><!-- Helmet -->
    <!-- Telescopic Insulated Stick (Stik 20kV) cutting branch -->
    <line x1="200" y1="180" x2="255" y2="70" stroke="%23D97706" stroke-width="4"/>
    <path d="M250,70 L265,65" stroke="%2394A3B8" stroke-width="4"/><!-- Saw -->
    <!-- Falling cut branch -->
    <path d="M260,85 Q250,120 240,150" stroke="%235C4033" stroke-width="6" stroke-dasharray="3,3" fill="none"/>
    <!-- Watermark Banner -->
    <rect x="10" y="250" width="380" height="40" rx="4" fill="%23000000" opacity="0.75"/>
    <text x="20" y="268" fill="%23FBBF24" font-size="11" font-weight="bold" font-family="sans-serif">PROGRES: EKSEKUSI PEMANGKASAN &amp; APD K3 LENGKAP</text>
    <text x="20" y="282" fill="%23FFFFFF" font-size="10" font-family="monospace">TELESCOPIC STIK 20kV | 09:15 WIB</text>
  </svg>`,

  diameter: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
    <rect width="400" height="300" fill="%23262626"/>
    <!-- Tree Trunk Cross Section / Bark Close-up -->
    <rect x="40" y="40" width="320" height="190" rx="20" fill="%23452B1E" stroke="%2369402A" stroke-width="12"/>
    <!-- Tree Ring Texture -->
    <circle cx="200" cy="135" r="70" fill="none" stroke="%235C3A26" stroke-width="4"/>
    <circle cx="200" cy="135" r="45" fill="none" stroke="%2369402A" stroke-width="3"/>
    <circle cx="200" cy="135" r="20" fill="none" stroke="%237D4D33" stroke-width="2"/>
    <!-- Measuring Caliper / Meteran Pita -->
    <rect x="60" y="125" width="280" height="24" rx="3" fill="%23FACC15" stroke="%23000000" stroke-width="2"/>
    <!-- Meter scale ticks -->
    <line x1="70" y1="125" x2="70" y2="135" stroke="%23000" stroke-width="2"/>
    <line x1="110" y1="125" x2="110" y2="135" stroke="%23000" stroke-width="2"/>
    <line x1="150" y1="125" x2="150" y2="135" stroke="%23000" stroke-width="2"/>
    <line x1="200" y1="125" x2="200" y2="140" stroke="%23DC2626" stroke-width="3"/>
    <line x1="250" y1="125" x2="250" y2="135" stroke="%23000" stroke-width="2"/>
    <line x1="290" y1="125" x2="290" y2="135" stroke="%23000" stroke-width="2"/>
    <line x1="330" y1="125" x2="330" y2="135" stroke="%23000" stroke-width="2"/>
    <text x="175" y="120" fill="%23FEF08A" font-size="16" font-weight="bold" font-family="monospace">Ø 45 cm</text>
    <!-- Watermark Banner -->
    <rect x="10" y="250" width="380" height="40" rx="4" fill="%23000000" opacity="0.85"/>
    <text x="20" y="268" fill="%23FBBF24" font-size="11" font-weight="bold" font-family="sans-serif">PENGUKURAN DIAMETER BATANG / CABANG</text>
    <text x="20" y="282" fill="%23FFFFFF" font-size="10" font-family="monospace">HASIL UKUR: 45 CM | BATANG UTAMA | 09:40 WIB</text>
  </svg>`,

  sesudah: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
    <defs>
      <linearGradient id="sky3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="%2338BDF8"/><stop offset="100%" stop-color="%23BAE6FD"/></linearGradient>
    </defs>
    <rect width="400" height="300" fill="url(%23sky3)"/>
    <rect y="240" width="400" height="60" fill="%233F5E38"/>
    <!-- Power Line Pole & Wires -->
    <rect x="290" y="30" width="12" height="210" fill="%234A5568"/>
    <rect x="250" y="55" width="90" height="6" fill="%232D3748"/>
    <line x1="0" y1="52" x2="400" y2="52" stroke="%231A202C" stroke-width="3"/>
    <line x1="0" y1="58" x2="400" y2="58" stroke="%231A202C" stroke-width="3"/>
    <line x1="0" y1="64" x2="400" y2="64" stroke="%231A202C" stroke-width="3"/>
    <!-- Pruned Clean Tree -->
    <path d="M120,240 Q130,170 145,140" stroke="%235C4033" stroke-width="18" fill="none" stroke-linecap="round"/>
    <circle cx="145" cy="150" r="45" fill="%232D5A27"/>
    <!-- Safe Clearance Dimension Indicator -->
    <line x1="160" y1="110" x2="250" y2="65" stroke="%2316A34A" stroke-width="3" stroke-dasharray="4,4"/>
    <rect x="180" y="70" width="80" height="20" rx="3" fill="%2316A34A"/>
    <text x="186" y="84" fill="%23FFFFFF" font-size="10" font-weight="bold" font-family="sans-serif">JARAK 3.4M (AMAN)</text>
    <!-- Watermark Banner -->
    <rect x="10" y="250" width="380" height="40" rx="4" fill="%23000000" opacity="0.75"/>
    <text x="20" y="268" fill="%2322C55E" font-size="11" font-weight="bold" font-family="sans-serif">KONDISI SESUDAH: ROW BERSIH &amp; STANDAR K3 TERPENUHI</text>
    <text x="20" y="282" fill="%23FFFFFF" font-size="10" font-family="monospace">JARAK BEBAS: 3.4 METER | 10:15 WIB</text>
  </svg>`
};

// Initial PLN Seed Work Orders (Realistic field data)
export const INITIAL_WORK_ORDERS = [
  {
    id: 1,
    tanggal: "2024-10-01",
    nomor_wo: "WO/PLN-SB/ROW/20241001-01",
    unit: "ULP SEMARANG BARAT",
    penyulang: "PYL-CENDRAWASIH-02",
    petugas: "Regu Harjar A (Joko P. & Bambang S.)",
    pohon: "Pohon Trembesi (Pucuk mendekati kabel)",
    koordinat: "-6.992150, 110.384210",
    diameter: 45.0,
    jarak_sutm: 3.2,
    tindakan: "Pemangkasan Cabang Pucuk (Topping)",
    foto_sebelum: SAMPLE_PHOTOS.sebelum,
    foto_progres: SAMPLE_PHOTOS.progres,
    foto_diameter: SAMPLE_PHOTOS.diameter,
    foto_sesudah: SAMPLE_PHOTOS.sesudah,
    keterangan: "Pekerjaan selesai 100%. Jalur SUTM 20kV bebas gangguan ranting kering.",
    created_at: "2024-10-01 10:30:00"
  },
  {
    id: 2,
    tanggal: "2024-10-01",
    nomor_wo: "WO/PLN-SB/ROW/20241001-02",
    unit: "ULP SEMARANG BARAT",
    penyulang: "PYL-CENDRAWASIH-02",
    petugas: "Regu Harjar A (Joko P. & Bambang S.)",
    pohon: "Pohon Sengon (Miring ke arah tiang)",
    koordinat: "-6.994520, 110.388740",
    diameter: 38.0,
    jarak_sutm: 3.5,
    tindakan: "Penebangan Cabang Condong",
    foto_sebelum: SAMPLE_PHOTOS.sebelum,
    foto_progres: SAMPLE_PHOTOS.progres,
    foto_diameter: SAMPLE_PHOTOS.diameter,
    foto_sesudah: SAMPLE_PHOTOS.sesudah,
    keterangan: "Telah dikoordinasikan dengan pemilik lahan bapak Suhardi.",
    created_at: "2024-10-01 11:45:00"
  },
  {
    id: 3,
    tanggal: "2024-10-02",
    nomor_wo: "WO/PLN-SB/ROW/20241002-01",
    unit: "ULP SEMARANG BARAT",
    penyulang: "PYL-MERAK-04",
    petugas: "Regu Harjar B (Dedi K. & Agus W.)",
    pohon: "Pohon Mahoni",
    koordinat: "-7.001840, 110.401220",
    diameter: 52.0,
    jarak_sutm: 3.0,
    tindakan: "Pemangkasan Samping (Side Trimming)",
    foto_sebelum: SAMPLE_PHOTOS.sebelum,
    foto_progres: SAMPLE_PHOTOS.progres,
    foto_diameter: SAMPLE_PHOTOS.diameter,
    foto_sesudah: SAMPLE_PHOTOS.sesudah,
    keterangan: "Dekat gardu trafo SB-088. Manuver pengamanan jalur berhasil.",
    created_at: "2024-10-02 09:15:00"
  },
  {
    id: 4,
    tanggal: "2024-10-02",
    nomor_wo: "WO/PLN-SB/ROW/20241002-02",
    unit: "ULP SEMARANG BARAT",
    penyulang: "PYL-MERAK-04",
    petugas: "Regu Harjar B (Dedi K. & Agus W.)",
    pohon: "Rumpun Bambu Petung",
    koordinat: "-7.004110, 110.405600",
    diameter: 25.0,
    jarak_sutm: 4.0,
    tindakan: "Penebangan Rumpun Melengkung",
    foto_sebelum: SAMPLE_PHOTOS.sebelum,
    foto_progres: SAMPLE_PHOTOS.progres,
    foto_diameter: SAMPLE_PHOTOS.diameter,
    foto_sesudah: SAMPLE_PHOTOS.sesudah,
    keterangan: "Bambu sangat rawan lentur saat hujan lebat. Telah dibersihkan.",
    created_at: "2024-10-02 11:30:00"
  },
  {
    id: 5,
    tanggal: "2024-10-03",
    nomor_wo: "WO/PLN-SB/ROW/20241003-01",
    unit: "ULP SEMARANG BARAT",
    penyulang: "PYL-FLAMBOYAN-01",
    petugas: "Regu Harjar C (Suryo & Rudi)",
    pohon: "Pohon Kelapa",
    koordinat: "-7.012550, 110.419030",
    diameter: 32.0,
    jarak_sutm: 3.8,
    tindakan: "Pemangkasan Pelepah & Mayang",
    foto_sebelum: SAMPLE_PHOTOS.sebelum,
    foto_progres: SAMPLE_PHOTOS.progres,
    foto_diameter: SAMPLE_PHOTOS.diameter,
    foto_sesudah: SAMPLE_PHOTOS.sesudah,
    keterangan: "Pelepah kering yang berpotensi jatuh menimpa kawat sudah dibabat.",
    created_at: "2024-10-03 10:00:00"
  }
];
