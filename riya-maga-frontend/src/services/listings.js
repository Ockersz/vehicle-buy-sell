import { api } from "./api";

export async function fetchListings(params = {}) {
  const res = await api.get("/listings", { params });
  return res.data;
}

export async function fetchListingById(id) {
  const res = await api.get(`/listings/${id}`);
  return res.data;
}

// ✅ POST /listings (requires Bearer token)
export async function createListing(payload) {
  const res = await api.post("/listings", payload);
  return res.data;
}
