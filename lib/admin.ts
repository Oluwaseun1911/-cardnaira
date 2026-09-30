// CARDNAIRA REAL TRADING SYSTEM - BY SEUN OLUWASEUN
// Admin: musibauoluwaseun1911@gmail.com / 08087904890

// ================= ADMIN CONFIG =================
export const ADMIN_EMAIL = "musibauoluwaseun1911@gmail.com";
export const ADMIN_WHATSAPP = "2348087904890";
export const ADMIN_PHONE_DISPLAY = "08087904890";
export const BONUS_AMOUNT = 1000;
export const MIN_WITHDRAW = 8000;
export const MAX_WITHDRAW = 500000;

// ================= 1. GMAIL OTP SYSTEM =================
// Use before Signup, Add Bank, Set PIN
export const generateOTP = () => Math.floor(100000 + Math.random()*900000).toString();

export function saveOTP(email: string, otp: string, purpose: "signup"|"bank"|"pin"){
  const data = { otp, email, purpose, expires: Date.now()+5*60*1000 };
  localStorage.setItem(`otp_${purpose}_${email}`, JSON.stringify(data));
  return otp;
}

export function verifyOTP(email: string, input: string, purpose: "signup"|"bank"|"pin"){
  const raw = localStorage.getItem(`otp_${purpose}_${email}`);
  if(!raw) return false;
  const d = JSON.parse(raw);
  if(Date.now() > d.expires) return false;
  return d.otp === input;
}

export function getOTPEmailContent(email: string, otp: string, purpose: string){
  return {
    to: email,
    subject: `CardNaira OTP for ${purpose} - ${otp}`,
    html: `<h2>CardNaira Verification</h2><p>Your code for <b>${purpose}</b> is <h1>${otp}</h1> Valid for 5 mins. Don't share.</p>`
  };
}

// ================= 2. NO FAKE MONEY - PENDING TRADE =================
export type TradeStatus = "PENDING" | "APPROVED" | "REJECTED";

export function createPendingTrade(data: any){
  return {
    id: `trade_${Date.now()}`,
    ...data,
    status: "PENDING" as TradeStatus,
    createdAt: new Date().toISOString(),
    willAddToBalance: false, // MONEY WILL NOT ADD UNTIL YOU APPROVE IN /admin
  };
}

// ================= 3. ADMIN NOTIFICATIONS - GMAIL + WHATSAPP =================
export function getWhatsAppAlertLink(trade: any){
  const msg = `🔔 NEW TRADE - CardNaira\nName: ${trade.name}\nPhone: ${trade.phone}\nCard: ${trade.cardType} $${trade.amount}\nNGN: ₦${trade.nairaAmount}\nEmail: ${trade.email}\nID: ${trade.id}\n\nApprove now: https://cardnaira-zeta.vercel.app/admin`;
  return `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(msg)}`;
}

export function getAdminEmailAlert(trade: any){
  return {
    to: ADMIN_EMAIL,
    subject: `🔔 NEW TRADE ${trade.cardType} - ${trade.id}`,
    html: `<h2>New Trade Needs Your Approval</h2><p><b>Customer:</b> ${trade.name} (${trade.phone})<br><b>Email:</b> ${trade.email}<br><b>Card:</b> ${trade.cardType} $${trade.amount} = ₦${trade.nairaAmount}</p><p><a href="https://cardnaira-zeta.vercel.app/admin">CLICK TO APPROVE IN ADMIN</a></p><p>WhatsApp also sent to ${ADMIN_PHONE_DISPLAY}</p>`
  };
}

// Send notification (call this after trade submit)
export async function notifyAdmin(trade: any){
  const waLink = getWhatsAppAlertLink(trade);
  // Open WhatsApp automatically to notify you
  window.open(waLink, "_blank");
  
  // For Gmail - call your API
  try{
    await fetch("/api/notify-admin", { method:"POST", body: JSON.stringify(trade) });
  }catch(e){ console.log("Admin notify queued", e); }
  
  return { whatsapp: waLink, email: ADMIN_EMAIL };
}

// ================= 4. BONUS LOCK + WITHDRAW LIMITS =================
export function canWithdrawBonus(user: any){
  const approved = (user?.approvedTradesCount || user?.totalApproved || 0);
  return approved >= 1;
}

export function checkWithdraw(amount: number, user: any, includesBonus: boolean){
  if(amount < MIN_WITHDRAW) return { ok: false, msg: `Minimum withdraw is ₦${MIN_WITHDRAW.toLocaleString()}` };
  if(amount > MAX_WITHDRAW) return { ok: false, msg: `Maximum withdraw is ₦${MAX_WITHDRAW.toLocaleString()}` };
  if(includesBonus && !canWithdrawBonus(user)){
    return { ok: false, msg: "Bonus ₦1,000 is locked: Trade 1 card before you can withdraw your bonus" };
  }
  return { ok: true, msg: "OK" };
}

// ================= CUSTOMER SIGNUP REQUIRED FIELDS =================
export function validateSignup(data: {name:string, email:string, phone:string}){
  if(!data.name || data.name.length < 3) return { ok:false, msg:"Enter full name" };
  if(!data.email || !data.email.includes("@")) return { ok:false, msg:"Valid Gmail required" };
  if(!data.phone || data.phone.length < 10) return { ok:false, msg:"Valid phone number required" };
  return { ok:true };
                 }
