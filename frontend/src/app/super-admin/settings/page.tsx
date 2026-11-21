'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useSuperAdminTheme } from '@/context/SuperAdminThemeContext';
import {
  Save,
  CreditCard,
  Trash2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export default function SuperAdminSettingsPage() {
  const { isDark } = useSuperAdminTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [purging, setPurging] = useState(false);

  const [form, setForm] = useState({
    REGISTRATION_OPEN: 'true',
    REGISTRATION_FEE: '250000',
    PAYMENT_BANK_NAME: 'Bank Mandiri',
    PAYMENT_ACCOUNT_NUMBER: '137-00-1234567-8',
    PAYMENT_ACCOUNT_HOLDER: 'Yayasan Mulia Angkasa Akademi',
    HELP_DESK_PHONE: '081255401558',
    ANNOUNCEMENT_BANNER: '',
  });

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/super-admin/settings');
      if (res.data?.map) {
        setForm((prev) => ({
          ...prev,
          ...res.data.map,
          REGISTRATION_OPEN: 'true',
        }));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/super-admin/settings', {
        ...form,
        REGISTRATION_OPEN: 'true',
      });
      alert('Pengaturan global PMB berhasil disimpan!');
      fetchSettings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  const handlePurgeTrash = async () => {
    const confirmMsg =
      'PERINGATAN TINGKAT TINGGI:\n\nAnda akan MENGHAPUS SEMUA data pendaftar yang berada di tong sampah secara permanen dari database.\n\nTindakan ini tidak dapat dibatalkan. Lanjutkan?';
    if (!window.confirm(confirmMsg)) return;

    try {
      setPurging(true);
      const res = await api.post('/super-admin/maintenance/purge-trash');
      alert(res.data?.message || 'Keranjang sampah berhasil dibersihkan permanen!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal membersihkan sampah');
    } finally {
      setPurging(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl border transition-colors ${isDark
            ? 'bg-[#0f172a] border-slate-800 text-white shadow-2xl'
            : 'bg-white border-slate-200/80 text-[#0f172a] shadow-sm'
          }`}
      >
        <div>
          <h1
            className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5 ${isDark ? 'text-white' : 'text-[#0f172a]'
              }`}
          >
            <span>Pengaturan Kebijakan &amp; Sistem PMB</span>
          </h1>
          <p
            className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
          >
            Konfigurasi pusat: rekening resmi kampus, biaya formulir pendaftaran, dan pemeliharaan sistem PMB.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSettings}
          className={`w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${isDark
              ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-sky-400 hover:text-white'
              : 'bg-[#0f172a] border-[#0f172a] hover:bg-slate-800 text-white'
            }`}
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`}
          />
          <span>Muat Ulang</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: Rekening & Biaya Pendaftaran */}
        <div
          className={`border rounded-2xl p-6 transition-colors ${isDark
              ? 'bg-[#0f172a] border-slate-800'
              : 'bg-white border-slate-200/80 shadow-sm'
            }`}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <CreditCard className="w-5 h-5 text-emerald-500" />
            <h2
              className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#0f172a]'
                }`}
            >
              1. Rekening Resmi Pembayaran &amp; Biaya Formulir
            </h2>
          </div>
          <p
            className={`text-xs mb-5 ${isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
          >
            Informasi transfer bank resmi yang tampil di panduan pembayaran dashboard calon mahasiswa.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
              >
                Biaya Formulir Pendaftaran (IDR)
              </label>
              <div className="relative">
                <span
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                >
                  Rp
                </span>
                <input
                  type="number"
                  value={form.REGISTRATION_FEE}
                  onChange={(e) => setForm({ ...form, REGISTRATION_FEE: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 transition-colors ${isDark
                      ? 'bg-slate-950 border-slate-700 text-white focus:ring-sky-500'
                      : 'bg-slate-50 border-slate-300 text-[#0f172a] focus:ring-[#0f172a]'
                    }`}
                />
              </div>
            </div>

            <div>
              <label
                className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
              >
                Nama Bank Tujuan
              </label>
              <input
                type="text"
                placeholder="Contoh: Bank Mandiri / BCA"
                value={form.PAYMENT_BANK_NAME}
                onChange={(e) => setForm({ ...form, PAYMENT_BANK_NAME: e.target.value })}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 transition-colors ${isDark
                    ? 'bg-slate-950 border-slate-700 text-white focus:ring-sky-500'
                    : 'bg-slate-50 border-slate-300 text-[#0f172a] focus:ring-[#0f172a]'
                  }`}
              />
            </div>

            <div>
              <label
                className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
              >
                Nomor Rekening Kampus
              </label>
              <input
                type="text"
                placeholder="137-00-1234567-8"
                value={form.PAYMENT_ACCOUNT_NUMBER}
                onChange={(e) => setForm({ ...form, PAYMENT_ACCOUNT_NUMBER: e.target.value })}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 transition-colors ${isDark
                    ? 'bg-slate-950 border-slate-700 text-white focus:ring-sky-500'
                    : 'bg-slate-50 border-slate-300 text-[#0f172a] focus:ring-[#0f172a]'
                  }`}
              />
            </div>

            <div>
              <label
                className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
              >
                Atas Nama Rekening
              </label>
              <input
                type="text"
                placeholder="Mulia Angkasa Akademi"
                value={form.PAYMENT_ACCOUNT_HOLDER}
                onChange={(e) => setForm({ ...form, PAYMENT_ACCOUNT_HOLDER: e.target.value })}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 transition-colors ${isDark
                    ? 'bg-slate-950 border-slate-700 text-white focus:ring-sky-500'
                    : 'bg-slate-50 border-slate-300 text-[#0f172a] focus:ring-[#0f172a]'
                  }`}
              />
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className={`w-full sm:w-auto justify-center flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-xs shadow-lg active:scale-95 disabled:opacity-50 transition-all ${isDark
                ? 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/25'
                : 'bg-[#0f172a] hover:bg-slate-800 shadow-slate-900/20'
              }`}
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan Perubahan...' : 'Simpan Semua Pengaturan'}</span>
          </button>
        </div>
      </form>

      {/* SECTION 2: Pemeliharaan Darurat / Maintenance (Danger Zone) */}
      <div
        className={`border rounded-2xl p-4 sm:p-6 transition-colors ${isDark
            ? 'bg-[#0f172a] border-rose-500/30'
            : 'bg-white border-rose-300/80 shadow-sm'
          }`}
      >
        <div className="flex items-center gap-2.5 mb-2">
          <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
          <h2
            className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-rose-300' : 'text-rose-700 font-extrabold'
              }`}
          >
            Zona Pemeliharaan &amp; Data Cleanup
          </h2>
        </div>
        <p
          className={`text-xs mb-4 max-w-2xl leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
        >
          Tindakan ini menghapus data sampah pendaftar secara menyeluruh dari database dan media penyimpanan berkas.
        </p>

        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-colors ${isDark
              ? 'bg-slate-950/70 border-rose-500/20'
              : 'bg-rose-50/50 border-rose-200'
            }`}
        >
          <div>
            <div
              className={`text-xs font-bold ${isDark ? 'text-white' : 'text-[#0f172a]'
                }`}
            >
              Kosongkan Keranjang Sampah Sekaligus
            </div>
            <div
              className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
            >
              Hapus permanen semua pendaftar yang telah dimasukkan ke dalam tong sampah oleh admin.
            </div>
          </div>
          <button
            type="button"
            onClick={handlePurgeTrash}
            disabled={purging}
            className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 active:scale-95 disabled:opacity-50 whitespace-nowrap transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>{purging ? 'Membersihkan...' : 'Kosongkan Semua Sampah'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}