import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { trade } = await req.json()

    await resend.emails.send({
      from: "CardNaira <onboarding@resend.dev>",
      to: "musibauoluwaseun1911@gmail.com",
      subject: `NEW SALE: ${trade.cardName} $${trade.amount}`,
      html: `
        <h2>🔥 New Gift Card Order</h2>
        <p><b>Name:</b> ${trade.userName}</p>
        <p><b>Email:</b> ${trade.userEmail}</p>
        <p><b>Phone:</b> ${trade.userPhone}</p>
        <p><b>Card:</b> ${trade.cardName} (${trade.country})</p>
        <p><b>Amount:</b> $${trade.amount}</p>
        <p><b>Naira:</b> ₦${trade.nairaValue}</p>
        <p><b>ID:</b> ${trade.id}</p>
        <p>Go approve in admin panel!</p>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
