"use client"

import { useState } from "react"
import { Plus, RotateCcw, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { DEFAULT_RATES, saveRates, useRates } from "@/lib/db"
import type { Rate } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { Button, Card, Field, Input, Modal } from "@/components/ui"

export default function AdminRatesPage() {
  const rates = useRates()
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ card: "", country: "", currency: "USD", symbol: "$", rate: "" })

  const dirty = Object.keys(drafts).length > 0

  const saveAll = () => {
    const invalid = Object.values(drafts).some((v) => !(Number(v) > 0))
    if (invalid) return toast.error("All rates must be positive numbers.")
    const stamp = new Date().toISOString()
    saveRates(rates.map((r) => (drafts[r.id] !== undefined ? { ...r, rate: Math.round(Number(drafts[r.id])), updatedAt: stamp } : r)))
    setDrafts({})
    toast.success("Rates updated live")
  }

  const remove = (r: Rate) => {
    if (!confirm(`Remove ${r.card} (${r.country}) rate?`)) return
    saveRates(rates.filter((x) => x.id !== r.id))
  }

  const addRate = (e: React.FormEvent) => {
    e.preventDefault()
    const value = Number(form.rate)
    if (!form.card.trim() || !form.country.trim() || !(value > 0)) return toast.error("Fill in card, country and a valid rate.")
    const id = `${form.card}-${form.country}`.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    if (rates.some((r) => r.id === id)) return toast.error("That card and country already exists.")
    saveRates([
      ...rates,
      { id, card: form.card.trim(), country: form.country.trim(), currency: form.currency.trim().toUpperCase(), symbol: form.symbol.trim(), rate: Math.round(value), updatedAt: new Date().toISOString() },
    ])
    setAdding(false)
    setForm({ card: "", country: "", currency: "USD", symbol: "$", rate: "" })
    toast.success("Rate added")
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Rates manager</h1>
          <p className="text-sm text-muted">Naira paid per 1 unit of card currency. Changes go live instantly.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAdding(true)}>
            <Plus className="size-4" aria-hidden="true" /> Add rate
          </Button>
          <Button variant="accent" onClick={saveAll} disabled={!dirty}>
            <Save className="size-4" aria-hidden="true" /> Save changes
          </Button>
        </div>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-brand text-left text-white">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Card</th>
              <th scope="col" className="px-4 py-3 font-semibold">Country</th>
              <th scope="col" className="px-4 py-3 font-semibold">Rate (₦ per 1)</th>
              <th scope="col" className="px-4 py-3 font-semibold">Updated</th>
              <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rates.map((r) => (
              <tr key={r.id} className={drafts[r.id] !== undefined ? "bg-accent/10" : undefined}>
                <td className="px-4 py-2 font-semibold text-ink">{r.card}</td>
                <td className="px-4 py-2 text-ink">
                  {r.country} <span className="text-muted">({r.symbol})</span>
                </td>
                <td className="px-4 py-2">
                  <div className="relative w-36">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">₦</span>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      className="h-10 pl-7 font-semibold"
                      value={drafts[r.id] ?? String(r.rate)}
                      onChange={(e) => setDrafts({ ...drafts, [r.id]: e.target.value })}
                      aria-label={`${r.card} ${r.country} rate`}
                    />
                  </div>
                </td>
                <td className="px-4 py-2 text-xs text-muted">{formatDate(r.updatedAt)}</td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => remove(r)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label={`Remove ${r.card} ${r.country}`}>
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Button
        variant="ghost"
        className="self-start text-muted"
        onClick={() => {
          if (confirm("Reset all rates to defaults?")) {
            saveRates(DEFAULT_RATES)
            setDrafts({})
          }
        }}
      >
        <RotateCcw className="size-4" aria-hidden="true" /> Reset to default rates
      </Button>

      <Modal open={adding} onClose={() => setAdding(false)} title="Add new rate">
        <form onSubmit={addRate} className="flex flex-col gap-4">
          <Field label="Card name" htmlFor="new-card">
            <Input id="new-card" value={form.card} onChange={(e) => setForm({ ...form, card: e.target.value })} placeholder="e.g. Steam" />
          </Field>
          <Field label="Country" htmlFor="new-country">
            <Input id="new-country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="e.g. Australia" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Currency" htmlFor="new-currency">
              <Input id="new-currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
            </Field>
            <Field label="Symbol" htmlFor="new-symbol">
              <Input id="new-symbol" value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} />
            </Field>
          </div>
          <Field label="Rate (₦ per 1 unit)" htmlFor="new-rate">
            <Input id="new-rate" type="number" inputMode="numeric" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} placeholder="e.g. 900" />
          </Field>
          <Button type="submit" size="lg">
            Add rate
          </Button>
        </form>
      </Modal>
    </div>
  )
}
