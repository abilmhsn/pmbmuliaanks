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

  const handleActivatePeriod = async (id: string, name: string) => {
    if (!confirm(`Aktifkan ${name}? Statistik dashboard dan data pendaftar baru akan beralih khusus ke gelombang ini.`)) return;

    try {
      await api.put(`/pmb-periods/${id}/activate`).catch(() => api.put(`/pmb-periods/${id}`, { isActive: true }));
      alert(`${name} berhasil diaktifkan! Data dashboard kini khusus untuk gelombang ini.`);
      fetchMasterData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengubah gelombang aktif');
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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <h1 className="text-2xl font-extrabold text-white">Kelola Master Data & Informasi PMB</h1>
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
        <>
          {/* Grid Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* SECTION 1: PROGRAM STUDI */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Program Studi</h3>
                </div>
                <button
                  onClick={handleOpenCreateProgram}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Prodi
                </button>
              </div>

              <div className="space-y-4">
                {programs.map((prog) => (
                  <div key={prog.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 relative group">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-1 bg-amber-400/20 text-amber-400 font-mono text-xs font-bold rounded-md">
                        {prog.code}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 font-mono">
                          Quota: <span className="text-white font-bold">{prog.quota} Kuota</span>
                        </span>
                        <button
                          onClick={() => handleOpenEditProgram(prog)}
                          className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-all"
                          title="Edit Program Studi"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-sky-400" />
                        </button>
                      </div>
                    </div>
                    <h4 className="font-bold text-white text-base">{prog.name}</h4>
                    <p className="text-xs text-slate-400">{prog.description}</p>
                    <div className="pt-2 text-xs font-bold text-sky-400">
                      Biaya Kuliah: Rp {prog.tuitionFee?.toLocaleString('id-ID')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 2: PERIODE GELOMBANG PMB */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Calendar className="w-5 h-5 text-sky-400" />
                <h3 className="text-lg font-bold text-white">Periode Gelombang PMB (1 & 2)</h3>
              </div>

              <p className="text-xs text-slate-400">
                Pilih gelombang aktif. Data pendaftar, statistik dashboard, dan hasil export CSV akan terisolasi khusus sesuai gelombang yang diaktifkan.
              </p>

              <div className="space-y-4 pt-2">
                {periods.slice(0, 2).map((per) => (
                  <div key={per.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-white text-sm">{per.name}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">T.A {per.year || per.academicYear || '2026/2027'}</p>
                    </div>

                    <div>
                      {per.isActive ? (
                        <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold rounded-lg flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> AKTIF
                        </span>
                      ) : (
                        <button
                          onClick={() => handleActivatePeriod(per.id, per.name)}
                          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-all border border-slate-700"
                        >
                          Aktifkan Gelombang Ini
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 3: PENGUMUMAN DITERBITKAN */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Bell className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">Kelola Pengumuman PMB</h3>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Terbitkan Pengumuman Baru</h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 mb-1">Judul Pengumuman</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pengumuman Hasil Seleksi Administrasi Gelombang 1"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Tipe Badge</label>
                  <select
                    value={annType}
                    onChange={(e) => setAnnType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold"
                  >
                    <option value="INFO">INFO (Biru)</option>
                    <option value="URGENT">URGENT (Merah)</option>
                    <option value="SUCCESS">SUCCESS (Hijau)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Isi Pengumuman</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan pesan lengkap pengumuman di sini..."
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Terbitkan Pengumuman
                </button>
              </div>
            </form>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-400 text-xs">Daftar Pengumuman Aktif:</h4>
              {announcements.map((ann) => (
                <div key={ann.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-sm">{ann.title}</span>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${ann.type === 'URGENT'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : ann.type === 'SUCCESS'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          }`}
                      >
                        {ann.type}
                      </span>

                      <button
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg transition-all"
                        title="Hapus Pengumuman"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        </>
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