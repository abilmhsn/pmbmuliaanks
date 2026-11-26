'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
  Search,
  Eye,
  Trash2,
  RotateCcw,
  Check,
  X,
  FileSpreadsheet,
  Calendar,
} from 'lucide-react';

// URL Public Storage Supabase dengan Nama Bucket: pmb-documents
const SUPABASE_STORAGE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL ||
  'https://apuvscjcdkpoevuacnzm.supabase.co/storage/v1/object/public/pmb-documents';

// Helper fungsi untuk mengubah path relatif ("documents/xxx.png" / "payments/xxx.png") jadi HTTPS Link Aktif
const getFileUrl = (path?: string) => {
  if (!path || path === '-' || path.trim() === '') return '#';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${SUPABASE_STORAGE_URL}/${path.replace(/^\//, '')}`;
};

export default function AdminApplicantsPage() {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'TRASH'>('ACTIVE');

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');

  const [selectedApplicant, setSelectedApplicant] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusInput, setStatusInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [previewFile, setPreviewFile] = useState<{ title: string; url: string } | null>(null);

  // Debounce search input (400ms) untuk mencegah request berlebihan saat mengetik
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchPeriods = async () => {
    try {
      const res = await api.get('/pmb-periods');
      const periodList = Array.isArray(res.data) ? res.data : [];
      setPeriods(periodList);
      const activePer = periodList.find((p: any) => p.isActive);
      if (activePer) {
        setPeriodFilter(activePer.id);
      }
    } catch (err) {
      console.error('Error fetching periods:', err);
    }
  };

  const fetchPrograms = async () => {
    try {
      const res = await api.get('/study-programs');
      setPrograms(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Gelombang & Prodi saat pertama kali mount
  useEffect(() => {
    fetchPeriods();
    fetchPrograms();
  }, []);

  // Fetch Applicants dengan AbortController
  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'ACTIVE') {
          const res = await api.get('/admin/applicants', {
            params: {
              search: debouncedSearch || undefined,
              status: statusFilter || undefined,
              studyProgramId: programFilter || undefined,
              periodId: periodFilter || undefined,
              page: currentPage,
              limit: 25,
            },
            signal: controller.signal,
          });
          if (Array.isArray(res.data)) {
            setApplicants(res.data);
            setTotalCount(res.data.length);
            setTotalPages(1);
          } else {
            setApplicants(res.data?.data || []);
            setTotalCount(res.data?.total || 0);
            setTotalPages(res.data?.totalPages || 1);
          }
        } else {
          const res = await api.get('/admin/applicants/trash', {
            signal: controller.signal,
          });
          const trashData = Array.isArray(res.data) ? res.data : res.data?.data || [];
          setApplicants(trashData);
          setTotalCount(trashData.length);
          setTotalPages(1);
        }
      } catch (err: any) {
        if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      controller.abort();
    };
  }, [debouncedSearch, statusFilter, programFilter, periodFilter, activeTab, currentPage]);

  const reloadCurrentData = async () => {
    try {
      if (activeTab === 'ACTIVE') {
        const res = await api.get('/admin/applicants', {
          params: {
            search: debouncedSearch || undefined,
            status: statusFilter || undefined,
            studyProgramId: programFilter || undefined,
            periodId: periodFilter || undefined,
            page: currentPage,
            limit: 25,
          },
        });
        if (Array.isArray(res.data)) {
          setApplicants(res.data);
          setTotalCount(res.data.length);
          setTotalPages(1);
        } else {
          setApplicants(res.data?.data || []);
          setTotalCount(res.data?.total || 0);
          setTotalPages(res.data?.totalPages || 1);
        }
      } else {
        const res = await api.get('/admin/applicants/trash');
        const trashData = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setApplicants(trashData);
        setTotalCount(trashData.length);
        setTotalPages(1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSoftDelete = async (id: string, name: string) => {
    if (window.confirm(`Pindahkan "${name}" ke Trash?`)) {
      try {
        await api.delete(`/admin/applicants/${id}`);
        reloadCurrentData();
      } catch {
        alert('Gagal menghapus data');
      }
    }
  };

  const handlePermanentDelete = async (id: string, name: string) => {
    if (window.confirm(`HAPUS PERMANEN "${name}"? Data tidak dapat dikembalikan lagi!`)) {
      try {
        await api.delete(`/admin/applicants/${id}/permanent`);
        reloadCurrentData();
      } catch {
        alert('Gagal menghapus permanen');
      }
    }
  };

  const handleRestore = async (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin memulihkan data "${name}" dari Sampah?`)) {
      try {
        await api.put(`/admin/applicants/${id}/restore`);
        alert('Data berhasil dipulihkan!');
        reloadCurrentData();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Gagal memulihkan data');
      }
    }
  };

  const handleOpenDetail = async (app: any) => {
    // Langsung buka modal memakai data awal dari baris tabel agar tidak terasa lambat
    setSelectedApplicant(app);
    const initialReg = app.registrations?.[0];
    setStatusInput(initialReg?.status || 'BELUM_LENGKAP');
    setNotesInput(initialReg?.notes || '');

    setDetailLoading(true);
    try {
      const res = await api.get(`/admin/applicants/${app.id}`);
      setSelectedApplicant(res.data);
      const reg = res.data.registrations?.[0];
      if (reg) {
        setStatusInput(reg.status);
        setNotesInput(reg.notes || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    const reg = selectedApplicant?.registrations?.[0];
    if (!reg) {
      alert('Mahasiswa ini belum memilih Program Studi. Status pendaftaran belum dapat diubah.');
      return;
    }

    try {
      await api.put(`/admin/registration-status/${reg.id}`, {
        status: statusInput,
        notes: notesInput,
      });
      alert('Status pendaftaran berhasil diperbarui!');
      setSelectedApplicant((prev: any) => {
        if (!prev?.registrations?.[0]) return prev;
        const updatedRegs = [...prev.registrations];
        updatedRegs[0] = { ...updatedRegs[0], status: statusInput, notes: notesInput };
        return { ...prev, registrations: updatedRegs };
      });
      reloadCurrentData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memperbarui status');
    }
  };

  const handleVerifyDocument = async (docId: string, isVerified: boolean) => {
    try {
      await api.put(`/admin/verify-document/${docId}`, { isVerified });
      setSelectedApplicant((prev: any) => {
        if (!prev?.documents) return prev;
        return {
          ...prev,
          documents: prev.documents.map((doc: any) =>
            doc.id === docId ? { ...doc, isVerified } : doc
          ),
        };
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal merubah verifikasi dokumen');
    }
  };

  const handleVerifyPayment = async (paymentId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await api.put(`/admin/verify-payment/${paymentId}`, { status });
      setSelectedApplicant((prev: any) => {
        if (!prev?.registrations?.[0]?.payments) return prev;
        const updatedRegs = [...prev.registrations];
        updatedRegs[0] = {
          ...updatedRegs[0],
          payments: updatedRegs[0].payments.map((pay: any) =>
            pay.id === paymentId ? { ...pay, status } : pay
          ),
        };
        return { ...prev, registrations: updatedRegs };
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal merubah verifikasi pembayaran');
    }
  };

  // Export CSV menggunakan instance Axios api agar sesuai Base URL backend & token auth
  const handleExportCsv = async () => {
    try {
      const urlQuery = periodFilter ? `?periodId=${periodFilter}` : '';
      const response = await api.get(`/admin/export-csv${urlQuery}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Data_Pendaftar_PMB_Gelombang_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error export:', error);
      alert('Terjadi kesalahan saat mengexport data.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-0">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-lg">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            Kelola &amp; Verifikasi Calon Mahasiswa
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Daftar seluruh calon mahasiswa pendaftar PMB Kampus Mulia Angkasa.
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2 transition-all"
        >
          <FileSpreadsheet className="w-4 h-4" /> Export Sesuai Gelombang (.CSV)
        </button>
      </div>

      {/* Tab Switcher & Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            <button
              onClick={() => {
                setActiveTab('ACTIVE');
                setCurrentPage(1);
              }}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'ACTIVE'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
            >
              Data Pendaftar Aktif
            </button>
            <button
              onClick={() => {
                setActiveTab('TRASH');
                setCurrentPage(1);
              }}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'TRASH'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
            >
              <Trash2 className="w-3.5 h-3.5" /> Data Sampah (Trash)
            </button>
          </div>

          {activeTab === 'ACTIVE' && (
            <div className="flex items-center justify-between sm:justify-start gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="text-xs font-bold text-slate-300">Gelombang:</span>
              </div>
              <select
                value={periodFilter}
                onChange={(e) => {
                  setPeriodFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-950 text-amber-400 font-bold px-3 py-1.5 rounded-lg border border-slate-700 text-xs focus:outline-none focus:border-amber-400 w-full sm:w-auto"
              >
                <option value="">Semua Gelombang</option>
                {periods.map((p) => {
                  const yearLabel = p.year || p.academicYear;
                  return (
                    <option key={p.id} value={p.id}>
                      {yearLabel ? `T.A ${yearLabel} - ` : ''}
                      {p.name} {p.isActive ? '(AKTIF)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>

        {activeTab === 'ACTIVE' && (
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari nama, NIK, no. reg, HP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-400"
              >
                <option value="">Semua Status Pendaftaran</option>
                <option value="BELUM_LENGKAP">Belum Lengkap</option>
                <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</option>
                <option value="DIVERIFIKASI">Diverifikasi</option>
                <option value="LULUS_SELEKSI">Lulus Seleksi</option>
                <option value="DAFTAR_ULANG">Daftar Ulang</option>
                <option value="DITERIMA">Diterima</option>
                <option value="DITOLAK">Ditolak</option>
              </select>
            </div>

            <div>
              <select
                value={programFilter}
                onChange={(e) => {
                  setProgramFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-400"
              >
                <option value="">Semua Program Studi</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 min-w-[700px]">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">No. Reg</th>
                <th className="p-4">Nama Lengkap</th>
                <th className="p-4">Kontak</th>
                <th className="p-4">Asal Sekolah</th>
                <th className="p-4">Pilihan Prodi</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Memuat data pendaftar...
                  </td>
                </tr>
              ) : applicants.length > 0 ? (
                applicants.map((app) => {
                  const reg = app.registrations?.[0];
                  return (
                    <tr key={app.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-amber-400">
                        {app.registrationNumber}
                      </td>
                      <td className="p-4 font-bold text-white">
                        {app.fullName}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {app.user?.email}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300">{app.phone}</td>
                      <td className="p-4 text-slate-300">
                        {app.educationData?.schoolName || '-'}
                      </td>
                      <td className="p-4 font-semibold text-sky-400">
                        {reg?.studyProgram?.name || '-'}
                        {reg?.period && (
                          <span className="block text-[10px] text-amber-400/90 font-mono font-normal">
                            T.A {reg.period.year} - {reg.period.name}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase whitespace-nowrap ${reg?.status === 'DITERIMA' || reg?.status === 'LULUS_SELEKSI'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : reg?.status === 'DIVERIFIKASI'
                                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                : reg?.status === 'MENUNGGU_VERIFIKASI'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-slate-800 text-slate-400'
                            }`}
                        >
                          {reg?.status || 'BELUM_LENGKAP'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {activeTab === 'ACTIVE' ? (
                            <>
                              <button
                                onClick={() => handleOpenDetail(app)}
                                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg flex items-center justify-center gap-1 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" /> Detail
                              </button>
                              <button
                                onClick={() => handleSoftDelete(app.id, app.fullName)}
                                className="p-1.5 sm:px-3 sm:py-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 font-bold rounded-lg flex items-center justify-center gap-1 transition-colors"
                                title="Hapus ke Trash"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleRestore(app.id, app.fullName)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1 transition-colors"
                              >
                                <RotateCcw className="w-3.5 h-3.5" /> Pulihkan
                              </button>
                              <button
                                onClick={() => handlePermanentDelete(app.id, app.fullName)}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg flex items-center gap-1 transition-colors"
                                title="Hapus Permanen"
                              >
                                <X className="w-3.5 h-3.5" /> Hapus
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    {activeTab === 'ACTIVE'
                      ? 'Tidak ditemukan data pendaftar untuk gelombang ini.'
                      : 'Tidak ada data sampah di Trash.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Info Bar */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-400">
          <div>
            Total data: <span className="font-bold text-white">{totalCount}</span> pendaftar
            {totalPages > 1 && (
              <span>
                {' '}
                &bull; Halaman <span className="font-bold text-white">{currentPage}</span> dari{' '}
                <span className="font-bold text-white">{totalPages}</span>
              </span>
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || loading}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition-colors"
              >
                &larr; Sebelumnya
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || loading}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition-colors"
              >
                Selanjutnya &rarr;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-6 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-amber-400 font-bold">
                    {selectedApplicant.registrationNumber}
                  </span>
                  {selectedApplicant.registrations?.[0]?.period && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-sky-400 border border-slate-700">
                      T.A {selectedApplicant.registrations[0].period.year} &bull;{' '}
                      {selectedApplicant.registrations[0].period.name}
                    </span>
                  )}
                  {detailLoading && (
                    <span className="text-[10px] text-slate-400 animate-pulse">
                      Memuat berkas...
                    </span>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {selectedApplicant.fullName}
                </h3>
              </div>
              <button
                onClick={() => {
                  setPreviewFile(null);
                  setSelectedApplicant(null);
                }}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-amber-400 text-sm">
                  Ubah Status Pendaftaran &amp; Catatan Admin
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1">Status Pendaftaran</label>
                    <select
                      value={statusInput}
                      onChange={(e) => setStatusInput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                    >
                      <option value="BELUM_LENGKAP">BELUM LENGKAP</option>
                      <option value="MENUNGGU_VERIFIKASI">MENUNGGU VERIFIKASI</option>
                      <option value="DIVERIFIKASI">DIVERIFIKASI</option>
                      <option value="LULUS_SELEKSI">LULUS SELEKSI</option>
                      <option value="DAFTAR_ULANG">DAFTAR ULANG</option>
                      <option value="DITERIMA">DITERIMA</option>
                      <option value="DITOLAK">DITOLAK</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">
                      Catatan Tambahan untuk Mahasiswa
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Berkas verified, ikuti tes wawancara..."
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>
                <button
                  onClick={handleUpdateStatus}
                  className="w-full sm:w-auto px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl"
                >
                  Simpan Perubahan Status
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-sky-400 text-xs uppercase border-b border-slate-800 pb-2">
                    Data Pribadi
                  </h4>
                  <p>
                    <span className="text-slate-500">NIK:</span>{' '}
                    {selectedApplicant.personalData?.nik || '-'}
                  </p>
                  <p>
                    <span className="text-slate-500">TTL:</span>{' '}
                    {selectedApplicant.personalData?.birthPlace || '-'}
                  </p>
                  <p>
                    <span className="text-slate-500">Gender:</span>{' '}
                    {selectedApplicant.personalData?.gender || '-'}
                  </p>
                  <p>
                    <span className="text-slate-500">Alamat:</span>{' '}
                    {selectedApplicant.personalData?.address || '-'}
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-sky-400 text-xs uppercase border-b border-slate-800 pb-2">
                    Data Pendidikan
                  </h4>
                  <p>
                    <span className="text-slate-500">Sekolah:</span>{' '}
                    {selectedApplicant.educationData?.schoolName || '-'}
                  </p>
                  <p>
                    <span className="text-slate-500">NPSN:</span>{' '}
                    {selectedApplicant.educationData?.npsn || '-'}
                  </p>
                  <p>
                    <span className="text-slate-500">Jurusan:</span>{' '}
                    {selectedApplicant.educationData?.major || '-'}
                  </p>
                  <p>
                    <span className="text-slate-500">Tahun Lulus:</span>{' '}
                    {selectedApplicant.educationData?.graduationYear || '-'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs uppercase border-b border-slate-800 pb-2">
                  Dokumen Terunggah
                </h4>
                <div className="border border-slate-800 rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[500px]">
                    <thead className="bg-slate-950 text-slate-400 font-bold">
                      <tr>
                        <th className="p-3">Tipe Dokumen</th>
                        <th className="p-3">Nama File</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Verifikasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {detailLoading && !selectedApplicant.documents ? (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-slate-500">
                            Memuat daftar dokumen...
                          </td>
                        </tr>
                      ) : selectedApplicant.documents && selectedApplicant.documents.length > 0 ? (
                        selectedApplicant.documents.map((doc: any) => (
                          <tr key={doc.id}>
                            <td className="p-3 font-bold text-white">{doc.type}</td>
                            <td className="p-3">
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewFile({
                                    title: `Dokumen ${doc.type} - ${doc.fileName}`,
                                    url: getFileUrl(doc.fileUrl),
                                  })
                                }
                                className="text-sky-400 hover:underline truncate block max-w-[150px] text-left cursor-pointer"
                              >
                                {doc.fileName}
                              </button>
                            </td>
                            <td className="p-3">
                              {doc.isVerified ? (
                                <span className="text-emerald-400 font-bold flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" /> Verified
                                </span>
                              ) : (
                                <span className="text-amber-400 font-bold">Pending</span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              {doc.isVerified ? (
                                <button
                                  onClick={() => handleVerifyDocument(doc.id, false)}
                                  className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg hover:bg-rose-500/30"
                                >
                                  Batalkan
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleVerifyDocument(doc.id, true)}
                                  className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 font-bold"
                                >
                                  Verifikasi
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-slate-500">
                            Belum ada dokumen yang diunggah.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h4 className="font-bold text-white text-xs uppercase border-b border-slate-800 pb-2">
                  Bukti Pembayaran / Transfer
                </h4>
                <div className="border border-slate-800 rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[600px]">
                    <thead className="bg-slate-950 text-slate-400 font-bold">
                      <tr>
                        <th className="p-3">Tipe</th>
                        <th className="p-3">Nominal</th>
                        <th className="p-3">Bukti File</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Verifikasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {detailLoading && !selectedApplicant.registrations?.[0]?.payments ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-500">
                            Memuat data pembayaran...
                          </td>
                        </tr>
                      ) : selectedApplicant.registrations?.[0]?.payments &&
                        selectedApplicant.registrations[0].payments.length > 0 ? (
                        selectedApplicant.registrations[0].payments.map((pay: any) => (
                          <tr key={pay.id}>
                            <td className="p-3 font-bold text-white">
                              {pay.paymentType || 'Pendaftaran'}
                            </td>
                            <td className="p-3 font-mono text-amber-400">
                              Rp {pay.amount?.toLocaleString('id-ID')}
                            </td>
                            <td className="p-3">
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewFile({
                                    title: `Bukti Pembayaran (${pay.paymentType || 'Pendaftaran'}) - Rp ${pay.amount?.toLocaleString('id-ID')}`,
                                    url: getFileUrl(pay.proofUrl),
                                  })
                                }
                                className="text-sky-400 hover:underline font-semibold cursor-pointer"
                              >
                                Lihat Bukti
                              </button>
                            </td>
                            <td className="p-3">
                              {pay.status === 'VERIFIED' ? (
                                <span className="text-emerald-400 font-bold flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" /> Terverifikasi
                                </span>
                              ) : (
                                <span className="text-amber-400 font-bold">Menunggu</span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              {pay.status === 'VERIFIED' ? (
                                <button
                                  onClick={() => handleVerifyPayment(pay.id, 'REJECTED')}
                                  className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg hover:bg-rose-500/30"
                                >
                                  Batalkan
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleVerifyPayment(pay.id, 'VERIFIED')}
                                  className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 font-bold"
                                >
                                  Verifikasi Bayar
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-500">
                            Belum ada bukti pembayaran yang diunggah.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POP-UP PREVIEW DOKUMEN & BUKTI TRANSFER */}
      {previewFile && (
        <div
          onClick={() => setPreviewFile(null)}
          className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                {previewFile.title}
              </h4>
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-950/60 flex items-center justify-center max-h-[80vh] overflow-auto">
              {previewFile.url.toLowerCase().split('?')[0].endsWith('.pdf') ? (
                <iframe
                  src={previewFile.url}
                  title={previewFile.title}
                  className="w-full h-[75vh] rounded-xl bg-white"
                />
              ) : (
                <img
                  src={previewFile.url}
                  alt={previewFile.title}
                  className="max-h-[75vh] max-w-full object-contain rounded-xl"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}