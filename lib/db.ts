"use client"

import { readKey, useStoredValue, writeKey, removeKey } from "./storage"
import type {
  AdminNotification,
  BankAccount,
  Rate,
  Trade,
  TradeStatus,
  User,
  WalletTransaction,
  Withdrawal,
} from "./types"
import { sha256, uid } from "./utils"

export const KEYS = {
  users: "cardnaira_users",
  session: "cardnaira_session",
  trades: "cardnaira_trades",
  rates: "cardnaira_rates",
  withdrawals: "cardnaira_withdrawals",
  notifications: "cardnaira_admin_notifications",
  adminPassword: "cardnaira_admin_password",
} as const

export const SIGNUP_BONUS = 1000
export const REFERRAL_PERCENT = 0.01
export const MIN_WITHDRAWAL = 1000
const DEFAULT_ADMIN_PASSWORD = "admin1234"

const now = () => new Date().toISOString()

function rate(card: string, country: string, currency: string, symbol: string, value: number): Rate {
  return {
    id: `${card}-${country}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    card,
    country,
    currency,
    symbol,
    rate: value,
    updatedAt: "2026-09-30T00:00:00.000Z",
  }
}

export const DEFAULT_RATES: Rate[] = [
  rate("Steam", "USA", "USD", "$", 1250),
  rate("Steam", "Euro", "EUR", "€", 1100),
  rate("Steam", "UK", "GBP", "£", 1350),
  rate("Steam", "Canada", "CAD", "C$", 850),
  rate("Amazon", "USA", "USD", "$", 1000),
  rate("Amazon", "UK", "GBP", "£", 1150),
  rate("Apple / iTunes", "USA", "USD", "$", 1150),
  rate("Apple / iTunes", "UK", "GBP", "£", 1300),
  rate("Google Play", "USA", "USD", "$", 900),
  rate("Razer Gold", "USA", "USD", "$", 1050),
  rate("Sephora", "USA", "USD", "$", 950),
  rate("Nordstrom", "USA", "USD", "$", 900),
  rate("eBay", "USA", "USD", "$", 850),
  rate("Walmart", "USA", "USD", "$", 850),
  rate("Xbox", "USA", "USD", "$", 800),
  rate("Vanilla Visa", "USA", "USD", "$", 800),
  rate("American Express", "USA", "USD", "$", 900),
  rate("Footlocker", "USA", "USD", "$", 800),
]

const EMPTY_USERS: User[] = []
const EMPTY_TRADES: Trade[] = []
const EMPTY_WITHDRAWALS: Withdrawal[] = []
const EMPTY_NOTIFICATIONS: AdminNotification[] = []

// ---------- Hooks ----------

export function useUsers() {
  return useStoredValue<User[]>(KEYS.users, EMPTY_USERS)
}

export function useSessionId() {
  return useStoredValue<string | null>(KEYS.session, null)
}

export function useCurrentUser() {
  const users = useUsers()
  const sessionId = useSessionId()
  return users.find((u) => u.id === sessionId) ?? null
}

export function useTrades() {
  return useStoredValue<Trade[]>(KEYS.trades, EMPTY_TRADES)
}

export function useRates() {
  return useStoredValue<Rate[]>(KEYS.rates, DEFAULT_RATES)
}

export function useWithdrawals() {
  return useStoredValue<Withdrawal[]>(KEYS.withdrawals, EMPTY_WITHDRAWALS)
}

export function useNotifications() {
  return useStoredValue<AdminNotification[]>(KEYS.notifications, EMPTY_NOTIFICATIONS)
}

// ---------- Internal helpers ----------

const getUsers = () => readKey<User[]>(KEYS.users, EMPTY_USERS)
const getTrades = () => readKey<Trade[]>(KEYS.trades, EMPTY_TRADES)
const getWithdrawals = () => readKey<Withdrawal[]>(KEYS.withdrawals, EMPTY_WITHDRAWALS)
const getNotifications = () => readKey<AdminNotification[]>(KEYS.notifications, EMPTY_NOTIFICATIONS)

function saveUsers(users: User[]) {
  writeKey(KEYS.users, users)
}

function updateUser(userId: string, updater: (user: User) => User) {
  const users = getUsers()
  const index = users.findIndex((u) => u.id === userId)
  if (index === -1) throw new Error("User not found.")
  const next = [...users]
  next[index] = updater(users[index])
  saveUsers(next)
  return next[index]
}

function tx(type: WalletTransaction["type"], amount: number, description: string): WalletTransaction {
  return { id: uid("tx_"), type, amount, description, createdAt: now() }
}

function pushNotification(n: Omit<AdminNotification, "id" | "read" | "createdAt">) {
  const list = getNotifications()
  writeKey(KEYS.notifications, [{ ...n, id: uid("n_"), read: false, createdAt: now() }, ...list].slice(0, 200))
}

function makeReferralCode(name: string) {
  const base = name.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase() || "CARD"
  return `${base}${Math.floor(1000 + Math.random() * 9000)}`
}

// ---------- Auth ----------

export async function signUp(input: {
  fullName: string
  email: string
  phone: string
  password: string
  referralCode?: string
}) {
  const users = getUsers()
  const email = input.email.trim().toLowerCase()
  const phone = input.phone.replace(/\D/g, "")
  if (users.some((u) => u.email === email)) throw new Error("An account with this email already exists.")
  if (users.some((u) => u.phone === phone)) throw new Error("An account with this phone number already exists.")

  const code = input.referralCode?.trim().toUpperCase()
  const referrer = code ? users.find((u) => u.referralCode === code) : undefined
  if (code && !referrer) throw new Error("That referral code is not valid.")

  const user: User = {
    id: uid("u_"),
    fullName: input.fullName.trim(),
    email,
    phone,
    passwordHash: await sha256(input.password),
    pinHash: null,
    avatar: null,
    balance: SIGNUP_BONUS,
    referralCode: makeReferralCode(input.fullName),
    referredBy: referrer?.id ?? null,
    referralBonusPaid: false,
    banks: [],
    transactions: [tx("signup_bonus", SIGNUP_BONUS, "Welcome signup bonus")],
    createdAt: now(),
  }
  saveUsers([...users, user])
  writeKey(KEYS.session, user.id)
  return user
}

export async function logIn(identifier: string, password: string) {
  const id = identifier.trim().toLowerCase()
  const digits = id.replace(/\D/g, "")
  const user = getUsers().find((u) => u.email === id || (digits.length >= 10 && u.phone === digits))
  if (!user || user.passwordHash !== (await sha256(password))) {
    throw new Error("Incorrect email/phone or password.")
  }
  writeKey(KEYS.session, user.id)
  return user
}

export function logOut() {
  removeKey(KEYS.session)
}

// ---------- PIN ----------

export async function setPin(userId: string, pin: string) {
  if (!/^\d{4}$/.test(pin)) throw new Error("PIN must be exactly 4 digits.")
  const pinHash = await sha256(`${userId}:${pin}`)
  updateUser(userId, (u) => ({ ...u, pinHash }))
}

export async function verifyPin(userId: string, pin: string) {
  const user = getUsers().find((u) => u.id === userId)
  if (!user?.pinHash) return false
  return user.pinHash === (await sha256(`${userId}:${pin}`))
}

// ---------- Profile ----------

export function updateProfile(userId: string, data: Partial<Pick<User, "fullName" | "avatar">>) {
  return updateUser(userId, (u) => ({ ...u, ...data }))
}

export function saveBank(userId: string, bank: Omit<BankAccount, "id" | "createdAt">, bankId?: string) {
  return updateUser(userId, (u) => {
    if (bankId) {
      return { ...u, banks: u.banks.map((b) => (b.id === bankId ? { ...b, ...bank } : b)) }
    }
    return { ...u, banks: [...u.banks, { ...bank, id: uid("b_"), createdAt: now() }] }
  })
}

export function deleteBank(userId: string, bankId: string) {
  return updateUser(userId, (u) => ({ ...u, banks: u.banks.filter((b) => b.id !== bankId) }))
}

// ---------- Trades ----------

export function submitTrade(input: Omit<Trade, "id" | "status" | "createdAt" | "updatedAt">) {
  const trade: Trade = { ...input, id: uid("TRD"), status: "pending", createdAt: now(), updatedAt: now() }
  writeKey(KEYS.trades, [trade, ...getTrades()])
  pushNotification({
    type: "trade",
    refId: trade.id,
    title: "New trade submitted",
    message: `${trade.userName} submitted ${trade.symbol}${trade.amount} ${trade.cardName} (${trade.country})`,
  })
  return trade
}

export function setTradeStatus(tradeId: string, status: TradeStatus, note?: string) {
  const trades = getTrades()
  const trade = trades.find((t) => t.id === tradeId)
  if (!trade) throw new Error("Trade not found.")
  const wasPaid = trade.status === "paid"
  writeKey(
    KEYS.trades,
    trades.map((t) => (t.id === tradeId ? { ...t, status, note: note ?? t.note, updatedAt: now() } : t)),
  )

  if (status === "paid" && !wasPaid) {
    const customer = getUsers().find((u) => u.id === trade.userId)
    if (customer?.referredBy && !customer.referralBonusPaid) {
      const reward = Math.round(trade.nairaValue * REFERRAL_PERCENT)
      updateUser(customer.referredBy, (u) => ({
        ...u,
        balance: u.balance + reward,
        transactions: [tx("referral", reward, `1% referral bonus from ${customer.fullName}'s first trade`), ...u.transactions],
      }))
      updateUser(customer.id, (u) => ({ ...u, referralBonusPaid: true }))
    }
  }
}

