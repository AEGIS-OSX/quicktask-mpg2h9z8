"use client";

import { useState, useEffect, useCallback, useId } from "react";
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
      className={[
        "relative flex items-center gap-[var(--space-sm)] px-[var(--space-md)] py-[var(--space-sm)] rounded-[var(--radius-md)] border cursor-pointer transition-colors duration-150 ease-out select-none",
        checked
          ? "border-[var(--color-accent)] bg-[rgba(47,106,232,0.08)]"
          : "border-[var(--color-border)] bg-[var(--color-surface-alt)] hover:border-[var(--color-muted)] hover:bg-[rgba(230,238,248,0.04)]",
      ]
        .filter(Boolean)
        .join(" ")}
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
        className="flex-shrink-0 w-[16px] h-[16px] rounded-full border-[1.5px] flex items-center justify-center transition-colors duration-150 ease-out"
        style={{
          borderColor: checked ? "var(--color-accent)" : "var(--color-muted)",
        }}
        aria-hidden="true"
      >
        {checked && (
          <span
            className="w-[8px] h-[8px] rounded-full bg-[var(--color-accent)]"
          />
        )}
      </span>
      <span
        className={[
          "text-[14px] leading-[20px] font-medium font-[family-name:var(--font-ui)] transition-colors duration-150 ease-out",
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
  const savedTimerRef = { current: null as ReturnType<typeof setTimeout> | null };
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

      // Show "Saved" feedback for 2s
      if (savedTimerRef.current !== null) {
        clearTimeout(savedTimerRef.current);
      }
      setShowSaved(true);
      savedTimerRef.current = setTimeout(() => {
        setShowSaved(false);
        savedTimerRef.current = null;
      }, SAVED_DURATION_MS);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden"
        >
          <div className="px-[var(--space-lg)] py-[var(--space-lg)] border-b border-[var(--color-border)]">
            <div className="flex items-center justify-between">
              <h2
                id="theme-section-heading"
                className="text-[20px] leading-[28px] font-semibold text-[var(--color-text)] font-[family-name:var(--font-display)]"
              >
                Theme
              </h2>

              {/* Saved feedback */}
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

            <p className="mt-[var(--space-xxs)] text-[12px] leading-[16px] text-[var(--color-muted)] font-[family-name:var(--font-ui)]">
              Choose an app theme. Preference saves locally.
            </p>
          </div>

          <div
            className="px-[var(--space-lg)] py-[var(--space-lg)]"
            aria-labelledby="theme-section-heading"
          >
            {loading ? (
              <div
                aria-busy="true"
                aria-label="Loading theme settings"
                className="flex flex-col sm:flex-row gap-[var(--space-sm)]"
              >
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-[48px] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <fieldset
                className="border-0 p-0 m-0"
                aria-labelledby="theme-section-heading"
              >
                <legend className="sr-only">Theme</legend>
                <div className="flex flex-col sm:flex-row gap-[var(--space-sm)]">
                  {THEME_OPTIONS.map((option) => (
                    <div key={option.value} className="flex-1">
                      <ThemeRadio
                        option={option}
                        checked={theme === option.value}
                        groupName={groupName}
                        onChange={handleThemeChange}
                      />
                    </div>
                  ))}
                </div>
              </fieldset>
            )}
          </div>
        </motion.div>
      </section>
    </>
  );
}
