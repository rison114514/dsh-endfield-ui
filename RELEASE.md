# DSH 终末地风格工作台 — v1.0.2

> **非官方同人主题（Unofficial fan-made theme）**：本项目与游戏开发商及 DeepSeek 官方均无关联，不暗示合作或授权。

`v1.0.2` 是启动链修复版，重点解决部分设备安装后出现 `web boot: 1 entry did not activate` / `pending (waiting for service: betterSidebar)` 的问题，并保留 1.0.x 已有的视觉、Vision、输入框、桌面单写入与环境诊断能力。

## 发布内容

- 插件：`rison-dsh-endfield-ui-1.0.2.tgz`
- macOS Apple Silicon：`DSH-Endfield-Workbench-1.0.2-macOS-arm64.zip`
- Windows x64 安装版：`DSH-Endfield-Workbench-Setup-1.0.2-x64.exe`
- Windows x64 便携版：`DSH-Endfield-Workbench-Portable-1.0.2-x64.zip`
- Git tag / GitHub Release：`v1.0.2`
- 目标环境：DSH `0.1.2-alpha.5`、Node `>=22.19.0`
- 精确工作台依赖：`dsh-better-sidebar@0.18.0-alpha.0`

## 核心修复

- better-sidebar 与 Endfield 改为 Web Profile 的两个根级直接依赖和唯一 bundle，不再依赖 pnpm 对传递依赖的提升方式。
- 同时验证 pnpm `isolated` 与 `hoisted` 布局，bundle 数组顺序不再影响 OBJECTIVE 注册。
- Endfield 通过可选 `betterSidebar` 服务注入启动；侧栏缺失时视觉层降级可用，不再拖垮整个 Web boot。
- 桌面端检测根级包、精确版本和 bundle 唯一性；组合不完整时进入环境向导，不在普通启动路径静默改写 Profile。
- 一键配置后执行安装复检，避免界面显示完成但实际仍缺少侧栏 bundle。
- 不再自动安装或挂载尚未适配 DSH 0.1.2 runtime 的 `dsh-shikitor@1.0.2`；输入补全使用 DSH 原生能力。

## 保留能力

- 终末地开屏、工业网格、等高线侧栏、旋转仪表圆环和黄灰工业组件。
- better-sidebar 文件、编辑器、浏览器、终端、Git、任务与子代理页面，以及折叠和宽度拖拽。
- 与 `/goal`、GoalBar 共用原生 projection 的 `OBJECTIVE` 页面。
- DSH 官方 Vision 附件链路和深色、浅色、跟随系统三种外观适配。
- 输入投影、长文本、换行、光标、选区和斜杠命令的既有修复。
- Windows/macOS 环境诊断、单实例、私有随机端口、`--no-open` 与子进程回收。

## 安装插件

下载 Release 中的 `.tgz` 后执行：

```bash
dsh plugin --profile web add dsh-better-sidebar@0.18.0-alpha.0 ./rison-dsh-endfield-ui-1.0.2.tgz --allow-build=node-pty
dsh web
```

卸载只移除 Web Profile 中的插件依赖，不删除 Session、模型或用户设置：

```bash
dsh plugin --profile web remove @rison/dsh-endfield-ui dsh-better-sidebar
```

## 桌面端说明

- macOS 包使用 ad-hoc 签名，首次运行可能需要在 Finder 中右键“打开”或在系统隐私与安全设置中确认。
- Windows 便携版必须完整解压 ZIP，不能只复制其中的 EXE。
- 桌面端复用现有 `~/.dsh` 或 `%USERPROFILE%\.dsh`，不会迁移、清空或重建会话数据。
- App 只回收自己创建的 DSH 子进程，不影响用户在其他终端主动启动的服务。

## 已知限制

- 内嵌浏览器仍受目标网站 CSP / `X-Frame-Options` 限制。
- 终端依赖 `node-pty`；构建失败时其他工作台页面仍可使用。
- 本版只承诺 DSH `0.1.2-alpha.5` 兼容线；升级 DSH 或 better-sidebar 前需重新验证。
- 桌面测试包尚未进行商业代码签名或 Apple 公证。

## SHA-256

- `rison-dsh-endfield-ui-1.0.2.tgz`：`3fdf80e48b0dc7ff98df99088f16c7dff7115785b23172b1880e677bfc980ea9`
- `DSH-Endfield-Workbench-1.0.2-macOS-arm64.zip`：`ddcf3d97b1679c47015ce46cdd28f0c2b69b373a88f2971e0d859f33af1e6b0e`
- `DSH-Endfield-Workbench-Setup-1.0.2-x64.exe`：`PENDING`
- `DSH-Endfield-Workbench-Portable-1.0.2-x64.zip`：`PENDING`
