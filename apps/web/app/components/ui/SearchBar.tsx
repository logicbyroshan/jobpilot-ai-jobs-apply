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
        maxWidth: "460px",
      }}
    >
      <Search
        size={14}
        color="var(--text-dim)"
        style={{
          position: "absolute",
          left: "11px",
          pointerEvents: "none",
        }}
      />
      <input
        type="text"
        placeholder={placeholder}
        className={`ui-searchbar ${className}`}
        style={{
          width: "100%",
          padding: "7px 12px",
          paddingLeft: "32px",
          paddingRight: shortcut ? "44px" : "12px",
          fontSize: "13px",
          background: "var(--bg-input)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "4px",
          color: "var(--text-main)",
          outline: "none",
          transition: "border-color 0.1s ease",
          fontFamily: "inherit",
          ...style,
        }}
        {...props}
      />
      {shortcut && (
        <span
          style={{
            position: "absolute",
            right: "8px",
            fontSize: "10.5px",
            fontWeight: 600,
            padding: "1px 5px",
            borderRadius: "3px",
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
