import type { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--qt-bg-00)]">
      {/* Skip link — first focusable element, satisfies landmark + keyboard nav spec */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--qt-accent)] focus:text-[var(--qt-accent-on)] focus:rounded-[var(--qt-radius-md)] focus:top-2 focus:left-2"
      >
        Skip to main content
      </a>

      {/* Left column: fixed 240px desktop, collapses to 48px icon-only below md (768px) */}
      <div className="w-[48px] md:w-[240px] flex-shrink-0">
        <Sidebar />
      </div>

      <main
        className="flex-1 min-w-0 overflow-y-auto bg-[var(--qt-bg-00)]"
        id="main-content"
        aria-label="Main content"
      >
        <div
          className="mx-auto w-full max-w-[980px] px-[var(--qt-space-lg,24px)] py-[var(--qt-space-xl,32px)]"
        >
          {children}
        </div>
      </main>
    </div>
  );
}
