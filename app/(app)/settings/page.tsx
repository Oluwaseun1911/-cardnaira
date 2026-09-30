"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { setPin, useCurrentUser } from "@/lib/db"
import { Button, Card } from "@/components/ui"
import { CreatePinDialog } from "@/components/pin-dialog"
import { usePinConfirm } from "@/components/use-pin-confirm"

export default function SettingsPage() {
  const user = useCurrentUser()
  const { confirmWithPin, pinDialog } = usePinConfirm(user?.id)
  const [creating, setCreating] = useState(false)

  if (!user) return null

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/profile" className="rounded-full p-2 hover:bg-white" aria-label="Back to profile">
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-2xl font-extrabold text-ink">Settings</h1>
      </div>

      <Card className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/20 text-brand">
            <KeyRound className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-bold text-ink">Transaction PIN</h2>
            <p className="text-sm text-muted text-pretty">Your 4-digit PIN is required to add a bank, sell a card and withdraw.</p>
          </div>
        </div>
        <Button
          onClick={() =>
            confirmWithPin({
              title: "Enter current PIN",
              description: "Confirm your current PIN before setting a new one.",
              action: () => setCreating(true),
            })
          }
        >
          Change PIN
        </Button>
      </Card>

      <Card className="flex items-start gap-3">
        <ShieldCheck className="size-6 shrink-0 text-emerald-600" aria-hidden="true" />
        <p className="text-sm text-muted text-pretty">Never share your PIN with anyone, including CardNaira staff. We will never ask for it.</p>
      </Card>

      <CreatePinDialog
        open={creating}
        dismissible
        title="Set new PIN"
        onClose={() => setCreating(false)}
        onCreate={async (pin) => {
          await setPin(user.id, pin)
          setCreating(false)
          toast.success("PIN changed successfully")
        }}
      />
      {pinDialog}
    </div>
  )
}
