"use client"

import { useSyncExternalStore } from "react"

const KEY = "cardnaira_admin_session"
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useAdminAuthed() {
  return useSyncExternalStore(
    subscribe,
    () => window.sessionStorage.getItem(KEY) === "1",
    () => false,
  )
}

export function setAdminAuthed(value: boolean) {
  if (value) window.sessionStorage.setItem(KEY, "1")
  else window.sessionStorage.removeItem(KEY)
  listeners.forEach((l) => l())
}

let audioCtx: AudioContext | null = null

export function playNotificationSound() {
  try {
    audioCtx ??= new AudioContext()
    const ctx = audioCtx
    ;[0, 0.18].forEach((offset, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.value = i === 0 ? 880 : 1320
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + offset)
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + offset + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + 0.25)
      osc.connect(gain).connect(ctx.destination)
      osc.start(ctx.currentTime + offset)
      osc.stop(ctx.currentTime + offset + 0.3)
    })
  } catch {
    // Audio can be blocked until the user interacts with the page.
  }
}

export function toCustomerWhatsapp(phone: string) {
  const digits = phone.replace(/\D/g, "")
  return digits.startsWith("0") ? `234${digits.slice(1)}` : digits
}
