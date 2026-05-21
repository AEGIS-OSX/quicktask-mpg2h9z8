"use client";

import { useState, useEffect, useCallback, useId } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ────────────────────────────────────────────────────────────────────

type TaskStatus = "todo" | "in-progress" | "done";
type FilterStatus = "all" | TaskStatus;

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
  { id: "t2", title: "Write project brief", status: "in-progress", createdAt: "2026-05-20" },
  { id: "t3", title: "Review pull request #42", status: "todo", createdAt: "2026-05-19" },
  { id: "t4", title: "Update onboarding copy", status: "todo", createdAt: "2026-05-19" },
  { id: "t5", title: "Deploy staging environment", status: "in-progress", createdAt: "2026-05-18" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function statusLabel(status: TaskStatus): string {
  if (status === "todo") return "Todo";
  if (status === "in-progress") return "In progress";
  return "Done";
}

function statusColor(status: TaskStatus): string {
  if (status === "todo") return "var(--qt-status-todo)";
  if (status === "in-progress") return "var(--qt-status-inprogress)";
  return "var(--qt-status-done)";
}

function generateId(): string {
  return `t${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── StatusBadge ───────────────────────────────────────────────────────────────

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

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr aria-hidden="true">
      <td className="px-[var(--qt-space-md)] py-[var(--qt-space-sm)]">
        <div className="h-[12px] w-[55%] rounded-[var(--qt-radius-sm)] bg-[var(--qt-surface-02)] animate-pulse" />
      </td>
      <td className="px-[var(--qt-space-md)] py-[var(--qt-space-sm)]">
        <div className="h-[20px] w-[80px] rounded-[var(--qt-radius-sm)] bg-[var(--qt-surface-02)] animate-pulse" />
      </td>
      <td className="px-[var(--qt-space-md)] py-[var(--qt-space-sm)]">
        <div className="h-[12px] w-[90px] rounded-[var(--qt-radius-sm)] bg-[var(--qt-surface-02)] animate-pulse" />
      </td>
      <td className="px-[var(--qt-space-md)] py-[var(--qt-space-sm)]">
        <div className="h-[12px] w-[60px] rounded-[var(--qt-radius-sm)] bg-[var(--qt-surface-02)] animate-pulse ml-auto" />
      </td>
    </tr>
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
      aria-labelledby="create-modal-title"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0"
        style={{ backgroundColor: "var(--qt-shadow-modal)" }}
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
            id="create-modal-title"
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
                <option value="in-progress">In progress</option>
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

// ── Delete Confirmation Modal ─────────────────────────────────────────────────

interface DeleteModalProps {
  taskTitle: string;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteModal({ taskTitle, onClose, onConfirm }: DeleteModalProps) {
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
      aria-labelledby="delete-modal-title"
      onKeyDown={handleKeyDown}
    >
      <motion.div
        className="absolute inset-0"
        style={{ backgroundColor: "var(--qt-shadow-modal)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        className="relative z-10 w-full max-w-[400px] rounded-[var(--qt-radius-modal)] border border-[var(--qt-border)] bg-[var(--qt-surface-01)] shadow-[0_10px_30px_var(--qt-shadow-modal)] px-[var(--qt-space-lg)] pt-[var(--qt-space-lg)] pb-[var(--qt-space-md)]"
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <h2
          id="delete-modal-title"
          className="text-[length:var(--qt-type-h2-size)] leading-[var(--qt-type-h2-line)] font-semibold text-[var(--qt-text-primary)] font-[family-name:var(--font-display)] mb-[var(--qt-space-sm)]"
        >
          Delete task
        </h2>
        <p className="text-[length:var(--qt-type-body-size)] leading-[var(--qt-type-body-line)] text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)] mb-[var(--qt-space-lg)]">
          This will permanently remove the task. Are you sure?
        </p>
        <p className="text-[length:var(--qt-type-sm-size)] leading-[var(--qt-type-sm-line)] text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)] mb-[var(--qt-space-lg)] truncate">
          &ldquo;{taskTitle}&rdquo;
        </p>
        <div className="flex items-center justify-end gap-[var(--qt-space-xs)]">
          <button
            type="button"
            onClick={onClose}
            className="h-[32px] px-[var(--qt-space-md)] rounded-[var(--qt-radius-md)] text-[length:var(--qt-type-body-size)] leading-none font-medium text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)] hover:bg-[var(--qt-border)] hover:text-[var(--qt-text-primary)] transition-colors duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--qt-accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--qt-surface-01)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-[32px] px-[var(--qt-space-md)] rounded-[var(--qt-radius-md)] text-[length:var(--qt-type-body-size)] leading-none font-semibold text-[var(--qt-accent-on)] bg-[var(--qt-danger)] font-[family-name:var(--font-ui)] hover:opacity-90 transition-opacity duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--qt-danger)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--qt-surface-01)]"
          >
            Delete task
          </button>
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

// ── Inline Edit Row ───────────────────────────────────────────────────────────

interface EditRowProps {
  task: Task;
  onSave: (id: string, title: string, status: TaskStatus) => void;
  onCancel: () => void;
}

function EditRow({ task, onSave, onCancel }: EditRowProps) {
  const [title, setTitle] = useState(task.title);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [error, setError] = useState("");
  const inputId = useId();

  const handleSave = useCallback(() => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Title is required.");
      return;
    }
    onSave(task.id, trimmed, status);
  }, [title, status, task.id, onSave]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSave();
      if (e.key === "Escape") onCancel();
    },
    [handleSave, onCancel]
  );

  return (
    <tr className="border-b border-[var(--qt-border)] last:border-b-0 bg-[var(--qt-surface-02)]">
      <td className="px-[var(--qt-space-md)] py-[var(--qt-space-sm)]" colSpan={2}>
        <div className="flex items-center gap-[var(--qt-space-sm)]">
          <input
            id={inputId}
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={handleKeyDown}
            placeholder="Task title"
            autoFocus
            className="flex-1 h-[30px] rounded-[var(--qt-radius-md)] border border-[var(--qt-border)] bg-[var(--qt-surface-01)] px-[var(--qt-space-sm)] text-[length:var(--qt-type-body-size)] leading-[var(--qt-type-body-line)] text-[var(--qt-text-primary)] font-[family-name:var(--font-ui)] placeholder:text-[var(--qt-text-muted)] outline-none focus:border-[var(--qt-accent)] focus:ring-1 focus:ring-[var(--qt-accent)] transition-colors duration-150 ease-out"
            aria-label="Task title"
            aria-invalid={error ? "true" : undefined}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="h-[30px] rounded-[var(--qt-radius-md)] border border-[var(--qt-border)] bg-[var(--qt-surface-01)] px-[var(--qt-space-xs)] text-[length:var(--qt-type-sm-size)] leading-[var(--qt-type-sm-line)] text-[var(--qt-text-primary)] font-[family-name:var(--font-ui)] outline-none focus:border-[var(--qt-accent)] focus:ring-1 focus:ring-[var(--qt-accent)] transition-colors duration-150 ease-out cursor-pointer"
            aria-label="Task status"
          >
            <option value="todo">Todo</option>
            <option value="in-progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        {error && (
          <p
            role="alert"
            className="mt-[var(--qt-space-xxs)] text-[length:var(--qt-type-sm-size)] leading-[var(--qt-type-sm-line)] text-[var(--qt-danger)] font-[family-name:var(--font-ui)]"
          >
            {error}
          </p>
        )}
      </td>
      <td className="px-[var(--qt-space-md)] py-[var(--qt-space-sm)] text-[length:var(--qt-type-sm-size)] leading-[var(--qt-type-sm-line)] text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)] tabular-nums whitespace-nowrap">
        {formatDate(task.createdAt)}
      </td>
      <td className="px-[var(--qt-space-md)] py-[var(--qt-space-sm)]">
        <div className="flex items-center justify-end gap-[var(--qt-space-xs)]">
          <button
            type="button"
            onClick={handleSave}
            className="h-[26px] px-[var(--qt-space-sm)] rounded-[var(--qt-radius-md)] text-[length:var(--qt-type-sm-size)] leading-none font-semibold text-[var(--qt-accent-on)] bg-[var(--qt-accent)] font-[family-name:var(--font-ui)] hover:opacity-90 transition-opacity duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--qt-accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--qt-surface-02)]"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="h-[26px] px-[var(--qt-space-sm)] rounded-[var(--qt-radius-md)] text-[length:var(--qt-type-sm-size)] leading-none font-medium text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)] hover:bg-[var(--qt-border)] hover:text-[var(--qt-text-primary)] transition-colors duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--qt-accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--qt-surface-02)]"
          >
            Cancel
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TasksPage() {
  const searchParams = useSearchParams();

  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Initialise filter from URL param (?status=todo|in-progress|done)
  useEffect(() => {
    const param = searchParams.get("status");
    if (param === "todo" || param === "in-progress" || param === "done") {
      setFilterStatus(param);
    }
  }, [searchParams]);

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

  // Derived: filtered + searched tasks
  const visibleTasks = tasks.filter((task) => {
    const matchesStatus = filterStatus === "all" || task.status === filterStatus;
    const matchesSearch =
      searchQuery.trim() === "" ||
      task.title.toLowerCase().includes(searchQuery.trim().toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const hasActiveFilters = filterStatus !== "all" || searchQuery.trim() !== "";

  // Handlers
  const handleCreateTask = useCallback(
    (title: string, status: TaskStatus) => {
      const newTask: Task = {
        id: generateId(),
        title,
        status,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setTasks((prev) => [newTask, ...prev]);
      setShowCreateModal(false);
      addToast("Task created");
    },
    [addToast]
  );

  const handleEditSave = useCallback(
    (id: string, title: string, status: TaskStatus) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, title, status } : t))
      );
      setEditingId(null);
      addToast("Saved");
    },
    [addToast]
  );

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    setTasks((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    setDeleteTarget(null);
    addToast("Task deleted");
  }, [deleteTarget, addToast]);

  const handleClearFilters = useCallback(() => {
    setFilterStatus("all");
    setSearchQuery("");
  }, []);

  return (
    <>
      {/* Live region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" id="tasks-live" />

      <section aria-labelledby="tasks-heading">
        {/* Page header */}
        <div className="flex items-center justify-between mb-[var(--qt-space-xl)]">
          <h1
            id="tasks-heading"
            className="text-[length:var(--qt-type-h1-size)] leading-[var(--qt-type-h1-line)] font-bold text-[var(--qt-text-primary)] font-[family-name:var(--font-display)]"
          >
            Tasks
          </h1>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            aria-label="Add task"
            className="h-[32px] px-[var(--qt-space-md)] rounded-[var(--qt-radius-md)] text-[length:var(--qt-type-body-size)] leading-none font-semibold text-[var(--qt-accent-on)] bg-[var(--qt-accent)] font-[family-name:var(--font-ui)] hover:opacity-90 transition-opacity duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--qt-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--qt-bg-00)]"
          >
            Add task
          </button>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-[var(--qt-space-sm)] mb-[var(--qt-space-md)]">
          {/* Status filter */}
          <div className="flex items-center gap-[var(--qt-space-xs)]">
            <label
              htmlFor="status-filter"
              className="text-[length:var(--qt-type-sm-size)] leading-[var(--qt-type-sm-line)] font-medium text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)] whitespace-nowrap"
            >
              Status
            </label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="h-[32px] rounded-[var(--qt-radius-md)] border border-[var(--qt-border)] bg-[var(--qt-surface-01)] px-[var(--qt-space-sm)] text-[length:var(--qt-type-body-size)] leading-[var(--qt-type-body-line)] text-[var(--qt-text-primary)] font-[family-name:var(--font-ui)] outline-none focus:border-[var(--qt-accent)] focus:ring-1 focus:ring-[var(--qt-accent)] transition-colors duration-150 ease-out cursor-pointer"
            >
              <option value="all">All</option>
              <option value="todo">Todo</option>
              <option value="in-progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          {/* Search */}
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks"
            aria-label="Search tasks"
            className="h-[32px] min-w-[180px] rounded-[var(--qt-radius-md)] border border-[var(--qt-border)] bg-[var(--qt-surface-01)] px-[var(--qt-space-sm)] text-[length:var(--qt-type-body-size)] leading-[var(--qt-type-body-line)] text-[var(--qt-text-primary)] font-[family-name:var(--font-ui)] placeholder:text-[var(--qt-text-muted)] outline-none focus:border-[var(--qt-accent)] focus:ring-1 focus:ring-[var(--qt-accent)] transition-colors duration-150 ease-out"
          />

          {/* Clear filters */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                type="button"
                onClick={handleClearFilters}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
                className="h-[32px] px-[var(--qt-space-sm)] rounded-[var(--qt-radius-md)] text-[length:var(--qt-type-sm-size)] leading-none font-medium text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)] border border-[var(--qt-border)] hover:bg-[var(--qt-border)] hover:text-[var(--qt-text-primary)] transition-colors duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--qt-accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--qt-bg-00)]"
              >
                Clear filters
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Task table */}
        <div className="rounded-[var(--qt-radius-lg)] border border-[var(--qt-border)] bg-[var(--qt-surface-01)] overflow-hidden">
          <table className="w-full border-collapse" aria-label="Tasks">
            <thead>
              <tr className="border-b border-[var(--qt-border)]">
                <th
                  scope="col"
                  className="px-[var(--qt-space-md)] py-[var(--qt-space-sm)] text-left text-[length:var(--qt-type-sm-size)] leading-[var(--qt-type-sm-line)] font-semibold text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)]"
                >
                  Title
                </th>
                <th
                  scope="col"
                  className="px-[var(--qt-space-md)] py-[var(--qt-space-sm)] text-left text-[length:var(--qt-type-sm-size)] leading-[var(--qt-type-sm-line)] font-semibold text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)]"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-[var(--qt-space-md)] py-[var(--qt-space-sm)] text-left text-[length:var(--qt-type-sm-size)] leading-[var(--qt-type-sm-line)] font-semibold text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)]"
                >
                  Created
                </th>
                <th
                  scope="col"
                  className="px-[var(--qt-space-md)] py-[var(--qt-space-sm)] text-right text-[length:var(--qt-type-sm-size)] leading-[var(--qt-type-sm-line)] font-semibold text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)]"
                >
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}
                </>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="flex flex-col items-center justify-center py-[var(--qt-space-xxl)] gap-[var(--qt-space-md)]">
                      <p className="text-[length:var(--qt-type-body-size)] leading-[var(--qt-type-body-line)] text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)]">
                        No tasks yet
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="h-[32px] px-[var(--qt-space-md)] rounded-[var(--qt-radius-md)] text-[length:var(--qt-type-body-size)] leading-none font-semibold text-[var(--qt-accent-on)] bg-[var(--qt-accent)] font-[family-name:var(--font-ui)] hover:opacity-90 transition-opacity duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--qt-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--qt-surface-01)]"
                      >
                        Add task
                      </button>
                    </div>
                  </td>
                </tr>
              ) : visibleTasks.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="flex flex-col items-center justify-center py-[var(--qt-space-xxl)] gap-[var(--qt-space-md)]">
                      <p className="text-[length:var(--qt-type-body-size)] leading-[var(--qt-type-body-line)] text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)]">
                        No tasks match this filter
                      </p>
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="h-[32px] px-[var(--qt-space-md)] rounded-[var(--qt-radius-md)] text-[length:var(--qt-type-body-size)] leading-none font-semibold text-[var(--qt-accent-on)] bg-[var(--qt-accent)] font-[family-name:var(--font-ui)] hover:opacity-90 transition-opacity duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--qt-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--qt-surface-01)]"
                      >
                        Add task
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence initial={false}>
                  {visibleTasks.map((task) =>
                    editingId === task.id ? (
                      <EditRow
                        key={task.id}
                        task={task}
                        onSave={handleEditSave}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <motion.tr
                        key={task.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                        className="border-b border-[var(--qt-border)] last:border-b-0 group hover:bg-[var(--qt-surface-02)] transition-colors duration-100 ease-out"
                      >
                        <td className="px-[var(--qt-space-md)] py-[var(--qt-space-sm)] text-[length:var(--qt-type-body-size)] leading-[var(--qt-type-body-line)] text-[var(--qt-text-primary)] font-[family-name:var(--font-ui)] max-w-[320px] truncate">
                          {task.title}
                        </td>
                        <td className="px-[var(--qt-space-md)] py-[var(--qt-space-sm)]">
                          <StatusBadge status={task.status} />
                        </td>
                        <td className="px-[var(--qt-space-md)] py-[var(--qt-space-sm)] text-[length:var(--qt-type-sm-size)] leading-[var(--qt-type-sm-line)] text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)] tabular-nums whitespace-nowrap">
                          {formatDate(task.createdAt)}
                        </td>
                        <td className="px-[var(--qt-space-md)] py-[var(--qt-space-sm)]">
                          <div className="flex items-center justify-end gap-[var(--qt-space-xs)] opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 ease-out">
                            <button
                              type="button"
                              onClick={() => setEditingId(task.id)}
                              aria-label={`Edit task: ${task.title}`}
                              className="h-[26px] px-[var(--qt-space-sm)] rounded-[var(--qt-radius-md)] text-[length:var(--qt-type-sm-size)] leading-none font-medium text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)] hover:bg-[var(--qt-border)] hover:text-[var(--qt-text-primary)] transition-colors duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--qt-accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--qt-surface-01)] focus-visible:opacity-100"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(task)}
                              aria-label={`Delete task: ${task.title}`}
                              className="h-[26px] px-[var(--qt-space-sm)] rounded-[var(--qt-radius-md)] text-[length:var(--qt-type-sm-size)] leading-none font-medium text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)] hover:bg-[var(--qt-border)] hover:text-[var(--qt-danger)] transition-colors duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--qt-danger)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--qt-surface-01)] focus-visible:opacity-100"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  )}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Create task modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateTaskModal
            onClose={() => setShowCreateModal(false)}
            onSave={handleCreateTask}
          />
        )}
      </AnimatePresence>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            taskTitle={deleteTarget.title}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDeleteConfirm}
          />
        )}
      </AnimatePresence>

      {/* Toast notifications */}
      <ToastList toasts={toasts} />
    </>
  );
}
