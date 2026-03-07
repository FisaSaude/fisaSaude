CREATE TABLE IF NOT EXISTS tipoNoticia(
	id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS usuario(
	id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefone CHAR(11) NOT NULL,
    dtNascimento DATE NOT NULL,
    frequenciaRecebimento VARCHAR(45) NOT NULL,
    aceitaPublicidade BOOLEAN NOT NULL,
    aceitaWhatsapp BOOLEAN NOT NULL,
    tipoFavorito INT NOT NULL,
    CONSTRAINT usuarioNoticiaFavorita FOREIGN KEY(tipoFavorito) REFERENCES tipoNoticia(id),
    CONSTRAINT chk_frequencia CHECK (frequenciaRecebimento IN ('diaria', 'semanal', 'mensal'))
);