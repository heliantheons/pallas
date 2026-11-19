<p align="center">
  <img src="./assets/brand/hero-ice.png" width="256" alt="Pallas logo" />
</p>

<h1 align="center">Pallas</h1>

Pallas 是 Aegis 面向用户的认证界面。登录、OAuth 授权同意、回调、错误提示、个人资料和账户安全设置，都由它承接。它不碰认证逻辑本身——那些都在 Aegis 后端——Pallas 只负责把这些流程做成一个像样的前端。

Pallas is the human-facing authentication UI for Aegis: login, OAuth consent, callbacks, error presentation, profile, and account security. The auth logic lives in Aegis; Pallas turns those flows into the actual interface.

认证请求由后端 `GET /api/authorize` 发起，再通过浏览器重定向进入现有 `/login`、`/consent` 页面。公开的 `/authorize` 路由继续把完整查询参数转交后端，保留 `nonce`、`state`、PKCE、可选 `audience` 和多 audience 扩展。后端初次跳转携带 `authorize_url`，Pallas 仅保存同源 `/api/authorize` 地址，用于流程过期后的重建。授权页面从 `GET /api/consent` 获取本次请求的全部必需权限，通过 `POST /api/consent` 的 `{ confirm: true }` 或 `{ confirm: false }` 批准或拒绝；两者均消费 HTTP 300 的 Location 回调指令。

开发环境的 Vite `/api` 代理兼容上述浏览器 GET 和内部 XHR 请求。生产容器提供 SPA 静态页面，前置网关必须在 SPA fallback 前把 `/api/`（包括 discovery、authorize、token、JWKS、userinfo 和 consent）路由到 Aegis；`/login` 和 `/consent` 仍由 Pallas 提供。

本次迁移将 SDK 固定到包含标准 OIDC 实现的 Git 提交，安装时由 SDK 的 `prepare` 构建产物，依赖与锁文件可直接用于 review 和 CI。运行 `pnpm install --frozen-lockfile` 后执行 `pnpm type-check`、`pnpm lint`、`pnpm build`；部署时与 Aegis 的 OIDC 端点协调上线。SDK 正式发布后可改回对应 npm 版本，并同步更新锁文件。