import { useState, useEffect, useMemo, useCallback } from "react";
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
  const token = localStorage.getItem("accessToken") || user?.accessToken;

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

  const getUsers = useCallback(async () => {
    if (!token) {
      setLoading((prev) => ({ ...prev, get: false }));
      return;
    }

    setLoading((prev) => ({ ...prev, get: true }));

    let fetchUrl = import.meta.env.VITE_BASE_URL + config.read;

    if (type === "sales-manager") {
      const userRole = user?.role?.toUpperCase();
      const adminBaseUrl = `${
        import.meta.env.VITE_BASE_URL
      }/api/v1/user/admin/all/sales-manager`;

      if (userRole === "SUPERADMIN") {
        fetchUrl = `${adminBaseUrl}/0`;
      } else if (userRole === "ROP") {
        const compId = user?.companyId || user?.campanyId;
        if (compId) {
          fetchUrl = `${adminBaseUrl}/${compId}`;
        }
      }
    }

    try {
      const req = await fetch(fetchUrl, {
        headers: { Authorization: "Bearer " + token },
      });

      if (req.ok) {
        const data = await req.json();
        const list = data.safeUsers || data.users || data.data || [];
        setUsers(list);
      } else {
        setError("Ma'lumotlarni yuklashda xatolik! Sahifani yangilang.");
      }
    } catch (err) {
      console.error(err);
      setError("Server bilan aloqa yo'q.");
    } finally {
      setLoading((prev) => ({ ...prev, get: false }));
    }
  }, [type, user, token, config.read]);

  const addUser = useCallback(
    async (data, onSuccess) => {
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
          if (onSuccess) onSuccess();
        } else {
          const err = await req.json().catch(() => ({}));

          if (req.status === 409) {
            toast.error("Bu email allaqachon mavjud!");
          } else if (req.status === 400) {
            toast.error(
              `Xato ma'lumot: ${err.message || "Maydonlarni tekshiring."}`
            );
          } else if (req.status === 403) {
            toast.error("Sizda ruxsat yo'q!");
          } else {
            toast.error(
              `Xatolik yuz berdi (Kod: ${req.status}). ${err.message || ""}`
            );
          }
        }
      } catch (e) {
        console.error(e);
        toast.error("Serverga ulanib bo'lmadi!");
      } finally {
        setLoading((prev) => ({ ...prev, add: false }));
      }
    },
    [token, config.create, config.nameKey]
  );

  const editUser = useCallback(
    async (id, data, onSuccess) => {
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

        if (req.status === 200 || req.status === 201) {
          const response = await req.json();
          const updatedUser =
            response[config.nameKey] || response.data || response;

          const finalUser = updatedUser?.id ? updatedUser : { id, ...data };

          setUsers((prev) =>
            prev.map((u) => (u.id === id ? { ...u, ...finalUser } : u))
          );
          toast.success(`Ma'lumotlar yangilandi!`);
          if (onSuccess) onSuccess();
        } else {
          const err = await req.json().catch(() => ({}));
          if (req.status === 409) {
            toast.error("Bu email band!");
          } else if (req.status === 404) {
            toast.error("Foydalanuvchi topilmadi!");
          } else {
            toast.error(`Tahrirlashda xatolik: ${err.message || req.status}`);
          }
        }
      } catch (e) {
        console.error(e);
        toast.error("Server bilan aloqa yo'q.");
      } finally {
        setLoading((prev) => ({ ...prev, edit: false }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [token, config.update, config.nameKey]
  );

  const removeUser = useCallback(
    async (id, onSuccess) => {
      setLoading((prev) => ({ ...prev, remove: true }));
      try {
        const req = await fetch(
          import.meta.env.VITE_BASE_URL + config.delete(id),
          {
            method: "DELETE",
            headers: { Authorization: "Bearer " + token },
          }
        );

        if (req.ok) {
          setUsers((prev) => prev.filter((u) => u.id !== id));
          toast.success(`Foydalanuvchi o'chirildi!`);
          if (onSuccess) onSuccess();
        } else {
          const err = await req.json().catch(() => ({}));
          if (req.status === 500) {
            toast.error(
              "O'chirib bo'lmadi! Bu xodimga mijozlar biriktirilgan bo'lishi mumkin."
            );
          } else if (req.status === 403) {
            toast.error("Sizda o'chirish huquqi yo'q!");
          } else {
            toast.error(`Xatolik: ${err.message || req.status}`);
          }
        }
      } catch (e) {
        console.error(e);
        toast.error("Server bilan aloqa yo'q.");
      } finally {
        setLoading((prev) => ({ ...prev, remove: false }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [token, config.delete]
  );

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const lowerSearch = debouncedSearch.toLowerCase();
      const emailMatch = u.email?.toLowerCase().includes(lowerSearch);

      let companyMatch = false;
      if (companies && companies.length > 0) {
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
