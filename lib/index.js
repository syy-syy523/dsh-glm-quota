/**
 * dsh-glm-quota — host plugin.
 *
 * Mounts a Typert remote gateway (`glmQuota.snapshot`) consumed by the web
 * composer chip, and registers the ad-free `/glm-quota` command. The API key
 * is resolved host-side only and never leaves the host process.
 */

import { TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import { API_KEY_REF, CONSOLE_URL, fetchSnapshot, formatSnapshot } from "./logic.js";

const name = "dsh-glm-quota";
const inject = ["commands", "credentials"];

/**
 * Host-side remote service exposing the latest quota snapshot to the browser.
 * Registered as the `glmQuota` namespace; `./typert` (typert.host.js) owns
 * the invocation manifest.
 */
class GlmQuotaGateway extends TypertRemoteService {
  static inject = ["credentials"];

  constructor(ctx) {
    super(ctx, "glmQuota");
  }

  /** Normalized quota snapshot; throws on credential/network/API failure. */
  async snapshot() {
    return fetchSnapshot(this.ctx.credentials);
  }
}

/** Register the `/glm-quota` command and mount the browser remote gateway. */
async function apply(ctx) {
  await ctx.plugin(GlmQuotaGateway);
  ctx.commands.register({
    name: "glm-quota",
    description: "Show GLM Coding Plan quota usage (5h / weekly windows)",
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
