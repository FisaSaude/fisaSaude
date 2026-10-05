/** POC: MCP → API Java (:8080). Rode: node server.js */
import { createServer, request as httpRequest } from "node:http";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const API = "http://localhost:8080";
const PORT = 3333;
const NOTIFICACAO_PORT = 8081;
let token;

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

async function login() {
  const r = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@fisasaude.com", senha: "Admin@1234" }),
  });
  if (!r.ok) throw new Error(`login falhou ${r.status}`);
  token = (await r.json()).token;
  console.log("Login realizado com sucesso");
}

async function api(path, opt = {}) {
  if (!token) await login();
  const method = opt.method || "GET";
  console.log(`Chamando endpoint: ${method} ${path}`);
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  let r = await fetch(`${API}${path}`, { ...opt, headers });
  if (r.status === 401) {
    await login();
    r = await fetch(`${API}${path}`, {
      ...opt,
      headers: { ...headers, Authorization: `Bearer ${token}` },
    });
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

const tools = [
  {
    name: "buscar_cliente",
    desc: "Cliente por id ou nome (filtra lista).",
    schema: { nome: z.string().optional(), id: z.number().int().positive().optional() },
    async run({ nome, id }) {
      if (id != null) {
        const c = await api(`/clientes/${id}`);
        return { clientes: [{ id: c.id, nome: c.nome }] };
      }
      if (!nome?.trim()) throw new Error("Informe id ou nome.");
      const n = nome.trim().toLowerCase();
      const lista = await api("/clientes");
      return {
        clientes: (lista || [])
          .filter((c) => c.nome?.toLowerCase().includes(n))
          .map((c) => ({ id: c.id, nome: c.nome })),
      };
    },
  },
  {
    name: "listar_agendamentos_cliente",
    desc: "Agendamentos de um cliente.",
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
    desc: "Novo agendamento (POST /agendamentos).",
    schema: {
      clienteId: z.number().int().positive(),
      servicoId: z.number().int().positive(),
      usuarioId: z.number().int().positive(),
      data: z.string(),
      horaInicio: z.string(),
      horaFim: z.string(),
    },
    async run(args) {
      console.log("criar_agendamento payload:", JSON.stringify(args));
      const criado = await api("/agendamentos", {
        method: "POST",
        body: JSON.stringify(args),
      });
      console.log("criar_agendamento resposta:", JSON.stringify(criado));
      return {
        id: criado.id,
        data: criado.data,
        horaInicio: criado.horaInicio,
        horaFim: criado.horaFim,
        status: criado.status,
      };
    },
  },
];

function buildMcp() {
  const mcp = new McpServer({ name: "fisa-poc", version: "1.0.0" });
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
  const buf = await new Promise((res, rej) => {
    const c = [];
    req.on("data", (x) => c.push(x));
    req.on("end", () => res(Buffer.concat(c)));
    req.on("error", rej);
  });
  const s = buf.toString("utf8");
  return s ? JSON.parse(s) : undefined;
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
  if (path !== "/mcp") {
    res.statusCode = path === "/" ? 200 : 404;
    res.end(path === "/" ? "MCP: /mcp | /health\n" : "not found");
    return;
  }
  try {
    const body =
      req.method === "POST" ? await readBody(req) : undefined;
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
