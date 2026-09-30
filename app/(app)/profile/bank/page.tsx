"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, Landmark, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { deleteBank, saveBank, useCurrentUser } from "@/lib/db"
import { NIGERIAN_BANKS } from "@/lib/banks"
import type { BankAccount } from "@/lib/types"
import { Button, Card, EmptyState, Field, Input, Modal, Select } from "@/components/ui"
import { usePinConfirm } from "@/components/use-pin-confirm"

type FormState = { bankName: string; accountNumber: string; accountName: string }
const emptyForm: FormState = { bankName: "", accountNumber: "", accountName: "" }

export default function BankPage() {
  const user = useCurrentUser()
  const { confirmWithPin, pinDialog } = usePinConfirm(user?.id)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<BankAccount | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<Partial<FormState>>({})

  if (!user) return null

  const openForm = (bank?: BankAccount) => {
    setEditing(bank ?? null)
    setForm(bank ? { bankName: bank.bankName, accountNumber: bank.accountNumber, accountName: bank.accountName } : emptyForm)
    setErrors({})
    setOpen(true)
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const next: Partial<FormState> = {}
    if (!form.bankName) next.bankName = "Select your bank."
    if (!/^\d{10}$/.test(form.accountNumber)) next.accountNumber = "Account number must be exactly 10 digits."
    if (form.accountName.trim().length < 3) next.accountName = "Enter the account name as shown by your bank."
    const duplicate = user.banks.some((b) => b.id !== editing?.id && b.bankName === form.bankName && b.accountNumber === form.accountNumber)
    if (duplicate) next.accountNumber = "This account is already saved."
    setErrors(next)
    if (Object.keys(next).length) return

    const data = { ...form, accountName: form.accountName.trim().toUpperCase() }
    setOpen(false)
    confirmWithPin({
      title: "Enter your transaction PIN to add bank",
      description: `${data.bankName} · ${data.accountNumber} · ${data.accountName}`,
      action: () => {
        saveBank(user.id, data, editing?.id)
        toast.success(editing ? "Bank account updated" : "Bank account added")
      },
    })
  }

  const onDelete = (bank: BankAccount) => {
    confirmWithPin({
      title: "Enter PIN to delete bank",
      description: `Remove ${bank.bankName} (${bank.accountNumber}) from your account.`,
      action: () => {
        deleteBank(user.id, bank.id)
        toast.success("Bank account removed")
      },
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/profile" className="rounded-full p-2 hover:bg-white" aria-label="Back to profile">
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-2xl font-extrabold text-ink">Bank accounts</h1>
      </div>

      {user.banks.length === 0 ? (
        <EmptyState
          icon={<Landmark className="size-5" />}
          title="No bank account yet"
          description="Add a Nigerian bank account to receive your gift card payouts."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {user.banks.map((b) => (
            <li key={b.id}>
              <Card className="flex items-center gap-3 border-l-4 border-l-accent">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
                  <Landmark className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-ink">{b.bankName}</p>
                  <p className="font-mono text-sm tracking-wider text-ink">{b.accountNumber}</p>
                  <p className="truncate text-xs text-muted">{b.accountName}</p>
                </div>
                <button onClick={() => openForm(b)} className="rounded-lg p-2 text-brand hover:bg-brand-light" aria-label={`Edit ${b.bankName} account`}>
                  <Pencil className="size-4" />
                </button>
                <button onClick={() => onDelete(b)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label={`Delete ${b.bankName} account`}>
                  <Trash2 className="size-4" />
                </button>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Button size="lg" onClick={() => openForm()}>
        <Plus className="size-5" aria-hidden="true" /> Add bank account
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit bank account" : "Add bank account"} description="Payouts will be sent to this account.">
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <Field label="Bank name" htmlFor="bankName" error={errors.bankName}>
            <Select id="bankName" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })}>
              <option value="">Select bank</option>
              {NIGERIAN_BANKS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Account number" htmlFor="accountNumber" error={errors.accountNumber} hint={`${form.accountNumber.length}/10 digits`}>
            <Input
              id="accountNumber"
              inputMode="numeric"
              maxLength={10}
              placeholder="0123456789"
              className="font-mono tracking-wider"
              value={form.accountNumber}
              onChange={(e) => setForm({ ...form, accountNumber: e.target.value.replace(/\D/g, "").slice(0, 10) })}
            />
          </Field>
          <Field label="Account name" htmlFor="accountName" error={errors.accountName} hint="Enter the name exactly as it appears on your bank account">
            <Input
              id="accountName"
              placeholder="e.g. OLUWASEUN MUSIBAU"
              className="uppercase"
              value={form.accountName}
              onChange={(e) => setForm({ ...form, accountName: e.target.value })}
            />
          </Field>
          <Button type="submit" size="lg">
            Continue
          </Button>
        </form>
      </Modal>
      {pinDialog}
    </div>
  )
}
