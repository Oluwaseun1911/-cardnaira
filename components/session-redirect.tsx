"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/lib/db"

export function SessionRedirect() {
  const user = useCurrentUser()
  const router = useRouter()
  useEffect(() => {
    if (user) router.replace("/dashboard")
  }, [user, router])
  return null
}
