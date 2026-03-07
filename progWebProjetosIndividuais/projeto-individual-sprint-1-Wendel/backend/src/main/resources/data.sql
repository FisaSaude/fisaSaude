INSERT IGNORE INTO tipoNoticia (nome) VALUES
('Política'),
('Esportes'),
('Tecnologia'),
('Economia'),
('Entretenimento');

INSERT IGNORE INTO usuario (
    nome,
    email,
    telefone,
    dtNascimento,
    frequenciaRecebimento,
    aceitaPublicidade,
    aceitaWhatsapp,
    tipoFavorito
) VALUES
(
    'Usuário Teste',
    'teste@email.com',
    '11999999999',
    '1990-01-01',
    'diaria',
    TRUE,
    TRUE,
    1
);