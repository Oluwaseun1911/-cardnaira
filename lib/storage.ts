"use client"

import { useSyncExternalStore } from "react"

type Listener = () => void

const listeners = new Set<Listener>()
const cache = new Map<string, { raw: string | null; value: unknown }>()
let storageListenerAttached = false

function emit() {
  listeners.forEach((listener) => listener())
}

export function subscribe(listener: Listener) {
  listeners.add(listener)
  if (!storageListenerAttached && typeof window !== "undefined") {
    // Keeps other open tabs (e.g. the admin panel) in sync with writes from customer tabs.
    window.addEventListener("storage", emit)
    storageListenerAttached = true
  }
  return () => {
    listeners.delete(listener)
  }
}

export function readKey<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  const raw = window.localStorage.getItem(key)
  const cached = cache.get(key)
  if (cached && cached.raw === raw) return cached.value as T
  let value: T = fallback
  if (raw) {
    try {
      value = JSON.parse(raw) as T
    } catch {
      value = fallback
    }
  }
  cache.set(key, { raw, value })
  return value
}

export function writeKey<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      throw new Error("Device storage is full. Please delete old trades or use a smaller image.")
    }
    throw error
  }
  emit()
}

export function removeKey(key: string) {
  window.localStorage.removeItem(key)
  emit()
}

export function useStoredValue<T>(key: string, fallback: T): T {
  return useSyncExternalStore(
    subscribe,
    () => readKey(key, fallback),
    () => fallback,
  )
}

const noopSubscribe = () => () => {}

export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )
}
