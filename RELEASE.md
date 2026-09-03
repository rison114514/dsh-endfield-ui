# DSH 终末地风格工作台 — v1.0.1

> **非官方同人主题（Unofficial fan-made theme）**：本项目与游戏开发商及 DeepSeek 官方均无关联，不暗示合作或授权。

`v1.0.1` 将工作台兼容线更新到 DSH `0.1.2-alpha.5`，并保留此前的视觉、Vision、输入框和桌面单写入修复。本次仅纠正并统一 1.0.1 版本，不使用误标的 1.1.0。

## 发布内容

- 插件：`rison-dsh-endfield-ui-1.0.1.tgz`
- macOS Apple Silicon 桌面 App：`DSH-Endfield-Workbench-1.0.1-macOS-arm64.zip`
- Windows x64 安装版：`DSH-Endfield-Workbench-Setup-1.0.1-x64.exe`
- Windows x64 便携版：`DSH-Endfield-Workbench-Portable-1.0.1-x64.zip`
- Git tag / GitHub Release：待用户验收后再同步为 `v1.0.1`
- 目标环境：DSH `0.1.2-alpha.5`、Node `>=22.19.0`
- 精确依赖：`dsh-better-sidebar@0.18.0-alpha.0`、`dsh-shikitor@1.0.2`

## 安装插件

下载 Release 中的 `.tgz` 后执行：

```bash
dsh plugin --profile web add ./rison-dsh-endfield-ui-1.0.1.tgz --allow-build=node-pty
dsh web
```

卸载只移除 Web Profile 中的插件依赖，不删除 Session、模型或用户设置：

```bash
dsh plugin --profile web remove @rison/dsh-endfield-ui
```

## 1.0.1 主要功能

- 终末地风格开屏、DeepSeek Harness 品牌插图、工业网格、等高线侧栏、旋转仪表圆环和黄灰工业组件。
- better-sidebar 完整右侧工作台：文件、编辑器、浏览器、终端、Git、任务与子代理；支持折叠和宽度拖拽。
- Shikitor 宿主能力继续保留；其浏览器模块尚未跟上 DSH 0.1.2 已删除的 runtime，因此当前不作为 client inject 的启动前置，输入补全暂以 DSH 原生能力为准。
- DSH 原生 Goal projection 的 `OBJECTIVE` 页面，与 `/goal` 和 GoalBar 共用状态。
- DSH 官方 Vision 附件链路，可将图片直接交给声明支持图片的 DeepSeek 模型。
- Windows/macOS 桌面壳：逐项诊断 Node、npm、pnpm、DSH 与插件；Node 存在时可选一键安装推荐环境，并保留单实例、私有随机端口和子进程回收。
- 可选 GitHub MCP 连接器：远端 Bearer 与本地 stdio + OAuth 两种方式。

## 重点修复

- **输入文字、光标与选区统一投影**：彻底修复斜杠命令重影、技能名浅黄、长文本光标上移/左移、软换行漂移，以及鼠标选中后的双层文字。
- **浅色表面可读性**：修复普通会话、新会话、用户消息、审批、设置与问卷卡片中的白底白字、白底浅灰字和浅黄字。
- **右栏几何与交互**：修复右栏掉到页面下方、无法折叠/拖拽、App 顶部按钮失效，以及滚动右栏带动整页下移。
- **开屏黑框与右栏泄漏**：动画期间完整隐藏右栏宿主、fixed 面板与占位尺寸，移除黑色接力擦除层和半透明罩层。
- **桌面端单写入**：使用 `--host 127.0.0.1 --no-open --port 0`，不再自动打开第二个浏览器前端。
- **DSH 0.1.2 桌面鉴权**：桌面壳等待完整的 `dsh web:` 就绪行，再加载含一次性 process token 的完整地址并换取签名 Cookie；避免 stdout 分块时提前访问无 token 的根地址而得到 401。
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

1. 解压 `DSH-Endfield-Workbench-1.0.1-macOS-arm64.zip`。
2. 本机需已安装 Node `>=22.19.0`；首次启动页可在确认后安装推荐的 DSH 与 pnpm。
3. 双击 App 后会复用 `~/.dsh` 中的会话、模型和插件配置。
4. App 只启动一个私有 DSH 服务，不额外打开浏览器页面。

当前 App 使用 **ad-hoc 签名**，尚未进行 Apple Developer ID 签名与公证。首次运行可能需要在 Finder 中右键选择“打开”，或在“系统设置 → 隐私与安全性”中确认。Intel x64 构建未做实机验收，本次只发布 Apple Silicon arm64。

Windows 由 GitHub Actions `windows-latest` 生成 NSIS Setup.exe 与完整便携 ZIP。CI 只保存待验收的 Artifact，不自动上传 Release。便携版必须整包解压，不能单独复制 EXE。

## 已知限制

- 内嵌浏览器受目标网站 CSP / `X-Frame-Options` 限制时，请使用“在外部浏览器打开”。
- 终端依赖 `node-pty`，安装命令只为该依赖授权构建；失败时其他工作台页面仍可使用。
- DSH 大版本升级可能改变 DOM 或插件接口；本版只承诺上述目标版本兼容线。
- 视觉素材与字体按仓库现有许可说明分发；本项目不主张原游戏商标或官方素材权利。

## SHA-256

- `rison-dsh-endfield-ui-1.0.1.tgz`：`54aaabdd61097d5a193b8387d9261405b2556a21ba6273d2f0b6327b6864936f`
- `DSH-Endfield-Workbench-1.0.1-macOS-arm64.zip`：`327ba1d3e6c532e842ac9cda18e75490051a189c6fd5735eec60216a694db529`
- `DSH-Endfield-Workbench-Setup-1.0.1-x64.exe`：`5fcbe77637da6e0d8364da20a7c5697e7457041d52a14f434f48823d17baf412`
- `DSH-Endfield-Workbench-Portable-1.0.1-x64.zip`：`e63fed9ddf3f64da6fae98ad97cedba3206cde754127b89618d39fdd8ffbbe1f`

误标的 1.1.0 归档不得发布。

完整功能、历史修复与开发说明见仓库 `README.md`、`endfield-ui-plugin/README.md` 和 `HANDOFF.md`。
