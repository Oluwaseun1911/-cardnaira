import Link from "next/link"
import { BadgeCheck, Gift, ShieldCheck, Zap } from "lucide-react"
import { Logo } from "@/components/logo"
import { LandingRates } from "@/components/landing-rates"
import { SessionRedirect } from "@/components/session-redirect"

const features = [
  { icon: Zap, title: "Fast payouts", text: "Get paid to your Nigerian bank account once your card is confirmed." },
  { icon: ShieldCheck, title: "PIN protected", text: "Every trade, bank change and withdrawal is secured with your 4-digit PIN." },
  { icon: Gift, title: "₦1,000 welcome bonus", text: "Sign up today and get ₦1,000 in your wallet instantly." },
  { icon: BadgeCheck, title: "Earn 1% on referrals", text: "Invite friends and earn 1% of their first trade." },
]

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-white">
      <SessionRedirect />
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link href="/login" className="rounded-xl px-3 py-2 text-sm font-semibold text-brand hover:bg-brand-light">
            Log in
          </Link>
          <Link href="/signup" className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
            Sign up
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-5xl px-4 pb-10 pt-6 md:pt-14">
        <div className="overflow-hidden rounded-3xl bg-brand px-6 py-10 text-white md:px-12 md:py-16">
          <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-bold text-ink">Steam Euro now ₦1,100 / €1</span>
          <h1 className="mt-4 max-w-xl text-3xl font-extrabold leading-tight text-balance md:text-5xl">
            Turn your gift cards into <span className="text-accent">Naira</span> in minutes
          </h1>
          <p className="mt-4 max-w-lg text-white/80 text-pretty">
            Sell Steam, Amazon, Apple, Google Play and more at the best rates in Nigeria. Upload your card, confirm with your PIN and get paid.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="inline-flex h-12 items-center justify-center rounded-xl bg-accent px-6 font-bold text-ink hover:bg-accent-dark">
              Get ₦1,000 bonus
            </Link>
            <Link href="/login" className="inline-flex h-12 items-center justify-center rounded-xl border border-white/30 px-6 font-semibold text-white hover:bg-white/10">
              I have an account
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-3 px-4 pb-10 sm:grid-cols-2 md:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl border border-line p-4">
            <f.icon className="size-6 text-brand" aria-hidden="true" />
            <h2 className="mt-3 font-bold text-ink">{f.title}</h2>
            <p className="mt-1 text-sm text-muted text-pretty">{f.text}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <h2 className="mb-4 text-xl font-bold text-ink">Today&apos;s rates</h2>
        <LandingRates />
      </section>

      <footer className="border-t border-line py-6 text-center text-xs text-muted">
        {"© 2026 CardNaira. All rights reserved."}
      </footer>
    </main>
  )
}
