# DSH Endfield UI

> **非官方同人主题（Unofficial fan-made theme）**。本插件与游戏开发商及 DeepSeek 官方均无关联，不暗示任何合作或授权。如素材授权存在疑问，请见下方「素材与授权」一节。

`@rison/dsh-endfield-ui` 是一个**不修改 DeepSeek Harness 核心源码**的双端 Cordis 工作台插件：Host 端通过 `/endfield-ui/*` 提供本地视觉素材，Client 端使用官方 Theme Token、会话 projection 和公开插件服务构建终末地工业风外观。

1.1.0 面向 **DSH 0.2.0-rc.2** 兼容线，并精确配套 `dsh-better-sidebar@0.24.1`。better-sidebar 与终末地适配层由同一条官方命令安装为两个 Profile 根级 bundle，支持 DeepSeek Harness 官方 macOS / Windows Desktop 与 Web。终末地客户端对 `betterSidebar` 使用可选服务注入：侧栏缺失时视觉层仍能启动，不会让整个应用卡在 pending。0.24.1 已接入 DSH 原生右侧栏并将终端交还宿主，因此不再需要 `node-pty` 构建授权。`dsh-shikitor@1.0.2` 的 peer 范围止于 DSH `<0.2.0`，不再自动安装或挂载；输入补全使用 DSH 原生能力。

0.6.0 起逐步形成当前视觉基线：右侧对话栏使用低透明度 Ardot 工业网格，白色侧栏加入等高线纹理，输入区「命令」按钮改为柠檬黄，右下角改为读取 dsh 原生 projection 的上下文进度环。

0.5.0 版**新增标准 `dsh.bundle` 声明**：安装后 `cordis.patch.yml` 会自动进入 web profile 的启动层，普通 `dsh web` 即可自动加载，无需手动复制 CSS、修改 `~/.dsh` 或追加 `--patch`。

## 官方 Desktop 安装（推荐）

先启动一次 DeepSeek Harness 官方 Desktop，再完全退出（Windows 还需退出系统托盘），并通过官方 App 的“管理 dsh 命令…”注册其内置 CLI。从 GitHub Release 下载插件 tarball 后执行：

```bash
dsh plugin --profile desktop add dsh-better-sidebar@0.24.1 ./rison-dsh-endfield-ui-1.1.0.tgz
```

重新打开官方 Desktop 后自动生效。普通 npm 旧版 `dsh` 可能无法管理独立的 `desktop` Profile。

## Web 安装

```bash
dsh plugin --profile web add dsh-better-sidebar@0.24.1 ./rison-dsh-endfield-ui-1.1.0.tgz
dsh web
```

`desktop` 与 `web` Profile 相互隔离，需要分别安装。

## 升级 / 卸载 / 重装

```bash
# 升级 / 修复组合层
dsh plugin --profile web add dsh-better-sidebar@0.24.1 ./rison-dsh-endfield-ui-1.1.0.tgz

# 卸载（恢复 dsh 原生前端，用户数据不受影响）
dsh plugin --profile web remove @rison/dsh-endfield-ui dsh-better-sidebar

# 重新安装（在 tarball 所在目录执行）
dsh plugin --profile web add dsh-better-sidebar@0.24.1 ./rison-dsh-endfield-ui-1.1.0.tgz
```

## 1.1.0 工作台能力

- 右侧 better-sidebar：文件管理、快速编辑、内嵌浏览器、终端、Git、任务与子代理。新会话默认只打开 Explorer，其余页面从 `+` 菜单打开。
- DSH 原生输入能力负责文件、会话、Skills 与命令补全；不再挂载与 0.1.2 runtime 不兼容的 Shikitor 浏览器模块。
- `OBJECTIVE` 页面：直接读取当前会话原生 Goal，提供编辑、暂停、恢复和清除。首次出现活动 Goal 时自动加入并聚焦该标签，但不强制展开已收起的右栏。
- 原生 `/goal` 和输入框上方 GoalBar 继续保留；`OBJECTIVE` 不创建独立 Store。
- 对话背景恢复 0.7.x 的低透明度旋转仪表圆环，并根据右栏宽度动态裁切；系统启用“减少动态效果”时停止旋转。
- 开场动画期间隐藏工作台并保持主对话全宽；动画结束后释放上游原生滑入，不修改用户保存的展开/折叠状态。
- 右侧工作台内部列表保持独立滚动，滚到边界后不再把滚轮事件传给整页；页面根容器和工作台 portal 固定在视口内，避免整体下移错位。
- 官方 Desktop 中页面加号、收放、底部面板/终端及宽度拖拽保持可交互。
- 新会话与普通会话的输入框保留终末地深色文字、黑色光标、工业黄选区和引用标签外观；兼容样式只在用户另行安装且能够正常运行 Shikitor 时生效。
- “等待审批”浅色卡片使用稳定的 `data-approval-key` 作用域覆盖深色标题、原因、命令与按钮文字，不改写深色对话区的全局颜色 token。

