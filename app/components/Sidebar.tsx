"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/* Inline SVG icon components replacing lucide-react imports */
function LayoutDashboard({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function CheckSquare({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function SettingsIcon({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1.08 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1.08z" />
    </svg>
  );
}

function ChevronLeft({ size = 14, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRight({ size = 14, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/dashboard/tasks", label: "Tasks", Icon: CheckSquare },
  { href: "/dashboard/settings", label: "Settings", Icon: SettingsIcon },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  /* Motion config — zero duration when user prefers reduced motion */
  const springTransition = shouldReduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, duration: 0.16, bounce: 0 };

  const labelTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.12, ease: "easeOut" };

  return (
    <motion.nav
      aria-label="Main navigation"
      animate={{ width: collapsed ? 56 : 240 }}
      transition={springTransition}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        background: "var(--qt-surface-01)",
        borderRight: "var(--qt-stroke)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 40,
        flexShrink: 0,
      }}
    >
      {/* App name / logo row */}
      <div
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          padding: collapsed ? "0 16px" : "0 20px",
          borderBottom: "var(--qt-stroke)",
          flexShrink: 0,
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        <AnimatePresence initial={false} mode="wait">
          {collapsed ? (
            <motion.span
              key="logo-collapsed"
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0 }}
              transition={labelTransition}
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 16,
                color: "var(--qt-accent)",
                letterSpacing: "-0.01em",
              }}
            >
              Q
            </motion.span>
          ) : (
            <motion.span
              key="logo-expanded"
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0 }}
              transition={labelTransition}
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 16,
                color: "var(--qt-text-primary)",
                letterSpacing: "-0.01em",
              }}
            >
              QuickTask
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav items */}
      <ul
        role="list"
        style={{
          flex: 1,
          padding: "8px 0",
          margin: 0,
          listStyle: "none",
          overflow: "hidden",
        }}
      >
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                title={collapsed ? label : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  height: 40,
                  padding: collapsed ? "0 16px" : "0 16px",
                  margin: "2px 8px",
                  borderRadius: "var(--qt-radius-md)",
                  textDecoration: "none",
                  color: isActive ? "var(--qt-text-primary)" : "var(--qt-text-muted)",
                  background: isActive ? "rgba(47, 106, 232, 0.10)" : "transparent",
                  borderLeft: isActive ? "3px solid var(--qt-accent)" : "3px solid transparent",
                  fontFamily: "var(--font-ui)",
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  transition: shouldReduceMotion
                    ? "none"
                    : "background 0.12s ease, color 0.12s ease",
                }}
              >
                <Icon
                  size={16}
                  style={{
                    flexShrink: 0,
                    color: isActive ? "var(--qt-accent)" : "var(--qt-text-muted)",
                  }}
                />
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      key={`label-${href}`}
                      initial={shouldReduceMotion ? false : { opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={shouldReduceMotion ? undefined : { opacity: 0, width: 0 }}
                      transition={labelTransition}
                      style={{ overflow: "hidden" }}
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Collapse toggle */}
      <div
        style={{
          padding: "8px",
          borderTop: "var(--qt-stroke)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-end",
            width: "100%",
            height: 32,
            padding: "0 8px",
            background: "transparent",
            border: "none",
            borderRadius: "var(--qt-radius-md)",
            color: "var(--qt-text-muted)",
            cursor: "pointer",
            transition: shouldReduceMotion
              ? "none"
              : "background 0.12s ease, color 0.12s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(230, 238, 248, 0.05)";
            (e.currentTarget as HTMLButtonElement).style.color =
              "var(--qt-text-primary)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color =
              "var(--qt-text-muted)";
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </motion.nav>
  );
}