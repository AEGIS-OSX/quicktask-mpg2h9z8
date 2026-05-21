export default function TasksPage() {
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
        Tasks
      </h1>

      {/* Filter bar placeholder */}
      <section aria-label="Task filters">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--qt-space-sm)",
            marginBottom: "var(--qt-space-md)",
          }}
        >
          <label
            htmlFor="status-filter"
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "var(--qt-type-body-size)",
              lineHeight: "var(--qt-type-body-line)",
              color: "var(--qt-text-muted)",
            }}
          >
            Status
          </label>
          <select
            id="status-filter"
            defaultValue="All"
            style={{
              background: "var(--qt-surface-01)",
              border: "var(--qt-stroke)",
              borderRadius: "var(--qt-radius-md)",
              color: "var(--qt-text-primary)",
              fontFamily: "var(--font-ui)",
              fontSize: "var(--qt-type-body-size)",
              lineHeight: "var(--qt-type-body-line)",
              padding: "var(--qt-space-xxs) var(--qt-space-xs)",
            }}
          >
            <option>All</option>
            <option>Todo</option>
            <option>In progress</option>
            <option>Done</option>
          </select>
        </div>
      </section>

      {/* Tasks table placeholder */}
      <section aria-label="Tasks list">
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: "var(--font-ui)",
            fontSize: "var(--qt-type-body-size)",
            lineHeight: "var(--qt-type-body-line)",
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "var(--qt-stroke)",
              }}
            >
              {["Title", "Status", "Created"].map((col) => (
                <th
                  key={col}
                  scope="col"
                  style={{
                    textAlign: "left",
                    padding: "var(--qt-space-xs) var(--qt-space-sm)",
                    fontWeight: 600,
                    color: "var(--qt-text-muted)",
                    fontSize: "var(--qt-type-sm-size)",
                    lineHeight: "var(--qt-type-sm-line)",
                  }}
                >
                  {col}
                </th>
              ))}
              <th
                scope="col"
                style={{
                  textAlign: "left",
                  padding: "var(--qt-space-xs) var(--qt-space-sm)",
                }}
              >
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={4}
                style={{
                  padding: "var(--qt-space-xl) var(--qt-space-sm)",
                  textAlign: "center",
                  color: "var(--qt-text-muted)",
                }}
              >
                No tasks match this filter
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </>
  );
}
