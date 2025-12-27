import { useSellWizardStore } from "../../store/sellWizardStore";

export default function Step2Pricing({ onNext, onBack }) {
  const form = useSellWizardStore((s) => s.form);
  const setField = useSellWizardStore((s) => s.setField);

  const ok = form.price_lkr && form.mileage_km;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Pricing</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="number"
          className="rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
          placeholder="Price (LKR)"
          value={form.price_lkr}
          onChange={(e) => setField("price_lkr", e.target.value)}
        />
        <input
          type="number"
          className="rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
          placeholder="Mileage (km)"
          value={form.mileage_km}
          onChange={(e) => setField("mileage_km", e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="flex-1 rounded-xl py-2 font-semibold border border-gray-200 dark:border-gray-700"
        >
          Back
        </button>
        <button
          disabled={!ok}
          onClick={onNext}
          className="flex-1 rounded-xl py-2 font-semibold bg-blue-600 text-white disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
