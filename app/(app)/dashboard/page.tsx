"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowLeftRight, Landmark, ScanLine, Users, Wallet } from "lucide-react"
import { useCurrentUser, useTrades } from "@/lib/db"
import { formatNaira } from "@/lib/utils"
import { LandingRates } from "@/components/landing-rates"
import { TradeItem } from "@/components/trade-item"
import { ImageLightbox } from "@/components/image-lightbox"
import { EmptyState } from "@/components/ui"

const actions = [
  { href: "/sell", label: "Sell card", icon: ScanLine },
  { href: "/wallet", label: "Withdraw", icon: Wallet },
  { href: "/profile/bank", label: "Bank", icon: Landmark },
  { href: "/wallet#referral", label: "Invite", icon: Users },
]

export default function DashboardPage() {
  const user = useCurrentUser()
  const allTrades = useTrades()
  const [preview, setPreview] = useState<string | null>(null)
  const trades = useMemo(() => allTrades.filter((t) => t.userId === user?.id), [allTrades, user?.id])
  if (!user) return null

  const pending = trades.filter((t) => t.status === "pending").length
  const paidTotal = trades.filter((t) => t.status === "paid").reduce((s, t) => s + t.nairaValue, 0)

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl bg-brand p-5 text-white">
        <p className="text-sm text-white/80">Hi {user.fullName.split(" ")[0]},</p>
        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-white/70">Wallet balance</p>
        <p className="mt-1 text-3xl font-extrabold">{formatNaira(user.balance)}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-xs text-white/70">Pending trades</p>
            <p className="text-lg font-bold">{pending}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-xs text-white/70">Total paid out</p>
            <p className="text-lg font-bold text-accent">{formatNaira(paidTotal)}</p>
          </div>
        </div>
      </section>

      <nav className="grid grid-cols-4 gap-2" aria-label="Quick actions">
        {actions.map((a) => (
          <Link key={a.label} href={a.href} className="flex flex-col items-center gap-2 rounded-2xl bg-white p-3 text-center text-xs font-semibold text-ink border border-line hover:border-brand">
            <span className="flex size-10 items-center justify-center rounded-full bg-accent/20 text-brand">
              <a.icon className="size-5" aria-hidden="true" />
            </span>
            {a.label}
          </Link>
        ))}
      </nav>

      {user.banks.length === 0 && (
        <Link href="/profile/bank" className="flex items-center gap-3 rounded-2xl border border-accent bg-accent/10 p-4">
          <Landmark className="size-6 shrink-0 text-brand" aria-hidden="true" />
          <div>
            <p className="font-semibold text-ink">Add your bank account</p>
            <p className="text-sm text-muted">You need a bank account to receive payouts.</p>
          </div>
        </Link>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Recent trades</h2>
          <Link href="/trades" className="text-sm font-semibold text-brand">
            See all
          </Link>
        </div>
        {trades.length === 0 ? (
          <EmptyState
            icon={<ArrowLeftRight className="size-5" />}
            title="No trades yet"
            description="Sell your first gift card and get paid in Naira."
            action={
              <Link href="/sell" className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">
                Sell a card
              </Link>
            }
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {trades.slice(0, 3).map((t) => (
              <TradeItem key={t.id} trade={t} onOpenImage={setPreview} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-ink">Live rates</h2>
        <LandingRates limit={6} />
      </section>

      <ImageLightbox src={preview} alt="Gift card photo" onClose={() => setPreview(null)} />
    </div>
  )
}
