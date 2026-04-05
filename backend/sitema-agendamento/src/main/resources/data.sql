-- ========================================
-- ESTABELECIMENTO
-- ========================================
INSERT IGNORE INTO estabelecimento (id, nome, endereco, parametros, inicio_funcionamento, fim_funcionamento)
VALUES (1, 'Fisa Saude Unidade Central', 'Rua das Flores, 123 - Centro', NULL, '08:00:00', '18:00:00');

-- ========================================
-- USUARIO
-- Senhas armazenadas com BCryptPasswordEncoder (strength 10)
-- Admin : senha em texto plano → Admin@1234
-- Usuário: senha em texto plano → User@1234
-- ========================================
INSERT IGNORE INTO usuario (id, nome, email, senha, role, estabelecimento_id)
VALUES (1,
        'Administrador',
        'admin@fisasaude.com',
        '$2a$10$g44XcIicHlha8CYRwwPPleDshvswcEvQoMiTZrDoxRHcOTj5LcJkK',
        'ADMIN',
        1);

INSERT IGNORE INTO usuario (id, nome, email, senha, role, estabelecimento_id)
VALUES (2,
        'Profissional Teste',
        'usuario@fisasaude.com',
        '$2a$10$rpKmL65qI.PBz5wC4HKKEOpsinAdfpvkPbmlOcnAunjZxo6sWOTgy',
        'USUARIO',
        1);

