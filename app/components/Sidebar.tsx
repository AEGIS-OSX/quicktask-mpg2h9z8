"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, CheckSquare, Settings } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{
        transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 200ms ease-out",
      }}
    >
      <path
        d="M9 2L4 7l5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={16} aria-hidden />,
  },
  {
    href: "/dashboard/tasks",
    label: "Tasks",
    icon: <CheckSquare size={16} aria-hidden />,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: <Settings size={16} aria-hidden />,
  },
];

export function Sidebar({ items: _items }: { items?: NavItem[] }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const sidebarWidth = collapsed ? 48 : 240;

  return (
    <motion.nav
      aria-label="Main navigation"
      initial={false}
      animate={{ width: sidebarWidth }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative flex-shrink-0 flex flex-col h-screen sticky top-0 overflow-hidden border-r border-[var(--qt-border)] bg-[var(--qt-surface-01)]"
      style={{ minWidth: collapsed ? "48px" : "240px" }}
    >
      {/* Top: App name / logo */}
      <div
        className="flex items-center h-[52px] px-[var(--qt-space-md)] border-b border-[var(--qt-border)] flex-shrink-0"
      >
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              key="wordmark"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="font-[family-name:var(--font-display)] text-[14px] font-semibold leading-none text-[var(--qt-text-primary)] whitespace-nowrap overflow-hidden"
            >
              QuickTask
            </motion.span>
          )}
        </AnimatePresence>
        {collapsed && (
          <span
            className="font-[family-name:var(--font-display)] text-[14px] font-semibold leading-none text-[var(--qt-text-primary)] select-none"
            aria-hidden="true"
          >
            Q
          </span>
        )}
      </div>

      {/* Nav items */}
      <ul className="flex flex-col gap-[2px] px-[var(--qt-space-xs)] py-[var(--qt-space-sm)] flex-1" role="list">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <li key={item.href} role="listitem">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                title={collapsed ? item.label : undefined}
                className={[
                  "flex items-center gap-[var(--qt-space-sm)] h-[32px] rounded-[var(--qt-radius-md)] px-[var(--qt-space-sm)] text-[14px] font-medium leading-none transition-colors duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--qt-accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--qt-bg-00)]",
                  isActive
                    ? "bg-[var(--qt-accent)] text-[var(--qt-accent-on)]"
                    : "text-[var(--qt-text-muted)] hover:bg-[var(--qt-border)] hover:text-[var(--qt-text-primary)]",
                  collapsed ? "justify-center px-0" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className="flex-shrink-0 flex items-center justify-center w-[16px] h-[16px]">
                  {item.icon}
                </span>
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      key={`label-${item.href}`}
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="overflow-hidden whitespace-nowrap font-[family-name:var(--font-ui)]"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Collapse toggle */}
      <div className="flex-shrink-0 px-[var(--qt-space-xs)] pb-[var(--qt-space-sm)]">
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex items-center justify-center w-full h-[32px] rounded-[var(--qt-radius-md)] text-[var(--qt-text-muted)] hover:bg-[var(--qt-border)] hover:text-[var(--qt-text-primary)] transition-colors duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--qt-accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--qt-bg-00)]"
        >
          <CollapseIcon collapsed={collapsed} />
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                key="collapse-label"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="ml-[var(--qt-space-sm)] text-[12px] font-medium leading-none overflow-hidden whitespace-nowrap font-[family-name:var(--font-ui)]"
              >
                Collapse sidebar
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.nav>
  );
}
