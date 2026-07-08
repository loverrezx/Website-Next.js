import React from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { Spinner } from "./Spinner";

interface AlertProps {
  variant?: "default" | "destructive" | "success" | "warning" | "loading";
  title?: string;
  description?: string;
  onClose?: () => void;
  children?: React.ReactNode;
}

export function Alert({
  variant = "default",
  title,
  description,
  onClose,
  children
}: AlertProps) {
  // Styles for different variants
  const getStyles = () => {
    switch (variant) {
      case "destructive":
        return {
          bgColor: "rgba(239, 68, 68, 0.08)",
          borderColor: "rgba(239, 68, 68, 0.4)",
          textColor: "#ef4444",
          icon: <AlertCircle size={20} style={{ color: "#ef4444" }} />
        };
      case "success":
        return {
          bgColor: "rgba(16, 185, 129, 0.08)",
          borderColor: "rgba(16, 185, 129, 0.4)",
          textColor: "#10b981",
          icon: <CheckCircle2 size={20} style={{ color: "#10b981" }} />
        };
      case "warning":
        return {
          bgColor: "rgba(245, 158, 11, 0.08)",
          borderColor: "rgba(245, 158, 11, 0.4)",
          textColor: "#f59e0b",
          icon: <AlertCircle size={20} style={{ color: "#f59e0b" }} />
        };
      case "loading":
        return {
          bgColor: "rgba(59, 130, 246, 0.08)",
          borderColor: "rgba(59, 130, 246, 0.4)",
          textColor: "#3b82f6",
          icon: <Spinner size={20} style={{ color: "#3b82f6" }} />
        };
      default:
        return {
          bgColor: "var(--background-light, rgba(0, 0, 0, 0.02))",
          borderColor: "var(--navbar-border, rgba(0, 0, 0, 0.1))",
          textColor: "var(--text-primary, #000)",
          icon: <Info size={20} style={{ color: "var(--text-secondary)" }} />
        };
    }
  };

  const currentStyle = getStyles();

  return (
    <div
      style={{
        display: "flex",
        gap: "0.75rem",
        padding: "1rem",
        borderRadius: "var(--border-radius-md, 8px)",
        border: `1px solid ${currentStyle.borderColor}`,
        backgroundColor: currentStyle.bgColor,
        textAlign: "left",
        position: "relative",
        animation: "slideDown 0.2s ease-out",
        marginBottom: "1.25rem"
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", marginTop: "2px" }}>
        {currentStyle.icon}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {title && (
          <h5
            style={{
              fontSize: "0.95rem",
              fontWeight: "600",
              margin: 0,
              color: currentStyle.textColor
            }}
          >
            {title}
          </h5>
        )}
        {description && (
          <div
            style={{
              fontSize: "0.85rem",
              margin: 0,
              color: "var(--text-secondary, #666)",
              lineHeight: "1.4"
            }}
          >
            {description}
          </div>
        )}
        {children}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted, #999)",
            padding: "0.25rem",
            display: "flex",
            alignItems: "center",
            position: "absolute",
            top: "0.5rem",
            right: "0.5rem"
          }}
          title="ปิด"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
