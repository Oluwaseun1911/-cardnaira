export type BankAccount = {
  id: string
  bankName: string
  accountNumber: string
  accountName: string
  createdAt: string
}

export type WalletTransaction = {
  id: string
  type: "signup_bonus" | "referral" | "withdrawal" | "refund"
  amount: number
  description: string
  createdAt: string
}

export type User = {
  id: string
  fullName: string
  email: string
  phone: string
  passwordHash: string
  pinHash: string | null
  avatar: string | null
  balance: number
  referralCode: string
  referredBy: string | null
  referralBonusPaid: boolean
  banks: BankAccount[]
  transactions: WalletTransaction[]
  createdAt: string
}

export type TradeStatus = "pending" | "paid" | "rejected"

export type Trade = {
  id: string
  userId: string
  userName: string
  userPhone: string
  userEmail: string
  cardName: string
  country: string
  currency: string
  symbol: string
  amount: number
  rate: number
  nairaValue: number
  cardImage: string
  bank: BankAccount
  status: TradeStatus
  note?: string
  createdAt: string
  updatedAt: string
}

export type Rate = {
  id: string
  card: string
  country: string
  currency: string
  symbol: string
  rate: number
  updatedAt: string
}

export type Withdrawal = {
  id: string
  userId: string
  userName: string
  userPhone: string
  amount: number
  bank: BankAccount
  status: TradeStatus
  createdAt: string
  updatedAt: string
}

export type AdminNotification = {
  id: string
  type: "trade" | "withdrawal"
  refId: string
  title: string
  message: string
  read: boolean
  createdAt: string
}
