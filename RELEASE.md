# DSH 终末地风格工作台 — 发布说明（v0.8.1）

> **非官方同人主题（Unofficial fan-made theme）**：本插件与游戏开发商及 DeepSeek 官方均无关联，不暗示任何合作或授权。

## 这是什么

把终末地工业风视觉系统封装为 DeepSeek Harness 的独立 Cordis 插件，并提供可选的 Electron 桌面壳。插件是核心交付物；桌面 App 只是可选的运行入口。

## 版本

- 插件：`@rison/dsh-endfield-ui@0.8.1`
- 桌面壳：`dsh-endfield-workbench@0.1.7`

## 兼容的 dsh 版本

- **目标并实测**：`dsh 0.1.0-rc.6`（本机 `dsh --profile web --port 0`）。
- 精确锁定 `dsh-better-sidebar@0.12.3` 与 `dsh-shikitor@1.0.2`；不允许使用 `latest`。Node 要求 `>=22.19.0`。
- 桌面壳要求本机已安装可运行的 `dsh` 命令（0.1.x 系列）。

## 安装与使用（Web 用户，推荐）

```bash
dsh plugin --profile web add ./rison-dsh-endfield-ui-0.8.1.tgz --allow-build=node-pty   # 或 npm / GitHub tag
dsh web
```

- 升级：`dsh plugin --profile web update @rison/dsh-endfield-ui`
- 卸载：`dsh plugin --profile web remove @rison/dsh-endfield-ui`（恢复原生前端，用户数据不受影响）

安装后普通 `dsh web` 即自动加载终末地风格，无需复制 CSS、改 `~/.dsh` 或追加 `--patch`。

## 本次更新（v0.8.1）

- 修复终末地适配层覆盖 better-sidebar 面板 `position: fixed`、导致右栏落入页面下方的问题。
- 恢复上游原生的右栏拖拽宽度、折叠按钮、布局占位与底栏独立开关。
- 工业纹理只绘制在 `--dsh-sidebar-width` 对应的右侧工作台区域，不再改变上游面板几何结构。

## 工作台整合（v0.8.0）

- 一条插件安装命令自动挂载 better-sidebar、Shikitor 和终末地适配层。
- 新增右侧完整工作台：Explorer、快速编辑、浏览器、终端、Git、任务与子代理。
- Shikitor 提供 `@/#/$//` 补全和中央编辑器，不改写用户外观或自动保存偏好。
- 新增 `OBJECTIVE` 页面，复用 DSH 原生 Goal projection 与 Remote RPC，不建第二份 Goal 状态。
- better-sidebar 样式只使用稳定根标记 `[data-dsh-better-sidebar]`，不依赖上游 CSS Module 哈希名。

## 历史更新（v0.7.1）

在 v0.7.0 基础上，仅针对 dsh 的**用户问卷 / 计划确认卡片**（模型轮询页，class 前缀 `Mbwy4a_`）做了可读性修复，并严格限定作用域，不影响 AI 气泡与全局对话区配色：

- **问卷卡片文字改黑（不加粗）**：`.Mbwy4a_card` 内部的前置小标签（eyebrow）、主问句（title）、选项名（optionLabel）统一改为深墨色 `#111417`；选项描述降为可读中灰 `#5d656a`。
- **选项序号改明黄**：`1/2/3…` 数字使用终末地主色 `#FFF44F`，并配深色圆底 + 明黄描边衬托（浅底上纯明黄不可见，需深色衬托才浮得出来）。
- **作用域安全**：本次修复**仅命中 `.Mbwy4a_card` 这一个浅色卡片**，使用具体 `color` 属性，未触碰任何 `--dsw-alias-label-*` 全局 token，因此**不会**导致此前「统一治理」误伤的「AI 回答深底深字 / 背景错乱」问题。

## 历史更新（v0.7.0）

基于 v0.6.0 的视觉基线，针对侧栏纹理与输入可读性做了两处修正：

- **侧栏条纹字纹理（`endfield-stripes-texture.svg`）透明化并收窄作用域**：
  - 素材去掉白底，只保留由均匀同向束状条纹构成的 END FIELD 竖排字母；叠在纸白边栏上只显灰条纹。
  - 作用域从「整条侧栏铺满」收紧到「会话列表区（工作区卡片下方）」——不透明的 workspace 卡片会自然遮住纹理顶部，使其读作「工作区之下」。
  - 恢复固定原尺寸 `160×1280`，不再做百分比动态缩放；超出列表高度的部分由容器裁掉（放得下就放下，放不下就算了）。
