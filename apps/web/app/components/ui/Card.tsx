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
        padding: padded ? "18px" : "0",
        transition: "background-color 0.1s ease, border-color 0.1s ease",
        position: "relative",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
