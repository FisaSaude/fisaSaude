# AGENTS.md — Fisa Saúde

Monorepo sem build raiz. Cada serviço é independente; não procure `pom.xml` ou `package.json` na raiz.

## Mapa

- `backend/sitema-agendamento/` — API REST Spring Boot 4 / Java 21, porta 8080. Fonte de verdade de clientes, agendamentos, usuários, despesas, prontuários e fila de notificações.
- `backend/notificacao/` — Spring Boot, porta 8081. Twilio/WhatsApp, webhooks e endpoints internos. Mesmo banco `pilates`; `ddl-auto: validate`.
- `bd/pilates.sql` — schema único (`DROP`/`CREATE` + seeds). `bd/apply-pilates.sh` aplica. `der_v3.mwb` e `assets/der-v3.png` são conceituais e podem divergir.
- `frontend/Fisa-Saude/` — app web ativo: Vite 6, React 18, TSX, Tailwind 4, MUI/Radix, React Router 7. Apesar do README raiz, é aqui que está o frontend real.
- `poc-mcp/` — POC Node do MCP em `:3333`; loga na API `:8080` e faz proxy de `/webhook/*` para `:8081`.
- `progWebProjetosIndividuais/` — arquivo acadêmico.
- `frontend/meu-projeto/`, `frontend/App.jsx` e `frontend/scr/` são rascunhos antigos; não são o app ativo.

## Comandos

Backend (sempre dentro do módulo; não há agregador Maven):

```bash
cd backend/sitema-agendamento && ./mvnw spring-boot:run
cd backend/notificacao && ./mvnw spring-boot:run
./mvnw test
./mvnw test -Dtest=AgendamentoServiceTest
./mvnw test -Dtest=AgendamentoServiceTest#nomeDoMetodo
```

Os testes rodam sem MySQL/Twilio; os `@SpringBootTest` usam H2 via `src/test/resources/application-test.yaml` e `@ActiveProfiles("test")`.

Banco:

```bash
DB_PASSWORD='...' ./bd/apply-pilates.sh
```

Atenção: o script apaga e recria o database `pilates`. Nunca rode contra dados que importam.

Frontend:

```bash
cd frontend/Fisa-Saude
pnpm install
pnpm dev      # Vite em :5173
pnpm build    # única verificação configurada
```

Use **pnpm** (`pnpm-lock.yaml`, `pnpm-workspace.yaml`, `pnpm.overrides` no `package.json`). Há um `package-lock.json` versionado junto; não regenere/commit sem pedido do time. Node 22 (`.nvmrc`). `VITE_API_URL` sobrescreve a API (padrão `http://localhost:8080`).

MCP:

```bash
cd poc-mcp && npm start   # :3333; exige a API :8080 no ar para o login
```

## Integração e segurança

- Agendamento criado/remarcado → após commit, `sitema-agendamento` chama `POST :8081/internal/v1/notifications/confirmacao/{id}`.
- Twilio inbound → `notificacao` (`/webhook/twilio/whatsapp/incoming`) → `POST :8080/internal/v1/agendamentos/{id}/resposta-whatsapp`; `SIM` → `CONFIRMADO`, `NAO` → `CANCELADO`.
- Lembrete D-1: cron `0 0 15 * * ?` (`America/Sao_Paulo`) no `notificacao`, que busca `GET :8080/internal/v1/agendamentos/lembretes-confirmados?data=YYYY-MM-DD`.
- Rotas `/internal/**` usam `X-Internal-Token`, não JWT. Webhooks Twilio são `permitAll`. Não adicione JWT a essas rotas.
- O JWT do agendamento aceita `Authorization: Bearer ...` ou cookie `access_token`. `/usuarios/**`, `/despesas/**` e `/estabelecimentos/**` exigem `ADMIN`.
- CORS do agendamento libera apenas `:5173`, `:5174` e `:5500`. Se o Vite subir em outra porta, login/fetch falham.
- Os dois backends compartilham o banco e duplicam entidades. Mudou coluna/status? Atualize `bd/pilates.sql` **e** as entidades dos dois serviços; o `notificacao` valida o schema no boot.
- `agendamento` usa `ddl-auto: update`; não confie nele como schema. Não crie `schema.sql`/`data.sql` nos módulos.
- Tokens internos: defaults `dev123` aparecem nos YAML dos dois lados. Ao trocar, ajuste `INTERNAL_API_KEY`/`AGENDAMENTO_INTERNAL_TOKEN` e o lado que envia.
- O pom usa starters do Boot 4 (`spring-boot-starter-webmvc`, `spring-boot-starter-data-jpa-test`, etc.); copie o padrão existente em vez de adicionar starters do Boot 3.

## Convenções e armadilhas

- Código, mensagens de erro e termos de domínio em português. Mantenha a grafia `sitema-agendamento` (com o typo) em caminhos e artefatos.
- Swagger fica em interfaces `Swagger*Controller` implementadas pelo controller real. Adicione/edite a documentação na interface.
- No frontend, importe de `react-router` (v7), não de `react-router-dom` (não instalado). O alias `@` aponta para `src`.
- O deploy do frontend usa convenções de Cloudflare Pages: `functions/_middleware.js`, `public/_headers` e `public/_redirects` fazem parte do deploy; não remova.
- `backend/target/` e `backend/*.zip` são artefatos antigos versionados (incluem classes de pacote antigo). Não use como fonte.
- O `.gitignore` ignora `*.md`, exceto `README.md`. `AGENTS.md` foi liberado explicitamente; não remova a exceção.
- O hook `.githooks/prepare-commit-msg` remove trailers de Cursor. Ative com `git config core.hooksPath .githooks`. Nunca adicione `Co-authored-by` de IA; regra em `.cursor/rules/local/no-cursor-coauthor.mdc`.
- `poc-mcp/server.js` tem credenciais admin de dev e OAuth em memória; é POC, não produção.
- Não há CI, lint ou typecheck no produto. As verificações são `./mvnw test` (por módulo) e `pnpm build`.
