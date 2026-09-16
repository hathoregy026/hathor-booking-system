import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { prisma, resetDbConnectionHard } from '../lib/prisma';
import { acquireBookingHold, submitBookingRequest, administerBooking, paymentSchedule, cancellationFee } from '../lib/booking-engine';
import { getSailingAvailability } from '../lib/availability-service';

const keys: string[]=[];
async function hold(schedule:string,type='Royal Suite',count=1,children=0) {
 const key='qa-step2-'+randomUUID(); keys.push(key);
 return acquireBookingHold({cruiseScheduleId:schedule,idempotencyKey:key,rooms:Array.from({length:count},()=>({roomType:type as 'Royal Suite',adults:1,children}))});
}
async function clean(){await prisma.booking.deleteMany({where:{idempotencyKey:{in:keys}}});}
async function main(){
 const prior=await prisma.booking.findMany({where:{idempotencyKey:{startsWith:'qa-step2-'}},select:{idempotencyKey:true,payments:{select:{id:true}}}});
 if(prior.some(b=>b.payments.length))throw new Error('Unexpected committed QA ledger');
 keys.push(...prior.map(b=>b.idempotencyKey!));await clean();

 const sails=await prisma.cruiseSchedule.findMany({where:{isBookable:true,departureTime:{gte:new Date('2026-10-17'),lte:new Date('2026-10-21')}},include:{cruise:true}});
 const four=sails.find(s=>s.cruise.slug==='4-nights-luxor-aswan')!;
 const seven=sails.find(s=>s.cruise.slug==='7-nights-luxor-aswan-luxor')!;
 const three=sails.find(s=>s.cruise.slug==='3-nights-aswan-luxor')!;
 console.log('Sailings',sails.map(s=>[s.cruise.slug,s.departureTime.toISOString()]));
 assert(four&&seven&&three,'Need aligned existing sailings');
 for(const [type,total] of [['Luxury King Cabin',6],['Royal Suite',2]] as const){
  await hold(four.id,type,total-1);
  const race=await Promise.allSettled([hold(four.id,type),hold(four.id,type)]);
  assert.equal(race.filter(r=>r.status==='fulfilled').length,1); console.log('PASS last-room race',type); await clean();
 }
 const a=await hold(four.id,'Royal Suite',2);const b=await hold(three.id,'Royal Suite',2);
 assert.deepEqual(a.bookingRooms.map(r=>r.roomId),b.bookingRooms.map(r=>r.roomId));
 await assert.rejects(hold(seven.id,'Royal Suite'));console.log('PASS separate 4N + 3N same rooms; 7N excluded');await clean();
 await hold(seven.id,'Royal Suite',2); await assert.rejects(hold(four.id));await assert.rejects(hold(three.id));console.log('PASS 7N blocks both sectors');await clean();
 await hold(four.id,'Royal Suite',1);const before=await prisma.booking.count();await assert.rejects(hold(four.id,'Royal Suite',2));assert.equal(await prisma.booking.count(),before);console.log('PASS atomic failure');await clean();
 const h=await hold(four.id,'Luxury King Cabin',1,1);assert.equal(h.totalPriceCents,400000);
 const replay=await acquireBookingHold({cruiseScheduleId:four.id,idempotencyKey:h.idempotencyKey!,rooms:[{roomType:'Luxury King Cabin',adults:1,children:1}]});assert.equal(replay.id,h.id);
 const guest={bookingId:h.id,firstName:'QA',lastName:'Synthetic',email:'delivered@resend.dev',phone:'+201234567890',country:'Egypt',paymentMethod:'BANK_TRANSFER' as const,specialRequests:'Synthetic core test',marketingOptIn:false,passengers:[{fullName:'QA Adult',isChild:false,roomIndex:0},{fullName:'QA Child',isChild:true,roomIndex:0}]};
 const request=await submitBookingRequest(guest,h.idempotencyKey!);assert.equal(request.booking.status,'REQUESTED');assert.equal(request.booking.holdExpiresAt,null);assert((await submitBookingRequest(guest,h.idempotencyKey!)).replay);
 assert.equal((await administerBooking(h.id,{type:'accept'})).status,'REQUESTED');await assert.rejects(prisma.booking.update({where:{id:h.id},data:{status:'CONFIRMED'}}));
 await administerBooking(h.id,{type:'cancel'});assert.equal(await prisma.inventoryAllocation.count({where:{bookingRoom:{bookingId:h.id},active:true}}),0);console.log('PASS children, price, retries, indefinite request, unpaid acceptance, cancellation');await clean();
 const exp=await hold(four.id);await prisma.booking.update({where:{id:exp.id},data:{holdExpiresAt:new Date(Date.now()-1000)}});await prisma.$queryRaw`SELECT hathor_expire_holds()`;assert.equal((await prisma.booking.findUniqueOrThrow({where:{id:exp.id}})).status,'EXPIRED');console.log('PASS expiry');await clean();
 const count=await prisma.cruiseSchedule.count();await getSailingAvailability({duration:'4-nights-luxor-aswan',adults:1,children:0,rooms:1});assert.equal(await prisma.cruiseSchedule.count(),count);console.log('PASS read-only availability');
 const dep=new Date('2027-01-01T00:00:00Z');for(const [days,pct] of [[61,.3],[60,.5],[46,.5],[45,1]] as const)assert.equal(paymentSchedule(100000,dep,new Date(+dep-days*86400000)).requiredCents,100000*pct);
 for(const [days,pct] of [[90,0],[89,.25],[61,.25],[60,.5],[46,.5],[45,1]] as const)assert.equal(cancellationFee(100000,dep,new Date(+dep-days*86400000)),100000*pct);console.log('PASS payment/cancellation boundaries');
}
main().finally(async()=>{await clean();await resetDbConnectionHard();}).catch(e=>{console.error(e.message);process.exitCode=1;});
