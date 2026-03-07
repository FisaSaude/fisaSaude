# Projeto Individual - Programação Web 🚀
Este repositório contém o projeto individual desenvolvido para a disciplina de Programação Web. O objetivo é aplicar os conceitos de integração entre Front-end (Vanilla) e Back-end (Spring Boot), focando na persistência de dados e validações.

## 📋 Sobre o Projeto
O tema deste projeto é livre, permitindo a continuidade ou adaptação da ideia trabalhada no primeiro semestre. A aplicação consiste em um sistema de cadastro funcional integrado a um banco de dados.

## 🛠️ Requisitos Técnicos

### Front-end
O foco é a utilização de tecnologias nativas para garantir o domínio da linguagem.

* **Formulário de Cadastro:** Deve conter, obrigatoriamente, os seguintes tipos de entrada:
  * Texto e Numérico.
  * Data.
  * Radio Buttons e Checkboxes.
  * Dropdown (Select): Os dados deste campo devem ser carregados dinamicamente via API (Back-end).

* **Validação:** Implementar lógica de validação de dados no lado do cliente antes do envio das requisições.

### Back-end
Desenvolvido utilizando Java com o ecossistema Spring.

* Endpoint `GET`: Criado para fornecer a lista de informações necessária para popular o dropdown do formulário.
* Endpoint `POST`: Responsável por receber os dados do formulário e realizar a persistência em uma tabela no banco de dados.
* Regras de Negócio & Status HTTP:
  * Validar os dados recebidos antes da inserção.
  * Retornar Status `201 (Created)` em caso de sucesso.
  * Retornar Status `400 (Bad Request)` caso os dados sejam inválidos.


### Dicas para a Implementação:

#### 💡 Dicas gerais

* **No Front-end:** Utilize a função `fetch()` para realizar as chamadas aos endpoints.
* **No Back-end:** Lembre-se de configurar o `@CrossOrigin` no seu Controller para permitir que o seu HTML (rodando em uma porta ou arquivo local) consiga acessar a API do Spring Boot sem bloqueios de segurança.

#### 💾 JDBC no Spring

Configure o application.properties
Antes de tudo, aponte para o seu banco de dados MySQL no arquivo de configuração:

```
spring.datasource.url=?
spring.datasource.username=?
spring.datasource.password=?
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```

O Spring injeta automaticamente o JdbcTemplate, que simplifica o código JDBC padrão (evitando aquele monte de try-catch e connection.close()).

```java
@Autowired
private JdbcTemplate jdbcTemplate;
```

#### 💅 Front-end

- Para instruções sobre como executar o frontend, consulte o [README do Frontend](./frontend/README.md)


## ⚠️ Restrições e Regras
Para garantir a equidade e o foco nos fundamentos, as seguintes restrições se aplicam:

1. **Spring Boot:** Não é permitido adicionar bibliotecas externas/adicionais além das iniciais do projeto.
2. **Front-end:** É estritamente proibido o uso de frameworks (como React, Vue, Angular) ou bibliotecas (como jQuery, Bootstrap, Tailwind). Deve-se utilizar apenas HTML5, CSS3 e JavaScript Vanilla.
