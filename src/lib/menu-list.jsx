import { HomeIcon, User, Building2, Users } from "lucide-react";

export const menuItems = {
  SUPERADMIN: [
    { url: "/", text: "Bosh sahifa", icon: <HomeIcon /> },
    { url: "/company", text: "Kompaniyalar", icon: <Building2 /> },
    { url: "/rop", text: "Boshqaruvchilar", icon: <User /> },
    { url: "/salesmanager", text: "Sotuv operatorlari", icon: <User /> },
  ],
  ROP: [
    { url: "/", text: "Bosh sahifa", icon: <HomeIcon /> },
    { url: "/salesmanager", text: "Sotuv operatorlari", icon: <User /> },
  ],
  SALESMANAGER: [{ url: "/", text: "Bosh sahifa", icon: <HomeIcon /> }],
};
