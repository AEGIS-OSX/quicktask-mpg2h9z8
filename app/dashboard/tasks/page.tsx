"use client";

import { useState, useEffect, useCallback, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";

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
        <div className="h-[20px] w-[72px] rounded-[var(--qt-radius-sm)] bg-[var(--qt-surface-02)] animate-pulse" />
      </td>
      <td className="px-[var(--qt-space-md)] py-[var(--qt-space-sm)] hidden sm:table-cell">
        <div className="h-[12px] w-[80px] rounded-[var(--qt-radius-sm)] bg-[var(--qt-surface-02)] animate-pulse" />
      </td>
      <td className="px-[var(--qt-space-md)] py-[var(--qt-space-sm)]">
        <div className="h-[12px] w-[48px] rounded-[var(--qt-radius-sm)] bg-[var(--qt-surface-02)] animate-pulse ml-auto" />
      </td>
    </tr>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────

interface DeleteConfirmProps {
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmModal({ onConfirm, onCancel }: DeleteConfirmProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") onCancel();
    },
    [onCancel]
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
        className="absolute inset-0 bg-[var(--qt-shadow-modal)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        onClick={onCancel}
        aria-hidden="true"
      />
      <motion.div
        className="relative z-10 w-full max-w-[400px] rounded-[var(--qt-radius-modal)] border border-[var(--qt-border)] bg-[var(--qt-surface-01)] shadow-[0_10px_30px_var(--qt-shadow-modal)] px-[var(--qt-space-lg)] py-[var(--qt-space-lg)]"
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
        <div className="flex items-center justify-end gap-[var(--qt-space-xs)]">
          <button
            type="button"
            onClick={onCancel}
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

// ── Create / Edit Task Modal ──────────────────────────────────────────────────

interface TaskModalProps {
  mode: "create" | "edit";
  initialTitle?: string;
  initialStatus?: TaskStatus;
  onClose: () => void;
  onSave: (title: string, status: TaskStatus) => void;
}

function TaskModal({ mode, initialTitle = "", initialStatus = "todo", onClose, onSave }: TaskModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
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

  const isEdit = mode === "edit";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-[var(--qt-space-md)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
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
            id="task-modal-title"
            className="text-[length:var(--qt-type-h2-size)] leading-[var(--qt-type-h2-line)] font-semibold text-[var(--qt-text-primary)] font-[family-name:var(--font-display)] mb-[var(--qt-space-lg)]"
          >
            {isEdit ? "Edit task" : "Create task"}
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

export default function TasksPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>(
    () => (searchParams.get("status") as FilterStatus) ?? "all"
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Simulate brief load on mount
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  // Sync filter status from URL param on mount
  useEffect(() => {
    const param = searchParams.get("status") as FilterStatus | null;
    if (param && ["all", "todo", "in-progress", "done"].includes(param)) {
      setFilterStatus(param);
    }
  }, [searchParams]);

  const addToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // ── Filtered tasks ──────────────────────────────────────────────────────────

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = filterStatus === "all" || task.status === filterStatus;
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleFilterChange = useCallback(
    (status: FilterStatus) => {
      setFilterStatus(status);
      const params = new URLSearchParams(searchParams.toString());
      if (status === "all") {
        params.delete("status");
      } else {
        params.set("status", status);
      }
      router.replace(`/dashboard/tasks${params.toString() ? `?${params.toString()}` : ""}`);
    },
    [searchParams, router]
  );

  const handleCreateTask = useCallback(
    (title: string, status: TaskStatus) => {
      const newTask: Task = {
        id: `t${Date.now()}`,
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

  const handleEditTask = useCallback(
    (title: string, status: TaskStatus) => {
      if (!editingTask) return;
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? { ...t, title, status } : t))
      );
      setEditingTask(null);
      addToast("Saved");
    },
    [editingTask, addToast]
  );

  const handleDeleteConfirm = useCallback(() => {
    if (!deletingTaskId) return;
    setTasks((prev) => prev.filter((t) => t.id !== deletingTaskId));
    setDeletingTaskId(null);
    addToast("Task deleted");
  }, [deletingTaskId, addToast]);

  return (
    <>
      {/* Live region for screen reader announcements */}
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

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-[var(--qt-space-sm)] mb-[var(--qt-space-lg)]">
          {/* Status dropdown */}
          <div className="flex items-center gap-[var(--qt-space-xs)]">
            <label
              htmlFor="status-filter"
              className="text-[length:var(--qt-type-sm-size)] leading-[var(--qt-type-sm-line)] font-medium text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)] flex-shrink-0"
            >
              Status
            </label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => handleFilterChange(e.target.value as FilterStatus)}
              className="h-[32px] rounded-[var(--qt-radius-md)] border border-[var(--qt-border)] bg-[var(--qt-surface-01)] px-[var(--qt-space-sm)] text-[length:var(--qt-type-body-size)] leading-[var(--qt-type-body-line)] text-[var(--qt-text-primary)] font-[family-name:var(--font-ui)] outline-none focus:border-[var(--qt-accent)] focus:ring-1 focus:ring-[var(--qt-accent)] transition-colors duration-150 ease-out cursor-pointer"
            >
              <option value="all">All</option>
              <option value="todo">Todo</option>
              <option value="in-progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          {/* Search */}
          <div className="flex-1 min-w-[160px] max-w-[280px] ml-auto">
            <label htmlFor="tasks-search" className="sr-only">
              Search tasks
            </label>
            <input
              id="tasks-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks"
              className="w-full h-[32px] rounded-[var(--qt-radius-md)] border border-[var(--qt-border)] bg-[var(--qt-surface-01)] px-[var(--qt-space-sm)] text-[length:var(--qt-type-body-size)] leading-[var(--qt-type-body-line)] text-[var(--qt-text-primary)] font-[family-name:var(--font-ui)] placeholder:text-[var(--qt-text-muted)] outline-none focus:border-[var(--qt-accent)] focus:ring-1 focus:ring-[var(--qt-accent)] transition-colors duration-150 ease-out"
            />
          </div>
        </div>

        {/* Table */}
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
                  className="px-[var(--qt-space-md)] py-[var(--qt-space-sm)] text-left text-[length:var(--qt-type-sm-size)] leading-[var(--qt-type-sm-line)] font-semibold text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)] hidden sm:table-cell"
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
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="flex flex-col items-center justify-center py-[var(--qt-space-xxl)] gap-[var(--qt-space-md)]"
                    >
                      <p className="text-[length:var(--qt-type-body-size)] leading-[var(--qt-type-body-line)] text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)]">
                        {tasks.length === 0 ? "No tasks yet" : "No tasks match this filter"}
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="h-[32px] px-[var(--qt-space-md)] rounded-[var(--qt-radius-md)] text-[length:var(--qt-type-body-size)] leading-none font-semibold text-[var(--qt-accent-on)] bg-[var(--qt-accent)] font-[family-name:var(--font-ui)] hover:opacity-90 transition-opacity duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--qt-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--qt-surface-01)]"
                      >
                        Add task
                      </button>
                    </motion.div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence initial={false}>
                  {filteredTasks.map((task, i) => (
                    <motion.tr
                      key={task.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{
                        duration: 0.18,
                        ease: [0.25, 0.1, 0.25, 1],
                        delay: i * 0.03,
                      }}
                      className="border-b border-[var(--qt-border)] last:border-b-0 group"
                    >
                      {/* Title */}
                      <td className="px-[var(--qt-space-md)] py-[var(--qt-space-sm)]">
                        <span className="text-[length:var(--qt-type-body-size)] leading-[var(--qt-type-body-line)] text-[var(--qt-text-primary)] font-[family-name:var(--font-ui)] line-clamp-1">
                          {task.title}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-[var(--qt-space-md)] py-[var(--qt-space-sm)]">
                        <StatusBadge status={task.status} />
                      </td>

                      {/* Created */}
                      <td className="px-[var(--qt-space-md)] py-[var(--qt-space-sm)] hidden sm:table-cell">
                        <span className="text-[length:var(--qt-type-sm-size)] leading-[var(--qt-type-sm-line)] text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)] tabular-nums">
                          {formatDate(task.createdAt)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-[var(--qt-space-md)] py-[var(--qt-space-sm)]">
                        <div
                          className="flex items-center justify-end gap-[var(--qt-space-xs)] opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 ease-out"
                        >
                          <button
                            type="button"
                            onClick={() => setEditingTask(task)}
                            aria-label={`Edit ${task.title}`}
                            className="h-[28px] px-[var(--qt-space-sm)] rounded-[var(--qt-radius-md)] text-[length:var(--qt-type-sm-size)] leading-none font-medium text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)] border border-[var(--qt-border)] hover:bg-[var(--qt-border)] hover:text-[var(--qt-text-primary)] transition-colors duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--qt-accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--qt-surface-01)]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingTaskId(task.id)}
                            aria-label={`Delete ${task.title}`}
                            className="h-[28px] px-[var(--qt-space-sm)] rounded-[var(--qt-radius-md)] text-[length:var(--qt-type-sm-size)] leading-none font-medium text-[var(--qt-danger)] font-[family-name:var(--font-ui)] border border-transparent hover:border-[var(--qt-danger)] hover:bg-[color-mix(in_srgb,var(--qt-danger)_12%,transparent)] transition-colors duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--qt-danger)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--qt-surface-01)]"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Create task modal */}
      <AnimatePresence>
        {showCreateModal && (
          <TaskModal
            mode="create"
            onClose={() => setShowCreateModal(false)}
            onSave={handleCreateTask}
          />
        )}
      </AnimatePresence>

      {/* Edit task modal */}
      <AnimatePresence>
        {editingTask && (
          <TaskModal
            mode="edit"
            initialTitle={editingTask.title}
            initialStatus={editingTask.status}
            onClose={() => setEditingTask(null)}
            onSave={handleEditTask}
          />
        )}
      </AnimatePresence>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {deletingTaskId && (
          <DeleteConfirmModal
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeletingTaskId(null)}
          />
        )}
      </AnimatePresence>

      {/* Toast notifications */}
      <ToastList toasts={toasts} />
    </>
  );
}
