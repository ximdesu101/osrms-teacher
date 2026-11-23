import regionsData from "./region.json";
import provincesData from "./province.json";
import citiesData from "./city.json";
import barangaysData from "./barangay.json";

/** @typedef {{ region_code: string, region_name: string }} Region */
/** @typedef {{ province_code: string, province_name: string, region_code: string }} Province */
/** @typedef {{ city_code: string, city_name: string, province_code: string }} City */
/** @typedef {{ brgy_code: string, brgy_name: string, city_code: string }} Barangay */

const sortByName = (a, b, key) => a[key].localeCompare(b[key], "en", { sensitivity: "base" });

/** All regions, sorted alphabetically by name */
export function getRegions() {
  return [...regionsData].sort((a, b) => sortByName(a, b, "region_name"));
}

/**
 * Provinces for a region (NCR uses districts as province-level entries).
 * Deduplicated by province_code.
 */
export function getProvincesByRegion(regionCode) {
  if (!regionCode) return [];
  const seen = new Set();
  return provincesData
    .filter((p) => p.region_code === regionCode)
    .filter((p) => {
      if (seen.has(p.province_code)) return false;
      seen.add(p.province_code);
      return true;
    })
    .sort((a, b) => sortByName(a, b, "province_name"));
}

/** Cities / municipalities for a province */
export function getCitiesByProvince(provinceCode) {
  if (!provinceCode) return [];
  return citiesData
    .filter((c) => c.province_code === provinceCode)
    .sort((a, b) => sortByName(a, b, "city_name"));
}

/** Barangays for a city / municipality */
export function getBarangaysByCity(cityCode) {
  if (!cityCode) return [];
  return barangaysData
    .filter((b) => b.city_code === cityCode)
    .sort((a, b) => sortByName(a, b, "brgy_name"));
}

export function getRegionName(code) {
  return regionsData.find((r) => r.region_code === code)?.region_name ?? "";
}

export function getProvinceName(code) {
  return provincesData.find((p) => p.province_code === code)?.province_name ?? "";
}

export function getCityName(code) {
  return citiesData.find((c) => c.city_code === code)?.city_name ?? "";
}

export function getBarangayName(code) {
  return barangaysData.find((b) => b.brgy_code === code)?.brgy_name ?? "";
}