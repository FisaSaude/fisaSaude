# Ajustes DER + alternativa ao Redis

## Changelog — schema v3 (alinhado ao `der_v3.mwb`)

| Mudança | Motivo |
|---------|--------|
| `usuario.perfil` (antes `role` no modelo relacional) | Nomenclatura em português no banco |
| Tabela `estabelecimento` | Contexto do estúdio e horários |
| Índices em chaves de consulta frequente | Desempenho |
| `cliente.telefone_whatsapp` + `whatsapp_ativo` | Contato exclusivo via WhatsApp (sem coluna de telefone genérico) |
| `agendamento.status` com `AGENDADO`, `CANCELADO`, `CONCLUIDO` | Modelo simples para o fluxo atual |
| Tabelas `agendamento_status_historico` e `mensagem_resposta_whatsapp` | Auditoria de status e respostas do webhook |
| Campos extras em `notificacao` (Twilio, tentativas, retry) | Idempotência, reenvio e diagnóstico |

**Consistência:** ENUMs e nomes de tabelas/colunas em português no script `bd/pilates.sql`. No backend Java, o campo de perfil ainda pode aparecer como `role` no código até a refatoração da API — o banco usa `perfil`.

---

## 1. Estrutura DER (resumo)

### `usuario`

- `id`, `nome`, `email` (único), `senha`, `perfil` (`ADMIN`, `RECEPCIONISTA`, `INSTRUTOR`), `ativo`, `criado_em`

### `cliente`

- `id`, `nome`, `telefone_whatsapp` (único, obrigatório — número usado no WhatsApp), `whatsapp_ativo`, `data_nascimento`, `sexo`, `foto_link`

### `agendamento`

- `id`, `cliente_id`, `servico_id`, `usuario_id` (instrutor/responsável)
- `data` (`DATE`), `hora_inicio`, `hora_fim` (`TIME`)
- `status`: `ENUM('AGENDADO','CANCELADO','CONCLUIDO')`
- `observacoes`, `criado_em`, `atualizado_em`
- Restrição única: `(data, hora_inicio, usuario_id)` — evita dois compromissos no mesmo horário para o mesmo profissional (coerente com a entidade JPA)

### `notificacao`

- `agendamento_id`, `tipo`, `status`, `twilio_message_sid`, `tentativas`, `mensagem`, `proxima_retentativa`, `enviado_em`, `criado_em`

**`twilio_message_sid`:** a Twilio devolve um identificador único (SID) para cada mensagem enviada. Guardar esse valor permite: evitar processar o mesmo envio duas vezes (idempotência), correlacionar respostas do webhook com o registro da notificação e depurar falhas na API da Twilio.

### Tabelas auxiliares

**`agendamento_status_historico`:** trilha de mudanças de status (`status_anterior`, `status_novo`, `motivo`, `usuario_id`, `criado_em`).

**`mensagem_resposta_whatsapp`:** respostas recebidas do cliente (`conteudo_resposta`, `resposta_tipo`, vínculo com agendamento/cliente, `twilio_message_sid`, `data_recebida`).

### Índices (resumo)

- `cliente`: `telefone_whatsapp`
- `agendamento`: `(cliente_id, data)`, `(data, status)`, `status`
- `notificacao`: `status`, `(tentativas, proxima_retentativa)`, `agendamento_id`
- `agendamento_status_historico`: `agendamento_id`, `criado_em`
- `mensagem_resposta_whatsapp`: `agendamento_id`, `data_recebida`

---

## 2. Redis: é pago? Precisamos?

Redis é open source; dá para rodar de graça (Docker, servidor próprio ou tier gratuito em nuvem). Para o escopo atual (pouca concorrência, MVP), **não é obrigatório**.

### Opção leve sem Redis: lock por arquivo (Node ou script)

Um diretório de locks no filesystem (ou volume Docker) evita condição de corrida em jobs simples. Limite: não serve bem para vários nós sem storage compartilhado.

### Opção 100% MySQL: tabela `distributed_lock`

Lock transacional no mesmo banco que o sistema já usa — mais overhead que Redis, porém sem novo serviço.

```sql
CREATE TABLE distributed_lock (
    lock_name VARCHAR(100) PRIMARY KEY,
    acquired_at DATETIME,
    expires_at DATETIME,
    INDEX idx_expires (expires_at)
);
```

**Sugestão:** adiar Redis até haver necessidade real de fila/cache ou múltiplas instâncias com coordenação distribuída.

---

## 3. Próximos passos

- Script canônico: `bd/pilates.sql` + modelo `bd/der_v3.mwb`
- Se adotar lock em banco: criar `distributed_lock` e implementar serviço de aquisição/liberação com TTL
- Refatorar Java para coluna `perfil` e DTOs, quando fizer sentido na sprint
