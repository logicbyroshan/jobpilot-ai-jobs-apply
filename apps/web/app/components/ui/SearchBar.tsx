import React from "react";
import { Search } from "lucide-react";

export interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  shortcut?: string;
  onClear?: () => void;
}

export function SearchBar({
  placeholder = "Search skills, opportunities, assessments...",
  shortcut = "⌘K",
  className = "",
  style = {},
  ...props
}: SearchBarProps) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        width: "100%",
        maxWidth: "480px",
      }}
    >
      <Search
        size={15}
        color="var(--text-dim)"
        style={{
          position: "absolute",
          left: "12px",
          pointerEvents: "none",
        }}
      />
      <input
        type="text"
        placeholder={placeholder}
        className={`ui-searchbar ${className}`}
        style={{
          width: "100%",
          padding: "8px 14px",
          paddingLeft: "36px",
          paddingRight: shortcut ? "48px" : "14px",
          fontSize: "13.5px",
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "8px",
          color: "var(--text-main)",
          outline: "none",
          transition: "all 0.15s ease",
          fontFamily: "inherit",
          ...style,
        }}
        {...props}
      />
      {shortcut && (
        <span
          style={{
            position: "absolute",
            right: "10px",
            fontSize: "11px",
            fontWeight: 600,
            padding: "2px 6px",
            borderRadius: "4px",
            background: "rgba(255, 255, 255, 0.06)",
            color: "var(--text-dim)",
            border: "1px solid var(--border-subtle)",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {shortcut}
        </span>
      )}
    </div>
  );
}
