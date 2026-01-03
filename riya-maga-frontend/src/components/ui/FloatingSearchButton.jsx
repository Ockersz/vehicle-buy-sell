import { useNavigate } from "react-router-dom";

export default function FloatingSearchButton() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate("/search")}
      aria-label="Search vehicles"
      className="
        fixed z-50 right-4 bottom-4
        md:right-6 md:bottom-6
        rounded-full shadow-lg
        bg-blue-600 text-white
        px-4 py-3
        font-semibold
        hover:opacity-95 active:scale-95
        transition
        flex items-center gap-2
      "
      style={{
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
      }}
    >
      {/* icon */}
      <span className="text-lg">🔎</span>
      <span className="hidden sm:inline">Search</span>
    </button>
  );
}
