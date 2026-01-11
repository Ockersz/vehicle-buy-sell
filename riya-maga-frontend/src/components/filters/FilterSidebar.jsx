import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  fetchDistricts,
  fetchCitiesByDistrict,
} from "../../services/locations";

const VEHICLE_TYPES = ["CAR", "VAN", "SUV", "BIKE", "TRUCK", "BUS"];
const FUEL_TYPES = ["PETROL", "DIESEL", "HYBRID", "EV"];
const TRANSMISSIONS = ["AUTO", "MANUAL"];
const CONDITIONS = ["NEW", "USED", "RECONDITIONED"];

const inputCls =
  "w-full rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700";
const labelCls = "text-sm font-semibold mb-1";

const toNumOrNull = (v) => (v === "" || v == null ? null : Number(v));
const toStrOrNull = (v) => (v === "" ? null : v);

export default function FilterSidebar({ value, onChange, onApply, onClear }) {
  const { t } = useTranslation();
  const [local, setLocal] = useState(value);

  useEffect(() => setLocal(value), [value]);

  const set = (patch) => setLocal((s) => ({ ...s, ...patch, page: 1 }));

  const districtId = local?.district_id || null;

  const { data: distData, isFetching: districtsLoading } = useQuery({
    queryKey: ["districts"],
    queryFn: fetchDistricts,
  });

  const { data: cityData, isFetching: citiesLoading } = useQuery({
    queryKey: ["cities", districtId],
    queryFn: () => fetchCitiesByDistrict(districtId),
    enabled: Boolean(districtId),
  });

  const districts = distData?.items || [];
  const cities = cityData?.items || [];

  const canChooseCity = Boolean(districtId);

  const handleApply = () => {
    onChange?.(local);
    onApply?.(local);
  };

  const handleClear = () => {
    const cleared = {
      ...local,
      vehicle_type: null,
      make: null,
      model: null,

      fuel_type: null,
      transmission: null,
      condition_type: null,
      mileage_min: null,
      mileage_max: null,

      min_price: null,
      max_price: null,
      district_id: null,
      city_id: null,
      page: 1,
    };
    setLocal(cleared);
    onClear?.(cleared);
  };

  const cityPlaceholder = useMemo(() => {
    if (!canChooseCity) return t('filters.selectDistrictFirst');
    if (citiesLoading) return t('filters.loading');
    return t('filters.all');
  }, [canChooseCity, citiesLoading, t]);

  return (
    <div className="space-y-4">
      {/* Vehicle type */}
      <div>
        <div className={labelCls}>{t('filters.vehicleType')}</div>
        <select
          className={inputCls}
          value={local.vehicle_type || ""}
          onChange={(e) => set({ vehicle_type: toStrOrNull(e.target.value) })}
        >
          <option value="">{t('filters.all')}</option>
          {VEHICLE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Make / Model */}
      <div className="grid grid-cols-1 gap-3">
        <div>
          <div className={labelCls}>{t('filters.make')}</div>
          <input
            className={inputCls}
            value={local.make || ""}
            onChange={(e) => set({ make: toStrOrNull(e.target.value) })}
            placeholder="Toyota"
          />
        </div>

        <div>
          <div className={labelCls}>{t('filters.model')}</div>
          <input
            className={inputCls}
            value={local.model || ""}
            onChange={(e) => set({ model: toStrOrNull(e.target.value) })}
            placeholder="Prius"
          />
        </div>
      </div>

      {/* Fuel / Transmission / Condition */}
      <div className="grid grid-cols-1 gap-3">
        <div>
          <div className={labelCls}>{t('filters.fuelType')}</div>
          <select
            className={inputCls}
            value={local.fuel_type || ""}
            onChange={(e) => set({ fuel_type: toStrOrNull(e.target.value) })}
          >
            <option value="">{t('filters.any')}</option>
            {FUEL_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className={labelCls}>{t('filters.transmission')}</div>
          <select
            className={inputCls}
            value={local.transmission || ""}
            onChange={(e) => set({ transmission: toStrOrNull(e.target.value) })}
          >
            <option value="">{t('filters.any')}</option>
            {TRANSMISSIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className={labelCls}>{t('filters.condition')}</div>
          <select
            className={inputCls}
            value={local.condition_type || ""}
            onChange={(e) =>
              set({ condition_type: toStrOrNull(e.target.value) })
            }
          >
            <option value="">{t('filters.any')}</option>
            {CONDITIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Price */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className={labelCls}>{t('filters.minPrice')}</div>
          <input
            type="number"
            inputMode="numeric"
            className={inputCls}
            value={local.min_price ?? ""}
            onChange={(e) => set({ min_price: toNumOrNull(e.target.value) })}
            placeholder="1000000"
          />
        </div>

        <div>
          <div className={labelCls}>{t('filters.maxPrice')}</div>
          <input
            type="number"
            inputMode="numeric"
            className={inputCls}
            value={local.max_price ?? ""}
            onChange={(e) => set({ max_price: toNumOrNull(e.target.value) })}
            placeholder="20000000"
          />
        </div>
      </div>

      {/* Mileage */}
      <div>
        <div className={labelCls}>{t('filters.mileageKm')}</div>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            inputMode="numeric"
            className={inputCls}
            value={local.mileage_min ?? ""}
            onChange={(e) => set({ mileage_min: toNumOrNull(e.target.value) })}
            placeholder={t('filters.min')}
          />
          <input
            type="number"
            inputMode="numeric"
            className={inputCls}
            value={local.mileage_max ?? ""}
            onChange={(e) => set({ mileage_max: toNumOrNull(e.target.value) })}
            placeholder={t('filters.max')}
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <div className={labelCls}>{t('filters.district')}</div>
        <select
          className={inputCls}
          value={local.district_id || ""}
          onChange={(e) => {
            const nextDistrict = e.target.value ? Number(e.target.value) : null;
            set({ district_id: nextDistrict, city_id: null });
          }}
        >
          <option value="">{districtsLoading ? t('filters.loading') : t('filters.all')}</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className={labelCls}>{t('filters.city')}</div>
        <select
          disabled={!canChooseCity}
          className={`${inputCls} disabled:opacity-50`}
          value={local.city_id || ""}
          onChange={(e) =>
            set({ city_id: e.target.value ? Number(e.target.value) : null })
          }
        >
          <option value="">{cityPlaceholder}</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          className="flex-1 rounded-xl py-2 font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
          onClick={handleApply}
        >
          {t('filters.apply')}
        </button>
        <button
          type="button"
          className="flex-1 rounded-xl py-2 font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
          onClick={handleClear}
        >
          {t('filters.clear')}
        </button>
      </div>
    </div>
  );
}
