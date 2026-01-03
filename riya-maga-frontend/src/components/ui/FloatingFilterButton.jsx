export default function FloatingFilterButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Filters"
      className="
        fixed z-50 right-4 bottom-4 md:right-6 md:bottom-6
        rounded-full shadow-lg
        bg-blue-600 text-white
        px-4 py-3 font-semibold
        hover:opacity-95 active:scale-95 transition
        flex items-center gap-2
      "
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
    >
      <span className="text-lg">⚙️</span>
      <span className="hidden sm:inline">Filters</span>
    </button>
  );
}
