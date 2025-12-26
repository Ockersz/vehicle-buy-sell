import MobileBottomNav from "../components/nav/MobileBottomNav";

export default function MobileLayout({ children }) {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="pb-20">{children}</div>
      <MobileBottomNav />
    </div>
  );
}
