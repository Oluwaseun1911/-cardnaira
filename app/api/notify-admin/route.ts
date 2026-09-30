import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { trade } = await req.json()
    console.log("NEW TRADE:", trade)
    
    // For now just log - we will add Resend email after
    // You will see notification in Vercel logs
    
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
