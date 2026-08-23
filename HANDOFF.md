# DSH 终末地风格插件与桌面 App 交接文档

> 最后更新：2026-08-23
> 当前插件版本：`@rison/dsh-endfield-ui@0.8.0`
> 当前桌面端：`DSH 终末地工作台`，Electron 43，已生成 Apple Silicon `.app`

## 0.8.0 工作台整合交接（当前基线）

0.8.0 已从纯视觉包升级为 rc.6 完整工作台包。`endfield-ui-plugin/package.json` 以**精确版本**依赖 `dsh-better-sidebar@0.12.3` 和 `dsh-shikitor@1.0.2`；`cordis.patch.yml` 再以 better-sidebar、Shikitor、Endfield 适配层的顺序挂载。用户仍只需安装 `@rison/dsh-endfield-ui`。

关键兼容规则：

- 目标 DSH 固定为 `0.1.0-rc.6`；better-sidebar 固定 `0.12.3`，禁止用 `latest`。`0.13.x` 要求 rc.7，`0.15.2` 要求 rc.8。
- Shikitor 固定 `1.0.2`，要求 Node `>=22.19.0`。它负责输入框 `@/#/$//` 补全与中央编辑页。
- better-sidebar 保留自己的右栏快速编辑器。Shikitor 没有公开可嵌入 better-sidebar 的 React 组件，因此不要用 DOM 搬运或 fork 上游的方式强行合并；当前产品定义是“右栏快速编辑 + 中央深度编辑”。
- 内嵌浏览器受目标站点 CSP / `X-Frame-Options` 限制，被拒绝时走上游自带的外部打开入口。
- pnpm 11 安装命令必须显式附带 `--allow-build=node-pty`；DSH 会将该参数原样转发给 pnpm，仍是一条命令。不要改成对所有构建脚本的静默放行。node-pty 加载失败时，better-sidebar 0.12.3 会降级挂载并只禁用终端。

Goal 适配规则：

- `OBJECTIVE` 通过 `ctx.betterSidebar.registerTab()` 注册，每个会话为单例标签。
- 只订阅 `sessions.binding(sessionId).session.projections.faceOf('goal')`，不建第二份 Store。
- 编辑、暂停、恢复、清除调用 `ctx.remote.goals`，并在调用瞬间从 projection 读取最新 `{id, revision}`。
- 每个 Goal id 首次进入 active/paused/blocked 时自动加入右栏标签，但 type-only open 不强制展开收起的右栏。用户关闭后不在同一 Goal id 上反复弹回。
- 官方 GoalBar 和 `/goal` 保留；Goal 清除或完成后标签保留布局，页面显示 `/goal <目标>` 提示。

发布前必须运行 `scripts/verify-usage.mjs` 的隔离 Profile 测试，确认两个整合依赖的实际版本、三层 patch 顺序、OBJECTIVE/Goal Remote 代码、资源路由和卸载无残留。

## 1. 交接目标

继任者需要完成两个相互独立、可以组合交付的目标：

1. **目标 A：把现有视觉层完善为“一条命令安装并自动生效”的标准 dsh Web 插件。**
   - 用户已经安装 dsh。
   - 用户只执行一次 `dsh plugin --profile web add <包名> --allow-build=node-pty`。
   - 以后正常执行 `dsh web`，终末地风格自动加载。
   - 不要求用户复制 CSS、修改 `~/.dsh` 文件或手动追加 `--patch`。
   - 可以用标准命令升级和卸载，卸载后恢复原生 dsh 前端。

2. **目标 B：帮助用户把同一插件打包成可直接双击访问的 macOS `.app`。**
   - App 启动后自动启动本机 dsh Web 服务并打开窗口。
   - App 继续使用用户原有的 `~/.dsh` 会话、模型和插件配置。
   - 用户不需要先打开终端运行服务。
   - 退出 App 时回收由该 App 启动的 dsh 子进程。
   - 最终同时支持 Apple Silicon；如公开分发，再增加 Intel 或 Universal 构建、正式签名和公证。

这两个目标不要混为一谈：**插件是核心交付物，桌面 App 只是可选运行入口。** Web 用户只安装插件即可；喜欢原生窗口的用户再安装 App。

---

## 2. 当前项目结构与状态

> 本节保留了项目从 0.7.x 迁移到标准 bundle 的历史背景；凡与“0.8.0 工作台整合交接”冲突的描述，均以文首 0.8.0 基线为准。

