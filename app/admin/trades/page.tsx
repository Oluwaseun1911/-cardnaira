"use client"

import { useMemo, useState } from "react"
import { Check, Mail, MessageCircle, Search, Trash2, X, ZoomIn } from "lucide-react"
import { toast } from "sonner"
import { deleteTrade, setTradeStatus, useTrades } from "@/lib/db"
import type { Trade, TradeStatus } from "@/lib/types"
import { toCustomerWhatsapp } from "@/lib/admin-auth"
import { cn, emailLink, formatDate, formatNaira, whatsappLink } from "@/lib/utils"
import { Button, Card, EmptyState, Field, Input, Modal, StatusBadge } from "@/components/ui"
import { ImageLightbox } from "@/components/image-lightbox"

const filters: Array<{ value: TradeStatus | "all"; label: string }> = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Approved / Paid" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
]

function tradeSummary(t: Trade) {
  return [
    `CardNaira Trade ${t.id}`,
    `Customer: ${t.userName} (${t.userPhone})`,
    `Card: ${t.cardName} ${t.country} - ${t.symbol}${t.amount}`,
    `Rate: ${formatNaira(t.rate)}/${t.symbol}1`,
    `Naira value: ${formatNaira(t.nairaValue)}`,
    `Bank: ${t.bank.bankName} - ${t.bank.accountNumber} - ${t.bank.accountName}`,
    `Date: ${formatDate(t.createdAt)}`,
  ].join("\n")
}

