import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchListingById } from "../services/listings";
import { mapApiListingToDetail } from "../utils/listingMapper";
import ListingGallery from "../components/listing/ListingGallery";
import SpecGrid from "../components/listing/SpecGrid";

const formatLKR = (v) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(v || 0);

const fmtDate = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-LK", { year: "numeric", month: "short" });
};

const toWaNumber = (phone) => {
  if (!phone) return null;
  // WhatsApp needs digits only; keep + for tel, remove for wa
  return phone.replace(/[^\d]/g, "");
};

export default function ListingDetail() {
  const { id } = useParams();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["listing", id],
    queryFn: () => fetchListingById(id),
  });

  if (isLoading) return <div className="opacity-80">Loading…</div>;
  if (isError) return <div className="text-red-500">{String(error)}</div>;

  const raw = data?.listing || data?.item || data?.data || data;
  const item = mapApiListingToDetail(raw);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
      {/* Left */}
      <div className="space-y-4">
        <ListingGallery images={item.images} />

        <div>
          <h1 className="text-2xl font-bold">{item.title}</h1>
          <div className="text-xl font-semibold text-blue-600 mt-1">
            {formatLKR(item.price)}
          </div>
          <div className="text-sm opacity-70 mt-1">
            {[item.city, item.district].filter(Boolean).join(", ")}
          </div>
        </div>

        {item.description && (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <h3 className="font-semibold mb-1">Description</h3>
            <p className="text-sm opacity-90 whitespace-pre-line">
              {item.description}
            </p>
          </div>
        )}
      </div>

      {/* Right */}
      <div className="space-y-4">
        <SpecGrid item={item} />

        {/* Seller */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-3">
          <h3 className="font-semibold">Seller</h3>

          <div className="text-sm">
            <div className="font-semibold">{item.seller?.name || "Seller"}</div>

            <div className="opacity-80 mt-1">
              {item.seller?.memberSince
                ? `Since ${fmtDate(item.seller.memberSince)}`
                : ""}
            </div>
          </div>

          {item.seller?.phone && (
            <div className="text-sm">
              <div className="opacity-70">Phone</div>
              <div className="font-semibold">{item.seller.phone}</div>
            </div>
          )}

          {/* Desktop-only actions (mobile uses sticky bar) */}
          <div className="hidden lg:flex gap-2">
            {item.seller?.phone && (
              <a
                href={`tel:${item.seller.phone}`}
                className="flex-1 text-center rounded-xl py-2 font-semibold bg-blue-600 text-white"
              >
                Call
              </a>
            )}

            {(item.seller?.whatsapp || item.seller?.phone) && (
              <a
                href={`https://wa.me/${
                  item.seller?.whatsapp || toWaNumber(item.seller?.phone)
                }`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center rounded-xl py-2 font-semibold bg-green-600 text-white"
              >
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="lg:hidden h-24" />
      {/* Mobile sticky bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur border-t border-gray-200 dark:border-gray-700 flex gap-2">
        {item.seller?.phone && (
          <a
            href={`tel:${item.seller.phone}`}
            className="flex-1 text-center rounded-xl py-2 font-semibold bg-blue-600 text-white"
          >
            Call
          </a>
        )}
        {(item.seller?.whatsapp || item.seller?.phone) && (
          <a
            href={`https://wa.me/${
              item.seller?.whatsapp || toWaNumber(item.seller?.phone)
            }`}
            className="flex-1 text-center rounded-xl py-2 font-semibold bg-green-600 text-white"
          >
            WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
