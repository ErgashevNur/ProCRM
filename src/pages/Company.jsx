import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCompany } from "../hooks/useCompany";
import { getFormData } from "../lib/utils";
import {
  PlusCircle,
  Search,
  Building2,
  Loader2,
  UploadCloud,
  ArrowLeft,
  X,
  ChevronRight,
  AlertCircle,
  FolderPlus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerClose,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

const DEBOUNCE_DELAY = 500;

export default function Company() {
  const navigate = useNavigate();
  const { companies, loading, error, getCompanies, addCompany } = useCompany();

  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      getCompanies(search);
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(timeout);
  }, [search, getCompanies]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleOpenAdd = () => {
    setImagePreview(null);
    setSelectedFile(null);
    setIsOpen(true);
  };

  const handleCardClick = (id) => {
    navigate(`/company/${id}`);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Rasm hajmi 2MB dan oshmasligi kerak");
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const rawData = getFormData(form);

    const descriptionValue =
      rawData.description?.trim() || "Ma'lumot mavjud emas";

    if (
      !rawData.name?.trim() ||
      !rawData.managerName?.trim() ||
      !rawData.phoneNumber?.trim()
    ) {
      toast.warning("Majburiy maydonlarni to'ldiring!");
      return;
    }

    const formData = {
      name: rawData.name,
      managerName: rawData.managerName,
      phoneNumber: rawData.phoneNumber,
      description: descriptionValue,
      logo: selectedFile || null,
    };

    addCompany(formData, () => setIsOpen(false));
  };

  const clearSearch = () => {
    setSearch("");
  };

  return (
    <div className="flex flex-col h-full bg-background font-sans relative transition-colors duration-300">
      <div className="bg-card border-b border-border sticky top-0 z-10 w-full">
        <div className="px-5 py-4 max-w-[1600px] mx-auto w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md shadow-emerald-500/20">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-2xl text-foreground tracking-tight">
                    Kompaniyalar
                  </h1>
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  Jami: {companies.length} ta
                </p>
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-72 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  placeholder="Qidiruv..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-9 bg-muted/50 border-border focus:bg-background transition-all"
                />
                {search && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button onClick={handleOpenAdd} className="h-9 px-6">
                <PlusCircle className="h-5 w-5 mr-2" /> Qo'shish
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-[1600px] mx-auto p-6 relative min-h-[calc(100vh-80px)]">
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-30">
            <div className="flex flex-col items-center justify-center text-center p-6 bg-card rounded-3xl shadow-sm border border-border max-w-sm">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Xatolik yuz berdi
              </h3>
              <p className="text-muted-foreground mb-6 text-sm">
                {error === "Failed to fetch"
                  ? "Server bilan aloqa yo'q. Iltimos, internetni tekshiring yoki birozdan so'ng urinib ko'ring."
                  : error}
              </p>
              <Button
                onClick={() => getCompanies(search)}
                variant="outline"
                className="w-full"
              >
                Qayta urinish
              </Button>
            </div>
          </div>
        )}

        {loading && !companies.length && !error && (
          <div className="min-h-[400px] w-full flex flex-col items-center justify-center bg-background">
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
        )}

        {!loading && !error && companies.length === 0 ? (
          search ? (
            <div className="h-full flex flex-col justify-center items-center text-center border-2 border-dashed border-border rounded-3xl bg-muted/20 min-h-[400px]">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                "{search}" bo'yicha hech narsa topilmadi
              </h3>
              <Button onClick={clearSearch} variant="outline">
                Qidiruvni tozalash
              </Button>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center border-2 border-dashed border-border rounded-3xl bg-muted/20 min-h-[400px]">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                <FolderPlus className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Hali kompaniyalar mavjud emas
              </h3>
              <p className="text-muted-foreground mb-6 text-sm max-w-xs">
                Yangi kompaniya qo'shishni xohlaysizmi? "Istayman" tugmasini
                bosing.
              </p>
              <Button
                onClick={handleOpenAdd}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
              >
                Istayman
              </Button>
            </div>
          )
        ) : (
          !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 pb-6">
              {companies.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleCardClick(item.id)}
                  className="group bg-card rounded-2xl p-4 shadow-sm border border-border hover:border-emerald-500/50 hover:shadow-md cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm border border-border">
                      {item.logo ? (
                        <img
                          src={`${import.meta.env.VITE_BASE_URL}/api/v1/${
                            item.logo
                          }`}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                      ) : (
                        <Building2 className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-bold text-base text-foreground truncate group-hover:text-emerald-600 transition-colors">
                        {item.name}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {item.managerName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium border-0 ${
                        item.status
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-500/20"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {item.status ? "Faol" : "Nofaol"}
                    </Badge>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="max-h-[95vh] flex flex-col bg-background border-border">
          <div className="mx-auto w-full max-w-3xl flex flex-col h-full overflow-hidden">
            <div className="flex-none flex items-center justify-between px-6 py-4 border-b border-border bg-card">
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" /> Orqaga
                </Button>
              </DrawerClose>
              <DrawerTitle className="font-bold text-lg text-foreground">
                Yangi kompaniya
              </DrawerTitle>
            </div>

            <DrawerDescription className="sr-only">
              Yangi kompaniya qo'shish formasi
            </DrawerDescription>

            <form
              id="add-form"
              key={isOpen ? "open" : "closed"}
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto px-6 py-6 bg-background">
                <div className="flex flex-col-reverse md:flex-row gap-6">
                  <div className="w-full md:w-auto flex flex-col items-center">
                    <div className="relative w-full h-32 md:w-64 md:h-48 bg-muted/50 rounded-xl overflow-hidden flex flex-col items-center justify-center border-2 border-dashed border-neutral-400 cursor-pointer hover:border-emerald-500 hover:bg-muted transition-all flex-shrink-0">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-muted-foreground/50 flex flex-col items-center p-4 text-center">
                          <UploadCloud className="w-10 h-10 mb-2" />
                          <span className="text-sm font-medium">
                            Logo yuklash
                          </span>
                          <span className="text-xs text-muted-foreground mt-1">
                            (Max: 2MB)
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
                          className="h-10 bg-background border-border"
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
                          className="h-10 bg-background border-border"
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
                        className="h-10 bg-background border-border font-mono"
                        placeholder="+998 90 123 45 67"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-foreground">
                        Izoh
                      </Label>
                      <textarea
                        name="description"
                        className="flex min-h-[120px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus:border-emerald-500 focus:ring-emerald-500/30 resize-none"
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
                  onClick={() => setIsOpen(false)}
                  className="flex-1 md:flex-none"
                >
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 md:flex-none"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{" "}
                  Saqlash
                </Button>
              </div>
            </form>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
