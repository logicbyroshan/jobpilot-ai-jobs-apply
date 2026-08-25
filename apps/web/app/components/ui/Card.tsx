import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  padded?: boolean;
}

export function Card({
  children,
  interactive = false,
  padded = true,
  className = "",
  style = {},
  ...props
}: CardProps) {
  return (
    <div
      className={`ui-card ${interactive ? "ui-card-interactive" : ""} ${className}`}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        padding: padded ? "20px" : "0",
        transition: "all 0.15s ease",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
