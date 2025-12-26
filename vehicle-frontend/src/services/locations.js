import { api } from "./api";

export async function getDistricts() {
  const { data } = await api.get("/locations/districts");
  return data; // { items }
}

export async function getCities(district_id) {
  const { data } = await api.get("/locations/cities", {
    params: district_id ? { district_id } : {},
  });
  return data; // { items }
}
