-- ========================================
-- ESTABELECIMENTO
-- ========================================
CREATE TABLE IF NOT EXISTS estabelecimento (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    parametros VARCHAR(255),
    inicio_funcionamento TIME NOT NULL,
    fim_funcionamento TIME NOT NULL
) ENGINE=InnoDB;

-- ========================================
-- DESPESAS
-- ========================================
CREATE TABLE IF NOT EXISTS despesas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    data_despesa DATE NOT NULL,
    tipo VARCHAR(45) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,

    estabelecimento_id INT NOT NULL,

    CONSTRAINT fk_despesas_estabelecimento
        FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimento(id)
) ENGINE=InnoDB;

-- ========================================
-- USUARIO
-- ========================================
CREATE TABLE IF NOT EXISTS usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(100) NOT NULL,
    role ENUM('ADMIN', 'USUARIO') NOT NULL,
	estabelecimento_id INT NOT NULL,

    CONSTRAINT fk_usuario_estabelecimento
        FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimento(id)
) ENGINE=InnoDB;

-- ========================================
-- CLIENTE
-- ========================================
CREATE TABLE IF NOT EXISTS cliente (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    telefone_whatsapp VARCHAR(20) NOT NULL UNIQUE,
    whatsapp_ativo BOOLEAN DEFAULT FALSE,
    data_nascimento DATE NOT NULL,
    sexo ENUM('M', 'F', 'OUTRO') NOT NULL,
    foto_link VARCHAR(255)
) ENGINE=InnoDB;

-- ========================================
-- SERVICO
-- ========================================
CREATE TABLE IF NOT EXISTS servico (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(45) NOT NULL,
    preco DECIMAL(10,2) NOT NULL
) ENGINE=InnoDB;

-- ========================================
-- AGENDAMENTO
-- ========================================
CREATE TABLE IF NOT EXISTS agendamento (
    id INT PRIMARY KEY AUTO_INCREMENT,
    data DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    `status` ENUM('AGENDADO', 'CANCELADO', 'CONCLUIDO') NOT NULL DEFAULT 'AGENDADO',
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    observacoes TEXT,

    cliente_id INT NOT NULL,
    servico_id INT NOT NULL,
    usuario_id INT NOT NULL,

    CONSTRAINT fk_agendamento_cliente
        FOREIGN KEY (cliente_id) REFERENCES cliente(id),

    CONSTRAINT fk_agendamento_servico
        FOREIGN KEY (servico_id) REFERENCES servico(id),

    CONSTRAINT fk_agendamento_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario(id),

    -- Evita conflitos reais de agenda
    UNIQUE (data, hora_inicio, usuario_id)
) ENGINE=InnoDB;

-- ========================================
-- NOTIFICACAO
-- ========================================
CREATE TABLE IF NOT EXISTS notificacao (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tipo ENUM('LEMBRETE', 'CONFIRMACAO', 'CANCELAMENTO') NOT NULL,
    `status` ENUM('PENDENTE', 'ENVIADO', 'FALHOU') NOT NULL,
    enviado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    agendamento_id INT NOT NULL,

    CONSTRAINT fk_notificacao_agendamento
        FOREIGN KEY (agendamento_id) REFERENCES agendamento(id)
) ENGINE=InnoDB;

-- ========================================
-- PRONTUARIO
-- ========================================
CREATE TABLE IF NOT EXISTS prontuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    observacoes TEXT NOT NULL,
    criado_em DATETIME NOT NULL,

    cliente_id INT NOT NULL,
    agendamento_id INT NOT NULL,

    CONSTRAINT fk_prontuario_cliente
        FOREIGN KEY (cliente_id) REFERENCES cliente(id),

    CONSTRAINT fk_prontuario_agendamento
        FOREIGN KEY (agendamento_id) REFERENCES agendamento(id)
) ENGINE=InnoDB;