# DSH × 终末地风格工作台

> **非官方同人主题**：与游戏开发商及 DeepSeek 官方均无关联，不暗示合作或授权。

这个项目把终末地工业风视觉系统封装为 DeepSeek Harness 的独立 Cordis 插件，并提供可选的 Electron 桌面壳。当前插件版本为 `0.8.4`，桌面 App 版本为 `0.1.10`；插件已声明标准 `dsh.bundle`，可用一条命令安装并自动生效。

## v0.8.4 更新与修复

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
- `desktop-app/`：Electron 桌面入口（可选）。自动启动本地 dsh、装载插件并打开窗口。
- `cover/`：封面图素材。
- `dsh-packaged-final.jpg` / `dsh-settings-final.jpg`：界面预览。

## 方式一：只装插件（推荐 Web 用户）

```bash
dsh plugin --profile web add @rison/dsh-endfield-ui@0.8.4 --allow-build=node-pty
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

桌面壳已改为消费标准插件：自动发现 `dsh`（`DSH_BIN`→用户选择→常见目录→`PATH`），未发现时显示终末地风格引导页（可选 dsh 可执行文件 / 源码目录），以标准 bundle 启动（**不再传 `--patch`**），含单实例锁、30s 启动超时与「复制诊断信息」、退出/崩溃可靠回收子进程。

打包产物：`desktop-app/release/DSH 终末地工作台-darwin-arm64/DSH 终末地工作台.app`（`0.1.10`，ad-hoc 签名，适用于 Apple Silicon Mac 本地使用）。

## 开发状态

- **阶段 1（标准整合插件）**：`dsh.bundle.patch` 已声明，better-sidebar、Shikitor、Goal projection 与终末地适配层已整合，隔离 Profile 验证 `32/32` 通过。✅
- **阶段 2（桌面壳消费标准插件）**：当前 App `0.1.10`，完成 dsh 自动发现、开屏门禁、桌面按钮命中区修复、ad-hoc 签名与验证，`dist:mac:local` 5/5 通过。✅
- 发布说明见 `RELEASE.md`；素材许可证与已知问题见该文件。
- 详见 `HANDOFF.md`。
