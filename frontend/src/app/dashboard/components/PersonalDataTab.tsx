'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import SearchableSelect from '@/components/SearchableSelect';
import { PROVINCES } from '@/data/indonesiaRegions';
import { PersonalFormData } from '../types';

interface PersonalDataTabProps {
  personalForm: PersonalFormData;
  setPersonalForm: React.Dispatch<React.SetStateAction<PersonalFormData>>;
  userFullName?: string;
  districtList: { id: string; name: string }[];
  subDistrictList: { id: string; name: string }[];
  loadingDistricts: boolean;
  loadingSubDistricts: boolean;
  availableCities: string[];
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function PersonalDataTab({
  personalForm,
  setPersonalForm,
  userFullName,
  districtList,
  subDistrictList,
  loadingDistricts,
  loadingSubDistricts,
  availableCities,
  loading,
  onSubmit,
}: PersonalDataTabProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
            value={userFullName || ''}
            className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            NIK (16 Digit) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={16}
            inputMode="numeric"
            pattern="\d{16}"
            placeholder="3271012345670001"
            value={personalForm.nik}
            onChange={(e) =>
              setPersonalForm({
                ...personalForm,
                nik: e.target.value.replace(/\D/g, '').slice(0, 16),
              })
            }
            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Tempat Lahir <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Cirebon"
            value={personalForm.birthPlace}
            onChange={(e) =>
              setPersonalForm({
                ...personalForm,
                birthPlace: e.target.value,
              })
            }
            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500 placeholder:text-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Tanggal Lahir <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            required
            value={personalForm.birthDate}
            onChange={(e) =>
              setPersonalForm({
                ...personalForm,
                birthDate: e.target.value,
              })
            }
            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Jenis Kelamin
          </label>
          <select
            value={personalForm.gender}
            onChange={(e) =>
              setPersonalForm({
                ...personalForm,
                gender: e.target.value,
              })
            }
            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500"
          >
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Nomor WhatsApp / HP <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            inputMode="tel"
            maxLength={15}
            placeholder="Contoh: 08123456789"
            value={personalForm.phone}
            onChange={(e) =>
              setPersonalForm({
                ...personalForm,
                phone: e.target.value.replace(/\D/g, '').slice(0, 15),
              })
            }
            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Alamat / Nama Jalan <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Jl. Merdeka No. 45, Blok B"
            value={personalForm.address}
            onChange={(e) =>
              setPersonalForm({
                ...personalForm,
                address: e.target.value,
              })
            }
            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500 placeholder:text-slate-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              RT <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={3}
              inputMode="numeric"
              placeholder="001"
              value={personalForm.rt}
              onChange={(e) =>
                setPersonalForm({
                  ...personalForm,
                  rt: e.target.value.replace(/\D/g, '').slice(0, 3),
                })
              }
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500 placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              RW <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={3}
              inputMode="numeric"
              placeholder="002"
              value={personalForm.rw}
              onChange={(e) =>
                setPersonalForm({
                  ...personalForm,
                  rw: e.target.value.replace(/\D/g, '').slice(0, 3),
                })
              }
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Kode Pos <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={5}
            inputMode="numeric"
            placeholder="Contoh: 45123"
            value={personalForm.postalCode}
            onChange={(e) =>
              setPersonalForm({
                ...personalForm,
                postalCode: e.target.value.replace(/\D/g, '').slice(0, 5),
              })
            }
            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500 placeholder:text-slate-400"
          />
        </div>

        <div>
          <SearchableSelect
            id="province"
            label="Provinsi Tempat Tinggal"
            required
            placeholder="Pilih Provinsi..."
            searchPlaceholder="Cari provinsi (misal: Jawa Barat)..."
            options={PROVINCES}
            value={personalForm.province}
            onChange={(val) =>
              setPersonalForm({
                ...personalForm,
                province: val,
                city: '',
                district: '',
                subDistrict: '',
              })
            }
            helperText="Cari dan pilih provinsi tempat tinggal saat ini"
          />
        </div>

        <div>
          <SearchableSelect
            id="city"
            label="Kota / Kabupaten Tempat Tinggal"
            required
            placeholder="Pilih Kota / Kabupaten..."
            searchPlaceholder="Cari kota / kabupaten..."
            options={availableCities}
            value={personalForm.city}
            onChange={(val) =>
              setPersonalForm({
                ...personalForm,
                city: val,
                district: '',
                subDistrict: '',
              })
            }
            disabled={!personalForm.province}
            disabledMessage="Pilih provinsi terlebih dahulu"
            helperText={
              personalForm.province
                ? `Daftar kota/kabupaten di ${personalForm.province}`
                : 'Pilih provinsi terlebih dahulu'
            }
          />
        </div>

        <div>
          <SearchableSelect
            id="district"
            label="Kecamatan"
            required
            placeholder={
              loadingDistricts
                ? 'Memuat kecamatan...'
                : 'Pilih Kecamatan...'
            }
            searchPlaceholder="Cari kecamatan..."
            options={districtList.map((d) => d.name)}
            value={personalForm.district}
            onChange={(val) =>
              setPersonalForm({
                ...personalForm,
                district: val,
                subDistrict: '',
              })
            }
            disabled={!personalForm.city || loadingDistricts}
            disabledMessage={
              loadingDistricts
                ? 'Memuat daftar kecamatan...'
                : 'Pilih kota/kabupaten terlebih dahulu'
            }
            helperText={
              personalForm.city
                ? `Daftar kecamatan di ${personalForm.city}`
                : 'Pilih kota/kabupaten terlebih dahulu'
            }
          />
        </div>

        <div>
          <SearchableSelect
            id="subDistrict"
            label="Desa / Kelurahan"
            required
            placeholder={
              loadingSubDistricts
                ? 'Memuat desa/kelurahan...'
                : 'Pilih Desa / Kelurahan...'
            }
            searchPlaceholder="Cari desa / kelurahan..."
            options={subDistrictList.map((v) => v.name)}
            value={personalForm.subDistrict}
            onChange={(val) =>
              setPersonalForm({
                ...personalForm,
                subDistrict: val,
              })
            }
            disabled={!personalForm.district || loadingSubDistricts}
            disabledMessage={
              loadingSubDistricts
                ? 'Memuat daftar desa/kelurahan...'
                : 'Pilih kecamatan terlebih dahulu'
            }
            helperText={
              personalForm.district
                ? `Daftar desa/kelurahan di Kec. ${personalForm.district}`
                : 'Pilih kecamatan terlebih dahulu'
            }
          />
        </div>
      </div>

      <div className="pt-4 border-t flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm rounded-full shadow flex items-center gap-2 transition-all active:scale-95"
        >
          {loading ? 'Menyimpan...' : 'Lanjut Data Pendidikan'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
