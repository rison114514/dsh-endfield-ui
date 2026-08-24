# DSH GitHub Connector

> **非官方连接器**。与 DeepSeek 官方无关。

`@rison/dsh-connector-github` 是一个**纯 Patch 层**的 GitHub 连接器：把 dsh 官方的 MCP client 桥（`@deepseek-ai/dsh-mcp-client`）指向 GitHub 托管的**远端 MCP 服务器**（`https://api.githubcopilot.com/mcp/`），让模型以类型化工具操作 GitHub（建 PR、建 issue、看仓库、发 release 等），工具名带 `mcp__github__` 前缀。

## 安装（一条命令）

```bash
dsh plugin --profile web add @rison/dsh-connector-github
# 本地构建包
dsh plugin --profile web add ./github-connector.tgz
```

安装后，`dsh.profile.bundles` 自动出现 `@rison/dsh-connector-github`，其 `cordis.patch.yml` 被自动应用，无需手动改 `~/.dsh`。

## 鉴权：远端 Bearer token（不是交互式 OAuth）

**先说清楚一个约束**：dsh 的 `dsh-mcp-client` 只支持**静态 headers**，没有接入交互式 OAuth 设备流（没有 `OAuthClientProvider`/PKCE 回环）。所以本连接器采用的是 GitHub 官方远端服务器文档里的 **「Using a GitHub PAT」模式**：在请求头里发 `Authorization: Bearer <token>`。

因此你需要一个 GitHub 令牌，并在启动 dsh 前把它放进环境变量：

```bash
export GITHUB_TOKEN=ghp_xxxxxxxx      # 或 gh 生成的 fine-grained token
dsh web
```

令牌写法说明（可在 `~/.zshrc` 里常驻）：

```bash
# 生成：GitHub → Settings → Developer settings → Personal access tokens
# 建议 fine-grained，按需勾选 repos / pull requests / issues 等 scope
export GITHUB_TOKEN="github_pat_xxxxxxxx"
```

> 令牌只在 profile 启动时读取一次；没设置时连接器**不会**让 dsh 崩溃（`failOnStartupError: false`），只是不上传任何 GitHub 工具，并记录一条连接报错。

## 想要真正的浏览器 OAuth 登录（无 token 存储）？

用远端 URL + 静态 Bearer 头**做不到**。若你坚持「浏览器登录、token 只在内存」的 OAuth，需要改用**本地 github-mcp-server**（官方镜像自带 OAuth 凭据 + 本机回环回调端口），再让 dsh 通过 `stdio` 连它——这属于「本地路线」，与本仓库的远端方案不同。需要的话我可以再做一个本地 OAuth 的连接器变体。

## 升级 / 卸载

```bash
dsh plugin --profile web update @rison/dsh-connector-github
dsh plugin --profile web remove @rison/dsh-connector-github
```

## 验证

```bash
node scripts/smoke-connector.mjs   # 隔离 DSH_HOME 安装 + 启动 + bundle 激活
```

## 兼容性

目标为 `dsh 0.1.x`。MCP client 桥依赖 `@deepseek-ai/dsh-mcp-client`（需与当前 dsh 主版本匹配，本连接器 pin 了 `^0.1.1-rc.2`）。