### 上游限制

- better-sidebar 的内嵌浏览器使用 sandbox iframe；被目标站点 CSP 或 `X-Frame-Options` 拒绝时，请使用其“在外部浏览器打开”。
- 终端由 DSH 0.2 原生右侧栏提供。better-sidebar 0.24.1 自身不再依赖 `node-pty`，插件安装不需要构建授权。

## 干净环境验证

建议在隔离目录中验证，避免只在本机 `~/.dsh` 上测试：

```bash
DSH_TEST_HOME="$(mktemp -d)"
export DSH_HOME="$DSH_TEST_HOME"

dsh plugin --profile web add dsh-better-sidebar@0.24.1 ./rison-dsh-endfield-ui-1.1.0.tgz
dsh --profile web
```

验收要点：

1. `$DSH_HOME/profiles/web/package.json` 中同时存在 `dsh-better-sidebar` 与终末地插件两个直接依赖。
2. `dsh.profile.bundles` 中各出现一次 `dsh-better-sidebar` 与 `@rison/dsh-endfield-ui`；数组顺序不影响运行，OBJECTIVE 会等待公开服务就绪。
3. 启动命令**没有** `--patch`。
4. `GET /endfield-ui/theme.css` 返回 200。
5. 浏览器加载后出现开屏与主题。
6. 刷新页面不会重复注入样式或 overlay。
7. 卸载后 `dsh web` 恢复原始主题，没有 404 素材请求。

## 视觉与功能回归

| 场景 | 验收内容 |
|---|---|
| 新会话首页 | 左上品牌、白色等高线侧栏、对话区工业网格背景（非纯黑）、输入框白底黑字 |
| 输入区 | 「命令」按钮为柠檬黄、在白色输入框中清晰可辨 |
| 右下角 | 圆形上下文进度环：有上下文数据时显示真实占用百分比，无数据时显示 IDLE |
| 已有对话 | 用户气泡白底黑字、助手内容可读、代码块正常 |
| 工作区 | 活动工作区灰黑卡片清晰，文件夹图标不与背景混色 |
| 设置 | 浅色、深色、跟随系统三种设置均无白底白字，折叠左栏时对话框仍完整显示 |
| 输入光标与选区 | 白色输入区使用 Shikitor 黑色合成光标与投影选区；长文本自动换行、增高、滚动、鼠标拖选后位置仍准确且没有重影 |
| 斜杠命令 | 输入 `/goal`、`/compact` 或长技能名时只有一层字形，补全弹层、投影文字、光标和选区保持同步 |
| 开屏 | 无人物图；Deepseek Harness 品牌正确；约 3.5 秒退场正常 |
| 窄窗口 | 980×640 不遮挡输入、侧栏和操作按钮 |
| 刷新/HMR | 不重复添加 `<link>`，不出现双开屏 |
| 卸载 | dsh 原生页面恢复，用户数据不受影响 |

## 素材与授权

当前素材目录包含参考游戏视觉生成的图片与第三方字体，以及两张用户提供的素材（`chat-grid-bg.jpg` 工业网格背景、`contour-texture.png` 等高线纹理）。**公开发布前需逐项确认授权范围**：

- 对无法确认授权的官方角色图、Logo、职业图标和字体，应替换为原创或可再分发素材。
- 已保留第三方字体（Harmony / Novecento / Space Grotesk）与图片素材，分发时一并保留其许可证文件。
- `operator-xaihi.png` **实际被旋转圆圈（`.ef-atmosphere-operator`）使用**，并非未引用；`workbench-logo.png` 暂未被代码引用，但按用户要求随包保留。全部素材均随包分发，未做清理。

## 兼容性

1.1.0 只对 **DSH 0.2.0-rc.2 + Node >=22.19.0** 做隔离构建验证。`dsh-better-sidebar` 精确锁定 `0.24.1`，并必须作为 Web Profile 的直接 bundle 安装。工作台样式仅依赖 better-sidebar 公开的 `[data-dsh-better-sidebar]` / `[data-dsh-panel-host]` 根标记和公开尺寸变量 `--dsh-sidebar-width` / `--dsh-sidebar-height`，不依赖其 CSS Module 哈希类名，也不覆盖上游面板定位。Vision 模型必须在 `llm-deepseek.models` 中声明 `inputModalities: [text, image]`，由新版 DSH 原生附件服务发送图片。
