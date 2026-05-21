"use client";

import { useState } from "react";

type Theme = "Light" | "Dark" | "System";

export default function SettingsPage() {
  const [theme, setTheme] = useState<Theme>("System");
  const [saved, setSaved] = useState(false);

  function handleThemeChange(value: Theme) {
    setTheme(value);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--qt-type-h1-size)",
          lineHeight: "var(--qt-type-h1-line)",
          fontWeight: 700,
          color: "var(--qt-text-primary)",
          margin: "0 0 var(--qt-space-lg)",
        }}
      >
        Settings
      </h1>

      <section aria-label="Theme settings">
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--qt-type-h2-size)",
            lineHeight: "var(--qt-type-h2-line)",
            fontWeight: 600,
            color: "var(--qt-text-primary)",
            margin: "0 0 var(--qt-space-xs)",
          }}
        >
          Theme
        </h2>
        <p
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "var(--qt-type-sm-size)",
            lineHeight: "var(--qt-type-sm-line)",
            color: "var(--qt-text-muted)",
            margin: "0 0 var(--qt-space-md)",
          }}
        >
          Choose an app theme. Preference saves locally.
        </p>

        <fieldset
          style={{
            border: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "var(--qt-space-xs)",
          }}
        >
          <legend className="sr-only">Theme</legend>
          {(["Light", "Dark", "System"] as Theme[]).map((option) => (
            <label
              key={option}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--qt-space-xs)",
                cursor: "pointer",
                fontFamily: "var(--font-ui)",
                fontSize: "var(--qt-type-body-size)",
                lineHeight: "var(--qt-type-body-line)",
                color: "var(--qt-text-primary)",
              }}
              title={option === "System" ? "Follow your device theme" : undefined}
            >
              <input
                type="radio"
                name="theme"
                value={option}
                checked={theme === option}
                onChange={() => handleThemeChange(option)}
                style={{ accentColor: "var(--qt-accent)" }}
              />
              {option}
            </label>
          ))}
        </fieldset>

        {saved && (
          <p
            role="status"
            aria-live="polite"
            style={{
              marginTop: "var(--qt-space-sm)",
              fontFamily: "var(--font-ui)",
              fontSize: "var(--qt-type-sm-size)",
              lineHeight: "var(--qt-type-sm-line)",
              color: "var(--qt-status-done)",
            }}
          >
            Saved
          </p>
        )}
      </section>
    </>
  );
}
