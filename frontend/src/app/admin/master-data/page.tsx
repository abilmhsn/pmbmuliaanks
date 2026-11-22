'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
  BookOpen,
  Calendar,
  Bell,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function AdminMasterDataPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form State untuk Program Studi
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [progCode, setProgCode] = useState('');
  const [progName, setProgName] = useState('');
  const [progDesc, setProgDesc] = useState('');
  const [progQuota, setProgQuota] = useState<number>(50);
  const [progFee, setProgFee] = useState<number>(0);

  // New Announcement Form State
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annType, setAnnType] = useState('INFO');

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      setLoading(true);
      const [resProg, resPer, resAnn] = await Promise.all([
        api.get('/study-programs/admin/all').catch(() => api.get('/study-programs')),
        api.get('/pmb-periods'),
        api.get('/announcements'),
      ]);
      setPrograms(Array.isArray(resProg.data) ? resProg.data : []);
      setPeriods(Array.isArray(resPer.data) ? resPer.data : []);
      setAnnouncements(Array.isArray(resAnn.data) ? resAnn.data : []);
    } catch (err) {
      console.error('Error fetching master data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateProgram = () => {
    setEditingProgramId(null);
    setProgCode('');
    setProgName('');
    setProgDesc('');
    setProgQuota(50);
    setProgFee(0);
    setIsProgramModalOpen(true);
  };

  const handleOpenEditProgram = (prog: any) => {
    setEditingProgramId(prog.id);
    setProgCode(prog.code || '');
    setProgName(prog.name || '');
    setProgDesc(prog.description || '');
    setProgQuota(prog.quota || 0);
    setProgFee(prog.tuitionFee || 0);
    setIsProgramModalOpen(true);
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        code: progCode,
        name: progName,
        description: progDesc,
        quota: Number(progQuota),
        tuitionFee: Number(progFee),
      };

      if (editingProgramId) {
        await api.put(`/study-programs/${editingProgramId}`, payload);
        alert('Program studi berhasil diperbarui!');
      } else {
        await api.post('/study-programs', payload);
        alert('Program studi baru berhasil ditambahkan!');
      }

      setIsProgramModalOpen(false);
      fetchMasterData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan program studi');
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/announcements', {
        title: annTitle,
        content: annContent,
        type: annType,
      });
      alert('Pengumuman berhasil diterbitkan!');
      setAnnTitle('');
      setAnnContent('');
      fetchMasterData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menerbitkan pengumuman');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      alert('Pengumuman berhasil dihapus!');
      fetchMasterData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus pengumuman');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-800">
        <h1 className="text-xl sm:text-2xl font-extrabold text-white">Kelola Master Data & Informasi PMB</h1>
        <p className="text-xs text-slate-400 mt-1">
          Pengaturan Program Studi, Status Gelombang PMB (1 & 2), dan Pengumuman Pengguna.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh] bg-slate-900/50 rounded-2xl border border-slate-800">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 font-medium">Memuat master data...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* KOLOM KIRI: PROGRAM STUDI */}
          <div className="bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-amber-400 shrink-0" />
                <h3 className="text-base font-bold text-white">Program Studi</h3>
              </div>
              <button
                onClick={handleOpenCreateProgram}
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Prodi
              </button>
            </div>

            <div className="space-y-4">
              {programs.map((prog) => {
                // Kalkulasi Kuota Dinamis
                const filled = prog.filledCount ?? 0;
                const remaining = prog.remainingQuota ?? Math.max(0, (prog.quota || 0) - filled);

                return (
                  <div key={prog.id} className="p-4 sm:p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                    {/* Baris Atas: Kode Prodi & Tombol Edit */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 bg-amber-400/15 text-amber-400 border border-amber-400/20 font-mono text-xs font-bold rounded-lg">
                        {prog.code}
                      </span>
                      <button
                        onClick={() => handleOpenEditProgram(prog)}
                        className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg transition-all"
                        title="Edit Program Studi"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-sky-400" />
                      </button>
                    </div>

                    {/* Nama & Deskripsi Prodi */}
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-white text-base leading-snug">{prog.name}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{prog.description}</p>
                    </div>

                    {/* Indikator Kuota 3 Kolom Rapih */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 text-center font-mono">
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase">Sisa</span>
                        <strong className="text-xs text-emerald-400">{remaining}</strong>
                      </div>
                      <div className="border-x border-slate-800">
                        <span className="block text-[10px] text-slate-400 uppercase">Terisi</span>
                        <strong className="text-xs text-amber-400">{filled}</strong>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase">Total</span>
                        <strong className="text-xs text-white">{prog.quota}</strong>
                      </div>
                    </div>

                    {/* Footer Biaya Kuliah */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Biaya Kuliah</span>
                      <span className="font-bold text-sky-400 font-mono">
                        Rp {prog.tuitionFee?.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* KOLOM KANAN: PERIODE GELOMBANG & KELOLA PENGUMUMAN */}
          <div className="space-y-6">
            {/* SECTION 2: PERIODE GELOMBANG PMB */}
            <div className="bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-sky-400 shrink-0" />
                  <h3 className="text-base font-bold text-white">Status Gelombang PMB</h3>
                </div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1 font-mono">
                  <Lock className="w-3 h-3 text-amber-400" /> Kelola via Super Admin
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Informasi periode &amp; gelombang PMB saat ini. Pengaturan jadwal dan aktivasi gelombang dikelola secara terpusat oleh Super Admin.
              </p>

              <div className="space-y-3 pt-1">
                {periods.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">Belum ada gelombang terdaftar.</p>
                ) : (
                  periods.slice(0, 5).map((per) => (
                    <div
                      key={per.id}
                      className={`p-4 bg-slate-950 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                        per.isActive ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-slate-800'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">{per.name}</h4>
                          <span className="text-xs text-amber-400 font-mono font-semibold">T.A {per.year || per.academicYear}</span>
                        </div>
                        {per.startDate && per.endDate && (
                          <p className="text-[11px] text-slate-400">
                            {new Date(per.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} &ndash; {new Date(per.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0">
                        {per.isActive ? (
                          <span className="w-full sm:w-auto justify-center px-3.5 py-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> AKTIF
                          </span>
                        ) : (
                          <span className="w-full sm:w-auto justify-center px-3 py-1.5 bg-slate-800/80 text-slate-400 border border-slate-700/60 text-xs font-semibold rounded-xl flex items-center">
                            Non-Aktif
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* SECTION 3: PENGUMUMAN DITERBITKAN (MINIMALIS) */}
            <div className="bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <Bell className="w-5 h-5 text-amber-400 shrink-0" />
                  <h3 className="text-base font-bold text-white">Kelola Pengumuman PMB</h3>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {announcements.length} Aktif
                </span>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      required
                      placeholder="Judul pengumuman..."
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-amber-400/50 focus:outline-none rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <select
                      value={annType}
                      onChange={(e) => setAnnType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-amber-400/50 focus:outline-none rounded-lg text-xs text-amber-400 font-bold"
                    >
                      <option value="INFO">INFO</option>
                    </select>
                  </div>
                </div>

                <div>
                  <textarea
                    rows={2}
                    required
                    placeholder="Isi pesan singkat pengumuman..."
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-amber-400/50 focus:outline-none rounded-lg text-xs text-white resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="w-full sm:w-auto justify-center px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Terbitkan
                  </button>
                </div>
              </form>

              {announcements.length > 0 && (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {announcements.map((ann) => (
                    <div key={ann.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/90 flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold shrink-0 ${ann.type === 'URGENT'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : ann.type === 'SUCCESS'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                              }`}
                          >
                            {ann.type}
                          </span>
                          <span className="font-bold text-white text-xs truncate">{ann.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{ann.content}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition-all shrink-0"
                        title="Hapus Pengumuman"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT / TAMBAH PROGRAM STUDI */}
      {isProgramModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingProgramId ? 'Edit Program Studi' : 'Tambah Program Studi Baru'}
              </h3>
              <button
                onClick={() => setIsProgramModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProgram} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Kode Prodi</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: ALC, AVSEC"
                  value={progCode}
                  onChange={(e) => setProgCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Nama Program Studi</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Air Lines Crew"
                  value={progName}
                  onChange={(e) => setProgName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Kuota Kursi</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={progQuota}
                    onChange={(e) => setProgQuota(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Biaya Kuliah (Rp)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={progFee}
                    onChange={(e) => setProgFee(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  placeholder="Tuliskan deskripsi singkat program studi..."
                  value={progDesc}
                  onChange={(e) => setProgDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProgramModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1"
                >
                  <Save className="w-4 h-4" /> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}