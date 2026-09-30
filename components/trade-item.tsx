"use client"

import type { Trade } from "@/lib/types"
import { formatDate, formatNaira } from "@/lib/utils"
import { StatusBadge } from "./ui"

export function TradeItem({ trade, onOpenImage }: { trade: Trade; onOpenImage?: (src: string) => void }) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3">
      <button
        type="button"
        onClick={() => onOpenImage?.(trade.cardImage)}
        className="shrink-0 overflow-hidden rounded-xl border border-line"
        aria-label={`View ${trade.cardName} card photo`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={trade.cardImage || "/placeholder.svg"} alt="" className="size-14 object-cover" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-ink">
          {trade.cardName} {trade.country}
        </p>
        <p className="text-xs text-muted">
          {trade.symbol}
          {trade.amount} · {formatDate(trade.createdAt)}
        </p>
        {trade.status === "rejected" && trade.note && <p className="mt-0.5 text-xs text-red-600">Reason: {trade.note}</p>}
      </div>
      <div className="flex flex-col items-end gap-1">
        <p className="font-bold text-ink">{formatNaira(trade.nairaValue)}</p>
        <StatusBadge status={trade.status} />
      </div>
    </li>
  )
}
