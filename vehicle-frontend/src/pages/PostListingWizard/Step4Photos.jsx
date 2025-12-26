import { useMemo, useRef } from "react";

const MAX = 10;

export default function Step4Photos({ form, setForm }) {
  const inputRef = useRef(null);

  const images = useMemo(() => form?.images || [], [form]);

  const canAddMore = images.length < MAX;

  const openPicker = () => inputRef.current?.click();

  const onPickFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = MAX - images.length;
    const slice = files.slice(0, remaining);

    const newItems = await Promise.all(slice.map(fileToPreviewItem));

    setForm((p) => ({
      ...p,
      images: [...(p.images || []), ...newItems],
    }));

    // allow re-pick same file
    e.target.value = "";
  };

  const removeAt = (idx) => {
    setForm((p) => {
      const next = [...(p.images || [])];
      next.splice(idx, 1);
      return { ...p, images: next };
    });
  };

  const move = (from, dir) => {
    setForm((p) => {
      const arr = [...(p.images || [])];
      const to = from + dir;
      if (to < 0 || to >= arr.length) return p;
      const tmp = arr[from];
      arr[from] = arr[to];
      arr[to] = tmp;
      return { ...p, images: arr };
    });
  };

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold text-lg">Photos</h2>
          <span className="badge badge-outline">
            {images.length}/{MAX}
          </span>
        </div>

        <div className="divider my-0" />

        {/* Add photos */}
        <div className="bg-base-200 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div>
            <div className="font-semibold">Add photos</div>
            <div className="text-xs text-base-content/60">
              Upload 1–10 images. First image becomes the cover.
            </div>
          </div>

          <button
            className={`btn rounded-xl ${
              canAddMore ? "btn-primary" : "btn-disabled"
            }`}
            onClick={openPicker}
            disabled={!canAddMore}
          >
            + Add
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onPickFiles}
          />
        </div>

        {/* Grid */}
        {images.length === 0 ? (
          <div className="text-sm text-base-content/60">
            No photos yet. Add at least 1 photo to continue.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div
                key={img.id}
                className="relative rounded-2xl overflow-hidden border border-base-300 bg-base-200"
              >
                <img
                  src={img.previewUrl}
                  alt=""
                  className="w-full h-36 object-cover"
                  loading="lazy"
                />

                {/* Cover badge */}
                {idx === 0 && (
                  <div className="absolute top-2 left-2 badge badge-primary">
                    Cover
                  </div>
                )}

                {/* Actions */}
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  {/* gradient backdrop */}
                  <div className="rounded-2xl bg-gradient-to-t from-black/70 via-black/30 to-transparent p-2 flex items-center gap-2">
                    <button
                       className="btn btn-sm btn-circle bg-white hover:bg-white border-0 shadow text-black"
                      onClick={() => move(idx, -1)}
                      disabled={idx === 0}
                      title="Move left"
                      aria-label="Move left"
                    >
                      <ArrowLeftIcon />
                    </button>

                    <button
                      className="btn btn-sm btn-circle bg-white hover:bg-white border-0 shadow text-black"
                      onClick={() => move(idx, +1)}
                      disabled={idx === images.length - 1}
                      title="Move right"
                      aria-label="Move right"
                    >
                      <ArrowRightIcon />
                    </button>

                    <div className="flex-1" />

                    <button
                      className="btn btn-sm btn-circle bg-error text-error-content hover:bg-error/90 border-0 shadow"
                      onClick={() => removeAt(idx)}
                      title="Remove"
                      aria-label="Remove"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-base-content/50">
          Tip: Use clear exterior shots + dashboard + interior + engine bay.
        </div>
      </div>
    </div>
  );
}

/** Converts a file to a preview item we can store in form.images */
function fileToPreviewItem(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        id: crypto.randomUUID?.() || String(Date.now() + Math.random()),
        file,
        previewUrl: reader.result,
      });
    };
    reader.readAsDataURL(file);
  });
}

function ArrowLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 6L9 12L15 18"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 6L15 12L9 18"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M6 6L18 18"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
