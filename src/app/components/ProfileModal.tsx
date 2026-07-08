"use client";

import React, { useState, useEffect } from "react";
import { X, User, Check, Eye, EyeOff, ShieldAlert, Mail } from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onUpdateUser: (updatedUser: any) => void;
}

export default function ProfileModal({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
}: ProfileModalProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [password, setPassword] = useState("");
  
  // Verification states
  const [isVerifying, setIsVerifying] = useState(false);
  const [sentCode, setSentCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [isPasswordUnlocked, setIsPasswordUnlocked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  // Simulated Email Toast State
  const [emailToast, setEmailToast] = useState("");

  useEffect(() => {
    if (isOpen && currentUser) {
      setUsername(currentUser.username || "");
      setEmail(currentUser.email || "");
      setProfileImage(currentUser.profileImage || "");
      setPassword("");
      const canViewImmediately = currentUser.role !== "Member" && currentUser.role !== "Partner";
      setIsPasswordUnlocked(canViewImmediately);
      setShowPassword(false);
      setIsVerifying(false);
      setEnteredCode("");
      setVerificationError("");
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !currentUser) return null;

  // Real-time update helper
  const handleFieldChange = async (key: string, value: string) => {
    if (key === "username") setUsername(value);
    if (key === "profileImage") setProfileImage(value);
    if (key === "password") setPassword(value);

    const body: Record<string, string> = {};
    if (key === "username") body.newUsername = value;
    else body[key] = value;

    const res = await fetch(`/api/users/${encodeURIComponent(currentUser.username)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return;
    const updated = await res.json();

    const session = { ...currentUser, ...updated };
    localStorage.setItem("nextstore_session", JSON.stringify(session));
    onUpdateUser(session);
  };

  // Handle local image file selector
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        handleFieldChange("profileImage", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Send Code flow
  const handleSendVerificationCode = () => {
    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSentCode(code);
    setIsVerifying(true);
    setVerificationError("");
    setEnteredCode("");

    // Simulate sending email: show a beautiful toast at top right of the viewport
    setEmailToast(code);
    
    // Auto close toast after 8 seconds
    setTimeout(() => {
      setEmailToast("");
    }, 8000);
  };

  const handleVerifyCode = () => {
    if (enteredCode === sentCode) {
      setIsPasswordUnlocked(true);
      setIsVerifying(false);
      setShowPassword(true);
      setEmailToast(""); // clear notification
    } else {
      setVerificationError("รหัสยืนยันไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <>
      <div className="modalOverlay" onClick={onClose}>
        <div className="modalCard" onClick={(e) => e.stopPropagation()}>
          <button className="modalCloseBtn" onClick={onClose}>
            <X size={20} />
          </button>

          <h2 className="modalTitle">จัดการโปรไฟล์ผู้ใช้</h2>

          {/* Avatar Upload Section */}
          <div className="avatarUploadSection">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="avatarPreviewLarge" />
            ) : (
              <div className="avatarPreviewLarge" style={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
                <User size={48} />
              </div>
            )}

            <div className="avatarUploadInputs">
              <div className="fileInputWrapper">
                <span className="fileInputLabel">เลือกรูปภาพจากเครื่อง</span>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageFileChange} 
                />
              </div>
              <input
                type="text"
                className="formInput"
                placeholder="หรือ ใส่ลิงก์รูปภาพ URL"
                value={profileImage}
                onChange={(e) => handleFieldChange("profileImage", e.target.value)}
                style={{ fontSize: "0.85rem", padding: "0.5rem" }}
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="formGroup">
            <label className="formLabel">ชื่อผู้ใช้งาน (Username)</label>
            <input
              type="text"
              className="formInput"
              value={username}
              onChange={(e) => handleFieldChange("username", e.target.value)}
            />
          </div>

          <div className="formGroup">
            <label className="formLabel">บทบาท / ตำแหน่ง (Role)</label>
            <input
              type="text"
              className="formInput"
              value={currentUser.role || "Member"}
              disabled
              style={{ fontWeight: "bold", color: "var(--primary)" }}
            />
          </div>

          <div className="formGroup">
            <label className="formLabel">อีเมล (Email) - ไม่สามารถแก้ไขได้</label>
            <input
              type="email"
              className="formInput"
              value={email}
              disabled
            />
          </div>

          <div className="formGroup">
            <label className="formLabel">รหัสผ่าน (Password)</label>
            <div className="passwordActionArea">
              <input
                type={showPassword ? "text" : "password"}
                className="formInput"
                value={password}
                disabled={!isPasswordUnlocked}
                onChange={(e) => handleFieldChange("password", e.target.value)}
              />
              {isPasswordUnlocked ? (
                <button 
                  type="button" 
                  className="actionButton" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ minWidth: "40px" }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              ) : (
                <button
                  type="button"
                  className="formButton"
                  onClick={handleSendVerificationCode}
                  style={{ fontSize: "0.75rem", whiteSpace: "nowrap", padding: "0.5rem 0.75rem", width: "auto" }}
                >
                  ส่งรหัสยืนยันไปที่ Email
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Verification Code Popup */}
      {isVerifying && (
        <div className="emailCodeModalOverlay" onClick={() => setIsVerifying(false)}>
          <div className="emailCodeCard" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "center", color: "var(--primary)" }}>
              <ShieldAlert size={48} />
            </div>
            <h3>การยืนยันรหัสความปลอดภัย</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              ระบบได้ส่งรหัสยืนยัน 6 หลักไปที่อีเมลของคุณเรียบร้อยแล้ว กรุณาตรวจสอบอีเมลจำลองที่มุมบนขวา
            </p>
            {verificationError && <div className="errorMessage" style={{ textAlign: "center" }}>{verificationError}</div>}
            <input
              type="text"
              placeholder="กรอกรหัสยืนยัน 6 หลัก"
              className="formInput"
              style={{ textAlign: "center", fontSize: "1.2rem", letterSpacing: "4px" }}
              maxLength={6}
              value={enteredCode}
              onChange={(e) => setEnteredCode(e.target.value)}
            />
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button 
                type="button" 
                className="formButton" 
                style={{ backgroundColor: "var(--text-muted)" }}
                onClick={() => setIsVerifying(false)}
              >
                ยกเลิก
              </button>
              <button 
                type="button" 
                className="formButton"
                onClick={handleVerifyCode}
              >
                ยืนยันรหัส
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Email Notification Toast Banner */}
      {emailToast && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          backgroundColor: "#1e293b",
          color: "#f8fafc",
          padding: "1rem 1.25rem",
          borderRadius: "8px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
          zIndex: 1300,
          display: "flex",
          alignItems: "center",
          gap: "0.85rem",
          borderLeft: "4px solid var(--primary)",
          animation: "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
            <Mail size={24} />
          </div>
          <div>
            <div style={{ fontWeight: "bold", fontSize: "0.8rem", color: "#94a3b8" }}>📧 [อีเมลจำลอง] NextStore Security</div>
            <div style={{ fontSize: "0.85rem", marginTop: "0.2rem" }}>
              รหัสยืนยันของคุณคือ <strong style={{ fontSize: "1rem", color: "#60a5fa", letterSpacing: "1px" }}>{emailToast}</strong>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
