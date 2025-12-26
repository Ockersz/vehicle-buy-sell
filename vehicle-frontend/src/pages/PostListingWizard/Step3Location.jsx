import { useEffect, useMemo, useState } from "react";
import { getCities, getDistricts } from "../../services/locations";

export default function Step3Location({ form, setForm }) {
  const districtId = form?.district_id ?? "";
  const cityId = form?.city_id ?? "";

  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [error, setError] = useState("");

  // Load all districts once
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingDistricts(true);
        setError("");
        const res = await getDistricts();
        if (!alive) return;
        setDistricts(res.items || []);
      } catch (e) {
        if (!alive) return;
        setError(
          e?.response?.data?.message ||
            e.message ||
            "Failed to load districts"
        );
      } finally {
        if (alive) setLoadingDistricts(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // Load cities whenever district changes
  useEffect(() => {
    let alive = true;
    if (!districtId) {
      setCities([]);
      return () => {
        alive = false;
      };
    }

    (async () => {
      try {
        setLoadingCities(true);
        setError("");
        const res = await getCities(districtId);
        if (!alive) return;
        setCities(res.items || []);
      } catch (e) {
        if (!alive) return;
        setError(
          e?.response?.data?.message || e.message || "Failed to load cities"
        );
        setCities([]);
      } finally {
        if (alive) setLoadingCities(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [districtId]);

  const setDistrict = (value) => {
    const selected = districts.find((d) => String(d.id) === String(value));
    setForm((p) => ({
      ...p,
      district_id: value,
      district: selected?.name || "",
      city_id: "",
      city: "",
    }));
  };

  const setCity = (value) => {
    const selected = cities.find((c) => String(c.id) === String(value));
    setForm((p) => ({
      ...p,
      city_id: value,
      city: selected?.name || "",
    }));
  };

  const districtName = useMemo(() => {
    if (!districtId) return form?.district || "";
    return districts.find((d) => String(d.id) === String(districtId))?.name || "";
  }, [districtId, districts, form?.district]);

  const cityName = useMemo(() => {
    if (!cityId) return form?.city || "";
    return cities.find((c) => String(c.id) === String(cityId))?.name || "";
  }, [cityId, cities, form?.city]);

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold text-lg">Location</h2>
          <span className="badge badge-outline">Required</span>
        </div>

        <div className="divider my-0" />

        {error ? (
          <div className="alert alert-error text-sm" role="alert">
            {error}
          </div>
        ) : null}

        <div className="grid md:grid-cols-2 gap-3">
          {/* District */}
          <div>
            <label className="text-xs text-base-content/60">District *</label>
            <select
              className="select select-bordered w-full"
              value={districtId}
              onChange={(e) => setDistrict(e.target.value)}
              disabled={loadingDistricts}
            >
              <option value="">{loadingDistricts ? "Loading…" : "Select district"}</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <div className="text-[11px] text-base-content/50 mt-1">
              Buyers will filter by district a lot.
            </div>
          </div>

          {/* City */}
          <div>
            <label className="text-xs text-base-content/60">City *</label>
            <select
              className="select select-bordered w-full"
              value={cityId}
              onChange={(e) => setCity(e.target.value)}
              disabled={!districtId || loadingCities}
            >
              <option value="">
                {districtId
                  ? loadingCities
                    ? "Loading…"
                    : "Select city"
                  : "Select district first"}
              </option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="text-[11px] text-base-content/50 mt-1">
              City is required to post and helps search accuracy.
            </div>
          </div>
        </div>

        {/* nice preview card */}
        <div className="bg-base-200 rounded-2xl p-4">
          <div className="text-xs text-base-content/60">Preview</div>
          <div className="mt-1 font-semibold">
            {cityName && districtName
              ? `${cityName}, ${districtName}`
              : "Location not selected"}
          </div>
        </div>
      </div>
    </div>
  );
}
