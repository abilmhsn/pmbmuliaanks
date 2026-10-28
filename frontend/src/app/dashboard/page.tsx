'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import {
  User,
  GraduationCap,
  Award,
  Upload,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ChevronRight,
  Sparkles,
  Printer,
  Bell,
  Info,
  CreditCardCheck,
} from 'lucide-react';
import Link from 'next/link';



export default function StudentDashboard() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'personal' | 'education' | 'program' | 'documents' | 'payment'>('personal');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [programs, setPrograms] = useState<any[]>([]);
  const [isReuploading, setIsReuploading] = useState(false);

  // State untuk menampung pengumuman dari backend
  const [announcements, setAnnouncements] = useState<any[]>([]);



  // Form States
  const [personalForm, setPersonalForm] = useState({
    nik: '',
    birthPlace: '',
    birthDate: '',
    gender: 'Laki-laki',
    address: '',
    city: '',
    province: '',
  });

  const [educationForm, setEducationForm] = useState({
    schoolName: '',
    npsn: '',
    major: 'IPA',
    graduationYear: 2027,
  });

  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('250000');
  const [selectedDocType, setSelectedDocType] = useState('FOTO');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);



  useEffect(() => {
    fetchPrograms();
    fetchAnnouncements();


    // Panggil refreshUser agar data status terbaru dari database langsung ditarik saat halaman dibuka
    if (refreshUser) {
      refreshUser();
    }
  }, []);

  // Tab aktif otomatis digeser ke tengah agar tidak terpotong di layar HP
  useEffect(() => {
    const el = document.getElementById(`tab-${activeTab}`);
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeTab]);

  useEffect(() => {
    if (user?.applicant) {
      const p = user.applicant.personalData;
      if (p) {
        setPersonalForm({
          nik: p.nik || '',
          birthPlace: p.birthPlace || '',
          birthDate: p.birthDate ? new Date(p.birthDate).toISOString().split('T')[0] : '',
          gender: p.gender || 'Laki-laki',
          address: p.address || '',
          city: p.city || '',
          province: p.province || '',
        });
      }

      const e = user.applicant.educationData;
      if (e) {
        setEducationForm({
          schoolName: e.schoolName || '',
          npsn: e.npsn || '',
          major: e.major || 'IPA',
          graduationYear: e.graduationYear || 2027,
        });
      }

      const reg = user.applicant.registrations?.[0];
      if (reg) {
        setSelectedProgramId(reg.studyProgramId || '');
      }
    }
  }, [user]);

  const fetchPrograms = async () => {
    try {
      const res = await api.get('/study-programs');
      setPrograms(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fungsi mengambil pengumuman publik dari backend
  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data);
    } catch (err) {
      console.error('Gagal memuat pengumuman:', err);
    }
  };

  const currentRegistration = user?.applicant?.registrations?.[0];
  const currentStatus = currentRegistration?.status || 'BELUM_LENGKAP';

  const statusSteps = [
    { key: 'BELUM_LENGKAP', label: 'Belum Lengkap' },
    { key: 'MENUNGGU_VERIFIKASI', label: 'Menunggu Verifikasi' },
    { key: 'DIVERIFIKASI', label: 'Diverifikasi' },
    { key: 'LULUS_SELEKSI', label: 'Lulus Seleksi' },
    { key: 'DAFTAR_ULANG', label: 'Daftar Ulang' },
    { key: 'DITERIMA', label: 'Diterima' },
  ];

  const getStatusIndex = (st: string) => {
    const idx = statusSteps.findIndex((s) => s.key === st);
    return idx >= 0 ? idx : 0;
  };

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      await api.post('/applicants/personal-data', personalForm);
      await refreshUser();
      setMessage({ type: 'success', text: 'Data pribadi berhasil disimpan!' });
      setActiveTab('education');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal menyimpan data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      await api.post('/applicants/education-data', educationForm);
      await refreshUser();
      setMessage({ type: 'success', text: 'Data pendidikan berhasil disimpan!' });
      setActiveTab('program');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal menyimpan data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgramId) {
      setMessage({ type: 'error', text: 'Pilih salah satu Program Studi' });
      return;
    }
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      await api.post('/applicants/program-selection', { studyProgramId: selectedProgramId });
      await refreshUser();
      setMessage({ type: 'success', text: 'Pilihan Program Studi berhasil disimpan!' });
      setActiveTab('documents');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal menyimpan pilihan prodi.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile) {
      setMessage({ type: 'error', text: 'Pilih file dokumen yang akan diunggah' });
      return;
    }
    const formData = new FormData();
    formData.append('file', docFile);
    formData.append('type', selectedDocType);

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await refreshUser();
      setMessage({ type: 'success', text: `Dokumen ${selectedDocType} berhasil diunggah!` });
      setDocFile(null);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal mengunggah dokumen.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentFile) {
      setMessage({ type: 'error', text: 'Pilih file bukti pembayaran' });
      return;
    }
    const formData = new FormData();
    formData.append('proof', paymentFile);
    formData.append('amount', paymentAmount);
    formData.append('paymentType', 'Biaya Pendaftaran PMB');

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      await api.post('/payments/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await refreshUser();
      setMessage({ type: 'success', text: 'Bukti pembayaran berhasil diunggah! Menunggu verifikasi admin.' });
      setPaymentFile(null);
      setIsReuploading(false); // Reset mode re-upload setelah sukses
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal mengunggah pembayaran.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto w-full min-w-0">

      {/* SECTION PENGUMUMAN / NOTIFIKASI COMPACT */}
      {announcements.length > 0 && (
        <div className="bg-slate-900  border-amber-500 rounded-2xl p-4 shadow-lg space-y-3">
          {/* Header Ringkas */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-white font-bold text-xs tracking-wider">
              <Bell className="w-4 h-4 animate-pulse" />
              <span>PENGUMUMAN PANITIA PMB</span>
            </div>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold">
              {announcements.length} Informasi
            </span>
          </div>

          {/* List Pengumuman Ringkas & Scrollable jika banyak */}
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
            {announcements.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 hover:bg-slate-950 p-3 rounded-xl border border-slate-800/80 transition-all space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-semibold text-slate-100 text-xs flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>{item.title}</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                    {new Date(item.publishedAt || item.createdAt).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed pl-5 whitespace-pre-line">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Banner Status */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">

              STATUS PENDAFTARAN TERKINI
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {user?.applicant?.fullName}
            </h1>
            <p className="text-xs text-slate-300 mt-1 font-mono">
              Nomor Pendaftaran: <span className="text-amber-300 font-bold">{user?.applicant?.registrationNumber}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow ${currentStatus === 'DITERIMA' || currentStatus === 'LULUS_SELEKSI'
                ? 'bg-emerald-500 text-slate-950'
                : currentStatus === 'DIVERIFIKASI'
                  ? 'bg-sky-500 text-white'
                  : currentStatus === 'MENUNGGU_VERIFIKASI'
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-700 text-slate-300'
                }`}
            >
              {currentStatus.replace('_', ' ')}
            </span>

            <Link
              href="/dashboard/cetak-bukti"
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              Cetak Bukti PMB
            </Link>
          </div>
        </div>

        {/* Visual Stepper */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {statusSteps.map((step, idx) => {
              const currentIdx = getStatusIndex(currentStatus);
              const isCompleted = idx <= currentIdx;
              const isCurrent = idx === currentIdx;

              return (
                <div
                  key={step.key}
                  className={`p-3 rounded-xl border text-center transition-all ${isCurrent
                    ? 'bg-sky-600 border-sky-400 text-white font-bold ring-2 ring-sky-400/50'
                    : isCompleted
                      ? 'bg-slate-800 border-slate-700 text-sky-400 font-semibold'
                      : 'bg-slate-950/40 border-slate-800 text-slate-500 text-xs'
                    }`}
                >
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Step 0{idx + 1}</div>
                  <div className="text-xs truncate mt-0.5">{step.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {message.text && (
        <div
          className={`p-4 rounded-xl border text-sm font-medium flex items-center gap-3 ${message.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 w-full max-w-full min-w-0">

        {/* Container scroll horizontal (hanya deretan tab yang bergeser) */}
        <div className="w-full max-w-full min-w-0 overflow-x-auto overflow-y-hidden overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-b border-slate-200">
          <div className="flex items-center flex-nowrap w-max p-2 gap-2">
            {[
              { id: 'personal', label: '1. Data Diri', icon: User },
              { id: 'education', label: '2. Data Pendidikan', icon: GraduationCap },
              { id: 'program', label: '3. Pilihan Prodi', icon: Award },
              { id: 'documents', label: '4. Upload Dokumen', icon: Upload },
              { id: 'payment', label: '5. Pembayaran', icon: CreditCard },
            ].map((tab) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 text-xs font-bold flex items-center gap-2 rounded-xl whitespace-nowrap flex-shrink-0 transition-all ${activeTab === tab.id
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                <tab.icon className="w-4 h-4 flex-shrink-0" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {/* TAB 1: DATA DIRI */}
          {activeTab === 'personal' && (
            <form onSubmit={handleSavePersonal} className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b pb-3">
                Isi Data Pribadi Calon Mahasiswa
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap (Sesuai KTP/Ijazah)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.applicant?.fullName || ''}
                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIK (Nomor Induk Kependudukan - 16 Digit)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    placeholder="3271012345670001"
                    value={personalForm.nik}
                    onChange={(e) => setPersonalForm({ ...personalForm, nik: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tempat Lahir
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Jakarta"
                    value={personalForm.birthPlace}
                    onChange={(e) => setPersonalForm({ ...personalForm, birthPlace: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    required
                    value={personalForm.birthDate}
                    onChange={(e) => setPersonalForm({ ...personalForm, birthDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={personalForm.gender}
                    onChange={(e) => setPersonalForm({ ...personalForm, gender: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.applicant?.phone || ''}
                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 cursor-not-allowed"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alamat Lengkap Tempat Tinggal
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Jl. Merdeka No. 12, RT 01/RW 02"
                    value={personalForm.address}
                    onChange={(e) => setPersonalForm({ ...personalForm, address: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kota / Kabupaten
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Kota Bekasi"
                    value={personalForm.city}
                    onChange={(e) => setPersonalForm({ ...personalForm, city: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Provinsi
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Jawa Barat"
                    value={personalForm.province}
                    onChange={(e) => setPersonalForm({ ...personalForm, province: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-full shadow shadow-sky-600/30 flex items-center gap-2"
                >
                  {loading ? 'Menyimpan...' : 'Simpan & Lanjut Data Pendidikan'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: DATA PENDIDIKAN */}
          {activeTab === 'education' && (
            <form onSubmit={handleSaveEducation} className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b pb-3">
                Isi Data Pendidikan Terakhir
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Asal Sekolah (SMA / SMK / MA)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="SMKN 1 Bekasi"
                    value={educationForm.schoolName}
                    onChange={(e) => setEducationForm({ ...educationForm, schoolName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NPSN Sekolah (Nomor Pokok Sekolah Nasional)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="20254123"
                    value={educationForm.npsn}
                    onChange={(e) => setEducationForm({ ...educationForm, npsn: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jurusan di Sekolah
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="IPA / IPS / Rekayasa Perangkat Lunak / Otomotif"
                    value={educationForm.major}
                    onChange={(e) => setEducationForm({ ...educationForm, major: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tahun Lulus
                  </label>
                  <input
                    type="number"
                    required
                    min={1995}
                    max={2030}
                    value={educationForm.graduationYear}
                    onChange={(e) => setEducationForm({ ...educationForm, graduationYear: parseInt(e.target.value) || 2027 })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-full shadow shadow-sky-600/30 flex items-center gap-2"
                >
                  {loading ? 'Menyimpan...' : 'Simpan & Lanjut Pilihan Prodi'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: PILIHAN PROGRAM STUDI */}
          {activeTab === 'program' && (
            <form onSubmit={handleSaveProgram} className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b pb-3">
                Pilih Program Studi Unggulan
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {programs.map((prog) => (
                  <div
                    key={prog.id}
                    onClick={() => setSelectedProgramId(prog.id)}
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${selectedProgramId === prog.id
                      ? 'border-sky-600 bg-sky-50/80 shadow-md ring-2 ring-sky-600/30'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-mono font-bold">
                          {prog.code}
                        </span>
                        <input
                          type="radio"
                          name="programSelection"
                          checked={selectedProgramId === prog.id}
                          onChange={() => setSelectedProgramId(prog.id)}
                          className="w-5 h-5 text-sky-600 focus:ring-sky-500"
                        />
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 mb-2">{prog.name}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed mb-4">{prog.description}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-200/80 flex justify-between items-center text-xs">
                      <span className="text-slate-500">Estimasi Biaya:</span>
                      <span className="font-bold text-slate-900 text-sm">
                        Rp {prog.tuitionFee?.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-full shadow shadow-sky-600/30 flex items-center gap-2"
                >
                  {loading ? 'Menyimpan...' : 'Simpan & Lanjut Upload Dokumen'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: UPLOAD DOKUMEN */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b pb-3">
                Unggah Dokumen Berkas PMB
              </h3>

              <form onSubmit={handleUploadDocument} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Jenis Dokumen
                    </label>
                    <select
                      value={selectedDocType}
                      onChange={(e) => setSelectedDocType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900"
                    >
                      <option value="FOTO">Pasfoto Berwarna (Latar Merah)</option>
                      <option value="KTP">KTP / Kartu Pelajar / KK</option>
                      <option value="IJAZAH">Ijazah / SKL Sementara</option>
                      <option value="TRANSKRIP">Transkrip Nilai / Rapor</option>
                      <option value="LAINNYA">Dokumen Pendukung Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Pilih File (JPG, PNG, PDF max 5MB)
                    </label>
                    <input
                      type="file"
                      required
                      accept="image/*,application/pdf"
                      onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    {loading ? 'Mengunggah...' : 'Unggah Dokumen'}
                  </button>
                </div>
              </form>

              {/* Uploaded Files Table */}
              <div className="pt-4 w-full max-w-full min-w-0">
                <h4 className="font-bold text-sm text-slate-900 mb-3">Daftar Dokumen Terunggah:</h4>

                {/* Wrapper scroll horizontal: hanya tabel yang bergeser */}
                <div className="w-full max-w-full min-w-0 border rounded-2xl overflow-x-auto overflow-y-hidden overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch]">
                  <table className="w-max min-w-full text-left text-xs">
                    <thead className="bg-slate-100 border-b font-bold text-slate-700">
                      <tr>
                        <th className="p-3 whitespace-nowrap">Tipe Dokumen</th>
                        <th className="p-3 whitespace-nowrap">Nama File</th>
                        <th className="p-3 whitespace-nowrap">Status Verifikasi</th>
                        <th className="p-3 whitespace-nowrap text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-slate-700">
                      {user?.applicant?.documents && user.applicant.documents.length > 0 ? (
                        user.applicant.documents.map((doc: any) => (
                          <tr key={doc.id}>
                            <td className="p-3 font-bold whitespace-nowrap">{doc.type}</td>
                            <td className="p-3 whitespace-nowrap">{doc.fileName}</td>
                            <td className="p-3 whitespace-nowrap">
                              {doc.isVerified ? (
                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                                  Terverifikasi
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold">
                                  Menunggu Verifikasi
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right whitespace-nowrap">
                              <a
                                href={`http://localhost:5000${doc.fileUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sky-600 hover:underline font-semibold"
                              >
                                Lihat File
                              </a>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-slate-400">
                            Belum ada dokumen yang diunggah.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PEMBAYARAN */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b pb-3">
                Pembayaran & Bukti Transfer
              </h3>

              {/* Pengecekan: Jika sudah ada pembayaran DAN sedang tidak dalam mode upload ulang */}
              {user?.applicant?.registrations?.[0]?.payments &&
                user.applicant.registrations[0].payments.length > 0 &&
                !isReuploading ? (

                <div className="space-y-6">
                  {/* BANNER PERINGATAN BUKTI TERKIRIM & TOMBOL SOLUSI / UPLOAD ULANG */}
                  <div className="bg-amber-50 border border-amber-300 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-amber-500 text-slate-950 rounded-xl font-bold flex-shrink-0">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-amber-900 text-sm">
                          ⚠️ Anda Sudah Mengunggah Bukti Pembayaran
                        </h4>
                        <p className="text-xs text-amber-800 leading-relaxed">
                          Bukti transfer Anda telah tersimpan dan sedang diperiksa panitia. Jika Anda salah mengunggah file atau ingin memperbarui bukti transfer, silakan klik tombol di sebelah kanan.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsReuploading(true)}
                      className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition-all whitespace-nowrap shadow-sm self-end sm:self-center"
                    >
                      Salah Upload? Unggah Ulang
                    </button>
                  </div>

                  {/* TABEL RIWAYAT BUKTI PEMBAYARAN MAHASISWA */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm w-full max-w-full min-w-0">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
                      Riwayat Bukti Pembayaran Anda:
                    </div>

                    {/* Wrapper scroll horizontal: hanya tabel yang bergeser */}
                    <div className="w-full max-w-full min-w-0 overflow-x-auto overflow-y-hidden overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch]">
                      <table className="w-max min-w-full text-left text-xs">
                        <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-3 whitespace-nowrap">Tipe Pembayaran</th>
                            <th className="p-3 whitespace-nowrap">Nominal</th>
                            <th className="p-3 whitespace-nowrap">Bukti File</th>
                            <th className="p-3 whitespace-nowrap">Status Verifikasi</th>
                          </tr>


                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-700">
                          {user.applicant.registrations[0].payments.map((pay: any) => (
                            <tr key={pay.id}>
                              <td className="p-3 font-bold whitespace-nowrap">{pay.paymentType || 'Biaya Pendaftaran PMB'}</td>
                              <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">Rp {pay.amount?.toLocaleString('id-ID')}</td>
                              <td className="p-3 whitespace-nowrap">
                                <a
                                  href={`http://localhost:5000${pay.proofUrl}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-sky-600 hover:underline font-semibold"
                                >
                                  Lihat Bukti Transfer
                                </a>
                              </td>



                              <td className="p-3 whitespace-nowrap">
                                {pay.status === 'VERIFIED' ? (
                                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                                    Terverifikasi
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold">
                                    Menunggu Verifikasi Admin
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              ) : (

                /* FORM UPLOAD BUKTI TRANSFER (Tampil saat belum pernah upload ATAU saat mode upload ulang aktif) */
                <div className="space-y-4">
                  {isReuploading && (
                    <div className="flex justify-between items-center p-3 bg-sky-50 border border-sky-200 rounded-xl text-sky-800 text-xs font-semibold">
                      <span>ℹ️ Anda sedang dalam mode memperbarui / mengunggah ulang bukti transfer.</span>
                      <button
                        type="button"
                        onClick={() => setIsReuploading(false)}
                        className="text-slate-500 hover:text-slate-800 underline font-bold"
                      >
                        Batal
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4">
                      <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                        Rekening Pembayaran Resmi Kampus:
                      </h4>
                      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2">
                        <div className="text-xs text-slate-400">Bank Transfer:</div>
                        <div className="text-lg font-bold text-white">BANK NEGARA INDONESIA (BNI)</div>
                        <div className="text-2xl font-mono font-extrabold text-amber-300">182 0221 226</div>
                        <div className="text-xs text-slate-300">a.n PMB Kampus Mulia Angkasa Akademi</div>
                      </div>
                      <div className="text-xs text-slate-400 leading-relaxed">
                        Nominal Biaya Pendaftaran: <span className="font-bold text-white">Rp 3.500.000</span>.
                        Setelah melakukan pembayaran, unggah bukti transfer pada form di sebelah kanan.
                      </div>
                    </div>

                    <form onSubmit={handleUploadPayment} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                      <h4 className="font-bold text-sm text-slate-900">
                        {isReuploading ? 'Unggah Ulang Bukti Baru:' : 'Upload Bukti Transfer:'}
                      </h4>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Jumlah Transfer (Rp)
                        </label>
                        <input
                          type="number"
                          required
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          File Bukti Transfer (Foto/PDF)
                        </label>
                        <input
                          type="file"
                          required
                          accept="image/*,application/pdf"
                          onChange={(e) => setPaymentFile(e.target.files?.[0] || null)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-full shadow flex items-center justify-center gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        {loading ? 'Mengirim...' : isReuploading ? 'Simpan Bukti Pembayaran Baru' : 'Kirim Bukti Pembayaran'}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}