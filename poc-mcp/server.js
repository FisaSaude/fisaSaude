/**
 * POC Fisa Saúde — MCP (Streamable HTTP) + proxy Twilio num único ngrok (:3333).
 * Subir: node server.js | ngrok: ngrok http 3333 + MCP_PUBLIC_URL=https://....ngrok-free.app
 */
import { createHash, randomBytes } from "node:crypto";
import { createServer, request as httpRequest } from "node:http";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

// —— 1. CONFIGURAÇÕES ——
const API = "http://localhost:8080";
const PORT = 3333;
const NOTIFICACAO_PORT = 8081;
const ESTABELECIMENTO_PADRAO = 1;
const MCP_PUBLIC_URL = process.env.MCP_PUBLIC_URL?.replace(/\/$/, "");
const STATUS_AGENDA = ["AGENDADO", "CONFIRMADO", "CONCLUIDO", "BLOQUEADO"];

let token;
let accessCookie;
const oauthClients = new Map();
const oauthCodes = new Map();
const oauthTokens = new Map();

// —— 2. LOGIN E JWT ——
function cookieFromSetCookie(headerValue) {
  if (!headerValue) return null;
  const raw = Array.isArray(headerValue) ? headerValue.join(",") : String(headerValue);
  const m = /access_token=([^;]+)/.exec(raw);
  return m ? m[1] : null;
}

function authHeaders() {
  const h = { "Content-Type": "application/json" };
  if (token) h.Authorization = `Bearer ${token}`;
  if (accessCookie) h.Cookie = `access_token=${accessCookie}`;
  return h;
}

async function login() {
  const r = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@fisasaude.com", senha: "Admin@1234" }),
  });
  if (!r.ok) throw new Error(`login falhou ${r.status}`);
  const body = await r.json().catch(() => ({}));
  token = body.token || null;
  const setCookie =
    (typeof r.headers.getSetCookie === "function" && r.headers.getSetCookie()) ||
    r.headers.get("set-cookie");
  accessCookie = cookieFromSetCookie(setCookie) || token;
  if (!token && !accessCookie) throw new Error("login sem token");
  console.log("Login API Java OK");
}

// —— 3. FUNÇÃO DE CHAMADA DA API ——
async function api(path, opt = {}) {
  if (!token && !accessCookie) await login();
  let r = await fetch(`${API}${path}`, { ...opt, headers: { ...authHeaders(), ...(opt.headers || {}) } });
  if (r.status === 401) {
    await login();
    r = await fetch(`${API}${path}`, { ...opt, headers: authHeaders() });
  }
  if (!r.ok) throw new Error((await r.text()) || `HTTP ${r.status}`);
  if (r.status === 204) return null;
  const t = await r.text();
  return t ? JSON.parse(t) : null;
}

const out = (data) => ({ content: [{ type: "text", text: JSON.stringify(data, null, 2) }] });

function fmtHora(h) {
  if (!h) return null;
  const s = String(h);
  const [hh, mm] = s.split(":");
  return `${hh.padStart(2, "0")}:${(mm || "00").padStart(2, "0")}`;
}

function somarFinanceiro(raw) {
  const lista = raw || [];
  let entradas = 0;
  let saidas = 0;
  for (const d of lista) {
    const v = Number(d.valor) || 0;
    if (String(d.tipo).toLowerCase() === "receita") entradas += v;
    else saidas += v;
  }
  return {
    quantidadeLancamentos: lista.length,
    totalEntradas: entradas,
    totalSaidas: saidas,
    resultadoLiquido: entradas - saidas,
  };
}

