import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ListingCard from "../components/listing/ListingCard";
import { searchListings } from "../services/listings";
import { getDistricts, getCities } from "../services/locations";
import { useLanguage } from "../app/LanguageProvider";

const vehicleTypes = ["CAR", "VAN", "SUV", "BIKE", "THREE_WHEEL", "BUS", "LORRY", "HEAVY", "TRACTOR", "BOAT", "OTHER"];
const conditionTypes = ["NEW", "USED", "RECONDITIONED"];
const fuelTypes = ["PETROL", "DIESEL", "HYBRID", "ELECTRIC", "PLUGIN_HYBRID"];
const transmissions = ["AUTO", "MANUAL", "TRIPTRONIC", "TIPTRONIC"];
const sortOptions = [
  { value: "latest", label: "Latest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "year_desc", label: "Year: New to Old" },
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();

  const [filters, setFilters] = useState({
    q: searchParams.get("q") || "",
    vehicle_type: "",
    district_id: "",
    city_id: "",
    price_min: "",
    price_max: "",
    year_from: "",
    year_to: "",
    mileage_max: "",
    fuel_type: "",
    transmission: "",
    condition_type: "",
    sort: "latest",
    page: 1,
  });

  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await getDistricts();
      setDistricts(res?.items || []);
    })();
  }, []);

  useEffect(() => {
    if (!filters.district_id) {
      setCities([]);
      return;
    }
    (async () => {
      const res = await getCities(filters.district_id);
      setCities(res?.items || []);
    })();
  }, [filters.district_id]);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {
        page: filters.page,
        page_size: 12,
        q: filters.q || undefined,
        vehicle_type: filters.vehicle_type || undefined,
        district_id: filters.district_id || undefined,
        city_id: filters.city_id || undefined,
        price_min: filters.price_min || undefined,
        price_max: filters.price_max || undefined,
        year_from: filters.year_from || undefined,
        year_to: filters.year_to || undefined,
        mileage_max: filters.mileage_max || undefined,
        fuel_type: filters.fuel_type || undefined,
        transmission: filters.transmission || undefined,
        condition_type: filters.condition_type || undefined,
        sort: filters.sort || undefined,
      };
      const res = await searchListings(params);
      setData(res || { items: [], total: 0 });
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (filters.q) next.set("q", filters.q);
        else next.delete("q");
        return next;
      });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || t("search.error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.sort]);

  const applyFilters = (e) => {
    e?.preventDefault();
    setFilters((f) => ({ ...f, page: 1 }));
    load();
  };

  const resetFilters = () => {
    setFilters({
      q: "",
      vehicle_type: "",
      district_id: "",
      city_id: "",
      price_min: "",
      price_max: "",
      year_from: "",
      year_to: "",
      mileage_max: "",
      fuel_type: "",
      transmission: "",
      condition_type: "",
      sort: "latest",
      page: 1,
    });
    setSearchParams({});
    load();
  };

  const resultsLabel = useMemo(() => {
    if (loading) return t("search.loading");
    return `${t("search.showing")}: ${data.items?.length || 0} / ${data.total || 0}`;
  }, [loading, data, t]);

  return (
    <div className="grid md:grid-cols-4 gap-4 p-4 md:p-0 md:pt-4">
      <div className="md:col-span-1">
        <div className="card bg-base-100 shadow sticky top-20">
          <div className="card-body p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{t("filters.title")}</h2>
              <button className="btn btn-ghost btn-xs" onClick={resetFilters}>
                {t("filters.reset")}
              </button>
            </div>

            <form className="space-y-3" onSubmit={applyFilters}>
              <div className="space-y-2">
                <label className="text-xs text-base-content/60">{t("filters.keyword")}</label>
                <input
                  className="input input-bordered w-full"
                  value={filters.q}
                  onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                  placeholder={t("hero.searchPlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-base-content/60">{t("filters.vehicleType")}</label>
                <select
                  className="select select-bordered w-full"
                  value={filters.vehicle_type}
                  onChange={(e) => setFilters((f) => ({ ...f, vehicle_type: e.target.value }))}
                >
                  <option value="">Any</option>
                  {vehicleTypes.map((t) => (
                    <option key={t} value={t}>
                      {pretty(t)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-base-content/60">{t("filters.location")}</label>
                <select
                  className="select select-bordered w-full"
                  value={filters.district_id}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, district_id: e.target.value, city_id: "" }))
                  }
                >
                  <option value="">District</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <select
                  className="select select-bordered w-full"
                  value={filters.city_id}
                  onChange={(e) => setFilters((f) => ({ ...f, city_id: e.target.value }))}
                  disabled={!filters.district_id}
                >
                  <option value="">City</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-base-content/60">{t("filters.price")} min</label>
                  <input
                    className="input input-bordered w-full"
                    type="number"
                    value={filters.price_min}
                    onChange={(e) => setFilters((f) => ({ ...f, price_min: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-base-content/60">{t("filters.price")} max</label>
                  <input
                    className="input input-bordered w-full"
                    type="number"
                    value={filters.price_max}
                    onChange={(e) => setFilters((f) => ({ ...f, price_max: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-base-content/60">{t("filters.year")} from</label>
                  <input
                    className="input input-bordered w-full"
                    type="number"
                    value={filters.year_from}
                    onChange={(e) => setFilters((f) => ({ ...f, year_from: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-base-content/60">{t("filters.year")} to</label>
                  <input
                    className="input input-bordered w-full"
                    type="number"
                    value={filters.year_to}
                    onChange={(e) => setFilters((f) => ({ ...f, year_to: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-base-content/60">{t("filters.mileage")}</label>
                <input
                  className="input input-bordered w-full"
                  type="number"
                  value={filters.mileage_max}
                  onChange={(e) => setFilters((f) => ({ ...f, mileage_max: e.target.value }))}
                  placeholder="120000"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-base-content/60">{t("filters.condition")}</label>
                  <select
                    className="select select-bordered w-full"
                    value={filters.condition_type}
                    onChange={(e) => setFilters((f) => ({ ...f, condition_type: e.target.value }))}
                  >
                    <option value="">Any</option>
                    {conditionTypes.map((c) => (
                      <option key={c} value={c}>
                        {pretty(c)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-base-content/60">{t("filters.fuel")}</label>
                  <select
                    className="select select-bordered w-full"
                    value={filters.fuel_type}
                    onChange={(e) => setFilters((f) => ({ ...f, fuel_type: e.target.value }))}
                  >
                    <option value="">Any</option>
                    {fuelTypes.map((f) => (
                      <option key={f} value={f}>
                        {pretty(f)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-base-content/60">{t("filters.transmission")}</label>
                <select
                  className="select select-bordered w-full"
                  value={filters.transmission}
                  onChange={(e) => setFilters((f) => ({ ...f, transmission: e.target.value }))}
                >
                  <option value="">Any</option>
                  {transmissions.map((tr) => (
                    <option key={tr} value={tr}>
                      {pretty(tr)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-base-content/60">{t("filters.sort")}</label>
                <select
                  className="select select-bordered w-full"
                  value={filters.sort}
                  onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value, page: 1 }))}
                >
                  {sortOptions.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <button className="btn btn-primary w-full" type="submit">
                {t("filters.apply")}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="md:col-span-3 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <h1 className="text-xl font-bold">{t("nav.search")}</h1>
          <div className="text-sm text-base-content/70">{resultsLabel}</div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="loading loading-spinner" /> {t("search.loading")}
          </div>
        ) : data.items?.length ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {data.items.map((item) => (
              <ListingCard key={item.id} item={mapListing(item)} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function pretty(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .split("_")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

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

function EmptyState() {
  const { t } = useLanguage();
  return (
    <div className="p-6 bg-base-100 border border-dashed rounded-2xl text-center space-y-2">
      <div className="text-lg font-semibold">{t("empty.noResults")}</div>
      <div className="text-sm text-base-content/70">{t("empty.tryAdjust")}</div>
    </div>
  );
}
