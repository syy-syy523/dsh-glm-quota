# dsh-glm-quota

**中文** · [English](./README.en.md)

把智谱 BigModel / Z.ai GLM Coding Plan 的套餐用量以一枚极简胶囊读条放进 [DeepSeek Harness (dsh)](https://github.com/deepseek-ai/deepseek-harness) web 界面的输入框状态栏。

- **无广告**：没有任何邀请返利链接，点击读条直达官方额度控制台
- **无外部资源**：内联 SVG 图标，不加载任何第三方 CDN 资产
- **迷你进度条**：每个配额窗口（5 小时滚动 / 每周 / MCP 工具调用）一条 36px 进度条，颜色随用量分级（绿 → 琥珀 ≥60% → 红 ≥85%）
- **悬停详情**：精确百分比、MCP 调用次数、重置倒计时、峰谷计费时段（北京时间工作日 14:00–18:00 高峰全额抵扣，其余时段 5 折）、套餐档位、错误信息
- **`/glm-quota` 命令**：在对话里输出完整文字报告
- **密钥安全**：API key 只在 dsh 宿主端通过凭据机制解析，绝不进入浏览器
- **节流友好**：宿主侧 60s 缓存 + 并发合并，多个浏览器标签页也只打一次上游接口；HTTP 429 按 Retry-After 退避并继续显示旧数据

## 安装

```sh
dsh plugin --profile web add dsh-glm-quota
```

或手动安装：

```sh
cd ~/.dsh/profiles/web
pnpm add dsh-glm-quota
```

然后在 `~/.dsh/profiles/web/cordis.patch.yml` 追加：

```yaml
- insert:
    - id: glm-quota-chip
      name: 'dsh-glm-quota'
```

> ⚠️ 新建 profile 的 `cordis.patch.yml` 初始内容是 `[]`（空数组占位符）。直接在其后追加列表项会产生无效 YAML——请先把 `[]` 删掉再粘贴上面的内容。

重启 `dsh web` 并硬刷新页面（Ctrl+Shift+R）生效。

要从 GitHub 源码安装（末发布 npm 的版本）：

```sh
dsh plugin --profile web add github:syy-syy523/dsh-glm-quota
```

## 配置

插件通过凭据引用名 `ZAI_CODING_CN_API_KEY` 读 key——与 dsh 内置的智谱 provider 共用。**如果你已在 dsh 设置界面配置过 GLM 模型的 API key，无需任何额外配置**。

否则在 `~/.dsh/.credentials.yaml` 写入你的 BigModel API key（即 GLM Coding Plan 所用的 key）：

```yaml
ZAI_CODING_CN_API_KEY: <your key>
```

未配置 key 时胶囊自动隐藏，零上游请求。

海外（Z.ai 全球端点）用户可切换 base URL：

```sh
export ZHIPUAI_BASE_URL=https://api.z.ai
```

> 注意：本插件以 pnpm `link:` 方式安装本地源码时，pnpm 可能不会自动链接 peer 依赖，需要手动在包目录的 `node_modules/@deepseek-ai/` 下补 `dsh-typert-protocol` 与 `cordis` 的符号链接（指向 dsh 安装目录内的同名包）。通过 `dsh plugin add <npm 包名>` 从 npm 安装则无此问题。

## 使用

- 选中 GLM 模型后（或只要配额接口可用），输入框右下角常驻读条，每 60 秒自动刷新
- 悬停查看完整详情；点击打开 [GLM Coding Plan 用量页](https://open.bigmodel.cn/usercenter/glm-coding/usage)
- 对话里输入 `/glm-quota` 查看完整报告

## License

[MIT](./LICENSE)
