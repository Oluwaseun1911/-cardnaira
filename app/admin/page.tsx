"use client"

import Link from "next/link"
import { ArrowLeftRight, CheckCircle2, Clock, Banknote, Users, Wallet } from "lucide-react"
import { useTrades, useUsers, useWithdrawals } from "@/lib/db"
import { formatDate, formatNaira } from "@/lib/utils"
import { Card, StatusBadge } from "@/components/ui"

export default function AdminDashboardPage() {
  const trades = useTrades()
  const users = useUsers()
  const withdrawals = useWithdrawals()

  const pending = trades.filter((t) => t.status === "pending")
  const paid = trades.filter((t) => t.status === "paid")
  const totalPayout = paid.reduce((s, t) => s + t.nairaValue, 0)
  const pendingValue = pending.reduce((s, t) => s + t.nairaValue, 0)
  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending")

  const stats = [
    { label: "Total trades", value: trades.length.toLocaleString(), icon: ArrowLeftRight, tone: "bg-brand-light text-brand" },
    { label: "Pending", value: pending.length.toLocaleString(), sub: formatNaira(pendingValue), icon: Clock, tone: "bg-amber-100 text-amber-700" },
    { label: "Paid", value: paid.length.toLocaleString(), icon: CheckCircle2, tone: "bg-emerald-100 text-emerald-700" },
    { label: "Total payout", value: formatNaira(totalPayout), icon: Banknote, tone: "bg-accent/25 text-brand" },
    { label: "Users", value: users.length.toLocaleString(), icon: Users, tone: "bg-brand-light text-brand" },
    { label: "Pending withdrawals", value: pendingWithdrawals.length.toLocaleString(), icon: Wallet, tone: "bg-amber-100 text-amber-700" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-ink">Dashboard</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="flex flex-col gap-3">
            <span className={`flex size-10 items-center justify-center rounded-xl ${s.tone}`}>
              <s.icon className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-medium text-muted">{s.label}</p>
              <p className="text-xl font-extrabold text-ink lg:text-2xl">{s.value}</p>
              {s.sub && <p className="text-xs text-muted">{s.sub} awaiting</p>}
            </div>
          </Card>
        ))}
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Latest pending trades</h2>
          <Link href="/admin/trades" className="text-sm font-semibold text-brand">
            Manage trades
          </Link>
        </div>
        {pending.length === 0 ? (
          <Card className="text-center text-sm text-muted">No pending trades right now.</Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {pending.slice(0, 5).map((t) => (
              <li key={t.id}>
                <Link href="/admin/trades" className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3 hover:border-brand">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.cardImage || "/placeholder.svg"} alt="" className="size-12 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">
                      {t.userName} · {t.cardName} {t.country}
                    </p>
                    <p className="text-xs text-muted">{formatDate(t.createdAt)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="font-bold text-ink">{formatNaira(t.nairaValue)}</p>
                    <StatusBadge status={t.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
