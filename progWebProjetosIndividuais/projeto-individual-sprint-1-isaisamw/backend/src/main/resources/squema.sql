CREATE DATABASE IF NOT EXISTS fisasaude;

USE fisasaude;

CREATE TABLE pacientes (
  id INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  telefone VARCHAR(20)  NOT NULL,
  sexo ENUM('Masculino', 'Feminino') NOT NULL,
  idade INT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT chk_paciente_idade CHECK (idade >= 0 AND idade <= 120)
);

CREATE TABLE queixas (
  id INT NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(30) NOT NULL,
  descricao VARCHAR(80) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT uq_queixa_codigo UNIQUE (codigo)
);

CREATE TABLE prontuarios (
  id INT NOT NULL AUTO_INCREMENT,
  paciente_id INT NOT NULL,
  status_paciente ENUM('ativo', 'inativo') NOT NULL,
  diagnostico ENUM('ok', 'moderado', 'critico') NOT NULL,
  escala_dor INT NOT NULL,
  proximo_atendimento DATE NOT NULL,
  data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  observacoes TEXT,
  PRIMARY KEY (id),
  CONSTRAINT fk_prontuario_paciente
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
  CONSTRAINT chk_escala_dor
  CHECK (escala_dor >= 0 AND escala_dor <= 10)
);

CREATE TABLE prontuario_queixas (
  prontuario_id INT NOT NULL,
  queixa_id INT NOT NULL,
  PRIMARY KEY (prontuario_id, queixa_id),
  CONSTRAINT fk_pq_prontuario
  FOREIGN KEY (prontuario_id) REFERENCES prontuarios(id)
  ON DELETE CASCADE,
  CONSTRAINT fk_pq_queixa
  FOREIGN KEY (queixa_id) REFERENCES queixas(id)
);

INSERT INTO pacientes (nome, telefone, sexo, idade) VALUES
("Isabela Menezes", "11977585343", "Feminino", 19),
("Dandara Ramos", "11999284180", "Feminino", 19),
("Edson Felix", "11965643020", "Masculino", 40),
("Vinicius Melo", "11934840506", "Masculino", 18),
("Wendel Sousa", "11949877683", "Masculino", 19),
("Alex Barreira", "11987651234", "Masculino", 30);

INSERT INTO queixas (codigo, descricao) VALUES
  ('dor_cervical', 'Dor Cervical'),
  ('dor_lombar', 'Dor Lombar'),
  ('ma_postura', 'Má Postura'),
  ('dor_joelhos', 'Dor nos Joelhos'),
  ('rigidez_muscular', 'Rigidez Muscular'),
  ('dor_ombros', 'Dor nos Ombros');