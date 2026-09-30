"use client"

import { useState } from "react"
import { toast } from "sonner"
import { changeAdminPassword } from "@/lib/db"
import { Button, Card, Field, Input } from "@/components/ui"

export default function AdminSettingsPage() {
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (next !== confirmPw) return setError("New passwords do not match.")
    setLoading(true)
    try {
      await changeAdminPassword(current, next)
      setCurrent("")
      setNext("")
      setConfirmPw("")
      setError(undefined)
      toast.success("Admin password changed")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex max-w-lg flex-col gap-4">
      <h1 className="text-2xl font-extrabold text-ink">Admin settings</h1>
      <Card>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <h2 className="font-bold text-ink">Change admin password</h2>
          <Field label="Current password" htmlFor="cur-pw">
            <Input id="cur-pw" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
          </Field>
          <Field label="New password" htmlFor="new-pw" hint="At least 6 characters">
            <Input id="new-pw" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
          </Field>
          <Field label="Confirm new password" htmlFor="confirm-pw" error={error}>
            <Input id="confirm-pw" type="password" autoComplete="new-password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
          </Field>
          <Button type="submit" size="lg" loading={loading}>
            Update password
          </Button>
        </form>
      </Card>
    </div>
  )
}
