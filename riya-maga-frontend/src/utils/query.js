export function parseSearchParams(searchParams) {
  const getInt = (k) => {
    const v = searchParams.get(k);
    if (v === null || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const getStr = (k) => {
    const v = searchParams.get(k);
    return v === null || v === "" ? null : v;
  };

  return {
    page: getInt("page") || 1,
    page_size: getInt("page_size") || 20,
    sort: getStr("sort") || "LATEST",
    vehicle_type: getStr("vehicle_type"),
    make: getStr("make"),
    model: getStr("model"),
    min_price: getInt("min_price"),
    max_price: getInt("max_price"),
    district_id: getInt("district_id"),
    city_id: getInt("city_id"),
  };
}

export function toSearchParamsObj(filters) {
  const obj = {};
  for (const [k, v] of Object.entries(filters)) {
    if (v === null || v === undefined || v === "") continue;
    obj[k] = String(v);
  }
  return obj;
}