```text
dsh接入终末地风格/
├── endfield-ui-plugin/       # 真正的 dsh 双端视觉插件
│   ├── package.json          # npm/dsh 清单
│   ├── index.js              # Host 端：通过 webServer 提供本地静态素材
│   ├── client.js             # Client 端：主题 Token、开屏、HUD、overlay
│   ├── theme.css             # 终末地风格覆盖
│   ├── cordis.patch.yml      # 把 Host 插件插入运行树
│   └── assets/               # 图片与字体
└── desktop-app/              # Electron 桌面壳
    ├── main.cjs              # 启动 dsh、安装插件、打开随机端口
    ├── app.config.json       # 当前写有开发者本机 dshRepo 绝对路径
    ├── package.json          # start / pack:mac
    └── release/              # 本机构建产物
```

### 2.1 已经完成的插件能力

- `index.js` 是 Host 插件，通过 `/endfield-ui/*` 提供 CSS、图片和字体。
- `client.js` 是 Web Client 插件：
  - 覆盖 dsh Theme Token；
  - 注入 `shell.overlay`；
  - 显示开屏动画、状态 HUD 和背景装饰；
  - 加载 `theme.css`。
- `cordis.patch.yml` 已能插入 `@rison/dsh-endfield-ui`。
- `package.json` 已声明 `dsh.client.platform = "web"`。
- `npm pack --dry-run` 已确认 27 个文件都能进入安装包，压缩包约 2.6 MB。
- 视觉层不修改 dsh 核心源码，用户数据仍位于 `~/.dsh`。

### 2.2 已解决的历史问题：插件未自动生效

0.7.x 曾只有 `dsh.client`、缺少 dsh 组合包声明；0.8.0 已补齐：

```json
"dsh": {
  "bundle": {
    "patch": "./cordis.patch.yml"
  }
}
```

dsh 的插件安装器只会把声明了 `dsh.bundle.patch` 的依赖加入 profile 的 `dsh.profile.bundles`。没有该字段时，包虽然被安装，但 `cordis.patch.yml` 不会自动进入启动层。

旧桌面壳曾在 `main.cjs` 中额外传入：

```text
--patch /path/to/endfield-ui-plugin/cordis.patch.yml
```

0.8.0 已删除这一临时路径，App 与 Web 都走标准 bundle 安装。

### 2.3 当前 `.app` 的限制

现有 `.app` 可在开发者的 Mac 上直接运行，但还不是通用安装包：

- `desktop-app/app.config.json` 写死了：

  ```text
  /Users/rison/WorkBuddy/DS/deepseek-harness
  ```

- App 仍依赖本机存在 dsh 源码目录，以及 `pnpm` 或 `corepack`。
- 当前只构建 `darwin-arm64`。
- 当前使用 ad-hoc 本地签名，适合本人使用，不适合公开下载分发。
- App 内已经携带 UI 插件，但没有携带完整 dsh 运行时。

---

## 3. 目标 A：一条命令安装并自动生效的插件

### 3.1 推荐的最终用户体验

发布到 npm 后：

```bash
dsh plugin --profile web add @rison/dsh-endfield-ui@0.8.0 --allow-build=node-pty
dsh web
```

如果发布到 GitHub：

```bash
dsh plugin --profile web add github:<owner>/<repo>#v0.8.0 --allow-build=node-pty
dsh web
```

离线安装构建好的 tarball：

```bash
dsh plugin --profile web add ./rison-dsh-endfield-ui-0.8.0.tgz --allow-build=node-pty
dsh web
```

卸载：

```bash
dsh plugin --profile web remove @rison/dsh-endfield-ui
```

升级：

```bash
dsh plugin --profile web update @rison/dsh-endfield-ui
```

### 3.2 必须修改的插件清单

把 `endfield-ui-plugin/package.json` 的 `dsh` 字段改为：

```json
{
  "dsh": {
    "bundle": {
      "patch": "./cordis.patch.yml"
    },
    "client": {
      "platform": "web",
      "immediately": true,
      "inject": [
        "@deepseek-ai/dsh-client-runtime",
        "@deepseek-ai/dsh-client-ui-theme",
        "@deepseek-ai/dsh-client-ui-layout"
      ]
    }
  }
}
```

不要移除 `files` 中的 `cordis.patch.yml`。安装包中必须同时包含：

- `index.js`
- `client.js`
- `theme.css`
- `cordis.patch.yml`
- `assets/`
- `package.json`
- `README.md`

### 3.3 发布前需要补充的清单信息

建议至少补充：

