"use client"

import { useCallback, useEffect, useState } from "react"
import { Delete, Lock } from "lucide-react"
import { Modal } from "./ui"
import { cn } from "@/lib/utils"

function PinPad({ onComplete, error, busy }: { onComplete: (pin: string) => void; error?: string; busy?: boolean }) {
  const [pin, setPin] = useState("")

  const press = useCallback(
    (digit: string) => {
      if (busy) return
      setPin((current) => {
        if (current.length >= 4) return current
        const next = current + digit
        if (next.length === 4) setTimeout(() => onComplete(next), 120)
        return next
      })
    },
    [busy, onComplete],
  )

  const backspace = useCallback(() => setPin((c) => c.slice(0, -1)), [])

  useEffect(() => {
    if (error) setPin("")
  }, [error])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) press(e.key)
      else if (e.key === "Backspace") backspace()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [press, backspace])

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-4" aria-label={`${pin.length} of 4 digits entered`} role="status">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "size-4 rounded-full border-2 transition-colors",
              i < pin.length ? "border-brand bg-brand" : "border-line bg-white",
              error && "border-red-500",
            )}
          />
        ))}
      </div>
      {error ? (
        <p className="-mt-2 text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : (
        <p className="-mt-2 text-sm text-muted">Tap or type your digits</p>
      )}
      <div className="grid w-full max-w-xs grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => press(d)}
            className="h-14 rounded-2xl bg-surface text-xl font-semibold text-ink transition-colors hover:bg-brand-light active:bg-brand active:text-white"
          >
            {d}
          </button>
        ))}
        <span />
        <button
          type="button"
          onClick={() => press("0")}
          className="h-14 rounded-2xl bg-surface text-xl font-semibold text-ink transition-colors hover:bg-brand-light active:bg-brand active:text-white"
        >
          0
        </button>
        <button
          type="button"
          onClick={backspace}
          className="flex h-14 items-center justify-center rounded-2xl text-muted hover:bg-surface"
          aria-label="Delete last digit"
        >
          <Delete className="size-6" />
        </button>
      </div>
    </div>
  )
}

export function PinDialog({
  open,
  onClose,
  title = "Enter transaction PIN",
  description,
  onVerify,
}: {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  onVerify: (pin: string) => Promise<boolean | void>
}) {
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const handleComplete = async (pin: string) => {
    setBusy(true)
    setError(undefined)
    try {
      const ok = await onVerify(pin)
      if (ok === false) {
        setError("Incorrect PIN. Try again.")
        setAttempt((a) => a + 1)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.")
      setAttempt((a) => a + 1)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title} description={description}>
      <div className="mb-5 flex justify-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-accent/20 text-brand">
          <Lock className="size-6" aria-hidden="true" />
        </span>
      </div>
      <PinPad key={`${open}-${attempt}`} onComplete={handleComplete} error={error} busy={busy} />
    </Modal>
  )
}

export function CreatePinDialog({
  open,
  onClose,
  onCreate,
  dismissible = false,
  title = "Create your transaction PIN",
}: {
  open: boolean
  onClose: () => void
  onCreate: (pin: string) => Promise<void>
  dismissible?: boolean
  title?: string
}) {
  const [first, setFirst] = useState<string | null>(null)
  const [error, setError] = useState<string>()
  const [round, setRound] = useState(0)

  const reset = (message?: string) => {
    setFirst(null)
    setError(message)
    setRound((r) => r + 1)
  }

  const handleComplete = async (pin: string) => {
    if (!first) {
      setFirst(pin)
      setError(undefined)
      setRound((r) => r + 1)
      return
    }
    if (pin !== first) {
      reset("PINs did not match. Start again.")
      return
    }
    try {
      await onCreate(pin)
      reset()
    } catch (e) {
      reset(e instanceof Error ? e.message : "Could not save PIN.")
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={dismissible}
      title={title}
      description={
        first
          ? "Confirm your 4-digit PIN."
          : "You will use this 4-digit PIN to add bank accounts, sell cards and withdraw."
      }
    >
      <div className="mb-5 flex justify-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-accent/20 text-brand">
          <Lock className="size-6" aria-hidden="true" />
        </span>
      </div>
      <p className="mb-4 text-center text-sm font-semibold text-brand">{first ? "Step 2 of 2 · Confirm PIN" : "Step 1 of 2 · New PIN"}</p>
      <PinPad key={round} onComplete={handleComplete} error={error} />
    </Modal>
  )
}
