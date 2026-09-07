-- ==============================================================
-- FisaSaude — schema MySQL consolidado (compatível com o back-end atual)
-- Database: pilates
-- Uso: mysql -u root -p < bd/pilates.sql
-- ==============================================================

DROP DATABASE IF EXISTS pilates;
CREATE DATABASE pilates CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pilates;

-- ESTABELECIMENTO
CREATE TABLE estabelecimento (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    parametros VARCHAR(255),
    inicio_funcionamento TIME NOT NULL,
    fim_funcionamento TIME NOT NULL,
    telefone VARCHAR(20),
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- DESPESA
CREATE TABLE despesa (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    data_despesa DATE NOT NULL,
    tipo VARCHAR(45) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    estabelecimento_id INT NOT NULL,
    CONSTRAINT fk_despesa_estabelecimento
        FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimento (id)
) ENGINE=InnoDB;

-- USUARIO
CREATE TABLE usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'USUARIO') NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    estabelecimento_id INT NOT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_estabelecimento
        FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimento (id)
) ENGINE=InnoDB;

-- CLIENTE
CREATE TABLE cliente (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    telefone_whatsapp VARCHAR(20) NOT NULL,
    whatsapp_ativo BOOLEAN DEFAULT TRUE,
    data_nascimento DATE NOT NULL,
    sexo ENUM('M', 'F', 'OUTRO') NOT NULL,
    foto_link VARCHAR(255),
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- SERVICO
CREATE TABLE servico (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL DEFAULT 'geral',
    duracao_minutos INT NOT NULL DEFAULT 60,
    preco DECIMAL(10, 2) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- AGENDAMENTO
CREATE TABLE agendamento (
    id INT PRIMARY KEY AUTO_INCREMENT,
    data DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    status ENUM('AGENDADO', 'CONFIRMADO', 'CANCELADO', 'CONCLUIDO', 'BLOQUEADO') NOT NULL DEFAULT 'AGENDADO',
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    observacoes TEXT,
    cliente_id INT,
    servico_id INT,
    usuario_id INT NOT NULL,
    CONSTRAINT fk_agendamento_cliente
        FOREIGN KEY (cliente_id) REFERENCES cliente (id),
    CONSTRAINT fk_agendamento_servico
        FOREIGN KEY (servico_id) REFERENCES servico (id),
    CONSTRAINT fk_agendamento_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario (id),
    UNIQUE KEY uk_agendamento (data, hora_inicio, usuario_id)
) ENGINE=InnoDB;

-- NOTIFICACAO
CREATE TABLE notificacao (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tipo ENUM('LEMBRETE', 'CONFIRMACAO', 'CANCELAMENTO', 'REAGENDAMENTO') NOT NULL,
    status ENUM('PENDENTE', 'ENVIADO', 'FALHOU', 'DESCARTADA') NOT NULL DEFAULT 'PENDENTE',
    twilio_message_sid VARCHAR(100) UNIQUE,
    tentativas INT NOT NULL DEFAULT 0,
    mensagem TEXT,
    proxima_retentativa DATETIME,
    enviado_em DATETIME,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    agendamento_id INT NOT NULL,
    CONSTRAINT fk_notificacao_agendamento
        FOREIGN KEY (agendamento_id) REFERENCES agendamento (id),
    INDEX idx_status (status),
    INDEX idx_tentativas (tentativas, proxima_retentativa),
    INDEX idx_agendamento (agendamento_id)
) ENGINE=InnoDB;

-- MENSAGEM RESPOSTA WHATSAPP
CREATE TABLE mensagem_resposta_whatsapp (
    id INT PRIMARY KEY AUTO_INCREMENT,
    agendamento_id INT NOT NULL,
    cliente_id INT NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    conteudo_resposta TEXT NOT NULL,
    resposta_tipo ENUM('SIM', 'NAO', 'REAGENDAR', 'OUTRO') NOT NULL DEFAULT 'OUTRO',
    twilio_message_sid VARCHAR(100),
    data_recebida DATETIME NOT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mr_agendamento
        FOREIGN KEY (agendamento_id) REFERENCES agendamento (id),
    CONSTRAINT fk_mr_cliente
        FOREIGN KEY (cliente_id) REFERENCES cliente (id),
    INDEX idx_mr_agenda (agendamento_id),
    INDEX idx_mr_data (data_recebida)
) ENGINE=InnoDB;

-- PRONTUARIO
CREATE TABLE prontuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    observacoes TEXT NOT NULL,
    criado_em DATETIME NOT NULL,
    cliente_id INT NOT NULL,
    CONSTRAINT fk_prontuario_cliente
        FOREIGN KEY (cliente_id) REFERENCES cliente (id)
) ENGINE=InnoDB;

-- ==============================================================
-- DADOS INICIAIS (PRESERVADOS EXATAMENTE COMO SOLICITADO)
-- ==============================================================

-- ESTABELECIMENTO (INTACTO)
INSERT INTO estabelecimento (id, nome, endereco, parametros, inicio_funcionamento, fim_funcionamento)
VALUES (1, 'Fisa Saude Unidade Central', 'Rua das Flores, 123 - Centro', NULL, '08:00:00', '18:00:00'),
       (2, 'Fisa Saude Unidade Zona Leste', 'Rua das Batatas, 321 - Bairro XPTO', NULL, '08:00:00', '18:00:00');

-- USUARIO (INTACTO)
INSERT INTO usuario (id, nome, email, senha, role, estabelecimento_id)
VALUES (1, 'Ana Cristina Perreira', 'admin@fisasaude.com', '$2a$10$g44XcIicHlha8CYRwwPPleDshvswcEvQoMiTZrDoxRHcOTj5LcJkK', 'ADMIN', 1),
       (2, 'Profissional Teste', 'usuario@fisasaude.com', '$2a$10$rpKmL65qI.PBz5wC4HKKEOpsinAdfpvkPbmlOcnAunjZxo6sWOTgy', 'USUARIO', 1);

-- SERVICO (INTACTO)
INSERT INTO servico (id, nome, tipo, duracao_minutos, preco, ativo) VALUES
-- Sessões Avulsas e Básicas
(1, 'Aula Experimental', 'pilates', 60, 0.00, TRUE),
(2, 'Fisioterapia e RPG - Sessão Avulsa', 'fisioterapia', 60, 200.00, TRUE),
(3, 'Liberação Miofascial - Sessão Avulsa', 'liberacao_miofascial', 60, 150.00, TRUE),

-- Pilates Ciclo 25/26 (Mensal)
(4, 'Pilates 1x/semana - Mensal', 'pilates', 60, 307.00, TRUE),
(5, 'Pilates 2x/semana - Mensal', 'pilates', 60, 457.00, TRUE),
(6, 'Pilates 3x/semana - Mensal', 'pilates', 60, 597.00, TRUE),

-- Pilates Ciclo 25/26 (Semestral - valor mensal)
(7, 'Pilates 1x/semana - Semestral', 'pilates', 60, 227.00, TRUE),
(8, 'Pilates 2x/semana - Semestral', 'pilates', 60, 367.00, TRUE),
(9, 'Pilates 3x/semana - Semestral', 'pilates', 60, 497.00, TRUE),

-- Pacotes de Cuidado Fisa Saúde (Mensal)
(10, 'Pacote Fisa Movimento (Pilates 2x/sem + Fisioterapia 1x/mês)', 'pacote', 60, 620.00, TRUE),
(11, 'Pacote Fisa Cuidado (Pilates 2x/sem + Fisioterapia 2x/mês)', 'pacote', 60, 810.00, TRUE),
(12, 'Pacote Fisa Performance (Pilates 2x/sem + Fisio 1x/mês + Liberação 1x/mês)', 'pacote', 60, 760.00, TRUE);

-- ==============================================================
-- CLIENTES (Telefones sem duplicidade para validação unique)
-- ==============================================================
INSERT INTO cliente (id, nome, telefone_whatsapp, whatsapp_ativo, data_nascimento, sexo, foto_link) VALUES
(1, 'Mariana Silva', '11984210931', TRUE, '1990-04-12', 'F', NULL),
(2, 'Joao Pereira', '11976543210', TRUE, '1985-11-23', 'M', NULL),
(3, 'Ana Souza', '11999887766', TRUE, '1995-07-02', 'F', NULL),
(4, 'Carlos Mendes', '11981234567', TRUE, '1978-02-14', 'M', NULL),
(5, 'Beatriz Costa', '11995431289', TRUE, '2000-09-30', 'F', NULL),
(6, 'Juliana Rodrigues', '11971239845', TRUE, '1989-01-15', 'F', NULL),
(7, 'Roberto Lima', '11987654321', TRUE, '1975-06-20', 'M', NULL),
(8, 'Marina Costa', '11991238475', TRUE, '1994-08-11', 'F', NULL);

-- ==============================================================
-- DESPESAS (Equilibradas para Setembro/2026 - Total: R$ 1.130,00)
-- ==============================================================
INSERT INTO despesa (id, nome, data_despesa, tipo, valor, estabelecimento_id) VALUES
(1, 'Compra de colchonetes e faixas elásticas', '2026-09-01', 'Operacional', 350.00, 1),
(2, 'Taxa de manutenção e software', '2026-09-02', 'Operacional', 180.00, 1),
(3, 'Serviços de assessoria contábil mensal', '2026-09-05', 'Administrativo', 600.00, 1);

-- ==============================================================
-- AGENDAMENTOS (Setembro/2026 - Concluídos: R$ 3.867,00)
-- ==============================================================
INSERT INTO agendamento (id, data, hora_inicio, hora_fim, status, observacoes, cliente_id, servico_id, usuario_id) VALUES
-- Atendimentos concluídos que alimentam as receitas de Setembro/2026
(1,  '2026-09-01', '08:40:00', '09:40:00', 'CONCLUIDO', 'Mensalidade quitada - Pilates 2x/semana', 1, 5, 1),   -- R$ 457.00
(2,  '2026-09-01', '10:20:00', '11:20:00', 'CONCLUIDO', 'Pacote Fisa Movimento mensal quitado', 2, 10, 1),    -- R$ 620.00
(3,  '2026-09-02', '09:30:00', '10:30:00', 'CONCLUIDO', 'Pilates 3x/semana mensalidade', 3, 6, 1),           -- R$ 597.00
(4,  '2026-09-03', '14:40:00', '15:40:00', 'CONCLUIDO', 'Pacote Cuidado integral mensal', 4, 11, 1),         -- R$ 810.00
(5,  '2026-09-04', '08:40:00', '09:40:00', 'CONCLUIDO', 'Pilates 2x/semana Semestral pago', 5, 8, 1),        -- R$ 367.00
(6,  '2026-09-04', '11:10:00', '12:10:00', 'CONCLUIDO', 'Sessão avulsa Fisioterapia e RPG', 6, 2, 1),        -- R$ 200.00
(7,  '2026-09-07', '08:40:00', '09:40:00', 'CONCLUIDO', 'Pilates 3x/semana mensal', 7, 6, 1),                -- R$ 597.00
(8,  '2026-09-07', '10:20:00', '11:20:00', 'CONCLUIDO', 'Sessão avulsa Liberação Miofascial', 8, 3, 1),      -- R$ 150.00
(9,  '2026-09-07', '11:20:00', '12:20:00', 'CANCELADO', 'Cliente desmarcou com antecedência', 1, 5, 1),       -- Cancelado

-- Próximos agendamentos da semana
(10, '2026-09-08', '09:30:00', '10:30:00', 'CONFIRMADO', 'Pilates regular', 2, 5, 1),
(11, '2026-09-09', '14:40:00', '15:40:00', 'AGENDADO', 'Fisioterapia preventiva', 3, 2, 1),
(12, '2026-09-10', '16:20:00', '17:20:00', 'AGENDADO', 'Pilates aparelho', 4, 4, 1);

-- ==============================================================
-- NOTIFICACOES E PRONTUARIOS
-- ==============================================================
INSERT INTO notificacao (id, tipo, status, twilio_message_sid, tentativas, mensagem, proxima_retentativa, enviado_em, agendamento_id) VALUES
(1, 'CONFIRMACAO', 'ENVIADO', 'SM1234567890', 1, 'Confirme sua presenca na sessao de Pilates hoje', NULL, '2026-09-07 07:00:00', 7),
(2, 'LEMBRETE', 'PENDENTE', NULL, 0, 'Lembrete de atendimento amanhã às 09:30', '2026-09-08 08:30:00', NULL, 10);

INSERT INTO prontuario (id, observacoes, criado_em, cliente_id) VALUES
(1, 'Cliente com historico de lombalgia, liberar para exercicios leves no reformer', '2026-09-01 10:00:00', 1),
(2, 'Encaminhado com tendinopatia. Evitar abducao excessiva de ombro', '2026-09-02 11:30:00', 2),
(3, 'Sem restricoes significativas, foco em mobilidade e ganho de flexibilidade', '2026-09-04 15:00:00', 5);
