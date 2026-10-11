/** POC: MCP → API Java (:8080). Rode: node server.js */
import { createHash, randomBytes } from "node:crypto";
import { createServer, request as httpRequest } from "node:http";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const API = "http://localhost:8080";
const PORT = 3333;
const NOTIFICACAO_PORT = 8081;
const SERVICO_ID_PADRAO = 1;
const USUARIO_ID_PADRAO = 1;
const MCP_PUBLIC_URL = process.env.MCP_PUBLIC_URL?.replace(/\/$/, "");
let token;
let accessCookie;

/** OAuth mínimo para conector customizado da Claude (DCR + PKCE). */
const oauthClients = new Map();
const oauthCodes = new Map();
const oauthTokens = new Map();

function publicBase(req) {
  if (MCP_PUBLIC_URL) return MCP_PUBLIC_URL;
  const proto = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers["x-forwarded-host"] || req.headers.host || `localhost:${PORT}`;
  return `${proto}://${host}`;
}

function mcpResourceUrl(req) {
  return `${publicBase(req)}/mcp`;
}

function protectedResourceMetadata(req) {
  const base = publicBase(req);
  return {
    resource: mcpResourceUrl(req),
    authorization_servers: [base],
    bearer_methods_supported: ["header"],
    scopes_supported: ["mcp"],
  };
}

function authServerMetadata(req) {
  const base = publicBase(req);
  return {
    issuer: base,
    authorization_endpoint: `${base}/authorize`,
    token_endpoint: `${base}/token`,
    registration_endpoint: `${base}/register`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    token_endpoint_auth_methods_supported: ["none", "client_secret_post"],
    code_challenge_methods_supported: ["S256"],
    scopes_supported: ["mcp"],
  };
}

function id(bytes = 16) {
  return randomBytes(bytes).toString("base64url");
}

/** Soma 1h em HH:mm ou HH:mm:ss (mesmo formato de entrada). */
function addOneHour(horaInicio) {
  const parts = horaInicio.trim().split(":");
  const h = Number(parts[0]) || 0;
  const m = Number(parts[1]) || 0;
  const hasSeconds = parts.length >= 3;
  const s = hasSeconds ? Number(parts[2]) || 0 : 0;
  const nh = (h + 1) % 24;
  const pad = (n) => String(n).padStart(2, "0");
  return hasSeconds ? `${pad(nh)}:${pad(m)}:${pad(s)}` : `${pad(nh)}:${pad(m)}`;
}

