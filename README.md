# Agent & Skill 精选清单

> Agent 框架与 工具 和配套 Skill 的精选推荐，每个场景只收录最优秀的。

---

## Agent 框架

| 名称 | 说明 |
|------|------|
| [Claude Code](https://github.com/anthropics/claude-code) | Anthropic 官方终端 Agent |
| [Codex CLI](https://github.com/openai/codex) | OpenAI 终端编码 Agent，支持多模型 |
| [Cline](https://github.com/cline/cline) | VS Code 自主编码 Agent，支持 MCP |
| [Hermes Agent](https://github.com/NousResearch/hermes-agent) | 具备技能学习与记忆循环的自我进化 Agent |
| [Aider](https://github.com/paul-gauthier/aider) | 终端 AI 结对编程，Git 感知工作流 |
| [OpenCode](https://github.com/sst/opencode) | 100% 开源终端 Agent，支持多模型与 LSP |
| [Goose](https://github.com/block/goose) | Block（原 Square）出品，MCP 驱动的通用 Agent |
| [Continue](https://github.com/continuedev/continue) | VS Code / JetBrains 开源 AI 编码助手，支持 CLI Agent 与 CI 集成 |

---

## 工具

| 名称 | 说明 |
|------|------|
| [CC GUI](https://github.com/zhukunpenglinyutong/jetbrains-cc-gui) | JetBrains 插件，在 IDE 内直接使用 Claude Code / Codex，无需切换终端 |
| [CC Switch](https://github.com/farion1231/cc-switch) | 跨平台桌面应用，管理 Claude Code / Codex / Gemini CLI 等多 Agent 配置与 provider 切换 |

---

## Skill

| 场景 | 名称 | 说明 |
|------|------|------|
| 通用 - Token 优化 | [RTK](https://github.com/rtk-ai/rtk) | CLI 代理，减少 60-90% Token 消耗，所有 Agent 通用 |
| 通用 - 文件系统 | [Filesystem MCP](https://github.com/modelcontextprotocol/servers) | 官方安全沙盒文件访问，Agent 在限定目录内读写与管理文件 |
| 通用 - 网络搜索 | [mcp-omnisearch](https://github.com/spences10/mcp-omnisearch) | 统一多搜索引擎接口，同时支持 Tavily / Brave / Kagi / Exa |
| JS 逆向 - 浏览器分析 | [Playwright MCP](https://github.com/microsoft/playwright-mcp) | 微软官方浏览器自动化 MCP，操控 Chromium/Firefox/WebKit |
| JS 逆向 - AST 反混淆 | [deobfuscate-mcp-server](https://github.com/ricardodeazambuja/deobfuscate-mcp-server) | 解析 Webpack/Browserify 打包代码，拆解模块、提取符号、生成调用图 |
| JS 逆向 - 运行时 Hook | [JSReverser-MCP](https://github.com/NoOne-hub/JSReverser-MCP) | 连接 Chrome 进行函数 Hook、断点调试、请求链追踪与混淆还原 |
| 大项目编程 - 代码索引 | [CodeGraph](https://github.com/colbymchenry/codegraph) | 预索引代码知识图谱，减少 59% Token，支持 19+ 语言 |
| 大项目编程 - 深度分析 | [repowise](https://github.com/repowise-dev/repowise) | 四层代码库智能（调用图 + Git 热区 + 文档 + 架构决策），节省 36% 成本 |
| 数据库 | [DBHub](https://github.com/bytebase/dbhub) | Bytebase 出品，PostgreSQL / MySQL / SQLite 等数据库统一 MCP 网关 |
| DevOps / 容器 | [devcontainer-mcp](https://github.com/aniongithub/devcontainer-mcp) | 开发容器 MCP，Agent 在 Docker / DevPod / Codespaces 中安全编码 |
| 浏览器自动化 | [Browser Use](https://github.com/browser-use/browser-use) | AI 驱动浏览器自动化，让 Agent 像人一样操控网页 |
| 知识库增强 | [RAGFlow](https://github.com/infiniflow/ragflow) | 深度文档理解 RAG 引擎，支持 MCP 与 GraphRAG |
| 文档 / API 查询 | [Context7](https://github.com/upstash/context7) | 实时获取库文档与代码示例，彻底消除 API 幻觉 |
| Git 协作 | [GitHub MCP](https://github.com/github/github-mcp-server) | 官方 GitHub 集成，管理 Issue、PR、Code Search、Actions |
| 代码审查 | [ask-llm](https://github.com/Lykhoyda/ask-llm) | 多模型代码审查，桥接 Claude 与 Gemini、Codex 交叉验证 |
| 工程规范 | [forgecraft-mcp](https://github.com/jghiringhelli/forgecraft-mcp) | 注入 SOLID、测试金字塔、CI/CD 等生产级工程标准 |
| 记忆增强 | [paradigm-memory](https://github.com/infinition/paradigm-memory) | 28 个 MCP 工具的持久记忆系统，认知图谱 + 审计日志 + 桌面 UI，跨会话跨 Agent |
| A股数据 | [baostock-skill](https://github.com/atompilot/baostock-skill) | BaoStock 免费 A 股数据，23 个 API 覆盖 K 线/财报/分红/宏观，免 Token |
| A股数据 | [a-stock-data](https://github.com/simonlin1212/a-stock-data) | 8 源整合（通达信/东方财富/同花顺/腾讯等），实时行情/研报/龙虎榜/北向资金 |
| Skill 工具 | [find-skills](https://github.com/vercel-labs/skills) | 通过自然语言搜索并安装 Skill，安装量 94K+，skills.sh 排名第一 |
| Skill 工具 | [skill-creator](https://github.com/somasays/skill-creator) | 官方元技能，通过对话自动创建和迭代 Skill，无需手写 SKILL.md |
| 全流程开发 | [gstack](https://github.com/garrytan/gstack) | YC 总裁 Garry Tan 出品，/review → /qa → /ship 全链路管理，从规划到发布一条龙 |
| 全流程开发 | [Superpowers](https://github.com/obra/superpowers) | TDD、系统化调试、子 Agent 并发、结构化规划，16K+ star，安装即自动生效 |
| 前端 UI | [taste-skill](https://github.com/Leonxlnx/taste-skill) | 反模板前端框架，3 个旋钮调风格（布局/动效/密度），28K+ star，框架无关 |
| 前端 UI | [Impeccable](https://github.com/pbakaus/impeccable) | Paul Bakaus 出品，7 份设计参考 + 23 个 / 命令精细化打磨 UI，15K+ star |
