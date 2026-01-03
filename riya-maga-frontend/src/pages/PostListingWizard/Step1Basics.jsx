import { useSellWizardStore } from "../../store/sellWizardStore";

export default function Step1Basics({ onNext }) {
  const form = useSellWizardStore((s) => s.form);
  const setField = useSellWizardStore((s) => s.setField);

  const requiredOk = form.make.trim() && form.model.trim() && form.year;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Basics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <select
          className="rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
          value={form.vehicle_type}
          onChange={(e) => setField("vehicle_type", e.target.value)}
        >
          <option value="CAR">Car</option>
          <option value="VAN">Van</option>
          <option value="SUV">SUV</option>
          <option value="BIKE">Bike</option>
          <option value="TRUCK">Truck</option>
          <option value="BUS">Bus</option>
        </select>

        <select
          className="rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
          value={form.condition_type}
          onChange={(e) => setField("condition_type", e.target.value)}
        >
          <option value="USED">Used</option>
          <option value="NEW">New</option>
        </select>

        <input
          className="rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
          placeholder="Make (Toyota)"
          value={form.make}
          onChange={(e) => setField("make", e.target.value)}
        />
        <input
          className="rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
          placeholder="Model (Prius)"
          value={form.model}
          onChange={(e) => setField("model", e.target.value)}
        />

        <input
          className="rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
          placeholder="Variant (optional)"
          value={form.model_variant}
          onChange={(e) => setField("model_variant", e.target.value)}
        />

        <input
          type="number"
          className="rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
          placeholder="Year (2015)"
          value={form.year}
          onChange={(e) => setField("year", e.target.value)}
        />

        <select
          className="rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
          value={form.fuel_type}
          onChange={(e) => setField("fuel_type", e.target.value)}
        >
          <option value="PETROL">Petrol</option>
          <option value="DIESEL">Diesel</option>
          <option value="HYBRID">Hybrid</option>
          <option value="ELECTRIC">Electric</option>
        </select>

        <select
          className="rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
          value={form.transmission}
          onChange={(e) => setField("transmission", e.target.value)}
        >
          <option value="AUTO">Auto</option>
          <option value="MANUAL">Manual</option>
        </select>
      </div>

      <button
        disabled={!requiredOk}
        onClick={onNext}
        className="w-full rounded-xl py-2 font-semibold bg-blue-600 text-white disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  );
}
