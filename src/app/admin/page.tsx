"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Globe,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Settings,
  Upload,
  Save,
  Wallet,
  Gift,
  LogIn,
  Copy,
  Check,
  Eye,
  EyeOff,
  Building2,
  Users,
  Pencil,
  Trash2,
  Plus,
  Minus,
  DollarSign,
  X,
  Tag,
  LayoutDashboard,
  TrendingUp,
  BarChart2,
  ImageIcon,
  Megaphone,
  Link,
  MessageSquare,
  PhoneCall,
  ExternalLink,
  ArrowLeft,
  Paperclip,
  Send,
  Palette,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface SiteSettings {
  siteName: string;
  siteLogo: string;
  textColor: string;
  isOnline: boolean;
  accessCode: string;
  promptpayPhone: string;
  promptpayFeeType: "percent" | "baht";
  promptpayFeeValue: number;
  promptpayFeeEnabled: boolean;
  promptpayEnabled: boolean;
  discordClientId: string;
  discordClientSecret: string;
  discordLoginEnabled: boolean;
  bankRecipientName: string;
  bankType: string;
  bankAccountNumber: string;
  bankFeeType: "percent" | "baht";
  bankFeeValue: number;
  bankFeeEnabled: boolean;
  bankEnabled: boolean;
  ghostxApiKey: string;
  primaryColor: string;
  buttonColor: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "NextStore",
  siteLogo: "",
  textColor: "",
  isOnline: true,
  accessCode: "",
  promptpayPhone: "",
  promptpayFeeType: "percent",
  promptpayFeeValue: 0,
  promptpayFeeEnabled: false,
  promptpayEnabled: false,
  discordClientId: "",
  discordClientSecret: "",
  discordLoginEnabled: false,
  bankRecipientName: "",
  bankType: "",
  bankAccountNumber: "",
  bankFeeType: "percent",
  bankFeeValue: 0,
  bankFeeEnabled: false,
  bankEnabled: false,
  ghostxApiKey: "",
  primaryColor: "",
  buttonColor: "",
};

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("nextstore_admin_tab") || "website-settings";
    }
    return "website-settings";
  });
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [showSecret, setShowSecret] = useState(false);
  const [copiedUri, setCopiedUri] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // User management state
  const [userList, setUserList] = useState<any[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userModal, setUserModal] = useState<{
    type: "change-password" | "change-email" | "balance" | "delete" | null;
    user: any | null;
  }>({ type: null, user: null });
  const [userModalInput, setUserModalInput] = useState("");
  const [userModalConfirm, setUserModalConfirm] = useState("");
  const [balanceAction, setBalanceAction] = useState<"add" | "deduct" | "view">("view");
  const [userActionLoading, setUserActionLoading] = useState(false);

  // Topup codes state
  const [topupCodes, setTopupCodes] = useState<any[]>([]);
  const [codesLoading, setCodesLoading] = useState(false);
  const [codeModal, setCodeModal] = useState<{ type: "add" | "edit" | "delete" | null; code: any | null }>({ type: null, code: null });
  const [codeForm, setCodeForm] = useState({ code: "", amount: "", maxUses: "1", expiresAt: "", maxUsesPerUser: "1", status: true });
  const [codeModalLoading, setCodeModalLoading] = useState(false);
  const [deleteCodeConfirm, setDeleteCodeConfirm] = useState("");

  // Dashboard stats state
  const [topupStats, setTopupStats] = useState<{ byUser: any[]; daily: any[]; overall: { total: number; count: number } } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [chartType, setChartType] = useState<"line" | "bar">("bar");

  // Carousel state
  const [carouselImages, setCarouselImages] = useState<{ id: number; imageUrl: string; sortOrder: number }[]>([]);
  const [carouselLoading, setCarouselLoading] = useState(false);
  const [carouselUrlInput, setCarouselUrlInput] = useState("");
  const carouselFileRef = useRef<HTMLInputElement>(null);

  // Announcements state
  const [announcementsList, setAnnouncementsList] = useState<{ id: number; text: string; sortOrder: number }[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [announcementInput, setAnnouncementInput] = useState("");
  const [editingAnnouncement, setEditingAnnouncement] = useState<{ id: number; text: string } | null>(null);

  // Contact channels state
  const [contactChannels, setContactChannels] = useState<{ id: number; platform: string; name: string; url: string; enabled: number }[]>([]);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactForm, setContactForm] = useState({ platform: "facebook", name: "", url: "" });
  const [editingContact, setEditingContact] = useState<{ id: number; platform: string; name: string; url: string } | null>(null);

  // Admin chat state
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [activeChatSession, setActiveChatSession] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const chatLastIdRef = useRef<number>(0);
  const chatPollRef = useRef<NodeJS.Timeout | null>(null);
  const chatFileRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const menuCategories = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      items: [
        { id: "dashboard-topup-stats", label: "สถิติเติมเงิน", icon: <TrendingUp size={18} /> },
        { id: "admin-chat", label: "จัดการแชท", icon: <MessageSquare size={18} /> },
      ],
    },
    {
      label: "จัดการเว็บไซต์",
      icon: <Globe size={18} />,
      items: [
        { id: "website-settings", label: "ตั้งค่าเว็บไซต์", icon: <Settings size={18} /> },
        { id: "theme-settings", label: "ตั้งค่าธีมสีเว็บไซต์", icon: <Palette size={18} /> },
      ],
    },
    {
      label: "จัดการการล็อคอินและช่องทางติดต่อ",
      icon: <LogIn size={18} />,
      items: [
        { id: "login-settings", label: "ตั้งค่าการเข้าสู่ระบบ", icon: <LogIn size={18} /> },
        { id: "contact-channels-settings", label: "ตั้งค่าช่องทางติดต่อ", icon: <PhoneCall size={18} /> },
      ],
    },
    {
      label: "จัดการประกาศ",
      icon: <Megaphone size={18} />,
      items: [
        { id: "carousel-settings", label: "ตั้งค่ารูปภาพสไลด์", icon: <ImageIcon size={18} /> },
        { id: "announcements-settings", label: "ตั้งค่าข้อความประกาศ", icon: <Megaphone size={18} /> },
      ],
    },
    {
      label: "จัดการช่องทางการเติมเงิน",
      icon: <Wallet size={18} />,
      items: [
        { id: "promptpay-settings", label: "ตั้งค่าซองอั่งเปา", icon: <Gift size={18} /> },
        { id: "bank-settings", label: "ตั้งค่าธนาคาร", icon: <Building2 size={18} /> },
        { id: "topup-codes", label: "ตั้งค่าโค้ดเติมเงิน", icon: <Tag size={18} /> },
      ],
    },
    {
      label: "จัดการผู้ใช้งาน",
      icon: <Users size={18} />,
      items: [
        { id: "user-management", label: "ตั้งค่าผู้ใช้งาน", icon: <Users size={18} /> },
      ],
    },
  ];

  const getInitialExpanded = () => {
    const active = new Set<string>();
    menuCategories.forEach((cat) => {
      if (cat.items.some((item) => item.id === activeTab)) {
        active.add(cat.label);
      }
    });
    return active;
  };

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(getInitialExpanded);

  const toggleCategory = (label: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  useEffect(() => {
    const session = localStorage.getItem("nextstore_session");
    if (!session) { router.replace("/"); return; }

    const user = JSON.parse(session);
    if (user.role === "Member" || user.role === "Partner") {
      toast.error("ไม่มีสิทธิ์เข้าถึง", { description: "หน้านี้เฉพาะผู้ดูแลระบบและนักพัฒนาเท่านั้น" });
      router.replace("/");
      return;
    }

    setAdminUser(user);
    setAuthorized(true);

    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        if (data.siteLogo) setLogoPreview(data.siteLogo);
      });

    // Restore saved tab data on mount
    const savedTab = localStorage.getItem("nextstore_admin_tab") || "website-settings";
    if (savedTab === "user-management") fetchUsers();
    if (savedTab === "topup-codes") fetchCodes();
    if (savedTab === "dashboard-topup-stats") fetchTopupStats();
    if (savedTab === "carousel-settings") fetchCarousel();
    if (savedTab === "announcements-settings") fetchAnnouncements();
  }, [router]);

  const fetchUsers = async () => {
    setUserLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) setUserList(await res.json());
    } finally {
      setUserLoading(false);
    }
  };

  const fetchCodes = async () => {
    setCodesLoading(true);
    try {
      const res = await fetch("/api/admin/topup-codes");
      if (res.ok) setTopupCodes(await res.json());
    } finally {
      setCodesLoading(false);
    }
  };

  const fetchTopupStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch("/api/admin/stats/topup");
      if (res.ok) setTopupStats(await res.json());
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchCarousel = async () => {
    setCarouselLoading(true);
    try {
      const res = await fetch("/api/admin/carousel");
      if (res.ok) {
        const d = await res.json();
        setCarouselImages(d.images || []);
      }
    } finally {
      setCarouselLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    setAnnouncementsLoading(true);
    try {
      const res = await fetch("/api/admin/announcements");
      if (res.ok) {
        const d = await res.json();
        setAnnouncementsList(d.announcements || []);
      }
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  const fetchContactChannels = async () => {
    setContactLoading(true);
    try {
      const res = await fetch("/api/admin/contact-channels");
      if (res.ok) setContactChannels((await res.json()).channels || []);
    } finally {
      setContactLoading(false);
    }
  };

  const fetchChatSessions = async () => {
    setChatLoading(true);
    try {
      const res = await fetch("/api/admin/chat-sessions");
      if (res.ok) setChatSessions((await res.json()).sessions || []);
    } finally {
      setChatLoading(false);
    }
  };

  const loadChatMessages = async (sessionId: number, since?: number) => {
    try {
      const url = since
        ? `/api/chat/messages?sessionId=${sessionId}&since=${since}`
        : `/api/chat/messages?sessionId=${sessionId}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      if (data.messages?.length > 0) {
        if (since) {
          setChatMessages(prev => [...prev, ...data.messages]);
        } else {
          setChatMessages(data.messages);
        }
        const lastId = data.messages[data.messages.length - 1].id;
        if (lastId > chatLastIdRef.current) chatLastIdRef.current = lastId;
      }
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch {}
  };

  const openAdminChat = async (session: any) => {
    setActiveChatSession(session);
    setChatMessages([]);
    chatLastIdRef.current = 0;
    await loadChatMessages(session.id);
    if (chatPollRef.current) clearInterval(chatPollRef.current);
    chatPollRef.current = setInterval(() => {
      loadChatMessages(session.id, chatLastIdRef.current || undefined);
    }, 3000);
  };

  const closeAdminChatView = () => {
    setActiveChatSession(null);
    setChatMessages([]);
    if (chatPollRef.current) clearInterval(chatPollRef.current);
  };

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    localStorage.setItem("nextstore_admin_tab", id);
    if (id === "user-management") fetchUsers();
    if (id === "topup-codes") fetchCodes();
    if (id === "dashboard-topup-stats") fetchTopupStats();
    if (id === "carousel-settings") fetchCarousel();
    if (id === "announcements-settings") fetchAnnouncements();
    if (id === "contact-channels-settings") fetchContactChannels();
    if (id === "admin-chat") { closeAdminChatView(); fetchChatSessions(); }
  };

  const handleLogout = () => {
    localStorage.removeItem("nextstore_session");
    toast.success("ออกจากระบบสำเร็จ", { description: "กำลังพากลับหน้าหลัก..." });
    setTimeout(() => router.push("/"), 1000);
  };

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setLogoPreview(url);
      setSettings((prev) => ({ ...prev, siteLogo: url }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (settings.accessCode && !/^\d{6}$/.test(settings.accessCode)) {
      toast.error("รหัสผ่านต้องเป็นตัวเลข 6 หลักเท่านั้น");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/site-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (!res.ok) { setSaving(false); toast.error("บันทึกไม่สำเร็จ"); return; }

    window.dispatchEvent(new Event("nextstore-site-settings-update"));
    if (settings.textColor) {
      document.documentElement.style.setProperty("--foreground", settings.textColor);
      document.documentElement.style.setProperty("--text-primary", settings.textColor);
    } else {
      document.documentElement.style.removeProperty("--foreground");
      document.documentElement.style.removeProperty("--text-primary");
    }
    if (settings.primaryColor) {
      document.documentElement.style.setProperty("--primary", settings.primaryColor);
      document.documentElement.style.setProperty("--primary-hover", settings.primaryColor + "cc");
    } else {
      document.documentElement.style.removeProperty("--primary");
      document.documentElement.style.removeProperty("--primary-hover");
    }
    if (settings.buttonColor) {
      document.documentElement.style.setProperty("--btn-color", settings.buttonColor);
    } else {
      document.documentElement.style.removeProperty("--btn-color");
    }
    setSaving(false);
    toast.success("บันทึกการตั้งค่าเรียบร้อยแล้ว");
  };

  if (!authorized) return null;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.7rem 1rem",
    borderRadius: "8px",
    border: "1px solid var(--navbar-border)",
    background: "var(--background)",
    color: "var(--foreground)",
    fontSize: "0.95rem",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "var(--text-secondary)",
    marginBottom: "0.4rem",
    display: "block",
  };

  const fieldStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--background)", color: "var(--text-primary)" }}>

      {/* Mobile overlay backdrop */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", top: "70px", left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", zIndex: 99 }} />
      )}

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? "260px" : (isMobile ? "0px" : "72px"),
        backgroundColor: "var(--background)",
        borderRight: isMobile ? "none" : "1px solid var(--navbar-border)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: isMobile ? "fixed" : "sticky",
        top: "70px",
        left: 0,
        height: "calc(100vh - 70px)",
        zIndex: 100,
        overflow: "hidden",
        boxShadow: isMobile && sidebarOpen ? "var(--shadow-premium)" : "none",
      }}>
        {/* Header */}
        <div style={{
          padding: "1.25rem",
          borderBottom: "1px solid var(--navbar-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: sidebarOpen ? "space-between" : "center",
          minHeight: "70px",
        }}>
          {sidebarOpen ? (
            <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--primary)" }}>NextStore Admin</span>
          ) : (
            <span style={{ fontSize: "1rem", fontWeight: "800", color: "var(--primary)" }}>NS</span>
          )}
          {sidebarOpen && (
            <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", display: "flex" }}>
              <ChevronLeft size={20} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem", overflowY: "auto" }}>
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} style={{
              alignSelf: "center", background: "var(--primary-light)", border: "none",
              color: "var(--primary)", borderRadius: "8px", padding: "0.5rem",
              cursor: "pointer", marginBottom: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ChevronRight size={20} />
            </button>
          )}

          {menuCategories.map((cat) => {
            const isExpanded = expandedCategories.has(cat.label);
            const hasCatActive = cat.items.some((i) => i.id === activeTab);
            return (
            <div key={cat.label} style={{ marginBottom: "0.25rem" }}>
              {/* Category Header */}
              {sidebarOpen ? (
                <button
                  onClick={() => toggleCategory(cat.label)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    width: "100%", padding: "0.5rem 0.75rem", borderRadius: "8px",
                    border: "none", background: hasCatActive && !isExpanded ? "var(--primary-light)" : "transparent",
                    color: hasCatActive ? "var(--primary)" : "var(--text-secondary)",
                    cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--primary-light)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = hasCatActive && !isExpanded ? "var(--primary-light)" : "transparent"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span>{cat.icon}</span>
                    <span style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {cat.label}
                    </span>
                  </div>
                  <span style={{ transition: "transform 0.25s", transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)", display: "flex" }}>
                    <ChevronDown size={15} />
                  </span>
                </button>
              ) : (
                <div style={{ display: "flex", justifyContent: "center", padding: "0.4rem 0", color: "var(--primary)", opacity: 0.5 }}>
                  {cat.icon}
                </div>
              )}

              {/* Category Items */}
              {(sidebarOpen ? isExpanded : true) && cat.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    title={!sidebarOpen ? item.label : undefined}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: sidebarOpen ? "flex-start" : "center",
                      gap: sidebarOpen ? "0.75rem" : "0",
                      padding: "0.65rem 1rem",
                      paddingLeft: sidebarOpen ? "2rem" : "1rem",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: isActive ? "var(--primary-light)" : "transparent",
                      color: isActive ? "var(--primary)" : "var(--text-secondary)",
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "left",
                      fontWeight: isActive ? "600" : "500",
                      fontSize: "0.875rem",
                      transition: "all 0.2s",
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "var(--primary-light)"; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    {item.icon}
                    {sidebarOpen && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: "1rem 0.75rem", borderTop: "1px solid var(--navbar-border)", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {sidebarOpen ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", fontWeight: "700", flexShrink: 0 }}>
                {adminUser?.username?.substring(0, 2).toUpperCase()}
              </div>
              <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{adminUser?.username}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{adminUser?.role}</span>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "center", padding: "0.5rem" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", fontWeight: "700" }}>
                {adminUser?.username?.substring(0, 2).toUpperCase()}
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            title="ออกจากระบบ"
            style={{
              display: "flex", alignItems: "center",
              justifyContent: sidebarOpen ? "flex-start" : "center",
              gap: sidebarOpen ? "0.75rem" : "0",
              padding: "0.75rem 1rem", borderRadius: "8px", border: "none",
              backgroundColor: "rgba(239,68,68,0.1)", color: "#f87171",
              cursor: "pointer", width: "100%", fontWeight: "600", transition: "all 0.2s", fontFamily: "inherit",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.2)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.1)"}
          >
            <LogOut size={20} />
            {sidebarOpen && <span style={{ fontSize: "0.95rem" }}>ออกจากระบบ</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "clamp(1rem, 3vw, 2rem)", overflowY: "auto", height: "calc(100vh - 70px)", minWidth: 0 }}>
        <header style={{ borderBottom: "1px solid var(--navbar-border)", paddingBottom: "1rem", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)}
                style={{ background: "none", border: "1px solid var(--navbar-border)", borderRadius: "8px", padding: "0.4rem 0.6rem", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center", flexShrink: 0 }}>
                <ChevronRight size={18} />
              </button>
            )}
          <h1 style={{ fontSize: "clamp(1.2rem, 4vw, 1.6rem)", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>
            {activeTab === "website-settings" && "ตั้งค่าเว็บไซต์"}
            {activeTab === "login-settings" && "ตั้งค่าการเข้าสู่ระบบ"}
            {activeTab === "promptpay-settings" && "ตั้งค่าซองอั่งเปา"}
            {activeTab === "bank-settings" && "ตั้งค่าธนาคาร"}
            {activeTab === "user-management" && "จัดการผู้ใช้งาน"}
            {activeTab === "topup-codes" && "ตั้งค่าโค้ดเติมเงิน"}
            {activeTab === "dashboard-topup-stats" && "สถิติเติมเงิน"}
            {activeTab === "carousel-settings" && "ตั้งค่ารูปภาพสไลด์"}
            {activeTab === "announcements-settings" && "ตั้งค่าข้อความประกาศ"}
            {activeTab === "contact-channels-settings" && "ตั้งค่าช่องทางติดต่อ"}
            {activeTab === "admin-chat" && "จัดการแชทติดต่อ"}
            {activeTab === "theme-settings" && "ตั้งค่าธีมสีเว็บไซต์"}
          </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
            {activeTab === "website-settings" && "กำหนดชื่อ โลโก้ สี และสถานะการเข้าใช้งานเว็บไซต์"}
            {activeTab === "login-settings" && "กำหนดช่องทางการเข้าสู่ระบบของผู้ใช้"}
            {activeTab === "promptpay-settings" && "กำหนดการรับเงินผ่านซองอั่งเปา PromptPay"}
            {activeTab === "bank-settings" && "กำหนดการรับเงินผ่านการโอนธนาคาร (แนปสลิป)"}
            {activeTab === "user-management" && "ดูและจัดการบัญชีผู้ใช้ทั้งหมดในระบบ"}
            {activeTab === "topup-codes" && "สร้างและจัดการโค้ดเติมเงินสำหรับผู้ใช้"}
            {activeTab === "dashboard-topup-stats" && "ภาพรวมยอดเติมเงินของผู้ใช้ทั้งหมดในระบบ"}
            {activeTab === "carousel-settings" && "จัดการรูปภาพที่แสดงในสไลด์บนหน้าแรก"}
            {activeTab === "announcements-settings" && "จัดการข้อความประกาศที่เลื่อนแสดงใต้สไลด์"}
            {activeTab === "contact-channels-settings" && "กำหนดช่องทางการติดต่อเช่น Facebook, Line และอื่นๆ"}
            {activeTab === "admin-chat" && "ดูและตอบกลับแชทจากผู้ใช้ที่ต้องการติดต่อ Support"}
            {activeTab === "theme-settings" && "กำหนดสีหลัก สีข้อความ และสีปุ่มของเว็บไซต์"}
          </p>
        </header>

        {activeTab === "website-settings" && (
          <div style={{ maxWidth: "640px", display: "flex", flexDirection: "column", gap: "1.75rem" }}>

            {/* Site Name */}
            <div style={fieldStyle}>
              <label style={labelStyle}>ชื่อเว็บไซต์</label>
              <input
                style={inputStyle}
                value={settings.siteName}
                onChange={(e) => setSettings((p) => ({ ...p, siteName: e.target.value }))}
                placeholder="เช่น NextStore"
                onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                onBlur={(e) => e.target.style.borderColor = "var(--navbar-border)"}
              />
            </div>

            {/* Logo */}
            <div style={fieldStyle}>
              <label style={labelStyle}>โลโก้เว็บไซต์</label>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                {logoPreview ? (
                  <img src={logoPreview} alt="logo preview" style={{ width: "64px", height: "64px", objectFit: "contain", borderRadius: "8px", border: "1px solid var(--navbar-border)", background: "var(--primary-light)" }} />
                ) : (
                  <div style={{ width: "64px", height: "64px", borderRadius: "8px", border: "1px dashed var(--navbar-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                    <Upload size={24} />
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid var(--navbar-border)", background: "var(--primary-light)", color: "var(--primary)", cursor: "pointer", fontWeight: "600", fontSize: "0.875rem", fontFamily: "inherit" }}
                  >
                    อัพโหลดโลโก้
                  </button>
                  {logoPreview && (
                    <button
                      onClick={() => { setLogoPreview(""); setSettings((p) => ({ ...p, siteLogo: "" })); }}
                      style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: "none", background: "transparent", color: "#f87171", cursor: "pointer", fontSize: "0.875rem", fontFamily: "inherit" }}
                    >
                      ลบโลโก้
                    </button>
                  )}
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoFile} />
              <input
                style={{ ...inputStyle, marginTop: "0.5rem" }}
                value={settings.siteLogo.startsWith("data:") ? "" : settings.siteLogo}
                onChange={(e) => { setSettings((p) => ({ ...p, siteLogo: e.target.value })); setLogoPreview(e.target.value); }}
                placeholder="หรือวาง URL รูปภาพโลโก้"
                onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                onBlur={(e) => e.target.style.borderColor = "var(--navbar-border)"}
              />
            </div>

            {/* Text Color */}
            <div style={fieldStyle}>
              <label style={labelStyle}>สีข้อความทั้งเว็บไซต์</label>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <input
                  type="color"
                  value={settings.textColor || "#0f172a"}
                  onChange={(e) => setSettings((p) => ({ ...p, textColor: e.target.value }))}
                  style={{ width: "48px", height: "40px", borderRadius: "8px", border: "1px solid var(--navbar-border)", cursor: "pointer", padding: "2px", background: "var(--background)" }}
                />
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  value={settings.textColor}
                  onChange={(e) => setSettings((p) => ({ ...p, textColor: e.target.value }))}
                  placeholder="เช่น #0f172a หรือเว้นว่างใช้ค่าเริ่มต้น"
                  onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--navbar-border)"}
                />
                {settings.textColor && (
                  <button onClick={() => setSettings((p) => ({ ...p, textColor: "" }))} style={{ padding: "0.5rem 0.75rem", border: "none", background: "transparent", color: "#f87171", cursor: "pointer", fontSize: "0.85rem", fontFamily: "inherit" }}>
                    รีเซ็ต
                  </button>
                )}
              </div>
            </div>

            {/* Online/Offline Toggle */}
            <div style={{ ...fieldStyle }}>
              <label style={labelStyle}>สถานะเว็บไซต์</label>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", borderRadius: "10px", border: "1px solid var(--navbar-border)", background: settings.isOnline ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.06)" }}>
                <button
                  onClick={() => setSettings((p) => ({ ...p, isOnline: !p.isOnline }))}
                  style={{
                    width: "52px", height: "28px", borderRadius: "14px", border: "none",
                    background: settings.isOnline ? "#10b981" : "#ef4444",
                    cursor: "pointer", position: "relative", transition: "background 0.3s", flexShrink: 0,
                  }}
                >
                  <span style={{
                    position: "absolute", top: "3px",
                    left: settings.isOnline ? "27px" : "3px",
                    width: "22px", height: "22px", borderRadius: "50%",
                    background: "white", transition: "left 0.3s",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                  }} />
                </button>
                <div>
                  <p style={{ margin: 0, fontWeight: "600", color: settings.isOnline ? "#10b981" : "#ef4444", fontSize: "0.95rem" }}>
                    {settings.isOnline ? "ออนไลน์ — เปิดให้เข้าใช้งาน" : "ออฟไลน์ — ปิดปรับปรุงชั่วคราว"}
                  </p>
                  <p style={{ margin: "0.2rem 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {settings.isOnline ? "ผู้เยี่ยมชมสามารถเข้าใช้งานได้ตามปกติ" : "จะแสดง Popup แจ้งเตือนแก่ผู้เยี่ยมชม"}
                  </p>
                </div>
              </div>
            </div>

            {/* Access Code (for offline bypass) */}
            <div style={fieldStyle}>
              <label style={labelStyle}>รหัสผ่านเข้าเว็บขณะออฟไลน์ (6 หลัก)</label>
              <input
                style={inputStyle}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={settings.accessCode}
                onChange={(e) => setSettings((p) => ({ ...p, accessCode: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                placeholder="ตั้งรหัส 6 หลักสำหรับเข้าเว็บขณะออฟไลน์"
                onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                onBlur={(e) => e.target.style.borderColor = "var(--navbar-border)"}
              />
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                ผู้ใช้ที่ทราบรหัสนี้สามารถเข้าเว็บขณะออฟไลน์ได้ โดยกรอกแค่ครั้งเดียวต่ออุปกรณ์
              </span>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                padding: "0.8rem 2rem", borderRadius: "10px", border: "none",
                background: "var(--primary)", color: "white",
                fontWeight: "700", fontSize: "1rem", cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1, transition: "all 0.2s", fontFamily: "inherit",
                alignSelf: "flex-start",
              }}
              onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = "var(--primary-hover)"; }}
              onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = "var(--primary)"; }}
            >
              <Save size={18} />
              {saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
            </button>
          </div>
        )}

        {/* PromptPay Settings */}
        {activeTab === "promptpay-settings" && (
          <div style={{ maxWidth: "640px", display: "flex", flexDirection: "column", gap: "1.75rem" }}>

            {/* Enable/Disable */}
            <div style={fieldStyle}>
              <label style={labelStyle}>สถานะการเติมเงินผ่านซองอั่งเปา</label>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", borderRadius: "10px", border: "1px solid var(--navbar-border)", background: settings.promptpayEnabled ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.06)" }}>
                <button
                  onClick={() => setSettings((p) => ({ ...p, promptpayEnabled: !p.promptpayEnabled }))}
                  style={{ width: "52px", height: "28px", borderRadius: "14px", border: "none", background: settings.promptpayEnabled ? "#10b981" : "#ef4444", cursor: "pointer", position: "relative", transition: "background 0.3s", flexShrink: 0 }}
                >
                  <span style={{ position: "absolute", top: "3px", left: settings.promptpayEnabled ? "27px" : "3px", width: "22px", height: "22px", borderRadius: "50%", background: "white", transition: "left 0.3s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
                </button>
                <div>
                  <p style={{ margin: 0, fontWeight: "600", color: settings.promptpayEnabled ? "#10b981" : "#ef4444", fontSize: "0.95rem" }}>
                    {settings.promptpayEnabled ? "เปิดใช้งาน — รับเงินผ่านซองอั่งเปา" : "ปิดใช้งาน — ไม่รับเงินผ่านซองอั่งเปา"}
                  </p>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div style={fieldStyle}>
              <label style={labelStyle}>เบอร์ผู้รับเงิน (PromptPay)</label>
              <input
                style={inputStyle}
                type="tel"
                value={settings.promptpayPhone}
                onChange={(e) => setSettings((p) => ({ ...p, promptpayPhone: e.target.value }))}
                placeholder="เช่น 0812345678"
                onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                onBlur={(e) => e.target.style.borderColor = "var(--navbar-border)"}
              />
            </div>

            {/* Fee Toggle */}
            <div style={fieldStyle}>
              <label style={labelStyle}>หักค่าธรรมเนียมก่อนเพิ่ม Point</label>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", borderRadius: "10px", border: "1px solid var(--navbar-border)", background: settings.promptpayFeeEnabled ? "rgba(79,70,229,0.06)" : "transparent" }}>
                <button
                  onClick={() => setSettings((p) => ({ ...p, promptpayFeeEnabled: !p.promptpayFeeEnabled }))}
                  style={{ width: "52px", height: "28px", borderRadius: "14px", border: "none", background: settings.promptpayFeeEnabled ? "var(--primary)" : "var(--text-muted)", cursor: "pointer", position: "relative", transition: "background 0.3s", flexShrink: 0 }}
                >
                  <span style={{ position: "absolute", top: "3px", left: settings.promptpayFeeEnabled ? "27px" : "3px", width: "22px", height: "22px", borderRadius: "50%", background: "white", transition: "left 0.3s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
                </button>
                <div>
                  <p style={{ margin: 0, fontWeight: "600", color: settings.promptpayFeeEnabled ? "var(--primary)" : "var(--text-muted)", fontSize: "0.95rem" }}>
                    {settings.promptpayFeeEnabled ? "เปิด — หักค่าธรรมเนียมก่อนเพิ่ม Point" : "ปิด — ไม่หักค่าธรรมเนียม"}
                  </p>
                </div>
              </div>
            </div>

            {/* Fee Amount */}
            <div style={fieldStyle}>
              <label style={labelStyle}>ค่าธรรมเนียม</label>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                {/* Type toggle */}
                <div style={{ display: "flex", background: "var(--navbar-border)", borderRadius: "8px", padding: "2px", flexShrink: 0 }}>
                  {(["percent", "baht"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setSettings((p) => ({ ...p, promptpayFeeType: t }))}
                      style={{ padding: "0.4rem 0.8rem", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem", fontFamily: "inherit", background: settings.promptpayFeeType === t ? "var(--primary)" : "transparent", color: settings.promptpayFeeType === t ? "white" : "var(--text-secondary)", transition: "all 0.2s" }}
                    >
                      {t === "percent" ? "%" : "฿"}
                    </button>
                  ))}
                </div>
                <div style={{ position: "relative", flex: 1 }}>
                  <input
                    style={{ ...inputStyle }}
                    type="number"
                    min={0}
                    step={settings.promptpayFeeType === "percent" ? 0.1 : 1}
                    value={settings.promptpayFeeValue}
                    onChange={(e) => setSettings((p) => ({ ...p, promptpayFeeValue: parseFloat(e.target.value) || 0 }))}
                    placeholder={settings.promptpayFeeType === "percent" ? "เช่น 1.5" : "เช่น 10"}
                    onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                    onBlur={(e) => e.target.style.borderColor = "var(--navbar-border)"}
                  />
                  <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "0.9rem", pointerEvents: "none" }}>
                    {settings.promptpayFeeType === "percent" ? "%" : "บาท"}
                  </span>
                </div>
              </div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                ตัวอย่าง: เติม 100 บาท → Point ที่ได้ = {
                  settings.promptpayFeeEnabled
                    ? settings.promptpayFeeType === "percent"
                      ? (100 - 100 * settings.promptpayFeeValue / 100).toFixed(2)
                      : (100 - settings.promptpayFeeValue).toFixed(2)
                    : "100.00"
                } Point
              </span>
            </div>

            {/* Save */}
            <button onClick={handleSave} disabled={saving} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.8rem 2rem", borderRadius: "10px", border: "none", background: "var(--primary)", color: "white", fontWeight: "700", fontSize: "1rem", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, transition: "all 0.2s", fontFamily: "inherit", alignSelf: "flex-start" }}
              onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = "var(--primary-hover)"; }}
              onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = "var(--primary)"; }}>
              <Save size={18} />{saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
            </button>
          </div>
        )}

        {/* Login Settings */}
        {activeTab === "login-settings" && (
          <div style={{ maxWidth: "640px", display: "flex", flexDirection: "column", gap: "1.75rem" }}>

            {/* Discord Section */}
            <div style={{ padding: "1.25rem", borderRadius: "12px", border: "1px solid var(--navbar-border)", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#5865F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: "700", color: "var(--text-primary)" }}>Discord Login</p>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>อนุญาตให้ผู้ใช้เข้าสู่ระบบผ่าน Discord OAuth</p>
                </div>
                <button
                  onClick={() => setSettings((p) => ({ ...p, discordLoginEnabled: !p.discordLoginEnabled }))}
                  style={{ width: "52px", height: "28px", borderRadius: "14px", border: "none", background: settings.discordLoginEnabled ? "#5865F2" : "var(--text-muted)", cursor: "pointer", position: "relative", transition: "background 0.3s", flexShrink: 0 }}
                >
                  <span style={{ position: "absolute", top: "3px", left: settings.discordLoginEnabled ? "27px" : "3px", width: "22px", height: "22px", borderRadius: "50%", background: "white", transition: "left 0.3s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
                </button>
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Client ID</label>
                <input
                  style={inputStyle}
                  value={settings.discordClientId}
                  onChange={(e) => setSettings((p) => ({ ...p, discordClientId: e.target.value }))}
                  placeholder="Discord Application Client ID"
                  onFocus={(e) => e.target.style.borderColor = "#5865F2"}
                  onBlur={(e) => e.target.style.borderColor = "var(--navbar-border)"}
                />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Client Secret</label>
                <div style={{ position: "relative" }}>
                  <input
                    style={{ ...inputStyle, paddingRight: "2.75rem" }}
                    type={showSecret ? "text" : "password"}
                    value={settings.discordClientSecret}
                    onChange={(e) => setSettings((p) => ({ ...p, discordClientSecret: e.target.value }))}
                    placeholder="Discord Application Client Secret"
                    onFocus={(e) => e.target.style.borderColor = "#5865F2"}
                    onBlur={(e) => e.target.style.borderColor = "var(--navbar-border)"}
                  />
                  <button onClick={() => setShowSecret(!showSecret)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                    {showSecret ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Redirect URI (คัดลอกไปใส่ใน Discord Developer Portal)</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    style={{ ...inputStyle, background: "rgba(88,101,242,0.05)", cursor: "default", flex: 1 }}
                    readOnly
                    value={typeof window !== "undefined" ? `${window.location.origin}/api/auth/discord/callback` : "/api/auth/discord/callback"}
                  />
                  <button
                    onClick={() => {
                      const uri = `${window.location.origin}/api/auth/discord/callback`;
                      navigator.clipboard.writeText(uri);
                      setCopiedUri(true);
                      setTimeout(() => setCopiedUri(false), 2000);
                    }}
                    style={{ padding: "0 1rem", borderRadius: "8px", border: "1px solid var(--navbar-border)", background: copiedUri ? "rgba(16,185,129,0.1)" : "var(--primary-light)", color: copiedUri ? "#10b981" : "var(--primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: "inherit", fontWeight: "600", fontSize: "0.85rem", whiteSpace: "nowrap", transition: "all 0.2s" }}
                  >
                    {copiedUri ? <><Check size={15} /> คัดลอกแล้ว</> : <><Copy size={15} /> คัดลอก</>}
                  </button>
                </div>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  ไปที่ discord.com/developers → Applications → OAuth2 → Redirects แล้ววาง URI นี้
                </span>
              </div>
            </div>

            {/* Save */}
            <button onClick={handleSave} disabled={saving} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.8rem 2rem", borderRadius: "10px", border: "none", background: "var(--primary)", color: "white", fontWeight: "700", fontSize: "1rem", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, transition: "all 0.2s", fontFamily: "inherit", alignSelf: "flex-start" }}
              onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = "var(--primary-hover)"; }}
              onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = "var(--primary)"; }}>
              <Save size={18} />{saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
            </button>
          </div>
        )}

        {/* Bank Settings */}
        {activeTab === "bank-settings" && (
          <div style={{ maxWidth: "640px", display: "flex", flexDirection: "column", gap: "1.75rem" }}>

            {/* Enable/Disable */}
            <div style={fieldStyle}>
              <label style={labelStyle}>สถานะการรับเงินผ่านธนาคาร</label>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", borderRadius: "10px", border: "1px solid var(--navbar-border)", background: settings.bankEnabled ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.06)" }}>
                <button onClick={() => setSettings((p) => ({ ...p, bankEnabled: !p.bankEnabled }))}
                  style={{ width: "52px", height: "28px", borderRadius: "14px", border: "none", background: settings.bankEnabled ? "#10b981" : "#ef4444", cursor: "pointer", position: "relative", transition: "background 0.3s", flexShrink: 0 }}>
                  <span style={{ position: "absolute", top: "3px", left: settings.bankEnabled ? "27px" : "3px", width: "22px", height: "22px", borderRadius: "50%", background: "white", transition: "left 0.3s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
                </button>
                <p style={{ margin: 0, fontWeight: "600", color: settings.bankEnabled ? "#10b981" : "#ef4444", fontSize: "0.95rem" }}>
                  {settings.bankEnabled ? "เปิดใช้งาน — รับโอนผ่านธนาคาร" : "ปิดใช้งาน — ไม่รับโอนผ่านธนาคาร"}
                </p>
              </div>
            </div>

            {/* Recipient Name */}
            <div style={fieldStyle}>
              <label style={labelStyle}>ชื่อ / นามสกุลผู้รับเงิน</label>
              <input style={inputStyle} value={settings.bankRecipientName}
                onChange={(e) => setSettings((p) => ({ ...p, bankRecipientName: e.target.value }))}
                placeholder="เช่น นาย สมชาย ใจดี"
                onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                onBlur={(e) => e.target.style.borderColor = "var(--navbar-border)"} />
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", padding: "0.5rem 0.75rem", background: "rgba(79,70,229,0.05)", borderRadius: "8px", border: "1px solid var(--navbar-border)" }}>
                ตัวอย่าง: ชื่อที่จะแสดงบนหน้าเติมเงิน คือ &quot;โอนมาที่ <strong>นาย สมชาย ใจดี</strong>&quot;
              </span>
            </div>

            {/* Bank Type */}
            <div style={fieldStyle}>
              <label style={labelStyle}>ประเภทธนาคาร</label>
              <select style={{ ...inputStyle, cursor: "pointer" }}
                value={settings.bankType}
                onChange={(e) => setSettings((p) => ({ ...p, bankType: e.target.value }))}
                onFocus={(e) => (e.target as HTMLSelectElement).style.borderColor = "var(--primary)"}
                onBlur={(e) => (e.target as HTMLSelectElement).style.borderColor = "var(--navbar-border)"}>
                <option value="">-- เลือกธนาคาร --</option>
                <option value="kbank">ธนาคารกสิกรไทย (KBank)</option>
                <option value="scb">ธนาคารไทยพาณิชย์ (SCB)</option>
                <option value="bbl">ธนาคารกรุงเทพ (BBL)</option>
                <option value="ktb">ธนาคารกรุงไทย (KTB)</option>
                <option value="bay">ธนาคารกรุงศรีอยุธยา (BAY)</option>
                <option value="tmb">ธนาคารทหารไทยธนชาต (TTB)</option>
                <option value="gsb">ธนาคารออมสิน (GSB)</option>
                <option value="baac">ธ.ก.ส. (BAAC)</option>
                <option value="uob">ธนาคารยูโอบี (UOB)</option>
                <option value="cimb">ธนาคารซีไอเอ็มบี (CIMB)</option>
              </select>
            </div>

            {/* Account Number */}
            <div style={fieldStyle}>
              <label style={labelStyle}>เลขบัญชีธนาคาร</label>
              <input style={inputStyle} type="text" value={settings.bankAccountNumber}
                onChange={(e) => setSettings((p) => ({ ...p, bankAccountNumber: e.target.value }))}
                placeholder="เช่น 1234567890"
                onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                onBlur={(e) => e.target.style.borderColor = "var(--navbar-border)"} />
            </div>

            {/* Fee Toggle */}
            <div style={fieldStyle}>
              <label style={labelStyle}>หักค่าธรรมเนียมก่อนเพิ่ม Point</label>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", borderRadius: "10px", border: "1px solid var(--navbar-border)", background: settings.bankFeeEnabled ? "rgba(79,70,229,0.06)" : "transparent" }}>
                <button onClick={() => setSettings((p) => ({ ...p, bankFeeEnabled: !p.bankFeeEnabled }))}
                  style={{ width: "52px", height: "28px", borderRadius: "14px", border: "none", background: settings.bankFeeEnabled ? "var(--primary)" : "var(--text-muted)", cursor: "pointer", position: "relative", transition: "background 0.3s", flexShrink: 0 }}>
                  <span style={{ position: "absolute", top: "3px", left: settings.bankFeeEnabled ? "27px" : "3px", width: "22px", height: "22px", borderRadius: "50%", background: "white", transition: "left 0.3s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
                </button>
                <p style={{ margin: 0, fontWeight: "600", color: settings.bankFeeEnabled ? "var(--primary)" : "var(--text-muted)", fontSize: "0.95rem" }}>
                  {settings.bankFeeEnabled ? "เปิด — หักค่าธรรมเนียมก่อนเพิ่ม Point" : "ปิด — ไม่หักค่าธรรมเนียม"}
                </p>
              </div>
            </div>

            {/* Fee Amount */}
            <div style={fieldStyle}>
              <label style={labelStyle}>ค่าธรรมเนียม</label>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <div style={{ display: "flex", background: "var(--navbar-border)", borderRadius: "8px", padding: "2px", flexShrink: 0 }}>
                  {(["percent", "baht"] as const).map((t) => (
                    <button key={t} onClick={() => setSettings((p) => ({ ...p, bankFeeType: t }))}
                      style={{ padding: "0.4rem 0.8rem", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem", fontFamily: "inherit", background: settings.bankFeeType === t ? "var(--primary)" : "transparent", color: settings.bankFeeType === t ? "white" : "var(--text-secondary)", transition: "all 0.2s" }}>
                      {t === "percent" ? "%" : "฿"}
                    </button>
                  ))}
                </div>
                <div style={{ position: "relative", flex: 1 }}>
                  <input style={{ ...inputStyle }} type="number" min={0} step={settings.bankFeeType === "percent" ? 0.1 : 1}
                    value={settings.bankFeeValue}
                    onChange={(e) => setSettings((p) => ({ ...p, bankFeeValue: parseFloat(e.target.value) || 0 }))}
                    placeholder={settings.bankFeeType === "percent" ? "เช่น 1.5" : "เช่น 10"}
                    onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                    onBlur={(e) => e.target.style.borderColor = "var(--navbar-border)"} />
                  <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "0.9rem", pointerEvents: "none" }}>
                    {settings.bankFeeType === "percent" ? "%" : "บาท"}
                  </span>
                </div>
              </div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                ตัวอย่าง: โอน 100 บาท → Point = {settings.bankFeeEnabled ? settings.bankFeeType === "percent" ? (100 - 100 * settings.bankFeeValue / 100).toFixed(2) : (100 - settings.bankFeeValue).toFixed(2) : "100.00"}
              </span>
            </div>

            {/* Save */}
            <button onClick={handleSave} disabled={saving}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.8rem 2rem", borderRadius: "10px", border: "none", background: "var(--primary)", color: "white", fontWeight: "700", fontSize: "1rem", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, transition: "all 0.2s", fontFamily: "inherit", alignSelf: "flex-start" }}
              onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = "var(--primary-hover)"; }}
              onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = "var(--primary)"; }}>
              <Save size={18} />{saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
            </button>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === "user-management" && (
          <div style={{ maxWidth: "900px", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* Reload button */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={fetchUsers}
                disabled={userLoading}
                style={{ padding: "0.5rem 1.25rem", borderRadius: "8px", border: "1px solid var(--navbar-border)", background: "var(--primary-light)", color: "var(--primary)", cursor: "pointer", fontWeight: "600", fontSize: "0.875rem", fontFamily: "inherit", opacity: userLoading ? 0.6 : 1 }}
              >
                {userLoading ? "กำลังโหลด..." : "รีเฟรช"}
              </button>
            </div>

            {/* User Table */}
            {userList.length === 0 && !userLoading ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", border: "1px dashed var(--navbar-border)", borderRadius: "12px" }}>
                ไม่พบผู้ใช้ในระบบ
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {userList.map((u) => (
                  <div key={u.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem", border: "1px solid var(--navbar-border)", borderRadius: "12px", background: "var(--background)", flexWrap: "wrap" }}>
                    {/* Avatar */}
                    <div style={{ width: "44px", height: "44px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", fontWeight: "700", fontSize: "1rem" }}>
                      {u.profileImage ? <img src={u.profileImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : u.username?.substring(0, 2).toUpperCase()}
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: "160px" }}>
                      <p style={{ margin: 0, fontWeight: "700", color: "var(--text-primary)", fontSize: "0.95rem" }}>{u.username}</p>
                      <p style={{ margin: "0.1rem 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>{u.email}</p>
                    </div>
                    {/* Balance badge */}
                    <div style={{ padding: "0.3rem 0.75rem", borderRadius: "999px", background: "var(--primary-light)", color: "var(--primary)", fontSize: "0.85rem", fontWeight: "700", whiteSpace: "nowrap" }}>
                      ฿{Number(u.balance ?? 0).toFixed(2)}
                    </div>
                    {/* Actions */}
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      <button onClick={() => { setUserModal({ type: "change-password", user: u }); setUserModalInput(""); setUserModalConfirm(""); }}
                        style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.4rem 0.75rem", borderRadius: "8px", border: "1px solid var(--navbar-border)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.8rem", fontFamily: "inherit", fontWeight: "600" }}>
                        <Pencil size={13} /> รหัสผ่าน
                      </button>
                      <button onClick={() => { setUserModal({ type: "change-email", user: u }); setUserModalInput(""); setUserModalConfirm(""); }}
                        style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.4rem 0.75rem", borderRadius: "8px", border: "1px solid var(--navbar-border)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.8rem", fontFamily: "inherit", fontWeight: "600" }}>
                        <Pencil size={13} /> อีเมล
                      </button>
                      <button onClick={() => { setUserModal({ type: "balance", user: u }); setUserModalInput(""); setBalanceAction("view"); }}
                        style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.4rem 0.75rem", borderRadius: "8px", border: "1px solid var(--navbar-border)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.8rem", fontFamily: "inherit", fontWeight: "600" }}>
                        <DollarSign size={13} /> ยอดเงิน
                      </button>
                      <button onClick={() => { setUserModal({ type: "delete", user: u }); setUserModalConfirm(""); }}
                        style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.4rem 0.75rem", borderRadius: "8px", border: "none", background: "rgba(239,68,68,0.1)", color: "#ef4444", cursor: "pointer", fontSize: "0.8rem", fontFamily: "inherit", fontWeight: "600" }}>
                        <Trash2 size={13} /> ลบ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Dashboard — Topup Stats */}
        {activeTab === "dashboard-topup-stats" && (() => {
          const daily = topupStats?.daily ?? [];
          const byUser = topupStats?.byUser ?? [];
          const overall = topupStats?.overall ?? { total: 0, count: 0 };

          // Build a full 30-day window
          const days30: { day: string; label: string; total: number }[] = [];
          for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            const found = daily.find((r: any) => r.day === key);
            days30.push({ day: key, label: key.slice(5), total: found ? found.total : 0 });
          }

          const chartData = days30;

          const CustomTooltip = ({ active, payload, label }: any) => {
            if (!active || !payload?.length) return null;
            return (
              <div style={{ background: "var(--background)", border: "1px solid var(--navbar-border)", borderRadius: "8px", padding: "0.6rem 0.85rem", fontSize: "0.82rem", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <p style={{ margin: 0, color: "var(--text-secondary)", fontWeight: "600" }}>{label}</p>
                <p style={{ margin: "0.2rem 0 0", color: "var(--primary)", fontWeight: "700" }}>
                  ฿{Number(payload[0].value).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </p>
              </div>
            );
          };

          return (
            <div style={{ maxWidth: "900px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Refresh */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={fetchTopupStats} disabled={statsLoading}
                  style={{ padding: "0.5rem 1.25rem", borderRadius: "8px", border: "1px solid var(--navbar-border)", background: "var(--primary-light)", color: "var(--primary)", cursor: "pointer", fontWeight: "600", fontSize: "0.875rem", fontFamily: "inherit", opacity: statsLoading ? 0.6 : 1 }}>
                  {statsLoading ? "กำลังโหลด..." : "รีเฟรช"}
                </button>
              </div>

              {/* Summary Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
                {[
                  { label: "ยอดเติมรวมทั้งหมด", value: `฿${Number(overall.total ?? 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}`, color: "var(--primary)" },
                  { label: "จำนวนรายการ", value: `${overall.count ?? 0} ครั้ง`, color: "#10b981" },
                  { label: "ผู้ใช้ที่เติมเงิน", value: `${byUser.length} คน`, color: "#f59e0b" },
                ].map(c => (
                  <div key={c.label} style={{ padding: "1.25rem", borderRadius: "12px", border: "1px solid var(--navbar-border)", background: "var(--background)" }}>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em" }}>{c.label}</p>
                    <p style={{ margin: "0.4rem 0 0", fontSize: "1.5rem", fontWeight: "800", color: c.color }}>{c.value}</p>
                  </div>
                ))}
              </div>

              {/* Chart Card */}
              <div style={{ border: "1px solid var(--navbar-border)", borderRadius: "12px", background: "var(--background)", padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: "700", color: "var(--text-primary)", fontSize: "0.95rem" }}>ยอดเติมเงินรายวัน (30 วันล่าสุด)</p>
                  </div>
                  {/* Chart type toggle */}
                  <div style={{ display: "flex", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--navbar-border)" }}>
                    {(["bar", "line"] as const).map(t => (
                      <button key={t} onClick={() => setChartType(t)}
                        style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.4rem 0.8rem", border: "none", background: chartType === t ? "var(--primary)" : "transparent", color: chartType === t ? "white" : "var(--text-muted)", cursor: "pointer", fontFamily: "inherit", fontSize: "0.82rem", fontWeight: "600", transition: "all 0.2s" }}>
                        {t === "bar" ? <BarChart2 size={14} /> : <TrendingUp size={14} />}
                        {t === "bar" ? "กราฟแท่ง" : "กราฟเส้น"}
                      </button>
                    ))}
                  </div>
                </div>

                {statsLoading ? (
                  <div style={{ height: "240px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>กำลังโหลด...</div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    {chartType === "bar" ? (
                      <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--navbar-border)" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "inherit" }} tickLine={false} axisLine={false} interval={8} />
                        <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "inherit" }} tickLine={false} axisLine={false}
                          tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} width={42} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--primary-light)" }} />
                        <Bar dataKey="total" fill="var(--primary)" radius={[3, 3, 0, 0]} opacity={0.85} />
                      </BarChart>
                    ) : (
                      <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                        <defs>
                          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--navbar-border)" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "inherit" }} tickLine={false} axisLine={false} interval={8} />
                        <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "inherit" }} tickLine={false} axisLine={false}
                          tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} width={42} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={2.5} fill="url(#areaGrad)" dot={false} activeDot={{ r: 4, fill: "var(--primary)" }} />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                )}
              </div>

              {/* Per-User Table */}
              <div style={{ border: "1px solid var(--navbar-border)", borderRadius: "12px", background: "var(--background)", overflow: "hidden" }}>
                <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--navbar-border)" }}>
                  <p style={{ margin: 0, fontWeight: "700", color: "var(--text-primary)", fontSize: "0.95rem" }}>ยอดเติมเงินแยกตามผู้ใช้</p>
                </div>
                {byUser.length === 0 && !statsLoading ? (
                  <div style={{ padding: "2.5rem", textAlign: "center", color: "var(--text-muted)" }}>ยังไม่มีข้อมูลการเติมเงิน</div>
                ) : (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "2rem 1fr 1fr 0.7fr", gap: "0.5rem", padding: "0.6rem 1.25rem", fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid var(--navbar-border)" }}>
                      <span>#</span><span>ผู้ใช้</span><span>ยอดเติมรวม</span><span>จำนวนครั้ง</span>
                    </div>
                    {byUser.map((u: any, i: number) => {
                      const pct = overall.total > 0 ? (u.total / overall.total) * 100 : 0;
                      return (
                        <div key={u.username} style={{ display: "grid", gridTemplateColumns: "2rem 1fr 1fr 0.7fr", gap: "0.5rem", alignItems: "center", padding: "0.85rem 1.25rem", borderBottom: i < byUser.length - 1 ? "1px solid var(--navbar-border)" : "none", fontSize: "0.875rem" }}>
                          <span style={{ fontWeight: "700", color: "var(--text-muted)", fontSize: "0.8rem" }}>{i + 1}</span>
                          <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>{u.username}</span>
                          <div>
                            <span style={{ fontWeight: "700", color: "var(--primary)" }}>฿{Number(u.total).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
                            <div style={{ marginTop: "4px", height: "4px", borderRadius: "2px", background: "var(--navbar-border)", overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${pct}%`, background: "var(--primary)", borderRadius: "2px" }} />
                            </div>
                          </div>
                          <span style={{ color: "var(--text-secondary)" }}>{u.count} ครั้ง</span>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          );
        })()}

        {/* Theme Settings Tab */}
        {activeTab === "theme-settings" && (
          <div style={{ maxWidth: "640px", display: "flex", flexDirection: "column", gap: "1.75rem" }}>

            {/* Primary Color */}
            <div style={fieldStyle}>
              <label style={labelStyle}>สีหลัก (Primary Color)</label>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0 0 0.5rem" }}>ใช้สำหรับขอบการแจ้งเตือน สีชื่อเว็บ สีกรอบประกาศ และ UI หลัก</p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <input type="color"
                  value={settings.primaryColor || "#4f46e5"}
                  onChange={(e) => setSettings((p) => ({ ...p, primaryColor: e.target.value }))}
                  style={{ width: "48px", height: "40px", borderRadius: "8px", border: "1px solid var(--navbar-border)", cursor: "pointer", padding: "2px", background: "var(--background)" }}
                />
                <input style={{ ...inputStyle, flex: 1 }}
                  value={settings.primaryColor}
                  onChange={(e) => setSettings((p) => ({ ...p, primaryColor: e.target.value }))}
                  placeholder="เช่น #4f46e5 หรือเว้นว่างใช้ค่าเริ่มต้น"
                  onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--navbar-border)"}
                />
                {settings.primaryColor && (
                  <button onClick={() => setSettings((p) => ({ ...p, primaryColor: "" }))}
                    style={{ padding: "0.5rem 0.75rem", border: "none", background: "transparent", color: "#f87171", cursor: "pointer", fontSize: "0.85rem", fontFamily: "inherit" }}>
                    รีเซ็ต
                  </button>
                )}
              </div>
            </div>

            {/* Secondary Color — disabled */}
            <div style={{ ...fieldStyle, opacity: 0.45, pointerEvents: "none" }}>
              <label style={labelStyle}>สีรอง (Secondary Color)</label>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0 0 0.5rem" }}>จะมีการอัพเดทเพิ่มเติมในอนาคต — ยังไม่เปิดให้ตั้งค่า</p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <input type="color" value="#a78bfa"
                  style={{ width: "48px", height: "40px", borderRadius: "8px", border: "1px solid var(--navbar-border)", cursor: "not-allowed", padding: "2px", background: "var(--background)" }}
                />
                <input style={{ ...inputStyle, flex: 1 }} placeholder="เร็วๆ นี้..." readOnly />
              </div>
            </div>

            {/* Text Color */}
            <div style={fieldStyle}>
              <label style={labelStyle}>สีข้อความ (Text Color)</label>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0 0 0.5rem" }}>ใช้สำหรับกำหนดสีข้อความทั้งเว็บไซต์</p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <input type="color"
                  value={settings.textColor || "#0f172a"}
                  onChange={(e) => setSettings((p) => ({ ...p, textColor: e.target.value }))}
                  style={{ width: "48px", height: "40px", borderRadius: "8px", border: "1px solid var(--navbar-border)", cursor: "pointer", padding: "2px", background: "var(--background)" }}
                />
                <input style={{ ...inputStyle, flex: 1 }}
                  value={settings.textColor}
                  onChange={(e) => setSettings((p) => ({ ...p, textColor: e.target.value }))}
                  placeholder="เช่น #0f172a หรือเว้นว่างใช้ค่าเริ่มต้น"
                  onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--navbar-border)"}
                />
                {settings.textColor && (
                  <button onClick={() => setSettings((p) => ({ ...p, textColor: "" }))}
                    style={{ padding: "0.5rem 0.75rem", border: "none", background: "transparent", color: "#f87171", cursor: "pointer", fontSize: "0.85rem", fontFamily: "inherit" }}>
                    รีเซ็ต
                  </button>
                )}
              </div>
            </div>

            {/* Button Color */}
            <div style={fieldStyle}>
              <label style={labelStyle}>สีปุ่ม (Button Color)</label>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0 0 0.5rem" }}>ใช้สำหรับกำหนดสีพื้นหลังของปุ่มทั่วเว็บไซต์</p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <input type="color"
                  value={settings.buttonColor || "#4f46e5"}
                  onChange={(e) => setSettings((p) => ({ ...p, buttonColor: e.target.value }))}
                  style={{ width: "48px", height: "40px", borderRadius: "8px", border: "1px solid var(--navbar-border)", cursor: "pointer", padding: "2px", background: "var(--background)" }}
                />
                <input style={{ ...inputStyle, flex: 1 }}
                  value={settings.buttonColor}
                  onChange={(e) => setSettings((p) => ({ ...p, buttonColor: e.target.value }))}
                  placeholder="เช่น #4f46e5 หรือเว้นว่างใช้ค่าเริ่มต้น"
                  onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--navbar-border)"}
                />
                {settings.buttonColor && (
                  <button onClick={() => setSettings((p) => ({ ...p, buttonColor: "" }))}
                    style={{ padding: "0.5rem 0.75rem", border: "none", background: "transparent", color: "#f87171", cursor: "pointer", fontSize: "0.85rem", fontFamily: "inherit" }}>
                    รีเซ็ต
                  </button>
                )}
              </div>
            </div>

            {/* Save */}
            <button onClick={handleSave} disabled={saving}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.8rem 2rem", borderRadius: "10px", border: "none", background: "var(--primary)", color: "white", fontWeight: "700", fontSize: "1rem", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, transition: "all 0.2s", fontFamily: "inherit", alignSelf: "flex-start" }}
              onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = "var(--primary-hover)"; }}
              onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = "var(--primary)"; }}>
              <Save size={18} />
              {saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
            </button>
          </div>
        )}

        {/* Carousel Settings Tab */}
        {activeTab === "carousel-settings" && (
          <div style={{ maxWidth: "700px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Add Image */}
            <div style={{ border: "1px solid var(--navbar-border)", borderRadius: "12px", background: "var(--background)", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <p style={{ margin: 0, fontWeight: "700", color: "var(--text-primary)", fontSize: "0.95rem" }}>เพิ่มรูปภาพใหม่</p>

              {/* URL input */}
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <Link size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                  <input
                    style={{ ...inputStyle, paddingLeft: "2.25rem" }}
                    placeholder="วาง URL รูปภาพ เช่น https://example.com/image.jpg"
                    value={carouselUrlInput}
                    onChange={(e) => setCarouselUrlInput(e.target.value)}
                    onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                    onBlur={(e) => e.target.style.borderColor = "var(--navbar-border)"}
                    onKeyDown={async (e) => {
                      if (e.key === "Enter" && carouselUrlInput.trim()) {
                        const res = await fetch("/api/admin/carousel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageUrl: carouselUrlInput.trim() }) });
                        if (res.ok) { const d = await res.json(); setCarouselImages(prev => [...prev, d.image]); setCarouselUrlInput(""); toast.success("เพิ่มรูปภาพสำเร็จ"); }
                        else toast.error("เพิ่มรูปภาพไม่สำเร็จ");
                      }
                    }}
                  />
                </div>
                <button
                  style={{ padding: "0.7rem 1.25rem", borderRadius: "8px", border: "none", background: "var(--primary)", color: "white", fontWeight: "700", fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}
                  onClick={async () => {
                    if (!carouselUrlInput.trim()) return;
                    const res = await fetch("/api/admin/carousel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageUrl: carouselUrlInput.trim() }) });
                    if (res.ok) { const d = await res.json(); setCarouselImages(prev => [...prev, d.image]); setCarouselUrlInput(""); toast.success("เพิ่มรูปภาพสำเร็จ"); }
                    else toast.error("เพิ่มรูปภาพไม่สำเร็จ");
                  }}
                >
                  เพิ่ม
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                <hr style={{ flex: 1, border: "none", borderTop: "1px solid var(--navbar-border)" }} />
                <span>หรือ</span>
                <hr style={{ flex: 1, border: "none", borderTop: "1px solid var(--navbar-border)" }} />
              </div>

              {/* File upload */}
              <input ref={carouselFileRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const reader = new FileReader();
                  reader.onload = async (ev) => {
                    const url = ev.target?.result as string;
                    const res = await fetch("/api/admin/carousel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageUrl: url }) });
                    if (res.ok) { const d = await res.json(); setCarouselImages(prev => [...prev, d.image]); toast.success("อัปโหลดรูปภาพสำเร็จ"); }
                    else toast.error("อัปโหลดรูปภาพไม่สำเร็จ");
                  };
                  reader.readAsDataURL(f);
                  e.target.value = "";
                }}
              />
              <button
                style={{ width: "100%", padding: "1.5rem", border: "2px dashed var(--navbar-border)", borderRadius: "10px", background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontFamily: "inherit", transition: "border-color 0.2s" }}
                onClick={() => carouselFileRef.current?.click()}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--primary)"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--navbar-border)"}
              >
                <Upload size={24} />
                <span style={{ fontSize: "0.875rem", fontWeight: "500" }}>คลิกเพื่ออัปโหลดรูปภาพ</span>
              </button>
            </div>

            {/* Image List */}
            <div style={{ border: "1px solid var(--navbar-border)", borderRadius: "12px", background: "var(--background)", overflow: "hidden" }}>
              <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--navbar-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ margin: 0, fontWeight: "700", color: "var(--text-primary)", fontSize: "0.95rem" }}>รูปภาพในสไลด์ ({carouselImages.length} รูป)</p>
                <button onClick={fetchCarousel} disabled={carouselLoading}
                  style={{ padding: "0.35rem 0.9rem", borderRadius: "6px", border: "1px solid var(--navbar-border)", background: "var(--primary-light)", color: "var(--primary)", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600", fontFamily: "inherit" }}>
                  รีเฟรช
                </button>
              </div>

              {carouselImages.length === 0 ? (
                <div style={{ padding: "2.5rem", textAlign: "center", color: "var(--text-muted)" }}>
                  ยังไม่มีรูปภาพ — เพิ่มรูปภาพจากด้านบน
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {carouselImages.map((img, i) => (
                    <div key={img.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem 1.25rem", borderBottom: i < carouselImages.length - 1 ? "1px solid var(--navbar-border)" : "none" }}>
                      <img src={img.imageUrl} alt="" style={{ width: "80px", height: "50px", objectFit: "cover", borderRadius: "6px", border: "1px solid var(--navbar-border)", flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: "0.8rem", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {img.imageUrl.startsWith("data:") ? "(อัปโหลดจากไฟล์)" : img.imageUrl}
                      </span>
                      <button
                        onClick={async () => {
                          const res = await fetch("/api/admin/carousel", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: img.id }) });
                          if (res.ok) { setCarouselImages(prev => prev.filter(x => x.id !== img.id)); toast.success("ลบรูปภาพสำเร็จ"); }
                          else toast.error("ลบรูปภาพไม่สำเร็จ");
                        }}
                        style={{ padding: "0.4rem 0.6rem", borderRadius: "6px", border: "none", background: "rgba(239,68,68,0.1)", color: "#f87171", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center" }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Announcements Settings Tab */}
        {activeTab === "announcements-settings" && (
          <div style={{ maxWidth: "700px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Add Announcement */}
            <div style={{ border: "1px solid var(--navbar-border)", borderRadius: "12px", background: "var(--background)", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <p style={{ margin: 0, fontWeight: "700", color: "var(--text-primary)", fontSize: "0.95rem" }}>
                {editingAnnouncement ? "แก้ไขข้อความประกาศ" : "เพิ่มข้อความประกาศใหม่"}
              </p>

              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="กรอกข้อความประกาศ เช่น เว็บไซต์เปิดให้บริการ 24 ชั่วโมง"
                  value={announcementInput}
                  onChange={(e) => setAnnouncementInput(e.target.value)}
                  onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--navbar-border)"}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter" && announcementInput.trim()) {
                      if (editingAnnouncement) {
                        const res = await fetch("/api/admin/announcements", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingAnnouncement.id, text: announcementInput.trim() }) });
                        if (res.ok) { const d = await res.json(); setAnnouncementsList(prev => prev.map(a => a.id === editingAnnouncement.id ? d.announcement : a)); setAnnouncementInput(""); setEditingAnnouncement(null); toast.success("แก้ไขสำเร็จ"); }
                        else toast.error("แก้ไขไม่สำเร็จ");
                      } else {
                        const res = await fetch("/api/admin/announcements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: announcementInput.trim() }) });
                        if (res.ok) { const d = await res.json(); setAnnouncementsList(prev => [...prev, d.announcement]); setAnnouncementInput(""); toast.success("เพิ่มประกาศสำเร็จ"); }
                        else toast.error("เพิ่มประกาศไม่สำเร็จ");
                      }
                    }
                  }}
                />
                <button
                  style={{ padding: "0.7rem 1.25rem", borderRadius: "8px", border: "none", background: editingAnnouncement ? "#10b981" : "var(--primary)", color: "white", fontWeight: "700", fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}
                  onClick={async () => {
                    if (!announcementInput.trim()) return;
                    if (editingAnnouncement) {
                      const res = await fetch("/api/admin/announcements", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingAnnouncement.id, text: announcementInput.trim() }) });
                      if (res.ok) { const d = await res.json(); setAnnouncementsList(prev => prev.map(a => a.id === editingAnnouncement.id ? d.announcement : a)); setAnnouncementInput(""); setEditingAnnouncement(null); toast.success("แก้ไขสำเร็จ"); }
                      else toast.error("แก้ไขไม่สำเร็จ");
                    } else {
                      const res = await fetch("/api/admin/announcements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: announcementInput.trim() }) });
                      if (res.ok) { const d = await res.json(); setAnnouncementsList(prev => [...prev, d.announcement]); setAnnouncementInput(""); toast.success("เพิ่มประกาศสำเร็จ"); }
                      else toast.error("เพิ่มประกาศไม่สำเร็จ");
                    }
                  }}
                >
                  {editingAnnouncement ? "บันทึก" : "เพิ่ม"}
                </button>
                {editingAnnouncement && (
                  <button
                    onClick={() => { setEditingAnnouncement(null); setAnnouncementInput(""); }}
                    style={{ padding: "0.7rem", borderRadius: "8px", border: "1px solid var(--navbar-border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center" }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Announcement List */}
            <div style={{ border: "1px solid var(--navbar-border)", borderRadius: "12px", background: "var(--background)", overflow: "hidden" }}>
              <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--navbar-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ margin: 0, fontWeight: "700", color: "var(--text-primary)", fontSize: "0.95rem" }}>ข้อความประกาศทั้งหมด ({announcementsList.length} ข้อความ)</p>
                <button onClick={fetchAnnouncements} disabled={announcementsLoading}
                  style={{ padding: "0.35rem 0.9rem", borderRadius: "6px", border: "1px solid var(--navbar-border)", background: "var(--primary-light)", color: "var(--primary)", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600", fontFamily: "inherit" }}>
                  รีเฟรช
                </button>
              </div>

              {announcementsList.length === 0 ? (
                <div style={{ padding: "2.5rem", textAlign: "center", color: "var(--text-muted)" }}>
                  ยังไม่มีข้อความประกาศ — เพิ่มข้อความจากด้านบน
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {announcementsList.map((ann, i) => (
                    <div key={ann.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.85rem 1.25rem", borderBottom: i < announcementsList.length - 1 ? "1px solid var(--navbar-border)" : "none" }}>
                      <Megaphone size={16} style={{ color: "var(--primary)", flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: "0.9rem", color: "var(--text-primary)" }}>{ann.text}</span>
                      <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                        <button
                          onClick={() => { setEditingAnnouncement({ id: ann.id, text: ann.text }); setAnnouncementInput(ann.text); }}
                          style={{ padding: "0.4rem 0.6rem", borderRadius: "6px", border: "none", background: "var(--primary-light)", color: "var(--primary)", cursor: "pointer", display: "flex", alignItems: "center" }}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={async () => {
                            const res = await fetch("/api/admin/announcements", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: ann.id }) });
                            if (res.ok) { setAnnouncementsList(prev => prev.filter(a => a.id !== ann.id)); toast.success("ลบประกาศสำเร็จ"); }
                            else toast.error("ลบประกาศไม่สำเร็จ");
                          }}
                          style={{ padding: "0.4rem 0.6rem", borderRadius: "6px", border: "none", background: "rgba(239,68,68,0.1)", color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Channels Settings Tab */}
        {activeTab === "contact-channels-settings" && (() => {
          const PLATFORMS = [
            { value: "facebook", label: "Facebook" },
            { value: "line", label: "LINE" },
            { value: "discord", label: "Discord" },
            { value: "instagram", label: "Instagram" },
            { value: "twitter", label: "Twitter / X" },
            { value: "whatsapp", label: "WhatsApp" },
            { value: "telegram", label: "Telegram" },
            { value: "youtube", label: "YouTube" },
            { value: "tiktok", label: "TikTok" },
            { value: "email", label: "Email (mailto:)" },
            { value: "custom", label: "Custom" },
          ];
          return (
            <div style={{ maxWidth: "700px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Add Form */}
              <div style={{ border: "1px solid var(--navbar-border)", borderRadius: "12px", background: "var(--background)", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <p style={{ margin: 0, fontWeight: "700", color: "var(--text-primary)", fontSize: "0.95rem" }}>
                  {editingContact ? "แก้ไขช่องทาง" : "เพิ่มช่องทางใหม่"}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>แพลตฟอร์ม</label>
                    <select
                      value={editingContact ? editingContact.platform : contactForm.platform}
                      onChange={(e) => editingContact
                        ? setEditingContact({ ...editingContact, platform: e.target.value })
                        : setContactForm({ ...contactForm, platform: e.target.value })}
                      style={{ ...inputStyle }}
                      onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                      onBlur={(e) => e.target.style.borderColor = "var(--navbar-border)"}
                    >
                      {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>ชื่อที่แสดง</label>
                    <input style={inputStyle}
                      placeholder="เช่น Facebook Page"
                      value={editingContact ? editingContact.name : contactForm.name}
                      onChange={(e) => editingContact
                        ? setEditingContact({ ...editingContact, name: e.target.value })
                        : setContactForm({ ...contactForm, name: e.target.value })}
                      onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                      onBlur={(e) => e.target.style.borderColor = "var(--navbar-border)"}
                    />
                  </div>
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>URL / ลิงค์</label>
                  <input style={inputStyle}
                    placeholder="https://facebook.com/yourpage"
                    value={editingContact ? editingContact.url : contactForm.url}
                    onChange={(e) => editingContact
                      ? setEditingContact({ ...editingContact, url: e.target.value })
                      : setContactForm({ ...contactForm, url: e.target.value })}
                    onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                    onBlur={(e) => e.target.style.borderColor = "var(--navbar-border)"}
                  />
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    onClick={async () => {
                      if (editingContact) {
                        const res = await fetch("/api/admin/contact-channels", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingContact.id, platform: editingContact.platform, name: editingContact.name, url: editingContact.url, enabled: 1 }) });
                        if (res.ok) { const d = await res.json(); setContactChannels(prev => prev.map(c => c.id === editingContact.id ? d.channel : c)); setEditingContact(null); toast.success("แก้ไขสำเร็จ"); }
                        else toast.error("แก้ไขไม่สำเร็จ");
                      } else {
                        if (!contactForm.name || !contactForm.url) { toast.error("กรอกชื่อและ URL"); return; }
                        const res = await fetch("/api/admin/contact-channels", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(contactForm) });
                        if (res.ok) { const d = await res.json(); setContactChannels(prev => [...prev, d.channel]); setContactForm({ platform: "facebook", name: "", url: "" }); toast.success("เพิ่มช่องทางสำเร็จ"); }
                        else toast.error("เพิ่มไม่สำเร็จ");
                      }
                    }}
                    style={{ padding: "0.65rem 1.25rem", borderRadius: "8px", border: "none", background: editingContact ? "#10b981" : "var(--primary)", color: "white", fontWeight: "700", fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {editingContact ? "บันทึก" : "เพิ่มช่องทาง"}
                  </button>
                  {editingContact && (
                    <button onClick={() => setEditingContact(null)}
                      style={{ padding: "0.65rem 0.85rem", borderRadius: "8px", border: "1px solid var(--navbar-border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer" }}>
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Channels List */}
              <div style={{ border: "1px solid var(--navbar-border)", borderRadius: "12px", background: "var(--background)", overflow: "hidden" }}>
                <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--navbar-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ margin: 0, fontWeight: "700", color: "var(--text-primary)", fontSize: "0.95rem" }}>ช่องทางทั้งหมด ({contactChannels.length})</p>
                  <button onClick={fetchContactChannels} disabled={contactLoading}
                    style={{ padding: "0.35rem 0.9rem", borderRadius: "6px", border: "1px solid var(--navbar-border)", background: "var(--primary-light)", color: "var(--primary)", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600", fontFamily: "inherit" }}>
                    รีเฟรช
                  </button>
                </div>
                {contactChannels.length === 0 ? (
                  <div style={{ padding: "2.5rem", textAlign: "center", color: "var(--text-muted)" }}>ยังไม่มีช่องทาง — เพิ่มจากด้านบน</div>
                ) : (
                  contactChannels.map((ch, i) => (
                    <div key={ch.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.85rem 1.25rem", borderBottom: i < contactChannels.length - 1 ? "1px solid var(--navbar-border)" : "none" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: "700", padding: "0.25rem 0.6rem", borderRadius: "6px", background: "var(--primary-light)", color: "var(--primary)", textTransform: "capitalize", flexShrink: 0 }}>{ch.platform}</span>
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <p style={{ margin: 0, fontWeight: "600", fontSize: "0.875rem", color: "var(--text-primary)" }}>{ch.name}</p>
                        <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ch.url}</p>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                        <a href={ch.url} target="_blank" rel="noopener noreferrer" style={{ padding: "0.4rem 0.6rem", borderRadius: "6px", border: "1px solid var(--navbar-border)", background: "transparent", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
                          <ExternalLink size={14} />
                        </a>
                        <button onClick={() => setEditingContact({ id: ch.id, platform: ch.platform, name: ch.name, url: ch.url })}
                          style={{ padding: "0.4rem 0.6rem", borderRadius: "6px", border: "none", background: "var(--primary-light)", color: "var(--primary)", cursor: "pointer", display: "flex", alignItems: "center" }}>
                          <Pencil size={14} />
                        </button>
                        <button onClick={async () => {
                          const res = await fetch("/api/admin/contact-channels", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: ch.id }) });
                          if (res.ok) { setContactChannels(prev => prev.filter(c => c.id !== ch.id)); toast.success("ลบสำเร็จ"); }
                          else toast.error("ลบไม่สำเร็จ");
                        }}
                          style={{ padding: "0.4rem 0.6rem", borderRadius: "6px", border: "none", background: "rgba(239,68,68,0.1)", color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center" }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })()}

        {/* Admin Chat Tab */}
        {activeTab === "admin-chat" && (
          <div style={{ maxWidth: "900px", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {!activeChatSession ? (
              <>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={fetchChatSessions} disabled={chatLoading}
                    style={{ padding: "0.5rem 1.25rem", borderRadius: "8px", border: "1px solid var(--navbar-border)", background: "var(--primary-light)", color: "var(--primary)", cursor: "pointer", fontWeight: "600", fontSize: "0.875rem", fontFamily: "inherit", opacity: chatLoading ? 0.6 : 1 }}>
                    {chatLoading ? "กำลังโหลด..." : "รีเฟรช"}
                  </button>
                </div>
                {chatSessions.length === 0 ? (
                  <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", border: "1px dashed var(--navbar-border)", borderRadius: "12px" }}>
                    <MessageSquare size={36} style={{ margin: "0 auto 0.75rem", opacity: 0.3 }} />
                    <p style={{ margin: 0 }}>ไม่มีแชทที่รอตอบกลับ</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {chatSessions.map((s) => (
                      <div key={s.id} onClick={() => openAdminChat(s)}
                        style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem", border: "1px solid var(--navbar-border)", borderRadius: "12px", background: "var(--background)", cursor: "pointer", transition: "border-color 0.2s" }}
                        onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)"}
                        onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.borderColor = "var(--navbar-border)"}
                      >
                        <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", fontWeight: "700", flexShrink: 0 }}>
                          {s.username?.substring(0, 2).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, overflow: "hidden" }}>
                          <p style={{ margin: 0, fontWeight: "700", fontSize: "0.9rem", color: "var(--text-primary)" }}>{s.username}</p>
                          <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {s.lastMessage ? (s.lastMessage.length > 60 ? s.lastMessage.slice(0, 60) + "..." : s.lastMessage) : "ยังไม่มีข้อความ"}
                          </p>
                        </div>
                        <div style={{ flexShrink: 0, textAlign: "right" }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{s.messageCount} ข้อความ</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 220px)", border: "1px solid var(--navbar-border)", borderRadius: "12px", overflow: "hidden", background: "var(--background)" }}>
                {/* Chat header */}
                <div style={{ padding: "0.85rem 1.25rem", borderBottom: "1px solid var(--navbar-border)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <button onClick={closeAdminChatView}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex", padding: "0.25rem" }}>
                    <ArrowLeft size={18} />
                  </button>
                  <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", fontWeight: "700", fontSize: "0.85rem", flexShrink: 0 }}>
                    {activeChatSession.username?.substring(0, 2).toUpperCase()}
                  </div>
                  <span style={{ fontWeight: "700", fontSize: "0.9rem", flex: 1 }}>{activeChatSession.username}</span>
                  <button
                    onClick={async () => {
                      if (!confirm(`ปิดแชทของ ${activeChatSession.username}? ประวัติจะถูกลบทันที`)) return;
                      const res = await fetch("/api/chat/close", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ sessionId: activeChatSession.id, username: adminUser?.username }),
                      });
                      if (res.ok) {
                        toast.success("ปิดแชทสำเร็จ");
                        closeAdminChatView();
                        fetchChatSessions();
                      } else toast.error("ปิดแชทไม่สำเร็จ");
                    }}
                    style={{ padding: "0.45rem 1rem", borderRadius: "8px", border: "none", background: "rgba(239,68,68,0.1)", color: "#f87171", fontWeight: "700", fontSize: "0.82rem", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "0.4rem" }}
                  >
                    <X size={14} /> ปิดแชท
                  </button>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {chatMessages.length === 0 && (
                    <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>ยังไม่มีข้อความ</div>
                  )}
                  {chatMessages.map((msg) => {
                    const isAdmin = msg.senderRole === "admin";
                    return (
                      <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isAdmin ? "flex-end" : "flex-start" }}>
                        {!isAdmin && <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.2rem", paddingLeft: "0.5rem" }}>{msg.senderName}</span>}
                        <div style={{ maxWidth: "65%", padding: msg.type === "image" ? "0.25rem" : "0.6rem 0.9rem", borderRadius: isAdmin ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: isAdmin ? "var(--primary)" : "var(--primary-light)", color: isAdmin ? "white" : "var(--text-primary)", fontSize: "0.875rem" }}>
                          {msg.type === "image" && <img src={msg.content} alt="" style={{ maxWidth: "200px", maxHeight: "180px", objectFit: "contain", borderRadius: "10px", display: "block" }} />}
                          {msg.type === "link" && <a href={msg.content} target="_blank" rel="noopener noreferrer" style={{ color: isAdmin ? "white" : "var(--primary)", wordBreak: "break-all" }}>{msg.content}</a>}
                          {msg.type === "text" && <span style={{ wordBreak: "break-word" }}>{msg.content}</span>}
                        </div>
                        <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "0.15rem", paddingLeft: isAdmin ? 0 : "0.5rem", paddingRight: isAdmin ? "0.5rem" : 0 }}>
                          {new Date(msg.createdAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={chatBottomRef} />
                </div>

                {/* Input */}
                <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid var(--navbar-border)" }}>
                  <input ref={chatFileRef} type="file" accept="image/*" style={{ display: "none" }}
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const reader = new FileReader();
                      reader.onload = async (ev) => {
                        setChatSending(true);
                        const res = await fetch("/api/chat/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: activeChatSession.id, username: adminUser?.username, content: ev.target?.result, type: "image" }) });
                        if (res.ok) { const d = await res.json(); setChatMessages(prev => [...prev, d.message]); chatLastIdRef.current = d.message.id; setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50); }
                        setChatSending(false);
                      };
                      reader.readAsDataURL(f);
                      e.target.value = "";
                    }}
                  />
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!chatInput.trim()) return;
                    setChatSending(true);
                    const res = await fetch("/api/chat/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: activeChatSession.id, username: adminUser?.username, content: chatInput.trim(), type: "text" }) });
                    if (res.ok) { const d = await res.json(); setChatMessages(prev => [...prev, d.message]); chatLastIdRef.current = d.message.id; setChatInput(""); setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50); }
                    setChatSending(false);
                  }} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <button type="button" onClick={() => chatFileRef.current?.click()} title="แนบรูป"
                      style={{ padding: "0.55rem", borderRadius: "8px", border: "1px solid var(--navbar-border)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", display: "flex", flexShrink: 0 }}>
                      <Paperclip size={16} />
                    </button>
                    <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="ตอบกลับ..." disabled={chatSending}
                      style={{ flex: 1, padding: "0.6rem 0.9rem", borderRadius: "8px", border: "1px solid var(--navbar-border)", background: "var(--background)", color: "var(--foreground)", fontFamily: "inherit", fontSize: "0.875rem", outline: "none" }}
                      onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                      onBlur={(e) => e.target.style.borderColor = "var(--navbar-border)"}
                    />
                    <button type="submit" disabled={chatSending || !chatInput.trim()}
                      style={{ padding: "0.6rem 0.9rem", borderRadius: "8px", border: "none", background: chatSending || !chatInput.trim() ? "var(--text-muted)" : "var(--primary)", color: "white", cursor: chatSending || !chatInput.trim() ? "not-allowed" : "pointer", display: "flex", flexShrink: 0 }}>
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Topup Codes Tab */}
        {activeTab === "topup-codes" && (
          <div style={{ maxWidth: "900px", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button onClick={fetchCodes} disabled={codesLoading}
                style={{ padding: "0.5rem 1.25rem", borderRadius: "8px", border: "1px solid var(--navbar-border)", background: "var(--primary-light)", color: "var(--primary)", cursor: "pointer", fontWeight: "600", fontSize: "0.875rem", fontFamily: "inherit", opacity: codesLoading ? 0.6 : 1 }}>
                {codesLoading ? "กำลังโหลด..." : "รีเฟรช"}
              </button>
              <button onClick={() => { setCodeForm({ code: "", amount: "", maxUses: "1", expiresAt: "", maxUsesPerUser: "1", status: true }); setCodeModal({ type: "add", code: null }); }}
                style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.55rem 1.25rem", borderRadius: "8px", border: "none", background: "var(--primary)", color: "white", cursor: "pointer", fontWeight: "700", fontSize: "0.875rem", fontFamily: "inherit" }}>
                <Plus size={15} /> เพิ่มโค้ดใหม่
              </button>
            </div>

            {topupCodes.length === 0 && !codesLoading ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", border: "1px dashed var(--navbar-border)", borderRadius: "12px" }}>
                ยังไม่มีโค้ดเติมเงิน — กดเพิ่มโค้ดใหม่
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {/* Header */}
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 0.8fr 0.8fr 0.8fr 1fr 0.6fr 1fr", gap: "0.5rem", padding: "0.5rem 1rem", fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  <span>โค้ด</span><span>จำนวน</span><span>ใช้แล้ว/สูงสุด</span><span>ซ้ำ/user</span><span>หมดอายุ</span><span>สถานะ</span><span>จัดการ</span>
                </div>
                {topupCodes.map((c) => {
                  const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
                  return (
                    <div key={c.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 0.8fr 0.8fr 0.8fr 1fr 0.6fr 1fr", gap: "0.5rem", alignItems: "center", padding: "0.75rem 1rem", border: "1px solid var(--navbar-border)", borderRadius: "10px", background: "var(--background)", fontSize: "0.875rem" }}>
                      <span style={{ fontWeight: "700", fontFamily: "monospace", color: "var(--primary)", letterSpacing: "0.04em" }}>{c.code}</span>
                      <span style={{ fontWeight: "600" }}>฿{Number(c.amount).toFixed(2)}</span>
                      <span>{c.usedCount}/{c.maxUses > 0 ? c.maxUses : "∞"}</span>
                      <span>{c.maxUsesPerUser > 0 ? c.maxUsesPerUser : "∞"}</span>
                      <span style={{ fontSize: "0.8rem", color: expired ? "#ef4444" : "var(--text-secondary)" }}>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("th-TH") : "ไม่จำกัด"}</span>
                      <span>
                        <span style={{ padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: "700", background: c.status && !expired ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.1)", color: c.status && !expired ? "#10b981" : "#ef4444" }}>
                          {c.status && !expired ? "เปิด" : "ปิด"}
                        </span>
                      </span>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button onClick={() => { setCodeForm({ code: c.code, amount: String(c.amount), maxUses: String(c.maxUses), expiresAt: c.expiresAt ?? "", maxUsesPerUser: String(c.maxUsesPerUser), status: !!c.status }); setCodeModal({ type: "edit", code: c }); }}
                          style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.35rem 0.6rem", borderRadius: "6px", border: "1px solid var(--navbar-border)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.78rem", fontFamily: "inherit", fontWeight: "600" }}>
                          <Pencil size={12} /> แก้ไข
                        </button>
                        <button onClick={() => { setCodeModal({ type: "delete", code: c }); setDeleteCodeConfirm(""); }}
                          style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.35rem 0.6rem", borderRadius: "6px", border: "none", background: "rgba(239,68,68,0.1)", color: "#ef4444", cursor: "pointer", fontSize: "0.78rem", fontFamily: "inherit", fontWeight: "600" }}>
                          <Trash2 size={12} /> ลบ
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>

      {/* ===== Topup Code Modal ===== */}
      {codeModal.type && (codeModal.type === "add" || codeModal.type === "edit") && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}
          onClick={() => setCodeModal({ type: null, code: null })}>
          <div style={{ background: "var(--background)", border: "1px solid var(--navbar-border)", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "480px", boxShadow: "0 25px 50px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column", gap: "1.25rem", animation: "scaleIn 0.2s ease-out" }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                {codeModal.type === "add" ? "เพิ่มโค้ดใหม่" : `แก้ไขโค้ด: ${codeModal.code?.code}`}
              </h3>
              <button onClick={() => setCodeModal({ type: null, code: null })} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", padding: "4px" }}><X size={20} /></button>
            </div>

            {(["code", "amount", "maxUses", "expiresAt", "maxUsesPerUser"] as const).map((field) => {
              const labels: Record<string, string> = { code: "โค้ด", amount: "จำนวนเงิน (฿)", maxUses: "จำนวนผู้ใช้สูงสุด (0 = ไม่จำกัด)", expiresAt: "วันหมดอายุ", maxUsesPerUser: "การใช้ซ้ำต่อคน (0 = ไม่จำกัด)" };
              return (
                <div key={field} style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)" }}>{labels[field]}</label>
                  <input
                    type={field === "expiresAt" ? "date" : field === "amount" || field === "maxUses" || field === "maxUsesPerUser" ? "number" : "text"}
                    min={field === "amount" ? 0.01 : 0}
                    value={codeForm[field]}
                    onChange={(e) => setCodeForm((p) => ({ ...p, [field]: e.target.value }))}
                    placeholder={field === "maxUses" || field === "maxUsesPerUser" ? "0 = ไม่จำกัด" : ""}
                    style={{ padding: "0.65rem 1rem", borderRadius: "8px", border: "1px solid var(--navbar-border)", background: "var(--background)", color: "var(--foreground)", fontSize: "0.95rem", fontFamily: "inherit", outline: "none" }}
                    onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                    onBlur={(e) => e.target.style.borderColor = "var(--navbar-border)"} />
                </div>
              );
            })}

            {/* Status toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <button onClick={() => setCodeForm((p) => ({ ...p, status: !p.status }))}
                style={{ width: "52px", height: "28px", borderRadius: "14px", border: "none", background: codeForm.status ? "#10b981" : "var(--text-muted)", cursor: "pointer", position: "relative", transition: "background 0.3s", flexShrink: 0 }}>
                <span style={{ position: "absolute", top: "3px", left: codeForm.status ? "27px" : "3px", width: "22px", height: "22px", borderRadius: "50%", background: "white", transition: "left 0.3s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
              </button>
              <span style={{ fontSize: "0.9rem", fontWeight: "600", color: codeForm.status ? "#10b981" : "var(--text-muted)" }}>{codeForm.status ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span>
            </div>

            <button disabled={!codeForm.code.trim() || !codeForm.amount || codeModalLoading}
              onClick={async () => {
                setCodeModalLoading(true);
                const payload = { code: codeForm.code.trim(), amount: parseFloat(codeForm.amount), maxUses: parseInt(codeForm.maxUses) || 0, expiresAt: codeForm.expiresAt || null, maxUsesPerUser: parseInt(codeForm.maxUsesPerUser) || 0, status: codeForm.status };
                const isEdit = codeModal.type === "edit";
                const res = await fetch(isEdit ? `/api/admin/topup-codes/${codeModal.code.id}` : "/api/admin/topup-codes", {
                  method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
                });
                setCodeModalLoading(false);
                if (res.ok) { toast.success(isEdit ? "แก้ไขโค้ดสำเร็จ" : "เพิ่มโค้ดสำเร็จ"); fetchCodes(); setCodeModal({ type: null, code: null }); }
                else { const d = await res.json(); toast.error(d.error ?? "เกิดข้อผิดพลาด"); }
              }}
              style={{ padding: "0.7rem", borderRadius: "10px", border: "none", background: "var(--primary)", color: "white", fontWeight: "700", fontSize: "0.95rem", cursor: (!codeForm.code.trim() || !codeForm.amount) ? "not-allowed" : "pointer", opacity: (!codeForm.code.trim() || !codeForm.amount) ? 0.5 : 1, fontFamily: "inherit" }}>
              {codeModalLoading ? "กำลังบันทึก..." : codeModal.type === "add" ? "สร้างโค้ด" : "บันทึกการแก้ไข"}
            </button>
          </div>
        </div>
      )}

      {/* Delete Code Confirm */}
      {codeModal.type === "delete" && codeModal.code && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}
          onClick={() => setCodeModal({ type: null, code: null })}>
          <div style={{ background: "var(--background)", border: "1px solid var(--navbar-border)", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "420px", boxShadow: "0 25px 50px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column", gap: "1.25rem", animation: "scaleIn 0.2s ease-out" }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "#ef4444" }}>ยืนยันการลบโค้ด</h3>
              <button onClick={() => setCodeModal({ type: null, code: null })} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", padding: "4px" }}><X size={20} /></button>
            </div>
            <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>
              คุณต้องการลบโค้ด <strong style={{ color: "var(--primary)", fontFamily: "monospace" }}>{codeModal.code.code}</strong> ใช่หรือไม่? การลบไม่สามารถกู้คืนได้
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setCodeModal({ type: null, code: null })}
                style={{ flex: 1, padding: "0.7rem", borderRadius: "10px", border: "1px solid var(--navbar-border)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", fontWeight: "600", fontFamily: "inherit" }}>
                ยกเลิก
              </button>
              <button disabled={codeModalLoading}
                onClick={async () => {
                  setCodeModalLoading(true);
                  const res = await fetch(`/api/admin/topup-codes/${codeModal.code.id}`, { method: "DELETE" });
                  setCodeModalLoading(false);
                  if (res.ok) { toast.success("ลบโค้ดสำเร็จ"); setTopupCodes((p) => p.filter((c) => c.id !== codeModal.code.id)); setCodeModal({ type: null, code: null }); }
                  else { const d = await res.json(); toast.error(d.error ?? "เกิดข้อผิดพลาด"); }
                }}
                style={{ flex: 1, padding: "0.7rem", borderRadius: "10px", border: "none", background: "#ef4444", color: "white", fontWeight: "700", fontSize: "0.95rem", cursor: "pointer", fontFamily: "inherit" }}>
                {codeModalLoading ? "กำลังลบ..." : "ลบโค้ด"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== User Action Modal ===== */}
      {userModal.type && userModal.user && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}
          onClick={() => setUserModal({ type: null, user: null })}>
          <div style={{ background: "var(--background)", border: "1px solid var(--navbar-border)", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "420px", boxShadow: "0 25px 50px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column", gap: "1.25rem", animation: "scaleIn 0.2s ease-out" }}
            onClick={(e) => e.stopPropagation()}>

            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                  {userModal.type === "change-password" && "เปลี่ยนรหัสผ่าน"}
                  {userModal.type === "change-email" && "เปลี่ยนอีเมล"}
                  {userModal.type === "balance" && "แก้ไขยอดเงิน"}
                  {userModal.type === "delete" && "ลบบัญชีผู้ใช้"}
                </h3>
                <p style={{ margin: "0.2rem 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  ผู้ใช้: <strong style={{ color: "var(--text-primary)" }}>{userModal.user.username}</strong>
                </p>
              </div>
              <button onClick={() => setUserModal({ type: null, user: null })}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", padding: "4px" }}>
                <X size={20} />
              </button>
            </div>

            {/* Change Password */}
            {userModal.type === "change-password" && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)" }}>รหัสผ่านใหม่</label>
                    <input type="password" value={userModalInput} onChange={(e) => setUserModalInput(e.target.value)}
                      placeholder="กรอกรหัสผ่านใหม่"
                      style={{ padding: "0.65rem 1rem", borderRadius: "8px", border: "1px solid var(--navbar-border)", background: "var(--background)", color: "var(--foreground)", fontSize: "0.95rem", fontFamily: "inherit", outline: "none" }}
                      onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                      onBlur={(e) => e.target.style.borderColor = "var(--navbar-border)"} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)" }}>ยืนยันรหัสผ่านใหม่</label>
                    <input type="password" value={userModalConfirm} onChange={(e) => setUserModalConfirm(e.target.value)}
                      placeholder="กรอกรหัสผ่านอีกครั้ง"
                      style={{ padding: "0.65rem 1rem", borderRadius: "8px", border: "1px solid var(--navbar-border)", background: "var(--background)", color: "var(--foreground)", fontSize: "0.95rem", fontFamily: "inherit", outline: "none" }}
                      onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                      onBlur={(e) => e.target.style.borderColor = "var(--navbar-border)"} />
                  </div>
                </div>
                <button disabled={!userModalInput || userModalInput !== userModalConfirm || userActionLoading}
                  onClick={async () => {
                    setUserActionLoading(true);
                    const res = await fetch(`/api/admin/users/${userModal.user.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "password", password: userModalInput }) });
                    setUserActionLoading(false);
                    if (res.ok) { toast.success("เปลี่ยนรหัสผ่านสำเร็จ"); setUserModal({ type: null, user: null }); }
                    else { const d = await res.json(); toast.error(d.error ?? "เกิดข้อผิดพลาด"); }
                  }}
                  style={{ padding: "0.7rem", borderRadius: "10px", border: "none", background: "var(--primary)", color: "white", fontWeight: "700", fontSize: "0.95rem", cursor: (!userModalInput || userModalInput !== userModalConfirm) ? "not-allowed" : "pointer", opacity: (!userModalInput || userModalInput !== userModalConfirm) ? 0.5 : 1, fontFamily: "inherit", transition: "all 0.2s" }}>
                  {userActionLoading ? "กำลังบันทึก..." : "ยืนยันเปลี่ยนรหัสผ่าน"}
                </button>
              </>
            )}

            {/* Change Email */}
            {userModal.type === "change-email" && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)" }}>อีเมลใหม่</label>
                    <input type="email" value={userModalInput} onChange={(e) => setUserModalInput(e.target.value)}
                      placeholder="กรอกอีเมลใหม่"
                      style={{ padding: "0.65rem 1rem", borderRadius: "8px", border: "1px solid var(--navbar-border)", background: "var(--background)", color: "var(--foreground)", fontSize: "0.95rem", fontFamily: "inherit", outline: "none" }}
                      onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                      onBlur={(e) => e.target.style.borderColor = "var(--navbar-border)"} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)" }}>ยืนยันอีเมลใหม่</label>
                    <input type="email" value={userModalConfirm} onChange={(e) => setUserModalConfirm(e.target.value)}
                      placeholder="กรอกอีเมลอีกครั้ง"
                      style={{ padding: "0.65rem 1rem", borderRadius: "8px", border: "1px solid var(--navbar-border)", background: "var(--background)", color: "var(--foreground)", fontSize: "0.95rem", fontFamily: "inherit", outline: "none" }}
                      onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                      onBlur={(e) => e.target.style.borderColor = "var(--navbar-border)"} />
                  </div>
                </div>
                <button disabled={!userModalInput || userModalInput !== userModalConfirm || userActionLoading}
                  onClick={async () => {
                    setUserActionLoading(true);
                    const res = await fetch(`/api/admin/users/${userModal.user.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "email", email: userModalInput }) });
                    setUserActionLoading(false);
                    if (res.ok) { toast.success("เปลี่ยนอีเมลสำเร็จ"); fetchUsers(); setUserModal({ type: null, user: null }); }
                    else { const d = await res.json(); toast.error(d.error ?? "เกิดข้อผิดพลาด"); }
                  }}
                  style={{ padding: "0.7rem", borderRadius: "10px", border: "none", background: "var(--primary)", color: "white", fontWeight: "700", fontSize: "0.95rem", cursor: (!userModalInput || userModalInput !== userModalConfirm) ? "not-allowed" : "pointer", opacity: (!userModalInput || userModalInput !== userModalConfirm) ? 0.5 : 1, fontFamily: "inherit", transition: "all 0.2s" }}>
                  {userActionLoading ? "กำลังบันทึก..." : "ยืนยันเปลี่ยนอีเมล"}
                </button>
              </>
            )}

            {/* Balance */}
            {userModal.type === "balance" && (
              <>
                {/* Current balance display */}
                <div style={{ padding: "0.75rem 1rem", borderRadius: "10px", background: "var(--primary-light)", border: "1px solid var(--navbar-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)" }}>ยอดเงินปัจจุบัน</span>
                  <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--primary)" }}>฿{Number(userModal.user.balance ?? 0).toFixed(2)}</span>
                </div>

                {/* Action selector */}
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {([
                    { key: "view", label: "ดูยอด", icon: <Eye size={14} /> },
                    { key: "add", label: "เพิ่ม", icon: <Plus size={14} /> },
                    { key: "deduct", label: "ลบ", icon: <Minus size={14} /> },
                  ] as const).map(({ key, label, icon }) => (
                    <button key={key} onClick={() => { setBalanceAction(key); setUserModalInput(""); }}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem", padding: "0.5rem", borderRadius: "8px", border: "1px solid var(--navbar-border)", background: balanceAction === key ? "var(--primary)" : "transparent", color: balanceAction === key ? "white" : "var(--text-secondary)", cursor: "pointer", fontSize: "0.85rem", fontFamily: "inherit", fontWeight: "600", transition: "all 0.2s" }}>
                      {icon} {label}
                    </button>
                  ))}
                </div>

                {/* Amount input for add/deduct */}
                {(balanceAction === "add" || balanceAction === "deduct") && (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                      <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)" }}>
                        {balanceAction === "add" ? "จำนวนที่จะเพิ่ม (฿)" : `จำนวนที่จะลบ (สูงสุด ฿${Number(userModal.user.balance ?? 0).toFixed(2)})`}
                      </label>
                      <input type="number" min={0.01} step={0.01}
                        max={balanceAction === "deduct" ? userModal.user.balance : undefined}
                        value={userModalInput} onChange={(e) => setUserModalInput(e.target.value)}
                        placeholder="กรอกจำนวนเงิน"
                        style={{ padding: "0.65rem 1rem", borderRadius: "8px", border: "1px solid var(--navbar-border)", background: "var(--background)", color: "var(--foreground)", fontSize: "0.95rem", fontFamily: "inherit", outline: "none" }}
                        onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                        onBlur={(e) => e.target.style.borderColor = "var(--navbar-border)"} />
                    </div>
                    <button disabled={!userModalInput || parseFloat(userModalInput) <= 0 || (balanceAction === "deduct" && parseFloat(userModalInput) > userModal.user.balance) || userActionLoading}
                      onClick={async () => {
                        setUserActionLoading(true);
                        const res = await fetch(`/api/admin/users/${userModal.user.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "balance", mode: balanceAction === "add" ? "add" : "subtract", amount: parseFloat(userModalInput) }) });
                        setUserActionLoading(false);
                        if (res.ok) {
                          const d = await res.json();
                          toast.success(balanceAction === "add" ? `เพิ่มยอดเงิน ฿${userModalInput} สำเร็จ` : `ลดยอดเงิน ฿${userModalInput} สำเร็จ`);
                          // update user in list
                          setUserList((prev) => prev.map((u) => u.id === userModal.user.id ? { ...u, balance: d.balance } : u));
                          setUserModal((prev) => ({ ...prev, user: { ...prev.user, balance: d.balance } }));
                          setUserModalInput("");
                        } else {
                          const d = await res.json();
                          toast.error(d.error ?? "เกิดข้อผิดพลาด");
                        }
                      }}
                      style={{ padding: "0.7rem", borderRadius: "10px", border: "none", background: balanceAction === "add" ? "#10b981" : "#ef4444", color: "white", fontWeight: "700", fontSize: "0.95rem", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
                      {userActionLoading ? "กำลังบันทึก..." : balanceAction === "add" ? `เพิ่ม ฿${userModalInput || "0"}` : `ลบ ฿${userModalInput || "0"}`}
                    </button>
                  </>
                )}
              </>
            )}

            {/* Delete */}
            {userModal.type === "delete" && (
              <>
                <div style={{ padding: "1rem", borderRadius: "10px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  การลบบัญชีนี้จะ<strong style={{ color: "#ef4444" }}>ลบข้อมูลทั้งหมด</strong>ออกจากฐานข้อมูล รวมถึงประวัติการเติมเงิน และไม่สามารถกู้คืนได้
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)" }}>
                    พิมพ์ <strong style={{ color: "#ef4444" }}>{userModal.user.username}</strong> เพื่อยืนยัน
                  </label>
                  <input value={userModalConfirm} onChange={(e) => setUserModalConfirm(e.target.value)}
                    placeholder={userModal.user.username}
                    style={{ padding: "0.65rem 1rem", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.4)", background: "var(--background)", color: "var(--foreground)", fontSize: "0.95rem", fontFamily: "inherit", outline: "none" }} />
                </div>
                <button disabled={userModalConfirm !== userModal.user.username || userActionLoading}
                  onClick={async () => {
                    setUserActionLoading(true);
                    const res = await fetch(`/api/admin/users/${userModal.user.id}`, { method: "DELETE" });
                    setUserActionLoading(false);
                    if (res.ok) {
                      toast.success(`ลบบัญชี ${userModal.user.username} สำเร็จ`);
                      setUserList((prev) => prev.filter((u) => u.id !== userModal.user.id));
                      setUserModal({ type: null, user: null });
                    } else {
                      const d = await res.json(); toast.error(d.error ?? "เกิดข้อผิดพลาด");
                    }
                  }}
                  style={{ padding: "0.7rem", borderRadius: "10px", border: "none", background: "#ef4444", color: "white", fontWeight: "700", fontSize: "0.95rem", cursor: userModalConfirm !== userModal.user.username ? "not-allowed" : "pointer", opacity: userModalConfirm !== userModal.user.username ? 0.5 : 1, fontFamily: "inherit", transition: "all 0.2s" }}>
                  {userActionLoading ? "กำลังลบ..." : "ลบบัญชีผู้ใช้นี้ถาวร"}
                </button>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
