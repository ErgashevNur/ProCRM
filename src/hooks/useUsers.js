import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/store/useUserStore";
import { toast } from "sonner";

const API_CONFIG = {
  rop: {
    create: "/api/v1/user/rop",
    read: "/api/v1/user/all/rop",
    update: (id) => `/api/v1/user/update-rop/${id}`,
    delete: (id) => `/api/v1/user/remove-rop/${id}`,
    nameKey: "safeRop",
  },
  "sales-manager": {
    create: "/api/v1/user/sales-manager",
    read: "/api/v1/user/all/sales-manager",
    update: (id) => `/api/v1/user/update-sales-manager/${id}`,
    delete: (id) => `/api/v1/user/remove-sales-maneger/${id}`,
    nameKey: "safeSalesManager",
  },
};

export function useUsers(type, companies) {
  const config = API_CONFIG[type];
  const { user } = useAppStore();
  const token = localStorage.getItem("accessToken");

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [error, setError] = useState(null);

  const [loading, setLoading] = useState({
    get: false,
    add: false,
    edit: false,
    remove: false,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const getUsers = async () => {
    setLoading((prev) => ({ ...prev, get: true }));
    let fetchUrl = import.meta.env.VITE_BASE_URL + config.read;

    const userRole = user?.role?.toUpperCase();

    if (userRole === "SUPERADMIN" && type === "sales-manager") {
      fetchUrl = `${
        import.meta.env.VITE_BASE_URL
      }/api/v1/user/admin/all/sales-manager/0`;
    }

    try {
      const req = await fetch(fetchUrl, {
        headers: { Authorization: "Bearer " + token },
      });

      if (req.status === 200) {
        const data = await req.json();
        const list = data.safeUsers || data.users || data.data || [];
        setUsers(list);
      } else {
        setError(
          "⚠️ Ma'lumotlarni yuklashda xatolik! Iltimos, sahifani yangilang 🔄"
        );
      }
    } catch {
      setError(
        "⚠️ Server bilan aloqa yo'q. Internetni tekshiring, muammo davom etsa adminga murojaat qiling."
      );
    }
    setLoading((prev) => ({ ...prev, get: false }));
  };

  const addUser = async (data, onSuccess) => {
    setLoading((prev) => ({ ...prev, add: true }));
    const payload = { ...data, permissions: ["CRM"] };

    try {
      const req = await fetch(import.meta.env.VITE_BASE_URL + config.create, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
      });

      if (req.status === 201 || req.status === 200) {
        const response = await req.json();
        const newUser = response[config.nameKey] || response.data || response;

        if (!newUser.companyId && !newUser.campanyId && data.companyId) {
          newUser.companyId = data.companyId;
        }

        setUsers((prev) => [newUser, ...prev]);
        toast.success(`${newUser.email} muvaffaqiyatli qo'shildi!`);
        onSuccess();
      } else {
        const err = await req.json().catch(() => ({}));
        if (req.status === 409) {
          toast.error(
            "Ushbu email manzili allaqachon ro'yxatdan o'tgan! Boshqa email ishlating."
          );
        } else if (req.status === 400) {
          toast.error(
            `Ma'lumotlar noto'g'ri kiritildi: ${
              err.message || "Tekshirib qaytadan urinib ko'ring."
            }`
          );
        } else if (req.status === 403) {
          toast.error("Sizda foydalanuvchi qo'shish huquqi yo'q!");
        } else {
          toast.error(
            `Xatolik yuz berdi! (Kod: ${req.status}). ${err.message || ""}`
          );
        }
      }
    } catch {
      toast.error("⚠️ Server bilan aloqa yo'q. Internetni tekshiring!");
    }
    setLoading((prev) => ({ ...prev, add: false }));
  };

  const editUser = async (id, data, onSuccess) => {
    setLoading((prev) => ({ ...prev, edit: true }));
    try {
      const req = await fetch(
        import.meta.env.VITE_BASE_URL + config.update(id),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(data),
        }
      );

      if (req.status === 200) {
        const response = await req.json();
        const updatedUser =
          response[config.nameKey] || response.data || response;
        const finalUser = updatedUser?.id ? updatedUser : { id, ...data };

        setUsers((prev) => prev.map((u) => (u.id === id ? finalUser : u)));
        toast.success(`Ma'lumotlar muvaffaqiyatli yangilandi!`);
        onSuccess();
      } else {
        const err = await req.json().catch(() => ({}));
        if (req.status === 409) {
          toast.error("Bu email band qilingan! Boshqa email kiriting.");
        } else if (req.status === 404) {
          toast.error("Foydalanuvchi topilmadi!");
        } else if (req.status === 403) {
          toast.error("Sizda tahrirlash huquqi yo'q!");
        } else {
          toast.error(
            `Tahrirlashda xatolik! (Kod: ${req.status}) ${err.message || ""}`
          );
        }
      }
    } catch {
      toast.error("Server bilan aloqa yo'q. Internetni tekshiring!");
    }
    setLoading((prev) => ({ ...prev, edit: false }));
  };

  const removeUser = async (id, onSuccess) => {
    setLoading((prev) => ({ ...prev, remove: true }));
    try {
      const req = await fetch(
        import.meta.env.VITE_BASE_URL + config.delete(id),
        {
          method: "DELETE",
          headers: { Authorization: "Bearer " + token },
        }
      );

      if (req.status === 200 || req.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        toast.success(`Foydalanuvchi muvaffaqiyatli o'chirildi!`);
        onSuccess();
      } else {
        const err = await req.json().catch(() => ({}));
        if (req.status === 500) {
          toast.error(
            "O'chirib bo'lmadi! Ushbu foydalanuvchiga mijozlar yoki savdolar biriktirilgan bo'lishi mumkin. Avval ularni boshqa xodimga o'tkazing."
          );
        } else if (req.status === 403) {
          toast.error(
            "Sizda ushbu foydalanuvchini o'chirish huquqi mavjud emas!"
          );
        } else if (req.status === 404) {
          toast.error("Foydalanuvchi tizimda topilmadi (404).");
        } else {
          toast.error(
            `O'chirishda kutilmagan xatolik! (Kod: ${req.status}) ${
              err.message || ""
            }`
          );
        }
      }
    } catch {
      toast.error("Server bilan aloqa yo'q. Internetni tekshiring!");
    }
    setLoading((prev) => ({ ...prev, remove: false }));
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const lowerSearch = debouncedSearch.toLowerCase();
      const emailMatch = u.email?.toLowerCase().includes(lowerSearch);
      let companyMatch = false;

      if (companies.length > 0) {
        const compId = u.companyId || u.campanyId;
        const company = companies.find((c) => c.id === Number(compId));
        if (company) {
          companyMatch = company.name.toLowerCase().includes(lowerSearch);
        }
      }
      return emailMatch || companyMatch;
    });
  }, [users, debouncedSearch, companies]);

  return {
    users: filteredUsers,
    totalCount: users.length,
    search,
    setSearch,
    loading,
    error,
    setError,
    getUsers,
    addUser,
    editUser,
    removeUser,
  };
}
