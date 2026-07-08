"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Lock, User, Mail } from "lucide-react";
import { toast } from "sonner";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
  onLoginSuccess: (user: any) => void;
}

const card: React.CSSProperties = {
  background: "var(--background)",
  border: "1px solid var(--navbar-border)",
  borderRadius: "16px",
  width: "100%",
  maxWidth: "420px",
  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
  overflow: "hidden",
  animation: "scaleIn 0.22s cubic-bezier(0.16,1,0.3,1)",
};

const cardHeader: React.CSSProperties = {
  padding: "1.75rem 1.75rem 0",
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
};

const cardContent: React.CSSProperties = {
  padding: "1.25rem 1.75rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

const cardFooter: React.CSSProperties = {
  padding: "0 1.75rem 1.5rem",
  borderTop: "none",
  display: "flex",
  justifyContent: "center",
};

const discordBtn: React.CSSProperties = {
  width: "100%",
  padding: "0.7rem 1rem",
  borderRadius: "10px",
  border: "none",
  background: "#5865F2",
  color: "white",
  fontWeight: "600",
  fontSize: "0.95rem",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.6rem",
  fontFamily: "inherit",
  transition: "background 0.2s",
};

const dividerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  color: "var(--text-muted)",
  fontSize: "0.8rem",
};

const DiscordIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
  </svg>
);

