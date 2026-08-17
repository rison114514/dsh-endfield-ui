# DSH 终末地工作台

桌面壳会在后台启动本机 DeepSeek Harness，使用随机空闲端口加载 `@rison/dsh-endfield-ui`，并在原生 Electron 窗口中打开。

```bash
npm start
```

桌面壳会在启动时自动把随 App 携带的 UI 插件链接到 dsh web profile，并直接调用主机安装的 `dsh` 命令。`app.config.json` 中的 `workspace` 是默认工作目录；目录不存在时回退到用户主目录。dsh 的会话、模型与插件配置继续使用 `~/.dsh`，不会复制一套孤立数据。

从 Finder 双击启动时，桌面壳会主动发现 `~/.local/bin`、Homebrew 与常见主机目录中的 dsh、Node 和 pnpm，并为子进程构造完整 `PATH`。它会过滤继承环境中的 WorkBuddy 路径，并使用本机 Node 直接执行 dsh，不让 `#!/usr/bin/env node` 回落到隔离运行时。也可通过 `DSH_BIN`、`DSH_NODE_BIN` 与 `DSH_PNPM_BIN` 显式指定可执行文件。

首次启动需要把 App 内的主题插件安装到 dsh Web profile，桌面壳会为这一步保留最多 120 秒；后续启动会跳过重复安装。
