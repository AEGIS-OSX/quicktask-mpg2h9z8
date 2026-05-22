"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false">
        <rect x="1" y="1" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10" y="1" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="1" y="10" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10" y="10" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "Tasks",
    href: "/dashboard/tasks",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false">
        <path d="M3 4.5h12M3 9h12M3 13.5h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false">
        <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M9 1.5v1.25M9 15.25V16.5M1.5 9h1.25M15.25 9H16.5M3.4 3.4l.88.88M13.72 13.72l.88.88M14.6 3.4l-.88.88M4.28 13.72l-.88.88"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const SIDEBAR_WIDTH_EXPANDED = 240;
const SIDEBAR_WIDTH_COLLAPSED = 48;
const BREAKPOINT_MD = 768;

export function Sidebar() {
  const pathname = usePathname();
  // On mobile (< 768px) the sidebar is always icon-only.
  // On desktop the user can toggle.
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${BREAKPOINT_MD - 1}px)`);
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
      if (e.matches) setCollapsed(true);
    };
    handler(mq);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const isCollapsed = collapsed || isMobile;
  const width = isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <nav
      aria-label="Main navigation"
      style={{
        width: `${width}px`,
        minWidth: `${width}px`,
        background: "var(--qt-surface-01)",
        borderRight: "var(--qt-stroke)",
        transition: "width 200ms ease-out, min-width 200ms ease-out",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* App name / logo row */}
      <div
        style={{
          height: "56px",
          display: "flex",
          alignItems: "center",
          padding: isCollapsed
            ? `0 ${SIDEBAR_WIDTH_COLLAPSED / 2 - 9}px`
            : "0 var(--qt-space-md)",
          borderBottom: "var(--qt-stroke)",
          flexShrink: 0,
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        {/* Icon mark */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          focusable="false"
          style={{ flexShrink: 0, color: "var(--qt-accent)" }}
        >
          <rect x="2" y="2" width="7" height="7" rx="1.5" fill="currentColor" />
          <rect x="11" y="2" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.5" />
          <rect x="2" y="11" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.5" />
          <rect x="11" y="11" width="7" height="7" rx="1.5" fill="currentColor" />
        </svg>
        {!isCollapsed && (
          <span
            style={{
              marginLeft: "var(--qt-space-xs)",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "var(--qt-type-h3-size)",
              lineHeight: "var(--qt-type-h3-line)",
              color: "var(--qt-text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            QuickTask
          </span>
        )}
      </div>

      {/* Nav items */}
      <ul
        role="list"
        style={{
          flex: 1,
          padding: "var(--qt-space-xs) 0",
          margin: 0,
          listStyle: "none",
          overflow: "hidden",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                title={isCollapsed ? item.label : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--qt-space-xs)",
                  /*
                   * Left padding is reduced by 3px to compensate for the 3px left border,
                   * keeping the icon at a consistent horizontal position whether active or not.
                   * Both states carry a 3px left border (solid vs transparent) so layout never shifts.
                   */
                  padding: isCollapsed
                    ? `var(--qt-space-xs) ${SIDEBAR_WIDTH_COLLAPSED / 2 - 9}px`
                    : "var(--qt-space-xs) var(--qt-space-md) var(--qt-space-xs) calc(var(--qt-space-md) - 3px)",
                  margin: "2px var(--qt-space-xxs)",
                  borderRadius: "var(--qt-radius-md)",
                  /* 3px left accent bar — solid on active, transparent on inactive to hold layout */
                  borderLeft: active
                    ? "3px solid var(--qt-accent)"
                    : "3px solid transparent",
                  textDecoration: "none",
                  fontFamily: "var(--font-ui)",
                  fontSize: "var(--qt-type-body-size)",
                  lineHeight: "var(--qt-type-body-line)",
                  fontWeight: active ? 600 : 400,
                  /* Label color: primary on active, muted on inactive */
                  color: active ? "var(--qt-text-primary)" : "var(--qt-text-muted)",
                  background: active ? "var(--qt-bg-00)" : "transparent",
                  transition:
                    "background 150ms ease-out, color 150ms ease-out, border-color 150ms ease-out",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
                {/* Icon: accent color on active, muted on inactive — explicit, not inherited */}
                <span
                  style={{
                    flexShrink: 0,
                    color: active ? "var(--qt-accent)" : "var(--qt-text-muted)",
                  }}
                >
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Collapse toggle — hidden on mobile (always icon-only there) */}
      {!isMobile && (
        <div
          style={{
            borderTop: "var(--qt-stroke)",
            padding: "var(--qt-space-xs) 0",
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: "var(--qt-space-xs)",
              width: "100%",
              padding: collapsed
                ? `var(--qt-space-xs) ${SIDEBAR_WIDTH_COLLAPSED / 2 - 9}px`
                : "var(--qt-space-xs) var(--qt-space-md)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--qt-text-muted)",
              fontFamily: "var(--font-ui)",
              fontSize: "var(--qt-type-sm-size)",
              lineHeight: "var(--qt-type-sm-line)",
              borderRadius: "var(--qt-radius-md)",
              transition: "color 150ms ease-out",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            {/* Chevron icon — flips direction based on collapsed state */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
              focusable="false"
              style={{
                flexShrink: 0,
                transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 200ms ease-out",
              }}
            >
              <path
                d="M10 12L6 8l4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {!collapsed && <span>Collapse sidebar</span>}
          </button>
        </div>
      )}
    </nav>
  );
}
