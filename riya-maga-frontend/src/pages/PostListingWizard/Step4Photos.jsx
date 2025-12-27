import ImageUploader from "../../components/forms/ImageUploader";
import { useSellWizardStore } from "../../store/sellWizardStore";

export default function Step4Photos({ onNext, onBack }) {
  const form = useSellWizardStore((s) => s.form);
  const setField = useSellWizardStore((s) => s.setField);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Photos</h2>

      <ImageUploader
        photos={form.photos}
        onChange={(next) => setField("photos", next)}
      />

      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="flex-1 rounded-xl py-2 font-semibold border border-gray-200 dark:border-gray-700"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 rounded-xl py-2 font-semibold bg-blue-600 text-white"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