- **主输入框文字可读性修复**：对话区主输入框（hero 与非 hero 模式）统一强制深色文字（`#111417`）+ 深色光标 + 灰色占位符（`#6b7378`），解决浅色底 + 浅色字几乎不可见的问题。此前仅 hero 模式被显式覆盖，正常对话模式下占位符/文本会退回 dsh 默认浅色。

## 桌面 App（macOS）

- `DSH 终末地工作台-darwin-arm64.zip`（ad-hoc 签名，仅本人/受信 Mac 自用）。
- 双击启动 → 自动发现 dsh → 装载插件 → 打开窗口；用户数据复用 `~/.dsh`。
- `0.1.5` 起仅在内置插件版本更新时覆盖安装，禁止旧 App 将用户已安装的新版本降级；`0.1.6` 起首次安装会精确授权 `node-pty` 构建。
- 无 dsh 时显示引导页，可手动选择 dsh 可执行文件或源码目录。
- 公开分发需 Developer ID 签名 + 公证（见 `HANDOFF.md` 4.7），当前构建未做。

## 素材与许可证

- 视觉层不修改 dsh 核心源码；用户数据位于 `~/.dsh`。
- 第三方字体：Harmony（思源/鸿蒙系衍生）、Novecento、Space Grotesk —— 分发时保留各自许可证文件。
- 图片素材含参考游戏视觉生成的内容与两张用户提供的素材（`chat-grid-bg.jpg` 工业网格背景、`contour-texture.png` 等高线纹理）；**公开发布前需逐项确认授权**：对无法确认授权的官方角色图、Logo、职业图标，应替换为原创或可再分发素材。
- 全部素材随包分发：`operator-xaihi.png` 实际被旋转圆圈（`.ef-atmosphere-operator`）使用；`workbench-logo.png` 暂未被代码引用，按用户要求保留不清理；`endfield-sidebar-texture.png` 为历史保留版本（字母方向有误），不在 theme.css 使用，但随包保留。

## 已知问题

1. `workbench-logo.png` 在视觉层未引用，仍随包分发（按用户要求保留，未清理）。
2. 桌面壳 `pack:mac:x64` 仅完成构建练习，尚无 Intel 实机/CI 验证，暂不宣称 x64 可用。
3. 当前仅 ad-hoc 签名，未做 Developer ID 签名与公证，不能直接对外公开下载。
4. dsh 大版本升级可能需同步维护 CSS 特征选择器；升级 dsh 后若主题异常，先卸载插件确认原生页面正常。
5. 桌面壳首次启动安装插件最多等待 120 秒；若超时请检查 dsh 版本与网络。

## 验收摘要（实测 24/24 通过）

隔离 `DSH_HOME` 真实使用级校验全部通过：

- `plugin add` 成功，`profiles/web/package.json` 出现依赖；`dsh.profile.bundles` 自动包含 `@rison/dsh-endfield-ui`。
- `dsh --profile web` **未带 `--patch`** 启动；首屏 200 且含 endfield 字样。
- `GET /endfield-ui/theme.css` → 200，含终末地标记、网格背景、等高线纹理、圆形进度环与命令按钮样式。
- 插件 client 入口经包名路由暴露为 `/@rison/dsh-endfield-ui/client.js` → 200，且含 `ContextRing` 注入逻辑。
- better-sidebar 与 Shikitor 的声明版本、实际安装版本均严格匹配 `0.12.3` / `1.0.2`，三层 patch 顺序正确。
- `OBJECTIVE` 注册、原生 Goal projection 订阅与官方 Goal Remote 调用均进入安装包；页面层另有错误边界，不会拖垮右栏。
- 全部 19 个运行时与保留素材（含 Ardot 工业网格）均 200 且为图片/字体。
- 卸载后 profile 中不残留主插件依赖或组合层。

详见 `HANDOFF.md`（目标定义、实施顺序、完成定义）与 `endfield-ui-plugin/README.md`。
