import { createBrowserRouter } from "react-router-dom";
import AppShell from "./AppShell";
import Home from "../pages/Home";
// import Search from "../pages/Search";
import ListingDetail from "../pages/ListingDetail";
import Login from "../pages/Login";
import Sell from "../pages/Sell";
import RequireAuth from "./RequireAuth";
import { Navigate } from "react-router-dom";

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/search", element: <Navigate to="/" replace /> },
      { path: "/listing/:id", element: <ListingDetail /> },
      { path: "/login", element: <Login /> },
      {
        path: "/sell",
        element: (
          <RequireAuth>
            <Sell />
          </RequireAuth>
        ),
      },
    ],
  },
]);
