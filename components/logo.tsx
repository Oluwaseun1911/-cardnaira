import Image from "next/image"
import { cn } from "@/lib/utils"

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image src="/icon-192.png" alt="" width={32} height={32} className="size-8 rounded-lg" priority />
      <span className={cn("text-lg font-extrabold tracking-tight", light ? "text-white" : "text-brand")}>
        Card<span className="text-accent">Naira</span>
      </span>
    </span>
  )
}
