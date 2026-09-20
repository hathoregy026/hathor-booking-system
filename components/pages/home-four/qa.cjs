/* Run from repository root. Writes local-only evidence; does not submit forms. */
const { chromium, firefox, webkit } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const out=path.resolve('_local/home-4-evidence');fs.mkdirSync(out,{recursive:true});
const base=process.env.H4_BASE || 'http://127.0.0.1:3000';
const sizes=[[360,800],[375,667],[390,844],[430,932],[768,1024],[1024,1366],[1366,1024],[1280,720],[1440,900],[1920,1080],[949,900],[950,900],[951,900],[1280,580]];
const report=[];
async function capture(page,name){await page.screenshot({path:path.join(out,name+'.png')});}
async function audit(page,label){
  return page.evaluate(label=>{
    const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none';};
    const root=document.querySelector('.home-four');
    const sceneIndex=label.startsWith('scene-')?Number(label.slice(6)):null;
    const host=sceneIndex===null?root:root.querySelectorAll('.h4-scene')[sceneIndex];
    const text=[...host.querySelectorAll('h1,h2,h3,p,a,button')].filter(visible);
    const clipped=text.filter(e=>{const r=e.getBoundingClientRect();return sceneIndex!==null&&(r.top<76||r.left<-.5||r.right>innerWidth+.5||r.bottom>innerHeight-20)&&root.dataset.h4Horizontal==='true';}).map(e=>e.textContent.slice(0,100));
    const images=[...root.querySelectorAll('img')].filter(e=>{const r=e.getBoundingClientRect();return r.left<innerWidth&&r.right>0&&r.top<innerHeight&&r.bottom>0;});
    return {label,overflow:document.documentElement.scrollWidth>innerWidth+1,clipped,brokenImages:images.filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),horizontal:root.dataset.h4Horizontal,scroll:scrollY};
  },label);
}
async function focusScene(page,index,hold=0){
  await page.evaluate(({index,hold})=>{
    const root=document.querySelector('.home-four'),run=root.querySelector('.h4-run'),track=root.querySelector('.h4-track'),scene=root.querySelectorAll('.h4-scene')[index],atlas=root.querySelector('.h4-atlas');
    if(root.dataset.h4Horizontal==='true'){
      const travel=track.scrollWidth-innerWidth;
      const x=Math.min(travel,Math.max(0,scene.offsetLeft+(scene.offsetWidth-innerWidth)/2));
      const at=(atlas.offsetLeft+(atlas.offsetWidth-innerWidth)/2)*.74;
      const y=run.getBoundingClientRect().top+scrollY+x*.74+(x*.74>at+1?innerHeight*1.6:0)+(index===1?innerHeight*1.6*hold:0);
      scrollTo(0,y);
    }else scene.scrollIntoView({block:'start'});
  },{index,hold});
  await page.waitForTimeout(1100);
}
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 for(const [width,height] of sizes){
  const page=await browser.newPage({viewport:{width,height},isMobile:width<500,hasTouch:width<=1024});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/home-4',{waitUntil:'domcontentloaded',timeout:120000});await page.locator('.h4-intro').waitFor({timeout:120000});await page.waitForTimeout(2500);await page.evaluate(()=>document.fonts.ready);
  const key=width+'x'+height;await capture(page,key+'-00-hero');
  const samples=[await audit(page,'hero')];
  for(let i=0;i<6;i++){await focusScene(page,i,.5);await capture(page,key+'-0'+(i+1)+'-scene');samples.push(await audit(page,'scene-'+i));}
  await page.locator('#h4-invitation').evaluate(e=>e.scrollIntoView());await page.waitForTimeout(600);await capture(page,key+'-07-close');samples.push(await audit(page,'close'));
  await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));await page.waitForTimeout(400);await capture(page,key+'-08-footer');samples.push(await audit(page,'footer'));
  if(width<=950)await page.screenshot({path:path.join(out,key+'-complete.png'),fullPage:true});
  report.push({key,errors,samples});fs.writeFileSync(path.join(out,'layout-results.json'),JSON.stringify(report,null,2));
  console.log(key,JSON.stringify({errors,issues:samples.filter(s=>s.overflow||s.clipped.length||s.brokenImages.length)}));await page.close();
 }
 await browser.close();
 if(process.env.H4_CHROMIUM_ONLY==='1') return;
 for(const [name,engine]of Object.entries({firefox,webkit})){
  try{const b=await engine.launch({headless:true});for(const [width,height] of [[1440,900],[390,844],[768,1024]]){const p=await b.newPage({viewport:{width,height}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'/home-4');await p.locator('.h4-intro').waitFor({timeout:120000});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(2500);const key=name+'-'+width;await capture(p,key+'-hero');const samples=[];for(let i=0;i<6;i++){await focusScene(p,i,.5);await capture(p,key+'-scene-'+i);samples.push(await audit(p,'scene-'+i));}await p.locator('#h4-invitation').evaluate(e=>e.scrollIntoView());await capture(p,key+'-close');report.push({key,errors,samples});fs.writeFileSync(path.join(out,'layout-results.json'),JSON.stringify(report,null,2));console.log(key,JSON.stringify({errors,issues:samples.filter(s=>s.overflow||s.clipped.length||s.brokenImages.length)}));await p.close();}await b.close();}catch(e){console.log(name,'UNAVAILABLE',e.message.split('\n')[0]);}
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
