"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowDownLeft, ArrowUpRight, Copy, Share2, Users } from "lucide-react"
import { toast } from "sonner"
import { MIN_WITHDRAWAL, REFERRAL_PERCENT, requestWithdrawal, SIGNUP_BONUS, useCurrentUser, useUsers, useWithdrawals } from "@/lib/db"
import { formatDate, formatNaira } from "@/lib/utils"
import { Button, Card, Field, Input, Modal, Select, StatusBadge } from "@/components/ui"
import { usePinConfirm } from "@/components/use-pin-confirm"

export default function WalletPage() {
  const user = useCurrentUser()
  const users = useUsers()
  const withdrawals = useWithdrawals()
  const { confirmWithPin, pinDialog } = usePinConfirm(user?.id)
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [bankId, setBankId] = useState("")
  const [error, setError] = useState<string>()

  const myWithdrawals = useMemo(() => withdrawals.filter((w) => w.userId === user?.id), [withdrawals, user?.id])
  if (!user) return null

  const referrals = users.filter((u) => u.referredBy === user.id)
  const referralEarnings = user.transactions.filter((t) => t.type === "referral").reduce((s, t) => s + t.amount, 0)
  const bank = user.banks.find((b) => b.id === bankId) ?? user.banks[0]
  const inviteLink = typeof window !== "undefined" ? `${window.location.origin}/signup?ref=${user.referralCode}` : ""

  const startWithdraw = () => {
    const value = Math.floor(Number(amount))
    if (!bank) return setError("Add a bank account first.")
    if (!value || value < MIN_WITHDRAWAL) return setError(`Minimum withdrawal is ${formatNaira(MIN_WITHDRAWAL)}.`)
    if (value > user.balance) return setError("Amount is more than your wallet balance.")
    setError(undefined)
    setOpen(false)
    confirmWithPin({
      title: "Confirm withdrawal",
      description: `Enter your PIN to withdraw ${formatNaira(value)} to ${bank.bankName} (${bank.accountNumber}).`,
      action: () => {
        requestWithdrawal(user.id, value, bank)
        setAmount("")
        toast.success("Withdrawal requested. Admin will process it shortly.")
      },
    })
  }

  const share = async () => {
    const text = `Sell your gift cards for Naira on CardNaira and get ${formatNaira(SIGNUP_BONUS)} signup bonus! Use my code ${user.referralCode}`
    if (navigator.share) {
      await navigator.share({ title: "CardNaira", text, url: inviteLink }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(`${text} ${inviteLink}`)
      toast.success("Invite link copied")
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-extrabold text-ink">Wallet</h1>

      <section className="rounded-3xl bg-brand p-5 text-white">
        <p className="text-xs font-medium uppercase tracking-wide text-white/70">Available balance</p>
        <p className="mt-1 text-4xl font-extrabold">{formatNaira(user.balance)}</p>
        <Button variant="accent" className="mt-5 w-full" size="lg" onClick={() => setOpen(true)}>
          <ArrowUpRight className="size-5" aria-hidden="true" /> Withdraw to bank
        </Button>
      </section>

      <Card className="flex flex-col gap-4" >
        <div id="referral" className="flex items-start gap-3 scroll-mt-20">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/20 text-brand">
            <Users className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-bold text-ink">Invite & earn {REFERRAL_PERCENT * 100}%</h2>
            <p className="text-sm text-muted text-pretty">
              Earn 1% of your friend&apos;s first trade. If they trade {formatNaira(50000)}, you get {formatNaira(500)}.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-surface px-4 py-3">
          <div>
            <p className="text-xs text-muted">Your code</p>
            <p className="font-mono text-lg font-bold tracking-wider text-brand">{user.referralCode}</p>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(user.referralCode).then(() => toast.success("Code copied"))}
            className="rounded-lg p-2 text-brand hover:bg-brand-light"
            aria-label="Copy referral code"
          >
            <Copy className="size-5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl border border-line p-3">
            <p className="text-xl font-bold text-ink">{referrals.length}</p>
            <p className="text-xs text-muted">Friends invited</p>
          </div>
          <div className="rounded-xl border border-line p-3">
            <p className="text-xl font-bold text-emerald-600">{formatNaira(referralEarnings)}</p>
            <p className="text-xs text-muted">Referral earnings</p>
          </div>
        </div>
        <Button variant="primary" onClick={share}>
          <Share2 className="size-4" aria-hidden="true" /> Share invite link
        </Button>
      </Card>

      {myWithdrawals.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-ink">Withdrawals</h2>
          <ul className="flex flex-col gap-2">
            {myWithdrawals.map((w) => (
              <li key={w.id} className="flex items-center justify-between rounded-2xl border border-line bg-white p-3">
                <div>
                  <p className="font-semibold text-ink">{formatNaira(w.amount)}</p>
                  <p className="text-xs text-muted">
                    {w.bank.bankName} · {formatDate(w.createdAt)}
                  </p>
                </div>
                <StatusBadge status={w.status} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-bold text-ink">Transactions</h2>
        <ul className="flex flex-col gap-2">
          {user.transactions.map((t) => (
            <li key={t.id} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3">
              <span className={`flex size-9 items-center justify-center rounded-full ${t.amount >= 0 ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                {t.amount >= 0 ? <ArrowDownLeft className="size-4" aria-hidden="true" /> : <ArrowUpRight className="size-4" aria-hidden="true" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{t.description}</p>
                <p className="text-xs text-muted">{formatDate(t.createdAt)}</p>
              </div>
              <p className={`font-bold ${t.amount >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {t.amount >= 0 ? "+" : "-"}
                {formatNaira(Math.abs(t.amount))}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <Modal open={open} onClose={() => setOpen(false)} title="Withdraw funds" description={`Balance: ${formatNaira(user.balance)}`}>
        {user.banks.length === 0 ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted">You need to add a bank account before withdrawing.</p>
            <Link href="/profile/bank" className="inline-flex h-11 items-center justify-center rounded-xl bg-brand font-semibold text-white">
              Add bank account
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Field label="Amount (₦)" htmlFor="wd-amount" hint={`Minimum ${formatNaira(MIN_WITHDRAWAL)}`} error={error}>
              <Input id="wd-amount" type="number" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 5000" />
            </Field>
            <Field label="To bank account" htmlFor="wd-bank">
              <Select id="wd-bank" value={bank?.id} onChange={(e) => setBankId(e.target.value)}>
                {user.banks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bankName} - {b.accountNumber}
                  </option>
                ))}
              </Select>
            </Field>
            <Button size="lg" onClick={startWithdraw}>
              Continue
            </Button>
          </div>
        )}
      </Modal>
      {pinDialog}
    </div>
  )
}
