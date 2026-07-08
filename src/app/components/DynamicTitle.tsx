"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function DynamicTitle() {
  const pathname = usePathname();
  const cachedName = useRef("NextStore");

  const setFavicon = (logoUrl: string) => {
    if (!logoUrl) return;
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = logoUrl;
  };

  const apply = () => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((data) => {
        const name = data.siteName || "NextStore";
        cachedName.current = name;
        document.title = name;
        if (data.siteLogo) setFavicon(data.siteLogo);
      })
      .catch(() => {});
  };

  useEffect(() => {
    document.title = cachedName.current;
  }, [pathname]);

  useEffect(() => {
    apply();
    window.addEventListener("nextstore-site-settings-update", apply);
    return () => window.removeEventListener("nextstore-site-settings-update", apply);
  }, []);

  return null;
}
