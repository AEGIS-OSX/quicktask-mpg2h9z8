export default function DashboardPage() {
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
        Dashboard
      </h1>

      {/* KPI cards placeholder */}
      <section aria-label="KPI summary">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "var(--qt-space-md)",
            marginBottom: "var(--qt-space-xl)",
          }}
        >
          {(["All tasks", "Todo", "In progress", "Done"] as const).map((label) => (
            <div
              key={label}
              style={{
                background: "var(--qt-surface-01)",
                border: "var(--qt-stroke)",
                borderRadius: "var(--qt-radius-lg)",
                padding: "var(--qt-space-md)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-ui)",
                  fontSize: "var(--qt-type-sm-size)",
                  lineHeight: "var(--qt-type-sm-line)",
                  color: "var(--qt-text-muted)",
                }}
              >
                {label}
              </p>
              <p
                style={{
                  margin: "var(--qt-space-xxs) 0 0",
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--qt-type-h2-size)",
                  lineHeight: "var(--qt-type-h2-line)",
                  fontWeight: 700,
                  color: "var(--qt-text-primary)",
                }}
              >
                0
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent tasks */}
      <section aria-label="Recent tasks">
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--qt-type-h2-size)",
            lineHeight: "var(--qt-type-h2-line)",
            fontWeight: 600,
            color: "var(--qt-text-primary)",
            margin: "0 0 var(--qt-space-md)",
          }}
        >
          Recent tasks
        </h2>
        <p
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "var(--qt-type-body-size)",
            lineHeight: "var(--qt-type-body-line)",
            color: "var(--qt-text-muted)",
            margin: 0,
          }}
        >
          No tasks yet
        </p>
      </section>
    </>
  );
}