function pkceOk(verifier, challenge) {
  if (!verifier || !challenge) return false;
  const digest = createHash("sha256").update(verifier).digest("base64url");
  return digest === challenge;
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

async function readBodyText(req) {
  const buf = await new Promise((res, rej) => {
    const c = [];
    req.on("data", (x) => c.push(x));
    req.on("end", () => res(Buffer.concat(c)));
    req.on("error", rej);
  });
  return buf.toString("utf8");
}

async function readBodyJson(req) {
  const s = await readBodyText(req);
  return s ? JSON.parse(s) : undefined;
}

function parseFormBody(raw) {
  return Object.fromEntries(new URLSearchParams(raw));
}

function allowedRedirect(uri) {
  if (!uri) return false;
  try {
    const u = new URL(uri);
    if (u.hostname === "claude.ai" && u.pathname === "/api/mcp/auth_callback") return true;
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return true;
  } catch {
    return false;
  }
  return false;
}

async function handleOAuth(req, res, path) {
  if (path === "/.well-known/oauth-protected-resource" || path === "/.well-known/oauth-protected-resource/mcp") {
    sendJson(res, 200, protectedResourceMetadata(req));
    return true;
  }
  if (path === "/.well-known/oauth-authorization-server") {
    sendJson(res, 200, authServerMetadata(req));
    return true;
  }
  if (path === "/register" && req.method === "POST") {
    let body;
    try {
      body = await readBodyJson(req);
    } catch {
      sendJson(res, 400, { error: "invalid_client_metadata" });
      return true;
    }
    const redirectUris = body?.redirect_uris || [];
    if (!redirectUris.some(allowedRedirect)) {
      sendJson(res, 400, { error: "invalid_redirect_uri" });
      return true;
    }
    const clientId = id();
    const now = Math.floor(Date.now() / 1000);
    const client = {
      client_id: clientId,
      client_id_issued_at: now,
      client_secret_expires_at: 0,
      redirect_uris: redirectUris,
      grant_types: body.grant_types || ["authorization_code"],
      response_types: body.response_types || ["code"],
      token_endpoint_auth_method: body.token_endpoint_auth_method || "none",
      client_name: body.client_name || "Claude",
    };
    oauthClients.set(clientId, client);
    console.log("OAuth client registrado:", clientId);
    sendJson(res, 201, client);
    return true;
  }
  if (path === "/authorize" && req.method === "GET") {
    const q = new URL(req.url || "", `${publicBase(req)}/`);
    const clientId = q.searchParams.get("client_id");
    const redirectUri = q.searchParams.get("redirect_uri");
    const state = q.searchParams.get("state");
    const codeChallenge = q.searchParams.get("code_challenge");
    const responseType = q.searchParams.get("response_type") || "code";
    const client = oauthClients.get(clientId);
    if (!client || responseType !== "code" || !allowedRedirect(redirectUri)) {
      sendJson(res, 400, { error: "invalid_request" });
      return true;
    }
    if (!client.redirect_uris.includes(redirectUri)) {
      sendJson(res, 400, { error: "invalid_redirect_uri" });
      return true;
    }
    const code = id(24);
    oauthCodes.set(code, {
      clientId,
      redirectUri,
      codeChallenge,
      exp: Date.now() + 10 * 60 * 1000,
    });
    const dest = new URL(redirectUri);
    dest.searchParams.set("code", code);
    if (state) dest.searchParams.set("state", state);
    res.writeHead(302, { Location: dest.toString() });
    res.end();
    console.log("OAuth authorize OK →", redirectUri);
    return true;
  }
  if (path === "/token" && req.method === "POST") {
    const raw = await readBodyText(req);
    const body = parseFormBody(raw);
    const grant = body.grant_type;
    if (grant === "authorization_code") {
      const code = body.code;
      const clientId = body.client_id;
      const redirectUri = body.redirect_uri;
      const verifier = body.code_verifier;
      const entry = oauthCodes.get(code);
      oauthCodes.delete(code);
      if (!entry || entry.exp < Date.now() || entry.clientId !== clientId || entry.redirectUri !== redirectUri) {
        sendJson(res, 400, { error: "invalid_grant" });
        return true;
      }
      if (!pkceOk(verifier, entry.codeChallenge)) {
        sendJson(res, 400, { error: "invalid_grant", error_description: "PKCE verification failed" });
        return true;
      }
      const access = id(32);
      oauthTokens.set(access, { clientId, exp: Date.now() + 3600 * 1000 });
      sendJson(res, 200, {
        access_token: access,
        token_type: "Bearer",
        expires_in: 3600,
        scope: "mcp",
      });
      console.log("OAuth token emitido para client", clientId);
      return true;
    }
    if (grant === "refresh_token") {
      sendJson(res, 400, { error: "unsupported_grant_type" });
      return true;
    }
    sendJson(res, 400, { error: "unsupported_grant_type" });
    return true;
  }
  return false;
}

// Mantém o webhook do Twilio no mesmo túnel ngrok do MCP (só /webhook/, nunca /internal/).
function proxyNotificacao(req, res) {
  const up = httpRequest(
    { host: "localhost", port: NOTIFICACAO_PORT, path: req.url, method: req.method, headers: req.headers },
    (r) => {
      res.writeHead(r.statusCode, r.headers);
      r.pipe(res);
    }
  );
  up.on("error", (e) => {
    console.log("Proxy notificacao falhou:", e.message);
    res.statusCode = 502;
    res.end("notificacao indisponivel");
  });
  req.pipe(up);
}

function cookieFromSetCookie(headerValue) {
  if (!headerValue) return null;
  const first = Array.isArray(headerValue) ? headerValue[0] : String(headerValue).split(",")[0];
  const match = /(?:^|,\s*)access_token=([^;]+)/.exec(first) || /access_token=([^;]+)/.exec(String(headerValue));
  return match ? match[1] : null;
}

function authHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (accessCookie) headers.Cookie = `access_token=${accessCookie}`;
  return headers;
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
  if (!token && !accessCookie) throw new Error("login sem token e sem cookie");
  console.log("Login realizado com sucesso");
}

