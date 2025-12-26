export default function Step2Pricing({ form, setForm }) {
  // safety so it never crashes even if props are wrong
  const f = form || {};

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body p-4 space-y-4">
        <h2 className="font-semibold text-lg">Pricing</h2>
        <div className="divider my-0" />

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-base-content/60">Price (LKR) *</label>
            <input
              className="input input-bordered w-full"
              type="number"
              inputMode="numeric"
              placeholder="e.g. 7850000"
              value={f.price_lkr ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, price_lkr: e.target.value }))
              }
            />
            <div className="text-[11px] text-base-content/50 mt-1">
              Enter the full amount (no commas).
            </div>
          </div>

          <div>
            <label className="text-xs text-base-content/60">Mileage (km)</label>
            <input
              className="input input-bordered w-full"
              type="number"
              inputMode="numeric"
              placeholder="e.g. 78000"
              value={f.mileage_km ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, mileage_km: e.target.value }))
              }
            />
            <div className="text-[11px] text-base-content/50 mt-1">
              Optional for vehicles where mileage isn’t relevant.
            </div>
          </div>

          <div>
            <label className="text-xs text-base-content/60">Fuel type</label>
            <select
              className="select select-bordered w-full"
              value={f.fuel_type ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, fuel_type: e.target.value }))
              }
            >
              <option value="">Not specified</option>
              <option value="PETROL">Petrol</option>
              <option value="DIESEL">Diesel</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ELECTRIC">Electric</option>
              <option value="CNG">CNG</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-base-content/60">Transmission</label>
            <select
              className="select select-bordered w-full"
              value={f.transmission ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, transmission: e.target.value }))
              }
            >
              <option value="">Not specified</option>
              <option value="MANUAL">Manual</option>
              <option value="AUTO">Auto</option>
              <option value="TIPTRONIC">Tiptronic</option>
              <option value="CVT">CVT</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        {/* nice preview */}
        <div className="bg-base-200 rounded-2xl p-4">
          <div className="text-xs text-base-content/60">Preview</div>
          <div className="mt-1 font-bold text-lg">
            {f.price_lkr ? `LKR ${Number(f.price_lkr).toLocaleString()}` : "LKR —"}
          </div>
          <div className="text-sm text-base-content/70 mt-1">
            {f.mileage_km
              ? `${Number(f.mileage_km).toLocaleString()} km`
              : "Mileage not specified"}
            {f.fuel_type ? ` • ${f.fuel_type}` : ""}
            {f.transmission ? ` • ${f.transmission}` : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
