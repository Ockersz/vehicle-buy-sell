export default function SortSelect({ value, onChange }) {
  return (
    <select
      className="rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="LATEST">Latest</option>
      <option value="PRICE_LOW">Price: Low → High</option>
      <option value="PRICE_HIGH">Price: High → Low</option>
    </select>
  );
}
