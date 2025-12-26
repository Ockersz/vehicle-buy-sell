import { api } from "./api";

export async function getDistricts() {
  const { data } = await api.get("/locations/districts");
  return data; // { items }
}

export async function getCities(district_id) {
  if (!district_id) return { items: [] };

  const { data } = await api.get(`/locations/districts/${district_id}/cities`);
  return data; // { items }
}
