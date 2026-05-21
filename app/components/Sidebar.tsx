"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CheckSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
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
  const collapseLabel = collapsed ? "Expand sidebar" : "Collapse sidebar";

  return (
    <motion.nav
      aria-label="Main navigation"
      initial={false}
      animate={{ width: sidebarWidth }}
      transition={{ duration: 0.2, ease: [0.0, 0.0, 0.2, 1] }}
      className="relative flex-shrink-0 flex flex-col h-screen sticky top-0 overflow-hidden border-r border-[var(--color-border)] bg-[var(--color-surface)]"
      style={{ minWidth: collapsed ? "48px" : "240px" }}
    >
      {/* Top: App name / logo */}
      <div
        className="flex items-center h-[52px] px-[var(--space-md)] border-b border-[var(--color-border)] flex-shrink-0"
      >
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              key="wordmark"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="font-[family-name:var(--font-display)] text-[14px] font-semibold leading-none text-[var(--color-text)] whitespace-nowrap overflow-hidden"
            >
              QuickTask
            </motion.span>
          )}
        </AnimatePresence>
        {collapsed && (
          <span
            className="font-[family-name:var(--font-display)] text-[14px] font-semibold leading-none text-[var(--color-text)] select-none"
            aria-hidden="true"
          >
            Q
          </span>
        )}
      </div>

      {/* Nav items */}
      <ul
        className="flex flex-col gap-[2px] px-[var(--space-xs)] py-[var(--space-sm)] flex-1"
        role="list"
      >
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
                  "flex items-center gap-[var(--space-xs)] rounded-[var(--radius-md)] px-[var(--space-sm)] text-[14px] font-medium leading-none transition-colors duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-bg)]",
                  "h-[32px]",
                  isActive
                    ? "bg-[rgba(47,106,232,0.10)] border-l-[3px] border-l-[var(--color-accent)] text-[var(--color-text)]"
                    : "text-[var(--color-muted)] hover:bg-[rgba(230,238,248,0.04)] border-l-[3px] border-l-transparent",
                  collapsed ? "justify-center px-0 border-l-0" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span
                  className={[
                    "flex-shrink-0 flex items-center justify-center w-[16px] h-[16px]",
                    isActive ? "text-[var(--color-accent)]" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
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
      <div className="flex-shrink-0 px-[var(--space-xs)] pb-[var(--space-sm)]">
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapseLabel}
          title={collapseLabel}
          className="flex items-center justify-center w-full h-[32px] rounded-[var(--radius-md)] text-[var(--color-muted)] hover:bg-[rgba(230,238,248,0.04)] hover:text-[var(--color-text)] transition-colors duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-bg)]"
        >
          {collapsed ? (
            <ChevronRight size={14} aria-hidden />
          ) : (
            <ChevronLeft size={14} aria-hidden />
          )}
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                key="collapse-label"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="ml-[var(--space-sm)] text-[12px] font-medium leading-none overflow-hidden whitespace-nowrap font-[family-name:var(--font-ui)]"
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
