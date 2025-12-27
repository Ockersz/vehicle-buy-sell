import { useQuery } from "@tanstack/react-query";
import { fetchDistricts, fetchCitiesByDistrict } from "../../services/locations";
import { useSellWizardStore } from "../../store/sellWizardStore";

export default function Step3Location({ onNext, onBack }) {
  const form = useSellWizardStore((s) => s.form);
  const setForm = useSellWizardStore((s) => s.setForm);

  const districtId = form.district_id ? Number(form.district_id) : null;

  const { data: distData } = useQuery({
    queryKey: ["districts"],
    queryFn: fetchDistricts,
  });

  const { data: cityData, isFetching } = useQuery({
    queryKey: ["cities", districtId],
    queryFn: () => fetchCitiesByDistrict(districtId),
    enabled: Boolean(districtId),
  });

  const districts = distData?.items || [];
  const cities = cityData?.items || [];

  const ok = form.district_id && form.city_id;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Location</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <select
          className="rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
          value={form.district_id}
          onChange={(e) => setForm({ district_id: e.target.value, city_id: "" })}
        >
          <option value="">Select District</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <select
          disabled={!districtId}
          className="rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 disabled:opacity-50"
          value={form.city_id}
          onChange={(e) => setForm({ city_id: e.target.value })}
        >
          <option value="">{isFetching ? "Loading..." : "Select City"}</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
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
