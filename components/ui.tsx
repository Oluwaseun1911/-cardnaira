"use client"

import { useEffect, useId, useRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react"
import { Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TradeStatus } from "@/lib/types"

type ButtonVariant = "primary" | "accent" | "outline" | "ghost" | "danger" | "success"

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white hover:bg-brand-dark",
  accent: "bg-accent text-ink hover:bg-accent-dark",
  outline: "border border-line bg-white text-ink hover:bg-surface",
  ghost: "text-ink hover:bg-surface",
  danger: "bg-red-600 text-white hover:bg-red-700",
  success: "bg-emerald-600 text-white hover:bg-emerald-700",
}

export function Button({
  variant = "primary",
  size = "md",
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: "sm" | "md" | "lg"
  loading?: boolean
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-11 px-4 text-sm",
        size === "lg" && "h-13 px-6 text-base",
        buttonVariants[variant],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
}: {
  label: string
  hint?: string
  error?: string
  children: ReactNode
  htmlFor?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  )
}

const controlClass =
  "h-12 w-full rounded-xl border border-line bg-white px-3.5 text-base text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:bg-surface"

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClass, className)} {...props} />
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(controlClass, "appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10", className)} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }} {...props}>
      {children}
    </select>
  )
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-2xl border border-line bg-white p-4", className)}>{children}</div>
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  dismissible = true,
  size = "md",
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  dismissible?: boolean
  size?: "md" | "lg"
}) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    panelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissible) onClose()
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
      previous?.focus()
    }
  }, [open, dismissible, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-0 sm:items-center sm:p-4" onClick={() => dismissible && onClose()}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl outline-none sm:rounded-3xl",
          size === "md" ? "sm:max-w-md" : "sm:max-w-2xl",
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-bold text-ink text-balance">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-muted text-pretty">{description}</p>}
          </div>
          {dismissible && (
            <button onClick={onClose} className="rounded-full p-1.5 text-muted hover:bg-surface" aria-label="Close">
              <X className="size-5" />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}

const statusStyles: Record<TradeStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-700",
}

const statusLabels: Record<TradeStatus, string> = {
  pending: "Pending",
  paid: "Approved & Paid",
  rejected: "Rejected",
}

export function StatusBadge({ status }: { status: TradeStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", statusStyles[status])}>
      {statusLabels[status]}
    </span>
  )
}

export function Avatar({ src, name, size = 40 }: { src: string | null; name: string; size?: number }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={`${name} profile photo`} width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-accent font-bold text-brand"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden="true"
    >
      {initials || "U"}
    </span>
  )
}

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-white px-6 py-10 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-brand-light text-brand">{icon}</div>
      <div>
        <p className="font-semibold text-ink">{title}</p>
        <p className="mt-1 text-sm text-muted text-pretty">{description}</p>
      </div>
      {action}
    </div>
  )
}
