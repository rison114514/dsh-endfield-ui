# DSH × 终末地风格工作台

> **非官方同人主题**：与游戏开发商及 DeepSeek 官方均无关联，不暗示合作或授权。

这个项目把终末地工业风视觉系统封装为 DeepSeek Harness 的独立 Cordis 插件，并提供可选的 Electron 桌面壳。`1.0.0` 是从 `0.5.0` 标准插件化开始、经过完整工作台整合与多轮稳定性修复后的首个正式版。插件、桌面 App、Git tag 与 GitHub Release 使用同一个 SemVer。

## 1.0.0 正式版亮点

- **一条命令安装并自动生效**：标准 `dsh.bundle` + Cordis Patch，不修改 DSH 核心文件，不要求手工复制 CSS，也不需要追加 `--patch`。
- **终末地完整视觉层**：DeepSeek Harness 品牌开屏、黄色扫屏动画、暗色工业网格、左栏等高线纹理、低透明度旋转仪表圆环、黄灰工业边框、状态标签与灰黑选中卡片。
- **完整右侧工作台**：集成 `dsh-better-sidebar@0.15.2`，包含 Explorer、快速编辑、内嵌浏览器、终端、Git、任务与子代理页面；支持折叠和自由拖拽宽度。
- **增强输入与编辑**：集成 `dsh-shikitor@1.0.2`，支持 `@文件`、`#会话`、`$ Skills`、`/命令`补全，以及右栏快速编辑与中央深度编辑双入口。
- **原生 Goal 工作台**：`OBJECTIVE` 直接订阅 DSH 原生 Goal projection，与 `/goal` 和 GoalBar 共用同一份状态，支持编辑、暂停、恢复和清除，不建立第二套 Goal Store。
- **视觉模型原生兼容**：基于 DSH `0.1.1-rc.2` 的官方附件链路向 DeepSeek Vision 模型发送图片，不再依赖旧视觉理解插件。
- **独立桌面 App**：macOS arm64 Electron 壳自动发现本机 DSH、装载内置插件、启动私有随机端口，并以单实例方式运行。
- **可选 GitHub 连接器**：仓库同时提供远端 Bearer 与本地 stdio + OAuth 两种 GitHub MCP 连接方式。

## 1.0.0 重点错误修正

- **输入框重影与光标漂移**：原生 `textarea` 只保留输入、IME 与 selection 数据；可见文字、黑色光标和鼠标选区统一由 Shikitor 投影层绘制。修复 `/goal`、`/compact`、长技能名、`@文件`、`#会话`、中英文混排、多行软换行和内部滚动中的重复字形、光标上移/左移与选区重影。
- **浅色界面可读性**：修复普通会话、新会话首页、用户消息、等待审批、设置页、问卷/计划确认卡片中的白底白字、白底浅灰字和浅黄色文字；技能名、命令图标、光标和占位符均使用明确的浅色表面配色。
- **右栏布局与滚动**：修复适配层覆盖上游 `position: fixed` 导致右栏掉到页面下方；恢复折叠、拖拽与顶部按钮交互，并阻断右栏滚动穿透导致整页下移错位。
- **开屏期间右栏泄漏**：动画期间同时门禁 better-sidebar 宿主、fixed 面板和布局变量，清除黄色扫屏右侧的黑色矩形、半透明罩层和纹理残影；动画结束后恢复用户保存的展开状态。
- **桌面端按钮失效**：标题栏拖拽区域主动避让右侧工作台，修复加号、缩放/折叠、终端和宽度拖拽在 App 中无法点击的问题。
- **桌面端双写入**：启动参数固定为 `--host 127.0.0.1 --no-open --port 0`，不再额外打开浏览器 Web UI，避免 Electron 与浏览器同时写入同一会话。
- **插件打包缺依赖**：App 内置可安装的插件 `.tgz`，并校验 better-sidebar 与 Shikitor 的实际安装版本，避免 pnpm 源码链接未物化传递依赖而导致启动失败。
- **视觉模型误拒绝图片**：移除旧 `image-understanding` 适配残留，改走 DSH 官方多模态链路，解决 Vision 模型仍提示“当前模型不支持图片”。
- **会话数据安全**：插件卸载与升级只作用于 Web Profile 的插件依赖，不清理 `~/.dsh` 中的 Session、模型或用户设置；桌面壳退出时可靠回收它启动的唯一 DSH 子进程。

## 从 0.5.0 到 1.0.0

