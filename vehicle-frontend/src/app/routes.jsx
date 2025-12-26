import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Search from "../pages/Search";
import ListingDetail from "../pages/ListingDetail";
import Sell from "../pages/Sell";
import Profile from "../pages/Profile";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<Search />} />
      <Route path="/listings/:id" element={<ListingDetail />} />
      <Route path="/sell" element={<Sell />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