```json
{
  "keywords": ["deepseek-harness", "dsh", "theme", "web-ui"],
  "repository": {
    "type": "git",
    "url": "git+https://github.com/<owner>/<repo>.git"
  },
  "bugs": {
    "url": "https://github.com/<owner>/<repo>/issues"
  },
  "homepage": "https://github.com/<owner>/<repo>#readme"
}
```

在确认兼容范围后，再添加准确的 dsh 版本约束。不要凭猜测写宽泛兼容声明。CSS 使用了若干 dsh DOM/CSS Module 特征选择器，dsh 大版本升级时可能需要同步维护。

### 3.4 移除对桌面壳 `--patch` 的依赖

插件加入标准 bundle 声明并安装成功后，普通 Web 启动必须只用：

```bash
dsh --profile web
```

桌面壳也应逐步删除：

```text
--patch pluginPatch
```

短期可以保留一次兼容回退：先按标准插件方式启动；如果检测不到插件，再显示可读错误，而不是永久同时加载 bundle 和 `--patch`。同一个 patch 被重复应用可能造成重复条目或未来行为不确定。

### 3.5 干净环境安装测试

不能只在开发者现有 `~/.dsh` 上测试。建议创建隔离目录：

```bash
DSH_TEST_HOME="$(mktemp -d)"
export DSH_HOME="$DSH_TEST_HOME"

dsh plugin --profile web add ./rison-dsh-endfield-ui-0.8.0.tgz --allow-build=node-pty
dsh --profile web
```

安装后检查：

1. `$DSH_HOME/profiles/web/package.json` 中存在插件依赖。
2. `dsh.profile.bundles` 中自动出现 `@rison/dsh-endfield-ui`。
3. 启动命令没有 `--patch`。
4. `/endfield-ui/theme.css` 返回 200。
5. 浏览器加载后出现开屏与主题。
6. 刷新页面不会重复注入样式或 overlay。
7. 卸载后 `dsh web` 恢复原始主题，没有 404 素材请求。

### 3.6 视觉与功能回归矩阵

至少验证：

| 场景 | 验收内容 |
|---|---|
| 新会话首页 | 左上品牌、白色等高线侧栏、输入框白底黑字 |
| 已有对话 | 用户气泡白底黑字、助手内容可读、代码块正常 |
| 工作区 | 活动工作区灰黑卡片清晰，文件夹图标不与背景混色 |
| 设置 | 浅色、深色、跟随系统三种设置均无白底白字 |
| 开屏 | 无人物图；Deepseek Harness 品牌正确；3.5 秒退场正常 |
| 窄窗口 | 980×640 不遮挡输入、侧栏和操作按钮 |
| 刷新/HMR | 不重复添加 `<link>`，不出现双开屏 |
| 卸载 | dsh 原生页面恢复，用户数据不受影响 |

### 3.7 发布方式建议

按优先级选择：

1. **GitHub Release + `.tgz`**：最容易控制首个公开测试版。
2. **npm 包**：用户命令最短，适合稳定后发布。
3. **GitHub 包地址安装**：适合测试，但应固定 tag，不建议让普通用户追随主分支。

建议版本路线：

- `0.5.0`：加入 bundle 声明，完成干净环境安装。
- `0.6.0`：完成不同 dsh 版本兼容和素材整理。
- `1.0.0`：稳定公开版，一条命令安装、升级、卸载全部通过。

### 3.8 公开发布前的素材与品牌检查

当前素材目录包含来自游戏官网下载或参考游戏视觉生成的素材。公开发布前必须逐项确认授权范围：

- 对无法确认授权的官方角色图、Logo、职业图标和字体，替换为原创或可再分发素材。
- README 中标注“非官方同人主题”，避免暗示与游戏开发商或 DeepSeek 官方存在合作。
- 保留第三方字体和素材的许可证文件。
- 删除不再使用的素材，避免“代码未引用但安装包仍在分发”。当前 `npm pack` 仍包含 `operator-xaihi.png` 和 `workbench-logo.png`，需要确认是否继续使用。

---

## 4. 目标 B：打包成可直接访问的 macOS `.app`

### 4.1 当前桌面壳的工作流程

`desktop-app/main.cjs` 当前会：

1. 创建 Electron 原生窗口。
2. 找到随 App 携带的 `endfield-ui-plugin`。
3. 检查插件是否已链接进用户的 `~/.dsh/profiles/web`。
4. 必要时执行 `dsh plugin --profile web add <pluginDir> --allow-build=node-pty`。
5. 启动随机本地端口的 dsh Web 服务。
6. 从日志中识别 `http://127.0.0.1:<port>` 并加载。
7. 窗口关闭时向 dsh 子进程发送 `SIGTERM`。