export function deleteTrade(tradeId: string) {
  writeKey(
    KEYS.trades,
    getTrades().filter((t) => t.id !== tradeId),
  )
}

// ---------- Withdrawals ----------

export function requestWithdrawal(userId: string, amount: number, bank: BankAccount) {
  const user = getUsers().find((u) => u.id === userId)
  if (!user) throw new Error("User not found.")
  if (!Number.isFinite(amount) || amount < MIN_WITHDRAWAL) throw new Error(`Minimum withdrawal is ₦${MIN_WITHDRAWAL.toLocaleString()}.`)
  if (amount > user.balance) throw new Error("Insufficient wallet balance.")

  updateUser(userId, (u) => ({
    ...u,
    balance: u.balance - amount,
    transactions: [tx("withdrawal", -amount, `Withdrawal to ${bank.bankName}`), ...u.transactions],
  }))
  const withdrawal: Withdrawal = {
    id: uid("WD"),
    userId,
    userName: user.fullName,
    userPhone: user.phone,
    amount,
    bank,
    status: "pending",
    createdAt: now(),
    updatedAt: now(),
  }
  writeKey(KEYS.withdrawals, [withdrawal, ...getWithdrawals()])
  pushNotification({
    type: "withdrawal",
    refId: withdrawal.id,
    title: "New withdrawal request",
    message: `${user.fullName} requested ₦${amount.toLocaleString()} to ${bank.bankName}`,
  })
  return withdrawal
}

