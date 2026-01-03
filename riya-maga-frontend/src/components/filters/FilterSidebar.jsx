import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDistricts, fetchCitiesByDistrict } from "../../services/locations";

const VEHICLE_TYPES = ["CAR", "VAN", "SUV", "BIKE", "TRUCK", "BUS"];

export default function FilterSidebar({ value, onChange, onApply, onClear }) {
  const [local, setLocal] = useState(value);

  useEffect(() => setLocal(value), [value]);

  const { data: distData } = useQuery({
    queryKey: ["districts"],
    queryFn: fetchDistricts,
  });

  const districtId = local.district_id || null;

  const { data: cityData, isFetching: citiesLoading } = useQuery({
    queryKey: ["cities", districtId],
    queryFn: () => fetchCitiesByDistrict(districtId),
    enabled: Boolean(districtId),
  });

  const districts = distData?.items || [];
  const cities = cityData?.items || [];

  const set = (patch) => setLocal((s) => ({ ...s, ...patch, page: 1 }));

  const canChooseCity = Boolean(districtId);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-semibold mb-1">Vehicle Type</div>
        <select
          className="w-full rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
          value={local.vehicle_type || ""}
          onChange={(e) => set({ vehicle_type: e.target.value || null })}
        >
          <option value="">All</option>
          {VEHICLE_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div>
          <div className="text-sm font-semibold mb-1">Make</div>
          <input
            className="w-full rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
            value={local.make || ""}
            onChange={(e) => set({ make: e.target.value || null })}
            placeholder="Toyota"
          />
        </div>

        <div>
          <div className="text-sm font-semibold mb-1">Model</div>
          <input
            className="w-full rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
            value={local.model || ""}
            onChange={(e) => set({ model: e.target.value || null })}
            placeholder="Prius"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-sm font-semibold mb-1">Min Price</div>
          <input
            type="number"
            className="w-full rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
            value={local.min_price ?? ""}
            onChange={(e) => set({ min_price: e.target.value ? Number(e.target.value) : null })}
            placeholder="1000000"
          />
        </div>
        <div>
          <div className="text-sm font-semibold mb-1">Max Price</div>
          <input
            type="number"
            className="w-full rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
            value={local.max_price ?? ""}
            onChange={(e) => set({ max_price: e.target.value ? Number(e.target.value) : null })}
            placeholder="20000000"
          />
        </div>
      </div>

      <div>
        <div className="text-sm font-semibold mb-1">District</div>
        <select
          className="w-full rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
          value={local.district_id || ""}
          onChange={(e) => {
            const nextDistrict = e.target.value ? Number(e.target.value) : null;
            set({ district_id: nextDistrict, city_id: null });
          }}
        >
          <option value="">All</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      <div>
        <div className="text-sm font-semibold mb-1">City</div>
        <select
          disabled={!canChooseCity}
          className="w-full rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 disabled:opacity-50"
          value={local.city_id || ""}
          onChange={(e) => set({ city_id: e.target.value ? Number(e.target.value) : null })}
        >
          <option value="">{citiesLoading ? "Loading..." : "All"}</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button
          className="flex-1 rounded-xl py-2 font-semibold bg-blue-600 text-white"
          onClick={() => {
            onChange(local);
            onApply?.(local);
          }}
        >
          Apply
        </button>
        <button
          className="flex-1 rounded-xl py-2 font-semibold border border-gray-200 dark:border-gray-700"
          onClick={() => {
            const cleared = {
              ...local,
              vehicle_type: null,
              make: null,
              model: null,
              min_price: null,
              max_price: null,
              district_id: null,
              city_id: null,
              page: 1,
            };
            setLocal(cleared);
            onClear?.(cleared);
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
