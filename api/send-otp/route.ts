import { NextResponse } from "next/server";
export async function POST(req: Request){
  const { email, purpose } = await req.json();
  const otp = Math.floor(100000 + Math.random()*900000).toString();
  console.log(`OTP ${otp} for ${email} - ${purpose}`);
  return NextResponse.json({ success: true, otp, message: `Code sent to ${email}` });
}
