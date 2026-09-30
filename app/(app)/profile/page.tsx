"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { Camera, ChevronRight, ImageIcon, KeyRound, Landmark, LogOut, Mail, Pencil, Phone, Wallet } from "lucide-react"
import { toast } from "sonner"
import { logOut, updateProfile, useCurrentUser } from "@/lib/db"
import { compressImage } from "@/lib/image"
import { formatNaira } from "@/lib/utils"
import { Avatar, Button, Card, Field, Input, Modal } from "@/components/ui"

export default function ProfilePage() {
  const user = useCurrentUser()
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [photoMenu, setPhotoMenu] = useState(false)
  const [name, setName] = useState("")
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  if (!user) return null

  const onPhoto = async (file: File | undefined) => {
    setPhotoMenu(false)
    if (!file) return
    try {
      updateProfile(user.id, { avatar: await compressImage(file, 320, 0.8) })
      toast.success("Profile photo updated")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update photo.")
    }
  }

  const saveName = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length < 3) return toast.error("Name must be at least 3 characters.")
    updateProfile(user.id, { fullName: trimmed })
    setEditing(false)
    toast.success("Name updated")
  }

  const links = [
    { href: "/profile/bank", label: "Bank accounts", sub: `${user.banks.length} saved`, icon: Landmark },
    { href: "/settings", label: "Transaction PIN", sub: "Change your 4-digit PIN", icon: KeyRound },
    { href: "/wallet", label: "Wallet & referrals", sub: formatNaira(user.balance), icon: Wallet },
  ]

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col items-center gap-3 rounded-3xl bg-brand px-5 py-6 text-center text-white">
        <div className="relative">
          <div className="rounded-full ring-4 ring-accent">
            <Avatar src={user.avatar} name={user.fullName} size={96} />
          </div>
          <button
            onClick={() => setPhotoMenu(true)}
            className="absolute bottom-0 right-0 flex size-9 items-center justify-center rounded-full bg-accent text-brand shadow ring-2 ring-white"
            aria-label="Change profile photo"
          >
            <Camera className="size-4" />
          </button>
        </div>
        <div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-xl font-extrabold">{user.fullName}</h1>
            <button
              onClick={() => {
                setName(user.fullName)
                setEditing(true)
              }}
              className="rounded-full p-1 text-accent hover:bg-white/10"
              aria-label="Edit full name"
            >
              <Pencil className="size-4" />
            </button>
          </div>
          <p className="text-sm text-white/70">Member since {new Date(user.createdAt).toLocaleDateString("en-NG", { month: "long", year: "numeric" })}</p>
        </div>
      </section>

      <Card className="flex flex-col divide-y divide-line p-0">
        <div className="flex items-center gap-3 p-4">
          <Mail className="size-5 text-brand" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs text-muted">Email</p>
            <p className="truncate font-semibold text-ink">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4">
          <Phone className="size-5 text-brand" aria-hidden="true" />
          <div>
            <p className="text-xs text-muted">Phone</p>
            <p className="font-semibold text-ink">{user.phone}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4">
          <Wallet className="size-5 text-brand" aria-hidden="true" />
          <div>
            <p className="text-xs text-muted">Wallet balance</p>
            <p className="font-bold text-emerald-600">{formatNaira(user.balance)}</p>
          </div>
        </div>
      </Card>

      <Card className="flex flex-col divide-y divide-line p-0">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="flex items-center gap-3 p-4 hover:bg-surface">
            <span className="flex size-10 items-center justify-center rounded-full bg-accent/20 text-brand">
              <l.icon className="size-5" aria-hidden="true" />
            </span>
            <div className="flex-1">
              <p className="font-semibold text-ink">{l.label}</p>
              <p className="text-xs text-muted">{l.sub}</p>
            </div>
            <ChevronRight className="size-5 text-muted" aria-hidden="true" />
          </Link>
        ))}
      </Card>

      <Button
        variant="outline"
        size="lg"
        className="text-red-600"
        onClick={() => {
          logOut()
          router.replace("/login")
        }}
      >
        <LogOut className="size-5" aria-hidden="true" /> Log out
      </Button>

      <input ref={cameraRef} type="file" accept="image/*" capture="user" className="sr-only" onChange={(e) => { onPhoto(e.target.files?.[0]); e.target.value = "" }} aria-label="Take profile photo" />
      <input ref={galleryRef} type="file" accept="image/*" className="sr-only" onChange={(e) => { onPhoto(e.target.files?.[0]); e.target.value = "" }} aria-label="Choose profile photo" />

      <Modal open={photoMenu} onClose={() => setPhotoMenu(false)} title="Profile photo">
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" size="lg" onClick={() => cameraRef.current?.click()}>
            <Camera className="size-5" aria-hidden="true" /> Camera
          </Button>
          <Button variant="outline" size="lg" onClick={() => galleryRef.current?.click()}>
            <ImageIcon className="size-5" aria-hidden="true" /> Gallery
          </Button>
        </div>
        {user.avatar && (
          <Button
            variant="ghost"
            className="mt-3 w-full text-red-600"
            onClick={() => {
              updateProfile(user.id, { avatar: null })
              setPhotoMenu(false)
            }}
          >
            Remove photo
          </Button>
        )}
      </Modal>

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit full name">
        <form onSubmit={saveName} className="flex flex-col gap-4">
          <Field label="Full name" htmlFor="edit-name">
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" autoFocus />
          </Field>
          <Button type="submit" size="lg">
            Save name
          </Button>
        </form>
      </Modal>
    </div>
  )
}
