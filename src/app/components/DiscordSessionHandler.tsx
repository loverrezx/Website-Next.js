"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function DiscordSessionHandler() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const session = params.get("discord_session");
    const err = params.get("discord_error");

    if (session) {
      try {
        const user = JSON.parse(decodeURIComponent(session));
        localStorage.setItem("nextstore_session", JSON.stringify(user));
        window.dispatchEvent(new Event("nextstore-session-update"));
        toast.success("เข้าสู่ระบบผ่าน Discord สำเร็จ!", {
          description: `ยินดีต้อนรับ ${user.username}`,
        });
      } catch {}
      router.replace("/");
    }

    if (err) {
      toast.error("เข้าสู่ระบบผ่าน Discord ไม่สำเร็จ");
      router.replace("/");
    }
  }, [params, router]);

  return null;
}