function TradeCard({ trade, onZoom, onReject }: { trade: Trade; onZoom: (src: string) => void; onReject: (t: Trade) => void }) {
  const t = trade
  const customerMsg =
    t.status === "paid"
      ? `Hello ${t.userName}, your ${t.cardName} trade (${t.id}) has been approved and ${formatNaira(t.nairaValue)} has been paid to your ${t.bank.bankName} account. Thank you for using CardNaira!`
      : `Hello ${t.userName}, regarding your CardNaira trade ${t.id} (${t.cardName} ${t.symbol}${t.amount}).`

  return (
    <Card className="grid gap-4 p-0 md:grid-cols-[280px_1fr]">
      <button
        type="button"
        onClick={() => onZoom(t.cardImage)}
        className="group relative block overflow-hidden rounded-t-2xl bg-ink/5 md:rounded-l-2xl md:rounded-tr-none"
        aria-label={`Open full size card photo for trade ${t.id}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={t.cardImage || "/placeholder.svg"} alt={`${t.cardName} card uploaded by ${t.userName}`} className="h-64 w-full object-cover transition group-hover:scale-105 md:h-full md:min-h-72" />
        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-ink/80 px-3 py-1.5 text-xs font-semibold text-white">
          <ZoomIn className="size-3.5" aria-hidden="true" /> Click to enlarge
        </span>
      </button>

      <div className="flex flex-col gap-4 p-4 md:pl-0">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-lg font-extrabold text-ink">{t.userName}</p>
            <a href={`tel:${t.userPhone}`} className="text-sm font-medium text-brand">
              {t.userPhone}
            </a>
            <p className="text-xs text-muted">{t.userEmail}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <StatusBadge status={t.status} />
            <p className="font-mono text-xs text-muted">{t.id}</p>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-muted">Card</dt>
            <dd className="font-semibold text-ink">
              {t.cardName} · {t.country}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Amount</dt>
            <dd className="font-semibold text-ink">
              {t.symbol}
              {t.amount}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Rate</dt>
            <dd className="font-semibold text-ink">{formatNaira(t.rate)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Naira value</dt>
            <dd className="text-lg font-extrabold text-emerald-600">{formatNaira(t.nairaValue)}</dd>
          </div>
        </dl>

        <div className="rounded-xl border-l-4 border-accent bg-accent/10 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Pay to</p>
          <p className="font-bold text-ink">{t.bank.bankName}</p>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(t.bank.accountNumber).then(() => toast.success("Account number copied"))}
            className="font-mono text-lg font-bold tracking-wider text-brand"
            aria-label={`Copy account number ${t.bank.accountNumber}`}
          >
            {t.bank.accountNumber}
          </button>
          <p className="text-sm font-semibold text-ink">{t.bank.accountName}</p>
        </div>

        <p className="text-xs text-muted">
          Submitted {formatDate(t.createdAt)}
          {t.status !== "pending" && ` · Updated ${formatDate(t.updatedAt)}`}
        </p>
        {t.note && <p className="text-sm text-red-600">Reason: {t.note}</p>}

        <div className="mt-auto flex flex-wrap gap-2">
          {t.status === "pending" && (
            <>
              <Button
                variant="success"
                onClick={() => {
                  setTradeStatus(t.id, "paid")
                  toast.success(`Trade ${t.id} approved and marked paid`)
                }}
              >
                <Check className="size-4" aria-hidden="true" /> Approve & Mark Paid
              </Button>
              <Button variant="danger" onClick={() => onReject(t)}>
                <X className="size-4" aria-hidden="true" /> Reject
              </Button>
            </>
          )}
          <a
            href={`https://wa.me/${toCustomerWhatsapp(t.userPhone)}?text=${encodeURIComponent(customerMsg)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-line px-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
          >
            <MessageCircle className="size-4" aria-hidden="true" /> Message customer
          </a>
          <a
            href={whatsappLink(tradeSummary(t))}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-line px-3 text-sm font-semibold text-ink hover:bg-surface"
          >
            <MessageCircle className="size-4" aria-hidden="true" /> Forward to my WhatsApp
          </a>
          {t.status !== "pending" && (
            <Button
              variant="ghost"
              className="text-red-600"
              onClick={() => {
                if (confirm(`Delete trade ${t.id}? This cannot be undone.`)) deleteTrade(t.id)
              }}
              aria-label={`Delete trade ${t.id}`}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          )}
          <a href={emailLink(`CardNaira trade ${t.id}`, tradeSummary(t))} className="sr-only">
            <Mail /> Email trade details
          </a>
        </div>
      </div>
    </Card>
  )
}

export default function AdminTradesPage() {
  const trades = useTrades()
  const [filter, setFilter] = useState<TradeStatus | "all">("pending")
  const [query, setQuery] = useState("")
  const [zoom, setZoom] = useState<string | null>(null)
  const [rejecting, setRejecting] = useState<Trade | null>(null)
  const [reason, setReason] = useState("")

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return trades.filter(
      (t) =>
        (filter === "all" || t.status === filter) &&
        (!q || [t.userName, t.userPhone, t.id, t.cardName, t.bank.accountNumber].some((v) => v.toLowerCase().includes(q))),
    )
  }, [trades, filter, query])

  const counts = useMemo(
    () => ({
      all: trades.length,
      pending: trades.filter((t) => t.status === "pending").length,
      paid: trades.filter((t) => t.status === "paid").length,
      rejected: trades.filter((t) => t.status === "rejected").length,
    }),
    [trades],
  )

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold text-ink">Trades</h1>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Filter trades">
          {filters.map((f) => (
            <button
              key={f.value}
              role="tab"
              aria-selected={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold",
                filter === f.value ? "bg-brand text-white" : "border border-line bg-white text-muted",
              )}
            >
              {f.label} ({counts[f.value]})
            </button>
          ))}
        </div>
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, phone, ID..." className="pl-9" aria-label="Search trades" />
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={<Search className="size-5" />} title="No trades found" description="Customer trades will show up here as soon as they are submitted." />
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map((t) => (
            <TradeCard
              key={t.id}
              trade={t}
              onZoom={setZoom}
              onReject={(trade) => {
                setReason("")
                setRejecting(trade)
              }}
            />
          ))}
        </div>
      )}

      <ImageLightbox src={zoom} alt="Customer gift card" onClose={() => setZoom(null)} />

      <Modal open={rejecting !== null} onClose={() => setRejecting(null)} title="Reject trade" description={rejecting ? `${rejecting.userName} · ${rejecting.cardName} ${rejecting.symbol}${rejecting.amount}` : undefined}>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (!rejecting) return
            setTradeStatus(rejecting.id, "rejected", reason.trim() || "Card could not be verified")
            toast.success(`Trade ${rejecting.id} rejected`)
            setRejecting(null)
          }}
        >
          <Field label="Reason (shown to customer)" htmlFor="reject-reason">
            <Input id="reject-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Card already redeemed" autoFocus />
          </Field>
          <Button type="submit" variant="danger" size="lg">
            Reject trade
          </Button>
        </form>
      </Modal>
    </div>
  )
}
