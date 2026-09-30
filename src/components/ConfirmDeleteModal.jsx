import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, target }) {
  if (!isOpen || !target) return null;

  const isBatch = target.type === 'batch';
  const count = isBatch ? (target.ids?.length || 0) : 1;
  const singleItem = !isBatch ? target.item : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        {/* Header with Red Warning Icon */}
        <div className="p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
            <Trash2 className="w-6 h-6" />
          </div>

          <h3 className="text-base font-bold text-slate-900">
            {isBatch 
              ? `Hapus ${count} Work Order Terpilih?` 
              : `Hapus Work Order?`}
          </h3>

          <div className="text-xs text-slate-600 space-y-2">
            {isBatch ? (
              <p>
                Anda akan menghapus <strong className="text-slate-900 font-mono">{count}</strong> data Work Order yang dicentang. Data dan dokumentasi foto yang telah dihapus tidak dapat dipulihkan kembali.
              </p>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-left space-y-1 font-mono text-[11px]">
                <div><span className="text-slate-400">Nomor WO:</span> <strong className="text-slate-800">{singleItem?.nomor_wo}</strong></div>
                <div><span className="text-slate-400">Tanggal:</span> <span className="text-slate-700">{singleItem?.tanggal}</span></div>
                <div><span className="text-slate-400">Penyulang:</span> <span className="text-slate-700">{singleItem?.penyulang}</span></div>
                <div><span className="text-slate-400">Pohon:</span> <span className="text-slate-700">{singleItem?.pohon}</span></div>
              </div>
            )}

            <p className="text-[11px] text-red-600 font-medium">
              Tindakan ini akan menghapus data secara permanen dari database SQLite.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 p-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-3 text-xs font-medium text-slate-700 hover:bg-slate-200 bg-white border border-slate-200 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isBatch ? `Hapus (${count}) Data` : 'Hapus Sekarang'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
