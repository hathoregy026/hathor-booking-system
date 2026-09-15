require('dotenv').config({quiet:true});
const {chromium}=require('playwright');const pg=require('pg');
(async()=>{const browser=await chromium.launch({headless:true});const page=await browser.newPage();let key;const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://localhost:3000/booking',{waitUntil:'domcontentloaded'});
 await page.getByLabel('Departure',{exact:true}).locator('option').nth(1).waitFor({state:'attached'});
 await page.getByLabel('Departure',{exact:true}).selectOption({label:'August 14, 2027 — August 18, 2027'});
 await page.getByLabel('Children',{exact:true}).fill('1');
 await page.getByRole('button',{name:'Check Availability',exact:true}).click();
 await page.getByRole('button',{name:'Select rooms & continue'}).click();
 key=await page.evaluate(()=>JSON.parse(localStorage.getItem('hathor-request-attempt-v2')).key);
 await page.getByLabel('Lead guest first name',{exact:true}).waitFor({timeout:60000});
 await page.getByLabel('Lead guest first name',{exact:true}).fill('QA');await page.getByLabel('Lead guest last name',{exact:true}).fill('Step Two Browser');await page.getByLabel('Email',{exact:true}).fill('delivered@resend.dev');await page.getByLabel('Phone with country code',{exact:true}).fill('+201234567890');await page.getByLabel('Country',{exact:true}).fill('Egypt');await page.getByLabel('Room 1 · Adult full name',{exact:true}).fill('QA Adult');await page.getByLabel('Room 1 · Child full name',{exact:true}).fill('QA Child');
 await page.getByRole('button',{name:'Continue to review',exact:true}).click();await page.getByLabel('Bank Transfer',{exact:true}).check();await page.getByRole('checkbox').check(); console.log('RESULT',(await page.locator('body').innerText()).slice(-5000));console.log('PAGEERRORS',errors);await page.screenshot({path:'_local/booking-step2-review.png',fullPage:true});
}finally{
 await browser.close();
 if(key){const c=new pg.Client({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false},connectionTimeoutMillis:8000,query_timeout:15000});try{await c.connect();const r=await c.query('DELETE FROM "Booking" b WHERE "idempotencyKey"=$1 AND NOT EXISTS(SELECT 1 FROM "BookingPayment" p WHERE p."bookingId"=b.id) RETURNING id',[key]);console.log('Synthetic browser reservations removed',r.rowCount);}finally{await c.end();}}
}})().catch(e=>{console.error(e.message);process.exitCode=1});
