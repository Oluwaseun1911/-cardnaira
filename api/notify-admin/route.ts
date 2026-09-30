import { NextResponse } from "next/server";
export async function POST(req: Request){
  const trade = await req.json();
  const msg = `🔔 NEW TRADE CardNaira: ${trade.name} - ${trade.cardType} $${trade.amount} - Email: ${trade.email} - Phone: ${trade.phone}`;
  const waLink = `https://wa.me/2348087904890?text=${encodeURIComponent(msg)}`;
  return NextResponse.json({ success: true, whatsappLink: waLink, adminEmail: "musibauoluwaseun1911@gmail.com" });
}
