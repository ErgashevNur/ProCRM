import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCompany } from "../hooks/useCompany";
import { getFormData } from "../lib/utils";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Edit,
  Loader2,
  Phone,
  Power,
  ShieldCheck,
  Trash2,
  User,
  FileText,
  AlertCircle,
  UploadCloud,
  X,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Drawer,
  DrawerContent,
  DrawerClose,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const formatDate = (dateString) => {
  if (!dateString) return "Ma'lumot yo'q";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Ma'lumot yo'q";

  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export default function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCompany, deleteCompany, toggleStatus, editCompany } = useCompany();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [statusOpen, setStatusOpen] = useState(false);
  const [isStatusChanging, setIsStatusChanging] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isImageDeleted, setIsImageDeleted] = useState(false);

  const fetchCompany = useCallback(
    async (showLoading = true) => {
      if (!id) {
        setLoading(false);
        return;
      }

      if (showLoading) setLoading(true);
      setError(null);

      try {
        const data = await getCompany(id);
        if (data) {
          setCompany(data);
        } else {
          setCompany(null);
        }
      } catch (err) {
        console.error(err);
        setError("Tarmoq xatoligi");
      } finally {
        setLoading(false);
      }
    },
    [id, getCompany]
  );

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const refetchData = async () => {
    if (!id) return;
    try {
      const data = await getCompany(id);
      if (data) {
        setCompany((prev) => (prev ? { ...prev, ...data } : data));
      }
    } catch (e) {
      console.error("Refetch error", e);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    await deleteCompany(id);
    setIsDeleting(false);
    navigate("/company");
  };

  const handleStatusConfirm = async () => {
    if (!id) return;
    setIsStatusChanging(true);
    await toggleStatus(id);
    setCompany((prev) => (prev ? { ...prev, status: !prev.status } : null));
    setIsStatusChanging(false);
    setStatusOpen(false);
    toast.success("Status muvaffaqiyatli o'zgartirildi!");
  };

  const handleOpenEdit = () => {
    if (!company) return;
    if (company.logo) {
      setImagePreview(
        `${import.meta.env.VITE_BASE_URL}/api/v1/${company.logo}`
      );
    } else {
      setImagePreview(null);
    }
    setSelectedFile(null);
    setIsImageDeleted(false);
    setEditOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Rasm hajmi 2MB dan oshmasligi kerak");
        return;
      }
      setSelectedFile(file);
      setIsImageDeleted(false);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    setIsImageDeleted(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!id) return;

    const form = e.currentTarget;
    const rawData = getFormData(form);

    const descriptionValue =
      rawData.description?.trim() || "Ma'lumot mavjud emas";

    const formData = {
      name: rawData.name,
      managerName: rawData.managerName,
      phoneNumber: rawData.phoneNumber,
      description: descriptionValue,
      logo: undefined,
    };

    if (selectedFile) {
      formData.logo = selectedFile;
    } else if (isImageDeleted) {
      formData.logo = null;
    }

    if (
      !formData.name?.trim() ||
      !formData.managerName?.trim() ||
      !formData.phoneNumber?.trim()
    ) {
      toast.warning("Majburiy maydonlarni to'ldiring!");
      return;
    }

    setIsEditLoading(true);
    await editCompany(id, formData, async () => {
      await refetchData();
      setEditOpen(false);
    });
    setIsEditLoading(false);
  };

  if (loading) {
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

  if (error && !company) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground gap-6 px-4 text-center">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
          <WifiOff className="w-10 h-10 text-destructive" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">Aloqa yo'q</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Server bilan bog'lanishda xatolik yuz berdi. Internet aloqasini
            tekshiring.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/company")}
          >
            Orqaga
          </Button>
          <Button type="button" onClick={() => fetchCompany(true)}>
            Qayta urinish
          </Button>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground gap-4">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">Ma'lumot topilmadi</h2>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/company")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Ro'yxatga qaytish
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-20">
      <div className="bg-card border-b border-border sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            className="gap-2 hover:bg-muted"
            onClick={() => navigate("/company")}
          >
            <ArrowLeft className="w-5 h-5" /> Orqaga
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
              ID: {company.id}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-card rounded-3xl p-8 shadow-sm border border-border flex flex-col lg:flex-row items-start lg:items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-muted/50 via-muted/20 to-transparent rounded-bl-[100px] -mr-20 -mt-20 pointer-events-none"></div>

          <div className="relative z-10 group">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-3xl overflow-hidden transition-transform group-hover:scale-105 duration-500 bg-muted/20 flex items-center justify-center">
              {company.logo ? (
                <img
                  src={`${import.meta.env.VITE_BASE_URL}/api/v1/${
                    company.logo
                  }`}
                  alt={company.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-16 h-16 text-muted-foreground/50" />
              )}
            </div>
          </div>

          <div className="flex-1 relative z-10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {company.name}
              </h1>
              <Badge
                className={`w-fit px-3 py-1 text-sm border-0 ${
                  company.status
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {company.status ? "Faoliyatda" : "To'xtatilgan"}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="font-medium text-foreground">
                  {company.managerName}
                </span>
              </div>
              <div className="hidden sm:block w-1 h-1 bg-border rounded-full"></div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span className="font-mono text-foreground">
                  {company.phoneNumber}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                type="button"
                onClick={() => setStatusOpen(true)}
                variant="outline"
                className={`h-11 px-6 rounded-xl border-border shadow-sm ${
                  company.status
                    ? "text-destructive hover:text-destructive hover:bg-destructive/10"
                    : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                <Power className="w-4 h-4 mr-2" />
                {company.status ? "Faoliyatni to'xtatish" : "Faollashtirish"}
              </Button>

              <Button
                type="button"
                onClick={handleOpenEdit}
                className="h-11 px-6 rounded-xl shadow-lg"
              >
                <Edit className="w-4 h-4 mr-2" /> Tahrirlash
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
                className="h-11 px-6 rounded-xl shadow-none"
              >
                <Trash2 className="w-4 h-4 mr-2" /> O'chirish
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="space-y-6">
            <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
              <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" /> Tizim
                ma'lumotlari
              </h3>
              <div className="space-y-4">
                <div className="group p-4 bg-muted/50 hover:bg-muted transition-colors rounded-2xl border border-border">
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">
                    Ro'yxatga olingan
                  </p>
                  <div className="flex items-center gap-2 text-foreground">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">
                      {formatDate(company.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-card rounded-3xl p-8 shadow-sm border border-border h-full">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-500" /> Kompaniya
                haqida
              </h3>

              <div className="prose dark:prose-invert max-w-none">
                {company.description ? (
                  <p className="text-muted-foreground leading-8 text-lg">
                    {company.description}
                  </p>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border">
                    <FileText className="w-10 h-10 mb-2 opacity-20" />
                    <p>Ma'lumot mavjud emas</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Drawer open={editOpen} onOpenChange={setEditOpen}>
        <DrawerContent className="max-h-[95vh] flex flex-col bg-background border-border">
          <div className="mx-auto w-full max-w-3xl flex flex-col h-full overflow-hidden">
            <div className="flex-none flex items-center justify-between px-6 py-4 border-b border-border bg-card">
              <DrawerClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" /> Bekor qilish
                </Button>
              </DrawerClose>
              <DrawerTitle className="font-bold text-lg">
                Tahrirlash
              </DrawerTitle>
            </div>

            <DrawerDescription className="sr-only">
              Kompaniya ma'lumotlarini o'zgartirish
            </DrawerDescription>

            <form
              id="edit-form"
              onSubmit={handleEditSubmit}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto px-6 py-6 bg-background">
                <div className="flex flex-col-reverse md:flex-row gap-6">
                  <div className="w-full md:w-auto flex flex-col items-center">
                    <div className="relative w-full h-24 md:w-48 md:h-48 bg-muted/50 rounded-xl overflow-hidden flex flex-col items-center justify-center border-2 border-dashed border-border cursor-pointer hover:bg-muted hover:border-emerald-500 transition-all flex-shrink-0">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-muted-foreground/50 flex flex-col items-center">
                          <UploadCloud className="w-8 h-8 mb-2" />
                          <span className="text-xs font-medium">
                            Rasm yuklash
                          </span>
                        </div>
                      )}

                      {imagePreview && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleRemoveImage();
                          }}
                          className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-full hover:bg-destructive/90 transition-colors z-10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}

                      <input
                        type="file"
                        name="logo"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleImageChange}
                      />
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-foreground">
                          Kompaniya nomi{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          name="name"
                          defaultValue={company.name}
                          className="h-10 bg-background border-border focus:border-emerald-500 focus:ring-emerald-500/20"
                          placeholder="Nomini kiriting"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-foreground">
                          Boshqaruvchi{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          name="managerName"
                          defaultValue={company.managerName}
                          className="h-10 bg-background border-border focus:border-emerald-500 focus:ring-emerald-500/20"
                          placeholder="Ism Familiya"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-foreground">
                        Telefon raqami{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        name="phoneNumber"
                        defaultValue={company.phoneNumber}
                        className="h-10 bg-background border-border focus:border-emerald-500 focus:ring-emerald-500/20 font-mono"
                        placeholder="+998 90 123 45 67"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-foreground">
                        Izoh
                      </Label>
                      <Textarea
                        name="description"
                        defaultValue={company.description}
                        className="min-h-[100px] resize-none bg-background border-border focus:border-emerald-500 focus:ring-emerald-500/20"
                        placeholder="Qo'shimcha ma'lumotlar..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-none p-4 border-t border-border flex justify-end gap-3 bg-card">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                  className="flex-1 md:flex-none"
                >
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  disabled={isEditLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 md:flex-none"
                >
                  {isEditLoading && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}{" "}
                  Saqlash
                </Button>
              </div>
            </form>
          </div>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">
              Kompaniyani o'chirish
            </AlertDialogTitle>
            <AlertDialogDescription>
              Siz haqiqatan ham <strong>"{company.name}"</strong> kompaniyasini
              o'chirmoqchimisiz? <br />
              <span className="text-destructive mt-2 block font-medium">
                Bu amalni ortga qaytarib bo'lmaydi va barcha bog'liq ma'lumotlar
                o'chib ketadi.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl h-11">
              Bekor qilish
            </AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl h-11 px-6 shadow-lg"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={statusOpen} onOpenChange={setStatusOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">
              {company.status ? "Faoliyatni to'xtatish" : "Faollashtirish"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Siz haqiqatan ham <strong>"{company.name}"</strong> kompaniyasi
              statusini o'zgartirmoqchimisiz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl h-11">
              Bekor qilish
            </AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={handleStatusConfirm}
              className={`text-white rounded-xl h-11 px-6 shadow-lg ${
                company.status
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
              disabled={isStatusChanging}
            >
              {isStatusChanging ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : company.status ? (
                "To'xtatish"
              ) : (
                "Faollashtirish"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
