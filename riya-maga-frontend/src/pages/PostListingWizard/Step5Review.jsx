import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createListing } from "../../services/listings";
import { useSellWizardStore } from "../../store/sellWizardStore";
import { presignOne, uploadToPresignedUrl } from "../../services/uploads.service";

export default function Step5Review({ onBack }) {
  const form = useSellWizardStore((s) => s.form);
  const reset = useSellWizardStore((s) => s.reset);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const selectedCount = form?.photos?.length || 0;

  const preview = useMemo(() => {
    const year = Number(form.year);
    return {
      make: (form.make || "").trim(),
      model: (form.model || "").trim(),
      model_variant: (form.model_variant || "").trim() || null,
      year,
      price_lkr: Number(form.price_lkr),
      mileage_km:
        form.mileage_km === "" || form.mileage_km == null
          ? null
          : Number(form.mileage_km),
      district_id: Number(form.district_id),
      city_id: Number(form.city_id),
    };
  }, [form]);

  const submit = async () => {
    setErr("");
    setLoading(true);

    try {
      // ---- required selects ----
      if (
        !form.vehicle_type ||
        !form.condition_type ||
        !form.fuel_type ||
        !form.transmission
      ) {
        throw new Error("Please complete all required selections.");
      }

      // ---- year validation ----
      const year = Number(form.year);
      if (!Number.isInteger(year) || year < 1950 || year > 2100) {
        throw new Error("Year must be between 1950 and 2100.");
      }

      // ---- photos validation ----
      const photoItems = (form.photos || []).filter(Boolean).slice(0, 10);

      if (!photoItems.length) {
        throw new Error("Please add at least one photo.");
      }

      // IMPORTANT: your uploader stores { file, previewUrl }
      const files = photoItems.map((p) => p?.file).filter(Boolean);

      if (!files.length) {
        throw new Error("Selected photos are missing file data.");
      }

      // Backend allowlist matches: jpeg/png/webp
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      for (const f of files) {
        if (!(f instanceof File)) {
          throw new Error("Invalid photo file detected. Please reselect photos.");
        }
        if (!allowed.includes(f.type)) {
          throw new Error("Only JPG, PNG, and WebP images are allowed.");
        }
      }

      // ---- upload first ----
      const uploadedPublicUrls = [];
      for (const file of files) {
        const presign = await presignOne(file); // sends file.name + file.type
        await uploadToPresignedUrl(presign.upload_url, file);
        uploadedPublicUrls.push(presign.public_url);
      }

      // ---- create listing with urls ----
      const payload = {
        vehicle_type: form.vehicle_type,
        make: (form.make || "").trim(),
        model: (form.model || "").trim(),
        model_variant: (form.model_variant || "").trim() || null,
        year,

        condition_type: form.condition_type,

        price_lkr: Number(form.price_lkr),
        mileage_km:
          form.mileage_km === "" || form.mileage_km == null
            ? null
            : Number(form.mileage_km),

        fuel_type: form.fuel_type,
        transmission: form.transmission,

        district_id: Number(form.district_id),
        city_id: Number(form.city_id),

        title: (form.title || "").trim() || null,
        description: (form.description || "").trim() || null,

        images: uploadedPublicUrls.map((url, idx) => ({
          url,
          sort_order: idx,
        })),
      };

      const res = await createListing(payload);
      const id = res?.listing?.id || res?.id || res?.item?.id;

      reset();
      navigate(id ? `/listing/${id}` : "/search");
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Create listing failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Review</h2>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-2 text-sm">
        <div>
          <b>Vehicle:</b> {preview.make} {preview.model}{" "}
          {preview.model_variant || ""}
        </div>
        <div>
          <b>Year:</b> {preview.year}
        </div>
        <div>
          <b>Price:</b>{" "}
          {Number.isFinite(preview.price_lkr)
            ? `${preview.price_lkr.toLocaleString()} LKR`
            : "-"}
        </div>
        <div>
          <b>Mileage:</b>{" "}
          {preview.mileage_km == null ? "-" : `${preview.mileage_km.toLocaleString()} km`}
        </div>
        <div>
          <b>Location:</b> District {preview.district_id}, City {preview.city_id}
        </div>
        <div>
          <b>Photos selected:</b> {selectedCount}
        </div>
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
