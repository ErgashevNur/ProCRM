import { Outlet, Link } from "react-router-dom";
import { SettingsIcon } from "lucide-react";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "../components/ui/sidebar";
import { AppSidebar } from "../components/app-sidebar";
import { buttonVariants } from "../components/ui/button";

export default function MainLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 z-50 bg-background">
          <SidebarTrigger className="-ml-1" />
          <Link
            className={buttonVariants({ size: "icon-lg", variant: "outline" })}
            to={"/settings"}
          >
            <SettingsIcon />
          </Link>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
