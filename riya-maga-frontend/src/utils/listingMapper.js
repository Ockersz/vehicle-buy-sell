const num = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// ✅ Used by Home/Search cards
export function mapApiListingToCard(x) {
  return {
    id: x.id,
    title: [x.make, x.model, x.model_variant].filter(Boolean).join(" "),
    year: x.year,
    price: num(x.price_lkr),
    mileageKm: num(x.mileage_km),
    fuel: x.fuel_type || null,
    transmission: x.transmission || null,
    district: x.district_name || null,
    city: x.city_name || null,
    featured: Boolean(x.is_featured),
    highlight: Boolean(x.is_highlighted),
    image: x.thumbnail_url || null,
  };
}

// ✅ Used by Listing Detail page
export function mapApiListingToDetail(x) {
  const images = Array.isArray(x?.images)
    ? x.images
        .map((img) => (typeof img === "string" ? img : img?.url))
        .filter(Boolean)
    : [];

  return {
    id: x.id,
    title:
      x.title || [x.make, x.model, x.model_variant].filter(Boolean).join(" "),
    year: x.year,
    price: x.price_lkr,
    mileageKm: x.mileage_km,
    fuel: x.fuel_type || null,
    transmission: x.transmission || null,
    condition: x.condition_type || null,
    district: x.district_name || null,
    city: x.city_name || null,
    description: x.description || "",

    images,

    // ✅ seller / contact (from your response)
    seller: {
      id: x.seller_id ?? null,
      name: x.seller_display_name || "Seller",
      role: x.role || null,
      memberSince: x.seller_member_since || null,
      phone: x.phone || null,
      whatsapp: x.whatsapp || x.contact_whatsapp || null, // if backend adds later
    },
  };
}
