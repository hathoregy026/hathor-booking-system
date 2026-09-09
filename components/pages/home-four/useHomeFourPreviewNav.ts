"use client";
import { useEffect, useState } from "react";

/** Host check only avoids unnecessary public requests. The server decides access. */
export function useHomeFourPreviewNav() {
  const [enabled,setEnabled]=useState(false);
  useEffect(()=>{
    if(!["localhost","127.0.0.1","[::1]"].includes(location.hostname)) return;
    const controller=new AbortController();
    fetch("/api/home-4-preview",{cache:"no-store",signal:controller.signal})
      .then(r=>r.ok?r.json():null).then(value=>{if(!controller.signal.aborted)setEnabled(value?.enabled===true);}).catch(()=>{});
    return ()=>controller.abort();
  },[]);
  return enabled;
}
