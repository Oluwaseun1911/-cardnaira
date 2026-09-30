"use client"

import Link from "next/link"
import { useMemo, useRef, useState } from "react"
import { Camera, CheckCircle2, ImageIcon, Landmark, Maximize2, RefreshCw, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { submitTrade, useCurrentUser, useRates } from "@/lib/db"
import { compressImage } from "@/lib/image"
import type { Trade } from "@/lib/types"
import { formatNaira } from "@/lib/utils"
import { Button, Card, Field, Input, Select } from "@/components/ui"
import { ImageLightbox } from "@/components/image-lightbox"
import { usePinConfirm } from "@/components/use-pin-confirm"

export default function SellPage() {
  const user = useCurrentUser()
  const rates = useRates()
  const { confirmWithPin, pinDialog } = usePinConfirm(user?.id)

  const cards = useMemo(() => Array.from(new Set(rates.map((r) => r.card))), [rates])
  const [card, setCard] = useState("")
  const countries = useMemo(() => rates.filter((r) => r.card === card), [rates, card])
  const [rateId, setRateId] = useState("")
  const selectedRate = countries.find((r) => r.id === rateId) ?? null
  const [amount, setAmount] = useState("")
  const [image, setImage] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [zoomOpen, setZoomOpen] = useState(false)
  const [bankId, setBankId] = useState("")
  const [submitted, setSubmitted] = useState<Trade | null>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  if (!user) return null

  const bank = user.banks.find((b) => b.id === bankId) ?? user.banks[0]
  const numericAmount = Number(amount)
  const validAmount = Number.isFinite(numericAmount) && numericAmount > 0
  const nairaValue = selectedRate && validAmount ? Math.round(numericAmount * selectedRate.rate) : 0
  const canSubmit = Boolean(selectedRate && validAmount && image && bank)

  const onFile = async (file: File | undefined) => {
    if (!file) return
    setProcessing(true)
    try {
      setImage(await compressImage(file))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load image.")
    } finally {
      setProcessing(false)
    }
  }

  const resetForm = () => {
    setSubmitted(null)
    setCard("")
    setRateId("")
    setAmount("")
    setImage(null)
  }

  const onSubmit = () => {
    if (!canSubmit || !selectedRate || !image || !bank) return
    confirmWithPin({
      title: "Confirm trade",
      description: `Enter your transaction PIN to submit ${selectedRate.symbol}${numericAmount} ${selectedRate.card} for ${formatNaira(nairaValue)}.`,
            action: async () => {
          const trade = submitTrade({
            userId: user.id,
            userName: user.fullName,
            userPhone: user.phone,
            userEmail: user.email,
            cardName: selectedRate.card,
            country: selectedRate.country,
            currency: selectedRate.currency,
            symbol: selectedRate.symbol,
            amount: numericAmount,
            rate: selectedRate.rate,
            nairaValue,
            cardImage: image,
            bank,
          })

          try {
            await fetch("/api/notify-admin", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ trade }),
            })
          } catch (e) {}

          setSubmitted(trade)
          window.scrollTo({ top: 0 })
        },
    })
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-5 py-6 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="size-9" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-ink text-balance">Trade submitted, waiting for admin confirmation</h1>
          <p className="mt-2 text-sm text-muted text-pretty">
            {"We'll review your card and pay "}
            <strong className="text-ink">{formatNaira(submitted.nairaValue)}</strong> to your {submitted.bank.bankName} account.
          </p>
        </div>
        <Card className="w-full text-left">
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-muted">Trade ID</dt>
            <dd className="text-right font-mono font-semibold">{submitted.id}</dd>
            <dt className="text-muted">Card</dt>
            <dd className="text-right font-semibold">
              {submitted.cardName} ({submitted.country})
            </dd>
            <dt className="text-muted">Amount</dt>
            <dd className="text-right font-semibold">
              {submitted.symbol}
              {submitted.amount}
            </dd>
            <dt className="text-muted">Status</dt>
            <dd className="text-right font-semibold text-amber-700">Pending</dd>
          </dl>
        </Card>
        <div className="flex w-full flex-col gap-2">
          <Link href="/trades" className="inline-flex h-12 items-center justify-center rounded-xl bg-brand font-semibold text-white">
            View my trades
          </Link>
          <Button variant="outline" size="lg" onClick={resetForm}>
            Sell another card
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Sell gift card</h1>
        <p className="mt-1 text-sm text-muted">Pick your card, upload a clear photo and get paid in Naira.</p>
      </div>

      <Card className="flex flex-col gap-4">
        <Field label="Gift card" htmlFor="card">
          <Select
            id="card"
            value={card}
            onChange={(e) => {
              setCard(e.target.value)
              const first = rates.find((r) => r.card === e.target.value)
              setRateId(first?.id ?? "")
            }}
          >
            <option value="">Select card type</option>
            {cards.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Country / currency" htmlFor="country">
          <Select id="country" value={rateId} onChange={(e) => setRateId(e.target.value)} disabled={!card}>
            <option value="">{card ? "Select country" : "Choose a card first"}</option>
            {countries.map((r) => (
              <option key={r.id} value={r.id}>
                {r.country} ({r.currency}) - {formatNaira(r.rate)}/{r.symbol}1
              </option>
            ))}
          </Select>
        </Field>
        <Field label={`Card amount${selectedRate ? ` (${selectedRate.symbol})` : ""}`} htmlFor="amount">
          <Input
            id="amount"
            type="number"
            inputMode="decimal"
            min={1}
            placeholder="e.g. 100"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Field>
      </Card>

      <Card className="flex flex-col gap-3">
        <p className="text-sm font-medium text-ink">Card photo</p>
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = "" }} aria-label="Take card photo" />
        <input ref={galleryRef} type="file" accept="image/*" className="sr-only" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = "" }} aria-label="Choose card photo from gallery" />
        {image ? (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              className="group relative overflow-hidden rounded-2xl border border-line bg-surface"
              aria-label="Zoom card photo"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image || "/placeholder.svg"} alt="Uploaded gift card preview" className="max-h-80 w-full object-contain" />
              <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-ink/80 px-3 py-1.5 text-xs font-semibold text-white">
                <Maximize2 className="size-3.5" aria-hidden="true" /> Tap to zoom
              </span>
            </button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => galleryRef.current?.click()}>
                <RefreshCw className="size-4" aria-hidden="true" /> Change
              </Button>
              <Button variant="outline" className="text-red-600" onClick={() => setImage(null)}>
                <Trash2 className="size-4" aria-hidden="true" /> Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              disabled={processing}
              className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-brand/30 bg-brand-light p-5 text-sm font-semibold text-brand hover:border-brand"
            >
              <Camera className="size-7" aria-hidden="true" />
              {processing ? "Processing..." : "Take photo"}
            </button>
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              disabled={processing}
              className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-accent bg-accent/10 p-5 text-sm font-semibold text-brand hover:border-accent-dark"
            >
              <ImageIcon className="size-7" aria-hidden="true" />
              {processing ? "Processing..." : "From gallery"}
            </button>
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-3">
        <p className="text-sm font-medium text-ink">Payout account</p>
        {user.banks.length === 0 ? (
          <Link href="/profile/bank" className="flex items-center gap-3 rounded-xl border border-accent bg-accent/10 p-3 text-sm">
            <Landmark className="size-5 text-brand" aria-hidden="true" />
            <span className="font-semibold text-ink">Add a bank account to receive payment</span>
          </Link>
        ) : (
          <Select value={bank?.id} onChange={(e) => setBankId(e.target.value)} aria-label="Payout bank account">
            {user.banks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.bankName} - {b.accountNumber} ({b.accountName})
              </option>
            ))}
          </Select>
        )}
      </Card>

      <section className="rounded-3xl bg-brand p-5 text-white" aria-label="Trade summary">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/70">Summary</h2>
        <dl className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-white/70">Rate</dt>
          <dd className="text-right font-semibold">{selectedRate ? `${formatNaira(selectedRate.rate)} / ${selectedRate.symbol}1` : "-"}</dd>
          <dt className="text-white/70">Amount</dt>
          <dd className="text-right font-semibold">{selectedRate && validAmount ? `${selectedRate.symbol}${numericAmount}` : "-"}</dd>
        </dl>
        <div className="mt-4 flex items-end justify-between border-t border-white/20 pt-4">
          <span className="text-sm text-white/80">You get</span>
          <span className="text-3xl font-extrabold text-accent">{formatNaira(nairaValue)}</span>
        </div>
      </section>

      <Button size="lg" variant="accent" disabled={!canSubmit} onClick={onSubmit}>
        Confirm with PIN & submit
      </Button>
      {!canSubmit && (
        <p className="-mt-3 text-center text-xs text-muted">Select a card, enter amount, upload a photo and add a bank account to continue.</p>
      )}

      {zoomOpen && <ImageLightbox src={image} alt="Uploaded gift card" onClose={() => setZoomOpen(false)} />}
      {pinDialog}
    </div>
  )
}
