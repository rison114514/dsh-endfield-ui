# DSH 终末地风格工作台 — v1.1.0

> **非官方同人主题（Unofficial fan-made theme）**：本项目与游戏开发商及 DeepSeek 官方均无关联，不暗示合作或授权。

`v1.1.0` 正式迁移到 DeepSeek Harness 官方 Desktop 插件体系，并将兼容基线升级到 DSH `0.2.0-rc.2` 与 `dsh-better-sidebar@0.24.1`。

## 重要变化：改用官方 Desktop

从本版起，本项目不再维护或发布自建 Electron 桌面 App。Release 只提供终末地插件包：

- `rison-dsh-endfield-ui-1.1.0.tgz`

不再提供 macOS `.app` / `.dmg`、Windows `Setup.exe` 或便携 ZIP。macOS 与 Windows 用户请安装 DeepSeek Harness 官方 Desktop，再把插件安装到其 `desktop` Profile。

官方 macOS Desktop 已完成实机验证。Windows 官方 Desktop 使用相同的 Profile 与插件机制；本项目不再单独维护 Windows 外壳或安装器。

## 核心更新

- 兼容 DSH `0.2.0-rc.2` 与 `dsh-better-sidebar@0.24.1`。
- 支持官方 Desktop 独立的 `desktop` Profile，并保留 Web Profile 安装方式。
- 新版右侧工作台接入 DSH 原生侧栏，提供文件、编辑器、浏览器、终端、Git、任务、子代理与 `OBJECTIVE`。
- 加入终末地工业图标与黄黑工业风工作台适配。
- 修复右栏收起后的半透明黑色遮罩、开屏黑框、滚动串联、按钮失效和宽度拖拽问题。
- 修复长文本、换行、斜杠命令、鼠标选区重影、输入卡顿与光标偏移。
- 完善新会话、审批页、设置派生卡片和浅色 / 深色 / 跟随系统模式的文字可读性。
- 使用 DSH 官方 Vision 附件链路，移除旧视觉理解插件遗留兼容层。
- `OBJECTIVE` 继续使用原生 Goal projection，与 `/goal` 和 GoalBar 保持同一份状态。

## 官方 Desktop 安装

先启动一次官方 Desktop，再完全退出（Windows 还需退出系统托盘），并通过 App 的“管理 dsh 命令…”确保终端中的 `dsh` 来自官方 Desktop。随后在插件包所在目录执行：

```bash
dsh plugin --profile desktop add dsh-better-sidebar@0.24.1 ./rison-dsh-endfield-ui-1.1.0.tgz
```

重新打开官方 Desktop 即可生效。普通 npm 版旧 `dsh` 不能代替官方 Desktop 的内置命令管理 `desktop` Profile。

## Web 安装

```bash
dsh plugin --profile web add dsh-better-sidebar@0.24.1 ./rison-dsh-endfield-ui-1.1.0.tgz
dsh web
```

卸载只移除对应 Profile 的插件，不删除 Session、模型或用户设置：

```bash
dsh plugin --profile desktop remove @rison/dsh-endfield-ui dsh-better-sidebar
```

## 已知限制

- 内嵌浏览器仍受目标网站 CSP / `X-Frame-Options` 限制。
- `dsh-shikitor@1.0.2` 的兼容范围止于 DSH `<0.2.0`，本版使用 DSH 原生输入与补全能力。
- DSH 或 better-sidebar 升级后应先重新验证，再调整精确版本映射。

## SHA-256

- `rison-dsh-endfield-ui-1.1.0.tgz`：`4f7a9619e475f70e0a43deb63e3984e8c8c3154d21c4aa548562a65dc66fa70f`
