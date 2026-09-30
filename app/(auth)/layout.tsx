import Link from "next/link"
import { Logo } from "@/components/logo"
import { SessionRedirect } from "@/components/session-redirect"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col bg-white">
      <SessionRedirect />
      <div className="bg-brand px-4 pb-16 pt-6">
        <div className="mx-auto max-w-md">
          <Link href="/" aria-label="CardNaira home">
            <Logo light />
          </Link>
        </div>
      </div>
      <div className="mx-auto -mt-10 w-full max-w-md flex-1 px-4 pb-10">
        <div className="rounded-3xl border border-line bg-white p-5 shadow-sm">{children}</div>
      </div>
    </main>
  )
}
