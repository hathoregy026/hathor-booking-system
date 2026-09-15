"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function ReservationOperations({id,status}:{id:string;status:string}) {
 const router=useRouter();const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");
 async function act(body:unknown){setBusy(true);setMessage("");try{const r=await fetch(`/api/admin/bookings/${encodeURIComponent(id)}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw new Error(data.error??"Action failed");setMessage("Saved. Confirmation still requires acceptance and sufficient recorded payment.");router.refresh();}catch(e){setMessage(e instanceof Error?e.message:"Action failed");}finally{setBusy(false);}}
 return <section className="space-y-4"><p role="status">{message}</p>
 {status==="REQUESTED"&&<button disabled={busy} onClick={()=>void act({type:"accept"})}>Accept request</button>}
 {["REQUESTED","CONFIRMED","CANCELLED"].includes(status)&&<form className="space-y-3" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);const value=String(f.get("amount"));if(!/^\d+(\.\d{1,2})?$/.test(value)){setMessage("Enter a USD amount with at most two decimal places.");return;}const [whole,fraction=""]=value.split(".");void act({type:"record-payment",payment:{reference:f.get("reference"),method:f.get("method"),kind:f.get("kind"),amountCents:Number(whole)*100+Number(fraction.padEnd(2,"0")),receivedAt:new Date(String(f.get("date"))).toISOString()}});}}>
 <h2>Record a verified payment or refund</h2><p>This records money already received or refunded. It does not charge a card or move funds.</p>
 <label className="block">Unique bank / processor reference<input name="reference" minLength={6} maxLength={128} required /></label>
 <label className="block">Amount in USD<input name="amount" inputMode="decimal" required /></label>
 <label className="block">Received / refunded at<input name="date" type="datetime-local" required /></label>
 <label className="block">Method<select name="method"><option value="VISA">Visa</option><option value="BANK_TRANSFER">Bank Transfer</option></select></label>
 <label className="block">Entry<select name="kind">{status!=="CANCELLED"&&<option value="RECEIPT">Receipt</option>}{status==="CANCELLED"&&<option value="REFUND">Refund</option>}</select></label>
 <button disabled={busy}>Record verified payment</button></form>}
 {["PENDING_HOLD","REQUESTED","CONFIRMED"].includes(status)&&<form onSubmit={e=>{e.preventDefault();void act({type:"cancel",reason:new FormData(e.currentTarget).get("reason")});}}><label>Cancellation reason<select name="reason"><option value="CANCELLATION">Cancellation</option><option value="NO_SHOW">No-show</option><option value="EARLY_DEPARTURE">Early departure</option></select></label><button disabled={busy}>Cancel reservation and release cabins</button></form>}
 </section>;
}
