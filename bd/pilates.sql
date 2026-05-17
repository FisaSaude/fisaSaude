-- ==============================================================
-- FisaSaude — schema MySQL consolidado (instalação do zero)
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
    telefone_whatsapp VARCHAR(20) NOT NULL UNIQUE,
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
-- Dados iniciais (desenvolvimento / testes)
-- Admin: admin@fisasaude.com / Admin@1234
-- Usuario: usuario@fisasaude.com / User@1234
-- ==============================================================

INSERT INTO estabelecimento (id, nome, endereco, parametros, inicio_funcionamento, fim_funcionamento)
VALUES (1, 'Fisa Saude Unidade Central', 'Rua das Flores, 123 - Centro', NULL, '08:00:00', '18:00:00'),
       (2, 'Fisa Saude Unidade Zona Leste', 'Rua das Batatas, 321 - Bairro XPTO', NULL, '08:00:00', '18:00:00');

INSERT INTO usuario (id, nome, email, senha, role, estabelecimento_id)
VALUES (1,
        'Administrador',
        'admin@fisasaude.com',
        '$2a$10$g44XcIicHlha8CYRwwPPleDshvswcEvQoMiTZrDoxRHcOTj5LcJkK',
        'ADMIN',
        1),
       (2,
        'Profissional Teste',
        'usuario@fisasaude.com',
        '$2a$10$rpKmL65qI.PBz5wC4HKKEOpsinAdfpvkPbmlOcnAunjZxo6sWOTgy',
        'USUARIO',
        1);

INSERT INTO servico (id, nome, tipo, duracao_minutos, preco, ativo)
VALUES (1, 'Aula Experimental', 'pilates', 60, 0.00, TRUE),
       (2, 'Aula Avulsa', 'pilates', 60, 50.00, TRUE),
       (3, 'Aula Mensal', 'pilates', 60, 180.00, TRUE),
       (4, 'Aula Semestral', 'pilates', 60, 950.00, TRUE);

INSERT INTO cliente (id, nome, telefone_whatsapp, whatsapp_ativo, data_nascimento, sexo, foto_link)
VALUES (1, 'Mariana Silva', '5511999000111', TRUE, '1990-04-12', 'F', NULL),
       (2, 'Joao Pereira', '5511988776655', TRUE, '1985-11-23', 'M', NULL),
       (3, 'Ana Souza', '5511977112233', TRUE, '1995-07-02', 'F', NULL),
       (4, 'Carlos Mendes', '5511966334455', TRUE, '1978-02-14', 'M', NULL),
       (5, 'Beatriz Costa', '5511955443322', TRUE, '2000-09-30', 'F', NULL);

INSERT INTO despesa (id, nome, data_despesa, tipo, valor, estabelecimento_id)
VALUES (1, 'Compra de colchonetes', '2026-01-15', 'Operacional', 350.00, 1),
       (2, 'Pagamento aluguel - Cliente 3', '2026-02-01', 'Operacional', 180.00, 1),
       (3, 'Pagamento professor - Fevereiro', '2026-02-28', 'Operacional', 1200.00, 1);

INSERT INTO agendamento (id, data, hora_inicio, hora_fim, status, observacoes, cliente_id, servico_id, usuario_id)
VALUES (1, '2026-05-10', '09:00:00', '09:30:00', 'AGENDADO', 'Aula experimental de pilates', 1, 1, 2),
       (2, '2026-05-10', '10:00:00', '11:00:00', 'CONFIRMADO', 'Aula avulsa - trouxe roupa adequada', 2, 2, 2),
       (3, '2026-05-11', '14:00:00', '15:00:00', 'CANCELADO', 'Cliente avisou que nao podera comparecer', 3, 2, 2),
       (4, '2026-05-12', '08:00:00', '09:00:00', 'CONCLUIDO', 'Aula mensal - 1a aula do pacote', 4, 3, 2),
       (5, '2026-05-13', '11:00:00', '12:00:00', 'AGENDADO', 'Aula semestral - pagamento a confirmar', 5, 4, 2);

INSERT INTO notificacao (id, tipo, status, twilio_message_sid, tentativas, mensagem, proxima_retentativa, enviado_em, agendamento_id)
VALUES (1, 'LEMBRETE', 'PENDENTE', NULL, 0, 'Lembrete: voce tem um agendamento em 2026-05-10 as 09:00', '2026-05-10 08:50:00', NULL, 1),
       (2, 'CONFIRMACAO', 'ENVIADO', 'SM1234567890', 1, 'Confirme sua presenca na aula das 10:00', NULL, '2026-05-09 09:00:00', 2),
       (3, 'CANCELAMENTO', 'ENVIADO', 'SM1234567891', 0, 'Seu agendamento foi cancelado', NULL, '2026-05-10 12:00:00', 3),
       (4, 'LEMBRETE', 'FALHOU', 'SM1234567892', 3, 'Tentativa de enviar lembrete falhou', '2026-05-10 09:05:00', NULL, 5);

INSERT INTO prontuario (id, observacoes, criado_em, cliente_id)
VALUES (1, 'Cliente com historico de lombalgia, liberar para exercicios leves', '2026-01-20 10:00:00', 1),
       (2, 'Paciente em condicao cardiaca, necessita acompanhamento medico', '2026-03-05 15:30:00', 4),
       (3, 'Sem restricoes significativas', '2026-04-10 11:00:00', 5);
