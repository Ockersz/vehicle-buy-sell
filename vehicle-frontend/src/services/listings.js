import { api } from "./api";

export async function searchListings(params = {}) {
  const { data } = await api.get("/listings", { params });
  return data; // { items, page, page_size, total }
}

// Temporary alias for existing UI import
export const fetchListings = searchListings;

export async function getListing(id) {
  const { data } = await api.get(`/listings/${id}`);
  return data; // { listing }
}

export async function createListing(payload) {
  const { data } = await api.post("/listings", payload);
  return data;
}