// —— 4. TOOLS ——
const tools = [
  {
    name: "consultar_agenda",
    desc: "Consulta disponibilidade operacional da agenda em uma data (YYYY-MM-DD). Retorna se há atendimentos, quantidade e horários ocupados, sem dados pessoais.",
    schema: z.object({ data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }),
    async run({ data }) {
      const porStatus = await Promise.all(
        STATUS_AGENDA.map((status) =>
          api(`/agendamentos?status=${status}&dataInicio=${data}&dataFim=${data}`).catch(() => [])
        )
      );
      const todos = porStatus.flat();
      const horarios = [...new Set(todos.map((a) => fmtHora(a.horaInicio)).filter(Boolean))].sort();
      return {
        data,
        possuiAtendimento: horarios.length > 0,
        quantidade: todos.length,
        horariosOcupados: horarios,
      };
    },
  },
  {
    name: "financeiro",
    desc: "Financeiro da clínica: operacao=consultar (dataInicio, dataFim) para totais do período; registrar_entrada ou registrar_despesa (nome, valor, dataDespesa YYYY-MM-DD). Estabelecimento padrão 1.",
    schema: z.object({
      operacao: z.enum(["consultar", "registrar_entrada", "registrar_despesa"]),
      dataInicio: z.string().optional(),
      dataFim: z.string().optional(),
      nome: z.string().min(1).optional(),
      valor: z.number().positive().optional(),
      dataDespesa: z.string().optional(),
      estabelecimentoId: z.number().int().positive().optional(),
      descricao: z.string().optional(),
      tipo: z.string().optional(),
    }),
    async run(args) {
      const estId = args.estabelecimentoId ?? ESTABELECIMENTO_PADRAO;
      if (args.operacao === "consultar") {
        if (!args.dataInicio || !args.dataFim) throw new Error("consultar exige dataInicio e dataFim");
        const qs = new URLSearchParams({ dataInicio: args.dataInicio, dataFim: args.dataFim });
        const raw = await api(`/despesas/estabelecimento/${estId}?${qs}`);
        return { periodo: { dataInicio: args.dataInicio, dataFim: args.dataFim, estabelecimentoId: estId }, ...somarFinanceiro(raw) };
      }
      if (!args.nome || !args.valor || !args.dataDespesa) {
        throw new Error("registro exige nome, valor e dataDespesa");
      }
      const entrada = args.operacao === "registrar_entrada";
      const payload = {
        nome: entrada && args.descricao ? `${args.nome} — ${args.descricao}` : args.nome,
        dataDespesa: args.dataDespesa,
        tipo: entrada ? "Receita" : args.tipo || "Operacional",
        valor: args.valor,
        estabelecimentoId: estId,
      };
      const criado = await api("/despesas", { method: "POST", body: JSON.stringify(payload) });
      return {
        ok: true,
        operacao: args.operacao,
        valor: Number(criado.valor),
        descricao: criado.nome,
        data: criado.dataDespesa,
        tipo: criado.tipo,
      };
    },
  },
];

// —— 5. INICIALIZAÇÃO DO MCP ——
function buildMcp() {
  const mcp = new McpServer(
    { name: "fisa-poc", version: "2.0.0" },
    {
      instructions:
        "Assistente Fisa Saúde. Use consultar_agenda para ocupação por data; financeiro para relatórios e lançamentos. Português, respostas curtas. Nunca invente dados pessoais.",
    }
  );
  for (const t of tools) {
    mcp.registerTool(t.name, { description: t.desc, inputSchema: t.schema }, async (a) => {
      try {
        return out(await t.run(a));
      } catch (e) {
        return { content: [{ type: "text", text: e.message }], isError: true };
      }
    });
  }
  return mcp;
}

// —— OAuth (Claude remoto): metadados + DCR + PKCE ——
const id = (n = 16) => randomBytes(n).toString("base64url");
const pkceOk = (v, c) => c && createHash("sha256").update(v).digest("base64url") === c;
const sendJson = (res, s, b) => {
  res.statusCode = s;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(b));
};
const readText = (req) =>
  new Promise((res, rej) => {
    const c = [];
    req.on("data", (x) => c.push(x));
    req.on("end", () => res(Buffer.concat(c).toString("utf8")));
    req.on("error", rej);
  });
const publicBase = (req) =>
  MCP_PUBLIC_URL || `${req.headers["x-forwarded-proto"] || "http"}://${req.headers["x-forwarded-host"] || req.headers.host || `localhost:${PORT}`}`;
const allowedRedirect = (uri) => {
  try {
    const u = new URL(uri);
    return (u.hostname === "claude.ai" && u.pathname === "/api/mcp/auth_callback") || u.hostname === "localhost" || u.hostname === "127.0.0.1";
  } catch {
    return false;
  }
};

