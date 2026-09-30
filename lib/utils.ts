export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
})

export function formatNaira(value: number) {
  return nairaFormatter.format(Math.round(value || 0))
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function uid(prefix = "") {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
      : Math.random().toString(36).slice(2, 14)
  return `${prefix}${random}`
}

export async function sha256(text: string) {
  const data = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export const ADMIN_WHATSAPP = "2348087904890"
export const ADMIN_WHATSAPP_DISPLAY = "08087904890"
export const ADMIN_EMAIL = "musibauoluwaseun1911@gmail.com"

export function whatsappLink(message: string) {
  return `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`
}

export function emailLink(subject: string, body: string) {
  return `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
