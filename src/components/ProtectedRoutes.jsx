import { Navigate, Outlet } from "react-router-dom";
import { useAppStore } from "@/store/useUserStore";

export const ProtectedRoutes = () => {
  const { user } = useAppStore();

  return user ? <Outlet /> : <Navigate to="/login" />;
};
