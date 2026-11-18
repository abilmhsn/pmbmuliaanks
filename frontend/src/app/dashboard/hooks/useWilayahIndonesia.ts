'use client';

import { useState, useEffect } from 'react';
import { getCitiesByProvince } from '@/data/indonesiaRegions';

const formatRegionName = (str: string) =>
  str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

const normalizeName = (str: string) =>
  str.toLowerCase().replace(/administrasi\s+/g, '').trim();

export function useWilayahIndonesia(
  province: string,
  city: string,
  district: string
) {
  const [districtList, setDistrictList] = useState<{ id: string; name: string }[]>([]);
  const [subDistrictList, setSubDistrictList] = useState<{ id: string; name: string }[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingSubDistricts, setLoadingSubDistricts] = useState(false);

  const availableCities = getCitiesByProvince(province);

  // Load Kecamatan berdasarkan Provinsi & Kota/Kabupaten
  useEffect(() => {
    let active = true;

    const loadDistricts = async () => {
      if (!province || !city) {
        setDistrictList([]);
        setSubDistrictList([]);
        return;
      }

      try {
        setLoadingDistricts(true);

        const provRes = await fetch(
          'https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json'
        );
        const provincesData: { id: string; name: string }[] = await provRes.json();

        const matchedProv = provincesData.find(
          (p) => normalizeName(p.name) === normalizeName(province)
        );

        if (!matchedProv) return;

        const regRes = await fetch(
          `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${matchedProv.id}.json`
        );
        const regenciesData: { id: string; name: string }[] = await regRes.json();

        const matchedCity = regenciesData.find(
          (r) => normalizeName(r.name) === normalizeName(city)
        );

        if (!matchedCity) return;

        const distRes = await fetch(
          `https://www.emsifa.com/api-wilayah-indonesia/api/districts/${matchedCity.id}.json`
        );
        const districtsData: { id: string; name: string }[] = await distRes.json();

        if (active) {
          setDistrictList(
            districtsData
              .map((d) => ({
                id: d.id,
                name: formatRegionName(d.name),
              }))
              .sort((a, b) => a.name.localeCompare(b.name, 'id'))
          );
        }
      } catch (err) {
        console.error('Gagal memuat data kecamatan:', err);
      } finally {
        if (active) setLoadingDistricts(false);
      }
    };

    loadDistricts();

    return () => {
      active = false;
    };
  }, [province, city]);

  // Load Desa / Kelurahan berdasarkan Kecamatan
  useEffect(() => {
    let active = true;

    const loadSubDistricts = async () => {
      if (!district || districtList.length === 0) {
        setSubDistrictList([]);
        return;
      }

      const matchedDist = districtList.find(
        (d) => d.name.toLowerCase() === district.toLowerCase()
      );

      if (!matchedDist) return;

      try {
        setLoadingSubDistricts(true);

        const villRes = await fetch(
          `https://www.emsifa.com/api-wilayah-indonesia/api/villages/${matchedDist.id}.json`
        );
        const villagesData: { id: string; name: string }[] = await villRes.json();

        if (active) {
          setSubDistrictList(
            villagesData
              .map((v) => ({
                id: v.id,
                name: formatRegionName(v.name),
              }))
              .sort((a, b) => a.name.localeCompare(b.name, 'id'))
          );
        }
      } catch (err) {
        console.error('Gagal memuat data kelurahan:', err);
      } finally {
        if (active) setLoadingSubDistricts(false);
      }
    };

    loadSubDistricts();

    return () => {
      active = false;
    };
  }, [district, districtList]);

  return {
    availableCities,
    districtList,
    subDistrictList,
    loadingDistricts,
    loadingSubDistricts,
  };
}
