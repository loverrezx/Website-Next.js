"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Send, Paperclip, X, ArrowLeft, MessageSquare, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

interface ChatMessage {
  id: number;
  senderId: number;
  senderRole: "user" | "admin";
  senderName: string;
  content: string;
  type: "text" | "image" | "link";
  createdAt: string;
}

interface ChatSession {
  id: number;
  status: string;
  createdAt: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [linkInput, setLinkInput] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const lastMsgIdRef = useRef<number>(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = useCallback(async (sessionId: number, since?: number) => {
    try {
      const url = since
        ? `/api/chat/messages?sessionId=${sessionId}&since=${since}`
        : `/api/chat/messages?sessionId=${sessionId}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();

      if (data.session?.status === "closed") {
        toast.info("แชทถูกปิดแล้ว");
        router.push("/");
        return;
      }

      if (data.messages?.length > 0) {
        if (since) {
          setMessages(prev => [...prev, ...data.messages]);
        } else {
          setMessages(data.messages);
        }
        const lastId = data.messages[data.messages.length - 1].id;
        if (lastId > lastMsgIdRef.current) {
          lastMsgIdRef.current = lastId;
          if (since) scrollToBottom();
        }
      }
    } catch {}
  }, [router]);

  useEffect(() => {
    const stored = localStorage.getItem("nextstore_session");
    if (!stored) { router.push("/"); return; }
    const user = JSON.parse(stored);
    setCurrentUser(user);

    const initSession = async () => {
      setLoading(true);
      // Check for existing open session
      const res = await fetch(`/api/chat/session?username=${encodeURIComponent(user.username)}`);
      const data = await res.json();

      if (data.session) {
        setSession(data.session);
        await fetchMessages(data.session.id);
        scrollToBottom();
      } else {
        // Create new session
        const res2 = await fetch("/api/chat/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: user.username }),
        });
        const d2 = await res2.json();
        setSession(d2.session);
      }
      setLoading(false);
    };

    initSession();
  }, [router, fetchMessages]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!session) return;
    pollRef.current = setInterval(() => {
      fetchMessages(session.id, lastMsgIdRef.current || undefined);
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [session, fetchMessages]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const sendMessage = async (content: string, type: "text" | "image" | "link" = "text") => {
    if (!session || !currentUser || !content.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id, username: currentUser.username, content, type }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data.message]);
        lastMsgIdRef.current = data.message.id;
        scrollToBottom();
      } else {
        const err = await res.json();
        toast.error(err.error || "ส่งข้อความไม่สำเร็จ");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    }
    setSending(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await sendMessage(input.trim(), "text");
    setInput("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const data = ev.target?.result as string;
      await sendMessage(data, "image");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSendLink = async () => {
    if (!linkInput.trim()) return;
    await sendMessage(linkInput.trim(), "link");
    setLinkInput("");
    setShowLinkInput(false);
  };

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

  if (loading) {
    return (
      <main className="container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <p style={{ color: "var(--text-muted)" }}>กำลังโหลด...</p>
      </main>
    );
  }

  return (
    <main style={{ display: "flex", flexDirection: "column", height: "calc(100dvh - 70px)", maxWidth: "800px", margin: "0 auto", width: "100%", padding: "0 1rem" }}>

      {/* Header */}
      <div style={{ padding: "1rem 0", borderBottom: "1px solid var(--navbar-border)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <button onClick={() => router.push("/")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex" }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <MessageSquare size={18} style={{ color: "var(--primary)" }} />
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: "700", fontSize: "0.95rem", color: "var(--text-primary)" }}>ฝ่าย Support</p>
          <p style={{ margin: 0, fontSize: "0.78rem", color: "#10b981" }}>● ออนไลน์</p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1rem 0", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "3rem 1rem" }}>
            <MessageSquare size={40} style={{ margin: "0 auto 0.75rem", opacity: 0.3 }} />
            <p style={{ margin: 0, fontSize: "0.9rem" }}>เริ่มการสนทนา ฝ่าย Support จะตอบกลับในไม่ช้า</p>
          </div>
        )}

        {messages.map((msg) => {
          const isOwn = msg.senderRole === (currentUser?.role !== "Member" && currentUser?.role !== "Partner" ? "admin" : "user");
          return (
            <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isOwn ? "flex-end" : "flex-start" }}>
              {!isOwn && (
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem", paddingLeft: "0.5rem" }}>
                  {msg.senderRole === "admin" ? "Support" : msg.senderName}
                </span>
              )}
              <div style={{
                maxWidth: "70%",
                padding: msg.type === "image" ? "0.25rem" : "0.65rem 1rem",
                borderRadius: isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: isOwn ? "var(--primary)" : "var(--primary-light)",
                color: isOwn ? "white" : "var(--text-primary)",
                fontSize: "0.9rem",
                lineHeight: "1.45",
              }}>
                {msg.type === "image" && (
                  <img src={msg.content} alt="ส่งรูปภาพ" style={{ maxWidth: "240px", maxHeight: "200px", objectFit: "contain", borderRadius: "12px", display: "block" }} />
                )}
                {msg.type === "link" && (
                  <a href={msg.content} target="_blank" rel="noopener noreferrer"
                    style={{ color: isOwn ? "white" : "var(--primary)", wordBreak: "break-all", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <LinkIcon size={13} style={{ flexShrink: 0 }} />
                    {msg.content}
                  </a>
                )}
                {msg.type === "text" && <span style={{ wordBreak: "break-word" }}>{msg.content}</span>}
              </div>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.2rem", paddingLeft: isOwn ? 0 : "0.5rem", paddingRight: isOwn ? "0.5rem" : 0 }}>
                {formatTime(msg.createdAt)}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Link input popup */}
      {showLinkInput && (
        <div style={{ padding: "0.75rem", borderTop: "1px solid var(--navbar-border)", background: "var(--background)", display: "flex", gap: "0.5rem" }}>
          <input
            type="url"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            placeholder="วาง URL ที่ต้องการส่ง"
            style={{ flex: 1, padding: "0.55rem 0.85rem", borderRadius: "8px", border: "1px solid var(--navbar-border)", background: "var(--background)", color: "var(--foreground)", fontFamily: "inherit", fontSize: "0.9rem", outline: "none" }}
            onKeyDown={(e) => { if (e.key === "Enter") handleSendLink(); }}
            autoFocus
          />
          <button onClick={handleSendLink} style={{ padding: "0.55rem 1rem", borderRadius: "8px", border: "none", background: "var(--primary)", color: "white", cursor: "pointer", fontWeight: "600", fontFamily: "inherit" }}>ส่ง</button>
          <button onClick={() => { setShowLinkInput(false); setLinkInput(""); }} style={{ padding: "0.55rem 0.65rem", borderRadius: "8px", border: "1px solid var(--navbar-border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer" }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Input Bar */}
      <div style={{ padding: "0.75rem 0 1rem", borderTop: showLinkInput ? "none" : "1px solid var(--navbar-border)" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
          <button type="button" onClick={() => fileInputRef.current?.click()} title="แนบรูปภาพ"
            style={{ padding: "0.6rem", borderRadius: "8px", border: "1px solid var(--navbar-border)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", flexShrink: 0 }}>
            <Paperclip size={18} />
          </button>
          <button type="button" onClick={() => setShowLinkInput(!showLinkInput)} title="ส่งลิงค์"
            style={{ padding: "0.6rem", borderRadius: "8px", border: "1px solid var(--navbar-border)", background: showLinkInput ? "var(--primary-light)" : "transparent", color: showLinkInput ? "var(--primary)" : "var(--text-secondary)", cursor: "pointer", flexShrink: 0 }}>
            <LinkIcon size={18} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="พิมพ์ข้อความ..."
            disabled={sending}
            style={{ flex: 1, padding: "0.65rem 1rem", borderRadius: "10px", border: "1px solid var(--navbar-border)", background: "var(--background)", color: "var(--foreground)", fontFamily: "inherit", fontSize: "0.9rem", outline: "none", transition: "border-color 0.2s" }}
            onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
            onBlur={(e) => e.target.style.borderColor = "var(--navbar-border)"}
          />
          <button type="submit" disabled={sending || !input.trim()}
            style={{ padding: "0.65rem 1rem", borderRadius: "10px", border: "none", background: sending || !input.trim() ? "var(--text-muted)" : "var(--primary)", color: "white", cursor: sending || !input.trim() ? "not-allowed" : "pointer", flexShrink: 0, display: "flex", alignItems: "center" }}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </main>
  );
}
