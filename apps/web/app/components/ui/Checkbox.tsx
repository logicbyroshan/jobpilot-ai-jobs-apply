import React from "react";
import { Check } from "lucide-react";

export interface CheckboxProps {
  checked: boolean;
  onChange?: ((checked: boolean) => void) | ((e: any) => void);
  label?: React.ReactNode;
  description?: string;
  disabled?: boolean;
  id?: string;
}

export function Checkbox({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
}: CheckboxProps) {
  const checkboxId = id || (typeof label === "string" ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <label
      htmlFor={checkboxId}
      style={{
        display: "inline-flex",
        alignItems: "flex-start",
        gap: "8px",
        cursor: disabled ? "not-allowed" : "pointer",
        userSelect: "none",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <div
        style={{
          width: "16px",
          height: "16px",
          borderRadius: "3px",
          background: checked ? "var(--accent-primary)" : "var(--bg-input)",
          border: checked ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "2px",
          flexShrink: 0,
          transition: "all 0.1s ease",
        }}
      >
        <input
          type="checkbox"
          id={checkboxId}
          checked={checked}
          onChange={(e) => {
            if (disabled || !onChange) return;
            (onChange as any)(e.target.checked);
          }}
          disabled={disabled}
          style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
        />
        {checked && <Check size={11} color="#ffffff" strokeWidth={3} />}
      </div>

      {(label || description) && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {label && (
            <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-main)", lineHeight: 1.4 }}>
              {label}
            </span>
          )}
          {description && (
            <span style={{ fontSize: "11.5px", color: "var(--text-dim)", marginTop: "1px" }}>
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
}
