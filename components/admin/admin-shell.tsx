"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { ArrowLeftRight, Bell, LayoutDashboard, Loader2, LogOut, Percent, Settings, Users, Wallet } from "lucide-react"
import { toast } from "sonner"
import { Logo } from "@/components/logo"
import { Button, Field, Input } from "@/components/ui"
import { useNotifications, verifyAdminPassword } from "@/lib/db"
import { playNotificationSound, setAdminAuthed, useAdminAuthed } from "@/lib/admin-auth"
import { useHydrated } from "@/lib/storage"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/trades", label: "Trades", icon: ArrowLeftRight },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: Wallet },
  { href: "/admin/rates", label: "Rates", icon: Percent },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/notifications", label: "Alerts", icon: Bell },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

function AdminLogin() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const ok = await verifyAdminPassword(password)
    setLoading(false)
    if (!ok) return setError("Incorrect admin password.")
    setAdminAuthed(true)
    playNotificationSound()
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-brand p-4">
      <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-5 rounded-3xl bg-white p-6 shadow-xl">
        <Logo />
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Admin login</h1>
          <p className="text-sm text-muted">Enter the admin password to manage CardNaira.</p>
        </div>
        <Field label="Password" htmlFor="admin-password" error={error}>
          <Input id="admin-password" type="password" autoComplete="current-password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Button type="submit" size="lg" loading={loading}>
          Log in
        </Button>
      </form>
    </main>
  )
}

function useNotificationAlerts() {
  const notifications = useNotifications()
  const unread = notifications.filter((n) => !n.read)
  const seen = useRef<Set<string> | null>(null)

  useEffect(() => {
    if (seen.current === null) {
      seen.current = new Set(notifications.map((n) => n.id))
      return
    }
    const fresh = notifications.filter((n) => !seen.current!.has(n.id))
    if (fresh.length === 0) return
    fresh.forEach((n) => seen.current!.add(n.id))
    playNotificationSound()
    const latest = fresh[0]
    toast.info(latest.title, { description: latest.message })
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(latest.title, { body: latest.message, icon: "/icon-192.png" })
    }
  }, [notifications])

  return unread.length
}

function AdminFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const unread = useNotificationAlerts()

  return (
    <div className="min-h-dvh bg-surface lg:flex">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-white p-4 lg:flex">
        <Logo />
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted">Admin panel</p>
        <nav className="mt-6 flex flex-col gap-1" aria-label="Admin">
          {nav.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold",
                  active ? "bg-brand text-white" : "text-ink hover:bg-surface",
                )}
              >
                <item.icon className="size-4" aria-hidden="true" />
                {item.label}
                {item.href === "/admin/notifications" && unread > 0 && (
                  <span className="ml-auto rounded-full bg-accent px-2 text-xs font-bold text-brand">{unread}</span>
                )}
              </Link>
            )
          })}
        </nav>
        <button onClick={() => setAdminAuthed(false)} className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">
          <LogOut className="size-4" aria-hidden="true" /> Log out
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-2 lg:hidden">
              <Logo />
              <span className="rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand">Admin</span>
            </div>
            <p className="hidden text-sm font-semibold text-muted lg:block">CardNaira control center</p>
            <div className="flex items-center gap-1">
              <Link href="/admin/notifications" className="relative rounded-full p-2 text-brand hover:bg-brand-light" aria-label={`Notifications, ${unread} unread`}>
                <Bell className="size-5" />
                {unread > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </Link>
              <button onClick={() => setAdminAuthed(false)} className="rounded-full p-2 text-red-600 hover:bg-red-50 lg:hidden" aria-label="Log out">
                <LogOut className="size-5" />
              </button>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-2 lg:hidden" aria-label="Admin">
            {nav.map((item) => {
              const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
                    active ? "bg-brand text-white" : "bg-surface text-ink",
                  )}
                >
                  <item.icon className="size-3.5" aria-hidden="true" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </header>
        <main className="mx-auto w-full max-w-6xl p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated()
  const authed = useAdminAuthed()
  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="size-8 animate-spin text-brand" aria-label="Loading" />
      </div>
    )
  }
  return authed ? <AdminFrame>{children}</AdminFrame> : <AdminLogin />
}
