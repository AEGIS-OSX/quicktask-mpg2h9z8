import type { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      {/* Skip link — first focusable element, satisfies landmark + keyboard nav spec */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:px-[var(--space-md)] focus:py-[var(--space-xs)] focus:bg-[var(--color-accent)] focus:text-[var(--color-accent-on)] focus:rounded-[var(--radius-md)] focus:top-2 focus:left-2"
      >
        Skip to main content
      </a>

      {/*
        Sidebar is a direct flex child so its own inline-style width
        (240px expanded / 48px collapsed, animated via CSS transition)
        drives the flex layout without a conflicting outer wrapper.
        The component already carries flex-shrink-0 and sticky top-0 h-screen.
      */}
      <Sidebar />

      <main
        id="main-content"
        className="flex-1 min-w-0 overflow-y-auto bg-[var(--color-bg)]"
        aria-label="Main content"
      >
        <div className="mx-auto w-full max-w-[980px] px-[var(--space-lg)] py-[var(--space-xl)]">
          {children}
        </div>
      </main>
    </div>
  );
}
