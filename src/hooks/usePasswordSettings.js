import { useState, useCallback } from "react";
import { useAppStore } from "@/store/useUserStore";
import { toast } from "sonner";

function validate(data) {
  if (!data.oldPassword?.trim()) {
    toast.info("Eski parolni kiriting!");
    return { isValid: false, field: "oldPassword" };
  }
  if (!data.newPassword?.trim()) {
    toast.info("Yangi parolni kiriting!");
    return { isValid: false, field: "newPassword" };
  }
  if (data.newPassword.length < 6) {
    toast.warning("Yangi parol kamida 6 ta belgidan iborat bo'lsin!");
    return { isValid: false, field: "newPassword" };
  }
  return { isValid: true };
}

export function usePasswordSettings() {
  const { user } = useAppStore();
  const token = localStorage.getItem("accessToken");

  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const updatePassword = useCallback(
    async (data) => {
      if (!token) return;

      setLoading(true);
      try {
        const req = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/v1/auth/reset-password`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ ...data, email: user?.email }),
          }
        );

        if (req.status === 201) {
          setModalOpen(false);
          toast.success("Parolingiz muvaffaqiyatli yangilandi!");
        } else if (req.status === 400) {
          toast.warning("Parol juda qisqa!");
        } else if (req.status === 404) {
          toast.error("Amaldagi parolingiz noto'g'ri!");
        } else {
          toast.error("Xatolik yuz berdi!");
        }
      } catch {
        toast.error("Server bilan aloqa yo'q!");
      } finally {
        setLoading(false);
      }
    },
    [token, user?.email]
  );

  return {
    loading,
    modalOpen,
    setModalOpen,
    updatePassword,
    validate,
  };
}
