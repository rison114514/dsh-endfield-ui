# DSH 终末地工作台（桌面壳）

> **非官方同人主题**：与游戏开发商及 DeepSeek 官方均无关联。

轻量桌面壳：后台启动本机 DeepSeek Harness，自动装载随 App 携带的终末地 UI 插件（标准 bundle，无需 `--patch`），并在原生 Electron 窗口中打开。Windows 与 macOS 共用首次启动诊断页；用户只需先安装 Node.js，DSH、pnpm 与内置插件可在 App 内确认后自动配置。

从 `0.9.1` 起，桌面 App、终末地插件、仓库 tag 和 GitHub Release 使用同一个 SemVer，不再单独维护 App 的 `0.1.x` 版本线。当前本地构建版为 `1.0.1`，并支持 DSH 0.1.2 的一次性 token 启动地址与 Cookie 交换。

## 运行（开发模式）

```bash
npm install
npm start
```

桌面壳会：

1. 按优先级发现 dsh：`DSH_BIN` 环境变量 → 上次用户选择（存于 `userData/dsh-launch.json`）→ Windows/macOS 常见全局安装目录 → `PATH`。
2. 引导页分别检测 Node、npm、pnpm、DSH 与终末地插件的路径和版本。缺少 Node 时打开官方下载页；Node `>=22.19.0` 存在时，可在用户二次确认后安装 `@deepseek-ai/dsh@0.1.2-alpha.5` 和 `pnpm@11.7.0`。
3. 安装过程显示阶段与实时日志；不会调用 `sudo`、winget 或 brew。DSH 版本不一致时警告，但允许用户记住当前版本并继续启动。
4. 自动把 App 内插件以标准 bundle 方式加入 dsh web profile（追加精确的 `--allow-build=node-pty`，只授权 better-sidebar 的终端原生模块构建，幂等）。
5. 启动 `dsh --profile web --host 127.0.0.1 --no-open --port 0`（**不再附加 `--patch`**），只为 Electron 窗口提供随机本地端口，不再额外打开系统浏览器中的 Web UI。
6. 30 秒未出现本地地址则显示诊断页，提供「复制诊断信息」。
7. 窗口关闭 / 退出 / 崩溃均回收 App 自己启动的 DSH 子进程，不影响其他终端中由用户主动启动的服务。

dsh 的会话、模型与插件配置继续使用 `~/.dsh`，不会复制孤立数据。窗口仅加载 `127.0.0.1`，`contextIsolation`/`nodeIntegration:false`/`sandbox` 保持开启。

## 构建与签名（本地自用）

```bash
npm run pack:mac          # 构建 darwin-arm64 .app
npm run sign:mac:local     # ad-hoc 签名 + codesign --verify --deep --strict
npm run dist:mac:local     # 一键：语法检查 + npm pack 校验 + 打包 + 签名 + 校验
npm run pack:mac:x64       # Intel 构建（需 Intel 实机/CI 验证后才宣称可用）
npm run dist:win           # Windows 上生成 NSIS Setup.exe + 便携 ZIP
```

产物：`release/DSH 终末地工作台-darwin-arm64/DSH 终末地工作台.app`。

Windows 正式包由 `.github/workflows/windows-desktop.yml` 在 `windows-latest` 构建，产出 `DSH-Endfield-Workbench-Setup-1.0.1-x64.exe` 和 `DSH-Endfield-Workbench-Portable-1.0.1-x64.zip`。便携版必须解压完整 ZIP，不能只单独复制 EXE。CI 产物仅作测试附件，不自动发布 Release。

## 单实例

使用 `app.requestSingleInstanceLock()`：第二次双击聚焦已有窗口，不启动第二个 dsh 服务。DSH 启动参数强制包含 `--no-open`，避免 Electron 与默认浏览器同时成为同一会话的写入者。

## 公开分发

ad-hoc 签名仅适合本机自用。公开下载需 Developer ID Application 证书、Hardened Runtime / entitlements、`notarytool` 公证与 `stapler`。详见根目录 `HANDOFF.md` 4.7 与 `RELEASE.md`。
