import { Link } from "react-router-dom";

const formatLKR = (v) => {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return "—";
  return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(Number(v));
};

export default function ListingCard({ item }) {
  return (
    <Link
      to={`/listing/${item.id}`}
      className="block rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden hover:shadow-md transition"
    >
      <div className="aspect-[16/10] bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        {item.image ? (
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm opacity-70">No image</span>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-snug line-clamp-2">{item.title}</h3>
          {item.featured && (
            <span className="text-xs px-2 py-1 rounded-full bg-blue-600 text-white">Featured</span>
          )}
        </div>

        <div className="mt-1 text-sm opacity-80">
          {item.city}{item.city && item.district ? ", " : ""}{item.district}
        </div>

        <div className="mt-2 font-bold">{formatLKR(item.price)}</div>

        <div className="mt-2 text-xs opacity-80 flex gap-2 flex-wrap">
          {item.year && <span>{item.year}</span>}
          {item.mileageKm !== null && <span>{item.mileageKm.toLocaleString()} km</span>}
          {item.fuel && <span>{item.fuel}</span>}
          {item.transmission && <span>{item.transmission}</span>}
        </div>
      </div>
    </Link>
  );
}