async function api(path, opt = {}) {
  if (!token && !accessCookie) await login();
  const method = opt.method || "GET";
  console.log(`Chamando endpoint: ${method} ${path}`);
  const headers = { ...authHeaders(), ...(opt.headers || {}) };
  let r = await fetch(`${API}${path}`, { ...opt, headers });
  if (r.status === 401) {
    await login();
    r = await fetch(`${API}${path}`, { ...opt, headers: authHeaders() });
  }
  if (!r.ok) {
    const msg = await r.text();
    console.log("Erro ao chamar API", r.status, msg);
    throw new Error(msg || `HTTP ${r.status}`);
  }
  if (r.status === 204) return null;
  const t = await r.text();
  return t ? JSON.parse(t) : null;
}

const out = (data) => ({
  content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
});

function formatarClientes(lista) {
  const clientes = (lista || []).map((c) => ({
    id: c.id,
    nome: c.nome,
    telefone: c.telefone ?? null,
  }));
  const nomes = clientes.map((c) => c.nome).filter(Boolean);
  return {
    total: clientes.length,
    nomes,
    clientes,
    como_responder:
      "Fale em português, de forma natural e curta. Cite só os nomes (e telefone se pedirem). Não mostre ID, não monte tabela técnica, não fale de MCP, API, filtro, letra ou truque de busca. Se a lista estiver vazia, diga que não há cliente cadastrado. O id fica só para as próximas tools (agendar, financeiro).",
  };
}

