import { NextResponse } from "next/server";
import { performance } from "node:perf_hooks";
import dns from "node:dns/promises";
import net from "node:net";
import {
  fetchPublicCmsBundleFromDb,
  loadPublicCmsBundle,
  PUBLIC_CMS_CACHE_KEY,
  PUBLIC_CMS_CACHE_TAG,
  PUBLIC_CMS_REVALIDATE_SECONDS,
  defaultSiteImageMap,
} from "@/lib/public-cms-bundle";
import { getHomepageAccordionCruisesSafe } from "@/lib/homepage-accordion-cruises";
import { resolveDatabaseUrl } from "@/lib/database-config";
import {
  CMS_CONNECT_TIMEOUT_MS,
  CMS_MAX_SIMULTANEOUS_CONNECTIONS,
  CMS_QUERY_TIMEOUT_MS,
  CMS_RETRY_COUNT,
  CMS_STATEMENT_TIMEOUT_MS,
} from "@/lib/public-cms-client";

export const dynamic = "force-dynamic";

async function measureDnsTcp(hostname: string, port: number) {
  const out: Record<string, number | string | null> = {
    dnsMs: null,
    tcpMs: null,
    resolvedAddress: null,
  };
  const tDns = performance.now();
  try {
    const resolved = await dns.lookup(hostname, { family: 4 });
    out.dnsMs = Math.round(performance.now() - tDns);
    out.resolvedAddress = resolved.address;
  } catch (error) {
    out.dnsMs = Math.round(performance.now() - tDns);
    out.dnsError = error instanceof Error ? error.message : String(error);
    return out;
  }

  const address = String(out.resolvedAddress);
  const tTcp = performance.now();
  await new Promise<void>((resolve, reject) => {
    const socket = net.connect({ host: address, port, family: 4 }, () => {
      out.tcpMs = Math.round(performance.now() - tTcp);
      socket.end();
      resolve();
    });
    socket.on("error", reject);
    socket.setTimeout(CMS_CONNECT_TIMEOUT_MS, () => {
      socket.destroy();
      reject(new Error("tcp timeout"));
    });
  }).catch((error: unknown) => {
    out.tcpError = error instanceof Error ? error.message : String(error);
  });

  return out;
}

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "dev only" }, { status: 404 });
  }

  const url = new URL(resolveDatabaseUrl());
  const host = url.hostname;
  const port = Number(url.port || "6543");
  const network = await measureDnsTcp(host, port);

  let dbTiming: Record<string, unknown> | null = null;
  try {
    const raw = await fetchPublicCmsBundleFromDb();
    dbTiming = { ...raw.timing };
  } catch (error) {
    dbTiming = {
      error: error instanceof Error ? error.message : String(error),
    };
  }

  const tCache = performance.now();
  const cms = await loadPublicCmsBundle();
  const cacheMs = Math.round(performance.now() - tCache);

  const tAcc = performance.now();
  const cruises = await getHomepageAccordionCruisesSafe();
  const accordionMs = Math.round(performance.now() - tAcc);

  const defaults = defaultSiteImageMap();
  let overrideDiffs = 0;
  for (const [name, img] of Object.entries(cms.siteImages)) {
    if (defaults[name] && defaults[name].src !== img.src) overrideDiffs += 1;
  }

  return NextResponse.json({
    ok: true,
    network: { host, port, ...network },
    db: dbTiming,
    cache: {
      key: PUBLIC_CMS_CACHE_KEY,
      tag: PUBLIC_CMS_CACHE_TAG,
      revalidateSeconds: PUBLIC_CMS_REVALIDATE_SECONDS,
      loadMs: cacheMs,
    },
    accordionMs,
    policy: {
      connectTimeoutMs: CMS_CONNECT_TIMEOUT_MS,
      statementTimeoutMs: CMS_STATEMENT_TIMEOUT_MS,
      queryTimeoutMs: CMS_QUERY_TIMEOUT_MS,
      retryCount: CMS_RETRY_COUNT,
      maxSimultaneousCmsConnections: CMS_MAX_SIMULTANEOUS_CONNECTIONS,
      clientClose: "finally client.end(); destroy stream on timeout",
      concurrentCacheMiss: "single-flight in-process promise",
      connectionSource: "dedicated short-lived pg.Client (serialized; no DIRECT_URL)",
    },
    imageKeys: Object.keys(cms.siteImages).length,
    siteImageOverridesApplied: overrideDiffs,
    cruiseCount: cruises.length,
  });
}
