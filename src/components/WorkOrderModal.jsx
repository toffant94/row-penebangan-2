import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Save, 
  MapPin, 
  Camera, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  Image as ImageIcon,
  Sparkles,
  Navigation
} from 'lucide-react';
import { SAMPLE_PHOTOS } from '../utils/assets.js';

export default function WorkOrderModal({ isOpen, onClose, onSave, editingReport, config }) {
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    nomor_wo: '',
    unit: config?.nama_ulp || 'ULP SEMARANG BARAT',
    penyulang: 'PYL-CENDRAWASIH-02',
    petugas: 'Regu Harjar (Pengawas ROW)',
    pohon: 'Pohon Trembesi',
    koordinat: '-6.992150, 110.384210',
    diameter: 45,
    jarak_sutm: 3.2,
    tindakan: 'Pemangkasan Cabang Pucuk (Topping)',
    keterangan: 'Pekerjaan selesai, jalur SUTM 20kV aman.',
    foto_sebelum: '',
    foto_progres: '',
    foto_diameter: '',
    foto_sesudah: ''
  });

  const [gettingLocation, setGettingLocation] = useState(false);

  // File input refs for 4 photos
  const fileSebelumRef = useRef(null);
  const fileProgresRef = useRef(null);
  const fileDiameterRef = useRef(null);
  const fileSesudahRef = useRef(null);

  useEffect(() => {
    if (editingReport) {
      setFormData({
        ...editingReport,
        unit: editingReport.unit || config?.nama_ulp || 'ULP SEMARANG BARAT',
      });
    } else {
      // Auto-generate fresh WO number
      const datePart = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const randomSeq = Math.floor(100 + Math.random() * 900);
      setFormData({
        tanggal: new Date().toISOString().split('T')[0],
        nomor_wo: `WO/PLN-SB/ROW/${datePart}-${randomSeq}`,
        unit: config?.nama_ulp || 'ULP SEMARANG BARAT',
        penyulang: 'PYL-CENDRAWASIH-02',
        petugas: 'Regu Harjar Lapangan',
        pohon: 'Pohon Trembesi',
        koordinat: '-6.992150, 110.384210',
        diameter: 40,
        jarak_sutm: 3.5,
        tindakan: 'Pemangkasan Cabang Pucuk (Topping)',
        keterangan: 'Pekerjaan perabasan telah dilaksanakan sesuai SOP K3.',
        foto_sebelum: '',
        foto_progres: '',
        foto_diameter: '',
        foto_sesudah: ''
      });
    }
  }, [editingReport, config, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'diameter' || name === 'jarak_sutm') ? Number(value) : value
    }));
  };

  // Convert uploaded image to Base64 data URL
  const handlePhotoUpload = (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({
        ...prev,
        [field]: event.target?.result
      }));
    };
    reader.readAsDataURL(file);
  };

  // Remove photo
  const handleRemovePhoto = (field) => {
    setFormData(prev => ({ ...prev, [field]: '' }));
  };

  // Quick fill demo photos
  const handleFillDemoPhotos = () => {
    setFormData(prev => ({
      ...prev,
      foto_sebelum: SAMPLE_PHOTOS.sebelum,
      foto_progres: SAMPLE_PHOTOS.progres,
      foto_diameter: SAMPLE_PHOTOS.diameter,
      foto_sesudah: SAMPLE_PHOTOS.sesudah
    }));
  };

  // Grab device GPS coordinates
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolokasi tidak didukung pada browser ini');
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
        setFormData(prev => ({ ...prev, koordinat: coords }));
        setGettingLocation(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setGettingLocation(false);
      },
      { timeout: 8000 }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {editingReport ? 'Edit & Verifikasi Work Order' : 'Tambah Work Order Pemeliharaan ROW'}
            </h3>
            <p className="text-xs text-slate-500">
              Isi data teknis lapangan dan lampirkan 4 foto dokumentasi resmi
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Data Identitas Pekerjaan */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <span>1. Data Teknis Pekerjaan &amp; Lokasi</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Tanggal Pelaksanaan *</label>
                <input
                  type="date"
                  name="tanggal"
                  required
                  value={formData.tanggal}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Nomor Work Order (WO) *</label>
                <input
                  type="text"
                  name="nomor_wo"
                  required
                  value={formData.nomor_wo}
                  onChange={handleChange}
                  placeholder="WO/PLN/ROW/2024/..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Unit Layanan (ULP) *</label>
                <input
                  type="text"
                  name="unit"
                  required
                  value={formData.unit}
                  onChange={handleChange}
                  placeholder="ULP Semarang Barat"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Penyulang (Feeder 20 kV) *</label>
                <input
                  type="text"
                  name="penyulang"
                  required
                  value={formData.penyulang}
                  onChange={handleChange}
                  placeholder="PYL-CENDRAWASIH-02"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Regu / Petugas Pelaksana *</label>
                <input
                  type="text"
                  name="petugas"
                  required
                  value={formData.petugas}
                  onChange={handleChange}
                  placeholder="Regu Harjar (Joko & Bambang)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Jenis Pohon / Vegetasi *</label>
                <input
                  type="text"
                  name="pohon"
                  required
                  value={formData.pohon}
                  onChange={handleChange}
                  placeholder="Pohon Trembesi / Sengon / Mahoni"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              {/* Coordinates with GPS Auto Fetch */}
              <div className="sm:col-span-2">
                <label className="font-medium text-slate-700 block mb-1">Titik Koordinat GPS (Latitude, Longitude) *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="koordinat"
                    required
                    value={formData.koordinat}
                    onChange={handleChange}
                    placeholder="-6.992150, 110.384210"
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={gettingLocation}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 text-cyan-600" />
                    <span>{gettingLocation ? 'Mencari...' : 'Ambil GPS'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Diameter Batang (cm) *</label>
                <input
                  type="number"
                  step="0.5"
                  name="diameter"
                  required
                  value={formData.diameter}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Jarak Aman ROW Bebas (Meter)</label>
                <input
                  type="number"
                  step="0.1"
                  name="jarak_sutm"
                  value={formData.jarak_sutm || 3.0}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Tindakan Eksekusi</label>
                <select
                  name="tindakan"
                  value={formData.tindakan}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                >
                  <option value="Pemangkasan Cabang Pucuk (Topping)">Pemangkasan Cabang Pucuk (Topping)</option>
                  <option value="Penebangan Cabang Condong">Penebangan Cabang Condong</option>
                  <option value="Pemangkasan Samping (Side Trimming)">Pemangkasan Samping (Side Trimming)</option>
                  <option value="Penebangan Total / Habis">Penebangan Total / Habis</option>
                  <option value="Pembersihan Rumpun Bambu">Pembersihan Rumpun Bambu</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="font-medium text-slate-700 block mb-1">Catatan / Keterangan Lapangan</label>
                <input
                  type="text"
                  name="keterangan"
                  value={formData.keterangan || ''}
                  onChange={handleChange}
                  placeholder="Catatan persetujuan pemilik pohon atau kondisi lapangan..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Slot 4 Foto Dokumentasi */}
          <div className="border-t border-slate-200 pt-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <span>2. Dokumentasi 4 Foto Resmi (K3 ROW)</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Wajib melampirkan 4 sudut foto sesuai standar audit PLN
                </p>
              </div>
              <button
                type="button"
                onClick={handleFillDemoPhotos}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-md border border-cyan-200 transition-colors"
                title="Gunakan 4 foto sampel ilustrasi teknis pemangkasan"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                <span>Gunakan Foto Contoh</span>
              </button>
            </div>

            {/* Grid 4 Photo Slots */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Photo 1: Sebelum */}
              <PhotoUploadBox
                label="1. KONDISI SEBELUM"
                description="Ranting dekat kawat 20kV"
                imageSrc={formData.foto_sebelum}
                inputRef={fileSebelumRef}
                onUpload={(e) => handlePhotoUpload(e, 'foto_sebelum')}
                onRemove={() => handleRemovePhoto('foto_sebelum')}
              />

              {/* Photo 2: Progres */}
              <PhotoUploadBox
                label="2. PROGRES PENGERJAAN"
                description="APD K3 & Eksekusi Pangkas"
                imageSrc={formData.foto_progres}
                inputRef={fileProgresRef}
                onUpload={(e) => handlePhotoUpload(e, 'foto_progres')}
                onRemove={() => handleRemovePhoto('foto_progres')}
              />

              {/* Photo 3: Diameter */}
              <PhotoUploadBox
                label="3. PENGUKURAN DIAMETER"
                description="Meteran pada batang/cabang"
                imageSrc={formData.foto_diameter}
                inputRef={fileDiameterRef}
                onUpload={(e) => handlePhotoUpload(e, 'foto_diameter')}
                onRemove={() => handleRemovePhoto('foto_diameter')}
              />

              {/* Photo 4: Sesudah */}
              <PhotoUploadBox
                label="4. KONDISI SESUDAH"
                description="Jalur ROW bersih &gt; 3.0m"
                imageSrc={formData.foto_sesudah}
                inputRef={fileSesudahRef}
                onUpload={(e) => handlePhotoUpload(e, 'foto_sesudah')}
                onRemove={() => handleRemovePhoto('foto_sesudah')}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Simpan ke Database</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PhotoUploadBox({ label, description, imageSrc, inputRef, onUpload, onRemove }) {
  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex flex-col items-center text-center relative group">
      <div className="text-[11px] font-bold text-slate-800 mb-0.5">{label}</div>
      <div className="text-[10px] text-slate-500 mb-2 leading-tight">{description}</div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onUpload}
        className="hidden"
      />

      <div className="w-full aspect-4/3 bg-white rounded-lg border border-slate-200 overflow-hidden relative flex items-center justify-center">
        {imageSrc ? (
          <>
            <img
              src={imageSrc}
              alt={label}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={onRemove}
              className="absolute top-1.5 right-1.5 p-1 bg-red-600/90 hover:bg-red-700 text-white rounded shadow-sm opacity-90 hover:opacity-100 transition-opacity"
              title="Hapus Foto"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <div
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center p-3 cursor-pointer hover:bg-slate-50 w-full h-full text-slate-400 hover:text-cyan-600 transition-colors"
          >
            <Camera className="w-6 h-6 mb-1 text-slate-300" />
            <span className="text-[11px] font-medium text-slate-600">Klik Upload Foto</span>
            <span className="text-[9px] text-slate-400">JPG / PNG</span>
          </div>
        )}
      </div>

      {imageSrc && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-2 text-[10px] text-cyan-700 hover:text-cyan-800 font-medium underline"
        >
          Ganti Foto
        </button>
      )}
    </div>
  );
}
