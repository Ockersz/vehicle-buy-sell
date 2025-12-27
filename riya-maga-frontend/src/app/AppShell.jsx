import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import FloatingSearchButton from "../components/ui/FloatingSearchButton";

export default function AppShell() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header />
      <div className="lg:hidden h-5" />
      <main className="max-w-7xl mx-auto px-4 py-4">
        <Outlet />
      </main>
    </div>
  );
}
