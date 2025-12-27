import { useState } from "react";

export default function ListingGallery({ images }) {
  const [active, setActive] = useState(0);

  if (!images?.length) {
    return (
      <div className="aspect-[16/10] rounded-2xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        No images
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-black">
        <img
          src={images[active]}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-16 w-24 rounded-xl overflow-hidden border ${
              active === i
                ? "border-blue-600"
                : "border-gray-200 dark:border-gray-700"
            }`}
          >
            <img src={src} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
