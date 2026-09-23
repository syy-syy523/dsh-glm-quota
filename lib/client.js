window.__ModuleLoader__.load({
  id: "dsh-glm-quota",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    let React = require("react");

    /* ---- client-face typert remote manifest ---- */
    const TYPERT_REMOTE = {
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

    const CONSOLE_URL = "https://open.bigmodel.cn/usercenter/glm-coding/usage";

    /** Official quota console (no referral link). */
    function openConsole(event) {
      event.preventDefault();
      window.open(CONSOLE_URL, "_blank", "noopener,noreferrer");
    }

    /** Reset countdown, e.g. "2h 15m". */
    function resetsIn(iso) {
      const ts = Date.parse(iso);
      if (!isFinite(ts)) return null;
      const diff = ts - Date.now();
      if (diff <= 0) return "now";
      const totalMin = Math.floor(diff / 60000);
      const days = Math.floor(totalMin / 1440);
      const hours = Math.floor((totalMin % 1440) / 60);
      const minutes = totalMin % 60;
      const parts = [];
      if (days > 0) parts.push(days + "d");
      if (hours > 0) parts.push(hours + "h");
      parts.push(minutes + "m");
      return parts.join(" ");
    }

    /** Bar color by usage: calm → warning → critical. */
    function usageColor(percent) {
      if (percent === null) return "var(--dsw-alias-border-default, #888)";
      if (percent >= 85) return "#e5484d";
      if (percent >= 60) return "#f5a623";
      return "#30a46c";
    }

    /** Inline lightning bolt icon (no CDN, no external asset). */
    function BoltIcon({ peak }) {
      return React.createElement(
        "svg",
        {
          width: 12,
          height: 12,
          viewBox: "0 0 16 16",
          fill: "currentColor",
          "aria-hidden": true,
          style: {
            flex: "none",
            opacity: peak ? 1 : 0.55,
            color: peak ? "#f5a623" : "inherit",
            transition: "opacity 0.3s ease, color 0.3s ease"
          }
        },
        React.createElement("path", {
          d: "M9.5 1 3.8 9h3.4l-.7 6L12.2 7H8.8l.7-6z"
        })
      );
    }

    /** One window: label, 36px mini bar, percent. */
    function WindowMeter({ entry }) {
      const pct = entry.percent;
      const color = usageColor(pct);
      const width = pct === null ? 0 : Math.max(2, Math.min(100, pct));
      return React.createElement(
        "span",
        { key: entry.label, style: { display: "inline-flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" } },
        React.createElement(
          "span",
          { style: { fontSize: "10px", opacity: 0.65, letterSpacing: "0.02em" } },
          entry.label
        ),
        React.createElement(
          "span",
          {
            style: {
              display: "inline-block",
              width: "36px",
              height: "4px",
              borderRadius: "2px",
              background: "var(--dsw-alias-border-default, rgba(128,128,128,0.35))",
              overflow: "hidden"
            }
          },
          React.createElement("span", {
            style: {
              display: "block",
              width: width + "%",
              height: "100%",
              borderRadius: "2px",
              background: color,
              transition: "width 0.6s ease, background 0.3s ease"
            }
          })
        ),
        React.createElement(
          "span",
          { style: { fontVariantNumeric: "tabular-nums", color: pct !== null && pct >= 60 ? color : undefined } },
          pct === null ? "…" : Math.round(pct) + "%"
        )
      );
    }

    /** Composer chip. Renders whenever a quota snapshot is available. */
    function QuotaChip({ snapshot }) {
      const [data, setData] = React.useState(null);
      const [failed, setFailed] = React.useState(false);

      React.useEffect(() => {
        let alive = true;
        const load = async () => {
          try {
            const result = await snapshot();
            if (!alive) return;
            if (result && result.ok) {
              setData(result.value);
              setFailed(false);
            } else {
              setFailed(true);
            }
          } catch {
            if (alive) setFailed(true);
          }
        };
        load();
        const timer = setInterval(load, 60000);
        return () => {
          alive = false;
          clearInterval(timer);
        };
      }, [snapshot]);

      if (failed && !data) return null;
      if (!data) return null;

      const limits = data.limits || [];
      if (limits.length === 0) return null;

      const tip = limits
        .map((e) => {
          const pct = e.percent === null ? "n/a" : e.percent.toFixed(1) + "%";
          const reset = e.resetTime ? " · resets in " + (resetsIn(e.resetTime) || "?") : "";
          return e.label + " " + pct + reset;
        })
        .join("\n")
        + "\n" + (data.peak ? "Peak hours (100% deduction)" : "Off-peak (50% deduction)")
        + (data.level ? "\nPlan: " + data.level : "");

      return React.createElement(
        "a",
        {
          href: CONSOLE_URL,
          onClick: openConsole,
          title: "GLM Coding Plan\n" + tip,
          style: {
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            height: "22px",
            padding: "0 9px",
            borderRadius: "999px",
            background: "var(--dsw-alias-background-secondary, rgba(128,128,128,0.08))",
            border: "1px solid var(--dsw-alias-border-default, rgba(128,128,128,0.2))",
            fontSize: "11px",
            fontWeight: 500,
            lineHeight: 1,
            color: "var(--dsw-alias-label-tertiary, inherit)",
            textDecoration: "none",
            cursor: "pointer",
            whiteSpace: "nowrap",
            flex: "none",
            opacity: failed ? 0.5 : 1
          }
        },
        React.createElement(BoltIcon, { peak: data.peak }),
        limits.map((entry) => React.createElement(WindowMeter, { key: entry.label, entry }))
      );
    }

    /** Client body: mount the remote service and inject the chip slot. */
    async function apply(ctx) {
      await ctx.remote.$mount(TYPERT_REMOTE);
      const glmQuota = ctx.get("remote.glmQuota");

      ctx.slots.inject("conversation.input.right", () => ctx.slots.register({
        name: "conversation.input.right",
        id: "glm-quota-chip",
        order: 0,
        inject: () => ({
          snapshot: () => glmQuota.snapshot()
        })
      }, QuotaChip));
    }

    const inject = ["slots", "remote", "remote.session"];

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
