# DSH 终末地风格工作台 — v1.0.0 正式版

> **非官方同人主题（Unofficial fan-made theme）**：本项目与游戏开发商及 DeepSeek 官方均无关联，不暗示合作或授权。

`v1.0.0` 是从 `v0.5.0` 标准插件化起，经过完整工作台整合、Vision 兼容与输入框架重构后的首个正式版。

## 发布内容

- 插件：`rison-dsh-endfield-ui-1.0.0.tgz`
- macOS Apple Silicon 桌面 App：`DSH-Endfield-Workbench-1.0.0-macOS-arm64.zip`
- Git tag / GitHub Release：`v1.0.0`
- 目标环境：DSH `0.1.1-rc.2`、Node `>=22.19.0`
- 精确依赖：`dsh-better-sidebar@0.15.2`、`dsh-shikitor@1.0.2`

## 安装插件

下载 Release 中的 `.tgz` 后执行：

```bash
dsh plugin --profile web add ./rison-dsh-endfield-ui-1.0.0.tgz --allow-build=node-pty
dsh web
```

卸载只移除 Web Profile 中的插件依赖，不删除 Session、模型或用户设置：

```bash
dsh plugin --profile web remove @rison/dsh-endfield-ui
```

## 1.0.0 主要功能

- 终末地风格开屏、DeepSeek Harness 品牌插图、工业网格、等高线侧栏、旋转仪表圆环和黄灰工业组件。
- better-sidebar 完整右侧工作台：文件、编辑器、浏览器、终端、Git、任务与子代理；支持折叠和宽度拖拽。
- Shikitor 输入增强：`@文件`、`#会话`、`$ Skills`、`/命令`补全，以及中央编辑器。
- DSH 原生 Goal projection 的 `OBJECTIVE` 页面，与 `/goal` 和 GoalBar 共用状态。
- DSH 官方 Vision 附件链路，可将图片直接交给声明支持图片的 DeepSeek 模型。
- macOS 桌面壳：自动发现 DSH、自动装载内置插件、单实例、私有随机端口、退出时回收子进程。
- 可选 GitHub MCP 连接器：远端 Bearer 与本地 stdio + OAuth 两种方式。

## 重点修复

- **输入文字、光标与选区统一投影**：彻底修复斜杠命令重影、技能名浅黄、长文本光标上移/左移、软换行漂移，以及鼠标选中后的双层文字。
- **浅色表面可读性**：修复普通会话、新会话、用户消息、审批、设置与问卷卡片中的白底白字、白底浅灰字和浅黄字。
- **右栏几何与交互**：修复右栏掉到页面下方、无法折叠/拖拽、App 顶部按钮失效，以及滚动右栏带动整页下移。
- **开屏黑框与右栏泄漏**：动画期间完整隐藏右栏宿主、fixed 面板与占位尺寸，移除黑色接力擦除层和半透明罩层。
- **桌面端单写入**：使用 `--host 127.0.0.1 --no-open --port 0`，不再自动打开第二个浏览器前端。
- **插件归档与依赖完整性**：App 内置真实 `.tgz`，启动前检查 better-sidebar 与 Shikitor，避免 pnpm link 缺少传递依赖。
- **Vision 误判**：移除旧视觉理解插件残留，改走 DSH 官方多模态路径，解决视觉模型仍拒绝图片的问题。

## 版本演进

- `0.5.0`：标准 `dsh.bundle`，一条命令安装并自动生效。
- `0.6.0`：工业网格、等高线侧栏、黄色命令按钮、真实上下文进度环。
- `0.7.x`：品牌开屏与浅色界面可读性修复。
- `0.8.x`：better-sidebar、Shikitor、原生 Goal 完整整合；集中修复布局、开屏和 App 交互。
- `0.9.0`：官方 Vision 链路与右栏滚动隔离。
- `0.9.1`：桌面端单写入和统一版本管理。
- `0.9.2`：输入投影框架与 App 内置插件归档。
- `1.0.0`：汇总并正式发布以上能力。

## macOS App 说明

1. 解压 `DSH-Endfield-Workbench-1.0.0-macOS-arm64.zip`。
2. 本机需已安装可运行的 DSH `0.1.x` 和 Node 22。
3. 双击 App 后会复用 `~/.dsh` 中的会话、模型和插件配置。
4. App 只启动一个私有 DSH 服务，不额外打开浏览器页面。

当前 App 使用 **ad-hoc 签名**，尚未进行 Apple Developer ID 签名与公证。首次运行可能需要在 Finder 中右键选择“打开”，或在“系统设置 → 隐私与安全性”中确认。Intel x64 构建未做实机验收，本次只发布 Apple Silicon arm64。

## 已知限制

- 内嵌浏览器受目标网站 CSP / `X-Frame-Options` 限制时，请使用“在外部浏览器打开”。
- 终端依赖 `node-pty`，安装命令只为该依赖授权构建；失败时其他工作台页面仍可使用。
- DSH 大版本升级可能改变 DOM 或插件接口；本版只承诺上述目标版本兼容线。
- 视觉素材与字体按仓库现有许可说明分发；本项目不主张原游戏商标或官方素材权利。

## SHA-256

- `DSH-Endfield-Workbench-1.0.0-macOS-arm64.zip`：`9dbabd1b5711465796a0203464f5a1dac50fc2b685a2be5688f3b36e669d84ba`
- `rison-dsh-endfield-ui-1.0.0.tgz`：`b0dbb2240159e166a4af7919541ec63cf7334f723313f5fd22e69f3f5eddc080`

完整功能、历史修复与开发说明见仓库 `README.md`、`endfield-ui-plugin/README.md` 和 `HANDOFF.md`。
