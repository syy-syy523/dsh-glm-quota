/**
 * dsh-glm-quota — dependency-free host-side core logic.
 *
 * Queries the GLM Coding Plan quota endpoint and normalizes it for the
 * composer chip. Credentials never leave the host process.
 */

export const DEFAULT_BASE_URL = "https://open.bigmodel.cn";
export const API_KEY_REF = "ZAI_CODING_CN_API_KEY";
export const TIMEOUT_MS = 20000;
export const CONSOLE_URL = "https://open.bigmodel.cn/usercenter/glm-coding/usage";

export const TOKENS_UNIT_LABELS = { 3: "5h", 6: "7d" };

/** Peak = Beijing weekdays 14:00-18:00; weekends are off-peak all day. */
const PEAK_WINDOWS = [{ start: 14 * 60, end: 18 * 60 }];

function beijingParts(date = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Shanghai",
    hour12: false,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
  const map = {};
  for (const p of fmt.formatToParts(date)) map[p.type] = p.value;
  return map;
}

/** True while Beijing time bills at the peak rate. */
export function isPeakNow(date = new Date()) {
  const parts = beijingParts(date);
  if (parts.weekday === "Sat" || parts.weekday === "Sun") return false;
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  return PEAK_WINDOWS.some(({ start, end }) => minutes >= start && minutes < end);
}

function resolveBaseUrl() {
  const env = globalThis.process?.env?.ZHIPUAI_BASE_URL;
  if (typeof env === "string" && env.length > 0) return env.replace(/\/+$/, "");
  return DEFAULT_BASE_URL;
}

function normalizeResetTime(value) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return new Date(value).toISOString();
  }
  if (typeof value === "string" && value.length > 0) return value;
  return null;
}

function normalizeLimit(entry) {
  if (!entry || typeof entry !== "object") return null;
  const pct = Number(entry.percentage);
  const type = typeof entry.type === "string" ? entry.type : null;
  const unit = typeof entry.unit === "number" ? entry.unit : null;
  if (type !== "TOKENS_LIMIT") return null;
  const label = TOKENS_UNIT_LABELS[unit] ?? `unit${unit ?? "?"}`;
  return {
    type,
    unit,
    label,
    percent: Number.isFinite(pct) ? pct : null,
    resetTime: normalizeResetTime(entry.nextResetTime)
  };
}

async function fetchRaw(credentials) {
  const credential = await credentials.resolve(API_KEY_REF);
  if (!credential || typeof credential.value !== "string" || credential.value.length === 0) {
    throw new Error(`${API_KEY_REF} is not configured (put it in ~/.dsh/.credentials.yaml)`);
  }
  const response = await fetch(`${resolveBaseUrl()}/api/monitor/usage/quota/limit`, {
    headers: {
      Authorization: `Bearer ${credential.value}`,
      "Accept-Language": "en-US,en",
      Accept: "application/json"
    },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!response.ok) throw new Error(`GLM quota API returned HTTP ${response.status}`);
  const body = await response.json();
  if (body && typeof body === "object" && Number(body.code) !== 200) {
    throw new Error(`GLM quota API error: code ${body.code}${body.msg ? ` — ${body.msg}` : ""}`);
  }
  return body;
}

/** Normalized snapshot for the browser chip. */
export async function fetchSnapshot(credentials) {
  const body = await fetchRaw(credentials);
  const rawLimits = Array.isArray(body?.data?.limits) ? body.data.limits : [];
  const limits = rawLimits.map(normalizeLimit).filter(Boolean);
  limits.sort((a, b) => (a.unit ?? 0) - (b.unit ?? 0));
  return { limits, peak: isPeakNow(), level: body?.data?.level ?? null };
}

/** Human-readable report for the /glm-quota command. */
export function formatSnapshot(snapshot) {
  const lines = (snapshot.limits || []).map((e) => {
    const pct = e.percent !== null ? `${e.percent.toFixed(1)}% used` : "n/a";
    let reset = "";
    if (e.resetTime) {
      const diff = Date.parse(e.resetTime) - Date.now();
      if (Number.isFinite(diff) && diff > 0) {
        const h = Math.floor(diff / 3600000);
        const m = Math.round((diff % 3600000) / 60000);
        reset = ` · resets in ${h}h ${m}m`;
      }
    }
    return `${e.label}: ${pct}${reset}`;
  });
  const window = snapshot.peak ? "Peak (100% deduction)" : "Off-peak (50% deduction)";
  return [...lines, `Pricing window: ${window}`].join("\n");
}
