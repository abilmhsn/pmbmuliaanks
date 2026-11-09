'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useSuperAdminTheme } from '@/context/SuperAdminThemeContext';
import {
  Settings,
  Save,
  CreditCard,
  Phone,
  Megaphone,
  Power,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Building2,
  DollarSign,
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

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/super-admin/settings');
      if (res.data?.map) {
        setForm((prev) => ({
          ...prev,
          ...res.data.map,
        }));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/super-admin/settings', form);
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
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl border shadow-xl transition-colors ${isDark
          ? 'bg-slate-900 border-slate-800 text-white'
          : 'bg-white border-slate-200/80 text-slate-900 shadow-sm'
          }`}
      >
        <div>
          <h1
            className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5 ${isDark ? 'text-white' : 'text-slate-900'
              }`}
          >
            <span>Pengaturan Kebijakan & Sistem PMB</span>
          </h1>
          <p
            className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
          >
            Konfigurasi pusat: aktivasi registrasi publik, rekening resmi kampus, biaya formulir,
            dan nomor layanan bantuan.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          className={`w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${isDark
            ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white'
            : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
            }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-500' : ''}`} />
          <span>Muat Ulang</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: Status Pendaftaran PMB */}
        <div
          className={`border rounded-2xl p-6 transition-colors ${isDark
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-slate-200/80 shadow-sm'
            }`}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <Power className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2
              className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'
                }`}
            >
              1. Kontrol Akses Pendaftaran Calon Mahasiswa
            </h2>
          </div>
          <p
            className={`text-xs mb-5 ${isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
          >
            Saklar utama untuk membuka atau menutup proses registrasi akun baru pada situs PMB Mulia Angkasa.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setForm({ ...form, REGISTRATION_OPEN: 'true' })}
              className={`p-4 rounded-2xl border text-left transition-all ${form.REGISTRATION_OPEN === 'true'
                ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                : isDark
                  ? 'bg-slate-950 border-slate-800 opacity-60 hover:opacity-100 text-slate-400'
                  : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-100 text-slate-600'
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pendaftaran Dibuka (ONLINE)</span>
                </span>
                {form.REGISTRATION_OPEN === 'true' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                )}
              </div>
              <p
                className={`text-[11px] mt-2 ${isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
              >
                Halaman register terbuka untuk umum. Calon mahasiswa baru dapat mendaftar dan mengisi formulir.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setForm({ ...form, REGISTRATION_OPEN: 'false' })}
              className={`p-4 rounded-2xl border text-left transition-all ${form.REGISTRATION_OPEN === 'false'
                ? 'bg-rose-500/10 border-rose-500/50 shadow-lg shadow-rose-500/10'
                : isDark
                  ? 'bg-slate-950 border-slate-800 opacity-60 hover:opacity-100 text-slate-400'
                  : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-100 text-slate-600'
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <Power className="w-4 h-4" />
                  <span>Pendaftaran Ditutup (OFFLINE)</span>
                </span>
                {form.REGISTRATION_OPEN === 'false' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                )}
              </div>
              <p
                className={`text-[11px] mt-2 ${isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
              >
                Pendaftaran baru ditutup sementara. Hanya peserta yang sudah memiliki akun yang dapat masuk.
              </p>
            </button>
          </div>
        </div>

        {/* SECTION 2: Rekening & Biaya Pendaftaran */}
        <div
          className={`border rounded-2xl p-6 transition-colors ${isDark
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-slate-200/80 shadow-sm'
            }`}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2
              className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'
                }`}
            >
              2. Rekening Resmi Pembayaran & Biaya Formulir
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
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500 transition-colors ${isDark
                    ? 'bg-slate-950 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
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
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition-colors ${isDark
                  ? 'bg-slate-950 border-slate-700 text-white'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
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
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-emerald-500 transition-colors ${isDark
                  ? 'bg-slate-950 border-slate-700 text-white'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
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
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition-colors ${isDark
                  ? 'bg-slate-950 border-slate-700 text-white'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Komunikasi & Helpdesk */}
        <div
          className={`border rounded-2xl p-6 transition-colors ${isDark
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-slate-200/80 shadow-sm'
            }`}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <Phone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2
              className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'
                }`}
            >
              3. Layanan Bantuan & Pengumuman Khusus
            </h2>
          </div>
          <p
            className={`text-xs mb-5 ${isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
          >
            Kontak helpdesk resmi dan teks pengumuman penting untuk pendaftar.
          </p>

          <div className="space-y-4">
            <div>
              <label
                className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
              >
                Nomor WhatsApp Helpdesk Resmi PMB
              </label>
              <input
                type="text"
                placeholder="081255401558"
                value={form.HELP_DESK_PHONE}
                onChange={(e) => setForm({ ...form, HELP_DESK_PHONE: e.target.value })}
                className={`w-full max-w-md px-3.5 py-2.5 border rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-500 transition-colors ${isDark
                  ? 'bg-slate-950 border-slate-700 text-white'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
              />
              <span
                className={`block text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'
                  }`}
              >
                Nomor ini digunakan pada tombol &quot;Hubungi Panitia via WhatsApp&quot; di seluruh portal.
              </span>
            </div>

            <div>
              <label
                className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
              >
                Teks Banner Pengumuman Berjalan (Announcement)
              </label>
              <textarea
                rows={2}
                placeholder="Pendaftaran Gelombang 1 akan ditutup pada akhir bulan ini..."
                value={form.ANNOUNCEMENT_BANNER}
                onChange={(e) => setForm({ ...form, ANNOUNCEMENT_BANNER: e.target.value })}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-colors ${isDark
                  ? 'bg-slate-950 border-slate-700 text-white'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
              />
              <span
                className={`block text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'
                  }`}
              >
                Biarkan kosong jika tidak ingin menampilkan banner pengumuman atas.
              </span>
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto justify-center flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 active:scale-95 disabled:opacity-50 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan Perubahan...' : 'Simpan Semua Pengaturan'}</span>
          </button>
        </div>
      </form>

      {/* SECTION 4: Pemeliharaan Darurat / Maintenance (Danger Zone) */}
      <div
        className={`border rounded-2xl p-4 sm:p-6 transition-colors ${isDark
          ? 'bg-slate-900 border-rose-500/30'
          : 'bg-white border-rose-300/80 shadow-sm'
          }`}
      >
        <div className="flex items-center gap-2.5 mb-2">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
          <h2
            className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-rose-300' : 'text-rose-700 font-extrabold'
              }`}
          >
            Zona Pemeliharaan & Data Cleanup
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
            ? 'bg-slate-900/80 border-rose-500/20'
            : 'bg-rose-50/50 border-rose-200'
            }`}
        >
          <div>
            <div
              className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'
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