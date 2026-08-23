# DSH Endfield UI

> **非官方同人主题（Unofficial fan-made theme）**。本插件与游戏开发商及 DeepSeek 官方均无关联，不暗示任何合作或授权。如素材授权存在疑问，请见下方「素材与授权」一节。

`@rison/dsh-endfield-ui` 是一个**不修改 DeepSeek Harness 核心源码**的双端 Cordis 工作台插件：Host 端通过 `/endfield-ui/*` 提供本地视觉素材，Client 端使用官方 Theme Token、会话 projection 和公开插件服务构建终末地工业风外观。

0.8.4 是面向 **DSH 0.1.0-rc.6** 的完整工作台修正版：精确集成 `dsh-better-sidebar@0.12.3` 和 `dsh-shikitor@1.0.2`，保留右栏布局、旋转仪表圆环与开屏门禁，并修复 Electron App 中自绘标题拖拽区吞掉右栏顶部按钮的问题。

0.6.0 起逐步形成当前视觉基线：右侧对话栏使用低透明度 Ardot 工业网格，白色侧栏加入等高线纹理，输入区「命令」按钮改为柠檬黄，右下角改为读取 dsh 原生 projection 的上下文进度环。

0.5.0 版**新增标准 `dsh.bundle` 声明**：安装后 `cordis.patch.yml` 会自动进入 web profile 的启动层，普通 `dsh web` 即可自动加载，无需手动复制 CSS、修改 `~/.dsh` 或追加 `--patch`。

## 安装（一条命令，自动生效）

需要用户本机已安装 dsh。选择一个发布源：

**1. 从 npm（稳定后推荐）**

```bash
dsh plugin --profile web add @rison/dsh-endfield-ui@0.8.4 --allow-build=node-pty
dsh web
```

**2. 从 GitHub Release 的 tarball（首个公开测试版推荐）**

```bash
dsh plugin --profile web add ./rison-dsh-endfield-ui-0.8.4.tgz --allow-build=node-pty
dsh web
```

**3. 从 GitHub 仓库固定 tag**

```bash
dsh plugin --profile web add github:rison114514/dsh-endfield-ui#v0.8.4 --allow-build=node-pty
dsh web
```

安装成功后，后续只需执行 `dsh web`，终末地风格会自动加载。

## 升级 / 卸载 / 重装

```bash
# 升级
dsh plugin --profile web update @rison/dsh-endfield-ui

# 卸载（恢复 dsh 原生前端，用户数据不受影响）
dsh plugin --profile web remove @rison/dsh-endfield-ui

# 重新安装
dsh plugin --profile web add @rison/dsh-endfield-ui@0.8.4 --allow-build=node-pty
```

## 0.8.4 工作台能力

- 右侧 better-sidebar：文件管理、快速编辑、内嵌浏览器、终端、Git、任务与子代理。新会话默认只打开 Explorer，其余页面从 `+` 菜单打开。
- Shikitor 输入层：`@` 文件、`#` 会话、`$` Skills、`/` 命令补全，及中央工作区编辑器。
- 双编辑入口：better-sidebar 用于右栏快速查看/修改；Shikitor 中央页面用于更完整的文件编辑。两者各自使用上游公开接口。
- `OBJECTIVE` 页面：直接读取当前会话原生 Goal，提供编辑、暂停、恢复和清除。首次出现活动 Goal 时自动加入并聚焦该标签，但不强制展开已收起的右栏。
- 原生 `/goal` 和输入框上方 GoalBar 继续保留；`OBJECTIVE` 不创建独立 Store。
- 对话背景恢复 0.7.x 的低透明度旋转仪表圆环，并根据右栏宽度动态裁切；系统启用“减少动态效果”时停止旋转。
- 开场动画期间隐藏工作台并保持主对话全宽；动画结束后释放上游原生滑入，不修改用户保存的展开/折叠状态。
- Electron App 的窗口拖拽标题条会自动避让右侧工作台；页面加号、收放、底部面板/终端及宽度拖拽在 App 中保持可交互。

