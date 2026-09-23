# 更新日志

记录用户可感知的变化；格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。
版本号见 `package.json`。

## [1.0.1] - 2026-09-23

### 新增

- **MCP 工具调用窗口回归**：`TIME_LIMIT` 行不再被丢弃，胶囊与悬停详情显示 MCP
  调用配额（如 `6/1k calls`），`/glm-quota` 报告同步包含该窗口。
- **宿主侧节流**：`glmQuota.snapshot` 增加 60s 内存缓存与并发合并——多个浏览器
  标签页同时轮询也只打一次上游接口；HTTP 429 按 `Retry-After` 退避（上限 30 分钟），
  退避期间继续显示最后一次成功数据。
- **错误可见性**：拉取失败时（半透明态）悬停提示显示具体错误信息。
- **可测试性**：胶囊根元素增加 `data-testid="glm-quota-chip"` 与 `aria-label`。

### 变更

- 上游请求超时 20s → 8s，失败更快暴露。
- `package.json` 描述补充 MCP 窗口与缓存特性。

## [1.0.0] - 2026-09-23

完全重写（npm 上的 0.1.0 为旧版侧栏面板形态）：

- 输入框右侧胶囊读条（`conversation.input.right` 插槽）：36px 迷你进度条、
  闪电图标标注峰谷时段、点击直达官方用量页。
- 架构迁移到 Typert remote（`glmQuota/snapshot`），host/client 面均由
  zod 严格 schema 校验。
- 逻辑层零依赖（`lib/logic.js`），峰谷判定（北京时间工作日 14:00–18:00）。
- `/glm-quota` 命令输出完整文字报告（窗口用量、重置倒计时、计费时段、控制台链接）。

### 破坏性变化（相对 0.1.0）

- 移除侧边栏底部面板形态与 `GET /glm-quota/state` HTTP 端点（由 Typert RPC 取代）。
- 移除 `relevant` 会话观察门控与状态文件节流阀（1.0.1 已以更简单的宿主侧
  缓存补回节流能力）。

## [0.1.0] - 2026-08-31

首个 npm 发布（包名 `dsh-glm-quota`；npm 上的 `glm-quota` 已被他人占用）。

- 侧栏底部（Settings 上方）GLM Coding Plan 额度面板：多窗口进度条（5 小时 /
  周限 / MCP）、五档配色（暗色主题适配）、折叠圆环态、逐窗口重置倒计时、手动刷新。
- host 半场：会话事件驱动 + 单一节流阀（默认每 60s 至多一次上游请求），空闲零请求；
  状态文件跨进程权威；429 按 Retry-After 退避；凭据缺失不退避；凭据轮换即时重拉。
- `GET /glm-quota/state` 端点（`?refresh=1` 强制刷新）；`relevant` 门控。
- 冒烟测试：host 半场（窗口映射 / provider 门控 / 节流 / 退避 / 状态文件）与
  client 半场（handoff 格式 / 插槽注册 / 轮询 / SSR 渲染断言）。