| 版本 | 主要变化 |
|---|---|
| `0.5.0` | 从页面级改造迁移为标准 `dsh.bundle` 插件，实现安装后自动生效与可卸载恢复。 |
| `0.6.0` | 建立工业视觉基线：Ardot 网格、等高线侧栏、黄色命令按钮、真实上下文进度环。 |
| `0.7.x` | 完成 DeepSeek Harness 品牌插图与开屏；修复活动工作区选中态、用户输入、问卷卡片及设置页的浅色可读性。 |
| `0.8.0–0.8.4` | 整合 better-sidebar、Shikitor 和原生 Goal；连续修复右栏下坠、无法拖拽/折叠、App 按钮失效、开屏黑框与右栏提前显示。 |
| `0.8.5` | 修复等待审批与新会话输入的浅色文字，稳定斜杠命令单层绘制。 |
| `0.9.0` | 升级到 DSH `0.1.1-rc.2`，恢复官方 Vision 图片链路；升级工作台依赖并修复右栏滚动穿透。 |
| `0.9.1` | 桌面端进入单写入模式，禁止自动拉起浏览器；统一插件、App、Tag 与 Release 版本号。 |
| `0.9.2` | 完成输入框投影框架重构、本地合成光标与投影选区，并修复 App 内置插件归档和依赖完整性。 |
| `1.0.0` | 汇总以上能力与修复，作为首个面向日常使用的正式版发布。 |

## 结构

- `endfield-ui-plugin/`：双端 dsh 插件。**核心交付物**。Host 端提供素材，Client 端加载视觉外壳。
- `github-connector/`：按插件形式安装的 **GitHub 连接器（远端 + Bearer）**。纯 Patch 层，自动生效。
- `github-connector-local/`：**GitHub 连接器（本地 stdio + OAuth）** —— 无需 PAT，服务器自己走 OAuth，体验更接近 WorkBuddy/Codex。纯 Patch 层。
- `desktop-app/`：Electron 桌面入口（可选）。自动启动本地 dsh、装载插件并打开窗口。
- `cover/`：封面图素材。
- `dsh-packaged-final.jpg` / `dsh-settings-final.jpg`：界面预览。

## 方式一：只装插件（推荐 Web 用户）

```bash
dsh plugin --profile web add ./rison-dsh-endfield-ui-1.0.0.tgz --allow-build=node-pty
dsh web
```

安装后普通 `dsh web` 自动加载终末地风格，无需手动复制 CSS、改 `~/.dsh` 或追加 `--patch`。
升级 / 卸载：`dsh plugin --profile web update|remove @rison/dsh-endfield-ui`。
详见 `endfield-ui-plugin/README.md`。

## 方式二：桌面 App（喜欢原生窗口的用户）

```bash
cd desktop-app
npm install
npm run pack:mac        # 构建 darwin-arm64 .app
npm run dist:mac:local  # 语法检查 + npm pack 校验 + 打包 + ad-hoc 签名 + 校验
```

桌面壳已改为消费标准插件：自动发现 `dsh`（`DSH_BIN`→用户选择→常见目录→`PATH`），未发现时显示终末地风格引导页（可选 dsh 可执行文件 / 源码目录），以标准 bundle 启动（**不再传 `--patch`**）；通过 `--no-open` 禁止额外打开浏览器，并保留单实例锁、30s 启动超时、「复制诊断信息」及退出/崩溃可靠回收子进程。

打包产物：`desktop-app/release/DSH 终末地工作台-darwin-arm64/DSH 终末地工作台.app`（`1.0.0`，ad-hoc 签名，适用于 Apple Silicon Mac 本地使用）。

## 方式三：GitHub 连接器（插件形式安装）

**偏好本地 stdio + OAuth（无需 PAT，推荐）**：

```bash
brew install github-mcp-server
dsh plugin --profile web add @rison/dsh-connector-github-local
dsh web        # 首次会自动弹浏览器做 GitHub OAuth 授权
```

**或远端服务器 + Bearer token**：

```bash
dsh plugin --profile web add @rison/dsh-connector-github
export GITHUB_TOKEN="github_pat_..."
dsh web
```

两者安装后普通 `dsh web` 即自动挂上 GitHub 工具（`mcp__github__*`）。差异与 caveat 见各连接器 `README.md`（本地 OAuth 的 token 只在服务器进程内存、dsh 重启需重新授权）。验证：`node scripts/smoke-connector.mjs <dir>`（隔离 DSH_HOME，8/8 通过）。

## 开发状态

- **阶段 1（标准整合插件）**：`dsh.bundle.patch` 已声明，better-sidebar、Shikitor、Goal projection 与终末地适配层已整合，隔离 Profile 验证 `37/37` 通过。✅
- **阶段 2（桌面壳消费标准插件）**：当前 App 与内置插件统一为 `1.0.0`，完成 dsh 自动发现、浏览器禁开、开屏门禁、桌面按钮命中区修复、输入投影修复、ad-hoc 签名与验证。✅
- 发布说明见 `RELEASE.md`；素材许可证与已知问题见该文件。
- 详见 `HANDOFF.md`。
