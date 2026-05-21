import type { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--qt-bg-00)",
      }}
    >
      {/* Skip link — first focusable element, satisfies landmark + keyboard nav spec */}
      <a
        href="#main-content"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
        onFocus={(e) => {
          const el = e.currentTarget;
          el.style.position = "fixed";
          el.style.top = "var(--qt-space-xs)";
          el.style.left = "var(--qt-space-xs)";
          el.style.width = "auto";
          el.style.height = "auto";
          el.style.padding = "var(--qt-space-xs) var(--qt-space-md)";
          el.style.margin = "0";
          el.style.overflow = "visible";
          el.style.clip = "auto";
          el.style.whiteSpace = "normal";
          el.style.background = "var(--qt-accent)";
          el.style.color = "var(--qt-accent-on)";
          el.style.borderRadius = "var(--qt-radius-md)";
          el.style.zIndex = "9999";
          el.style.fontFamily = "var(--font-ui)";
          el.style.fontSize = "var(--qt-type-body-size)";
          el.style.fontWeight = "600";
          el.style.textDecoration = "none";
        }}
        onBlur={(e) => {
          const el = e.currentTarget;
          el.style.position = "absolute";
          el.style.width = "1px";
          el.style.height = "1px";
          el.style.padding = "0";
          el.style.margin = "-1px";
          el.style.overflow = "hidden";
          el.style.clip = "rect(0,0,0,0)";
          el.style.whiteSpace = "nowrap";
          el.style.border = "0";
        }}
      >
        Skip to main content
      </a>

      {/*
        Sidebar is a direct flex child. Its own inline-style width
        (240px expanded / 48px collapsed, animated via CSS transition)
        drives the flex layout without a conflicting outer wrapper.
        The component carries flex-shrink-0 and sticky top-0 h-screen.
      */}
      <Sidebar />

      <main
        id="main-content"
        aria-label="Main content"
        style={{
          flex: 1,
          minWidth: 0,
          overflowY: "auto",
          background: "var(--qt-bg-00)",
        }}
      >
        <div
          style={{
            margin: "0 auto",
            width: "100%",
            maxWidth: "980px",
            padding: "var(--qt-space-xl) var(--qt-space-lg)",
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
