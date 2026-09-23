# dsh-glm-quota

Put your Zhipu BigModel / Z.ai GLM Coding Plan quota into the [DeepSeek Harness (dsh)](https://github.com/deepseek-ai/deepseek-harness) web composer status bar as a minimal pill chip.

- **No ads**: zero referral links — clicking the chip opens the official quota console
- **No external assets**: inline SVG icon, no third-party CDN requests
- **Mini progress bars**: one 36px bar per quota window (5-hour rolling / weekly / MCP tool calls), color-coded by usage (green → amber ≥60% → red ≥85%)
- **Hover details**: exact percentages, MCP call counts, reset countdowns, peak/off-peak pricing window (Beijing weekdays 14:00–18:00 bill at 100%, everything else — including weekends — at 50%), plan tier, and error messages
- **Throttle-friendly**: host-side 60s cache with request coalescing — N browser tabs still cost at most one upstream call per window; HTTP 429 backs off per Retry-After while stale data keeps rendering
- **`/glm-quota` command**: full text report in the conversation
- **Key safety**: the API key is resolved host-side through the dsh credentials seam and never reaches the browser

## Install

```sh
dsh plugin --profile web add dsh-glm-quota
```

Or manually:

```sh
cd ~/.dsh/profiles/web
pnpm add dsh-glm-quota
```

Then append to `~/.dsh/profiles/web/cordis.patch.yml`:

```yaml
- insert:
    - id: glm-quota-chip
      name: 'dsh-glm-quota'
```

Restart `dsh web` and hard-refresh the page (Ctrl+Shift+R).

> ⚠️ A fresh profile's `cordis.patch.yml` starts as `[]` (an empty-array placeholder). Appending list items after it produces invalid YAML — remove the `[]` line before pasting.

To install from GitHub source (versions not yet on npm):

```sh
dsh plugin --profile web add github:syy-syy523/dsh-glm-quota
```

## Configuration

The plugin reads its key via the `ZAI_CODING_CN_API_KEY` credential ref — the same one dsh's built-in Zhipu provider uses. **If you have already configured a GLM model API key in dsh's settings UI, no extra setup is needed.**

Otherwise put your BigModel API key (the same key your GLM Coding Plan uses) in `~/.dsh/.credentials.yaml`:

```yaml
ZAI_CODING_CN_API_KEY: <your key>
```

Global (api.z.ai) users can switch the base URL:

```sh
export ZHIPUAI_BASE_URL=https://api.z.ai
```

> Note: when installing local source via a pnpm `link:`, pnpm may not link peer dependencies automatically; manually symlink `dsh-typert-protocol` and `cordis` under the package's `node_modules/@deepseek-ai/` to the copies inside the dsh installation. Installing from npm via `dsh plugin add <name>` has no such issue.

## Usage

- The chip stays in the composer's bottom-right row, auto-refreshed every 60 seconds
- Hover for full details; click to open the [GLM Coding Plan usage page](https://open.bigmodel.cn/usercenter/glm-coding/usage)
- Type `/glm-quota` in the conversation for the full report

## License

[MIT](./LICENSE)
