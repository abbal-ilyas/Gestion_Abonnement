"use client";

import { useEffect } from "react";

export function ThemeBoot() {
  useEffect(() => {
    const mode = localStorage.getItem("app_mode") || "dark";
    document.documentElement.setAttribute("data-theme", mode);
  }, []);

  return null;
}
