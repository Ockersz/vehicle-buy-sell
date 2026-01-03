import { api } from "./api";

export async function fetchDistricts() {
  const res = await api.get("/locations/districts");
  return res.data;
}

export async function fetchCitiesByDistrict(districtId) {
  const res = await api.get(`/locations/districts/${districtId}/cities`);
  return res.data;
}

export async function searchLocations(q) {
  const res = await api.get("/locations/search", { params: { q } });
  return res.data;
}
