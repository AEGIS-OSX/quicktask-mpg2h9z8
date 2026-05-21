import type { ReactNode } from "react";
import { Sidebar } from "../components/Sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <Sidebar />
      <main
        className="flex-1 min-w-0 overflow-y-auto bg-[var(--color-bg)]"
        id="main-content"
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
