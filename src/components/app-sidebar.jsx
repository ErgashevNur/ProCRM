import { Link, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/store/useUserStore";
import { menuItems } from "../lib/menu-list";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "./ui/sidebar";
import { Button, buttonVariants } from "./ui/button";
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
import { useState } from "react";

export function AppSidebar({ ...props }) {
  const { user, setUser } = useAppStore();
  const currentPath = useLocation().pathname;
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  function handleLogout() {
    setUser(null);
    toast.info("Siz tizimdan chiqdingiz!");
    setShowLogoutDialog(false);
  }

  const userRole = user?.role || "";

  const typedMenuItems = menuItems;

  const links =
    userRole && typedMenuItems[userRole] ? typedMenuItems[userRole] : [];

  return (
    <>
      <Sidebar {...props}>
        <SidebarHeader>
          <Link className="inline-flex items-center gap-3" to={"/"}>
            <img
              className="w-10 h-10 object-contain rounded shadow"
              src="/logo.png"
              alt="Logo"
            />
            <strong className="font-medium">{user?.role}</strong>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <div className="h-full p-2 flex flex-col">
            {links.map(({ url, text, icon }, index) => {
              return (
                <Link
                  className={`${buttonVariants({
                    variant: "ghost",
                    size: "lg",
                  })} justify-start ${
                    url === currentPath
                      ? "bg-neutral-200 text-accent-foreground dark:bg-neutral-200/10"
                      : ""
                  }`}
                  key={index}
                  to={url}
                >
                  {icon}
                  {text}
                </Link>
              );
            })}
            <Button
              onClick={() => setShowLogoutDialog(true)}
              className="w-full mt-auto cursor-pointer hover:bg-red-800 hover:text-white duration-300"
              variant="outline"
            >
              <LogOut /> Chiqish
            </Button>
          </div>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tizimdan chiqish</AlertDialogTitle>
            <AlertDialogDescription>
              Tizimdan chiqmoqchimisiz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>
              Chiqish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
