import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
}

export function Button({
  children,
  variant = "secondary",
  size = "md",
  icon,
  iconPosition = "left",
  loading = false,
  className = "",
  style = {},
  disabled,
  ...props
}: ButtonProps) {
  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: "6px 12px", fontSize: "12.5px", borderRadius: "6px", gap: "6px" },
    md: { padding: "8px 16px", fontSize: "13.5px", borderRadius: "8px", gap: "8px" },
    lg: { padding: "11px 22px", fontSize: "15px", borderRadius: "10px", gap: "10px" },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: "var(--accent-primary)",
      color: "#ffffff",
      border: "1px solid rgba(255, 255, 255, 0.12)",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
    },
    secondary: {
      background: "var(--bg-elevated)",
      color: "var(--text-main)",
      border: "1px solid var(--border-subtle)",
    },
    outline: {
      background: "transparent",
      color: "var(--text-main)",
      border: "1px solid var(--border-subtle)",
    },
    ghost: {
      background: "transparent",
      color: "var(--text-muted)",
      border: "1px solid transparent",
    },
    danger: {
      background: "rgba(225, 29, 72, 0.12)",
      color: "#fca5a5",
      border: "1px solid rgba(225, 29, 72, 0.3)",
    },
  };

  return (
    <button
      disabled={disabled || loading}
      className={`ui-btn ui-btn-${variant} ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.6 : 1,
        transition: "all 0.15s ease",
        fontFamily: "inherit",
        whiteSpace: "nowrap",
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <span className="ui-spinner" style={{ width: "14px", height: "14px" }} />
      ) : (
        icon && iconPosition === "left" && icon
      )}
      {children}
      {!loading && icon && iconPosition === "right" && icon}
    </button>
  );
}
