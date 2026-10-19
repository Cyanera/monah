import { useEffect, useRef, useSyncExternalStore, type ButtonHTMLAttributes, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { STATUS_LABEL, type Status } from "../lib/types";

/* ---------- Button ---------- */

type Variant = "primary" | "secondary" | "ghost" | "danger" | "gold";
const VARIANTS: Record<Variant, string> = {
  primary: "bg-olive-700 text-cream hover:bg-olive-800 shadow-soft",
  gold: "bg-gold text-white hover:bg-[#9d741f] shadow-soft",
  secondary: "bg-white text-olive-800 ring-1 ring-olive-200 hover:bg-olive-50",
  ghost: "text-olive-800 hover:bg-olive-100",
  danger: "bg-clay text-white hover:bg-[#8f4a2b] shadow-soft",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "px-3.5 py-1.5 text-sm", md: "px-5 py-2.5", lg: "px-7 py-3.5 text-lg" };
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${sizes[size]} ${className}`}
    />
  );
}

/* ---------- Status badge ---------- */

const STATUS_STYLE: Record<Status, string> = {
  new: "bg-gold-soft text-[#7a5a14] ring-[#e6cf8f]",
  review: "bg-sky-50 text-sky-800 ring-sky-200",
  receiving: "bg-olive-100 text-olive-800 ring-olive-300",
  distributed: "bg-olive-700 text-cream ring-olive-800",
  rejected: "bg-clay-soft text-[#7d3b1d] ring-[#e4b9a2]",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-0.5 text-sm font-bold ring-1 ring-inset ${STATUS_STYLE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

/* ---------- Modal / confirm ---------- */

export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-olive-900/50 backdrop-blur-[2px]" onClick={onClose} />
      <div
        ref={panel}
        tabIndex={-1}
        className={`animate-pop relative flex max-h-[92dvh] w-full flex-col rounded-t-3xl bg-cream shadow-lift outline-none sm:rounded-3xl ${wide ? "sm:max-w-2xl" : "sm:max-w-md"}`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-sand/60 px-5 py-4 sm:px-6">
          <h2 className="text-xl font-black text-olive-800">{title}</h2>
          <button onClick={onClose} aria-label="إغلاق" className="rounded-full p-2 text-olive-700 hover:bg-olive-100">
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  danger = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="mb-6 text-olive-900/80">{message}</p>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-start">
        <Button variant="secondary" onClick={onCancel}>
          إلغاء
        </Button>
        <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

/* ---------- Toasts ---------- */

type ToastKind = "success" | "error" | "info";
interface ToastItem {
  id: number;
  kind: ToastKind;
  text: string;
}
let toasts: ToastItem[] = [];
let toastId = 0;
const toastListeners = new Set<() => void>();
const emit = () => toastListeners.forEach((l) => l());

export function toast(text: string, kind: ToastKind = "success") {
  const id = ++toastId;
  toasts = [...toasts, { id, kind, text }];
  emit();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, 4200);
}

export function Toaster() {
  const items = useSyncExternalStore(
    (cb) => {
      toastListeners.add(cb);
      return () => toastListeners.delete(cb);
    },
    () => toasts,
  );
  const icons = {
    success: <CheckCircle2 className="size-5 text-olive-600" />,
    error: <XCircle className="size-5 text-clay" />,
    info: <Info className="size-5 text-gold" />,
  };
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite">
      {items.map((t) => (
        <div
          key={t.id}
          className="animate-pop pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-bold shadow-lift ring-1 ring-sand"
        >
          {icons[t.kind]}
          {t.text}
        </div>
      ))}
    </div>
  );
}

/* ---------- Form helpers ---------- */

export function Field({
  label,
  hint,
  error,
  optional,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline gap-2 text-sm font-bold text-olive-900">
        {label}
        {optional && <span className="text-xs font-normal text-olive-700/70">(اختياري)</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-olive-700/80">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm font-bold text-clay">
          <AlertTriangle className="size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClass = (error?: string) =>
  `w-full rounded-2xl border bg-white px-4 py-3 text-base text-ink placeholder:text-olive-700/40 transition focus:border-olive-500 focus:outline-none focus:ring-4 focus:ring-olive-200/70 ${
    error ? "border-clay ring-2 ring-clay-soft" : "border-sand"
  }`;
