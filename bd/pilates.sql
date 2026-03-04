CREATE DATABASE pilates;
USE pilates;

CREATE TABLE usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    senha VARCHAR(100) NOT NULL
);

CREATE TABLE cliente (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL
);

CREATE TABLE servico (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    duracao_minutos INT NOT NULL,
    preco DECIMAL(10,2)
);

CREATE TABLE agendamento (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    servico_id INT NOT NULL,
    data_agendamento DATETIME NOT NULL,
    status ENUM('agendado','confirmado','cancelado','remarcado','concluido') 
           DEFAULT 'agendado',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP 
                  ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES cliente(id),
    FOREIGN KEY (servico_id) REFERENCES servico(id)
);

CREATE TABLE notificacao (
    id INT PRIMARY KEY AUTO_INCREMENT,
    agendamento_id INT NOT NULL,
    tipo ENUM('lembrete','confirmacao','cancelamento'),
    status ENUM('pendente','enviado','falhou'),
    enviado_em DATETIME,
    FOREIGN KEY (agendamento_id) REFERENCES agendamento(id)
);

CREATE TABLE prontuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    agendamento_id INT,
    observacoes TEXT NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES cliente(id),
    FOREIGN KEY (agendamento_id) REFERENCES agendamento(id)
);

-- kpi dia

CREATE VIEW kpi_aulas_dia AS
SELECT COUNT(*) AS total_aulas_hoje
FROM agendamento
WHERE DATE(data_agendamento) = CURDATE()
AND status != 'cancelado';

-- aula mes

CREATE VIEW kpi_aulas_mes AS
SELECT COUNT(*) AS total_aulas_mes
FROM agendamento
WHERE MONTH(data_agendamento) = MONTH(CURDATE())
AND YEAR(data_agendamento) = YEAR(CURDATE())
AND status != 'cancelado';

-- percentual de cancelamentos do mes

CREATE VIEW kpi_percentual_cancelamento_mes AS
SELECT 
    ROUND(
        (SUM(CASE WHEN status = 'cancelado' THEN 1 ELSE 0 END) 
        / COUNT(*)) * 100
    ,2) AS percentual_cancelamento
FROM agendamento
WHERE MONTH(data_agendamento) = MONTH(CURDATE())
AND YEAR(data_agendamento) = YEAR(CURDATE());

-- percentual de remarcacao do mes

CREATE VIEW kpi_percentual_remarcacao_mes AS
SELECT 
    ROUND(
        (SUM(CASE WHEN status = 'remarcado' THEN 1 ELSE 0 END) 
        / COUNT(*)) * 100
    ,2) AS percentual_remarcacao
FROM agendamento
WHERE MONTH(data_agendamento) = MONTH(CURDATE())
AND YEAR(data_agendamento) = YEAR(CURDATE());