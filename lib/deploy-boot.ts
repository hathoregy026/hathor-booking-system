import { getServiceWorkerKillBootScript } from "@/lib/browser-cache-reset";

/** Inline boot: kill stale SW/cache, then hard-reload if /api/deploy-id disagrees with this page. */
export function getDeployBootScript(deployId: string): string {
  const swKill = getServiceWorkerKillBootScript();
  return `${swKill}(function(){try{var pageId=${JSON.stringify(deployId)};if(!pageId||pageId==="dev")return;var guard="hathor-reload-guard-"+pageId;try{if(sessionStorage.getItem(guard)==="1"){/* allow boot after successful load */}}catch(e){}fetch("/api/deploy-id?t="+Date.now(),{cache:"no-store",headers:{"x-hathor-page-deploy":pageId,"Accept":"application/json"}}).then(function(res){return res.json();}).then(function(data){if(!data||!data.id||data.id==="dev"||data.id===pageId)return;try{var g="hathor-reload-guard-"+data.id;if(sessionStorage.getItem(g)==="1")return;sessionStorage.setItem(g,"1");}catch(e){}var u=new URL(location.href);u.searchParams.set("_d",data.id);location.replace(u.toString());}).catch(function(){});}catch(e){}})();`;
}