export default function AuthModal({ isOpen, onClose, initialMode = "login", onLoginSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [turnstileState, setTurnstileState] = useState<"unchecked" | "verifying" | "checked">("unchecked");
  const [errorMessage, setErrorMessage] = useState("");
  const [discordEnabled, setDiscordEnabled] = useState(false);

  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((d) => setDiscordEnabled(!!d.discordLoginEnabled))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setTurnstileState("unchecked");
      setErrorMessage("");
      setUsername(""); setEmail(""); setPassword(""); setConfirmPassword("");
      setLoginIdentifier(""); setLoginPassword("");
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleTurnstileClick = () => {
    if (turnstileState === "unchecked") {
      setTurnstileState("verifying");
      setTimeout(() => setTurnstileState("checked"), 1500);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!username || !email || !password || !confirmPassword) { setErrorMessage("กรุณากรอกข้อมูลให้ครบถ้วน"); return; }
    if (password !== confirmPassword) { setErrorMessage("รหัสผ่านไม่ตรงกัน"); return; }
    if (password.length < 6) { setErrorMessage("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร"); return; }
    if (turnstileState !== "checked") { setErrorMessage("กรุณายืนยันว่าคุณไม่ใช่บอท"); return; }

    const res = await fetch("/api/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (!res.ok) { setErrorMessage(data.error ?? "เกิดข้อผิดพลาด"); return; }
    localStorage.setItem("nextstore_session", JSON.stringify(data));
    onLoginSuccess(data); onClose();
    toast.success("สมัครสมาชิกสำเร็จ!", { description: `ยินดีต้อนรับคุณ ${data.username}` });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!loginIdentifier || !loginPassword) { setErrorMessage("กรุณากรอกชื่อผู้ใช้งาน/อีเมล และรหัสผ่าน"); return; }
    if (turnstileState !== "checked") { setErrorMessage("กรุณายืนยันว่าคุณไม่ใช่บอท"); return; }

    const res = await fetch("/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: loginIdentifier, password: loginPassword }),
    });
    const data = await res.json();
    if (!res.ok) { setErrorMessage(data.error ?? "เกิดข้อผิดพลาด"); return; }
    localStorage.setItem("nextstore_session", JSON.stringify(data));
    onLoginSuccess(data); onClose();
    toast.success("เข้าสู่ระบบสำเร็จ!", { description: `ยินดีต้อนรับกลับมา คุณ ${data.username}` });
  };

  const inputWithIcon = (icon: React.ReactNode, input: React.ReactNode) => (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex", alignItems: "center", pointerEvents: "none" }}>
        {icon}
      </span>
      {input}
    </div>
  );

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div style={card} onClick={(e) => e.stopPropagation()}>

        {/* Card Header */}
        <div style={cardHeader}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>
                {mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0.25rem 0 0" }}>
                {mode === "login" ? "ยินดีต้อนรับกลับสู่ NextStore" : "สร้างบัญชีใหม่เพื่อเริ่มต้นใช้งาน"}
              </p>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: "4px" }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Card Content */}
        <div style={cardContent}>

          {/* Discord Login */}
          {discordEnabled && (
            <>
              <button
                type="button"
                style={discordBtn}
                onClick={() => { window.location.href = "/api/auth/discord"; }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#4752c4"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#5865F2"}
              >
                <DiscordIcon />
                {mode === "login" ? "เข้าสู่ระบบด้วย Discord" : "สมัครด้วย Discord"}
              </button>

              {/* Divider */}
              <div style={dividerStyle}>
                <div style={{ flex: 1, height: "1px", background: "var(--navbar-border)" }} />
                <span>หรือ</span>
                <div style={{ flex: 1, height: "1px", background: "var(--navbar-border)" }} />
              </div>
            </>
          )}

          {/* Error */}
          {errorMessage && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", padding: "0.6rem 0.9rem", color: "#ef4444", fontSize: "0.85rem" }}>
              {errorMessage}
            </div>
          )}

          <form onSubmit={mode === "login" ? handleLogin : handleRegister} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {mode === "login" ? (
              <>
                <div className="formGroup" style={{ margin: 0 }}>
                  <label className="formLabel">ชื่อผู้ใช้งาน หรือ อีเมล</label>
                  {inputWithIcon(<User size={16} />,
                    <input type="text" className="formInput" placeholder="Username or Email" style={{ paddingLeft: "2.4rem" }}
                      value={loginIdentifier} onChange={(e) => setLoginIdentifier(e.target.value)} />
                  )}
                </div>
                <div className="formGroup" style={{ margin: 0 }}>
                  <label className="formLabel">รหัสผ่าน</label>
                  {inputWithIcon(<Lock size={16} />,
                    <input type="password" className="formInput" placeholder="Password" style={{ paddingLeft: "2.4rem" }}
                      value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="formGroup" style={{ margin: 0 }}>
                  <label className="formLabel">ชื่อผู้ใช้งาน</label>
                  {inputWithIcon(<User size={16} />,
                    <input type="text" className="formInput" placeholder="Username" style={{ paddingLeft: "2.4rem" }}
                      value={username} onChange={(e) => setUsername(e.target.value)} />
                  )}
                </div>
                <div className="formGroup" style={{ margin: 0 }}>
                  <label className="formLabel">อีเมล</label>
                  {inputWithIcon(<Mail size={16} />,
                    <input type="email" className="formInput" placeholder="Email" style={{ paddingLeft: "2.4rem" }}
                      value={email} onChange={(e) => setEmail(e.target.value)} />
                  )}
                </div>
                <div className="formGroup" style={{ margin: 0 }}>
                  <label className="formLabel">รหัสผ่าน</label>
                  {inputWithIcon(<Lock size={16} />,
                    <input type="password" className="formInput" placeholder="Password" style={{ paddingLeft: "2.4rem" }}
                      value={password} onChange={(e) => setPassword(e.target.value)} />
                  )}
                </div>
                <div className="formGroup" style={{ margin: 0 }}>
                  <label className="formLabel">ยืนยันรหัสผ่าน</label>
                  {inputWithIcon(<Lock size={16} />,
                    <input type="password" className="formInput" placeholder="Confirm Password" style={{ paddingLeft: "2.4rem" }}
                      value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  )}
                </div>
              </>
            )}

            {/* Turnstile */}
            <div className="turnstileContainer" style={{ margin: 0 }}>
              <div className="turnstileLeft">
                <button type="button"
                  className={`turnstileCheckbox ${turnstileState === "checked" ? "checked" : ""} ${turnstileState === "verifying" ? "verifying" : ""}`}
                  onClick={handleTurnstileClick} disabled={turnstileState !== "unchecked"}>
                  {turnstileState === "checked" && <Check size={16} />}
                </button>
                <span className="turnstileText">
                  {turnstileState === "unchecked" && "Verify you are human"}
                  {turnstileState === "verifying" && "Verifying..."}
                  {turnstileState === "checked" && "Success"}
                </span>
              </div>
              <div className="turnstileRight">
                <svg className="turnstileLogo" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" fill="#f48120"/>
                </svg>
                <span>Cloudflare</span>
                <span style={{ fontSize: "0.5rem" }}>Turnstile</span>
              </div>
            </div>

            <button type="submit" className="formButton" style={{ margin: 0 }}>
              {mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </button>
          </form>
        </div>

        {/* Card Footer */}
        <div style={cardFooter}>
          <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            {mode === "login" ? "ยังไม่มีบัญชี? " : "มีบัญชีอยู่แล้ว? "}
            <button
              type="button"
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setTurnstileState("unchecked"); setErrorMessage(""); }}
              style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontWeight: "600", fontSize: "0.875rem", fontFamily: "inherit" }}
            >
              {mode === "login" ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
