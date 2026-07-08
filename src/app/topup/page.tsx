"use client";

import React, { useState, useEffect, useRef } from "react";
import { Wallet, AlertCircle, ArrowRight, Upload, X, Building2, Gift, Tag } from "lucide-react";
import { Alert } from "../components/Alert";
import { toast } from "sonner";
import jsQR from "jsqr";

const BANK_NAMES: Record<string, string> = {
  kbank: "ธนาคารกสิกรไทย (KBank)",
  scb: "ธนาคารไทยพาณิชย์ (SCB)",
  bbl: "ธนาคารกรุงเทพ (BBL)",
  ktb: "ธนาคารกรุงไทย (KTB)",
  bay: "ธนาคารกรุงศรีอยุธยา (BAY)",
  tmb: "ธนาคารทหารไทยธนชาต (TTB)",
  gsb: "ธนาคารออมสิน (GSB)",
  baac: "ธ.ก.ส. (BAAC)",
  uob: "ธนาคารยูโอบี (UOB)",
  cimb: "ธนาคารซีไอเอ็มบี (CIMB)",
};

export default function Topup() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeChannel, setActiveChannel] = useState<"angpao" | "bank" | "code">("angpao");
  const [ch, setCh] = useState<any>(null);
  const [angpaoLink, setAngpaoLink] = useState("");
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ variant: "success" | "destructive" | "warning" | "loading"; title: string; description: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const s = localStorage.getItem("nextstore_session");
    if (s) setCurrentUser(JSON.parse(s));
    fetch("/api/site-settings").then(r => r.json()).then(setCh).catch(() => {});
  }, []);

  const handleAngpao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!angpaoLink.trim()) { setAlert({ variant: "warning", title: "กรุณากรอกลิงก์", description: "กรุณากรอกลิงก์ซองอั่งเปา" }); return; }
    if (!angpaoLink.includes("truemoney.com")) { setAlert({ variant: "destructive", title: "ลิงก์ไม่ถูกต้อง", description: "ใช้ได้เฉพาะลิงก์จาก TrueMoney Wallet เท่านั้น" }); return; }
    setLoading(true);
    setAlert({ variant: "loading", title: "กำลังตรวจสอบ...", description: "กรุณารอสักครู่" });

    const res = await fetch("/api/topup/angpao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ angpaoLink, username: currentUser.username }),
    }).catch(() => null);

    setLoading(false);
    if (!res || !res.ok) {
      const err = res ? await res.json().catch(() => ({})) : {};
      setAlert({ variant: "destructive", title: "เติมเงินไม่สำเร็จ", description: err.error ?? "เกิดข้อผิดพลาด" });
      return;
    }
    const data = await res.json();
    setAngpaoLink("");
    setCurrentUser((prev: any) => ({ ...prev, balance: data.balance }));
    localStorage.setItem("nextstore_session", JSON.stringify({ ...currentUser, balance: data.balance }));
    setAlert({ variant: "success", title: "เติมเงินสำเร็จ!", description: `ได้รับ ${data.finalAmount} Point (ยอดเงิน ${data.rawAmount} บาท)` });
    toast.success(`+${data.finalAmount} Point`);
  };

  const processSlip = async (preview: string) => {
    setLoading(true);
    setAlert({ variant: "loading", title: "กำลังอ่าน QR Code...", description: "กำลังสแกน QR Code จากสลิป กรุณารอสักครู่..." });

    const qrData = await new Promise<string | null>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(null); return; }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        resolve(code?.data ?? null);
      };
      img.onerror = () => resolve(null);
      img.src = preview;
    });

    if (!qrData) {
      setLoading(false);
      setAlert({ variant: "destructive", title: "อ่าน QR Code ไม่ได้", description: "ไม่พบ QR Code บนสลิป กรุณาถ่ายรูปสลิปให้ชัดขึ้นหรือลองใหม่อีกครั้ง" });
      return;
    }

    setAlert({ variant: "loading", title: "กำลังตรวจสอบสลิป...", description: "กำลังยืนยันยอดเงิน กรุณารอสักครู่..." });

    const res = await fetch("/api/topup/slip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrData, username: currentUser.username }),
    }).catch(() => null);

    setLoading(false);
    if (!res || !res.ok) {
      const err = res ? await res.json().catch(() => ({})) : {};
      setAlert({ variant: "destructive", title: "ตรวจสอบไม่สำเร็จ", description: err.error ?? "เกิดข้อผิดพลาด" });
      return;
    }
    const data = await res.json();
    setSlipFile(null);
    setSlipPreview("");
    const updatedUser = { ...currentUser, balance: data.balance };
    setCurrentUser(updatedUser);
    localStorage.setItem("nextstore_session", JSON.stringify(updatedUser));
    window.dispatchEvent(new Event("nextstore-session-update"));
    setAlert({ variant: "success", title: "เติมเงินสำเร็จ!", description: `ได้รับ ${data.finalAmount} Point (ยอดโอน ${data.rawAmount} บาท)` });
    toast.success(`+${data.finalAmount} Point`);
  };

  const handleSlipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setSlipFile(f);
    setAlert(null);
    const r = new FileReader();
    r.onload = ev => {
      const preview = ev.target?.result as string;
      setSlipPreview(preview);
      processSlip(preview);
    };
    r.readAsDataURL(f);
  };

  const handleCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeInput.trim()) { setAlert({ variant: "warning", title: "กรุณากรอกโค้ด", description: "กรอกโค้ดเติมเงินที่ต้องการใช้" }); return; }
    setLoading(true);
    setAlert({ variant: "loading", title: "กำลังตรวจสอบโค้ด...", description: "กรุณารอสักครู่" });

    const res = await fetch("/api/topup/code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: codeInput.trim(), username: currentUser.username }),
    }).catch(() => null);

    setLoading(false);
    if (!res || !res.ok) {
      const err = res ? await res.json().catch(() => ({})) : {};
      setAlert({ variant: "destructive", title: "ใช้โค้ดไม่สำเร็จ", description: err.error ?? "เกิดข้อผิดพลาด" });
      return;
    }
    const data = await res.json();
    setCodeInput("");
    const updatedUser = { ...currentUser, balance: data.balance };
    setCurrentUser(updatedUser);
    localStorage.setItem("nextstore_session", JSON.stringify(updatedUser));
    window.dispatchEvent(new Event("nextstore-session-update"));
    setAlert({ variant: "success", title: "ใช้โค้ดสำเร็จ!", description: `ได้รับ ${data.amount} Point` });
    toast.success(`+${data.amount} Point`);
  };

  const DisabledCard = ({ label }: { label: string }) => (
    <div style={{ padding: "1.5rem", background: "rgba(239,68,68,0.05)", border: "1px dashed #f87171", borderRadius: "12px", textAlign: "center", color: "#ef4444" }}>
      <AlertCircle size={32} style={{ margin: "0 auto 0.5rem" }} />
      <p style={{ fontWeight: "600", margin: "0 0 0.25rem" }}>ช่องทางการเติมเงินนี้ถูกปิดการใช้งานชั่วคราว</p>
      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>{label}</p>
    </div>
  );

  return (
    <main className="container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
      <div style={{ background: "var(--background)", border: "1px solid var(--navbar-border)", borderRadius: "var(--border-radius-md)", padding: "clamp(1.25rem, 5vw, 2.5rem)", width: "100%", maxWidth: "560px", boxShadow: "var(--shadow-premium)", animation: "scaleIn 0.3s cubic-bezier(0.16,1,0.3,1)" }}>

        <div style={{ display: "flex", justifyContent: "center", color: "var(--primary)", marginBottom: "1rem" }}>
          <Wallet size={48} />
        </div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "0.5rem", textAlign: "center" }}>เติมเงินเข้าระบบ</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "2rem", textAlign: "center" }}>เลือกช่องทางการเติมเงินที่ต้องการ</p>

        {alert && <Alert variant={alert.variant} title={alert.title} description={alert.description} onClose={alert.variant !== "loading" ? () => setAlert(null) : undefined} />}

        {!currentUser ? (
          <div style={{ padding: "2rem 1rem", background: "rgba(239,68,68,0.05)", border: "1px dashed #f87171", borderRadius: "8px", color: "#ef4444", textAlign: "center" }}>
            <AlertCircle size={36} style={{ margin: "0 auto 0.75rem" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.5rem" }}>กรุณาเข้าสู่ระบบก่อน</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>ต้องเข้าสู่ระบบก่อนทำรายการเติมเงิน</p>
          </div>
        ) : (
          <>
            {/* Channel Tabs */}
            <div style={{ display: "flex", flexWrap: "wrap", borderBottom: "1px solid var(--navbar-border)", marginBottom: "1.5rem", gap: "0.25rem" }}>
              {[
                { key: "angpao", label: "ซองอั่งเปา", icon: <Gift size={16} /> },
                { key: "bank",   label: "โอนธนาคาร",  icon: <Building2 size={16} /> },
                { key: "code",   label: "กรอกโค้ด",    icon: <Tag size={16} /> },
              ].map(({ key, label, icon }) => {
                const active = activeChannel === key;
                return (
                  <button key={key} onClick={() => { setActiveChannel(key as any); setAlert(null); }}
                    style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.75rem 1rem", background: "none", border: "none", borderBottom: active ? "2px solid var(--primary)" : "2px solid transparent", color: active ? "var(--primary)" : "var(--text-muted)", fontWeight: active ? "700" : "500", cursor: "pointer", fontSize: "0.9rem", fontFamily: "inherit", transition: "all 0.2s" }}>
                    {icon}{label}
                  </button>
                );
              })}
            </div>

            {/* PromptPay / Angpao Channel */}
            {activeChannel === "angpao" && (
              !ch?.promptpayEnabled ? <DisabledCard label="ซองอั่งเปา TrueMoney Wallet" /> :
              <form onSubmit={handleAngpao} style={{ display: "flex", flexDirection: "column", gap: "1.25rem", textAlign: "left" }}>
                <div className="formGroup" style={{ margin: 0 }}>
                  <label className="formLabel">ลิงก์ซองอั่งเปา TrueMoney</label>
                  <input type="url" className="formInput" placeholder="https://gift.truemoney.com/campaign/?v=..."
                    value={angpaoLink} onChange={(e) => setAngpaoLink(e.target.value)} disabled={loading} />
                </div>
                {ch?.promptpayFeeEnabled && (
                  <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0, padding: "0.6rem 0.9rem", background: "var(--primary-light)", borderRadius: "8px" }}>
                    มีการหักค่าธรรมเนียม {ch.promptpayFeeType === "percent" ? `${ch.promptpayFeeValue}%` : `${ch.promptpayFeeValue} บาท`} ก่อนเพิ่ม Point
                  </p>
                )}
                <button type="submit" className="formButton" disabled={loading}
                  style={{ backgroundColor: loading ? "var(--text-muted)" : "#ff5722", cursor: loading ? "not-allowed" : "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
                  {loading ? "กำลังตรวจสอบ..." : "ยืนยันการเติมเงิน"}<ArrowRight size={18} />
                </button>
              </form>
            )}

            {/* Bank Channel */}
            {activeChannel === "bank" && (
              !ch?.bankEnabled ? <DisabledCard label="โอนธนาคาร (แนปสลิป)" /> :
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                {/* Bank Info Card */}
                <div style={{ padding: "1rem 1.25rem", background: "var(--primary-light)", borderRadius: "10px", border: "1px solid var(--navbar-border)", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <p style={{ margin: 0, fontWeight: "700", color: "var(--text-primary)", fontSize: "0.9rem" }}>ข้อมูลบัญชีผู้รับเงิน</p>
                  <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-primary)" }}>
                    {BANK_NAMES[ch.bankType] || ch.bankType || "—"}
                  </p>
                  <p style={{ margin: 0, fontSize: "1rem", fontWeight: "700", color: "var(--primary)", letterSpacing: "0.05em" }}>
                    {ch.bankAccountNumber || "—"}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                    ชื่อผู้รับ: <strong>{ch.bankRecipientName || "—"}</strong>
                  </p>
                </div>

                {/* Slip Upload */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", textAlign: "left" }}>
                  <div className="formGroup" style={{ margin: 0 }}>
                    <label className="formLabel">แนบสลิปการโอนเงิน</label>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0 0 0.6rem" }}>ระบบจะตรวจสอบและเติมเงินอัตโนมัติเมื่ออัปโหลดสลิป</p>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleSlipChange} disabled={loading} />
                    {slipPreview ? (
                      <div style={{ position: "relative", display: "inline-block" }}>
                        <img src={slipPreview} alt="slip" style={{ width: "100%", maxHeight: "280px", objectFit: "contain", borderRadius: "8px", border: "1px solid var(--navbar-border)" }} />
                        {!loading && (
                          <button type="button" onClick={() => { setSlipFile(null); setSlipPreview(""); setAlert(null); }}
                            style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <X size={15} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <button type="button" onClick={() => fileRef.current?.click()} disabled={loading}
                        style={{ width: "100%", padding: "2rem", border: "2px dashed var(--navbar-border)", borderRadius: "10px", background: "transparent", cursor: loading ? "not-allowed" : "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontFamily: "inherit", transition: "border-color 0.2s" }}
                        onMouseEnter={(e) => { if (!loading) e.currentTarget.style.borderColor = "var(--primary)"; }}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--navbar-border)"}>
                        <Upload size={28} />
                        <span style={{ fontSize: "0.9rem", fontWeight: "500" }}>คลิกเพื่ออัปโหลดสลิป</span>
                        <span style={{ fontSize: "0.8rem" }}>รองรับ JPG, PNG — ตรวจสอบอัตโนมัติทันที</span>
                      </button>
                    )}
                  </div>

                  {ch?.bankFeeEnabled && (
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0, padding: "0.6rem 0.9rem", background: "var(--primary-light)", borderRadius: "8px" }}>
                      มีการหักค่าธรรมเนียม {ch.bankFeeType === "percent" ? `${ch.bankFeeValue}%` : `${ch.bankFeeValue} บาท`} ก่อนเพิ่ม Point
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Topup Code Channel */}
            {activeChannel === "code" && (
              <form onSubmit={handleCode} style={{ display: "flex", flexDirection: "column", gap: "1.25rem", textAlign: "left" }}>
                <div className="formGroup" style={{ margin: 0 }}>
                  <label className="formLabel">โค้ดเติมเงิน</label>
                  <input
                    type="text"
                    className="formInput"
                    placeholder="กรอกโค้ดเติมเงินที่ได้รับ"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                    disabled={loading}
                    style={{ textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "monospace" }}
                  />
                </div>
                <button type="submit" className="formButton" disabled={loading || !codeInput.trim()}
                  style={{ backgroundColor: (loading || !codeInput.trim()) ? "var(--text-muted)" : "var(--primary)", cursor: (loading || !codeInput.trim()) ? "not-allowed" : "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
                  {loading ? "กำลังตรวจสอบ..." : "ยืนยันโค้ดเติมเงิน"}<ArrowRight size={18} />
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </main>
  );
}
