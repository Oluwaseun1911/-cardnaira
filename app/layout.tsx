import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { Toaster } from "sonner"
import { ServiceWorkerRegister } from "@/components/sw-register"
import "./globals.css"

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" })

export const metadata: Metadata = {
  title: "CardNaira - Sell Gift Cards for Naira Instantly",
  description:
    "Sell Steam, Amazon, Apple, Google Play and more gift cards at the best rates in Nigeria. Fast payouts straight to your bank account.",
  applicationName: "CardNaira",
  appleWebApp: { capable: true, title: "CardNaira", statusBarStyle: "default" },
}

export const viewport: Viewport = {
  themeColor: "#0D47A1",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jakarta.variable} bg-surface`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-center" richColors />
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
