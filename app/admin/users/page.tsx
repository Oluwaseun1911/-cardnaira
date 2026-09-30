"use client"

import { useMemo, useState } from "react"
import { Search, Users } from "lucide-react"
import { useTrades, useUsers } from "@/lib/db"
import type { User } from "@/lib/types"
import { formatDate, formatNaira } from "@/lib/utils"
import { Avatar, Card, EmptyState, Input, Modal } from "@/components/ui"
import { ImageLightbox } from "@/components/image-lightbox"

export default function AdminUsersPage() {
  const users = useUsers()
  const trades = useTrades()
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<User | null>(null)
  const [zoom, setZoom] = useState<string | null>(null)

  const tradeCount = useMemo(() => {
    const map = new Map<string, number>()
    trades.forEach((t) => map.set(t.userId, (map.get(t.userId) ?? 0) + 1))
    return map
  }, [trades])

  const visible = users
    .filter((u) => {
      const q = query.trim().toLowerCase()
      return !q || [u.fullName, u.email, u.phone].some((v) => v.toLowerCase().includes(q))
    })
    .toReversed()

  const current = selected ? users.find((u) => u.id === selected.id) ?? selected : null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-ink">Users ({users.length})</h1>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users..." className="pl-9" aria-label="Search users" />
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={<Users className="size-5" />} title="No users found" description="Registered customers will appear here." />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((u) => (
            <li key={u.id}>
              <button onClick={() => setSelected(u)} className="flex w-full items-center gap-3 rounded-2xl border border-line bg-white p-4 text-left hover:border-brand">
                <Avatar src={u.avatar} name={u.fullName} size={52} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-ink">{u.fullName}</p>
                  <p className="truncate text-xs text-muted">{u.phone}</p>
                  <p className="text-xs text-muted">{tradeCount.get(u.id) ?? 0} trades</p>
                </div>
                <p className="font-extrabold text-emerald-600">{formatNaira(u.balance)}</p>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal open={current !== null} onClose={() => setSelected(null)} title="Customer details">
        {current && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => current.avatar && setZoom(current.avatar)} aria-label="View profile photo" disabled={!current.avatar}>
                <Avatar src={current.avatar} name={current.fullName} size={72} />
              </button>
              <div className="min-w-0">
                <p className="text-lg font-extrabold text-ink">{current.fullName}</p>
                <p className="truncate text-sm text-muted">{current.email}</p>
                <a href={`tel:${current.phone}`} className="text-sm font-semibold text-brand">
                  {current.phone}
                </a>
              </div>
            </div>
            <Card className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted">Balance</p>
                <p className="font-bold text-emerald-600">{formatNaira(current.balance)}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Trades</p>
                <p className="font-bold text-ink">{tradeCount.get(current.id) ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Referral code</p>
                <p className="font-mono font-bold text-ink">{current.referralCode}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Joined</p>
                <p className="font-semibold text-ink">{formatDate(current.createdAt)}</p>
              </div>
            </Card>
            <div>
              <p className="mb-2 text-sm font-semibold text-ink">Bank accounts</p>
              {current.banks.length === 0 ? (
                <p className="text-sm text-muted">No bank added.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {current.banks.map((b) => (
                    <li key={b.id} className="rounded-xl border-l-4 border-accent bg-accent/10 p-3 text-sm">
                      <p className="font-bold text-ink">{b.bankName}</p>
                      <p className="font-mono text-brand">{b.accountNumber}</p>
                      <p className="text-ink">{b.accountName}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>
      <ImageLightbox src={zoom} alt="Customer profile photo" onClose={() => setZoom(null)} />
    </div>
  )
}
