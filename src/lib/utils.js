import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getFormData(form) {
  const formData = new FormData(form);
  const data = {};

  formData.forEach((value, key) => {
    if (typeof value === "string") {
      data[key] = value;
    }
  });

  return data;
}
