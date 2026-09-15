import 'dotenv/config';
import {prisma,resetDbConnectionHard} from '../lib/prisma';
async function main(){
 console.log('outside',await prisma.$queryRaw`SELECT hathor_expire_holds()`);
 await prisma.$transaction(async tx=>{
 console.log('start');console.log(await tx.$queryRaw`SELECT set_config('idle_in_transaction_session_timeout','10s',true)`);
 console.log('lock',await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(734821901)`);
 console.log('expire',await tx.$queryRaw`SELECT hathor_expire_holds()`);
 console.log('read',await tx.booking.findUnique({where:{id:'nonexistent'}}));
 },{timeout:20000});
}
main().catch(e=>console.error(e.message)).finally(resetDbConnectionHard);
