"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowLeftRight } from "lucide-react"
import { useCurrentUser, useTrades } from "@/lib/db"
import type { TradeStatus } from "@/lib/types"
import { TradeItem } from "@/components/trade-item"
import { ImageLightbox } from "@/components/image-lightbox"
import { EmptyState } from "@/components/ui"
import { cn } from "@/lib/utils"

const filters: Array<{ value: TradeStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "rejected", label: "Rejected" },
]

export default function TradesPage() {
  const user = useCurrentUser()
  const allTrades = useTrades()
  const [filter, setFilter] = useState<TradeStatus | "all">("all")
  const [preview, setPreview] = useState<string | null>(null)
  const trades = useMemo(
    () => allTrades.filter((t) => t.userId === user?.id && (filter === "all" || t.status === filter)),
    [allTrades, user?.id, filter],
  )

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold text-ink">My trades</h1>
      <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Filter trades">
        {filters.map((f) => (
          <button
            key={f.value}
            role="tab"
            aria-selected={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold",
              filter === f.value ? "bg-brand text-white" : "bg-white text-muted border border-line",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      {trades.length === 0 ? (
        <EmptyState
          icon={<ArrowLeftRight className="size-5" />}
          title="No trades here"
          description="Your submitted gift card trades will appear here."
          action={
            <Link href="/sell" className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">
              Sell a card
            </Link>
          }
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {trades.map((t) => (
            <TradeItem key={t.id} trade={t} onOpenImage={setPreview} />
          ))}
        </ul>
      )}
      <ImageLightbox src={preview} alt="Gift card photo" onClose={() => setPreview(null)} />
    </div>
  )
}
