import { usePasswordSettings } from "@/hooks/usePasswordSettings";
import { getFormData } from "@/lib/utils";
import { GlobeLockIcon, KeyRound, RefreshCcw, Save } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PasswordSettings() {
  const {
    loading: passwordLoading,
    modalOpen: passwordModalOpen,
    setModalOpen: setPasswordModalOpen,
    updatePassword,
    validate,
  } = usePasswordSettings();

  function handlePasswordSubmit(evt) {
    evt.preventDefault();
    const form = evt.currentTarget;
    const rawData = getFormData(form);
    const result = rawData;

    const check = validate(result);

    if (!check.isValid && check.field) {
      const input = form.elements.namedItem(check.field);
      if (input) {
        input.focus();
      }
      return;
    }
    updatePassword(result);
  }

  return (
    <>
      <div className="border rounded-xl p-6 relative bg-card shadow-sm">
        <div className="absolute -top-3 left-4 bg-card px-2 text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <GlobeLockIcon className="w-4 h-4" /> Xavfsizlik
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-medium">Parolni o'zgartirish</h3>
            <p className="text-sm text-muted-foreground">
              Xavfsizlik uchun parolingizni vaqti-vaqti bilan yangilab turing.
            </p>
          </div>

          <Button onClick={() => setPasswordModalOpen(true)} variant="outline">
            <KeyRound className="mr-2 h-4 w-4" /> Yangilash
          </Button>
        </div>
      </div>

      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Parolni yangilash</DialogTitle>
            <DialogDescription>
              Eski parolingizni tasdiqlang va yangi parol o'rnating.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handlePasswordSubmit}
            className="flex flex-col gap-4 mt-2"
          >
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Amaldagi parol</Label>
              <Input
                id="oldPassword"
                name="oldPassword"
                type="password"
                placeholder="********"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Yangi parol</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="********"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                disabled={passwordLoading}
                type="submit"
                className="w-full"
              >
                {passwordLoading ? (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                    Yangilanmoqda...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Saqlash
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
