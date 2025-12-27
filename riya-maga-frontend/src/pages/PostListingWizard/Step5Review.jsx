import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createListing } from "../../services/listings";
import { useSellWizardStore } from "../../store/sellWizardStore";

export default function Step5Review({ onBack }) {
  const form = useSellWizardStore((s) => s.form);
  const reset = useSellWizardStore((s) => s.reset);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const payload = {
    vehicle_type: form.vehicle_type,
    make: form.make.trim(),
    model: form.model.trim(),
    model_variant: form.model_variant.trim() || null,
    year: Number(form.year),
    condition_type: form.condition_type,
    fuel_type: form.fuel_type,
    transmission: form.transmission,
    price_lkr: Number(form.price_lkr),
    mileage_km: Number(form.mileage_km),
    district_id: Number(form.district_id),
    city_id: Number(form.city_id),
    title: form.title?.trim() || null,
    description: form.description?.trim() || null,
    // Photos handled in next phase
  };

  const submit = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await createListing(payload);
      const id = res?.listing?.id || res?.id || res?.item?.id;
      reset();
      if (id) navigate(`/listing/${id}`);
      else navigate(`/search`);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Create listing failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Review</h2>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-2 text-sm">
        <div><b>Vehicle:</b> {payload.make} {payload.model} {payload.model_variant || ""}</div>
        <div><b>Year:</b> {payload.year}</div>
        <div><b>Price:</b> {payload.price_lkr.toLocaleString()} LKR</div>
        <div><b>Mileage:</b> {payload.mileage_km.toLocaleString()} km</div>
        <div><b>Location:</b> District {payload.district_id}, City {payload.city_id}</div>
        <div><b>Photos selected:</b> {form.photos.length}</div>
      </div>

      {err && <div className="text-sm text-red-500">{err}</div>}

      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="flex-1 rounded-xl py-2 font-semibold border border-gray-200 dark:border-gray-700"
        >
          Back
        </button>
        <button
          disabled={loading}
          onClick={submit}
          className="flex-1 rounded-xl py-2 font-semibold bg-blue-600 text-white disabled:opacity-50"
        >
          {loading ? "Posting…" : "Post Listing"}
        </button>
      </div>
    </div>
  );
}
