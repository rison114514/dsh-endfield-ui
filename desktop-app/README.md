# 自建桌面壳（已归档）

> **非官方同人项目；自 `1.1.0` 起停止维护。**

本目录保留早期 Electron 桌面壳的历史实现，仅用于代码参考。项目不再：

- 构建或发布 macOS `.app` / `.dmg`；
- 构建或发布 Windows `Setup.exe` / 便携 ZIP；
- 维护环境向导、安装器、签名、公证、自动更新或自建 DSH 启动链；
- 接受只针对该自建桌面壳的兼容性承诺。

请安装 DeepSeek Harness 官方 macOS / Windows Desktop，并把终末地插件安装到官方 `desktop` Profile：

```bash
dsh plugin --profile desktop add dsh-better-sidebar@0.24.1 ./rison-dsh-endfield-ui-1.1.0.tgz
```

官方 Desktop 应先启动一次并完全退出。若终端中的 `dsh` 不能管理 `desktop` Profile，请通过官方 App 的“管理 dsh 命令…”注册或修复其内置 CLI。

插件安装不会迁移或删除 `.dsh` 中的会话、模型与设置。当前维护范围与发布规则见仓库根目录的 [`README.md`](../README.md) 和 [`HANDOFF.md`](../HANDOFF.md)。
