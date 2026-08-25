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
    sm: { padding: "4px 9px", fontSize: "12px", borderRadius: "4px", gap: "5px" },
    md: { padding: "6px 13px", fontSize: "13px", borderRadius: "5px", gap: "6px" },
    lg: { padding: "9px 18px", fontSize: "14px", borderRadius: "6px", gap: "8px" },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: "var(--accent-primary)",
      color: "#ffffff",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
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
        transition: "all 0.1s ease",
        fontFamily: "inherit",
        whiteSpace: "nowrap",
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <span className="ui-spinner" style={{ width: "13px", height: "13px" }} />
      ) : (
        icon && iconPosition === "left" && icon
      )}
      {children}
      {!loading && icon && iconPosition === "right" && icon}
    </button>
  );
}
