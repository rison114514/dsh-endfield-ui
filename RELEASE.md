# DSH 终末地风格工作台 — 发布说明（v0.5.0）

> **非官方同人主题（Unofficial fan-made theme）**：本插件与游戏开发商及 DeepSeek 官方均无关联，不暗示任何合作或授权。

## 这是什么

把终末地工业风视觉系统封装为 DeepSeek Harness 的独立 Cordis 插件，并提供可选的 Electron 桌面壳。插件是核心交付物；桌面 App 只是可选的运行入口。

## 版本

- 插件：`@rison/dsh-endfield-ui@0.5.0`
- 桌面壳：`dsh-endfield-workbench@0.1.4`

## 兼容的 dsh 版本

- **已实测**：`dsh 0.1.0-rc.6`（本机 `dsh --profile web --port 0`）。
- 本主题通过若干 dsh DOM / CSS Module 特征选择器实现覆盖，dsh 大版本升级时可能需要同步维护；`package.json` 暂未写入宽泛兼容声明，待确认范围后补充准确约束。
- 桌面壳要求本机已安装可运行的 `dsh` 命令（0.1.x 系列）。

## 安装与使用（Web 用户，推荐）

```bash
dsh plugin --profile web add ./rison-dsh-endfield-ui-0.5.0.tgz   # 或 npm / GitHub tag
dsh web
```

- 升级：`dsh plugin --profile web update @rison/dsh-endfield-ui`
- 卸载：`dsh plugin --profile web remove @rison/dsh-endfield-ui`（恢复原生前端，用户数据不受影响）

安装后普通 `dsh web` 即自动加载终末地风格，无需复制 CSS、改 `~/.dsh` 或追加 `--patch`。

## 桌面 App（macOS）

- `DSH 终末地工作台-darwin-arm64.zip`（ad-hoc 签名，仅本人/受信 Mac 自用）。
- 双击启动 → 自动发现 dsh → 装载插件 → 打开窗口；用户数据复用 `~/.dsh`。
- 无 dsh 时显示引导页，可手动选择 dsh 可执行文件或源码目录。
- 公开分发需 Developer ID 签名 + 公证（见 `HANDOFF.md` 4.7），当前构建未做。

## 素材与许可证

- 视觉层不修改 dsh 核心源码；用户数据位于 `~/.dsh`。
- 第三方字体：Harmony（思源/鸿蒙系衍生）、Novecento、Space Grotesk —— 分发时保留各自许可证文件。
- 图片素材含参考游戏视觉生成的内容；**公开发布前需逐项确认授权**：对无法确认授权的官方角色图、Logo、职业图标，应替换为原创或可再分发素材。
- 安装包中仍含 `operator-xaihi.png`、`workbench-logo.png` 等当前未在视觉层引用的素材，下一版本将清理（见已知问题）。

## 已知问题

1. 未引用素材仍在分发：`operator-xaihi.png`、`workbench-logo.png` 等（`npm pack` 仍包含），计划 0.6.0 清理。
2. 桌面壳 `pack:mac:x64` 仅完成构建练习，尚无 Intel 实机/CI 验证，暂不宣称 x64 可用。
3. 当前仅 ad-hoc 签名，未做 Developer ID 签名与公证，不能直接对外公开下载。
4. dsh 大版本升级可能需同步维护 CSS 特征选择器；升级 dsh 后若主题异常，先卸载插件确认原生页面正常。
5. 桌面壳首次启动安装插件最多等待 120 秒；若超时请检查 dsh 版本与网络。

## 验收摘要（实测 8/8 通过）

- 隔离 `DSH_HOME` 中 `plugin add` 成功，`profiles/web/package.json` 出现依赖。
- `dsh.profile.bundles` 自动包含 `@rison/dsh-endfield-ui`。
- `dsh --profile web` **未带 `--patch`** 启动，`/endfield-ui/theme.css` 返回 200。
- 卸载后依赖被移除，原生页面可恢复。

详见 `HANDOFF.md`（目标定义、实施顺序、完成定义）与 `endfield-ui-plugin/README.md`。
