import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ListingCard from "../components/listing/ListingCard";
import { searchListings } from "../services/listings";
import { useLanguage } from "../app/LanguageProvider";

export default function Home() {
  const nav = useNavigate();
  const { t } = useLanguage();
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await searchListings({ page: 1, page_size: 6, sort: "latest" });
        setLatest((res?.items || []).map(mapListing));
        setFeatured((res?.items || []).filter((x) => x.is_featured || x.is_boosted).map(mapListing).slice(0, 4));
      } catch (err) {
        console.error("load listings", err);
      }
    })();
  }, []);

  return (
    <div className="p-4 md:p-0 space-y-5">
      <div className="card bg-base-100 shadow overflow-hidden">
        <div className="card-body bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5">
          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold">{t("hero.title")}</h1>
              <p className="text-sm md:text-base text-base-content/70">{t("hero.subtitle")}</p>

              <div className="flex flex-col md:flex-row gap-2">
                <input
                  className="input input-bordered w-full md:w-96"
                  placeholder={t("hero.searchPlaceholder")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") nav(`/search?q=${encodeURIComponent(e.target.value)}`);
                  }}
                />
                <div className="flex gap-2">
                  <button className="btn btn-primary" onClick={() => nav("/search")}>
                    {t("hero.ctaSearch")}
                  </button>
                  <button className="btn btn-outline" onClick={() => nav("/sell")}>
                    {t("hero.ctaSell")}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
              {["Cars", "SUV", "Bikes", "Vans", "EV", "Hybrids", "Three-wheel"].map((chip) => (
                <span key={chip} className="badge badge-lg badge-outline">
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {featured.length > 0 && (
        <section className="space-y-3">
          <SectionHeader title={t("section.featured")} action={t("list.viewAll")} onAction={() => nav("/search?sort=latest")} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {featured.map((x) => (
              <ListingCard key={x.id} item={x} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <SectionHeader title={t("section.latest")} action={t("list.viewAll")} onAction={() => nav("/search")} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(latest.length ? latest : placeholderLatest).map((x) => (
            <ListingCard key={x.id} item={x} />
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ title, action, onAction }) {
  return (
    <div className="flex items-center justify-between px-1">
      <h2 className="text-lg font-semibold">{title}</h2>
      <button className="btn btn-link btn-sm" onClick={onAction}>
        {action}
      </button>
    </div>
  );
}

const placeholderLatest = Array.from({ length: 8 }).map((_, i) => ({
  id: `placeholder-${i}`,
  title: i % 2 === 0 ? "Toyota Aqua 2016" : "Nissan X-Trail 2014",
  district: i % 2 === 0 ? "Colombo" : "Kurunegala",
  city: i % 2 === 0 ? "Colombo" : "Kuliyapitiya",
  year: i % 2 === 0 ? 2016 : 2014,
  mileage: 60000 + i * 3500,
  price: 5200000 + i * 180000,
  featured: false,
  boosted: false,
  priceLabel: null,
  image: `https://picsum.photos/600/400?car=latest-${i}`,
}));

function mapListing(item) {
  return {
    id: item.id,
    title: item.title || `${item.make || ""} ${item.model || ""}`.trim(),
    district: item.district_name || item.district_id,
    city: item.city_name || item.city_id,
    year: item.year,
    mileage: item.mileage_km,
    price: item.price_lkr,
    featured: Boolean(item.is_featured),
    boosted: Boolean(item.is_boosted),
    priceLabel: item.price_label,
    image: item.cover_image?.url || item.images?.[0]?.url || "https://picsum.photos/600/400?car=placeholder",
  };
}
