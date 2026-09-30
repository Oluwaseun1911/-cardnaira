"use client"

import { useState } from "react"
import { PinDialog } from "./pin-dialog"
import { verifyPin } from "@/lib/db"

type PendingAction = {
  title: string
  description?: string
  action: () => Promise<void> | void
}

export function usePinConfirm(userId: string | undefined) {
  const [pending, setPending] = useState<PendingAction | null>(null)

  const dialog = (
    <PinDialog
      open={pending !== null}
      onClose={() => setPending(null)}
      title={pending?.title}
      description={pending?.description}
      onVerify={async (pin) => {
        if (!userId || !pending) return false
        const ok = await verifyPin(userId, pin)
        if (!ok) return false
        const { action } = pending
        await action()
        setPending(null)
      }}
    />
  )

  return { confirmWithPin: setPending, pinDialog: dialog }
}
