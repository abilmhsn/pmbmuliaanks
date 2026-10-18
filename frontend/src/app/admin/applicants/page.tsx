'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
  Search,
  Filter,
  Eye,
  Trash2,
  RotateCcw,
  Check,
  X,
  FileSpreadsheet,
} from 'lucide-react';

export default function AdminApplicantsPage() {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab State: 'ACTIVE' (Data Utama) atau 'TRASH' (Data Sampah)
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'TRASH'>('ACTIVE');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [programFilter, setProgramFilter] = useState('');

  // Selected Detail Modal State
  const [selectedApplicant, setSelectedApplicant] = useState<any | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [statusInput, setStatusInput] = useState('');
  const [notesInput, setNotesInput] = useState('');

  useEffect(() => {
    if (activeTab === 'ACTIVE') {
      fetchApplicants();
    } else {
      fetchTrashApplicants();
    }
    fetchPrograms();
  }, [search, statusFilter, programFilter, activeTab]);

  const fetchPrograms = async () => {
    try {
      const res = await api.get('/study-programs');
      setPrograms(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/applicants', {
        params: {
          search: search || undefined,
          status: statusFilter || undefined,
          studyProgramId: programFilter || undefined,
        },
      });
      setApplicants(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrashApplicants = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/applicants/trash');
      setApplicants(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  // --- FUNGSI SOFT DELETE (Pindah ke Trash) ---
  const handleSoftDelete = async (id: string, name: string) => {
    if (window.confirm(`Pindahkan "${name}" ke Trash?`)) {
      try {
        await api.delete(`/admin/applicants/${id}`);
        fetchApplicants(); // Memperbarui tabel aktif agar data langsung hilang dari layar
      } catch (err: any) {
        alert('Gagal menghapus data');
      }
    }
  };

  // --- FUNGSI HAPUS PERMANEN DARI TRASH (BARU) ---
  const handlePermanentDelete = async (id: string, name: string) => {
    if (window.confirm(`HAPUS PERMANEN "${name}"? Data tidak dapat dikembalikan lagi!`)) {
      try {
        await api.delete(`/admin/applicants/${id}/permanent`);
        fetchTrashApplicants(); // Memperbarui tabel trash agar data terhapus permanen hilang dari list
      } catch (err: any) {
        alert('Gagal menghapus permanen');
      }
    }
  };

  // --- FUNGSI RESTORE (Pulihkan dari Trash) ---
  const handleRestore = async (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin memulihkan data "${name}" dari Sampah?`)) {
      try {
        await api.put(`/admin/applicants/${id}/restore`);
        alert('Data berhasil dipulihkan!');
        fetchTrashApplicants();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Gagal memulihkan data');
      }
    }
  };

  const handleOpenDetail = async (id: string) => {
    try {
      setModalLoading(true);
      const res = await api.get(`/admin/applicants/${id}`);
      setSelectedApplicant(res.data);
      const reg = res.data.registrations?.[0];
      if (reg) {
        setStatusInput(reg.status);
        setNotesInput(reg.notes || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    const reg = selectedApplicant?.registrations?.[0];
    if (!reg) {
      alert('Mahasiswa ini belum memilih Program Studi (Step 3). Status pendaftaran belum dapat diubah.');
      return;
    }

    try {
      await api.put(`/admin/registration-status/${reg.id}`, {
        status: statusInput,
        notes: notesInput,
      });
      alert('Status pendaftaran berhasil diperbarui!');
      handleOpenDetail(selectedApplicant.id);
      fetchApplicants();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memperbarui status');
    }
  };

  const handleVerifyDocument = async (docId: string, isVerified: boolean) => {
    try {
      await api.put(`/admin/verify-document/${docId}`, { isVerified });
      handleOpenDetail(selectedApplicant.id);
      fetchApplicants();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal merubah verifikasi dokumen');
    }
  };

  const handleVerifyPayment = async (paymentId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await api.put(`/admin/verify-payment/${paymentId}`, { status });
      handleOpenDetail(selectedApplicant.id);
      fetchApplicants();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal merubah verifikasi pembayaran');
    }
  };

  const handleExportCsv = async () => {
    try {
      const token = localStorage.getItem('pmb_token');
      const response = await fetch('http://localhost:5000/api/admin/export-csv', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        alert('Sesi Anda telah habis, silakan login ulang.');
        return;
      }

      if (!response.ok) {
        throw new Error('Gagal mendownload data CSV.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Data_Pendaftar_PMB_${Date.now()}.csv`;
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Kelola & Verifikasi Calon Mahasiswa</h1>
          <p className="text-xs text-slate-400 mt-1">Daftar seluruh calon mahasiswa pendaftar PMB Kampus Mulia Angkasa.</p>
        </div>
        <button
          onClick={handleExportCsv}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition-all"
        >
          <FileSpreadsheet className="w-4 h-4" /> Export (.CSV)
        </button>
      </div>

      {/* Tab Switcher & Filter Bar */}
      <div className="space-y-4">
        {/* TAB SWITCHER */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'ACTIVE'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
          >
            Data Pendaftar Aktif
          </button>
          <button
            onClick={() => setActiveTab('TRASH')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'TRASH'
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
          >
            <Trash2 className="w-3.5 h-3.5" /> Data Sampah (Trash)
          </button>
        </div>


        {/* Filter Bar (Hanya Tampil di Tab Aktif) */}
        {activeTab === 'ACTIVE' && (
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                onChange={(e) => setStatusFilter(e.target.value)}
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
                onChange={(e) => setProgramFilter(e.target.value)}
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

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
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
                      <td className="p-4 font-mono font-bold text-amber-400">{app.registrationNumber}</td>
                      <td className="p-4 font-bold text-white">
                        {app.fullName}
                        <span className="block text-[10px] text-slate-400 font-normal">{app.user?.email}</span>
                      </td>
                      <td className="p-4 text-slate-300">{app.phone}</td>
                      <td className="p-4 text-slate-300">{app.educationData?.schoolName || '-'}</td>
                      <td className="p-4 font-semibold text-sky-400">
                        {reg?.studyProgram?.name || 'Belum Memilih'}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase ${reg?.status === 'DITERIMA' || reg?.status === 'LULUS_SELEKSI'
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
                        <div className="flex items-center justify-center gap-2">
                          {activeTab === 'ACTIVE' ? (
                            <>
                              <button
                                onClick={() => handleOpenDetail(app.id)}
                                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg flex items-center justify-center gap-1 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" /> Detail
                              </button>
                              <button
                                onClick={() => handleSoftDelete(app.id, app.fullName)}
                                className="px-3 py-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 font-bold rounded-lg flex items-center justify-center gap-1 transition-colors"
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
                      ? 'Tidak ditemukan data pendaftar yang sesuai filter.'
                      : 'Tidak ada data sampah di Trash.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL (Tetap Sama) */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-xs font-mono text-amber-400 font-bold">{selectedApplicant.registrationNumber}</span>
                <h3 className="text-xl font-bold text-white">{selectedApplicant.fullName}</h3>
              </div>
              <button
                onClick={() => setSelectedApplicant(null)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
              {/* STATUS UPDATER SECTION */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-amber-400 text-sm">Ubah Status Pendaftaran & Catatan Admin</h4>
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
                    <label className="block text-slate-400 mb-1">Catatan Tambahan untuk Mahasiswa</label>
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
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl"
                >
                  Simpan Perubahan Status
                </button>
              </div>

              {/* DATA SUMMARY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-sky-400 text-xs uppercase border-b border-slate-800 pb-2">
                    Data Pribadi
                  </h4>
                  <p><span className="text-slate-500">NIK:</span> {selectedApplicant.personalData?.nik || '-'}</p>
                  <p><span className="text-slate-500">TTL:</span> {selectedApplicant.personalData?.birthPlace || '-'}, {selectedApplicant.personalData?.birthDate ? new Date(selectedApplicant.personalData.birthDate).toLocaleDateString('id-ID') : '-'}</p>
                  <p><span className="text-slate-500">Gender:</span> {selectedApplicant.personalData?.gender || '-'}</p>
                  <p><span className="text-slate-500">Alamat:</span> {selectedApplicant.personalData?.address || '-'}, {selectedApplicant.personalData?.city || '-'}</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-sky-400 text-xs uppercase border-b border-slate-800 pb-2">
                    Data Pendidikan
                  </h4>
                  <p><span className="text-slate-500">Sekolah:</span> {selectedApplicant.educationData?.schoolName || '-'}</p>
                  <p><span className="text-slate-500">NPSN:</span> {selectedApplicant.educationData?.npsn || '-'}</p>
                  <p><span className="text-slate-500">Jurusan:</span> {selectedApplicant.educationData?.major || '-'}</p>
                  <p><span className="text-slate-500">Tahun Lulus:</span> {selectedApplicant.educationData?.graduationYear || '-'}</p>
                </div>
              </div>

              {/* VERIFIKASI DOKUMEN */}
              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs uppercase border-b border-slate-800 pb-2">
                  Dokumen Terunggah
                </h4>
                <div className="border border-slate-800 rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 font-bold">
                      <tr>
                        <th className="p-3">Tipe Dokumen</th>
                        <th className="p-3">Nama File</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Verifikasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {selectedApplicant.documents && selectedApplicant.documents.length > 0 ? (
                        selectedApplicant.documents.map((doc: any) => (
                          <tr key={doc.id}>
                            <td className="p-3 font-bold text-white">{doc.type}</td>
                            <td className="p-3">
                              <a
                                href={`http://localhost:5000${doc.fileUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sky-400 hover:underline"
                              >
                                {doc.fileName}
                              </a>
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
                                  Batalkan Verifikasi
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleVerifyDocument(doc.id, true)}
                                  className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 font-bold"
                                >
                                  Verifikasi Berkas
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

              {/* VERIFIKASI PEMBAYARAN */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h4 className="font-bold text-white text-xs uppercase border-b border-slate-800 pb-2">
                  Bukti Pembayaran / Transfer
                </h4>
                <div className="border border-slate-800 rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 font-bold">
                      <tr>
                        <th className="p-3">Tipe Pembayaran</th>
                        <th className="p-3">Nominal</th>
                        <th className="p-3">Bukti File</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Verifikasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {selectedApplicant.registrations?.[0]?.payments && selectedApplicant.registrations[0].payments.length > 0 ? (
                        selectedApplicant.registrations[0].payments.map((pay: any) => (
                          <tr key={pay.id}>
                            <td className="p-3 font-bold text-white">{pay.paymentType || 'Biaya Pendaftaran'}</td>
                            <td className="p-3 font-mono text-amber-400">Rp {pay.amount?.toLocaleString('id-ID')}</td>
                            <td className="p-3">
                              <a
                                href={`http://localhost:5000${pay.proofUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sky-400 hover:underline font-semibold"
                              >
                                Lihat Bukti Transfer
                              </a>
                            </td>
                            <td className="p-3">
                              {pay.status === 'VERIFIED' ? (
                                <span className="text-emerald-400 font-bold flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" /> Terverifikasi
                                </span>
                              ) : (
                                <span className="text-amber-400 font-bold">Menunggu Verifikasi</span>
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
                            Belum ada bukti pembayaran yang diunggah oleh mahasiswa.
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
    </div>
  );
}