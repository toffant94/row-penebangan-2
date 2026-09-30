import React, { useState } from 'react';
import { Settings, Save, RotateCcw, X, Building, UserCheck } from 'lucide-react';
import { DEFAULT_CONFIG } from '../utils/assets.js';

export default function SettingsModal({ isOpen, onClose, config, onSaveConfig }) {
  const [formData, setFormData] = useState(config || DEFAULT_CONFIG);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData(DEFAULT_CONFIG);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveConfig(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pengaturan Kop Dokumen &amp; Pejabat Penandatangan
              </h3>
              <p className="text-xs text-slate-500">
                Data ini akan tercetak otomatis pada lembar Berita Acara Perabasan ROW resmi
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Unit PLN Identity */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b pb-1.5">
              <Building className="w-4 h-4 text-cyan-600" />
              <span>Identitas Unit Kerja PLN</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Nama Holding / Korporasi</label>
                <input
                  type="text"
                  name="nama_holding"
                  value={formData.nama_holding}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Unit Induk Distribusi / Wilayah (UID/UIW)</label>
                <input
                  type="text"
                  name="nama_uid"
                  value={formData.nama_uid}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Unit Pelaksana (UP3)</label>
                <input
                  type="text"
                  name="nama_up3"
                  value={formData.nama_up3}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Unit Layanan Pelanggan (ULP)</label>
                <input
                  type="text"
                  name="nama_ulp"
                  value={formData.nama_ulp}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-cyan-500 font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-medium text-slate-700 block mb-1">Alamat Kantor ULP &amp; Kontak</label>
                <input
                  type="text"
                  name="alamat_ulp"
                  value={formData.alamat_ulp}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Pejabat Penandatangan */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b pb-1.5">
              <UserCheck className="w-4 h-4 text-cyan-600" />
              <span>Pejabat Penandatangan Resmi</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Nama Manager ULP</label>
                <input
                  type="text"
                  name="nama_manager"
                  value={formData.nama_manager}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">NIP Manager ULP</label>
                <input
                  type="text"
                  name="nip_manager"
                  value={formData.nip_manager}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Nama Koordinator ULP / Spv. Teknik</label>
                <input
                  type="text"
                  name="nama_koordinator"
                  value={formData.nama_koordinator}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">NIP Koordinator ULP</label>
                <input
                  type="text"
                  name="nip_koordinator"
                  value={formData.nip_koordinator}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-medium text-slate-700 block mb-1">Format Nomor Dokumen Formulir</label>
                <input
                  type="text"
                  name="no_dokumen"
                  value={formData.no_dokumen}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
