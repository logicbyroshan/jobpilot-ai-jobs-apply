import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  helperText,
  className = "",
  style = {},
  id,
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--text-muted)",
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
        {leftIcon && (
          <div
            style={{
              position: "absolute",
              left: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-dim)",
              pointerEvents: "none",
            }}
          >
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          className={`ui-input ${error ? "ui-input-error" : ""} ${className}`}
          style={{
            width: "100%",
            padding: "9px 14px",
            paddingLeft: leftIcon ? "38px" : "14px",
            paddingRight: rightIcon ? "38px" : "14px",
            fontSize: "14px",
            background: "rgba(255, 255, 255, 0.03)",
            border: error ? "1px solid #e11d48" : "1px solid var(--border-subtle)",
            borderRadius: "8px",
            color: "var(--text-main)",
            outline: "none",
            transition: "all 0.15s ease",
            fontFamily: "inherit",
            ...style,
          }}
          {...props}
        />

        {rightIcon && (
          <div
            style={{
              position: "absolute",
              right: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-dim)",
            }}
          >
            {rightIcon}
          </div>
        )}
      </div>

      {error && (
        <span style={{ fontSize: "12px", color: "#fca5a5", fontWeight: 500 }}>
          {error}
        </span>
      )}
      {!error && helperText && (
        <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>
          {helperText}
        </span>
      )}
    </div>
  );
}
