# DSH 终末地工作台：插件调研与右侧工作区接入建议

更新日期：2026-08-23  
本机基线：`dsh 0.1.0-rc.6`、`@rison/dsh-endfield-ui 0.7.1`

## 结论先行

当前最合适的路线不是从零重写浏览器和文件管理器，而是：

1. 保留 `@rison/dsh-endfield-ui` 作为纯视觉与品牌层；
2. 以 `dsh-better-sidebar@0.12.3` 作为 rc.6 的可选右侧工作台底座；
3. 文件引用与轻量编辑优先评估 `dsh-shikitor@1.0.2`；
4. Goal 不安装第三方替代品，直接复用 DSH 已启用的原生 Goal 投影与 `/goal` 命令；
5. 终末地插件只负责检测这些能力并为其换肤、补入口和提供统一布局，不复制它们的业务状态。

`dsh-better-sidebar@latest` 当前是 `0.15.2`，其 DeepSeek Harness peer 依赖从 rc.8 起步，**不适合直接装进本机 rc.6**。npm 元数据表明 `0.12.3` 仍以 `^0.1.0-rc.6` 为基线，是当前 rc.6 可采用的最高档；`0.13.1` 已切到 rc.7，`0.14.0` 起切到 rc.8。

## 当前 DSH 已经具备什么

通过本机 `dsh --profile web --dump-config` 已确认以下组件处于启用状态：

- `@deepseek-ai/dsh-goal`
- `@deepseek-ai/dsh-goal-round-driver`
- `@deepseek-ai/dsh-command-goal`
- `@deepseek-ai/dsh-client-ui-goal`
- `@deepseek-ai/dsh-client-ui-workspace`
- `@deepseek-ai/dsh-host-directory-picker-auto`
- `@deepseek-ai/dsh-client-ui-commands`

这意味着：

- Goal 已是原生持久会话能力，不需要重新发明；
- 工作区列表、会话分组和目录选择已存在，但它们不是完整的文件资源管理器；
- 命令目录已经存在，终末地界面应复用它，而不是维护第二套命令列表。

原生 Goal 的创建入口是 `/goal <目标>`。激活后，官方 `GoalBar` 会显示在输入框上方，提供编辑、暂停、恢复和清除；状态来自会话的 `goal` projection，可在历史恢复后继续显示。

## 候选能力

### 1. `dsh-better-sidebar`

定位：完整右侧工作台底座。项目提供右侧栏与底部面板，并开放 `ctx.betterSidebar`，第三方插件可注册 Tab 和文件预览器。

主要能力：

- 工作区资源管理器与 CodeMirror 编辑器；
- 图片、Markdown、HTML、PDF 预览；
- 多 Tab 内嵌网页浏览器；
- xterm.js + node-pty 真实终端；
- Git diff、暂存、提交、历史；
- 子代理与后台任务页；
- 每个会话独立保存布局和 Tab；
- 设置页逐项开关卡片。

与本项目的关系：它一次覆盖“内联浏览器”和“工作区文件管理”两项诉求，而且提供稳定扩展面，适合后续加入终末地风格的 Goal / Status / Deliverables 卡片。

风险与约束：

- rc.6 必须固定 `0.12.3`，不能使用 `latest`；
- 包含 `node-pty`，安装时可能需要用户明确批准构建脚本；
- 最新 README 展示的是 `0.15.x` 能力，固定到 `0.12.3` 后需逐项冒烟验证；
- 不应把它硬塞进纯皮肤包的强制依赖，否则“只想换肤”的用户也要承担终端原生依赖。

建议：作为“完整工作台”可选组件，终末地插件通过能力探测适配；首轮只启用 Files、Browser、Tasks，Terminal 与 Git 由用户在设置中决定。

### 2. `dsh-shikitor`

定位：面向消息输入与工作区文件的轻量编辑器。

当前 npm 版本 `1.0.2`，peer 范围覆盖 DSH `>=0.1.0-rc.5 <0.2.0`，适配本机 rc.6。它提供：

- `@` 搜索和引用工作区文件；
- `#` 搜索会话；
- `$` 搜索 Skills；
- `/` 搜索命令；
- 当前工作区文件编辑 Tab；
- 可扩展的 `ctx.shikitor` 服务。

建议：如果用户只需要“快速找文件、引用文件、轻量编辑”，优先装它；若已经启用 better-sidebar 的完整资源管理器，则将 Shikitor 保留为输入框补全层，避免出现两个竞争性的文件树。

### 3. `dsh-browser`

定位：让 Agent 操作用户当前 Chrome / Firefox 页面。

它由 DSH bridge 加浏览器扩展组成，能够读取结构化页面、点击、输入、滚动和导航，并保留浏览器登录状态。它不是 DSH 页面里的内嵌浏览器，也不能只靠 `dsh plugin add` 完成安装。

建议：把它视为“Agent 浏览器控制能力”，不是右侧预览 UI。未来可以在终末地右侧栏加连接状态卡，但不要拿它替代内联网页 Tab。

### 4. `dsh-web-review`

定位：前端页面预览与元素批注。

