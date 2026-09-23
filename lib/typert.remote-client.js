/* Client-face Typert remote manifest for dsh-glm-quota (hand-written).
 * Minimal strict codec; the host already validated the payload. */

export const TYPERT_REMOTE = {
  package: "dsh-glm-quota",
  descriptors: [
    {
      id: "dsh-glm-quota#glmQuota/snapshot",
      service: "glmQuota",
      namespace: "glmQuota",
      method: "snapshot",
      invocation: { kind: "direct" },
      parameters: [],
      result: {
        mode: "strict",
        typeSymbol: "dsh-glm-quota/types#GlmQuotaSnapshot",
        schema: {
          parse(value) {
            if (!value || typeof value !== "object") {
              throw new TypeError("expected a glm quota snapshot object");
            }
            return {
              limits: Array.isArray(value.limits)
                ? value.limits
                    .filter((e) => e && typeof e === "object")
                    .map((e) => ({
                      type: typeof e.type === "string" ? e.type : null,
                      unit: typeof e.unit === "number" ? e.unit : null,
                      label: typeof e.label === "string" ? e.label : "quota",
                      percent: typeof e.percent === "number" ? e.percent : null,
                      used: typeof e.used === "number" ? e.used : null,
                      cap: typeof e.cap === "number" ? e.cap : null,
                      resetTime: typeof e.resetTime === "string" ? e.resetTime : null
                    }))
                : [],
              peak: value.peak === true,
              level: typeof value.level === "string" ? value.level : null
            };
          }
        }
      },
      sourceLocation: { file: "lib/index.js", line: 1, column: 1 }
    }
  ]
};

export default TYPERT_REMOTE;
