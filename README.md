# DSH × 终末地风格工作台

> **非官方同人主题**：与游戏开发商及 DeepSeek 官方均无关联，不暗示合作或授权。

这个项目把终末地工业风视觉系统封装为 DeepSeek Harness 的独立 Cordis 插件，并提供可选的 Electron 桌面壳。当前源码与本地候选 App 版本为 `0.9.2`；插件、桌面 App、仓库 tag 与 GitHub Release 使用同一个 SemVer。插件已声明标准 `dsh.bundle`，可用一条命令安装并自动生效。

## v0.9.2 输入框投影修复（源码已推送，Release 待验收）

- 重构 Shikitor 输入兼容层：原生 `textarea` 只负责输入、IME 和 selection 数据，可见文字与黑色光标统一由富文本投影层绘制。
- 修复 `/goal`、`/compact`、长技能名称、`@文件`、`#会话`以及中英文多行输入中的光标偏移和文字重影。
- 鼠标拖选改为投影层选区，原生选中文字保持完全透明，解决选中内容后两套文字严重叠加的问题。
- 新增光标与选区几何回归脚本，覆盖软换行、内部滚动、窗口重排和原子引用标签。
- 桌面 App 改为内置并安装当前版本的插件归档，同时检查 better-sidebar 与 Shikitor 是否完整，避免源码链接缺少传递依赖而启动失败。
- 本节描述的是已经推送的 `0.9.2` 源码；本地 `.app` 已完成打包，但在验收完成前不上传 GitHub Release。

## v0.9.1 桌面单写入与版本统一

- 修复桌面 App 启动时额外打开默认浏览器 Web UI 的问题，避免 Electron 与浏览器同时成为同一会话的写入者。
- App 仍通过随机本地端口连接 DSH，但强制使用 `--host 127.0.0.1 --no-open --port 0`，服务仅供当前桌面窗口使用。
- 构建流程新增启动参数门禁；缺少 `--no-open` 或 loopback 绑定时直接判定构建失败。
- 从本版开始统一版本管理：插件、App、Git tag、Release 和产物文件名全部使用 `0.9.1`，后续修复递增补丁号，兼容/功能更新递增次版本号。

## v0.9.0 视觉模型兼容性更新

- 核心修复：解决选择 DeepSeek Vision 模型后仍提示“当前模型不支持图片”的问题。
- 升级并实测 `DeepSeek Harness 0.1.1-rc.2`，图片由 `deepseek-official` 原生附件链路直接发送给视觉模型，不再经过第三方视觉理解插件。
- 清理旧 `image-understanding` 插件残留配置，避免附件在发送前被旧适配器拦截或转换。
- 工作台依赖升级为 `dsh-better-sidebar@0.15.2` + `dsh-shikitor@1.0.2`，与新版 DSH 保持同一兼容线。
- 修复右侧工作台滚轮穿透：右栏列表滚到底后不再带动整个页面下移，主对话、右栏与底部面板始终锁定在视口内。
- 真实图片回归已通过：`DeepSeek-V4-Flash Vision` 能正确识别图标的主要图形、颜色与风格；隔离 Profile 安装与资源验证 `35/35` 通过。

## v0.8.5 更新与修复

- 修复“等待审批”白色卡片中的浅色文字，标题、原因、命令与按钮统一改为深色，并严格限制在审批组件作用域内。
- 修复初始“新会话”输入区文字仍为浅灰的问题；Shikitor 的可见输入投影改为深墨色，原生输入层保持透明，黑色光标和中灰占位符继续保留。
- 保留 `/goal`、`/compact` 等斜杠命令的单层绘制修复，并更新主题缓存标记，确保 Web 与 App 加载本次样式。

### v0.8.4 完整工作台更新

