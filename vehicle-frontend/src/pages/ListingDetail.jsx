import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getListing } from "../services/listings"; // adjust path if needed

export default function ListingDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [listing, setListing] = useState(null);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await getListing(id);
        if (!alive) return;
        setListing(res.listing);
        setActiveImg(0);
      } catch (e) {
        if (!alive) return;
        setErr(e?.response?.data?.message || e.message || "Failed to load listing");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const images = useMemo(() => listing?.images || [], [listing]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="card bg-base-100 shadow">
          <div className="card-body p-6">
            <span className="loading loading-spinner loading-lg" />
            <div className="text-sm text-base-content/70 mt-2">Loading listing...</div>
          </div>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="p-4">
        <div className="card bg-base-100 shadow">
          <div className="card-body p-6 space-y-3">
            <div className="text-lg font-semibold">Couldn’t load listing</div>
            <div className="text-sm text-error">{err}</div>
            <button className="btn btn-outline" onClick={() => nav(-1)}>
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) return null;

  const telLink = listing.phone ? `tel:+${listing.phone}` : "#";
  const waLink = listing.whatsapp
    ? `https://wa.me/${listing.whatsapp}?text=${encodeURIComponent(
        `Hi, I'm interested in your listing: ${listing.title || `${listing.make} ${listing.model}`}`
      )}`
    : "#";

  return (
    <div className="p-4 md:p-0 md:py-4">
      <div className="md:hidden mb-3">
        <button className="btn btn-ghost btn-sm" onClick={() => nav(-1)}>
          ← Back
        </button>
      </div>

      <div className="grid md:grid-cols-12 gap-4">
        <div className="md:col-span-8 space-y-4">
          <div className="card bg-base-100 shadow overflow-hidden">
            <div className="relative bg-base-200">
              <img
                src={images[activeImg]?.url || images[activeImg] || "https://picsum.photos/900/700?fallback=1"}
                alt=""
                className="w-full object-cover max-h-[420px]"
              />
            </div>

            <div className="p-3">
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, idx) => {
                  const src = img?.url || img;
                  return (
                    <button
                      key={img?.id || src || idx}
                      className={`shrink-0 rounded-xl overflow-hidden border ${
                        idx === activeImg ? "border-primary" : "border-base-300"
                      }`}
                      onClick={() => setActiveImg(idx)}
                    >
                      <img src={src} alt="" className="w-20 h-16 object-cover" loading="lazy" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow">
            <div className="card-body p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold">
                    {listing.title || `${listing.make} ${listing.model}`}
                  </h1>
                  <div className="text-sm text-base-content/60 mt-1">
                    {listing.city_name || listing.city_id || "City"}, {listing.district_name || listing.district_id || "District"} •{" "}
                    {listing.year}
                    {listing.mileage_km ? ` • ${Number(listing.mileage_km).toLocaleString()} km` : ""}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-extrabold text-primary">
                    LKR {Number(listing.price_lkr || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="md:hidden mt-3 grid grid-cols-2 gap-2">
                <a className="btn btn-primary" href={telLink}>
                  Call
                </a>
                <a className="btn btn-success" href={waLink} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow">
            <div className="card-body p-4">
              <h2 className="font-semibold text-lg">Specs</h2>
              <div className="divider my-2" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                <Spec label="Condition" value={listing.condition_type} />
                <Spec label="Fuel" value={listing.fuel_type || "-"} />
                <Spec label="Transmission" value={listing.transmission || "-"} />
                <Spec label="Year" value={listing.year} />
                <Spec label="Mileage" value={listing.mileage_km ? `${Number(listing.mileage_km).toLocaleString()} km` : "-"} />
                <Spec label="Type" value={listing.vehicle_type} />
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow">
            <div className="card-body p-4">
              <h2 className="font-semibold text-lg">Description</h2>
              <div className="divider my-2" />
              <p className="text-sm text-base-content/80 mt-2 leading-relaxed">
                {listing.description || "No description provided."}
              </p>
            </div>
          </div>
        </div>

        <div className="hidden md:block md:col-span-4">
          <div className="card bg-base-100 shadow sticky top-4">
            <div className="card-body p-4 space-y-3">
              <div className="text-sm text-base-content/60">Seller contact</div>
              <div className="font-semibold">{listing.phone ? `+${listing.phone}` : "—"}</div>

              <a className="btn btn-primary w-full" href={telLink}>
                Call seller
              </a>
              <a className="btn btn-success w-full" href={waLink} target="_blank" rel="noreferrer">
                WhatsApp
              </a>

              <div className="divider my-1" />

              <h3 className="font-semibold">Make an offer</h3>
              <input className="input input-bordered w-full" placeholder="Offer amount (LKR)" />
              <textarea className="textarea textarea-bordered w-full" rows={3} placeholder="Message (optional)" />
              <button className="btn btn-outline w-full">Send offer</button>

              <div className="text-xs text-base-content/50">(MVP UI only — backend later)</div>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden fixed bottom-16 left-0 right-0 px-3">
        <div className="bg-base-100 border border-base-300 shadow rounded-2xl p-2 flex gap-2">
          <a className="btn btn-primary flex-1" href={telLink}>
            Call
          </a>
          <a className="btn btn-success flex-1" href={waLink} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value }) {
  return (
    <div className="bg-base-200 rounded-xl p-3">
      <div className="text-xs text-base-content/60">{label}</div>
      <div className="font-semibold text-sm mt-1">{value ?? "-"}</div>
    </div>
  );
}
