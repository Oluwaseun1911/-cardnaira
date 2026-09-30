"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Button, Field, Input } from "@/components/ui"
import { logIn } from "@/lib/db"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    setLoading(true)
    setError(undefined)
    try {
      const user = await logIn(String(data.get("identifier")), String(data.get("password")))
      toast.success(`Welcome back, ${user.fullName.split(" ")[0]}!`)
      router.replace("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">Log in to sell cards and track your trades.</p>
      </div>
      <Field label="Email or phone number" htmlFor="identifier">
        <Input id="identifier" name="identifier" autoComplete="username" required placeholder="you@example.com" />
      </Field>
      <Field label="Password" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" required placeholder="Your password" />
      </Field>
      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" loading={loading}>
        Log in
      </Button>
      <p className="text-center text-sm text-muted">
        New to CardNaira?{" "}
        <Link href="/signup" className="font-semibold text-brand hover:underline">
          Create account
        </Link>
      </p>
    </form>
  )
}
