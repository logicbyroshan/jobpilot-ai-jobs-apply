import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger" | "brand";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "secondary",
  size = "md",
  icon,
  iconPosition = "left",
  loading = false,
  fullWidth = false,
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
      background: "#f8fafc",
      color: "#090d16",
      fontWeight: 600,
      border: "1px solid rgba(255, 255, 255, 0.25)",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
    },
    brand: {
      background: "var(--accent-primary)",
      color: "#ffffff",
      fontWeight: 600,
      border: "1px solid rgba(255, 255, 255, 0.1)",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
    },
    secondary: {
      background: "var(--bg-elevated)",
      color: "var(--text-main)",
      fontWeight: 500,
      border: "1px solid var(--border-subtle)",
    },
    outline: {
      background: "transparent",
      color: "var(--text-main)",
      fontWeight: 500,
      border: "1px solid var(--border-subtle)",
    },
    ghost: {
      background: "transparent",
      color: "var(--text-muted)",
      fontWeight: 500,
      border: "1px solid transparent",
    },
    danger: {
      background: "rgba(225, 29, 72, 0.12)",
      color: "#fca5a5",
      fontWeight: 600,
      border: "1px solid rgba(225, 29, 72, 0.3)",
    },
  };

  return (
    <button
      disabled={disabled || loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.6 : 1,
        transition: "all 0.1s ease",
        fontFamily: "inherit",
        whiteSpace: "nowrap",
        boxSizing: "border-box",
        width: fullWidth ? "100%" : undefined,
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
      className={`btn ${className}`}
      {...props}
    >
      {loading ? (
        <span
          style={{
            width: "12px",
            height: "12px",
            border: "2px solid rgba(255, 255, 255, 0.3)",
            borderTopColor: "currentColor",
            borderRadius: "50%",
            animation: "spin 0.6s linear infinite",
          }}
        />
      ) : (
        <>
          {icon && iconPosition === "left" && icon}
          {children}
          {icon && iconPosition === "right" && icon}
        </>
      )}
    </button>
  );
}
