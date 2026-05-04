-- ==============================================================
-- BANCO DE DADOS: FISASAÚDE - Sistema de Agendamento Pilates
-- Versão: 3.0
-- Data: 01/05/2026
-- ==============================================================

CREATE DATABASE IF NOT EXISTS pilates;
USE pilates;

CREATE TABLE IF NOT EXISTS estabelecimento (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    parametros VARCHAR(255),
    inicio_funcionamento TIME NOT NULL,
    fim_funcionamento TIME NOT NULL,
    telefone VARCHAR(20),
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    role ENUM('ADMIN','USUARIO') NOT NULL DEFAULT 'USUARIO',
    ativo BOOLEAN DEFAULT TRUE,
    estabelecimento_id INT NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    CONSTRAINT fk_usuario_estabelecimento FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimento(id)
);

CREATE TABLE IF NOT EXISTS cliente (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    telefone_whatsapp VARCHAR(20) NOT NULL UNIQUE,
    whatsapp_ativo BOOLEAN DEFAULT TRUE,
    data_nascimento DATE NOT NULL,
    sexo ENUM('M','F','OUTRO') NOT NULL,
    foto_link VARCHAR(255),
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_whatsapp (telefone_whatsapp)
);

CREATE TABLE IF NOT EXISTS servico (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL DEFAULT 'geral',
    duracao_minutos INT NOT NULL DEFAULT 60,
    preco DECIMAL(10,2) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tipo (tipo)
);

CREATE TABLE IF NOT EXISTS agendamento (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    servico_id INT NOT NULL,
    usuario_id INT NOT NULL,
    data DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    status ENUM('AGENDADO','CANCELADO','CONCLUIDO') DEFAULT 'AGENDADO',
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES cliente(id),
    FOREIGN KEY (servico_id) REFERENCES servico(id),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    UNIQUE KEY uk_agendamento (data, hora_inicio, usuario_id),
    INDEX idx_cliente_data (cliente_id, data),
    INDEX idx_data_status (data, status),
    INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS notificacao (
    id INT PRIMARY KEY AUTO_INCREMENT,
    agendamento_id INT NOT NULL,
    tipo ENUM('LEMBRETE','CONFIRMACAO','CANCELAMENTO','REAGENDAMENTO') NOT NULL,
    status ENUM('PENDENTE','ENVIADO','FALHOU','DESCARTADA') DEFAULT 'PENDENTE',
    twilio_message_sid VARCHAR(100) UNIQUE,
    tentativas INT DEFAULT 0,
    mensagem TEXT,
    proxima_retentativa DATETIME,
    enviado_em DATETIME,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agendamento_id) REFERENCES agendamento(id),
    INDEX idx_status (status),
    INDEX idx_tentativas (tentativas, proxima_retentativa),
    INDEX idx_agendamento (agendamento_id)
);

CREATE TABLE IF NOT EXISTS agendamento_status_historico (
    id INT PRIMARY KEY AUTO_INCREMENT,
    agendamento_id INT NOT NULL,
    status_anterior VARCHAR(50),
    status_novo VARCHAR(50) NOT NULL,
    motivo VARCHAR(255),
    usuario_id INT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agendamento_id) REFERENCES agendamento(id),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    INDEX idx_agendamento (agendamento_id),
    INDEX idx_criado (criado_em)
);

CREATE TABLE IF NOT EXISTS mensagem_resposta_whatsapp (
    id INT PRIMARY KEY AUTO_INCREMENT,
    agendamento_id INT NOT NULL,
    cliente_id INT NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    conteudo_resposta TEXT NOT NULL,
    resposta_tipo ENUM('SIM','NAO','REAGENDAR','OUTRO') DEFAULT 'OUTRO',
    twilio_message_sid VARCHAR(100),
    data_recebida DATETIME NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agendamento_id) REFERENCES agendamento(id),
    FOREIGN KEY (cliente_id) REFERENCES cliente(id),
    INDEX idx_agendamento (agendamento_id),
    INDEX idx_data (data_recebida)
);

CREATE TABLE IF NOT EXISTS prontuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    agendamento_id INT NOT NULL,
    observacoes TEXT NOT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES cliente(id),
    FOREIGN KEY (agendamento_id) REFERENCES agendamento(id),
    INDEX idx_cliente (cliente_id)
);

CREATE TABLE IF NOT EXISTS despesas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(45) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data_despesa DATE NOT NULL,
    estabelecimento_id INT NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimento(id),
    INDEX idx_data (data_despesa)
);

-- KPI: Total aulas do dia
CREATE OR REPLACE VIEW kpi_aulas_dia AS
SELECT COUNT(*) AS total_aulas_hoje
FROM agendamento
WHERE DATE(data) = CURDATE()
AND status != 'CANCELADO';

-- KPI: Total aulas do mês
CREATE OR REPLACE VIEW kpi_aulas_mes AS
SELECT COUNT(*) AS total_aulas_mes
FROM agendamento
WHERE MONTH(data) = MONTH(CURDATE())
AND YEAR(data) = YEAR(CURDATE())
AND status != 'CANCELADO';

-- KPI: Percentual de cancelamentos
CREATE OR REPLACE VIEW kpi_percentual_cancelamento_mes AS
SELECT 
    ROUND(
        (SUM(CASE WHEN status = 'CANCELADO' THEN 1 ELSE 0 END) 
        / NULLIF(COUNT(*), 0)) * 100
    , 2) AS percentual_cancelamento
FROM agendamento
WHERE MONTH(data) = MONTH(CURDATE())
AND YEAR(data) = YEAR(CURDATE());

-- KPI: Taxa de aulas realizadas (concluídas entre os não cancelados no mês)
CREATE OR REPLACE VIEW kpi_taxa_realizacao_mes AS
SELECT 
    ROUND(
        (SUM(CASE WHEN status = 'CONCLUIDO' THEN 1 ELSE 0 END)
        / NULLIF(SUM(CASE WHEN status != 'CANCELADO' THEN 1 ELSE 0 END), 0)) * 100
    , 2) AS percentual_realizacao
FROM agendamento
WHERE MONTH(data) = MONTH(CURDATE())
AND YEAR(data) = YEAR(CURDATE());