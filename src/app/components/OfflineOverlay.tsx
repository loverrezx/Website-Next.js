"use client";

import React, { useEffect, useState } from "react";
import { Wrench, Lock } from "lucide-react";

interface SiteSettings {
  isOnline: boolean;
  accessCode: string;
}

export default function OfflineOverlay() {
  const [show, setShow] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((s) => {
        if (s.isOnline) return;
        const bypassed = localStorage.getItem("nextstore_offline_bypass");
        if (bypassed === s.accessCode && s.accessCode) return;
        setAccessCode(s.accessCode ?? "");
        setShow(true);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = () => {
    if (code === accessCode) {
      localStorage.setItem("nextstore_offline_bypass", code);
      setShow(false);
    } else {
      setError("รหัสไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setCode("");
    }
  };

  if (!show) return null;

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.75)",
      backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999,
    }}>
      <div style={{
        background: "var(--background)",
        border: "1px solid var(--navbar-border)",
        borderRadius: "16px",
        padding: "2.5rem 2rem",
        maxWidth: "400px",
        width: "90%",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.25rem",
        boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
        animation: shaking ? "shake 0.4s ease" : undefined,
      }}>
        <style>{`
          @keyframes shake {
            0%,100%{transform:translateX(0)}
            20%{transform:translateX(-8px)}
            40%{transform:translateX(8px)}
            60%{transform:translateX(-6px)}
            80%{transform:translateX(6px)}
          }
        `}</style>

        <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
          <Wrench size={30} />
        </div>

        <div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 0.5rem" }}>
            เว็บไซต์กำลังปิดปรับปรุง
          </h2>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
            รอการอัพเดทสักครู่ ขออภัยในความไม่สะดวก
          </p>
        </div>

        <div style={{ width: "100%", borderTop: "1px solid var(--navbar-border)", paddingTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", justifyContent: "center", color: "var(--text-muted)", fontSize: "0.8rem" }}>
            <Lock size={14} />
            <span>มีรหัสผ่านสามารถเข้าใช้งานได้</span>
          </div>

          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            placeholder="กรอกรหัส 6 หลัก"
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              borderRadius: "10px",
              border: `1px solid ${error ? "#ef4444" : "var(--navbar-border)"}`,
              background: "var(--background)",
              color: "var(--foreground)",
              fontSize: "1.1rem",
              fontFamily: "inherit",
              textAlign: "center",
              letterSpacing: "0.3em",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            autoFocus
          />

          {error && (
            <p style={{ color: "#ef4444", fontSize: "0.825rem", margin: 0 }}>{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={code.length !== 6}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "10px",
              border: "none",
              background: code.length === 6 ? "var(--primary)" : "var(--primary-light)",
              color: code.length === 6 ? "white" : "var(--text-muted)",
              fontWeight: "600",
              fontSize: "0.95rem",
              cursor: code.length === 6 ? "pointer" : "not-allowed",
              fontFamily: "inherit",
              transition: "all 0.2s",
            }}
          >
            เข้าใช้งาน
          </button>
        </div>
      </div>
    </div>
  );
}
