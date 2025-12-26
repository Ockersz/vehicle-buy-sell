import { api } from "./api";

export async function searchListings(params = {}) {
  const { data } = await api.get("/listings", { params });
  return data; // { items, page, page_size, total }
}

export async function getListing(id) {
  const { data } = await api.get(`/listings/${id}`);
  return data; // { listing }
}
