#!/usr/bin/env bash
# Ordem sugerida para demo Fisa (não inicia serviços — apenas lembrete).
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cat <<EOF
=== Fisa Saúde — POC (MCP + Twilio, 1 ngrok) ===

1) MySQL + schema:
   export DB_PASSWORD='...'
   "$ROOT/bd/apply-pilates.sh"

2) API agendamento (:8080):
   cd "$ROOT/backend/sitema-agendamento" && ./mvnw spring-boot:run

3) Notificações Twilio (:8081):
   cd "$ROOT/backend/notificacao" && ./mvnw spring-boot:run

4) MCP Node (:3333):
   cd "$ROOT/poc-mcp" && npm start

5) Um único ngrok:
   ngrok http 3333
   export MCP_PUBLIC_URL=https://SEU_SUBDOMINIO.ngrok-free.app
   Twilio webhook: \$MCP_PUBLIC_URL/webhook/twilio/whatsapp/incoming
   Claude MCP:     \$MCP_PUBLIC_URL/mcp

6) Frontend (opcional, local): cd frontend/Fisa-Saude && npm run dev  → :5174
EOF
