export default function SpecGrid({ item }) {
  const Row = ({ label, value }) =>
    value ? (
      <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
        <span className="opacity-70">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
    ) : null;

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <h3 className="font-semibold mb-2">Specifications</h3>
      <Row label="Year" value={item.year} />
      <Row label="Mileage" value={item.mileageKm && `${item.mileageKm.toLocaleString()} km`} />
      <Row label="Fuel" value={item.fuel} />
      <Row label="Transmission" value={item.transmission} />
      <Row label="Condition" value={item.condition} />
      <Row label="Location" value={[item.city, item.district].filter(Boolean).join(", ")} />
    </div>
  );
}
