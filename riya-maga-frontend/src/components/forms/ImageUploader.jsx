export default function ImageUploader({ photos, onChange }) {
  const addFiles = (files) => {
    const next = [...photos];

    for (const f of files) {
      if (!f.type.startsWith("image/")) continue;
      const previewUrl = URL.createObjectURL(f);
      next.push({ file: f, previewUrl });
    }

    onChange(next.slice(0, 10)); // max 10
  };

  const remove = (idx) => {
    const next = photos.slice();
    const [removed] = next.splice(idx, 1);
    if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          addFiles(Array.from(e.target.files || []));
          e.target.value = "";
        }}
      />

      {photos.length === 0 && (
        <div className="text-sm opacity-70">
          Add 1–10 photos. (Uploads come next.)
        </div>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {photos.map((p, idx) => (
          <div
            key={idx}
            className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <img
              src={p.previewUrl}
              alt=""
              className="w-full h-24 object-cover"
            />
            <button
              onClick={() => remove(idx)}
              className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded-lg"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
