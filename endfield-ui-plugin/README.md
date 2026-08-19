# DSH Endfield UI

> **非官方同人主题（Unofficial fan-made theme）**。本插件与游戏开发商及 DeepSeek 官方均无关联，不暗示任何合作或授权。如素材授权存在疑问，请见下方「素材与授权」一节。

`@rison/dsh-endfield-ui` 是一个**不修改 DeepSeek Harness 核心源码**的双端 Cordis 插件：Host 端通过 `/endfield-ui/*` 提供本地视觉素材，Client 端通过官方 Theme Token 与 `shell.overlay` 插槽加载终末地工业风外观。

0.6.0 版在 0.5.0 标准 `dsh.bundle` 的基础上**重做了对话区与右下角视觉**：对话区背景换成工业网格图（不再刺眼纯黑）、白色侧栏加入等高线纹理、输入区「命令」按钮改为柠檬黄、右下角「协议已同步」改为圆形上下文进度环（读取 dsh 原生 ContextMeter，无数据时装呼吸演示）。

0.5.0 版**新增标准 `dsh.bundle` 声明**：安装后 `cordis.patch.yml` 会自动进入 web profile 的启动层，普通 `dsh web` 即可自动加载，无需手动复制 CSS、修改 `~/.dsh` 或追加 `--patch`。

## 安装（一条命令，自动生效）

需要用户本机已安装 dsh。选择一个发布源：

**1. 从 npm（稳定后推荐）**

```bash
dsh plugin --profile web add @rison/dsh-endfield-ui
dsh web
```

**2. 从 GitHub Release 的 tarball（首个公开测试版推荐）**

```bash
dsh plugin --profile web add ./rison-dsh-endfield-ui-0.6.0.tgz
dsh web
```

**3. 从 GitHub 仓库固定 tag**

```bash
dsh plugin --profile web add github:rison114514/dsh-endfield-ui#v0.6.0
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
dsh plugin --profile web add @rison/dsh-endfield-ui
```

## 干净环境验证

建议在隔离目录中验证，避免只在本机 `~/.dsh` 上测试：

```bash
DSH_TEST_HOME="$(mktemp -d)"
export DSH_HOME="$DSH_TEST_HOME"

dsh plugin --profile web add ./rison-dsh-endfield-ui-0.6.0.tgz
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
| 右下角 | 圆形上下文进度环：有上下文数据时显示真实占用百分比，无数据时呼吸式演示 |
| 已有对话 | 用户气泡白底黑字、助手内容可读、代码块正常 |
| 工作区 | 活动工作区灰黑卡片清晰，文件夹图标不与背景混色 |
| 设置 | 浅色、深色、跟随系统三种设置均无白底白字 |
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

本主题通过若干 dsh DOM / CSS Module 特征选择器实现覆盖，dsh 大版本升级时可能需要同步维护。释出前请在目标 dsh 版本上回归上述矩阵；暂不在 `package.json` 中写宽泛兼容声明，待确认范围后补充准确的版本约束。
