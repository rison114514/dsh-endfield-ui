# DSH × 终末地风格工作台

> **非官方同人主题**：与游戏开发商及 DeepSeek 官方均无关联，不暗示合作或授权。

这个项目把终末地工业风视觉系统封装为 DeepSeek Harness 的独立 Cordis 插件，并提供可选的 Electron 桌面壳。当前插件版本 `0.5.0` 已声明标准 `dsh.bundle`，可用一条命令安装并自动生效。

## 结构

- `endfield-ui-plugin/`：双端 dsh 插件。**核心交付物**。Host 端提供素材，Client 端加载视觉外壳。
- `desktop-app/`：Electron 桌面入口（可选）。自动启动本地 dsh、装载插件并打开窗口。
- `cover/`：封面图素材。
- `dsh-packaged-final.jpg` / `dsh-settings-final.jpg`：界面预览。

## 方式一：只装插件（推荐 Web 用户）

```bash
dsh plugin --profile web add @rison/dsh-endfield-ui   # 或本地 tarball / GitHub tag
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
npm run dist:mac:local  # 检查语法 + 打包 + ad-hoc 签名 + 校验
```

> 注意：当前桌面壳 `app.config.json` 仍写死开发者本机路径，且启动依赖 `--patch`。
> 阶段 2 会改为自动发现 `dsh` 可执行文件、增加首次配置页、改用标准 bundle 启动并移除 `--patch`。

打包产物：`desktop-app/release/DSH 终末地工作台-darwin-arm64/DSH 终末地工作台.app`。

## 开发状态

- **阶段 1（标准插件）**：`dsh.bundle.patch` 已声明，0.5.0 发布准备中。✅
- **阶段 2（桌面壳消费标准插件）**：待开始。
- 详见 `HANDOFF.md`。
