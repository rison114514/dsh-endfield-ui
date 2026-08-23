# DSH 终末地工作台（桌面壳）

> **非官方同人主题**：与游戏开发商及 DeepSeek 官方均无关联。

轻量桌面壳：后台启动本机 DeepSeek Harness，自动装载随 App 携带的终末地 UI 插件（标准 bundle，无需 `--patch`），并在原生 Electron 窗口中打开。

## 运行（开发模式）

```bash
npm install
npm start
```

桌面壳会：

1. 按优先级发现 dsh：`DSH_BIN` 环境变量 → 上次用户选择（存于 `userData/dsh-launch.json`）→ `/opt/homebrew/bin`、`/usr/local/bin` 常见目录 → `PATH`。
2. 未发现 dsh 时显示终末地风格**引导页**：可选择 dsh 可执行文件、选择 deepseek-harness 源码目录（开发模式），或重新检测；选择结果只存本机用户数据。
3. 自动把 App 内插件以标准 bundle 方式加入 dsh web profile（追加精确的 `--allow-build=node-pty`，只授权 better-sidebar 的终端原生模块构建，幂等）。
4. 启动 `dsh --profile web --port 0`（**不再附加 `--patch`**），从日志识别 `http://127.0.0.1:<port>` 并加载。
5. 30 秒未出现本地地址则显示诊断页，提供「复制诊断信息」。
6. 窗口关闭 / 退出 / 崩溃均向 dsh 子进程发 `SIGTERM`，5 秒未退则 `SIGKILL`，避免残留端口。

dsh 的会话、模型与插件配置继续使用 `~/.dsh`，不会复制孤立数据。窗口仅加载 `127.0.0.1`，`contextIsolation`/`nodeIntegration:false`/`sandbox` 保持开启。

## 构建与签名（本地自用）

```bash
npm run pack:mac          # 构建 darwin-arm64 .app
npm run sign:mac:local     # ad-hoc 签名 + codesign --verify --deep --strict
npm run dist:mac:local     # 一键：语法检查 + npm pack 校验 + 打包 + 签名 + 校验
npm run pack:mac:x64       # Intel 构建（需 Intel 实机/CI 验证后才宣称可用）
```

产物：`release/DSH 终末地工作台-darwin-arm64/DSH 终末地工作台.app`。

## 单实例

使用 `app.requestSingleInstanceLock()`：第二次双击聚焦已有窗口，不启动第二个 dsh 服务。

## 公开分发

ad-hoc 签名仅适合本机自用。公开下载需 Developer ID Application 证书、Hardened Runtime / entitlements、`notarytool` 公证与 `stapler`。详见根目录 `HANDOFF.md` 4.7 与 `RELEASE.md`。
