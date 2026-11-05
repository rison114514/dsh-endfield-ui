# DSH × 终末地风格工作台

> **非官方同人主题**：本项目与游戏开发商及 DeepSeek 官方均无关联，不暗示合作或授权。

![DSH 终末地风格工作台](https://raw.githubusercontent.com/kingOfSoySauce/dsh-skin-market/main/site/public/skin-screenshots/rison114514__dsh-endfield-ui--endfield-ui-plugin/d9d5c722cdb63e8c78d455af5a4896f7c3817cc8/home.gif)

为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 制作的终末地工业风工作台插件。它通过 DSH 标准 Cordis Bundle 加载，不修改 DSH 核心文件，可直接用于官方 macOS / Windows Desktop 与 Web。

## 主要功能

- 终末地风格开屏、工业网格、等高线侧栏与黄黑工业组件。
- better-sidebar 右侧工作台：文件、编辑器、浏览器、终端、Git、任务和子代理。
- `OBJECTIVE` 直接读取 DSH 原生 Goal，与 `/goal` 和 GoalBar 保持同一份状态。
- 使用 DSH 官方 Vision 附件链路，兼容浅色、深色与跟随系统三种外观。
- 修复长文本、换行、斜杠命令、选区、输入光标和右栏遮罩等可用性问题。

## 官方 Desktop 安装（推荐）

适配基线：DSH `0.2.0-rc.2`、Node.js `>=22.19.0`、`dsh-better-sidebar@0.24.1`。

1. 安装并至少启动一次 DeepSeek Harness 官方 Desktop。
2. 完全退出 Desktop；Windows 还需从系统托盘退出。
3. 在官方 Desktop 中使用“管理 dsh 命令…”注册或修复官方 CLI。
4. 下载 Release 中的 `rison-dsh-endfield-ui-1.1.0.tgz`，在其所在目录执行：

```bash
dsh plugin --profile desktop add dsh-better-sidebar@0.24.1 ./rison-dsh-endfield-ui-1.1.0.tgz
```

重新打开官方 Desktop 后，终末地界面会自动生效。

官方 Desktop 使用独立的 `desktop` Profile。普通 npm 全局安装的旧版 `dsh` 可能无法管理它；若命令拒绝访问 Desktop Profile，请先通过官方 App 重新注册其内置命令运行时。安装插件不会删除或迁移 `.dsh` 中的会话、模型与设置。

## Web 安装

```bash
dsh plugin --profile web add dsh-better-sidebar@0.24.1 ./rison-dsh-endfield-ui-1.1.0.tgz
dsh web
```

`desktop` 与 `web` Profile 相互隔离；需要在哪个入口使用，就给对应 Profile 安装一次。

卸载：

```bash
dsh plugin --profile desktop remove @rison/dsh-endfield-ui dsh-better-sidebar
# 或将 desktop 换成 web
```

卸载插件不会删除用户会话或模型配置。

## 1.1.0 更新

- 正式适配 DSH `0.2.0-rc.2` 与 `dsh-better-sidebar@0.24.1`。
- 支持 DeepSeek Harness 官方 macOS / Windows Desktop 的 `desktop` Profile。
- 右侧工作台更新为新版原生侧栏，加入终末地工业图标与完整视觉适配。
- 修复侧栏折叠时的半透明遮罩、开屏黑框、滚动串联、按钮交互和宽度拖拽问题。
- 修复长文本、换行、斜杠命令、鼠标选区重影、输入卡顿与光标错位。
- 修复新会话、审批页、设置派生卡片及三种外观模式下的文字可读性。
- 使用 DSH 官方 Vision 附件链路，不再依赖旧视觉理解插件。
- `OBJECTIVE` 继续直接订阅 DSH 原生 Goal projection，不创建第二份状态。

## 桌面版维护说明

从 `1.1.0` 起，本项目停止维护和发布自建 Electron 桌面 App。GitHub Release **只提供插件 `.tgz`**，不再提供 `.app`、`.dmg`、`.exe` 或便携 ZIP。

仓库中的 `desktop-app/` 仅保留为历史实现参考，不再接受功能适配、安装器、签名、公证或更新器相关维护。桌面用户请安装 DeepSeek Harness 官方 macOS / Windows Desktop，再按上文安装插件。

## 已知限制

- 内嵌浏览器仍受目标网站 CSP 与 `X-Frame-Options` 限制，必要时请使用外部浏览器打开。
- `dsh-shikitor@1.0.2` 不兼容 DSH 0.2，因此 1.1.0 使用 DSH 原生输入与补全能力。
- Windows 官方 Desktop 使用同一套 `desktop` Profile 插件机制；不同 DSH 版本升级后应先核对兼容说明。

维护与兼容说明见 [`HANDOFF.md`](./HANDOFF.md)，本次发布说明见 [`RELEASE.md`](./RELEASE.md)。