const tools = [
  {
    name: "listar_clientes",
    desc: "Lista todos os clientes da Fisa Saúde. Use isto quando perguntarem quem são os clientes, quantos tem ou 'meus clientes'. Não peça nome. Depois responda só com os nomes, em linguagem natural, sem ID e sem explicar a ferramenta.",
    schema: z.object({}),
    async run() {
      return formatarClientes(await api("/clientes"));
    },
  },
  {
    name: "buscar_cliente",
    desc: "Busca cliente por nome (trecho) ou, se já souber, por id interno. Se nome e id vierem vazios, lista todos — não invente filtro por letra. Na resposta ao usuário, cite só os nomes; não mostre ID nem fale de MCP/API.",
    schema: { nome: z.string().optional(), id: z.number().int().positive().optional() },
    async run({ nome, id }) {
      if (id != null) {
        const c = await api(`/clientes/${id}`);
        return formatarClientes([c]);
      }
      const lista = await api("/clientes");
      if (!nome?.trim()) return formatarClientes(lista);
      const n = nome.trim().toLowerCase();
      return formatarClientes((lista || []).filter((c) => c.nome?.toLowerCase().includes(n)));
    },
  },
  {
    name: "listar_agendamentos_cliente",
    desc: "Agendamentos de um cliente. Use o id interno obtido em listar_clientes ou buscar_cliente. Ao responder, fale data, horário e status; não mostre o id.",
    schema: { clienteId: z.number().int().positive() },
    async run({ clienteId }) {
      const lista = await api(`/agendamentos/cliente/${clienteId}`);
      return {
        agendamentos: (lista || []).map((a) => ({
          data: a.data,
          horaInicio: a.horaInicio,
          horaFim: a.horaFim,
          status: a.status,
          servico: a.servico?.nome ?? null,
        })),
      };
    },
  },
  {
    name: "listar_financeiro_periodo",
    desc: "Despesas no período (receitas = 0 no backend).",
    schema: {
      estabelecimentoId: z.number().int().positive(),
      dataInicio: z.string(),
      dataFim: z.string(),
    },
    async run({ estabelecimentoId, dataInicio, dataFim }) {
      const qs = new URLSearchParams({ dataInicio, dataFim });
      const raw = await api(`/despesas/estabelecimento/${estabelecimentoId}?${qs}`);
      const despesas = (raw || []).map((d) => ({
        nome: d.nome,
        tipo: d.tipo,
        dataDespesa: d.dataDespesa,
        valor: Number(d.valor) || 0,
      }));
      const totalDespesas = despesas.reduce((s, d) => s + d.valor, 0);
      return {
        totalDespesas,
        totalReceitas: 0,
        resultadoLiquido: -totalDespesas,
        quantidadeDespesas: despesas.length,
        despesas,
      };
    },
  },
  {
    name: "criar_agendamento",
    desc: `Cria agendamento (POST /agendamentos). Campos obrigatórios: clienteId, data (YYYY-MM-DD), horaInicio (HH:mm). horaFim opcional (+1h se omitido). NÃO pergunte servicoId nem usuarioId ao usuário — omita esses campos e o servidor usa serviço padrão id ${SERVICO_ID_PADRAO} e professor padrão id ${USUARIO_ID_PADRAO}. Só envie servicoId/usuarioId se o usuário informar números explicitamente.`,
    schema: {
      clienteId: z.number().int().positive(),
      data: z.string(),
      horaInicio: z.string(),
      horaFim: z.string().optional(),
      servicoId: z.number().int().positive().optional(),
      usuarioId: z.number().int().positive().optional(),
    },
    async run({ clienteId, data, horaInicio, horaFim, servicoId, usuarioId }) {
      const servicoIdFinal = servicoId ?? SERVICO_ID_PADRAO;
      const usuarioIdFinal = usuarioId ?? USUARIO_ID_PADRAO;
      if (servicoId == null) console.log("Usando serviço padrão:", SERVICO_ID_PADRAO);
      if (usuarioId == null) console.log("Usando usuário padrão:", USUARIO_ID_PADRAO);

      const horaFimFinal = horaFim ?? addOneHour(horaInicio);
      const payload = {
        clienteId,
        servicoId: servicoIdFinal,
        usuarioId: usuarioIdFinal,
        data,
        horaInicio,
        horaFim: horaFimFinal,
      };

      console.log("criar_agendamento payload:", JSON.stringify(payload));
      const criado = await api("/agendamentos", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      console.log("criar_agendamento resposta:", JSON.stringify(criado));
      return {
        id: criado.id,
        data: criado.data,
        horaInicio: criado.horaInicio,
        horaFim: criado.horaFim,
        status: criado.status,
        servicoId: servicoIdFinal,
        usuarioId: usuarioIdFinal,
      };
    },
  },

  {
  name: "criar_cliente",
  desc: "Cadastra cliente (POST /clientes). sexo: M, F ou OUTRO.",
  schema: {
    nome: z.string().min(1),
    telefone: z.string().min(1),
    dataNascimento: z.string(), // YYYY-MM-DD
    sexo: z.enum(["M", "F", "OUTRO"]),
    whatsappAtivo: z.boolean().optional(),
    fotoLink: z.string().optional(),
  },
  async run({ nome, telefone, dataNascimento, sexo, whatsappAtivo, fotoLink }) {
    const criado = await api("/clientes", {
      method: "POST",
      body: JSON.stringify({
        nome,
        telefone,
        dataNascimento,
        sexo,
        whatsappAtivo: whatsappAtivo ?? true,
        fotoLink: fotoLink ?? null,
      }),
    });
    return {
      ok: true,
      nome: criado.nome,
      telefone: criado.telefone,
      id: criado.id,
      como_responder: `Confirme o cadastro em uma frase: ${criado.nome} foi cadastrado. Não mostre o id.`,
    };
  },
},
{
  name: "registrar_entrada",
  desc: "Registra receita/entrada via POST /despesas com tipo Receita (workaround até API de receitas).",
  schema: {
    nome: z.string().min(1),
    valor: z.number().positive(),
    dataDespesa: z.string(), // YYYY-MM-DD
    estabelecimentoId: z.number().int().positive().default(1),
    descricao: z.string().optional(),
  },
  async run({ nome, valor, dataDespesa, estabelecimentoId, descricao }) {
    const criado = await api("/despesas", {
      method: "POST",
      body: JSON.stringify({
        nome: descricao ? `${nome} — ${descricao}` : nome,
        dataDespesa,
        tipo: "Receita",
        valor,
        estabelecimentoId: estabelecimentoId ?? 1,
      }),
    });
    return {
      id: criado.id,
      nome: criado.nome,
      tipo: criado.tipo,
      valor: Number(criado.valor),
      dataDespesa: criado.dataDespesa,
    };
  },
},
{
  name: "registrar_despesa",
  desc: "Registra despesa/saída (POST /despesas).",
  schema: {
    nome: z.string().min(1),
    valor: z.number().positive(),
    dataDespesa: z.string(), // YYYY-MM-DD
    estabelecimentoId: z.number().int().positive().default(1),
    tipo: z.string().default("Operacional"), // ex.: Operacional, Fixa, Variável
  },
  async run({ nome, valor, dataDespesa, estabelecimentoId, tipo }) {
    const criado = await api("/despesas", {
      method: "POST",
      body: JSON.stringify({
        nome,
        dataDespesa,
        tipo: tipo ?? "Operacional",
        valor,
        estabelecimentoId: estabelecimentoId ?? 1,
      }),
    });
    return {
      id: criado.id,
      nome: criado.nome,
      tipo: criado.tipo,
      valor: Number(criado.valor),
      dataDespesa: criado.dataDespesa,
    };
  },
},

];

function buildMcp() {
  const mcp = new McpServer(
    { name: "fisa-poc", version: "1.1.0" },
    {
      instructions:
        "Assistente da clínica Fisa Saúde. Responda em português, curto e humano. Ao falar de clientes, use os nomes. Nunca cite ID, MCP, API, endpoint, cookie, token nem truques de filtro. Se pedirem 'quem são os clientes', chame listar_clientes sem argumentos.",
    }
  );
  for (const t of tools) {
    mcp.registerTool(
      t.name,
      { description: t.desc, inputSchema: t.schema },
      async (args) => {
        try {
          return out(await t.run(args));
        } catch (e) {
          return { content: [{ type: "text", text: e.message }], isError: true };
        }
      }
    );
  }
  return mcp;
}

async function readBody(req) {
  const s = await readBodyText(req);
  return s ? JSON.parse(s) : undefined;
}

function bearerToken(req) {
  const h = req.headers.authorization || "";
  if (!h.startsWith("Bearer ")) return null;
  return h.slice(7).trim();
}

function mcpAllowsAnonymous(body) {
  const method = body?.method;
  return method === "initialize" || method === "notifications/initialized" || method === "tools/list";
}

createServer(async (req, res) => {
  const path = (req.url || "").split("?")[0];
  if (path === "/health") {
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }
  if (path.startsWith("/webhook/")) {
    proxyNotificacao(req, res);
    return;
  }
  if (await handleOAuth(req, res, path)) return;
  if (path !== "/mcp") {
    res.statusCode = path === "/" ? 200 : 404;
    res.end(path === "/" ? "MCP: /mcp | /health | OAuth\n" : "not found");
    return;
  }
  try {
    const body =
      req.method === "POST" ? await readBody(req) : undefined;
    const access = bearerToken(req);
    const tokenOk = access && oauthTokens.has(access) && oauthTokens.get(access).exp > Date.now();
    if (!tokenOk && !mcpAllowsAnonymous(body)) {
      const meta = `${publicBase(req)}/.well-known/oauth-protected-resource/mcp`;
      res.statusCode = 401;
      res.setHeader(
        "WWW-Authenticate",
        `Bearer resource_metadata="${meta}", scope="mcp"`
      );
      sendJson(res, 401, {
        error: "invalid_token",
        error_description: "Authentication required",
      });
      return;
    }
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    const mcp = buildMcp();
    await mcp.connect(transport);
    await transport.handleRequest(req, res, body);
  } catch (e) {
    console.log("Erro ao chamar API", e.message);
    if (!res.headersSent) res.end("erro mcp");
  }
}).listen(PORT, async () => {
  await login();
  console.log(`MCP iniciado na porta ${PORT} → http://localhost:${PORT}/mcp`);
});
