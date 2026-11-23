'use client';

import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { isValidProvince, isValidCity } from '@/data/indonesiaRegions';

import {
  TabType,
  PersonalFormData,
  EducationFormData,
  BankSettingsData,
  StatusStep,
  TabDefinition,
  StudyProgram,
  AnnouncementItem,
  DocumentItem,
  PaymentItem,
} from './types';

import { useWilayahIndonesia } from './hooks/useWilayahIndonesia';
import AnnouncementsBanner from './components/AnnouncementsBanner';
import ApplicantStatusBanner from './components/ApplicantStatusBanner';
import TabNavigation from './components/TabNavigation';
import PersonalDataTab from './components/PersonalDataTab';
import EducationDataTab from './components/EducationDataTab';
import ProgramSelectionTab from './components/ProgramSelectionTab';
import DocumentsUploadTab from './components/DocumentsUploadTab';
import PaymentTab from './components/PaymentTab';

export default function StudentDashboard() {
  const { user, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [programs, setPrograms] = useState<StudyProgram[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [isReuploading, setIsReuploading] = useState(false);

  // Mencegah data lokal tertimpa setiap kali refreshUser memperbarui user.
  const hydratedApplicantIdRef = useRef<string | null>(null);

  const applicant = user?.applicant;
  const savedPersonal = applicant?.personalData;
  const savedEducation = applicant?.educationData;
  const savedRegistration = applicant?.registrations?.[0];
  const savedDocuments: DocumentItem[] = applicant?.documents || [];

  // ==========================================
  // STATUS PENYELESAIAN TAHAP DARI DATABASE
  // ==========================================

  const isPersonalCompleted = Boolean(
    savedPersonal &&
    savedPersonal.nik?.trim() &&
    savedPersonal.birthPlace?.trim() &&
    savedPersonal.birthDate &&
    savedPersonal.address?.trim() &&
    savedPersonal.city?.trim() &&
    savedPersonal.province?.trim() &&
    savedPersonal.district?.trim() &&
    savedPersonal.subDistrict?.trim() &&
    savedPersonal.rtRw?.trim() &&
    savedPersonal.postalCode?.trim() &&
    applicant?.phone?.trim()
  );

  const isEducationCompleted = Boolean(
    savedEducation &&
    savedEducation.schoolName?.trim() &&
    savedEducation.npsn?.trim() &&
    savedEducation.major?.trim() &&
    savedEducation.graduationYear
  );

  const isProgramCompleted = Boolean(savedRegistration?.studyProgramId);

  const requiredDocuments = ['FOTO', 'KTP', 'IJAZAH', 'TRANSKRIP'];

  // Minimal 2 dokumen sudah cukup untuk membuka tahap pembayaran (sisanya opsional)
  const isDocumentsCompleted = savedDocuments.length >= 2;

  const tabOrder: TabType[] = [
    'personal',
    'education',
    'program',
    'documents',
    'payment',
  ];

  // FORM STATES
  const [personalForm, setPersonalForm] = useState<PersonalFormData>({
    nik: '',
    birthPlace: '',
    birthDate: '',
    gender: 'Laki-laki',
    address: '',
    rt: '',
    rw: '',
    postalCode: '',
    district: '',
    subDistrict: '',
    city: '',
    province: '',
    phone: '',
  });

  const [educationForm, setEducationForm] = useState<EducationFormData>({
    schoolName: '',
    npsn: '',
    major: 'IPA',
    graduationYear: 2027,
  });

  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [selectedDocType, setSelectedDocType] = useState('FOTO');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('250000');

  // ==========================================
  // WILAYAH INDONESIA (CUSTOM HOOK)
  // ==========================================

  const {
    availableCities,
    districtList,
    subDistrictList,
    loadingDistricts,
    loadingSubDistricts,
  } = useWilayahIndonesia(
    personalForm.province,
    personalForm.city,
    personalForm.district
  );

  // ==========================================
  // PENGATURAN BANK
  // ==========================================

  const [bankSettings, setBankSettings] = useState<BankSettingsData>({
    bankName: 'BANK NEGARA INDONESIA (BNI)',
    accountNumber: '182 0221 226',
    accountHolder: 'PMB Kampus Mulia Angkasa Akademi',
    registrationFee: 250000,
  });

  // ==========================================
  // CEK APAKAH FORM MASIH SESUAI DATA DATABASE
  // ==========================================

  const savedRtRw = (savedPersonal?.rtRw || '').split('/');
  const savedRt = (savedRtRw[0] || '').replace(/\D/g, '').slice(0, 3);
  const savedRw = (savedRtRw[1] || '').replace(/\D/g, '').slice(0, 3);

  const savedBirthDate = savedPersonal?.birthDate
    ? new Date(savedPersonal.birthDate).toISOString().split('T')[0]
    : '';

  const isPersonalFormSaved = Boolean(
    isPersonalCompleted &&
    personalForm.nik === (savedPersonal?.nik || '').replace(/\D/g, '').slice(0, 16) &&
    personalForm.birthPlace === (savedPersonal?.birthPlace || '') &&
    personalForm.birthDate === savedBirthDate &&
    personalForm.gender === (savedPersonal?.gender || 'Laki-laki') &&
    personalForm.address === (savedPersonal?.address || '') &&
    personalForm.rt === savedRt &&
    personalForm.rw === savedRw &&
    personalForm.postalCode === (savedPersonal?.postalCode || '').replace(/\D/g, '').slice(0, 5) &&
    personalForm.district === (savedPersonal?.district || '') &&
    personalForm.subDistrict === (savedPersonal?.subDistrict || '') &&
    personalForm.city === (savedPersonal?.city || '') &&
    personalForm.province === (savedPersonal?.province || '') &&
    personalForm.phone === (applicant?.phone || '').replace(/\D/g, '')
  );

  const isEducationFormSaved = Boolean(
    isEducationCompleted &&
    educationForm.schoolName === (savedEducation?.schoolName || '') &&
    educationForm.npsn === (savedEducation?.npsn || '') &&
    educationForm.major === (savedEducation?.major || '') &&
    Number(educationForm.graduationYear) === Number(savedEducation?.graduationYear)
  );

  const isProgramFormSaved = Boolean(
    isProgramCompleted && selectedProgramId === savedRegistration?.studyProgramId
  );

  // ==========================================
  // SISTEM PENGUNCIAN TAHAP
  // ==========================================

  const canAccessTab = (tab: TabType) => {
    switch (tab) {
      case 'personal':
        return true;
      case 'education':
        return isPersonalFormSaved;
      case 'program':
        return isPersonalFormSaved && isEducationFormSaved;
      case 'documents':
        return isPersonalFormSaved && isEducationFormSaved && isProgramFormSaved;
      case 'payment':
        return (
          isPersonalFormSaved &&
          isEducationFormSaved &&
          isProgramFormSaved &&
          isDocumentsCompleted
        );
      default:
        return false;
    }
  };

  const goToTab = (tab: TabType) => {
    if (loading) return;

    if (!canAccessTab(tab)) {
      setMessage({
        type: 'error',
        text: 'Tahap ini masih terkunci. Selesaikan dan simpan tahap sebelumnya terlebih dahulu.',
      });
      return;
    }

    setMessage({ type: '', text: '' });
    setActiveTab(tab);
  };

  const goToPreviousTab = () => {
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex > 0) {
      setMessage({ type: '', text: '' });
      setActiveTab(tabOrder[currentIndex - 1]);
    }
  };

  // ==========================================
  // HELPER URL DOKUMEN
  // ==========================================

  const getFullDocumentUrl = (filePath?: string) => {
    if (!filePath || filePath === '-' || filePath.trim() === '') {
      return '#';
    }

    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }

    const SUPABASE_STORAGE_PUBLIC_URL =
      process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL ||
      'https://apuvscjcdkpoevuacnzm.supabase.co/storage/v1/object/public/pmb-documents';

    return `${SUPABASE_STORAGE_PUBLIC_URL}/${filePath.replace(/^\//, '')}`;
  };

  // ==========================================
  // FETCH DATA
  // ==========================================

  const fetchPrograms = async () => {
    try {
      const res = await api.get('/study-programs');
      setPrograms(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data);
    } catch (err) {
      console.error('Gagal memuat pengumuman:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get('/super-admin/public/settings');

      if (res.data) {
        const settingsMap: Record<string, string> = {};

        if (Array.isArray(res.data)) {
          res.data.forEach((item: { key: string; value: string }) => {
            settingsMap[item.key] = item.value;
          });
        } else if (typeof res.data === 'object' && res.data !== null) {
          Object.assign(settingsMap, res.data);
        }

        const feeRaw = settingsMap.REGISTRATION_FEE;
        const fee =
          feeRaw !== undefined && feeRaw !== null && feeRaw !== ''
            ? Number(feeRaw)
            : 250000;

        setBankSettings({
          bankName: settingsMap.PAYMENT_BANK_NAME || 'Bank Mandiri',
          accountNumber:
            settingsMap.PAYMENT_ACCOUNT_NUMBER || '137-00-1234567-8',
          accountHolder:
            settingsMap.PAYMENT_ACCOUNT_HOLDER ||
            'Yayasan Mulia Angkasa Akademi',
          registrationFee: fee,
        });

        setPaymentAmount(String(Math.min(3500000, fee)));
      }
    } catch (err) {
      console.error('Gagal memuat pengaturan global bank:', err);
    }
  };

  // ==========================================
  // MUAT DATA FORM DARI DATABASE
  // ==========================================

  useEffect(() => {
    if (!applicant) return;

    const applicantId = String(applicant.id || user?.id || '');
    if (!applicantId) return;

    if (hydratedApplicantIdRef.current === applicantId) return;
    hydratedApplicantIdRef.current = applicantId;

    const p = applicant.personalData;
    if (p) {
      const [rt = '', rw = ''] = (p.rtRw || '').split('/');

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPersonalForm({
        nik: (p.nik || '').replace(/\D/g, '').slice(0, 16),
        birthPlace: p.birthPlace || '',
        birthDate: p.birthDate
          ? new Date(p.birthDate).toISOString().split('T')[0]
          : '',
        gender: p.gender || 'Laki-laki',
        address: p.address || '',
        rt: rt.replace(/\D/g, '').slice(0, 3),
        rw: rw.replace(/\D/g, '').slice(0, 3),
        postalCode: (p.postalCode || '').replace(/\D/g, '').slice(0, 5),
        district: p.district || '',
        subDistrict: p.subDistrict || '',
        city: p.city || '',
        province: p.province || '',
        phone: (applicant.phone || '').replace(/\D/g, ''),
      });
    } else {
      setPersonalForm((prev) => ({
        ...prev,
        phone: (applicant.phone || '').replace(/\D/g, ''),
      }));
    }

    const e = applicant.educationData;
    if (e) {
      setEducationForm({
        schoolName: e.schoolName || '',
        npsn: e.npsn || '',
        major: e.major || 'IPA',
        graduationYear: e.graduationYear || 2027,
      });
    }

    const registration = applicant.registrations?.[0];
    if (registration) {
      setSelectedProgramId(registration.studyProgramId || '');
    }
  }, [applicant, user?.id]);

  // ==========================================
  // LOAD DATA AWAL
  // ==========================================

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPrograms();
    fetchAnnouncements();
    fetchSettings();

    if (refreshUser) {
      refreshUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = document.getElementById(`tab-${activeTab}`);
    el?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [activeTab]);

  // ==========================================
  // STATUS PENDAFTARAN
  // ==========================================

  const currentRegistration = user?.applicant?.registrations?.[0];
  const currentStatus = currentRegistration?.status || 'BELUM_LENGKAP';

  const statusSteps: StatusStep[] = [
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

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!/^\d{16}$/.test(personalForm.nik)) {
        setMessage({
          type: 'error',
          text: 'NIK wajib diisi tepat 16 digit angka.',
        });
        return;
      }

      if (!personalForm.birthPlace.trim()) {
        setMessage({ type: 'error', text: 'Tempat lahir wajib diisi.' });
        return;
      }

      if (!personalForm.birthDate) {
        setMessage({ type: 'error', text: 'Tanggal lahir wajib diisi.' });
        return;
      }

      if (
        !personalForm.phone.trim() ||
        !/^\d{9,15}$/.test(personalForm.phone)
      ) {
        setMessage({
          type: 'error',
          text: 'Nomor WhatsApp / HP wajib diisi dengan angka yang valid (minimal 9 digit).',
        });
        return;
      }

      if (!personalForm.address.trim()) {
        setMessage({
          type: 'error',
          text: 'Alamat jalan / nomor rumah wajib diisi.',
        });
        return;
      }

      if (!personalForm.rt.trim() || !/^\d{1,3}$/.test(personalForm.rt)) {
        setMessage({
          type: 'error',
          text: 'RT wajib diisi dengan angka (maksimal 3 digit).',
        });
        return;
      }

      if (!personalForm.rw.trim() || !/^\d{1,3}$/.test(personalForm.rw)) {
        setMessage({
          type: 'error',
          text: 'RW wajib diisi dengan angka (maksimal 3 digit).',
        });
        return;
      }

      if (!/^\d{5}$/.test(personalForm.postalCode)) {
        setMessage({
          type: 'error',
          text: 'Kode Pos wajib diisi tepat 5 digit angka.',
        });
        return;
      }

      if (!isValidProvince(personalForm.province)) {
        setMessage({
          type: 'error',
          text: 'Silakan pilih Provinsi yang valid dari daftar pilihan.',
        });
        return;
      }

      if (!isValidCity(personalForm.city, personalForm.province)) {
        setMessage({
          type: 'error',
          text: `Silakan pilih Kota/Kabupaten yang sesuai untuk Provinsi ${personalForm.province}.`,
        });
        return;
      }

      if (!personalForm.district.trim()) {
        setMessage({
          type: 'error',
          text: 'Silakan pilih Kecamatan tempat tinggal.',
        });
        return;
      }

      if (!personalForm.subDistrict.trim()) {
        setMessage({
          type: 'error',
          text: 'Silakan pilih Desa / Kelurahan tempat tinggal.',
        });
        return;
      }

      setLoading(true);
      setMessage({ type: '', text: '' });

      const { rt, rw, ...restPersonalForm } = personalForm;

      const payload = {
        ...restPersonalForm,
        rtRw: `${rt}/${rw}`,
      };

      await api.post('/applicants/personal-data', payload);
      await refreshUser();

      setMessage({
        type: 'success',
        text: 'Data pribadi berhasil disimpan!',
      });

      setActiveTab('education');
    } catch (err: unknown) {
      const errResponse = err as { response?: { data?: { message?: string } } };
      setMessage({
        type: 'error',
        text: errResponse.response?.data?.message || 'Gagal menyimpan data.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEducation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !educationForm.schoolName.trim() ||
      !educationForm.npsn.trim() ||
      !educationForm.major.trim() ||
      !educationForm.graduationYear
    ) {
      setMessage({
        type: 'error',
        text: 'Semua data pendidikan wajib diisi.',
      });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      await api.post('/applicants/education-data', educationForm);
      await refreshUser();

      setMessage({
        type: 'success',
        text: 'Data pendidikan berhasil disimpan!',
      });

      setActiveTab('program');
    } catch (err: unknown) {
      const errResponse = err as { response?: { data?: { message?: string } } };
      setMessage({
        type: 'error',
        text: errResponse.response?.data?.message || 'Gagal menyimpan data.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProgramId) {
      setMessage({
        type: 'error',
        text: 'Pilih salah satu Program Studi.',
      });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      await api.post('/applicants/program-selection', {
        studyProgramId: selectedProgramId,
      });

      await refreshUser();

      setMessage({
        type: 'success',
        text: 'Pilihan Program Studi berhasil disimpan!',
      });

      setActiveTab('documents');
    } catch (err: unknown) {
      const errResponse = err as { response?: { data?: { message?: string } } };
      setMessage({
        type: 'error',
        text:
          errResponse.response?.data?.message ||
          'Gagal menyimpan pilihan program studi.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!docFile) {
      setMessage({
        type: 'error',
        text: 'Pilih file dokumen yang akan diunggah.',
      });
      return;
    }

    if (docFile.size > 1 * 1024 * 1024) {
      setMessage({
        type: 'error',
        text: 'Ukuran file maksimal 1 MB.',
      });
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

      setMessage({
        type: 'success',
        text: `Dokumen ${selectedDocType} berhasil diunggah!`,
      });

      setDocFile(null);

      const fileInput = document.getElementById(
        'document-file-input'
      ) as HTMLInputElement | null;

      if (fileInput) fileInput.value = '';
    } catch (err: unknown) {
      const errResponse = err as { response?: { data?: { message?: string } } };
      setMessage({
        type: 'error',
        text: errResponse.response?.data?.message || 'Gagal mengunggah dokumen.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentFile) {
      setMessage({
        type: 'error',
        text: 'Pilih file bukti pembayaran.',
      });
      return;
    }

    if (paymentFile.size > 5 * 1024 * 1024) {
      setMessage({
        type: 'error',
        text: 'Ukuran file maksimal 5 MB.',
      });
      return;
    }

    if (Number(paymentAmount) > 3500000) {
      setMessage({
        type: 'error',
        text: 'Nominal Uang Muka (DP) maksimal Rp 3.500.000.',
      });
      return;
    }

    const formData = new FormData();
    formData.append('proof', paymentFile);
    formData.append('amount', paymentAmount);
    formData.append('paymentType', 'Uang Muka (DP) Pendaftaran PMB');

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      await api.post('/payments/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await refreshUser();

      setMessage({
        type: 'success',
        text: 'Bukti pembayaran uang muka berhasil diunggah! Menunggu verifikasi admin.',
      });

      setPaymentFile(null);
      setIsReuploading(false);

      const fileInput = document.getElementById(
        'payment-file-input'
      ) as HTMLInputElement | null;

      if (fileInput) fileInput.value = '';
    } catch (err: unknown) {
      const errResponse = err as { response?: { data?: { message?: string } } };
      setMessage({
        type: 'error',
        text: errResponse.response?.data?.message || 'Gagal mengunggah pembayaran.',
      });
    } finally {
      setLoading(false);
    }
  };

  const tabDefinitions: TabDefinition[] = [
    { id: 'personal', label: '1. Data Diri', icon: User },
    { id: 'education', label: '2. Data Pendidikan', icon: GraduationCap },
    { id: 'program', label: '3. Pilihan Prodi', icon: Award },
    { id: 'documents', label: '4. Upload Dokumen', icon: Upload },
    { id: 'payment', label: '5. Pembayaran', icon: CreditCard },
  ];

  const applicantPayments: PaymentItem[] =
    user?.applicant?.registrations?.[0]?.payments || [];

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="space-y-8 max-w-6xl mx-auto w-full min-w-0">
      {/* PENGUMUMAN */}
      <AnnouncementsBanner announcements={announcements} />

      {/* BANNER STATUS & STEPPER */}
      <ApplicantStatusBanner
        fullName={user?.applicant?.fullName}
        registrationNumber={user?.applicant?.registrationNumber}
        currentStatus={currentStatus}
        statusSteps={statusSteps}
        getStatusIndex={getStatusIndex}
      />

      {/* PESAN NOTIFIKASI */}
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

      {/* NAVIGASI & CONTENT TAHAP */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 w-full max-w-full min-w-0">
        <TabNavigation
          activeTab={activeTab}
          loading={loading}
          canAccessTab={canAccessTab}
          goToTab={goToTab}
          tabDefinitions={tabDefinitions}
        />

        <div className="p-6 sm:p-8">
          {activeTab === 'personal' && (
            <PersonalDataTab
              personalForm={personalForm}
              setPersonalForm={setPersonalForm}
              userFullName={user?.applicant?.fullName}
              districtList={districtList}
              subDistrictList={subDistrictList}
              loadingDistricts={loadingDistricts}
              loadingSubDistricts={loadingSubDistricts}
              availableCities={availableCities}
              loading={loading}
              onSubmit={handleSavePersonal}
            />
          )}

          {activeTab === 'education' && (
            <EducationDataTab
              educationForm={educationForm}
              setEducationForm={setEducationForm}
              loading={loading}
              onPrevious={goToPreviousTab}
              onSubmit={handleSaveEducation}
            />
          )}

          {activeTab === 'program' && (
            <ProgramSelectionTab
              programs={programs}
              selectedProgramId={selectedProgramId}
              setSelectedProgramId={setSelectedProgramId}
              loading={loading}
              onPrevious={goToPreviousTab}
              onSubmit={handleSaveProgram}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsUploadTab
              requiredDocuments={requiredDocuments}
              savedDocuments={savedDocuments}
              selectedDocType={selectedDocType}
              setSelectedDocType={setSelectedDocType}
              setDocFile={setDocFile}
              loading={loading}
              isDocumentsCompleted={isDocumentsCompleted}
              getFullDocumentUrl={getFullDocumentUrl}
              onUpload={handleUploadDocument}
              onPrevious={goToPreviousTab}
              onNext={() => goToTab('payment')}
            />
          )}

          {activeTab === 'payment' && (
            <PaymentTab
              payments={applicantPayments}
              bankSettings={bankSettings}
              paymentAmount={paymentAmount}
              setPaymentAmount={setPaymentAmount}
              setPaymentFile={setPaymentFile}
              isReuploading={isReuploading}
              setIsReuploading={setIsReuploading}
              loading={loading}
              getFullDocumentUrl={getFullDocumentUrl}
              onUpload={handleUploadPayment}
              onPrevious={goToPreviousTab}
            />
          )}
        </div>
      </div>
    </div>
  );
}