import { useNavigate } from "react-router-dom";

const priceLabelStyles = {
  BELOW: "bg-success text-success-content",
  FAIR: "bg-info text-info-content",
  ABOVE: "bg-warning text-warning-content",
};

export default function ListingCard({ item }) {
  const nav = useNavigate();

  const priceClass =
    item.priceLabel && priceLabelStyles[item.priceLabel]
      ? priceLabelStyles[item.priceLabel]
      : "bg-base-100 text-base-content";

  return (
    <div
      className="card bg-base-100 shadow hover:shadow-lg transition overflow-hidden cursor-pointer"
      onClick={() => nav(`/listings/${item.id}`)}
    >
      {/* image */}
      <figure className="relative aspect-[4/3] bg-base-200">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Top-left badges (wrap + never overlap) */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[70%]">
          {item.featured && (
            <span className="badge badge-primary shadow-sm">Featured</span>
          )}
          {item.boosted && (
            <span className="badge badge-secondary shadow-sm">Boost</span>
          )}
        </div>

        {/* Bottom-right price label (always readable) */}
        {item.priceLabel && (
          <div className="absolute bottom-2 right-2">
            <span
              className={`px-2 py-1 rounded-full text-[11px] font-semibold shadow-sm ${priceClass}`}
              style={{ backdropFilter: "blur(6px)" }}
            >
              {item.priceLabel}
            </span>
          </div>
        )}

        {/* subtle gradient so text/badges stay readable on bright images */}
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/30 to-transparent" />
      </figure>

      {/* content */}
      <div className="card-body p-3">
        <div className="font-semibold text-sm md:text-base line-clamp-1">
          {item.title}
        </div>

        <div className="text-xs text-base-content/60">
          {item.city}, {item.district} • {item.year}
          {item.mileage ? ` • ${item.mileage.toLocaleString()} km` : ""}
        </div>

        <div className="mt-1 flex items-end justify-between gap-2">
          <div className="text-sm md:text-base font-bold text-primary">
            LKR {item.price.toLocaleString()}
          </div>

          <button className="btn btn-ghost btn-xs">♡ Save</button>
        </div>
      </div>
    </div>
  );
}
