"use client"

import { Check, Wallet, X } from "lucide-react"
import { toast } from "sonner"
import { setWithdrawalStatus, useWithdrawals } from "@/lib/db"
import { formatDate, formatNaira } from "@/lib/utils"
import { Button, Card, EmptyState, StatusBadge } from "@/components/ui"

export default function AdminWithdrawalsPage() {
  const withdrawals = useWithdrawals()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold text-ink">Withdrawals</h1>
      {withdrawals.length === 0 ? (
        <EmptyState icon={<Wallet className="size-5" />} title="No withdrawals yet" description="Wallet withdrawal requests from customers will appear here." />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {withdrawals.map((w) => (
            <li key={w.id}>
              <Card className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-ink">{w.userName}</p>
                    <p className="text-sm text-brand">{w.userPhone}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-lg font-extrabold text-ink">{formatNaira(w.amount)}</p>
                    <StatusBadge status={w.status} />
                  </div>
                </div>
                <div className="rounded-xl border-l-4 border-accent bg-accent/10 p-3 text-sm">
                  <p className="font-bold text-ink">{w.bank.bankName}</p>
                  <p className="font-mono font-bold tracking-wider text-brand">{w.bank.accountNumber}</p>
                  <p className="font-semibold text-ink">{w.bank.accountName}</p>
                </div>
                <p className="text-xs text-muted">{formatDate(w.createdAt)}</p>
                {w.status === "pending" && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="success"
                      onClick={() => {
                        setWithdrawalStatus(w.id, "paid")
                        toast.success("Withdrawal marked as paid")
                      }}
                    >
                      <Check className="size-4" aria-hidden="true" /> Mark paid
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        setWithdrawalStatus(w.id, "rejected")
                        toast.success("Withdrawal rejected and refunded")
                      }}
                    >
                      <X className="size-4" aria-hidden="true" /> Reject
                    </Button>
                  </div>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
