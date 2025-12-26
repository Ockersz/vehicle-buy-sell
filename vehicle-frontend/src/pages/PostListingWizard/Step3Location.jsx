import { useMemo } from "react";

/**
 * For now mock it.
 * Later replace with API:
 *  - GET /locations/districts
 *  - GET /locations/cities?district_id=...
 */
const DISTRICTS = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Galle",
  "Matara",
  "Kurunegala",
  "Puttalam",
];

const CITIES_BY_DISTRICT = {
  Colombo: ["Colombo", "Dehiwala-Mount Lavinia", "Maharagama", "Kotte", "Moratuwa", "Nugegoda", "Piliyandala"],
  Gampaha: ["Gampaha", "Negombo", "Wattala", "Ja-Ela", "Kadawatha", "Kelaniya", "Minuwangoda"],
  Kalutara: ["Kalutara", "Panadura", "Horana", "Aluthgama", "Beruwala"],
  Kandy: ["Kandy", "Peradeniya", "Katugastota", "Gampola", "Nawalapitiya"],
  Galle: ["Galle", "Hikkaduwa", "Ambalangoda", "Elpitiya"],
  Matara: ["Matara", "Weligama", "Akuressa"],
  Kurunegala: ["Kurunegala", "Kuliyapitiya", "Narammala", "Mawathagama", "Pannala"],
  Puttalam: ["Puttalam", "Chilaw", "Wennappuwa"],
};

export default function Step3Location({ form, setForm }) {
  const district = form?.district || "";
  const city = form?.city || "";

  const cities = useMemo(() => {
    if (!district) return [];
    return CITIES_BY_DISTRICT[district] || [];
  }, [district]);

  const setDistrict = (value) => {
    setForm((p) => ({
      ...p,
      district: value,
      city: "", // reset city when district changes
    }));
  };

  const setCity = (value) => {
    setForm((p) => ({ ...p, city: value }));
  };

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold text-lg">Location</h2>
          <span className="badge badge-outline">Required</span>
        </div>

        <div className="divider my-0" />

        <div className="grid md:grid-cols-2 gap-3">
          {/* District */}
          <div>
            <label className="text-xs text-base-content/60">District *</label>
            <select
              className="select select-bordered w-full"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            >
              <option value="">Select district</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
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
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={!district}
            >
              <option value="">
                {district ? "Select city" : "Select district first"}
              </option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
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
            {city && district ? `${city}, ${district}` : "Location not selected"}
          </div>
        </div>
      </div>
    </div>
  );
}
