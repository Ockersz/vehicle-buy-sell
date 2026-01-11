// src/utils/activeFilterChips.js
import { useMemo } from "react";

const OMIT_KEYS = new Set(["page", "page_size", "sort"]);

const LABELS = {
  make: "Make",
  model: "Model",
  model_variant: "Variant",
  year: "Year",
  year_min: "Year",
  year_max: "Year",
  price_min: "Price",
  price_max: "Price",
  mileage_min: "Mileage",
  mileage_max: "Mileage",
  fuel_type: "Fuel",
  transmission: "Gear",
  condition_type: "Condition",
  vehicle_type: "Type",
  district_id: "District",
  city_id: "City",
  keyword: "Keyword",
  q: "Keyword",
  with_photos: "Photos",
  verified: "Verified",
};

function fmtMoneyLkr(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return `Rs. ${n.toLocaleString()}`;
}

function fmtKm(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return `${n.toLocaleString()} km`;
}

function isEmptyValue(v) {
  if (v == null) return true;
  if (typeof v === "string" && v.trim() === "") return true;
  if (Array.isArray(v) && v.length === 0) return true;
  return false;
}

// Each chip: { id, label, clear(filters) => nextFilters }
export function buildActiveFilterChips(filters) {
  const chips = [];
  const used = new Set();

  const add = (id, label, clear) => {
    if (!label) return;
    chips.push({ id, label, clear });
  };

  // Group common min/max ranges into one chip
  const RANGE_GROUPS = [
    { min: "price_min", max: "price_max", fmt: fmtMoneyLkr },
    { min: "year_min", max: "year_max", fmt: (v) => String(v) },
    { min: "mileage_min", max: "mileage_max", fmt: fmtKm },
  ];

  for (const g of RANGE_GROUPS) {
    const minV = filters?.[g.min];
    const maxV = filters?.[g.max];

    if (isEmptyValue(minV) && isEmptyValue(maxV)) continue;

    const labelBase = LABELS[g.min] || LABELS[g.max] || "Range";
    const left = !isEmptyValue(minV) ? g.fmt(minV) : null;
    const right = !isEmptyValue(maxV) ? g.fmt(maxV) : null;

    const label =
      left && right
        ? `${labelBase}: ${left} – ${right}`
        : `${labelBase}: ${left || right}`;

    add(`range:${g.min}:${g.max}`, label, (f) => {
      const next = { ...f, page: 1 };
      delete next[g.min];
      delete next[g.max];
      return next;
    });

    used.add(g.min);
    used.add(g.max);
  }

  // Remaining keys -> individual chips
  for (const [key, raw] of Object.entries(filters || {})) {
    if (OMIT_KEYS.has(key) || used.has(key)) continue;
    if (isEmptyValue(raw)) continue;

    const labelBase = LABELS[key] || key.replaceAll("_", " ");

    let valueLabel = "";
    if (typeof raw === "boolean") valueLabel = raw ? "Yes" : "No";
    else if (Array.isArray(raw)) valueLabel = raw.join(", ");
    else if (key.includes("price")) valueLabel = fmtMoneyLkr(raw);
    else if (key.includes("mileage")) valueLabel = fmtKm(raw);
    else valueLabel = String(raw);

    add(`kv:${key}`, `${labelBase}: ${valueLabel}`, (f) => {
      const next = { ...f, page: 1 };
      delete next[key];
      return next;
    });
  }

  return chips;
}

export function clearAllFiltersKeepBasics(filters) {
  // Keep sort + page_size so UX feels stable, reset page.
  return { page: 1, page_size: filters?.page_size, sort: filters?.sort };
}

export function ActiveFiltersBar({
  filters,
  onClearOne,
  onClearAll,
  className = "",
}) {
  const chips = useMemo(() => buildActiveFilterChips(filters), [filters]);

  if (chips.length === 0) return null;

  return (
    <div className={className}>
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onClearOne(c)}
            className="shrink-0 inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 px-3 py-1 text-xs hover:bg-blue-100 dark:hover:bg-blue-950/70 transition"
            title="Remove this filter"
          >
            <span className="whitespace-nowrap">{c.label}</span>
            <span className="opacity-70">×</span>
          </button>
        ))}

        <button
          type="button"
          onClick={onClearAll}
          className="shrink-0 inline-flex items-center gap-2 rounded-full border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-1 text-xs hover:bg-gray-200 dark:hover:bg-gray-800 transition"
          title="Clear all filters"
        >
          Clear all
        </button>
      </div>
    </div>
  );
}