### 上游限制

- better-sidebar 的内嵌浏览器使用 sandbox iframe；被目标站点 CSP 或 `X-Frame-Options` 拒绝时，请使用其“在外部浏览器打开”。
- 终端依赖 `node-pty`。pnpm 11 需要显式授权，因此上述一条安装命令带有 `--allow-build=node-pty`；它只允许这一个原生依赖，不是全局放行。如果 node-pty 仍无法加载，better-sidebar 会降级运行：其他页面仍可用，终端页面显示上游自带的修复命令。

## 干净环境验证

建议在隔离目录中验证，避免只在本机 `~/.dsh` 上测试：

```bash
DSH_TEST_HOME="$(mktemp -d)"
export DSH_HOME="$DSH_TEST_HOME"

dsh plugin --profile web add ./rison-dsh-endfield-ui-0.8.4.tgz --allow-build=node-pty
dsh --profile web
```

验收要点：

1. `$DSH_HOME/profiles/web/package.json` 中存在插件依赖。
2. `dsh.profile.bundles` 中自动出现 `@rison/dsh-endfield-ui`。
3. 启动命令**没有** `--patch`。
4. `GET /endfield-ui/theme.css` 返回 200。
5. 浏览器加载后出现开屏与主题。
6. 刷新页面不会重复注入样式或 overlay。
7. 卸载后 `dsh web` 恢复原始主题，没有 404 素材请求。

## 视觉与功能回归

| 场景 | 验收内容 |
|---|---|
| 新会话首页 | 左上品牌、白色等高线侧栏、对话区工业网格背景（非纯黑）、输入框白底黑字 |
| 输入区 | 「命令」按钮为柠檬黄、在白色输入框中清晰可辨 |
| 右下角 | 圆形上下文进度环：有上下文数据时显示真实占用百分比，无数据时显示 IDLE |
| 已有对话 | 用户气泡白底黑字、助手内容可读、代码块正常 |
| 工作区 | 活动工作区灰黑卡片清晰，文件夹图标不与背景混色 |
| 设置 | 浅色、深色、跟随系统三种设置均无白底白字，折叠左栏时对话框仍完整显示 |
| 输入光标 | 白色输入区的 Shikitor 合成光标固定为黑色，主题链接带缓存刷新标记 |
| 开屏 | 无人物图；Deepseek Harness 品牌正确；约 3.5 秒退场正常 |
| 窄窗口 | 980×640 不遮挡输入、侧栏和操作按钮 |
| 刷新/HMR | 不重复添加 `<link>`，不出现双开屏 |
| 卸载 | dsh 原生页面恢复，用户数据不受影响 |

## 素材与授权

当前素材目录包含参考游戏视觉生成的图片与第三方字体，以及两张用户提供的素材（`chat-grid-bg.jpg` 工业网格背景、`contour-texture.png` 等高线纹理）。**公开发布前需逐项确认授权范围**：

- 对无法确认授权的官方角色图、Logo、职业图标和字体，应替换为原创或可再分发素材。
- 已保留第三方字体（Harmony / Novecento / Space Grotesk）与图片素材，分发时一并保留其许可证文件。
- `operator-xaihi.png` **实际被旋转圆圈（`.ef-atmosphere-operator`）使用**，并非未引用；`workbench-logo.png` 暂未被代码引用，但按用户要求随包保留。全部素材均随包分发，未做清理。

## 兼容性

0.8.4 只对 **DSH 0.1.0-rc.6 + Node >=22.19.0** 做发布验证。`dsh-better-sidebar` 必须保持 `0.12.3`：`0.13.x` 已转向 rc.7，`0.15.2` 要求 rc.8，不能在升级 DSH 前单独替换。工作台样式仅依赖 better-sidebar 公开的 `[data-dsh-better-sidebar]` 根标记和公开尺寸变量，不依赖其 CSS Module 哈希类名，也不覆盖上游面板定位。
