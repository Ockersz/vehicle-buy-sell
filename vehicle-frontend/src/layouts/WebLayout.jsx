import WebNavbar from "../components/nav/WebNavbar";

export default function WebLayout({ children }) {
  return (
    <div className="min-h-screen bg-base-200">
      <WebNavbar />
      <div className="max-w-6xl mx-auto p-4">{children}</div>
    </div>
  );
}