async function handleOAuth(req, res, path) {
  const base = publicBase(req);
  if (path === "/.well-known/oauth-protected-resource" || path === "/.well-known/oauth-protected-resource/mcp") {
    sendJson(res, 200, { resource: `${base}/mcp`, authorization_servers: [base], bearer_methods_supported: ["header"], scopes_supported: ["mcp"] });
    return true;
  }
  if (path === "/.well-known/oauth-authorization-server") {
    sendJson(res, 200, {
      issuer: base,
      authorization_endpoint: `${base}/authorize`,
      token_endpoint: `${base}/token`,
      registration_endpoint: `${base}/register`,
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code"],
      token_endpoint_auth_methods_supported: ["none"],
      code_challenge_methods_supported: ["S256"],
      scopes_supported: ["mcp"],
    });
    return true;
  }
  if (path === "/register" && req.method === "POST") {
    const body = JSON.parse(await readText(req));
    if (!(body?.redirect_uris || []).some(allowedRedirect)) return sendJson(res, 400, { error: "invalid_redirect_uri" }), true;
    const clientId = id();
    oauthClients.set(clientId, { client_id: clientId, redirect_uris: body.redirect_uris });
    return sendJson(res, 201, { client_id: clientId, redirect_uris: body.redirect_uris, token_endpoint_auth_method: "none" }), true;
  }
  if (path === "/authorize" && req.method === "GET") {
    const q = new URL(req.url || "", `${base}/`);
    const client = oauthClients.get(q.get("client_id"));
    const redirectUri = q.get("redirect_uri");
    if (!client || q.get("response_type") !== "code" || !allowedRedirect(redirectUri) || !client.redirect_uris.includes(redirectUri)) {
      sendJson(res, 400, { error: "invalid_request" });
      return true;
    }
    const code = id(24);
    oauthCodes.set(code, { clientId: client.client_id, redirectUri, codeChallenge: q.get("code_challenge"), exp: Date.now() + 600000 });
    const dest = new URL(redirectUri);
    dest.searchParams.set("code", code);
    if (q.get("state")) dest.searchParams.set("state", q.get("state"));
    res.writeHead(302, { Location: dest.toString() });
    res.end();
    return true;
  }
  if (path === "/token" && req.method === "POST") {
    const body = Object.fromEntries(new URLSearchParams(await readText(req)));
    if (body.grant_type !== "authorization_code") return sendJson(res, 400, { error: "unsupported_grant_type" }), true;
    const entry = oauthCodes.get(body.code);
    oauthCodes.delete(body.code);
    if (!entry || entry.exp < Date.now() || entry.clientId !== body.client_id || entry.redirectUri !== body.redirect_uri || !pkceOk(body.code_verifier, entry.codeChallenge)) {
      sendJson(res, 400, { error: "invalid_grant" });
      return true;
    }
    const access = id(32);
    oauthTokens.set(access, { exp: Date.now() + 3600000 });
    sendJson(res, 200, { access_token: access, token_type: "Bearer", expires_in: 3600, scope: "mcp" });
    return true;
  }
  return false;
}

function proxyNotificacao(req, res) {
  const up = httpRequest(
    { host: "localhost", port: NOTIFICACAO_PORT, path: req.url, method: req.method, headers: req.headers },
    (r) => {
      res.writeHead(r.statusCode, r.headers);
      r.pipe(res);
    }
  );
  up.on("error", () => {
    res.statusCode = 502;
    res.end("notificacao indisponivel");
  });
  req.pipe(up);
}

const mcpAnon = (body) => ["initialize", "notifications/initialized", "tools/list"].includes(body?.method);

// —— 6. SERVIDOR HTTP E HEALTHCHECK ——
createServer(async (req, res) => {
  const path = (req.url || "").split("?")[0];
  if (path === "/health") {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ status: "ok", tools: tools.map((t) => t.name) }));
    return;
  }
  if (path.startsWith("/webhook/")) {
    proxyNotificacao(req, res);
    return;
  }
  if (await handleOAuth(req, res, path)) return;
  if (path !== "/mcp") {
    res.statusCode = path === "/" ? 200 : 404;
    res.end(path === "/" ? "Fisa MCP: /mcp | /health | /webhook/* (Twilio)\n" : "not found");
    return;
  }
  try {
    const body = req.method === "POST" ? JSON.parse((await readText(req)) || "null") : undefined;
    const access = (req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
    const ok = access && oauthTokens.get(access)?.exp > Date.now();
    if (!ok && !mcpAnon(body)) {
      const meta = `${publicBase(req)}/.well-known/oauth-protected-resource/mcp`;
      res.setHeader("WWW-Authenticate", `Bearer resource_metadata="${meta}", scope="mcp"`);
      sendJson(res, 401, { error: "invalid_token" });
      return;
    }
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    const mcp = buildMcp();
    await mcp.connect(transport);
    await transport.handleRequest(req, res, body);
  } catch (e) {
    console.error(e.message);
    if (!res.headersSent) res.end("erro mcp");
  }
}).listen(PORT, async () => {
  try {
    await login();
  } catch (e) {
    console.warn("API Java ainda indisponível:", e.message);
  }
  console.log(`MCP :${PORT} → http://localhost:${PORT}/mcp (webhook → :${NOTIFICACAO_PORT})`);
});
