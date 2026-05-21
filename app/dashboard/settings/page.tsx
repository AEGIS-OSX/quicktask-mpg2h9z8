"use client";

import { useState, useEffect, useCallback, useId, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ────────────────────────────────────────────────────────────────────

type Theme = "light" | "dark" | "system";

interface ThemeOption {
  value: Theme;
  label: string;
  tooltip?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const THEME_OPTIONS: ThemeOption[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System", tooltip: "Follow your device theme" },
];

const STORAGE_KEY = "qt-theme";
const SAVED_DURATION_MS = 2000;

// ── Helpers ──────────────────────────────────────────────────────────────────

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = theme === "system" ? (prefersDark ? "dark" : "light") : theme;
  root.setAttribute("data-theme", resolved);
}

// ── Sub-components ───────────────────────────────────────────────────────────

interface ThemeRadioProps {
  option: ThemeOption;
  checked: boolean;
  groupName: string;
  onChange: (value: Theme) => void;
}

function ThemeRadio({ option, checked, groupName, onChange }: ThemeRadioProps) {
  const inputId = `theme-${option.value}`;

  return (
    <label
      htmlFor={inputId}
      title={option.tooltip}
      className="relative flex items-center gap-[var(--space-sm)] cursor-pointer select-none"
    >
      <input
        id={inputId}
        type="radio"
        name={groupName}
        value={option.value}
        checked={checked}
        onChange={() => onChange(option.value)}
        className="sr-only"
      />
      {/* Custom radio indicator */}
      <span
        className={[
          "flex-shrink-0 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-colors duration-150 ease-out",
          checked
            ? "border-[var(--color-accent)]"
            : "border-[var(--color-border)]",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden="true"
      >
        <span
          className={[
            "w-[8px] h-[8px] rounded-full bg-[var(--color-accent)] transition-opacity duration-150",
            checked ? "opacity-100" : "opacity-0",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </span>
      <span
        className={[
          "text-[14px] leading-[20px] font-[family-name:var(--font-ui)] transition-colors duration-150 ease-out",
          checked ? "text-[var(--color-text)]" : "text-[var(--color-muted)]",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {option.label}
      </span>
    </label>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [theme, setTheme] = useState<Theme>("system");
  const [loading, setLoading] = useState(true);
  const [showSaved, setShowSaved] = useState(false);
  // useRef so the timer handle persists across renders without causing re-renders
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const groupName = useId();

  // Set document title
  useEffect(() => {
    document.title = "Settings — QuickTask";
  }, []);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = readStoredTheme();
    setTheme(stored);
    applyTheme(stored);
    const t = setTimeout(() => setLoading(false), 250);
    return () => clearTimeout(t);
  }, []);

  const handleThemeChange = useCallback(
    (value: Theme) => {
      setTheme(value);
      window.localStorage.setItem(STORAGE_KEY, value);
      applyTheme(value);

      // Show "Saved" feedback for 2s; clear any pending timer first
      if (savedTimerRef.current !== null) {
        clearTimeout(savedTimerRef.current);
      }
      setShowSaved(true);
      savedTimerRef.current = setTimeout(() => {
        setShowSaved(false);
        savedTimerRef.current = null;
      }, SAVED_DURATION_MS);
    },
    []
  );

  return (
    <>
      {/* Live region for screen reader announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="settings-live"
      >
        {showSaved ? "Saved" : ""}
      </div>

      <section aria-labelledby="settings-heading">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-[var(--space-xl)]"
        >
          <h1
            id="settings-heading"
            className="text-[28px] leading-[36px] font-bold text-[var(--color-text)] font-[family-name:var(--font-display)]"
          >
            Settings
          </h1>
        </motion.div>

        {/* Theme section */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1], delay: 0.05 }}
        >
          <div className="flex items-center justify-between mb-[var(--space-xs)]">
            <h2
              id="theme-section-heading"
              className="text-[20px] leading-[28px] font-semibold text-[var(--color-text)] font-[family-name:var(--font-display)]"
            >
              Theme
            </h2>

            {/* Saved feedback — inline, 2s */}
            <AnimatePresence>
              {showSaved && (
                <motion.span
                  key="saved-badge"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="text-[12px] leading-[16px] font-medium text-[var(--color-done)] font-[family-name:var(--font-ui)]"
                  aria-hidden="true"
                >
                  Saved
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <p className="text-[14px] leading-[20px] text-[var(--color-muted)] font-[family-name:var(--font-ui)] mb-[var(--space-lg)]">
            Choose an app theme. Preference saves locally.
          </p>

          {loading ? (
            <div
              aria-busy="true"
              aria-label="Loading theme settings"
              className="flex flex-col gap-[var(--space-sm)]"
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[32px] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] animate-pulse"
                />
              ))}
            </div>
          ) : (
            <fieldset className="border-0 p-0 m-0" aria-labelledby="theme-section-heading">
              <legend className="sr-only">Theme</legend>
              <div className="flex flex-col gap-[var(--space-sm)]">
                {THEME_OPTIONS.map((option) => (
                  <ThemeRadio
                    key={option.value}
                    option={option}
                    checked={theme === option.value}
                    groupName={groupName}
                    onChange={handleThemeChange}
                  />
                ))}
              </div>
            </fieldset>
          )}
        </motion.div>
      </section>
    </>
  );
}
