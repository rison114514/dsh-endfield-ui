# DSH GitHub Connector — Local OAuth (stdio)

> **非官方连接器**。与 DeepSeek 官方无关。

`@rison/dsh-connector-github-local` 是一个**纯 Patch 层**连接器：让 dsh 用官方的 MCP client 桥（`@deepseek-ai/dsh-mcp-client`）以 **stdio** 拉起**本地 `github-mcp-server`**。这个本地服务器**自己做 GitHub OAuth 登录**（首次在浏览器里授权即可），dsh 端**完全不碰 token**，比上一个「远端 Bearer」变体更省心。工具名带 `mcp__github__` 前缀。

## 核心区别（对比远端+Bearer 变体）

| | 远端 + Bearer（`@rison/dsh-connector-github`） | **本地 + OAuth（本包）** |
|---|---|---|
| token 来源 | 你手动 `export GITHUB_TOKEN`（PAT） | 服务器自己走 OAuth，浏览器一键授权 |
| dsh 配置 | 需在 headers 里带 Bearer | 无 token，只 spawn 本地服务器 |
| token 是否进 dsh 配置 | 是 | 否 |
| token 持久性 | 你 env 里管 | 服务器进程内存（见下方 caveat） |

这就是 WorkBuddy / Codex 的连法：**Host 侧不向你要 PAT，OAuth 由服务器侧处理**。

## 安装（先装服务器，再装连接器）

```bash
# 1. 安装 GitHub MCP 服务器（本机只做一次）
brew install github-mcp-server        # v1.10.x, MIT, 官方 release

# 2. 把你的 dsh 连接到这个本地服务器（一条命令，自动生效）
dsh plugin --profile web add @rison/dsh-connector-github-local
# 本地构建包
dsh plugin --profile web add ./github-connector-local.tgz

# 3. 启动 dsh，模型获得 mcp__github__* 工具
dsh web
```

首次启动时本地服务器会在浏览器弹出 GitHub 授权；授权后即可用。

### 可选覆盖

| 环境变量 | 作用 | 默认 |
|---|---|---|
| `GITHUB_MCP_BIN` | 服务器可执行文件路径 | `github-mcp-server` |
| `GITHUB_MCP_ARGS` | 额外参数，**JSON 数组** | `["stdio"]` |

例：`GITHUB_MCP_ARGS='["stdio","--oauth-client-id","Iv1.xxx"]' dsh web`

## ⚠️ 一个重要的持久性 caveat

本地 `github-mcp-server` 走 **OAuth 授权码 + PKCE**，token **只在内存**（不落盘）。而 dsh 以 stdio **spawn 并接管**这个子进程的生命周期：每次 dsh 退出都会杀掉服务器；**下次 dsh 启动会拉起全新进程，需要重新 OAuth 授权一次**。对桌面端交互式 dsh 可以接受（浏览器自动弹出），但对**无头/non-interactive** 部署不友好。

三种解决办法（见官方 [oauth-login 文档](https://github.com/github/github-mcp-server/blob/main/docs/oauth-login.md)）：

1. **GitHub App 认证（官方推荐给 non-interactive stdio）**：给服务器传 GitHub App 凭据（`--github-app-id` / 私钥），走 App 级持久鉴权，无人值守可复用。
2. **PAT 覆盖（`GITHUB_PERSONAL_ACCESS_TOKEN` 优先级最高）**：服务器检测到该 env 就直接用它，跳过 OAuth——如果你想在长期运行里稳定，那就用这个（等同上一个 Bearer 方案）。
3. 把服务器当作**常驻进程**自己起，dsh 改连它的 HTTP 端口（不走 stdio），token 随常驻进程存活。

## 升级 / 卸载

```bash
dsh plugin --profile web update @rison/dsh-connector-github-local
dsh plugin --profile web remove @rison/dsh-connector-github-local
```

## 兼容性

目标为 `dsh 0.1.x`；依赖 `@deepseek-ai/dsh-mcp-client`（`^0.1.1-rc.2`）。`github-mcp-server` 为独立 Go 服务器，需单独安装。
