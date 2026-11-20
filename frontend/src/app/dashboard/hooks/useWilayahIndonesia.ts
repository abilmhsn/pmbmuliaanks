
'use client';

import { useState, useEffect } from 'react';
import { getCitiesByProvince } from '@/data/indonesiaRegions';

type Region = {
  id: string;
  name: string;
};

// Cache provinsi agar tidak terus mengambil data yang sama
let provincesCache: Region[] | null = null;
let provincesRequest: Promise<Region[]> | null = null;

const formatRegionName = (str: string) =>
  str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

const normalizeName = (str: string) =>
  str.toLowerCase().replace(/administrasi\s+/g, '').trim();

async function fetchJSON<T>(url: string): Promise<T> {
  let lastError: unknown;

  // Coba maksimal 3 kali jika koneksi gagal
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: Gagal mengambil ${url}`
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error;

      if (attempt < 3) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * attempt)
        );
      }
    }
  }

  throw lastError;
}

async function getProvinces(): Promise<Region[]> {
  if (provincesCache) return provincesCache;

  if (!provincesRequest) {
    provincesRequest = fetchJSON<Region[]>(
      'https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json'
    )
      .then((data) => {
        provincesCache = data;
        return data;
      })
      .catch((error) => {
        provincesRequest = null;
        throw error;
      });
  }

  return provincesRequest;
}

export function useWilayahIndonesia(
  province: string,
  city: string,
  district: string
) {
  const [districtList, setDistrictList] = useState<Region[]>([]);
  const [subDistrictList, setSubDistrictList] = useState<Region[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingSubDistricts, setLoadingSubDistricts] = useState(false);

  const availableCities = getCitiesByProvince(province);

  // Load kecamatan berdasarkan provinsi dan kota
  useEffect(() => {
    let active = true;

    const loadDistricts = async () => {
      setDistrictList([]);
      setSubDistrictList([]);

      if (!province || !city) {
        setLoadingDistricts(false);
        return;
      }

      try {
        setLoadingDistricts(true);

        const provincesData = await getProvinces();

        if (!active) return;

        const matchedProv = provincesData.find(
          (p) => normalizeName(p.name) === normalizeName(province)
        );

        if (!matchedProv) {
          console.error('Provinsi tidak ditemukan:', province);
          return;
        }

        const regenciesData = await fetchJSON<Region[]>(
          `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${matchedProv.id}.json`
        );

        if (!active) return;

        const matchedCity = regenciesData.find(
          (r) => normalizeName(r.name) === normalizeName(city)
        );

        if (!matchedCity) {
          console.error('Kota/kabupaten tidak ditemukan:', city);
          return;
        }

        const districtsData = await fetchJSON<Region[]>(
          `https://www.emsifa.com/api-wilayah-indonesia/api/districts/${matchedCity.id}.json`
        );

        if (!active) return;

        setDistrictList(
          districtsData
            .map((d) => ({
              id: d.id,
              name: formatRegionName(d.name),
            }))
            .sort((a, b) => a.name.localeCompare(b.name, 'id'))
        );
      } catch (error) {
        if (active) {
          console.error('Gagal memuat data kecamatan:', error);
        }
      } finally {
        if (active) setLoadingDistricts(false);
      }
    };

    loadDistricts();

    return () => {
      active = false;
    };
  }, [province, city]);

  // Load kelurahan berdasarkan kecamatan
  useEffect(() => {
    let active = true;

    const loadSubDistricts = async () => {
      setSubDistrictList([]);

      if (!district || districtList.length === 0) {
        setLoadingSubDistricts(false);
        return;
      }

      const matchedDist = districtList.find(
        (d) => normalizeName(d.name) === normalizeName(district)
      );

      if (!matchedDist) {
        setLoadingSubDistricts(false);
        return;
      }

      try {
        setLoadingSubDistricts(true);

        const villagesData = await fetchJSON<Region[]>(
          `https://www.emsifa.com/api-wilayah-indonesia/api/villages/${matchedDist.id}.json`
        );

        if (!active) return;

        setSubDistrictList(
          villagesData
            .map((v) => ({
              id: v.id,
              name: formatRegionName(v.name),
            }))
            .sort((a, b) => a.name.localeCompare(b.name, 'id'))
        );
      } catch (error) {
        if (active) {
          console.error('Gagal memuat data kelurahan:', error);
        }
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
