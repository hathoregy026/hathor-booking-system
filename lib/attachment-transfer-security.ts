import { PublicRequestError } from "@/lib/public-api-security";

/** Small, same-origin JSON mutations, including behind Next's trusted proxy. */
export async function readAttachmentMutationJson(request: Request): Promise<unknown> {
  const type = request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
  if (type !== "application/json") throw new PublicRequestError("JSON required", 415);
  const url = new URL(request.url);
  const host = request.headers.get("host") || url.host;
  const scheme = request.headers.get("x-forwarded-proto") || url.protocol.slice(0, -1);
  if (!/^(?:https|http)$/.test(scheme) || request.headers.get("sec-fetch-site") === "cross-site") {
    throw new PublicRequestError("Cross-origin request rejected", 403);
  }
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(`${scheme}://${host}`).origin) throw new PublicRequestError("Cross-origin request rejected", 403);
  const limit = 1024;
  if (Number(request.headers.get("content-length")) > limit) throw new PublicRequestError("Request body is too large", 413);
  if (!request.body) throw new PublicRequestError("Invalid request body", 400);
  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let size = 0, text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new PublicRequestError("Request body is too large", 413); }
      text += decoder.decode(value, { stream: true });
    }
    return JSON.parse(text + decoder.decode());
  } catch (error) {
    if (error instanceof PublicRequestError) throw error;
    throw new PublicRequestError("Invalid request body", 400);
  } finally { reader.releaseLock(); }
}
