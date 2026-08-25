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
    <div style={{ display: "flex", flexDirection: "column", gap: "5px", width: "100%" }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: "12.5px",
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
              left: "10px",
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
            padding: "8px 12px",
            paddingLeft: leftIcon ? "34px" : "12px",
            paddingRight: rightIcon ? "34px" : "12px",
            fontSize: "13.5px",
            background: "var(--bg-input)",
            border: error ? "1px solid #e11d48" : "1px solid var(--border-subtle)",
            borderRadius: "4px",
            color: "var(--text-main)",
            outline: "none",
            transition: "border-color 0.1s ease",
            fontFamily: "inherit",
            ...style,
          }}
          {...props}
        />

        {rightIcon && (
          <div
            style={{
              position: "absolute",
              right: "10px",
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
        <span style={{ fontSize: "11.5px", color: "#fca5a5", fontWeight: 500 }}>
          {error}
        </span>
      )}
      {!error && helperText && (
        <span style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>
          {helperText}
        </span>
      )}
    </div>
  );
}