export function setWithdrawalStatus(id: string, status: TradeStatus) {
  const list = getWithdrawals()
  const w = list.find((x) => x.id === id)
  if (!w || w.status !== "pending") return
  writeKey(
    KEYS.withdrawals,
    list.map((x) => (x.id === id ? { ...x, status, updatedAt: now() } : x)),
  )
  if (status === "rejected") {
    updateUser(w.userId, (u) => ({
      ...u,
      balance: u.balance + w.amount,
      transactions: [tx("refund", w.amount, "Refund for rejected withdrawal"), ...u.transactions],
    }))
  }
}

// ---------- Rates ----------

export function saveRates(rates: Rate[]) {
  writeKey(KEYS.rates, rates)
}

// ---------- Admin ----------

export async function verifyAdminPassword(password: string) {
  const stored = readKey<string | null>(KEYS.adminPassword, null)
  const hash = await sha256(password)
  if (stored) return stored === hash
  return password === DEFAULT_ADMIN_PASSWORD
}

export async function changeAdminPassword(current: string, next: string) {
  if (!(await verifyAdminPassword(current))) throw new Error("Current password is incorrect.")
  if (next.length < 6) throw new Error("New password must be at least 6 characters.")
  writeKey(KEYS.adminPassword, await sha256(next))
}

export function markNotificationsRead() {
  writeKey(
    KEYS.notifications,
    getNotifications().map((n) => ({ ...n, read: true })),
  )
}

export function clearNotifications() {
  writeKey(KEYS.notifications, [])
}
