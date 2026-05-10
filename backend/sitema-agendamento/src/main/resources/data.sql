INSERT IGNORE INTO estabelecimento (id, nome, endereco, parametros, inicio_funcionamento, fim_funcionamento)
VALUES (1, 'Fisa Saude Unidade Central', 'Rua das Flores, 123 - Centro', NULL, '08:00:00', '18:00:00');

INSERT IGNORE INTO estabelecimento (id, nome, endereco, parametros, inicio_funcionamento, fim_funcionamento)
VALUES (2, 'Fisa Saude Unidade Zona Leste', 'Rua das Batatas, 321 - Bairro XPTO', NULL, '08:00:00', '18:00:00');

-- Admin : senha em texto plano → Admin@1234
-- Usuário: senha em texto plano → User@1234

INSERT IGNORE INTO usuario (id, nome, email, senha, `role`, estabelecimento_id)
VALUES (1,
        'Administrador',
        'admin@fisasaude.com',
        '$2a$10$g44XcIicHlha8CYRwwPPleDshvswcEvQoMiTZrDoxRHcOTj5LcJkK',
        'ADMIN',
        1);

INSERT IGNORE INTO usuario (id, nome, email, senha, `role`, estabelecimento_id)
VALUES (2,
        'Profissional Teste',
        'usuario@fisasaude.com',
        '$2a$10$rpKmL65qI.PBz5wC4HKKEOpsinAdfpvkPbmlOcnAunjZxo6sWOTgy',
        'USUARIO',
        1);

INSERT IGNORE INTO servico (id, nome, tipo, duracao_minutos, preco, ativo)
VALUES (1, 'Aula Experimental', 'pilates', 60, 0.00, TRUE),
       (2, 'Aula Avulsa', 'pilates', 60, 50.00, TRUE),
       (3, 'Aula Mensal', 'pilates', 60, 180.00, TRUE),
       (4, 'Aula Semestral', 'pilates', 60, 950.00, TRUE);

INSERT IGNORE INTO cliente (id, nome, telefone_whatsapp, whatsapp_ativo, data_nascimento, sexo, foto_link)
VALUES (1, 'Mariana Silva', '5511999000111', TRUE, '1990-04-12', 'F', NULL),
       (2, 'Joao Pereira', '5511988776655', TRUE, '1985-11-23', 'M', NULL),
       (3, 'Ana Souza', '5511977112233', TRUE, '1995-07-02', 'F', NULL),
       (4, 'Carlos Mendes', '5511966334455', TRUE, '1978-02-14', 'M', NULL),
       (5, 'Beatriz Costa', '5511955443322', TRUE, '2000-09-30', 'F', NULL);

INSERT IGNORE INTO despesa (id, nome, data_despesa, tipo, valor, estabelecimento_id)
VALUES (1, 'Compra de colchonetes', '2026-01-15', 'SAIDA', 350.00, 1),
       (2, 'Venda pacote mensal - Cliente 3', '2026-02-01', 'ENTRADA', 180.00, 1),
       (3, 'Pagamento professor - Fevereiro', '2026-02-28', 'SAIDA', 1200.00, 1);

INSERT IGNORE INTO agendamento (id, data, hora_inicio, hora_fim, `status`, observacoes, cliente_id, servico_id, usuario_id)
VALUES (1, '2026-05-10', '09:00:00', '09:30:00', 'AGENDADO', 'Aula experimental de pilates', 1, 1, 2),
       (2, '2026-05-10', '10:00:00', '11:00:00', 'CONFIRMADO', 'Aula avulsa - trouxe roupa adequada', 2, 2, 2),
       (3, '2026-05-11', '14:00:00', '15:00:00', 'CANCELADO', 'Cliente avisou que nao podera comparecer', 3, 2, 2),
       (4, '2026-05-12', '08:00:00', '09:00:00', 'CONCLUIDO', 'Aula mensal - 1a aula do pacote', 4, 3, 2),
       (5, '2026-05-13', '11:00:00', '12:00:00', 'AGENDADO', 'Aula semestral - pagamento a confirmar', 5, 4, 2);

INSERT IGNORE INTO notificacao (id, tipo, `status`, twilio_message_sid, tentativas, mensagem, proxima_retentativa, enviado_em, agendamento_id)
VALUES (1, 'LEMBRETE', 'PENDENTE', NULL, 0, 'Lembrete: voce tem um agendamento em 2026-05-10 as 09:00', '2026-05-10 08:50:00', NULL, 1),
       (2, 'CONFIRMACAO', 'ENVIADO', 'SM1234567890', 1, 'Confirme sua presenca na aula das 10:00', NULL, '2026-05-09 09:00:00', 2),
       (3, 'CANCELAMENTO', 'ENVIADO', 'SM1234567891', 0, 'Seu agendamento foi cancelado', NULL, '2026-05-10 12:00:00', 3),
       (4, 'LEMBRETE', 'FALHOU', 'SM1234567892', 3, 'Tentativa de enviar lembrete falhou', '2026-05-10 09:05:00', NULL, 5);

INSERT IGNORE INTO prontuario (id, observacoes, criado_em, cliente_id)
VALUES (1, 'Cliente com historico de lombalgia, liberar para exercicios leves', '2026-01-20 10:00:00', 1),
       (2, 'Paciente em condicao cardiaca, necessita acompanhamento medico', '2026-03-05 15:30:00', 4),
       (3, 'Sem restricoes significativas', '2026-04-10 11:00:00', 5);


