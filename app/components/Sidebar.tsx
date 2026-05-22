"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
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

  return (
    <motion.nav
      aria-label="Main navigation"
      initial={false}
      animate={{ width: collapsed ? 48 : 240 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="relative flex-shrink-0 flex flex-col h-screen sticky top-0 overflow-hidden border-r border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      {/* Top: App name / logo */}
      <div className="flex items-center h-[52px] px-[var(--space-md)] border-b border-[var(--color-border)] flex-shrink-0 overflow-hidden">
        <AnimatePresence initial={false} mode="wait">
          {collapsed ? (
            <motion.span
              key="monogram"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className="font-[family-name:var(--font-display)] text-[14px] font-semibold leading-none text-[var(--color-text)] select-none w-full flex justify-center"
              aria-hidden="true"
            >
              Q
            </motion.span>
          ) : (
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
                  "relative flex items-center gap-[var(--space-xs)] py-[var(--space-xs)] rounded-[var(--radius-md)] text-[14px] font-normal leading-none transition-colors duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-bg)]",
                  collapsed
                    ? "justify-center px-0 w-[48px]"
                    : isActive
                    ? "pl-[calc(var(--space-sm)-3px)] pr-[var(--space-sm)]"
                    : "px-[var(--space-sm)]",
                  isActive
                    ? "bg-[rgba(47,106,232,0.10)] border-l-[3px] border-l-[var(--color-accent)] text-[var(--color-text)]"
                    : "border-l-[3px] border-l-transparent text-[var(--color-muted)] hover:bg-[rgba(230,238,248,0.04)] hover:text-[var(--color-text)]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {/* Icon */}
                <span
                  className={[
                    "flex-shrink-0 flex items-center justify-center w-[16px] h-[16px] transition-colors duration-150 ease-out",
                    isActive ? "text-[var(--color-accent)]" : "text-[var(--color-muted)]",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {item.icon}
                </span>

                {/* Label — hidden when collapsed */}
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
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={[
            "flex items-center h-[32px] rounded-[var(--radius-md)] text-[var(--color-muted)] hover:bg-[rgba(230,238,248,0.04)] hover:text-[var(--color-text)] transition-colors duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-bg)]",
            collapsed ? "justify-center w-[48px] px-0" : "w-full px-[var(--space-sm)]",
          ]
            .filter(Boolean)
            .join(" ")}
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
