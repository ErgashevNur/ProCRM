import ThemeSettings from "@/components/settings/ThemeSettings";
import PasswordSettings from "@/components/settings/PasswordSettings";

export default function Settings() {
  return (
    <section className="h-full animate-fade-in max-w-4xl mx-auto p-4 space-y-6">
      <h2 className="mb-8 font-bold text-3xl tracking-tight">Sozlamalar</h2>

      <div className="grid gap-6">
        <ThemeSettings />
        <PasswordSettings />
      </div>
    </section>
  );
}
