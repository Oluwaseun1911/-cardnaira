"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Gift } from "lucide-react"
import { toast } from "sonner"
import { Button, Field, Input } from "@/components/ui"
import { signUp, SIGNUP_BONUS } from "@/lib/db"
import { formatNaira } from "@/lib/utils"

export function SignupForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const password = String(data.get("password"))
    const phone = String(data.get("phone")).replace(/\D/g, "")
    if (!/^0\d{10}$/.test(phone) && !/^234\d{10}$/.test(phone)) {
      setError("Enter a valid Nigerian phone number, e.g. 08012345678.")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    setLoading(true)
    setError(undefined)
    try {
      await signUp({
        fullName: String(data.get("fullName")),
        email: String(data.get("email")),
        phone,
        password,
        referralCode: String(data.get("referralCode") || ""),
      })
      toast.success(`Account created! ${formatNaira(SIGNUP_BONUS)} bonus added to your wallet.`)
      router.replace("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed.")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Create your account</h1>
        <p className="mt-1 text-sm text-muted">Start selling gift cards for Naira today.</p>
      </div>
      <div className="flex items-center gap-3 rounded-2xl bg-accent/20 p-3">
        <Gift className="size-6 shrink-0 text-brand" aria-hidden="true" />
        <p className="text-sm font-semibold text-ink">Get {formatNaira(SIGNUP_BONUS)} signup bonus instantly</p>
      </div>
      <Field label="Full name" htmlFor="fullName">
        <Input id="fullName" name="fullName" autoComplete="name" required minLength={3} placeholder="e.g. Oluwaseun Musibau" />
      </Field>
      <Field label="Email address" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </Field>
      <Field label="Phone number" htmlFor="phone">
        <Input id="phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel" required placeholder="08012345678" />
      </Field>
      <Field label="Password" htmlFor="password" hint="At least 6 characters">
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={6} placeholder="Create a password" />
      </Field>
      <Field label="Referral code (optional)" htmlFor="referralCode">
        <Input id="referralCode" name="referralCode" defaultValue={params.get("ref") ?? ""} placeholder="e.g. OLUW1234" className="uppercase" />
      </Field>
      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" loading={loading}>
        Create account
      </Button>
      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Log in
        </Link>
      </p>
    </form>
  )
}
