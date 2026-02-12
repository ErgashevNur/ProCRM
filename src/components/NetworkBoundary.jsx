import Offline from "@/pages/Offline";
import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";

function NetworkBoundary({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Internet aloqasi tiklandi!");
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("Internet aloqasi uzildi!");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            width: "auto",
          },
        }}
      />
      {!isOnline && <Offline />}
    </>
  );
}

export default NetworkBoundary;