这套结构可以保留，重点是消除硬编码路径和完善发布链。

### 4.2 推荐先交付“轻量桌面壳”

第一阶段不要把整个 dsh、Node 和包管理器都塞进 App。推荐约定：

- 用户已经安装并能正常运行 dsh。
- App 自带终末地 UI 插件。
- App 自动查找 dsh 命令或由用户首次选择 dsh 安装位置。
- App 复用 `~/.dsh`。

优点是体积较小、更新简单、不会复制用户数据。缺点是首次启动要检测本机 dsh 环境。

### 4.3 移除 `dshRepo` 绝对路径

不要把某位开发者的 `/Users/...` 路径写进公开 App。建议按以下优先级解析运行方式：

1. 环境变量 `DSH_BIN` 指向可执行文件。
2. App 自己保存的用户选择路径。
3. 常见可执行位置：`/opt/homebrew/bin/dsh`、`/usr/local/bin/dsh`。
4. `PATH` 中的 `dsh`。
5. 开发模式才读取 `app.config.json.dshRepo`，并在源码目录运行 `pnpm dsh`。

首次检测失败时显示终末地风格的引导页，提供：

- “选择 dsh 可执行文件”；
- “选择 deepseek-harness 源码目录”；
- “重新检测”；
- 清晰的安装说明。

选择结果保存到 Electron `app.getPath('userData')` 下，不要修改项目内的 `app.config.json`。

### 4.4 桌面壳启动逻辑调整

插件完成标准 bundle 后，建议桌面壳采用：

```text
dsh plugin --profile web add <App Resources 中的插件目录> --allow-build=node-pty
dsh --profile web --port 0
```

不再附加 `--patch`。

还要补充：

- 启动超时，例如 30 秒仍未输出 URL 时显示错误页。
- 收集最近一段 stdout/stderr，错误页提供“复制诊断信息”。
- 防止重复启动：同一 App 实例只维护一个 dsh 子进程。
- 使用 `app.requestSingleInstanceLock()`；第二次双击时聚焦已有窗口。
- 正常退出、崩溃退出、窗口关闭都可靠回收子进程。
- 只加载 `127.0.0.1`，禁止 Electron 导航到不可信远程页面。
- 保持 `contextIsolation: true`、`nodeIntegration: false`、`sandbox: true`。

### 4.5 为用户提供可重复的打包命令

当前开发者在 Apple Silicon Mac 上可以执行：

```bash
cd desktop-app
npm install
npm run pack:mac
```

现有脚本会把插件复制到：

```text
DSH 终末地工作台.app/Contents/Resources/endfield-ui-plugin
```

本地自用构建完成后进行 ad-hoc 签名和校验：

```bash
codesign --force --deep --sign - \
  "release/DSH 终末地工作台-darwin-arm64/DSH 终末地工作台.app"

codesign --verify --deep --strict \
  "release/DSH 终末地工作台-darwin-arm64/DSH 终末地工作台.app"
```

建议把签名步骤写成 `npm run sign:mac:local`，再提供统一命令：

```bash
npm run dist:mac:local
```

该命令应依次完成：

1. 检查插件语法。
2. 检查 `npm pack --dry-run` 资源完整性。
3. 清理并生成 `.app`。
4. ad-hoc 签名。
5. `codesign --verify --deep --strict`。
6. 从打包产物启动一次冒烟测试。

### 4.6 架构构建

当前只构建：

```text
darwin-arm64
```

公开发布至少提供：

- Apple Silicon：`--arch=arm64`
- Intel：`--arch=x64`

或者在构建流程成熟后合成 Universal App。不要在没有 Intel 实机或 CI 验证的情况下宣称 x64 可用。

### 4.7 正式分发签名与公证

ad-hoc 签名只适合本机自用。公开下载需要：

1. Apple Developer ID Application 证书。
2. Hardened Runtime 和合适的 entitlements。
3. `codesign` 正式签名。
4. `notarytool` 上传公证。
5. `stapler` 把公证票据附加到 App/DMG。
6. 在干净 Mac 用户账户上验证 Gatekeeper。

建议最终发布 DMG 或 ZIP，并提供 SHA-256 校验值。

### 4.8 完全自包含 App：第二阶段方案

