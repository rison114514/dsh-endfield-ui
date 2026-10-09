# DSH 终末地风格插件交接文档

> 最后更新：2026-10-09
>
> 当前版本：`1.1.0`
>
> 兼容基线：DSH `0.2.0-rc.2`、`dsh-better-sidebar@0.24.1`

## 当前交付边界

核心且唯一的发布产物是 `@rison/dsh-endfield-ui` 插件 tarball。插件支持：

- DeepSeek Harness 官方 macOS / Windows Desktop 的 `desktop` Profile。
- DSH Web 的 `web` Profile。

从 `1.1.0` 起，仓库不再维护或发布自建 Electron App，不再构建安装器、便携包、签名、公证、更新器或环境向导。`desktop-app/` 仅保留历史参考，不应重新加入 Release。

## 安装模型

官方 Desktop：

```bash
dsh plugin --profile desktop add dsh-better-sidebar@0.24.1 ./rison-dsh-endfield-ui-1.1.0.tgz
```

Web：

```bash
dsh plugin --profile web add dsh-better-sidebar@0.24.1 ./rison-dsh-endfield-ui-1.1.0.tgz
dsh web
```

Desktop 与 Web Profile 隔离。官方 Desktop 应先启动一次并完全退出，再使用其“管理 dsh 命令…”注册的内置 CLI 安装插件；普通 npm 旧版 `dsh` 不保证能管理 `desktop` Profile。

## 项目结构

```text
endfield-ui-plugin/
├── package.json          # 插件清单与兼容版本
├── cordis.patch.yml      # Host bundle patch
├── index.js              # 静态资源路由
├── client.js             # 主题、开屏、Goal 与工作台适配
├── theme.css             # 终末地视觉与可读性修复
└── assets/               # 图片、字体、工作台工业图标
```

`dsh-better-sidebar` 必须与终末地插件一起成为目标 Profile 的直接依赖和唯一 bundle，不要再从终末地 `cordis.patch.yml` 内重复插入它。

## 关键实现约束

- `OBJECTIVE` 只读取 DSH 原生 Goal projection，不建立第二份 Store。
- Goal 操作使用官方 `ctx.remote.goals`，提交前读取最新 `{id, revision}`。
- 工作台样式依赖公开根标记，如 `[data-dsh-better-sidebar]` 与 `[data-dsh-panel-host]`，不得绑定 CSS Module 哈希类名。
- Vision 使用 DSH 官方附件链路；模型需正确声明图片输入能力，不恢复旧视觉理解插件。
- `dsh-shikitor@1.0.2` 不兼容 DSH 0.2，不应自动安装或挂载。
- 不修改、移动、清空或重建用户的 `.dsh` 会话和配置。
- 升级 DSH 或 better-sidebar 前必须重新验证，不得直接提升 `latest`。

## 发布流程

1. 更新 `endfield-ui-plugin/package.json` 的版本、内部修订与精确兼容映射。
2. 运行：

   ```bash
   cd endfield-ui-plugin
   npm pack
   ```

3. 运行语法、资源、bundle、布局和卸载验证；至少覆盖官方 Desktop 与 Web。
4. 计算 tarball SHA-256，写入 `RELEASE.md`。
5. GitHub Release 只附加 `rison-dsh-endfield-ui-<version>.tgz`。
6. 禁止上传 `.app`、`.dmg`、`.exe`、桌面 ZIP 或 `desktop-app/release/` 内容。

## 回归重点

- 开屏完成前侧栏不显示黑色占位；完成后展开、收起和拖拽正常。
- 文件、编辑器、浏览器、终端、Git、任务、子代理及 `OBJECTIVE` 可打开。
- 长文本、Shift+Enter 换行、斜杠命令、鼠标选区无重影、卡顿或光标偏移。
- 新会话、审批页、设置派生卡片在浅色、深色、跟随系统模式下可读。
- Vision 图片走 DSH 官方附件链路。
- 卸载后原生界面恢复，用户数据保持不变。

## 上游限制

- 内嵌浏览器受 CSP / `X-Frame-Options` 限制时，应使用外部浏览器入口。
- 官方 Desktop 的运行时和 Profile 管理由 DSH 官方负责；本仓库只维护插件兼容。
- Windows 官方 Desktop 使用同一插件机制，但新版本发布前仍应安排 Windows 实机视觉回归。
