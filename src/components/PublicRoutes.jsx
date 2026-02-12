import { Navigate, Outlet } from "react-router-dom";
import { useAppStore } from "@/store/useUserStore";

export const PublicRoutes = () => {
  const { user } = useAppStore();

  return user ? <Navigate to="/" /> : <Outlet />;
};
