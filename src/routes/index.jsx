import { createBrowserRouter } from "react-router-dom";
import MainLayout from "@/Layouts/MainLayout";
import { ProtectedRoutes } from "@/components/ProtectedRoutes";
import { PublicRoutes } from "@/components/PublicRoutes";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Rop from "@/pages/Rop";
import SalesManager from "@/pages/SalesManager";
import Settings from "@/pages/Settings";
import Company from "@/pages/Company";
import CompanyDetails from "@/pages/CompanyDetails";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoutes />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <Home />,
          },
          {
            path: "rop",
            element: <Rop />,
          },
          {
            path: "salesmanager",
            element: <SalesManager />,
          },
          {
            path: "settings",
            element: <Settings />,
          },
          {
            path: "company",
            element: <Company />,
          },
          {
            path: "/company/:id",
            element: <CompanyDetails />,
          },
        ],
      },
    ],
  },
  {
    path: "/",
    element: <PublicRoutes />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
    ],
  },
]);

export default router;
