"use client";

import { useState, useEffect, useCallback, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ── Types ────────────────────────────────────────────────────────────────────

type TaskStatus = "todo" | "inprogress" | "done";

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: string;
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

// ── Seed data ────────────────────────────────────────────────────────────────

const SEED_TASKS: Task[] = [
  { id: "t1", title: "Fix navigation bug", status: "done", createdAt: "2026-05-20" },
  { id: "t2", title: "Write project brief", status: "inprogress", createdAt: "2026-05-20" },
  { id: "t3", title: "Review pull request #42", status: "todo", createdAt: "2026-05-19" },
  { id: "t4", title: "Update onboarding copy", status: "todo", createdAt: "2026-05-19" },
  { id: "t5", title: "Deploy staging environment", status: "inprogress", createdAt: "2026-05-18" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function statusLabel(status: TaskStatus): string {
  if (status === "todo") return "Todo";
  if (status === "inprogress") return "In progress";
  return "Done";
}

function statusColor(status: TaskStatus): string {
  if (status === "todo") return "var(--qt-status-todo)";
  if (status === "inprogress") return "var(--qt-status-inprogress)";
  return "var(--qt-status-done)";
}

// ── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className="inline-flex items-center gap-[var(--qt-space-xxs)] px-[var(--qt-space-xs)] h-[20px] rounded-[var(--qt-radius-sm)] text-[length:var(--qt-type-sm-size)] leading-[var(--qt-type-sm-line)] font-medium font-[family-name:var(--font-ui)] whitespace-nowrap"
      style={{
        backgroundColor: `color-mix(in srgb, ${statusColor(status)} 15%, transparent)`,
        color: statusColor(status),
      }}
      aria-label={`status: ${statusLabel(status)}`}
    >
      <span
        className="w-[6px] h-[6px] rounded-full flex-shrink-0"
        style={{ backgroundColor: statusColor(status) }}
        aria-hidden="true"
      />
      {statusLabel(status)}
    </span>
  );
}

function KpiCard({
  label,
  count,
  status,
  index,
}: {
  label: string;
  count: number;
  status: TaskStatus | "all";
  index: number;
}) {
  const dotColor =
    status === "all" ? "var(--qt-accent)" : statusColor(status as TaskStatus);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1], delay: index * 0.05 }}
    >
      <Link
        href={status === "all" ? "/dashboard/tasks" : `/dashboard/tasks?status=${status}`}
        className="group block rounded-[var(--qt-radius-lg)] border border-[var(--qt-border)] bg-[var(--qt-surface-01)] px-[var(--qt-space-md)] py-[var(--qt-space-md)] hover:border-[var(--qt-accent)] transition-colors duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--qt-accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--qt-bg-00)]"
        title="View tasks filtered by status"
        aria-label={`${label}: ${count} tasks. View tasks filtered by status`}
      >
        <div className="flex items-center justify-between mb-[var(--qt-space-sm)]">
          <span className="text-[length:var(--qt-type-sm-size)] leading-[var(--qt-type-sm-line)] font-medium text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)]">
            {label}
          </span>
          <span
            className="w-[8px] h-[8px] rounded-full flex-shrink-0"
            style={{ backgroundColor: dotColor }}
            aria-hidden="true"
          />
        </div>
        <span className="block text-[32px] leading-[1] font-bold text-[var(--qt-text-primary)] font-[family-name:var(--font-display)] tabular-nums">
          {count}
        </span>
      </Link>
    </motion.div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-[var(--qt-space-md)] px-[var(--qt-space-md)] h-[44px] border-b border-[var(--qt-border)] last:border-b-0">
      <div className="h-[12px] w-[40%] rounded-[var(--qt-radius-sm)] bg-[var(--qt-surface-02)] animate-pulse" />
      <div className="h-[20px] w-[72px] rounded-[var(--qt-radius-sm)] bg-[var(--qt-surface-02)] animate-pulse" />
      <div className="h-[12px] w-[80px] rounded-[var(--qt-radius-sm)] bg-[var(--qt-surface-02)] animate-pulse ml-auto" />
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="rounded-[var(--qt-radius-lg)] border border-[var(--qt-border)] bg-[var(--qt-surface-01)] px-[var(--qt-space-md)] py-[var(--qt-space-md)]">
      <div className="h-[12px] w-[60px] rounded-[var(--qt-radius-sm)] bg-[var(--qt-surface-02)] animate-pulse mb-[var(--qt-space-sm)]" />
      <div className="h-[32px] w-[40px] rounded-[var(--qt-radius-sm)] bg-[var(--qt-surface-02)] animate-pulse" />
    </div>
  );
}

// ── Create Task Modal ─────────────────────────────────────────────────────────

interface CreateTaskModalProps {
  onClose: () => void;
  onSave: (title: string, status: TaskStatus) => void;
}

