"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAdminTheme } from "./ThemeProvider";

type Cubic = [number, number, number, number];

/** Mirrors --ease-smooth in app/admin-shell.css. */
const EASE_SMOOTH: Cubic = [0.32, 0.72, 0, 1];

const DISMISS_MS = 4000;

/**
 * "success" and "error" are the original two types and remain the public API.
 * "warning" and "info" are additive — existing call sites are unaffected.
 */
type ToastType = "success" | "error" | "warning" | "info";

type Toast = {
  id: number;
  type: ToastType;
  message: string;
};

type ToastContextValue = {
  showToast: (type: ToastType, message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_ICON: Record<ToastType, LucideIcon> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
}) {
  const Icon = TOAST_ICON[toast.type];
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  // Auto-dismiss, paused while hovered so a long message stays readable.
  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => onDismiss(toast.id), DISMISS_MS);
    return () => clearTimeout(timer);
  }, [paused, toast.id, onDismiss]);

  return (
    <motion.div
      layout={!reduceMotion}
      role={toast.type === "error" ? "alert" : "status"}
      aria-live={toast.type === "error" ? "assertive" : "polite"}
      className={`admin-toast admin-toast--${toast.type}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 48, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 48, scale: 0.96 }}
      transition={
        reduceMotion ? { duration: 0 } : { duration: 0.34, ease: EASE_SMOOTH }
      }
    >
      <Icon className="admin-toast__icon h-4 w-4 shrink-0" aria-hidden />
      <p className="admin-toast__message">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="admin-toast__close"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
      {!reduceMotion && (
        <motion.span
          className="admin-toast__timer"
          aria-hidden
          initial={{ scaleX: 1 }}
          animate={{ scaleX: paused ? 1 : 0 }}
          transition={{ duration: paused ? 0 : DISMISS_MS / 1000, ease: "linear" }}
        />
      )}
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextToastIdRef = useRef(0);
  // The viewport is a sibling of .admin-shell, so it does not inherit the
  // [data-theme] token block. Stamping the attribute here gives it the same
  // --popover-bg / --success / --danger values the shell uses.
  const { theme } = useAdminTheme();

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = ++nextToastIdRef.current;
    // Cap the stack so a burst of errors cannot cover the screen.
    setToasts((current) => [...current, { id, type, message }].slice(-4));
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="admin-toast-viewport"
        data-theme={theme}
        aria-label="Notifications"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
