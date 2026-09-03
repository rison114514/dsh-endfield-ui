# DSH × 终末地风格工作台

> **非官方同人主题**：本项目与游戏开发商及 DeepSeek 官方均无关联，不暗示合作或授权。

![DSH 终末地风格工作台 1.0.1](./cover/dsh-endfield-workbench-readme-banner-5x2.png)

为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 制作的终末地工业风界面插件，同时提供 Windows 和 macOS 桌面端。插件通过 DSH 标准 Cordis Bundle 加载，不修改 DSH 核心文件。

## 主要功能

- 终末地风格开屏、工业网格、等高线侧栏与黄灰组件。
- better-sidebar 右侧工作台：文件、编辑器、浏览器、终端、Git、任务和子代理。
- `OBJECTIVE` 直接使用 DSH 原生 Goal，与 `/goal` 和 GoalBar 同步。
- 兼容 DSH 官方 Vision 附件链路，适配三种外观模式。
- 桌面端支持环境诊断、可选一键配置、单实例和私有本地服务。

## 安装插件

目标环境：DSH `0.1.2-alpha.5`、Node.js `>=22.19.0`。

```bash
dsh plugin --profile web add ./rison-dsh-endfield-ui-1.0.1.tgz --allow-build=node-pty
dsh web
```

安装后普通启动 `dsh web` 即可自动加载主题，无需手动复制 CSS 或追加 `--patch`。

卸载插件：

```bash
dsh plugin --profile web remove @rison/dsh-endfield-ui
```

卸载只会移除 Web Profile 的插件依赖，不删除 `.dsh` 中的会话、模型或用户设置。

## 桌面端

- **Windows x64**：`DSH-Endfield-Workbench-Setup-1.0.1-x64.exe` 或需完整解压的 `DSH-Endfield-Workbench-Portable-1.0.1-x64.zip`。
- **macOS Apple Silicon**：`DSH-Endfield-Workbench-1.0.1-macOS-arm64.zip`（ad-hoc 签名）。

桌面端需要本机已安装 Node.js。首次启动会检测 Node、npm、pnpm、DSH 和终末地插件；检测到 Node 后，可由用户确认自动安装推荐版本的 DSH 与 pnpm。

桌面端会复用现有 `.dsh` 数据，不会迁移或清理会话。启动参数固定包含 `--no-open`，不会额外打开浏览器前端。

## 1.0.1 更新

- 适配 DSH `0.1.2-alpha.5` 和 better-sidebar `0.18.0-alpha.0`，增加 Windows/macOS 首次启动诊断。
- 新增 Windows Setup.exe 与便携 ZIP，并修复 DSH 0.1.2 桌面鉴权。
- 修复长文本、换行、斜杠命令和鼠标选区中的重影、卡顿与光标偏移。
- 修复右栏布局与交互、开屏黑框，并完善输入框、审批页和设置页的可读性。
- 移除旧视觉插件残留，恢复 DSH 官方附件链路；桌面包仅携带当前插件归档。

## 已知限制

- 内嵌浏览器仍受目标网站 CSP 和 `X-Frame-Options` 限制。
- better-sidebar 终端依赖 `node-pty`；构建失败时，其他工作台页面仍可使用。
- `dsh-shikitor@1.0.2` 的浏览器模块尚未完全适配 DSH 0.1.2，当前输入补全优先使用 DSH 原生能力。
- 桌面测试包尚未进行正式商业代码签名。

更完整的技术与维护说明见 [`HANDOFF.md`](./HANDOFF.md)，发布清单见 [`RELEASE.md`](./RELEASE.md)。
