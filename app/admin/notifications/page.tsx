"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Bell, BellRing, CheckCheck, Mail, MessageCircle, Trash2, Volume2 } from "lucide-react"
import { toast } from "sonner"
import { clearNotifications, markNotificationsRead, useNotifications, useTrades, useWithdrawals } from "@/lib/db"
import { playNotificationSound } from "@/lib/admin-auth"
import { ADMIN_EMAIL, ADMIN_WHATSAPP_DISPLAY, cn, emailLink, formatDate, formatNaira, whatsappLink } from "@/lib/utils"
import type { AdminNotification } from "@/lib/types"
import { Button, Card, EmptyState } from "@/components/ui"

function useNotificationDetails() {
  const trades = useTrades()
  const withdrawals = useWithdrawals()
  return (n: AdminNotification) => {
    if (n.type === "trade") {
      const t = trades.find((x) => x.id === n.refId)
      if (!t) return n.message
      return `NEW CARDNAIRA TRADE\nID: ${t.id}\nCustomer: ${t.userName} (${t.userPhone})\nCard: ${t.cardName} ${t.country} ${t.symbol}${t.amount}\nRate: ${formatNaira(t.rate)}\nPay: ${formatNaira(t.nairaValue)}\nBank: ${t.bank.bankName} ${t.bank.accountNumber} ${t.bank.accountName}`
    }
    const w = withdrawals.find((x) => x.id === n.refId)
    if (!w) return n.message
    return `NEW CARDNAIRA WITHDRAWAL\nID: ${w.id}\nCustomer: ${w.userName} (${w.userPhone})\nAmount: ${formatNaira(w.amount)}\nBank: ${w.bank.bankName} ${w.bank.accountNumber} ${w.bank.accountName}`
  }
}

export default function AdminNotificationsPage() {
  const notifications = useNotifications()
  const details = useNotificationDetails()
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default")

  useEffect(() => {
    setPermission("Notification" in window ? Notification.permission : "unsupported")
  }, [])

  const enablePush = async () => {
    if (!("Notification" in window)) return
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === "granted") toast.success("Browser alerts enabled")
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-ink">Notifications</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markNotificationsRead} disabled={!notifications.some((n) => !n.read)}>
            <CheckCheck className="size-4" aria-hidden="true" /> Mark all read
          </Button>
          <Button
            variant="ghost"
            className="text-red-600"
            disabled={notifications.length === 0}
            onClick={() => confirm("Clear all notifications?") && clearNotifications()}
          >
            <Trash2 className="size-4" aria-hidden="true" /> Clear
          </Button>
        </div>
      </div>

      <Card className="flex flex-col gap-4">
        <h2 className="font-bold text-ink">Alert setup</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-emerald-50 p-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
              <MessageCircle className="size-4" aria-hidden="true" /> WhatsApp
            </p>
            <p className="font-mono text-ink">{ADMIN_WHATSAPP_DISPLAY}</p>
          </div>
          <div className="rounded-xl bg-brand-light p-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-brand">
              <Mail className="size-4" aria-hidden="true" /> Email
            </p>
            <p className="break-all text-ink">{ADMIN_EMAIL}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={playNotificationSound}>
            <Volume2 className="size-4" aria-hidden="true" /> Test sound
          </Button>
          {permission !== "unsupported" && (
            <Button variant={permission === "granted" ? "outline" : "accent"} onClick={enablePush} disabled={permission === "granted"}>
              <BellRing className="size-4" aria-hidden="true" /> {permission === "granted" ? "Browser alerts on" : "Enable browser alerts"}
            </Button>
          )}
        </div>
        <p className="text-xs text-muted text-pretty">
          Keep this admin panel open in a tab to hear a sound and see the bell update whenever a customer submits a trade. Use the buttons on each alert to send it to your WhatsApp or email.
        </p>
      </Card>

      {notifications.length === 0 ? (
        <EmptyState icon={<Bell className="size-5" />} title="No notifications" description="You'll be alerted here when customers submit trades or withdrawals." />
      ) : (
        <ul className="flex flex-col gap-2">
          {notifications.map((n) => {
            const body = details(n)
            return (
              <li key={n.id}>
                <Card className={cn("flex flex-col gap-3", !n.read && "border-l-4 border-l-accent")}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-ink">{n.title}</p>
                      <p className="text-sm text-muted">{n.message}</p>
                      <p className="mt-1 text-xs text-muted">{formatDate(n.createdAt)}</p>
                    </div>
                    {!n.read && <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-brand">New</span>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={whatsappLink(body)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 items-center gap-2 rounded-xl bg-emerald-600 px-3 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      <MessageCircle className="size-4" aria-hidden="true" /> Notify via WhatsApp
                    </a>
                    <a
                      href={emailLink(n.title, body)}
                      className="inline-flex h-9 items-center gap-2 rounded-xl bg-brand px-3 text-sm font-semibold text-white hover:bg-brand-dark"
                    >
                      <Mail className="size-4" aria-hidden="true" /> Notify via Email
                    </a>
                    <Link
                      href={n.type === "trade" ? "/admin/trades" : "/admin/withdrawals"}
                      className="inline-flex h-9 items-center rounded-xl border border-line px-3 text-sm font-semibold text-ink hover:bg-surface"
                    >
                      Open
                    </Link>
                  </div>
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