function CreateTaskModal({ onClose, onSave }: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [error, setError] = useState("");
  const titleId = useId();
  const statusId = useId();

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const trimmed = title.trim();
      if (!trimmed) {
        setError("Title is required.");
        return;
      }
      onSave(trimmed, status);
    },
    [title, status, onSave]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-[var(--qt-space-md)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-[var(--qt-shadow-modal)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <motion.div
        className="relative z-10 w-full max-w-[440px] rounded-[var(--qt-radius-modal)] border border-[var(--qt-border)] bg-[var(--qt-surface-01)] shadow-[0_10px_30px_var(--qt-shadow-modal)]"
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="px-[var(--qt-space-lg)] pt-[var(--qt-space-lg)] pb-[var(--qt-space-md)]">
          <h2
            id="modal-title"
            className="text-[length:var(--qt-type-h2-size)] leading-[var(--qt-type-h2-line)] font-semibold text-[var(--qt-text-primary)] font-[family-name:var(--font-display)] mb-[var(--qt-space-lg)]"
          >
            Create task
          </h2>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-[var(--qt-space-md)]">
              <label
                htmlFor={titleId}
                className="block text-[length:var(--qt-type-sm-size)] leading-[var(--qt-type-sm-line)] font-medium text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)] mb-[var(--qt-space-xxs)]"
              >
                Title
              </label>
              <input
                id={titleId}
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError("");
                }}
                placeholder="e.g., Fix navigation bug"
                autoFocus
                className="w-full h-[36px] rounded-[var(--qt-radius-md)] border border-[var(--qt-border)] bg-[var(--qt-surface-02)] px-[var(--qt-space-sm)] text-[length:var(--qt-type-body-size)] leading-[var(--qt-type-body-line)] text-[var(--qt-text-primary)] font-[family-name:var(--font-ui)] placeholder:text-[var(--qt-text-muted)] outline-none focus:border-[var(--qt-accent)] focus:ring-1 focus:ring-[var(--qt-accent)] transition-colors duration-150 ease-out"
                aria-describedby={error ? `${titleId}-error` : undefined}
                aria-invalid={error ? "true" : undefined}
              />
              {error && (
                <p
                  id={`${titleId}-error`}
                  role="alert"
                  className="mt-[var(--qt-space-xxs)] text-[length:var(--qt-type-sm-size)] leading-[var(--qt-type-sm-line)] text-[var(--qt-danger)] font-[family-name:var(--font-ui)]"
                >
                  {error}
                </p>
              )}
            </div>

            <div className="mb-[var(--qt-space-lg)]">
              <label
                htmlFor={statusId}
                className="block text-[length:var(--qt-type-sm-size)] leading-[var(--qt-type-sm-line)] font-medium text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)] mb-[var(--qt-space-xxs)]"
              >
                Status
              </label>
              <select
                id={statusId}
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full h-[36px] rounded-[var(--qt-radius-md)] border border-[var(--qt-border)] bg-[var(--qt-surface-02)] px-[var(--qt-space-sm)] text-[length:var(--qt-type-body-size)] leading-[var(--qt-type-body-line)] text-[var(--qt-text-primary)] font-[family-name:var(--font-ui)] outline-none focus:border-[var(--qt-accent)] focus:ring-1 focus:ring-[var(--qt-accent)] transition-colors duration-150 ease-out cursor-pointer"
              >
                <option value="todo">Todo</option>
                <option value="inprogress">In progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-[var(--qt-space-xs)]">
              <button
                type="button"
                onClick={onClose}
                className="h-[32px] px-[var(--qt-space-md)] rounded-[var(--qt-radius-md)] text-[length:var(--qt-type-body-size)] leading-none font-medium text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)] hover:bg-[var(--qt-border)] hover:text-[var(--qt-text-primary)] transition-colors duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--qt-accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--qt-surface-01)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-[32px] px-[var(--qt-space-md)] rounded-[var(--qt-radius-md)] text-[length:var(--qt-type-body-size)] leading-none font-semibold text-[var(--qt-accent-on)] bg-[var(--qt-accent)] font-[family-name:var(--font-ui)] hover:opacity-90 transition-opacity duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--qt-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--qt-surface-01)]"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function ToastList({ toasts }: { toasts: Toast[] }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-[var(--qt-space-lg)] right-[var(--qt-space-lg)] z-50 flex flex-col gap-[var(--qt-space-xs)] pointer-events-none"
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
            className="rounded-[var(--qt-radius-md)] border border-[var(--qt-border)] bg-[var(--qt-surface-01)] px-[var(--qt-space-md)] py-[var(--qt-space-sm)] text-[length:var(--qt-type-body-size)] leading-[var(--qt-type-body-line)] font-medium text-[var(--qt-text-primary)] font-[family-name:var(--font-ui)] shadow-[0_4px_16px_rgba(0,0,0,0.4)] pointer-events-auto"
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Simulate brief load on mount
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const addToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const handleSaveTask = useCallback(
    (title: string, status: TaskStatus) => {
      const newTask: Task = {
        id: `t${Date.now()}`,
        title,
        status,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setTasks((prev) => [newTask, ...prev]);
      setShowModal(false);
      addToast("Task created");
    },
    [addToast]
  );

  const counts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inprogress: tasks.filter((t) => t.status === "inprogress").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  const recentTasks = tasks.slice(0, 5);

  const kpiCards: Array<{ label: string; count: number; status: TaskStatus | "all" }> = [
    { label: "All tasks", count: counts.all, status: "all" },
    { label: "Todo", count: counts.todo, status: "todo" },
    { label: "In progress", count: counts.inprogress, status: "inprogress" },
    { label: "Done", count: counts.done, status: "done" },
  ];

  return (
    <>
      {/* Live region for screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" id="dashboard-live" />

      <section aria-labelledby="dashboard-heading">
        {/* Page header */}
        <div className="flex items-center justify-between mb-[var(--qt-space-xl)]">
          <h1
            id="dashboard-heading"
            className="text-[length:var(--qt-type-h1-size)] leading-[var(--qt-type-h1-line)] font-bold text-[var(--qt-text-primary)] font-[family-name:var(--font-display)] md:text-[length:var(--qt-type-h1-size)]"
          >
            Dashboard
          </h1>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            title="Create a new task"
            aria-label="Add task"
            className="h-[32px] px-[var(--qt-space-md)] rounded-[var(--qt-radius-md)] text-[length:var(--qt-type-body-size)] leading-none font-semibold text-[var(--qt-accent-on)] bg-[var(--qt-accent)] font-[family-name:var(--font-ui)] hover:opacity-90 transition-opacity duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--qt-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--qt-bg-00)]"
          >
            Add task
          </button>
        </div>

        {/* KPI cards */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-[var(--qt-space-sm)] mb-[var(--qt-space-xxl)]"
          aria-label="Task summary"
        >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
            : kpiCards.map((card, i) => (
                <KpiCard
                  key={card.status}
                  label={card.label}
                  count={card.count}
                  status={card.status}
                  index={i}
                />
              ))}
        </div>

        {/* Recent tasks */}
        <section aria-labelledby="recent-tasks-heading">
          <h2
            id="recent-tasks-heading"
            className="text-[length:var(--qt-type-h3-size)] leading-[var(--qt-type-h3-line)] font-semibold text-[var(--qt-text-primary)] font-[family-name:var(--font-display)] mb-[var(--qt-space-md)]"
          >
            Recent tasks
          </h2>

          <div className="rounded-[var(--qt-radius-lg)] border border-[var(--qt-border)] bg-[var(--qt-surface-01)] overflow-hidden">
            {loading ? (
              <div aria-busy="true" aria-label="Loading recent tasks">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </div>
            ) : recentTasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex flex-col items-center justify-center py-[var(--qt-space-xxl)] gap-[var(--qt-space-md)]"
              >
                <p className="text-[length:var(--qt-type-body-size)] leading-[var(--qt-type-body-line)] text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)]">
                  No tasks yet
                </p>
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="h-[32px] px-[var(--qt-space-md)] rounded-[var(--qt-radius-md)] text-[length:var(--qt-type-body-size)] leading-none font-semibold text-[var(--qt-accent-on)] bg-[var(--qt-accent)] font-[family-name:var(--font-ui)] hover:opacity-90 transition-opacity duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--qt-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--qt-surface-01)]"
                >
                  Add task
                </button>
              </motion.div>
            ) : (
              <ul role="list" aria-label="Recent tasks list">
                <AnimatePresence initial={false}>
                  {recentTasks.map((task, i) => (
                    <motion.li
                      key={task.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{
                        duration: 0.18,
                        ease: [0.25, 0.1, 0.25, 1],
                        delay: i * 0.04,
                      }}
                      className="flex items-center gap-[var(--qt-space-md)] px-[var(--qt-space-md)] h-[44px] border-b border-[var(--qt-border)] last:border-b-0 group"
                    >
                      {/* Title */}
                      <span className="flex-1 min-w-0 text-[length:var(--qt-type-body-size)] leading-[var(--qt-type-body-line)] text-[var(--qt-text-primary)] font-[family-name:var(--font-ui)] truncate">
                        {task.title}
                      </span>

                      {/* Status badge */}
                      <StatusBadge status={task.status} />

                      {/* Date */}
                      <span className="hidden sm:block text-[length:var(--qt-type-sm-size)] leading-[var(--qt-type-sm-line)] text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)] tabular-nums flex-shrink-0">
                        {formatDate(task.createdAt)}
                      </span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>

          {!loading && recentTasks.length > 0 && (
            <div className="mt-[var(--qt-space-sm)] flex justify-end">
              <Link
                href="/dashboard/tasks"
                className="text-[length:var(--qt-type-sm-size)] leading-[var(--qt-type-sm-line)] font-medium text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)] hover:text-[var(--qt-text-primary)] transition-colors duration-150 ease-out outline-none focus-visible:underline"
              >
                View all tasks
              </Link>
            </div>
          )}
        </section>
      </section>

      {/* Create task modal */}
      <AnimatePresence>
        {showModal && (
          <CreateTaskModal
            onClose={() => setShowModal(false)}
            onSave={handleSaveTask}
          />
        )}
      </AnimatePresence>

      {/* Toast notifications */}
      <ToastList toasts={toasts} />
    </>
  );
}