如果目标变成“用户完全没有安装 dsh 也能运行”，就需要制作自包含版本：

- 随 App 携带兼容的 dsh CLI/运行时。
- 随 App 携带 Node 运行时或构建为不依赖外部 Node 的发行物。
- 不再依赖外部 `pnpm`、`corepack` 和源码仓库。
- 用户数据仍写入 `~/.dsh`，运行文件放在 App Resources。
- 建立 dsh 版本与 UI 插件版本的配套升级策略。
- 检查所有依赖的再分发许可证。

这个方案体积更大、维护成本更高，建议在轻量桌面壳稳定后再做。

### 4.9 `.app` 验收标准

| 场景 | 验收标准 |
|---|---|
| 双击启动 | 无需终端，自动出现开屏并进入 dsh |
| 用户数据 | 能看到原 `~/.dsh` 会话、工作区和模型配置 |
| 插件加载 | 使用 App Resources 中的插件，版本与发布清单一致 |
| 无 dsh | 出现可操作引导，不崩溃、不显示空白窗口 |
| 无 pnpm | 给出明确修复路径，或自包含版无需 pnpm |
| 重复启动 | 第二次双击聚焦已有窗口，不启动第二个服务 |
| 关闭 App | dsh 子进程在限定时间内退出，不残留监听端口 |
| 异常退出 | 下次启动不会因旧 PID 或旧端口失败 |
| 安全 | Electron 沙箱开启，只加载本地 dsh 地址 |
| 签名 | 本地版通过 codesign；公开版通过 Gatekeeper/公证 |

---

## 5. 推荐实施顺序

### 阶段 1：标准化插件（最高优先级）

1. 在 `package.json` 增加 `dsh.bundle.patch`。
2. 将版本升级到 `0.5.0`。
3. 生成 `.tgz`，在隔离 `DSH_HOME` 中安装。
4. 确认不使用 `--patch` 也能自动生效。
5. 验证升级和卸载。
6. 整理公开发布素材和许可证。

### 阶段 2：让桌面壳消费标准插件

1. 删除永久 `--patch` 依赖。
2. 增加 dsh 可执行文件自动发现。
3. 增加首次启动配置页。
4. 增加单实例锁、超时和诊断信息。
5. 建立 `dist:mac:local` 一键构建脚本。

### 阶段 3：发布与兼容

1. GitHub Release 发布插件 `.tgz` 和 arm64 `.app`。
2. 在干净账户和另一台 Mac 上验证。
3. 增加 x64 构建。
4. 稳定后发布 npm 包。
5. 有公开分发需求时完成 Developer ID 签名和公证。

### 阶段 4：可选的完全自包含 App

1. 固定 dsh 发行版本。
2. 内嵌运行时和依赖。
3. 完成许可证审计。
4. 设计自动更新和版本迁移。

---

## 6. 继任者首个提交建议

建议第一个提交只做标准插件化，不同时重构 Electron：

```text
feat(plugin): declare dsh bundle for automatic web-profile activation
```

该提交应包含：

- `package.json`：增加 `dsh.bundle.patch`，版本升级到 `0.5.0`。
- `README.md`：新增 npm、GitHub、tarball 安装/卸载命令。
- `scripts/smoke-install.mjs` 或等价测试：隔离 `DSH_HOME` 验证安装。
- 一份 `npm pack --dry-run` 结果或 CI 检查。

第二个提交再调整桌面壳：

```text
refactor(desktop): launch installed bundle without explicit patch overlay
```

这样出现问题时能明确判断是插件自动激活失败，还是桌面启动器失败。

---

## 7. 完成定义

只有同时满足以下条件，目标 A 才算完成：

- 一个从未安装过本插件的 dsh 用户执行一条 `plugin add` 命令即可安装。
- 后续普通 `dsh web` 自动显示主题。
- 不修改 dsh 核心源码，不要求手改 `~/.dsh`。
- 更新、卸载、重新安装均可重复执行。
- 干净 profile 和已有 profile 都通过测试。

只有同时满足以下条件，目标 B 才算完成：

- 用户双击 `.app` 即可访问 dsh。
- 不依赖开发者个人绝对路径。
- 继续复用用户 `~/.dsh`。
- 插件版本随 App 固化且可以验证。
- App 关闭后不残留 dsh 服务。
- 对目标 Mac 架构完成签名和真实启动验证。

交付时应同时提供：插件安装包、安装说明、`.app`、版本号、兼容的 dsh 版本、素材许可证说明和已知问题列表。
