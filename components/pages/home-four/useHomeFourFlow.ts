"use client";
import { useEffect, type RefObject } from "react";
import { editorialFlipProgress } from "@/lib/editorial-flip-progress";

const clamp = (n: number) => Math.max(0, Math.min(1, n));

/** One event-driven painter owns the hero, horizontal story, and river passage. */
export function useHomeFourFlow(ref: RefObject<HTMLDivElement | null>, staticView: boolean) {
  useEffect(() => {
    const mounted = ref.current;
    if (!mounted) return;
    const root: HTMLDivElement = mounted;
    const run = root.querySelector<HTMLElement>(".h4-run")!;
    const track = root.querySelector<HTMLElement>(".h4-track")!;
    const scenes = [...root.querySelectorAll<HTMLElement>(".h4-scene")];
    const atlas = root.querySelector<HTMLElement>(".h4-atlas")!;
    const course = root.querySelector<SVGPathElement>(".h4-course")!;
    const vessel = root.querySelector<SVGGElement>(".h4-vessel")!;
    const stops = [...root.querySelectorAll<HTMLElement>("[data-h4-stop]")];
    const details = [...root.querySelectorAll<HTMLElement>(".h4-stop-detail")];
    const marks = [...root.querySelectorAll<SVGGElement>(".h4-map-place")];
    const heroRun = root.querySelector<HTMLElement>(".h4-hero-run")!;
    const heroCopy = root.querySelector<HTMLElement>(".h4-hero-copy")!;
    const logo = root.querySelector<HTMLElement>(".h4-logo")!;
    const letters = [...logo.querySelectorAll<HTMLElement>(".logo-letter-wrap")];
    const stripes = [...root.querySelectorAll<HTMLElement>(".h4-stripes i")];
    const progress = root.querySelector<HTMLElement>(".h4-progress i")!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false, frame = 0, horizontal = false, motion = false;
    let travel = 1, distance = 1, hold = 0, holdAt = 0, current = 0, target = 0;
    let manual: number | null = null;
    let previousScroll = scrollY;
    const length = course.getTotalLength();
    const born = performance.now();

    function paintMap(p: number) {
      course.style.strokeDasharray = `${length}`;
      course.style.strokeDashoffset = `${length * (1-p)}`;
      const at=length*p, point=course.getPointAtLength(at);
      const before=course.getPointAtLength(Math.max(0,at-0.7));
      const after=course.getPointAtLength(Math.min(length,at+0.7));
      const angle=Math.atan2(after.y-before.y,after.x-before.x)*180/Math.PI+90;
      vessel.setAttribute("transform",`translate(${point.x} ${point.y}) rotate(${angle})`);
      vessel.style.opacity = motion ? "1" : "0";
      let active=0;
      stops.forEach((stop,i)=> { if(p+0.002>=Number(stop.dataset.h4Stop)) active=i; });
      stops.forEach((stop,i)=>{stop.setAttribute("aria-pressed",String(i===active)); marks[i]?.classList.toggle("h4-reached",p+0.002>=Number(stop.dataset.h4Stop));});
      details.forEach((detail,i)=>detail.classList.toggle("h4-active",i===active));
      root.querySelector<HTMLElement>(".h4-atlas-current")!.textContent = stops[active].textContent;
    }
    function prime(scene: HTMLElement) {
      scene.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach(img=>{img.loading="eager"; img.fetchPriority="low";});
    }
    function paintHero() {
      const p=motion?clamp(-heroRun.getBoundingClientRect().top/Math.max(1,heroRun.offsetHeight-innerHeight)):0;
      const age=(performance.now()-born)/1000;
      // Four seconds of readable titles before the logo begins its staggered landing.
      const landDuration = parseFloat(getComputedStyle(logo).getPropertyValue("--hathor-logo-anim-duration")) || 1.4;
      letters.forEach((letter,i)=>{
        const land=motion?clamp((age-4-i*0.06)/landDuration):1;
        const exit=motion?clamp((p-0.43-i*0.045)/0.30):0;
        const eased=1-Math.pow(1-land,3);
        letter.style.transform=`translateY(${(1-eased+exit)*100}%)`;
        letter.style.opacity=String(eased*(1-exit));
      });
      // Copy is available in initial HTML; only whole lines move on scroll.
      heroCopy.style.opacity=String(1-clamp((p-0.2)/0.25));
      heroCopy.style.transform=`translateY(${-clamp(p/0.5)*25}px)`;
      stripes.forEach((stripe,i)=>{const q=motion?clamp((p-0.34-i*0.007)/0.3):0;stripe.style.transform=`scaleX(${q})`;});
      if(motion && age < 4+landDuration+0.4 && heroRun.getBoundingClientRect().bottom>0) schedule();
    }
    function paint() {
      frame=0;
      if(disposed) return;
      current+= (target-current)*0.14;
      if(Math.abs(target-current)<0.1) current=target;
      let x=0, passage=0;
      if(horizontal) {
        x=(current<=holdAt ? current : current<=holdAt+hold ? holdAt : current-hold)/0.74;
        x=Math.min(travel,Math.max(0,x));
        passage=clamp((current-holdAt)/hold);
        track.style.transform=`translate3d(${-x}px,0,0)`;
        progress.style.transform=`scaleX(${clamp(current/distance)})`;
      } else {
        const rect=atlas.getBoundingClientRect();
        passage=clamp((innerHeight*0.8-rect.top)/Math.max(1,rect.height*0.8));
      }
      scenes.forEach(scene=>{
        const rect=scene.getBoundingClientRect();
        const position=horizontal?scene.offsetLeft-x:rect.top;
        const viewport=horizontal?innerWidth:innerHeight;
        const size=horizontal?scene.offsetWidth:rect.height;
        const reveal=motion?clamp((viewport*0.96-position)/Math.max(viewport*0.5,size*0.35)):1;
        const parallax=motion?clamp((viewport-position)/(viewport+size)):0.5;
        scene.style.setProperty("--h4-reveal",`${reveal}`);
        scene.style.setProperty("--h4-parallax",`${parallax}`);
        scene.style.setProperty("--h4-focus",`${Math.max(0,Math.sin(parallax*Math.PI))}`);
        if(position<viewport*2 && position+size>-viewport) prime(scene);
        scene.querySelectorAll<HTMLElement>(".h4-wipe").forEach(el=>el.style.setProperty("--h4-wipe",motion?String(editorialFlipProgress(el.getBoundingClientRect(),horizontal?"horizontal":"vertical")):"1"));
      });
      paintMap(motion?(manual??passage):1);
      paintHero();
      if(current!==target) schedule();
    }
    function schedule() { if(!frame && !disposed) frame=requestAnimationFrame(paint); }
    function measure() {
      if(disposed) return;
      motion=!reduced.matches&&!staticView;
      // Short/zoomed desktop windows use the complete document rather than a clipped stage.
      horizontal=innerWidth>950 && innerHeight>=600 && motion;
      root.dataset.h4Ready="true";
      root.dataset.h4Motion=String(motion);
      root.dataset.h4Horizontal=String(horizontal);
      if(horizontal) {
        travel=Math.max(1,track.scrollWidth-innerWidth);
        hold=innerHeight*1.6;
        holdAt=Math.max(0,atlas.offsetLeft+(atlas.offsetWidth-innerWidth)/2)*0.74;
        distance=travel*0.74+hold;
        run.style.height=`${distance+innerHeight}px`;
      } else {run.style.height="auto";track.style.transform="none";progress.style.transform="scaleX(0)";}
      target=horizontal?clamp(-run.getBoundingClientRect().top/distance)*distance:0;
      current=target; schedule();
      document.dispatchEvent(new Event("h4-motion-change"));
    }
    function scroll() { if(Math.abs(scrollY-previousScroll)>1) manual=null; previousScroll=scrollY; target=horizontal?clamp(-run.getBoundingClientRect().top/distance)*distance:0; schedule(); }
    function go(element: HTMLElement) {
      const scene=element.closest<HTMLElement>(".h4-scene");
      let y=element.getBoundingClientRect().top+scrollY-105;
      if(horizontal && scene) {
        const x=Math.min(travel,Math.max(0,scene.offsetLeft+(scene.offsetWidth-innerWidth)/2));
        y=run.getBoundingClientRect().top+scrollY+x*0.74+(x*0.74>holdAt+1?hold:0);
      }
      previousScroll=y;
      window.scrollTo({top:y,behavior:"instant"});
      target=horizontal?clamp((y-(run.getBoundingClientRect().top+scrollY))/distance)*distance:0;
      current=target; schedule();
    }
    function click(e: MouseEvent) {
      const targetEl=e.target instanceof Element?e.target:null;
      const stop=targetEl?.closest<HTMLElement>("[data-h4-stop]");
      if(stop) {manual=Number(stop.dataset.h4Stop);schedule();return;}
      const link=targetEl?.closest<HTMLAnchorElement>('a[href^="#h4-"]');
      const dest=link&&root.querySelector<HTMLElement>(link.getAttribute("href")!);
      if(dest) {e.preventDefault();go(dest);history.replaceState(null,"",link!.getAttribute("href")!);dest.focus({preventScroll:true});}
    }
    function focus(e: FocusEvent) {
      const el=e.target as HTMLElement;
      if(horizontal&&el.closest(".h4-scene,.h4-close")) {
        const r=el.getBoundingClientRect();
        if(r.left<0||r.right>innerWidth||r.top<80||r.bottom>innerHeight) go(el);
      }
    }
    const observer=new ResizeObserver(measure);
    observer.observe(track);
    window.addEventListener("scroll",scroll,{passive:true});
    window.addEventListener("resize",measure,{passive:true});
    reduced.addEventListener("change",measure);
    root.addEventListener("click",click);
    root.addEventListener("focusin",focus);
    document.fonts.ready.then(()=>{if(!disposed)measure();});
    measure();
    return ()=>{
      disposed=true;cancelAnimationFrame(frame);observer.disconnect();
      window.removeEventListener("scroll",scroll);window.removeEventListener("resize",measure);reduced.removeEventListener("change",measure);
      root.removeEventListener("click",click);root.removeEventListener("focusin",focus);
      delete root.dataset.h4Ready;delete root.dataset.h4Motion;delete root.dataset.h4Horizontal;
      run.style.height="";track.style.transform="";
    };
  },[ref,staticView]);
}
