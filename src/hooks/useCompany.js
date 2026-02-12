import { useState, useCallback } from "react";
import { toast } from "sonner";

function getErrorMessage(error) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }
  return "Noma'lum xatolik yuz berdi";
}

function parseListResponse(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (typeof data === "object" && data !== null) {
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.content)) return data.content;
  }

  return [];
}

export function useCompany() {
  const token = localStorage.getItem("accessToken");

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API = {
    getAll: (search) => {
      const params = new URLSearchParams({ page: "1", limit: "1000" });
      if (search) params.append("companyName", search);
      return `/api/v1/company/all?${params.toString()}`;
    },
    getOne: (id) => `/api/v1/company/one/${id}`,
    create: "/api/v1/company",
    update: (id) => `/api/v1/company/${id}`,
    delete: (id) => `/api/v1/company/delete/${id}`,
    status: (id) => `/api/v1/company/status/${id}`,
  };

  const makeRequest = async (url, options = {}) => {
    if (!token) throw new Error("Tizimga kiring");

    const response = await fetch(import.meta.env.VITE_BASE_URL + url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      toast.error("Sessiya tugadi. Qaytadan kiring");
      throw new Error("Avtorizatsiya xatosi");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Xatolik: ${response.status}`);
    }

    return response;
  };

  const createFormData = (data) => {
    const formData = new FormData();

    if (data.name) formData.append("name", data.name);
    if (data.managerName) formData.append("managerName", data.managerName);
    if (data.phoneNumber) formData.append("phoneNumber", data.phoneNumber);
    if (data.description !== undefined)
      formData.append("description", data.description);

    formData.append("permissions", "CRM");

    if (data.logo instanceof File) {
      formData.append("logo", data.logo);
    } else if (data.logo === null) {
      formData.append("logo", "");
    }

    return formData;
  };

  const getCompanies = useCallback(
    async (search = "") => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const response = await makeRequest(API.getAll(search));
        const responseData = await response.json();
        const items = parseListResponse(responseData);
        setCompanies(items);
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        if (message !== "Tizimga kiring") toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [token]
  );

  const getCompany = useCallback(
    async (id) => {
      if (!token) return null;
      setLoading(true);
      setError(null);
      try {
        const response = await makeRequest(API.getOne(id));
        const json = await response.json();
        return json.data || json;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        toast.error(message || "Ma'lumotlarni olishda xatolik");
        return null;
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [token]
  );

  const addCompany = async (data, onSuccess) => {
    setLoading(true);
    try {
      await makeRequest(API.create, {
        method: "POST",
        body: createFormData(data),
      });
      toast.success("Kompaniya muvaffaqiyatli qo'shildi!");
      onSuccess?.();
      await getCompanies();
    } catch (err) {
      toast.error(getErrorMessage(err) || "Qo'shishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const editCompany = async (id, data, onSuccess) => {
    setLoading(true);
    try {
      await makeRequest(API.update(id), {
        method: "PATCH",
        body: createFormData(data),
      });

      toast.success("Ma'lumot yangilandi!");
      onSuccess?.();
      await getCompanies();
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err) || "Tahrirlashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const deleteCompany = async (id) => {
    const previousCompanies = [...companies];
    setCompanies((prev) => prev.filter((c) => c.id !== id));
    try {
      await makeRequest(API.delete(id), { method: "DELETE" });
      toast.success("Kompaniya o'chirildi!");
    } catch (err) {
      setCompanies(previousCompanies);
      toast.error(getErrorMessage(err) || "O'chirishda xatolik");
    }
  };

  const toggleStatus = async (id) => {
    const previousCompanies = [...companies];
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: !c.status } : c))
    );
    try {
      await makeRequest(API.status(id), { method: "PATCH" });
      toast.success("Status o'zgartirildi!");
    } catch (err) {
      setCompanies(previousCompanies);
      toast.error(getErrorMessage(err) || "Xatolik yuz berdi");
    }
  };

  return {
    companies,
    loading,
    error,
    getCompanies,
    getCompany,
    addCompany,
    editCompany,
    deleteCompany,
    toggleStatus,
  };
}
