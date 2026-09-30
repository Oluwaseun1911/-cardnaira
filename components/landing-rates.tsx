"use client"

import { useRates } from "@/lib/db"
import { formatNaira } from "@/lib/utils"

export function LandingRates({ limit }: { limit?: number }) {
  const rates = useRates()
  const list = limit ? rates.slice(0, limit) : rates
  return (
    <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((r) => (
        <li key={r.id} className="flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3">
          <div>
            <p className="font-semibold text-ink">{r.card}</p>
            <p className="text-xs text-muted">
              {r.country} · {r.currency}
            </p>
          </div>
          <p className="text-right">
            <span className="font-bold text-brand">{formatNaira(r.rate)}</span>
            <span className="text-xs text-muted">
              {" / "}
              {r.symbol}1
            </span>
          </p>
        </li>
      ))}
    </ul>
  )
}
