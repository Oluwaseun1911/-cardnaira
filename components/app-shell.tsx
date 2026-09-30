"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { ArrowLeftRight, Home, Loader2, ScanLine, User as UserIcon, Wallet } from "lucide-react"
import { toast } from "sonner"
import { Logo } from "./logo"
import { Avatar } from "./ui"
import { CreatePinDialog } from "./pin-dialog"
import { setPin, useCurrentUser } from "@/lib/db"
import { useHydrated } from "@/lib/storage"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/trades", label: "Trades", icon: ArrowLeftRight },
  { href: "/sell", label: "Sell", icon: ScanLine, primary: true },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/profile", label: "Profile", icon: UserIcon },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated()
  const user = useCurrentUser()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (hydrated && !user) router.replace("/login")
  }, [hydrated, user, router])

  if (!hydrated || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="size-8 animate-spin text-brand" aria-label="Loading" />
      </div>
    )
  }

  return (
    <div className="min-h-dvh pb-24">
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/dashboard" aria-label="CardNaira home">
            <Logo />
          </Link>
          <Link href="/profile" aria-label="Your profile">
            <Avatar src={user.avatar} name={user.fullName} size={36} />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-5">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white pb-[env(safe-area-inset-bottom)]" aria-label="Main">
        <ul className="mx-auto flex max-w-2xl items-end justify-around px-2">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2 text-[11px] font-semibold",
                    active ? "text-brand" : "text-muted",
                  )}
                >
                  {item.primary ? (
                    <span className="-mt-6 flex size-13 items-center justify-center rounded-full bg-accent text-brand shadow-lg ring-4 ring-white">
                      <item.icon className="size-6" aria-hidden="true" />
                    </span>
                  ) : (
                    <item.icon className="size-5" aria-hidden="true" />
                  )}
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <CreatePinDialog
        open={!user.pinHash}
        onClose={() => {}}
        onCreate={async (pin) => {
          await setPin(user.id, pin)
          toast.success("Transaction PIN created")
        }}
      />
    </div>
  )
}
