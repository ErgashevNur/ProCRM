import { useEffect, useState } from "react";
import { getFormData } from "../lib/utils";
import { useCompany } from "../hooks/useCompany";
import { useUsers } from "../hooks/useUsers";
import { useAppStore } from "@/store/useUserStore";
import {
  Edit,
  PlusCircleIcon,
  Loader2,
  Search,
  SearchAlert,
  Trash,
  X,
  RefreshCcw,
  Edit2,
  PlusCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

export default function UserManagement({ type, title }) {
  const { user } = useAppStore();
  const isSuperAdmin = user?.role === "SUPERADMIN";

  const { companies, getCompanies: fetchCompanies } = useCompany();

  const {
    users: filteredUsers,
    totalCount,
    search,
    setSearch,
    loading,
    error,
    setError,
    getUsers,
    addUser,
    editUser,
    removeUser,
  } = useUsers(type, companies);

  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    user: null,
  });
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchCompanies();
    }
    getUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, isSuperAdmin]);

  function handleFormSubmit(evt, actionType) {
    evt.preventDefault();
    const form = evt.currentTarget;
    const rawData = getFormData(form);

    const targetCompanyId = isSuperAdmin
      ? Number(rawData.companyId)
      : user?.companyId || user?.campanyId;

    const result = {
      email: rawData.email,
      password: rawData.password,
      confirmPassword: rawData.confirmPassword,
      companyId: targetCompanyId ? Number(targetCompanyId) : undefined,
      permissions: ["CRM"],
    };

    if (!result.email?.trim()) {
      return toast.warning("Iltimos, email manzilini kiriting!");
    }

    if (actionType === "add") {
      if (!result.password || result.password.length < 6) {
        return toast.warning(
          "Parol juda qisqa! Kamida 6 ta belgidan iborat bo'lishi kerak."
        );
      }

      if (result.password !== result.confirmPassword) {
        return toast.warning(
          "Parollar mos kelmadi! Iltimos, qayta tekshiring."
        );
      }

      if (!result.companyId) {
        return toast.warning("Kompaniya aniqlanmadi!");
      }

      addUser(
        {
          email: result.email,
          password: result.password,
          companyId: result.companyId,
          permissions: result.permissions,
        },
        () => handleAddModal()
      );
    } else if (actionType === "edit") {
      if (!editingUser) return;
      editUser(
        editingUser.id,
        {
          email: result.email,
          permissions: result.permissions,
        },
        () => handleEditModal()
      );
    }
  }

  function handleAddModal() {
    setAddModal(!addModal);
  }
  function handleEditModal() {
    setEditModal(!editModal);
  }
  function handleDeleteClick(user) {
    setDeleteDialog({ open: true, user: user });
  }
  function handleConfirmDelete() {
    if (deleteDialog.user) {
      removeUser(deleteDialog.user.id, () => handleCancelDelete());
    }
  }
  function handleCancelDelete() {
    setDeleteDialog({ open: false, user: null });
  }
  function handleEditClick(user) {
    setEditingUser(user);
    handleEditModal();
  }

  if (loading.get) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 animate-pulse pb-2">
          ProCRM.uz
        </h1>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-screen">
        <div className="flex flex-col w-full max-w-sm text-center">
          <h3 className="text-2xl mb-3 font-medium">{error}</h3>
          <p className="text-muted-foreground mb-5">
            Xavotir olmang, bu vaqtincha nosozlik bo'lishi mumkin.
          </p>
          <Button
            onClick={() => {
              setError(null);
              getUsers();
            }}
          >
            <SearchAlert /> Qayta urinib ko'rish
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {filteredUsers.length > 0 ? (
        <section className="h-full animate-fade-in p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="font-bold text-3xl">{title}</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Jami: {totalCount} ta
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-[250px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Qidiruv..."
                  className="pl-9 pr-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button onClick={handleAddModal}>
                <PlusCircleIcon className="mr-2 h-4 w-4" /> Qo'shish
              </Button>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm text-left">
                <thead className="[&_tr]:border-b bg-muted/40">
                  <tr className="border-b transition-colors data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[60px]">
                      #
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Email
                    </th>
                    {isSuperAdmin && (
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Kompaniya
                      </th>
                    )}
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                      Amallar
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u, index) => {
                      const compId = u.companyId || u.campanyId;
                      const companyName =
                        companies.find((c) => c.id === Number(compId))?.name ||
                        "Noma'lum";
                      return (
                        <tr
                          key={u.id}
                          className="border-b transition-colors hover:bg-muted/50"
                        >
                          <td className="p-4 align-middle font-medium text-muted-foreground">
                            {index + 1}
                          </td>
                          <td className="p-4 align-middle font-medium">
                            {u.email}
                          </td>
                          {isSuperAdmin && (
                            <td className="p-4 align-middle">
                              <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                                {companyName}
                              </span>
                            </td>
                          )}
                          <td className="p-4 align-middle text-right">
                            <div className="flex justify-end gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    onClick={() => handleEditClick(u)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Tahrirlash</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDeleteClick(u)}
                                    disabled={
                                      deleteDialog.user?.id === u.id &&
                                      loading.remove
                                    }
                                  >
                                    {deleteDialog.user?.id === u.id &&
                                    loading.remove ? (
                                      <RefreshCcw className="animate-spin h-4 w-4" />
                                    ) : (
                                      <Trash className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>O'chirish</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={isSuperAdmin ? 4 : 3}
                        className="h-64 text-center align-middle"
                      >
                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground w-full h-full">
                          <p>"{search}" bo'yicha hech narsa topilmadi.</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSearch("")}
                            className="h-8 mt-1"
                          >
                            <X className="mr-2 h-3 w-3" /> Qidiruvni tozalash
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : (
        <div className="w-full h-full flex justify-center items-center min-h-screen">
          <div className="flex flex-col items-center text-center w-full max-w-sm">
            <h3 className="text-2xl mb-3 font-medium">
              Hali {title.toLowerCase()} mavjud emas!
            </h3>
            <p className="text-muted-foreground mb-5">
              Foydalanuvchi yaratishni istasangiz "Istayman" tugmasini bosing.
            </p>
            <Button onClick={handleAddModal}>Istayman</Button>
          </div>
        </div>
      )}

      <Drawer open={addModal} onOpenChange={handleAddModal}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Yangi {title.toLowerCase()} qo'shish.</DrawerTitle>
            <DrawerDescription>Ma'lumotlarni to'ldiring</DrawerDescription>
          </DrawerHeader>
          <form
            onSubmit={(e) => handleFormSubmit(e, "add")}
            className="max-w-sm w-full mx-auto flex flex-col gap-5 p-5"
          >
            <div className="grid w-full gap-3">
              <Label>Email*</Label>
              <Input type="email" name="email" placeholder="Email" required />
            </div>
            <div className="grid w-full gap-3">
              <Label>Parol*</Label>
              <Input
                type="password"
                name="password"
                placeholder="********"
                required
              />
            </div>
            <div className="grid w-full gap-3">
              <Label>Parolni tasdiqlash*</Label>
              <Input
                type="password"
                name="confirmPassword"
                placeholder="Parolni qayta kiriting"
                required
              />
            </div>

            {isSuperAdmin && (
              <div className="grid w-full gap-3">
                <Label>Kompaniya*</Label>
                <select
                  name="companyId"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                  defaultValue=""
                >
                  <option value="" disabled>
                    Kompaniyani tanlang
                  </option>
                  {companies.map((comp) => (
                    <option key={comp.id} value={comp.id}>
                      {comp.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button disabled={loading.add} type="submit">
              {loading.add ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />{" "}
                  Qo'shilmoqda...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" /> Qo'shish
                </>
              )}
            </Button>
          </form>
        </DrawerContent>
      </Drawer>

      <Drawer open={editModal} onOpenChange={handleEditModal}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              <b>{editingUser?.email}</b>ni yangilash.
            </DrawerTitle>
            <DrawerDescription>
              Faqat email manzilini o'zgartirish mumkin
            </DrawerDescription>
          </DrawerHeader>
          <form
            onSubmit={(e) => handleFormSubmit(e, "edit")}
            className="max-w-sm w-full mx-auto flex flex-col gap-5 p-5"
          >
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="email">Email*</Label>
              <Input
                type="email"
                name="email"
                defaultValue={editingUser?.email}
                placeholder="Email"
                required
              />
            </div>

            <Button disabled={loading.edit} type="submit">
              {loading.edit ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />{" "}
                  Tahrirlanmoqda...
                </>
              ) : (
                <>
                  <Edit2 className="mr-2 h-4 w-4" /> Tahrirlash
                </>
              )}
            </Button>
          </form>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={deleteDialog.open} onOpenChange={handleCancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Foydalanuvchini o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              Rostan ham <strong>{deleteDialog.user?.email}</strong> ni o'chirib
              yubormoqchimisiz? Bu amalni qaytarib bo'lmaydi!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCancelDelete}
              disabled={loading.remove}
            >
              Bekor qilish
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={loading.remove}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading.remove ? (
                <>
                  <Loader2 className="animate-spin mr-2 w-4 h-4" />
                  O'chirilmoqda...
                </>
              ) : (
                "O'chirish"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
