import { useState } from "react";
import { useAppStore } from "@/store/useUserStore";
import { getFormData } from "@/lib/utils";
import { RefreshCw, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function Login() {
  const { setUser } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function login(userData) {
    setLoading(true);

    try {
      const req = await fetch(
        import.meta.env.VITE_BASE_URL + "/api/v1/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      if (req.status === 201) {
        const res = await req.json();
        setUser(res.user);
        toast.success("Tizimga muvaffaqiyatli kirdingiz!", {
          description: "Xush kelibsiz, ishlarni davom ettirishingiz mumkin.",
        });
      } else if (req.status === 404 || req.status === 400) {
        const errorData = await req.json().catch(() => ({}));
        if (errorData?.message?.includes("not active")) {
          toast.error(
            "Sizning hisobingiz nofaol holatda! Tizimga kirish uchun Adminga murojaat qiling."
          );
        } else {
          toast.error("Kirishda xatolik yuz berdi!", {
            description:
              "Kiritilgan email yoki parol noto'g'ri. Iltimos, tekshirib qaytadan urinib ko'ring.",
          });
        }
      } else {
        toast.error("Tizimda xatolik!", {
          description:
            "Kutilmagan xatolik yuz berdi. Iltimos, birozdan so'ng qayta urinib ko'ring.",
        });
      }
    } catch (e) {
      console.log(e);
      toast.error("Server bilan aloqa yo'q!", {
        description:
          "Internet aloqasini tekshiring yoki tizim administratoriga murojaat qiling.",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(evt) {
    evt.preventDefault();
    const form = evt.currentTarget;
    const rawData = getFormData(form);
    const userData = rawData;

    if (!userData.email || userData.email.trim() === "") {
      toast.info("Email kiritilmadi!", {
        description: "Iltimos, davom etish uchun email manzilingizni kiriting.",
      });
      form.elements.namedItem("email")?.focus();
    } else if (!userData.password || userData.password.trim() === "") {
      toast.info("Parol kiritilmadi!", {
        description: "Iltimos, xavfsizlik uchun parolingizni kiriting.",
      });
      form.elements.namedItem("password")?.focus();
    } else {
      login(userData);
    }
  }

  return (
    <section className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <Card className="w-full shadow-lg border-border bg-card text-card-foreground">
          <CardHeader className="space-y-3 pb-5 text-center">
            <div className="flex justify-center">
              <img
                src="/logo.png"
                alt="ProCRM Logo"
                className="w-24 h-24 object-contain"
              />
            </div>
            <CardTitle className="text-2xl font-extrabold text-foreground">
              ProCRM Admin Panel
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              ProCRM loyihasining admin paneliga xush kelibsiz!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-5">
              <div className="grid gap-2">
                <Label
                  htmlFor="email"
                  className="text-foreground text-sm font-semibold"
                >
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@prohome.uz"
                    defaultValue="superAdmin@gmail.com"
                    className="pl-10 h-11 bg-background border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label
                  htmlFor="password"
                  className="text-foreground text-sm font-semibold"
                >
                  Parol
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    placeholder="********"
                    type={showPassword ? "text" : "password"}
                    defaultValue="superAdmin123"
                    className="pl-10 pr-10 h-11 bg-background border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2 pt-4">
            <Button
              disabled={loading}
              type="submit"
              className="w-full h-11 font-semibold text-base shadow-sm transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Kirilmoqda...
                </>
              ) : (
                "Kirish"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </section>
  );
}
