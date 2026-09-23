/**
 * dsh-glm-quota — host plugin.
 *
 * Mounts a Typert remote gateway (`glmQuota.snapshot`) consumed by the web
 * composer chip, and registers the ad-free `/glm-quota` command. The API key
 * is resolved host-side only and never leaves the host process.
 *
 * Every open browser tab polls the gateway once a minute, so `snapshot()`
 * serves an in-memory cache and coalesces concurrent callers into a single
 * upstream request: N tabs still cost at most one quota-API call per TTL.
 * While an upstream 429 backoff is active, the last good snapshot keeps
 * being served instead of failing the chip.
 */

import { TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import { API_KEY_REF, CONSOLE_URL, QuotaHttpError, fetchSnapshot, formatSnapshot } from "./logic.js";

const name = "dsh-glm-quota";
const inject = ["commands", "credentials"];

/** One upstream quota fetch per this window, regardless of tab count. */
const SNAPSHOT_TTL_MS = 60_000;

/**
 * Host-side remote service exposing the latest quota snapshot to the browser.
 * Registered as the `glmQuota` namespace; `./typert` (typert.host.js) owns
 * the invocation manifest.
 */
class GlmQuotaGateway extends TypertRemoteService {
  static inject = ["credentials"];

  constructor(ctx) {
    super(ctx, "glmQuota");
    this.cached = null; // { snapshot, at }
    this.retryNotBefore = 0;
    this.inflight = null;
  }

  /** Cached quota snapshot; throws on credential/network/API failure. */
  async snapshot() {
    const now = Date.now();
    // Backoff window: keep serving the last good snapshot.
    if (this.cached && now < this.retryNotBefore) return this.cached.snapshot;
    // Fresh enough: no upstream request.
    if (this.cached && now - this.cached.at < SNAPSHOT_TTL_MS) return this.cached.snapshot;
    // Coalesce concurrent tabs into one upstream call.
    if (this.inflight) return this.inflight;
    this.inflight = (async () => {
      try {
        const snapshot = await fetchSnapshot(this.ctx.credentials);
        this.cached = { snapshot, at: Date.now() };
        this.retryNotBefore = 0;
        return snapshot;
      } catch (error) {
        if (error instanceof QuotaHttpError && error.retryAfterMs > 0) {
          this.retryNotBefore = Date.now() + error.retryAfterMs;
        }
        throw error;
      } finally {
        this.inflight = null;
      }
    })();
    return this.inflight;
  }
}

/** Register the `/glm-quota` command and mount the browser remote gateway. */
async function apply(ctx) {
  await ctx.plugin(GlmQuotaGateway);
  ctx.commands.register({
    name: "glm-quota",
    description: "Show GLM Coding Plan quota usage (5h / weekly / MCP windows)",
    handler: async () => {
      try {
        const snapshot = await fetchSnapshot(ctx.credentials);
        return {
          kind: "success",
          text: `GLM Coding Plan quota\n\n${formatSnapshot(snapshot)}\n\nConsole: ${CONSOLE_URL}`
        };
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        return { kind: "error", text: `GLM quota failed: ${detail}` };
      }
    }
  });
}

export { apply, inject, name, fetchSnapshot, formatSnapshot, GlmQuotaGateway, API_KEY_REF, CONSOLE_URL };
