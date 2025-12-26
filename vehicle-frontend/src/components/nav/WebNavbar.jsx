import { useNavigate, useLocation } from "react-router-dom";

export default function WebNavbar() {
  const nav = useNavigate();
  const loc = useLocation();

  const active = (path) =>
    loc.pathname === path ? "btn btn-sm btn-primary" : "btn btn-sm btn-ghost";

  return (
    <div className="navbar bg-base-100 border-b border-base-300">
      <div className="max-w-6xl mx-auto w-full px-4 flex justify-between">
        <button
          className="flex items-center gap-3"
          onClick={() => nav("/")}
        >
          <div className="text-xl font-bold">RiyaMaga</div>
          <span className="badge badge-outline">Sri Lanka</span>
        </button>

        <div className="flex gap-2">
          <button className={active("/search")} onClick={() => nav("/search")}>
            Browse
          </button>
          <button className={active("/sell")} onClick={() => nav("/sell")}>
            Sell
          </button>
          <button className={active("/profile")} onClick={() => nav("/profile")}>
            Profile
          </button>
        </div>
      </div>
    </div>
  );
}
