import { useTheme } from "@/hooks/useTheme";
import { Moon, Palette, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function ThemeSettings() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="border rounded-xl p-6 relative bg-card shadow-sm">
      <div className="absolute -top-3 left-4 bg-card px-2 text-sm font-semibold text-muted-foreground flex items-center gap-2">
        <Palette className="w-4 h-4" /> Mavzu
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label htmlFor="dark-mode" className="text-base font-medium">
            Tungi rejim
          </Label>
          <p className="text-sm text-muted-foreground">
            Ilova ko'rinishini qorong'u yoki yorug' rejimga o'tkazish.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Sun className="h-4 w-4 text-muted-foreground" />
          <Switch
            id="dark-mode"
            checked={isDark}
            onCheckedChange={toggleTheme}
          />
          <Moon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
