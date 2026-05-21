"use client";

import { useState, useEffect, useCallback, useId, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { CheckSquare } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type TaskStatus = "todo" | "inprogress" | "done";
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
  { id: "t2", title: "Write project brief", status: "inprogress", createdAt: "2026-05-20" },
  { id: "t3", title: "Review pull request #42", status: "todo", createdAt: "2026-05-19" },
  { id: "t4", title: "Update onboarding copy", status: "todo", createdAt: "2026-05-19" },
  { id: "t5", title: "Deploy staging environment", status: "inprogress", createdAt: "2026-05-18" },
  { id: "t6", title: "Audit accessibility issues", status: "todo", createdAt: "2026-05-17" },
  { id: "t7", title: "Set up CI pipeline", status: "done", createdAt: "2026-05-16" },
  { id: "t8", title: "Design token handoff", status: "done", createdAt: "2026-05-15" },
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

function isValidStatus(s: string): s is FilterStatus {
  return ["all", "todo", "inprogress", "done"].includes(s);
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

// ── SkeletonTableRow ──────────────────────────────────────────────────────────

function SkeletonTableRow() {
  return (
    <tr className="border-b border-[var(--qt-border)] last:border-b-0">
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

// ── FilterChip ────────────────────────────────────────────────────────────────

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <span className="inline-flex items-center gap-[var(--qt-space-xxs)] h-[24px] pl-[var(--qt-space-xs)] pr-[var(--qt-space-xxs)] rounded-[var(--qt-radius-sm)] border border-[var(--qt-border)] bg-[var(--qt-surface-02)] text-[length:var(--qt-type-sm-size)] leading-none font-medium text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)]">
      {label}
      <button
        type="button"
        onClick={onRemove}
        title="Remove filter"
        aria-label={`Remove filter: ${label}`}
        className="flex items-center justify-center w-[16px] h-[16px] rounded-[var(--qt-radius-sm)] text-[var(--qt-text-muted)] hover:text-[var(--qt-text-primary)] hover:bg-[var(--qt-border)] transition-colors duration-150 ease-out outline-none focus-visible:ring-1 focus-visible:ring-[var(--qt-accent)]"
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
          <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  );
}

// ── CreateTaskModal ───────────────────────────────────────────────────────────

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

// ── DeleteConfirmModal ────────────────────────────────────────────────────────

interface DeleteConfirmModalProps {
  taskTitle: string;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteConfirmModal({ taskTitle, onClose, onConfirm }: DeleteConfirmModalProps) {
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
      aria-describedby="delete-modal-body"
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
        className="relative z-10 w-full max-w-[400px] rounded-[var(--qt-radius-modal)] border border-[var(--qt-border)] bg-[var(--qt-surface-01)] shadow-[0_10px_30px_var(--qt-shadow-modal)]"
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="px-[var(--qt-space-lg)] pt-[var(--qt-space-lg)] pb-[var(--qt-space-md)]">
          <h2
            id="delete-modal-title"
            className="text-[length:var(--qt-type-h2-size)] leading-[var(--qt-type-h2-line)] font-semibold text-[var(--qt-text-primary)] font-[family-name:var(--font-display)] mb-[var(--qt-space-xs)]"
          >
            Delete task
          </h2>
          <p
            id="delete-modal-body"
            className="text-[length:var(--qt-type-body-size)] leading-[var(--qt-type-body-line)] text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)] mb-[var(--qt-space-lg)]"
          >
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
              autoFocus
              className="h-[32px] px-[var(--qt-space-md)] rounded-[var(--qt-radius-md)] text-[length:var(--qt-type-body-size)] leading-none font-semibold text-[var(--qt-accent-on)] bg-[var(--qt-danger)] font-[family-name:var(--font-ui)] hover:opacity-90 transition-opacity duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--qt-danger)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--qt-surface-01)]"
            >
              Delete task
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── ToastList ─────────────────────────────────────────────────────────────────

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

// ── InlineEditRow ─────────────────────────────────────────────────────────────

interface InlineEditRowProps {
  task: Task;
  onSave: (id: string, title: string, status: TaskStatus) => void;
  onCancel: () => void;
}

function InlineEditRow({ task, onSave, onCancel }: InlineEditRowProps) {
  const [editTitle, setEditTitle] = useState(task.title);
  const [editStatus, setEditStatus] = useState<TaskStatus>(task.status);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter" && e.currentTarget.tagName !== "SELECT") {
        const trimmed = editTitle.trim();
        if (trimmed) onSave(task.id, trimmed, editStatus);
      }
    },
    [editTitle, editStatus, task.id, onSave, onCancel]
  );

  const handleSave = useCallback(() => {
    const trimmed = editTitle.trim();
    if (trimmed) onSave(task.id, trimmed, editStatus);
  }, [editTitle, editStatus, task.id, onSave]);

  return (
    <tr className="border-b border-[var(--qt-border)] last:border-b-0 bg-[var(--qt-surface-02)]">
      <td className="px-[var(--qt-space-md)] py-[var(--qt-space-xs)]">
        <input
          ref={inputRef}
          id={titleId}
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Task title"
          aria-label="Task title"
          className="w-full h-[32px] rounded-[var(--qt-radius-md)] border border-[var(--qt-accent)] bg-[var(--qt-surface-01)] px-[var(--qt-space-sm)] text-[length:var(--qt-type-body-size)] leading-[var(--qt-type-body-line)] text-[var(--qt-text-primary)] font-[family-name:var(--font-ui)] placeholder:text-[var(--qt-text-muted)] outline-none focus:ring-1 focus:ring-[var(--qt-accent)] transition-colors duration-150 ease-out"
        />
      </td>
      <td className="px-[var(--qt-space-md)] py-[var(--qt-space-xs)]">
        <select
          value={editStatus}
          onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
          onKeyDown={handleKeyDown}
          aria-label="Status"
          className="h-[32px] rounded-[var(--qt-radius-md)] border border-[var(--qt-border)] bg-[var(--qt-surface-01)] px-[var(--qt-space-xs)] text-[length:var(--qt-type-sm-size)] leading-none text-[var(--qt-text-primary)] font-[family-name:var(--font-ui)] outline-none focus:border-[var(--qt-accent)] focus:ring-1 focus:ring-[var(--qt-accent)] transition-colors duration-150 ease-out cursor-pointer"
        >
          <option value="todo">Todo</option>
          <option value="inprogress">In progress</option>
          <option value="done">Done</option>
        </select>
      </td>
      <td className="px-[var(--qt-space-md)] py-[var(--qt-space-xs)] hidden sm:table-cell">
        <span className="text-[length:var(--qt-type-sm-size)] leading-[var(--qt-type-sm-line)] text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)] tabular-nums">
          {formatDate(task.createdAt)}
        </span>
      </td>
      <td className="px-[var(--qt-space-md)] py-[var(--qt-space-xs)]">
        <div className="flex items-center justify-end gap-[var(--qt-space-xs)]">
          <button
            type="button"
            onClick={handleSave}
            className="h-[28px] px-[var(--qt-space-sm)] rounded-[var(--qt-radius-md)] text-[length:var(--qt-type-sm-size)] leading-none font-semibold text-[var(--qt-accent-on)] bg-[var(--qt-accent)] font-[family-name:var(--font-ui)] hover:opacity-90 transition-opacity duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--qt-accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--qt-surface-02)]"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="h-[28px] px-[var(--qt-space-sm)] rounded-[var(--qt-radius-md)] text-[length:var(--qt-type-sm-size)] leading-none font-medium text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)] hover:bg-[var(--qt-border)] hover:text-[var(--qt-text-primary)] transition-colors duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--qt-accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--qt-surface-02)]"
          >
            Cancel
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── TaskRow ───────────────────────────────────────────────────────────────────

interface TaskRowProps {
  task: Task;
  index: number;
  onEdit: (id: string) => void;
  onDelete: (task: Task) => void;
}

function TaskRow({ task, index, onEdit, onDelete }: TaskRowProps) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -4 }}
      transition={{ duration: 0.16, ease: [0.25, 0.1, 0.25, 1], delay: index * 0.03 }}
      className="group border-b border-[var(--qt-border)] last:border-b-0 hover:bg-[var(--qt-surface-02)] transition-colors duration-100 ease-out"
    >
      <td className="px-[var(--qt-space-md)] py-[var(--qt-space-sm)]">
        <span className="text-[length:var(--qt-type-body-size)] leading-[var(--qt-type-body-line)] text-[var(--qt-text-primary)] font-[family-name:var(--font-ui)] line-clamp-1">
          {task.title}
        </span>
      </td>
      <td className="px-[var(--qt-space-md)] py-[var(--qt-space-sm)]">
        <StatusBadge status={task.status} />
      </td>
      <td className="px-[var(--qt-space-md)] py-[var(--qt-space-sm)] hidden sm:table-cell">
        <span className="text-[length:var(--qt-type-sm-size)] leading-[var(--qt-type-sm-line)] text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)] tabular-nums">
          {formatDate(task.createdAt)}
        </span>
      </td>
      <td className="px-[var(--qt-space-md)] py-[var(--qt-space-sm)]">
        <div className="flex items-center justify-end gap-[var(--qt-space-xs)] opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 ease-out">
          <button
            type="button"
            onClick={() => onEdit(task.id)}
            aria-label={`Edit task: ${task.title}`}
            className="h-[28px] px-[var(--qt-space-sm)] rounded-[var(--qt-radius-md)] text-[length:var(--qt-type-sm-size)] leading-none font-medium text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)] hover:bg-[var(--qt-border)] hover:text-[var(--qt-text-primary)] transition-colors duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--qt-accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--qt-surface-01)] focus-visible:opacity-100"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            aria-label={`Delete task: ${task.title}`}
            className="h-[28px] px-[var(--qt-space-sm)] rounded-[var(--qt-radius-md)] text-[length:var(--qt-type-sm-size)] leading-none font-medium text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)] hover:bg-[color-mix(in_srgb,var(--qt-danger)_15%,transparent)] hover:text-[var(--qt-danger)] transition-colors duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--qt-danger)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--qt-surface-01)] focus-visible:opacity-100"
          >
            Delete
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TasksPage() {
  const searchParams = useSearchParams();

  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Filter state — initialise from URL param
  const rawStatus = searchParams.get("status") ?? "all";
  const initialStatus: FilterStatus = isValidStatus(rawStatus) ? rawStatus : "all";
  const [statusFilter, setStatusFilter] = useState<FilterStatus>(initialStatus);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Create
  const handleSaveTask = useCallback(
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

  // Inline edit save
  const handleInlineSave = useCallback(
    (id: string, title: string, status: TaskStatus) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, title, status } : t))
      );
      setEditingId(null);
      addToast("Saved");
    },
    [addToast]
  );

  // Delete
  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    setTasks((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    setDeleteTarget(null);
    addToast("Task deleted");
  }, [deleteTarget, addToast]);

  // Filters
  const clearFilters = useCallback(() => {
    setStatusFilter("all");
    setSearchQuery("");
  }, []);

  const hasActiveFilters = statusFilter !== "all" || searchQuery.trim() !== "";

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesSearch =
      searchQuery.trim() === "" ||
      task.title.toLowerCase().includes(searchQuery.trim().toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const searchId = useId();
  const statusId = useId();

  return (
    <>
      {/* Live region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" id="tasks-live" />

      <section aria-labelledby="tasks-heading">
        {/* Page header */}
        <div className="flex items-center justify-between mb-[var(--qt-space-xl)]">
          <div className="flex items-center gap-[var(--qt-space-sm)]">
            <CheckSquare
              className="w-[20px] h-[20px] text-[var(--qt-text-muted)] flex-shrink-0"
              aria-hidden="true"
            />
            <h1
              id="tasks-heading"
              className="text-[length:var(--qt-type-h1-size)] leading-[var(--qt-type-h1-line)] font-bold text-[var(--qt-text-primary)] font-[family-name:var(--font-display)]"
            >
              Tasks
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            title="Create a new task"
            aria-label="Add task"
            className="h-[32px] px-[var(--qt-space-md)] rounded-[var(--qt-radius-md)] text-[length:var(--qt-type-body-size)] leading-none font-semibold text-[var(--qt-accent-on)] bg-[var(--qt-accent)] font-[family-name:var(--font-ui)] hover:opacity-90 transition-opacity duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--qt-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--qt-bg-00)]"
          >
            Add task
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-[var(--qt-space-xs)] mb-[var(--qt-space-md)]">
          {/* Search */}
          <div className="relative flex-1 min-w-[160px] max-w-[280px]">
            <label htmlFor={searchId} className="sr-only">
              Search tasks
            </label>
            <svg
              className="absolute left-[var(--qt-space-sm)] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[var(--qt-text-muted)] pointer-events-none"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              id={searchId}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks"
              className="w-full h-[32px] rounded-[var(--qt-radius-md)] border border-[var(--qt-border)] bg-[var(--qt-surface-01)] pl-[28px] pr-[var(--qt-space-sm)] text-[length:var(--qt-type-body-size)] leading-[var(--qt-type-body-line)] text-[var(--qt-text-primary)] font-[family-name:var(--font-ui)] placeholder:text-[var(--qt-text-muted)] outline-none focus:border-[var(--qt-accent)] focus:ring-1 focus:ring-[var(--qt-accent)] transition-colors duration-150 ease-out"
            />
          </div>

          {/* Status dropdown */}
          <div className="flex items-center gap-[var(--qt-space-xxs)]">
            <label
              htmlFor={statusId}
              className="text-[length:var(--qt-type-sm-size)] leading-none font-medium text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)] whitespace-nowrap"
            >
              Status
            </label>
            <select
              id={statusId}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
              className="h-[32px] rounded-[var(--qt-radius-md)] border border-[var(--qt-border)] bg-[var(--qt-surface-01)] px-[var(--qt-space-sm)] text-[length:var(--qt-type-body-size)] leading-none text-[var(--qt-text-primary)] font-[family-name:var(--font-ui)] outline-none focus:border-[var(--qt-accent)] focus:ring-1 focus:ring-[var(--qt-accent)] transition-colors duration-150 ease-out cursor-pointer"
            >
              <option value="all">All</option>
              <option value="todo">Todo</option>
              <option value="inprogress">In progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          {/* Active filter chips */}
          <AnimatePresence>
            {statusFilter !== "all" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
              >
                <FilterChip
                  label={statusLabel(statusFilter as TaskStatus)}
                  onRemove={() => setStatusFilter("all")}
                />
              </motion.div>
            )}
            {searchQuery.trim() !== "" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
              >
                <FilterChip
                  label={`"${searchQuery.trim()}"`}
                  onRemove={() => setSearchQuery("")}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Clear filters */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                type="button"
                onClick={clearFilters}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
                className="h-[32px] px-[var(--qt-space-sm)] rounded-[var(--qt-radius-md)] text-[length:var(--qt-type-sm-size)] leading-none font-medium text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)] hover:bg-[var(--qt-border)] hover:text-[var(--qt-text-primary)] transition-colors duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--qt-accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--qt-bg-00)]"
              >
                Clear filters
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Table */}
        <div className="rounded-[var(--qt-radius-lg)] border border-[var(--qt-border)] bg-[var(--qt-surface-01)] overflow-hidden">
          {loading ? (
            <table className="w-full" aria-busy="true" aria-label="Loading tasks">
              <thead>
                <tr className="border-b border-[var(--qt-border)]">
                  <th className="px-[var(--qt-space-md)] py-[var(--qt-space-sm)] text-left text-[length:var(--qt-type-sm-size)] leading-[var(--qt-type-sm-line)] font-semibold text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)]">
                    Title
                  </th>
                  <th className="px-[var(--qt-space-md)] py-[var(--qt-space-sm)] text-left text-[length:var(--qt-type-sm-size)] leading-[var(--qt-type-sm-line)] font-semibold text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)]">
                    Status
                  </th>
                  <th className="px-[var(--qt-space-md)] py-[var(--qt-space-sm)] text-left text-[length:var(--qt-type-sm-size)] leading-[var(--qt-type-sm-line)] font-semibold text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)] hidden sm:table-cell">
                    Created
                  </th>
                  <th className="px-[var(--qt-space-md)] py-[var(--qt-space-sm)] sr-only">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonTableRow key={i} />
                ))}
              </tbody>
            </table>
          ) : tasks.length === 0 ? (
            // No tasks at all
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
                onClick={() => setShowCreateModal(true)}
                className="h-[32px] px-[var(--qt-space-md)] rounded-[var(--qt-radius-md)] text-[length:var(--qt-type-body-size)] leading-none font-semibold text-[var(--qt-accent-on)] bg-[var(--qt-accent)] font-[family-name:var(--font-ui)] hover:opacity-90 transition-opacity duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--qt-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--qt-surface-01)]"
              >
                Add task
              </button>
            </motion.div>
          ) : (
            <table className="w-full">
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
                  <th scope="col" className="px-[var(--qt-space-md)] py-[var(--qt-space-sm)] sr-only">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {filteredTasks.length === 0 ? (
                    // Filters return zero rows
                    <motion.tr
                      key="empty-filter"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <td colSpan={4}>
                        <div className="flex flex-col items-center justify-center py-[var(--qt-space-xxl)] gap-[var(--qt-space-md)]">
                          <p className="text-[length:var(--qt-type-body-size)] leading-[var(--qt-type-body-line)] text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)]">
                            No tasks match this filter
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
                    </motion.tr>
                  ) : (
                    filteredTasks.map((task, i) =>
                      editingId === task.id ? (
                        <InlineEditRow
                          key={task.id}
                          task={task}
                          onSave={handleInlineSave}
                          onCancel={() => setEditingId(null)}
                        />
                      ) : (
                        <TaskRow
                          key={task.id}
                          task={task}
                          index={i}
                          onEdit={setEditingId}
                          onDelete={setDeleteTarget}
                        />
                      )
                    )
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>

        {/* Row count */}
        {!loading && tasks.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: "easeOut", delay: 0.1 }}
            className="mt-[var(--qt-space-sm)] text-[length:var(--qt-type-sm-size)] leading-[var(--qt-type-sm-line)] text-[var(--qt-text-muted)] font-[family-name:var(--font-ui)]"
            aria-live="polite"
          >
            {filteredTasks.length === tasks.length
              ? `${tasks.length} task${tasks.length !== 1 ? "s" : ""}`
              : `${filteredTasks.length} of ${tasks.length} task${tasks.length !== 1 ? "s" : ""}`}
          </motion.p>
        )}
      </section>

      {/* Create task modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateTaskModal
            onClose={() => setShowCreateModal(false)}
            onSave={handleSaveTask}
          />
        )}
      </AnimatePresence>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirmModal
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