- 整合 `dsh-better-sidebar@0.12.3` 与 `dsh-shikitor@1.0.2`：右侧工作台包含 Explorer、编辑器、浏览器、终端、Git、任务与子代理页面，输入框支持 `@/#/$//` 补全。
- 接入 DSH 原生 Goal projection 的 `OBJECTIVE` 页面，与 `/goal` 和 GoalBar 共用同一份状态。
- 修复终末地适配层覆盖上游 fixed 定位、导致右栏掉到页面下方的布局回归，恢复右栏收放与宽度拖拽。
- 恢复 0.7.x 对话背景的低透明度 CSS 旋转圆环，只覆盖对话区域，并尊重系统的“减少动态效果”设置。
- 开场动画期间隐藏右侧工作台，动画结束后才按用户保存的展开/折叠状态滑入。
- 修复 Electron App 自绘标题拖拽区吞掉右栏顶部按钮的问题；页面加号、收放、底部面板/终端与右栏宽度拖拽恢复可用。
- 移除右栏 Ardot 纹理上的半透明黑色遮罩，改为低透明度提亮混合；开屏期间纹理层也会完全隐藏，不再留下黑色方框。
- 删除开屏动画中原有的黑色全屏接力擦除层；黄色页面向右扫过时直接显示主界面，不再在右侧形成不透明黑色矩形。
- 开屏期间对 better-sidebar 宿主施加内联硬门禁，并监听延迟挂载/重新挂载；右栏在动画结束前完全不参与布局与合成。
- 开屏期间同步将 better-sidebar 保存的宽高布局变量视为 `0`，对话背景在黄色扫屏期间铺满全窗口，不再留下与右栏等宽的黑色空槽。
- 根据稳定 DOM 特征直接门禁右栏 fixed 面板本体（内联宽度 + `新建标签页` 操作），不依赖 `nArs4W_panel` 等可变 CSS Module 哈希类名。
- 保留 0.7.1 的浅色输入区黑字、设置页深色修复、Ardot 工业网格、左栏等高线纹理、开屏动画与 DeepSeek Harness 品牌插图。
- 修复 Shikitor 将原生 caret 隐藏后绘制的合成光标仍为浅色的问题；白色输入区现在固定使用黑色闪烁光标，并通过带版本标记的主题 URL 避免 Electron/Chromium 继续命中旧 CSS。
- 修复输入 `/goal`、`/compact` 等斜杠命令时首行文字重复绘制的问题；Shikitor 接管输入后仅显示高亮投影，原生 textarea 保持透明。
- 修复左栏装饰隔离层将原生 Settings 对话框裁切在折叠栏宽度内的问题，设置页恢复完整显示。

## 结构

- `endfield-ui-plugin/`：双端 dsh 插件。**核心交付物**。Host 端提供素材，Client 端加载视觉外壳。
- `github-connector/`：按插件形式安装的 **GitHub 连接器（远端 + Bearer）**。纯 Patch 层，自动生效。
- `github-connector-local/`：**GitHub 连接器（本地 stdio + OAuth）** —— 无需 PAT，服务器自己走 OAuth，体验更接近 WorkBuddy/Codex。纯 Patch 层。
- `desktop-app/`：Electron 桌面入口（可选）。自动启动本地 dsh、装载插件并打开窗口。
- `cover/`：封面图素材。
- `dsh-packaged-final.jpg` / `dsh-settings-final.jpg`：界面预览。

## 方式一：只装插件（推荐 Web 用户）

当前已发布稳定版仍为 `0.9.1`；`0.9.2` 需等待本地候选 App 验收后再发布：

```bash
dsh plugin --profile web add @rison/dsh-endfield-ui@0.9.1 --allow-build=node-pty
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

打包产物：`desktop-app/release/DSH 终末地工作台-darwin-arm64/DSH 终末地工作台.app`（`0.9.2`，ad-hoc 签名，适用于 Apple Silicon Mac 本地使用）。

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

- **阶段 1（标准整合插件）**：`dsh.bundle.patch` 已声明，better-sidebar、Shikitor、Goal projection 与终末地适配层已整合，隔离 Profile 验证 `35/35` 通过。✅
- **阶段 2（桌面壳消费标准插件）**：当前源码与本地候选 App 统一为 `0.9.2`，完成 dsh 自动发现、浏览器禁开、开屏门禁、桌面按钮命中区修复、输入投影修复、ad-hoc 签名与验证；Release 待用户验收。✅
- 发布说明见 `RELEASE.md`；素材许可证与已知问题见该文件。
- 详见 `HANDOFF.md`。
