import { useNavigate, useLocation } from "react-router-dom";

export default function MobileBottomNav() {
  const nav = useNavigate();
  const loc = useLocation();

  const tab = (path) =>
    loc.pathname === path ? "btn btn-sm btn-primary" : "btn btn-sm btn-ghost";

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        <button className={tab("/")} onClick={() => nav("/")}>Home</button>
        <button className={tab("/search")} onClick={() => nav("/search")}>Search</button>
        <button className="btn btn-sm btn-primary" onClick={() => nav("/sell")}>Sell</button>
        <button className={tab("/profile")} onClick={() => nav("/profile")}>Profile</button>
      </div>
    </div>
  );
}
