"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ShoppingBag,
  CreditCard,
  HelpCircle,
  Sun,
  Moon,
  Bell,
  BellOff,
  User,
  LogOut,
  Settings,
  LogIn,
  UserPlus,
  Wallet,
  Shield,
  X,
  MessageSquare,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import styles from "./Navbar.module.css";
import AuthModal from "./AuthModal";
import ProfileModal from "./ProfileModal";

interface NotificationItem {
  id: number;
  title: string;
  desc: string;
  time: string;
  type: "info" | "warning" | "success";
  read: boolean;
}

export default function Navbar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  // Auth and profile states
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<"login" | "register">("login");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const popupRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const profileTriggerRef = useRef<HTMLButtonElement>(null);
  const [language, setLanguage] = useState<"th" | "en">("th");

  // Contact channels state
  const [showContact, setShowContact] = useState(false);
  const [contactChannels, setContactChannels] = useState<{ id: number; platform: string; name: string; url: string }[]>([]);
  const contactDropdownRef = useRef<HTMLDivElement>(null);
  const contactTriggerRef = useRef<HTMLButtonElement>(null);

  // Initialize notifications as empty array
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [siteName, setSiteName] = useState("NextStore");
  const [siteLogo, setSiteLogo] = useState<string>("");

  // Load session & theme
  useEffect(() => {
    const loadSiteSettings = () => {
      fetch("/api/site-settings")
        .then((r) => r.json())
        .then((data) => {
          if (data.siteName) setSiteName(data.siteName);
          if (data.siteLogo) setSiteLogo(data.siteLogo);
        })
        .catch(() => {});
    };
    loadSiteSettings();
    window.addEventListener("nextstore-site-settings-update", loadSiteSettings);
    return () => window.removeEventListener("nextstore-site-settings-update", loadSiteSettings);
  }, []);

  // Load contact channels
  useEffect(() => {
    fetch("/api/contact-channels")
      .then((r) => r.json())
      .then((d) => setContactChannels(d.channels || []))
      .catch(() => {});
  }, []);

  // Load session & theme
  useEffect(() => {
    const refreshBalance = async (username: string) => {
      try {
        const res = await fetch(`/api/users/${encodeURIComponent(username)}`);
        if (!res.ok) return;
        const fresh = await res.json();
        const stored = localStorage.getItem("nextstore_session");
        if (!stored) return;
        const merged = { ...JSON.parse(stored), balance: fresh.balance };
        localStorage.setItem("nextstore_session", JSON.stringify(merged));
        setCurrentUser(merged);
      } catch {}
    };

    // Session update listener
    const handleSessionUpdate = () => {
      const session = localStorage.getItem("nextstore_session");
      if (session) {
        const user = JSON.parse(session);
        setCurrentUser(user);
        // also refresh balance from DB
        if (user?.username) refreshBalance(user.username);
      } else {
        setCurrentUser(null);
      }
    };
    window.addEventListener("nextstore-session-update", handleSessionUpdate);

    try {
      // Theme init
      const savedTheme = localStorage.getItem("theme") as "light" | "dark";
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
      
      setTheme(initialTheme);
      if (initialTheme === "dark") {
        document.documentElement.classList.add("dark");
        document.body.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.body.classList.remove("dark");
        document.documentElement.setAttribute("data-theme", "light");
      }

      // Session init — set from localStorage first, then refresh balance from DB
      const session = localStorage.getItem("nextstore_session");
      if (session) {
        const user = JSON.parse(session);
        setCurrentUser(user);
        if (user?.username) refreshBalance(user.username);
      }

      // Load language settings
      const savedLang = localStorage.getItem("nextstore_language") as "th" | "en";
      if (savedLang) {
        setLanguage(savedLang);
      }
    } catch (e) {
      console.error(e);
    }

    return () => {
      window.removeEventListener("nextstore-session-update", handleSessionUpdate);
    };
  }, []);

  // Toggle Theme function
  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    try {
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
        document.body.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.body.classList.remove("dark");
        document.documentElement.setAttribute("data-theme", "light");
      }
      localStorage.setItem("theme", nextTheme);
    } catch (e) {
      console.error(e);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Bell popup
      if (
        popupRef.current && 
        !popupRef.current.contains(event.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      
      // Profile dropdown
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node) &&
        profileTriggerRef.current &&
        !profileTriggerRef.current.contains(event.target as Node)
      ) {
        setShowProfileDropdown(false);
      }

      // Contact dropdown
      if (
        contactDropdownRef.current &&
        !contactDropdownRef.current.contains(event.target as Node) &&
        contactTriggerRef.current &&
        !contactTriggerRef.current.contains(event.target as Node)
      ) {
        setShowContact(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("nextstore_session");
    setCurrentUser(null);
    setShowProfileDropdown(false);
    
    toast.success(language === "th" ? "ออกจากระบบสำเร็จ!" : "Logout successful!", {
      description: language === "th" ? "ระบบได้ทำการลงชื่อออกเรียบร้อยแล้ว" : "You have been logged out.",
    });
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const translations = {
    th: {
      home: "หน้าแรก",
      products: "สินค้าทั้งหมด",
      topup: "เติมเงิน",
      faq: "คำถามที่พบบ่อย",
      login: "เข้าสู่ระบบ",
      register: "สมัครสมาชิก",
      admin: "จัดการหลังบ้าน",
      profile: "จัดการโปรไฟล์ผู้ใช้",
      logout: "ออกจากระบบ",
      notifications: "การแจ้งเตือน",
      noNotifications: "ไม่มีการแจ้งเตือนใหม่ในขณะนี้",
      lang: "ภาษา",
      currency: "ค่าเงิน",
      theme: "ธีม",
      close: "ปิด",
    },
    en: {
      home: "Home",
      products: "Products",
      topup: "Top Up",
      faq: "FAQ",
      login: "Login",
      register: "Register",
      admin: "Admin Panel",
      profile: "Manage Profile",
      logout: "Logout",
      notifications: "Notifications",
      noNotifications: "No new notifications",
      lang: "Language",
      currency: "Currency",
      theme: "Theme",
      close: "Close",
    }
  };

  const t = translations[language] || translations.th;

  const PLATFORM_COLORS: Record<string, string> = {
    facebook: "#1877f2", line: "#06c755", discord: "#5865f2",
    instagram: "#e1306c", twitter: "#1da1f2", x: "#000000",
    whatsapp: "#25d366", telegram: "#0088cc", youtube: "#ff0000",
    tiktok: "#010101", email: "#ea4335", custom: "var(--primary)",
  };

  const PlatformIcon = ({ platform }: { platform: string }) => {
    const color = PLATFORM_COLORS[platform.toLowerCase()] || "var(--primary)";
    const p = platform.toLowerCase();
    const label = platform.charAt(0).toUpperCase();
    const svgMap: Record<string, string> = {
      facebook: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
      discord: "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.113 18.1.133 18.11a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z",
      youtube: "M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.41 19.1C5.12 19.56 12 19.56 12 19.56s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.42z",
    };
    if (svgMap[p]) {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0 }}>
          <path d={svgMap[p]} />
          {p === "youtube" && <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white" />}
        </svg>
      );
    }
    return (
      <span style={{ width: 16, height: 16, borderRadius: "4px", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: "800", color: "white", flexShrink: 0 }}>
        {label}
      </span>
    );
  };

  const navLinks = [
    { label: t.home, href: "/", icon: <Home size={18} /> },
    { label: t.products, href: "/products", icon: <ShoppingBag size={18} /> },
    { label: t.topup, href: "/topup", icon: <CreditCard size={18} /> },
    { label: t.faq, href: "/faq", icon: <HelpCircle size={18} /> },
  ];

  return (
    <>
      <header className={styles.header}>
        <div className={styles.navbarContainer}>
          {/* Brand / Logo */}
          <Link href="/" className={styles.logo}>
            {siteLogo && (
              <img src={siteLogo} alt={siteName} style={{ height: "52px", maxWidth: "160px", objectFit: "contain" }} />
            )}
          </Link>

          {/* Navigation Links */}
          <nav className={styles.nav}>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={`${styles.navLink} ${isActive ? styles.active : ""}`}
                >
                  <span className={styles.linkIcon}>{link.icon}</span>
                  <span className={styles.linkLabel}>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Action Controls */}
          <div className={styles.actions}>
            {/* Notification Bell */}
            <div className={styles.notificationWrapper}>
              <button 
                ref={bellRef}
                onClick={() => setShowNotifications(!showNotifications)}
                className={`${styles.actionButton} ${showNotifications ? styles.activeBell : ""}`}
                aria-label="การแจ้งเตือน"
              >
                <Bell size={20} />
              </button>

              {/* Notification Dropdown Popup */}
              {showNotifications && (
                <div ref={popupRef} className={styles.popup}>
                  <div className={styles.popupHeader} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3>{t.notifications}</h3>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      style={{ 
                        background: "none", 
                        border: "none", 
                        cursor: "pointer", 
                        color: "var(--text-secondary)", 
                        padding: "0.25rem",
                        display: "flex", 
                        alignItems: "center",
                        borderRadius: "4px",
                        transition: "background 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.05)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      title={t.close}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  <div className={styles.popupBody}>
                    <div className={styles.emptyNotifications}>
                      <BellOff size={36} className={styles.emptyIcon} />
                      <p>{t.noNotifications}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Contact Us Button */}
            <div className={styles.contactWrapper} style={{ position: "relative" }}>
              <button
                ref={contactTriggerRef}
                onClick={() => setShowContact(!showContact)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.45rem 1rem",
                  borderRadius: "20px",
                  border: "1.5px solid var(--primary)",
                  background: showContact ? "var(--primary)" : "transparent",
                  color: showContact ? "white" : "var(--primary)",
                  fontWeight: "700",
                  fontSize: "0.875rem",
                  fontFamily: "inherit",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!showContact) {
                    e.currentTarget.style.background = "var(--primary)";
                    e.currentTarget.style.color = "white";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showContact) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--primary)";
                  }
                }}
              >
                <MessageSquare size={16} />
                <span className={styles.contactLabel}>ติดต่อเรา</span>
                <ChevronDown size={13} className={styles.contactChevron} style={{ opacity: 0.8, transform: showContact ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>

              {showContact && (
                <div
                  ref={contactDropdownRef}
                  style={{
                    position: "absolute",
                    top: "120%",
                    right: 0,
                    minWidth: "200px",
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--navbar-border)",
                    borderRadius: "12px",
                    padding: "0.5rem",
                    boxShadow: "var(--shadow-premium)",
                    zIndex: 200,
                    animation: "scaleIn 0.15s ease-out",
                  }}
                >
                  {/* Chat on website */}
                  <button
                    onClick={() => {
                      setShowContact(false);
                      if (!currentUser) {
                        setAuthInitialMode("login");
                        setIsAuthOpen(true);
                        return;
                      }
                      window.location.href = "/chat";
                    }}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.65rem",
                      width: "100%", padding: "0.65rem 0.85rem", borderRadius: "8px",
                      border: "none", background: "transparent", cursor: "pointer",
                      color: "var(--text-primary)", fontFamily: "inherit", fontSize: "0.9rem",
                      fontWeight: "600", textAlign: "left", transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--primary-light)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <MessageSquare size={16} style={{ color: "var(--primary)", flexShrink: 0 }} />
                    แชทบนเว็บไซต์
                  </button>

                  {/* Divider if there are channels */}
                  {contactChannels.length > 0 && (
                    <div style={{ height: "1px", background: "var(--navbar-border)", margin: "0.35rem 0.5rem" }} />
                  )}

                  {/* Other channels */}
                  {contactChannels.map((ch) => (
                    <a
                      key={ch.id}
                      href={ch.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowContact(false)}
                      style={{
                        display: "flex", alignItems: "center", gap: "0.65rem",
                        width: "100%", padding: "0.65rem 0.85rem", borderRadius: "8px",
                        color: "var(--text-primary)", textDecoration: "none",
                        fontSize: "0.9rem", fontWeight: "500", transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "var(--primary-light)"}
                      onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    >
                      <PlatformIcon platform={ch.platform} />
                      <span style={{ flex: 1 }}>{ch.name}</span>
                      <ExternalLink size={13} style={{ opacity: 0.4, flexShrink: 0 }} />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={styles.actionButton}
              aria-label={theme === "dark" ? "สลับเป็นโหมดสว่าง" : "สลับเป็นโหมดมืด"}
              title={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Authentication Buttons / User Profile */}
            {currentUser ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>

                {/* Wallet Balance */}
                <div className={styles.walletBalance} style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.3rem 0.75rem", borderRadius: "var(--border-radius-full)", border: "1px solid var(--navbar-border)", fontSize: "0.875rem", fontWeight: "600", color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                  <Wallet size={15} style={{ color: "var(--primary)", flexShrink: 0 }} />
                  <span>฿{(currentUser.balance ?? 0).toFixed(2)}</span>
                </div>

                <div style={{ position: "relative" }}>
                  <button
                    ref={profileTriggerRef}
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="profileTrigger"
                  >
                  {currentUser.profileImage ? (
                    <img 
                      src={currentUser.profileImage} 
                      alt="User Profile" 
                      className="profileAvatar"
                    />
                  ) : (
                    <div className="profileAvatar">
                      <User size={16} />
                    </div>
                  )}
                  <span className="profileName">{currentUser.username}</span>
                </button>

                {showProfileDropdown && (
                  <div ref={profileDropdownRef} className="profileDropdown">
                    {currentUser && currentUser.role !== "Member" && currentUser.role !== "Partner" && (
                      <Link 
                        href="/admin" 
                        className="profileDropdownItem"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        <Shield size={16} />
                        {t.admin}
                      </Link>
                    )}
                    <button 
                      className="profileDropdownItem"
                      onClick={() => {
                        setIsProfileOpen(true);
                        setShowProfileDropdown(false);
                      }}
                    >
                      <Settings size={16} />
                      {t.profile}
                    </button>
                    <button 
                      className="profileDropdownItem logout"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} />
                      {t.logout}
                    </button>
                  </div>
                )}
              </div>
            </div>
            ) : (
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  className="profileTrigger"
                  onClick={() => {
                    setAuthInitialMode("login");
                    setIsAuthOpen(true);
                  }}
                >
                  <LogIn size={16} />
                  <span className={styles.authLabel}>{t.login}</span>
                </button>
                <button
                  className="profileTrigger"
                  style={{ backgroundColor: "var(--primary)", color: "white", borderColor: "var(--primary)" }}
                  onClick={() => {
                    setAuthInitialMode("register");
                    setIsAuthOpen(true);
                  }}
                >
                  <UserPlus size={16} />
                  <span className={styles.authLabel}>{t.register}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authInitialMode}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onUpdateUser={(updatedUser) => {
          setCurrentUser(updatedUser);
        }}
      />
    </>
  );
}