它适合开发本项目自身：在 DSH 内打开页面，点选元素、填写修改意见，并把选择器、可访问名称和源码线索交给 Agent。它比通用浏览器更偏“前端验收工具”。

建议：列为开发模式可选项，不进入面向普通用户的默认工作台。

### 5. 其他值得关注的插件

- `dsh-context`：上下文构成、压缩与成本信号；很适合做成终末地“资源遥测”卡。
- `dsh-context-compass`：上下文状态、峰谷定价和会话总览；与现有价格状态监控方向接近。
- `dsh-knowledge-sqlite`：本地跨会话知识库。
- `dsh-subagent-router`：按任务选择子代理模型。
- `dsh-plannotator`：分段审阅计划并提交结构化反馈。
- `dsh-automation`：定时独立任务与运行历史。

这些插件的成熟度和 DSH 版本基线差异较大，应逐个检查 peer 依赖与安装脚本，不应自动随皮肤包安装。

## 为什么不能直接占用官方 `details` 右栏

官方 `ui-layout` 的根布局已有三个单占位：`sidebar`、`conversation`、`details`。其中 `details` 当前由官方 `ui-conversation` 的工具详情面板占用，是 `single` slot；另一个插件注册进去会替换整列，并带走原来的工具详情子槽。

因此本项目不应通过覆盖 `details` 来做多功能右栏。推荐两种安全方式：

1. 使用 `dsh-better-sidebar` 自己的右栏 / 底部工作台与 `ctx.betterSidebar` 扩展服务；
2. 如果坚持零依赖，自建 frame overlay 与独立宽度状态，但这会重复解决布局、响应式、拖拽与会话隔离，成本明显更高。

选择 1 可保留官方工具详情面板，并让文件、浏览器、任务和未来插件共用统一 Tab 模型。

## 终末地化接入计划

### 阶段 A：能力探测与换肤

- 保持 `@rison/dsh-endfield-ui` 无原生构建脚本、可单独一条命令安装；
- 在 client half 探测 `ctx.betterSidebar` 和 `ctx.shikitor`，存在才注册适配器；
- 为右栏增加终末地 token：黑灰面板、黄色定位轨、微缩标签、无圆角硬边框；
- 不修改第三方插件持久数据，不依赖其内部 CSS hash 类名；优先使用它公开的服务和 data 属性。

### 阶段 B：右侧工作台首发组合

- Files：资源管理器、搜索、编辑、预览；
- Browser：地址栏、多 Tab、前进 / 后退 / 刷新；
- Tasks：后台任务与子代理状态；
- 默认关闭 Terminal / Git，用户在设置中主动开启；
- 顶部统一使用 `OPERATOR AUXILIARY / 07`，Tab 使用终末地职业图标语法。

### 阶段 C：Goal 原生投影复用

- 保留输入框上方官方 GoalBar；
- 在右侧工作台注册 `OBJECTIVE` Tab，只读取同一 `goal` projection；
- 提供创建、编辑、暂停、恢复、清除，但调用官方 RPC，不建立第二份 store；
- 没有激活 Goal 时显示 `/goal` 使用提示，不伪造空目标。

### 阶段 D：分发策略

发布两档：

- **Skin**：仅 `@rison/dsh-endfield-ui`，一条命令换肤，无原生构建依赖；
- **Workbench Pack**：安装皮肤并固定与 DSH 版本匹配的右栏组件。rc.6 锁定 `dsh-better-sidebar@0.12.3`，升级 DSH 后再单独提升右栏版本。

完整工作台安装器必须先检测 `dsh --version`，再选择映射版本，禁止使用无约束的 `latest`。涉及 `node-pty` 构建脚本时要向用户明确解释并请求批准，不能静默放行。

## 本机下一步验证清单

1. 新建隔离 Profile，不直接污染当前已修复的 `web` Profile；
2. 安装 `dsh-better-sidebar@0.12.3`；
3. 验证 Files、Browser、Tasks 在 rc.6 下能挂载、切换和按会话恢复；
4. 验证与官方工具详情栏同时存在；
5. 验证与终末地主题的 z-index、宽度收缩、浅色输入框、设置页和移动尺寸；
6. 安装 `dsh-shikitor@1.0.2`，检查 `@/#/$//` 补全与文件编辑是否和右栏重复冲突；
7. 根据结果决定 Workbench Pack 默认组合。

## 主要资料

- DSH 官方客户端插件规则：<https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/AGENTS.md>
- DSH 官方 Workspace UI：<https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-workspace/README.md>
- DSH 官方 Goal UI：<https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-goal/README.zh.md>
- DSH Better Sidebar：<https://github.com/omdsh-dev/DSH-better-sidebar>
- Shikitor：<https://github.com/oneworks-ai/shikitor/tree/master/packages/dsh-shikitor>
- DSH Browser：<https://github.com/Lum1104/dsh-browser>
- DSH Web Review：<https://github.com/CanglongCl/dsh-web-review>
- Awesome DeepSeek Harness：<https://github.com/libukai/awesome-deepseek-harness>
