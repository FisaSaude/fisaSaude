var URL_API = "http://localhost:8080";

var pacientesCarregados = [];

var prontuariosGravados = [];

function formatarDataHoje() {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric"
  });
}

function formatarDataCurta(data) {
  return data.toLocaleDateString("pt-BR");
}

function formatarDataHora(data) {
  return data.toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

function dataMinimaHoje() {
  var hoje = new Date();
  var ano  = hoje.getFullYear();
  var mes  = String(hoje.getMonth() + 1).padStart(2, "0");
  var dia  = String(hoje.getDate()).padStart(2, "0");
  return ano + "-" + mes + "-" + dia;
}

function labelQueixa(id) {
  if (id == 1) return "Dor Cervical";
  if (id == 2) return "Dor Lombar";
  if (id == 3) return "Má Postura";
  if (id == 4) return "Dor nos Joelhos";
  if (id == 5) return "Rigidez Muscular";
  if (id == 6) return "Dor nos Ombros";
  return id;
}

function corEscala(valor) {
  if (valor <= 3) return "#27ae60";
  if (valor <= 6) return "#d4a017";
  return "#c0392b";
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("data-hoje").textContent = formatarDataHoje();
  document.getElementById("data-cadastro").value   = formatarDataCurta(new Date());
  document.getElementById("proximo-atendimento").min = dataMinimaHoje();

  carregarPacientes();
  carregarProntuariosExistentes();
  inicializarAbas();
  inicializarEventos();
});

function inicializarAbas() {
  var abas = document.querySelectorAll(".aba");
  for (var i = 0; i < abas.length; i++) {
    abas[i].addEventListener("click", function() {
      trocarAba(this.dataset.aba);
    });
  }
}

function trocarAba(idPagina) {
  var abas    = document.querySelectorAll(".aba");
  var paginas = document.querySelectorAll(".conteudo-principal");

  for (var i = 0; i < abas.length; i++) {
    abas[i].classList.remove("aba-ativa");
  }

  for (var i = 0; i < paginas.length; i++) {
    paginas[i].style.display = "none";
  }

  var botaoAtivo = document.querySelector(".aba[data-aba='" + idPagina + "']");
  if (botaoAtivo) botaoAtivo.classList.add("aba-ativa");

  var paginaAtiva = document.getElementById(idPagina);
  if (paginaAtiva) paginaAtiva.style.display = "block";

  if (idPagina == "pagina-historico") {
    renderizarHistorico();
  }
}

function carregarPacientes() {
  fetch(URL_API + "/prontuarios/pacientes")
    .then(function(resposta) {
      return resposta.json();
    })
    .then(function(pacientes) {
      pacientesCarregados = pacientes;

      var selectFormulario = document.getElementById("select-paciente");
      var selectFiltro     = document.getElementById("filtro-paciente");

      selectFormulario.innerHTML = '<option value="">— Selecione um paciente —</option>';

      for (var i = 0; i < pacientes.length; i++) {
        var p = pacientes[i];

        var opcaoFormulario       = document.createElement("option");
        opcaoFormulario.value     = p.id;
        opcaoFormulario.textContent = p.nome;
        selectFormulario.appendChild(opcaoFormulario);

        var opcaoFiltro           = document.createElement("option");
        opcaoFiltro.value         = p.id;
        opcaoFiltro.textContent   = p.nome;
        selectFiltro.appendChild(opcaoFiltro);
      }
    })
    .catch(function(erro) {
      console.error("Erro ao carregar pacientes:", erro);
      document.getElementById("select-paciente").innerHTML =
        '<option value="">Erro ao carregar pacientes</option>';
    });
}

function carregarProntuariosExistentes() {
  fetch(URL_API + "/prontuarios")
    .then(function(resposta) {
      return resposta.json();
    })
    .then(function(prontuarios) {
      for (var i = 0; i < prontuarios.length; i++) {
        var p = prontuarios[i];

        prontuariosGravados.push({
          paciente_id:         p.paciente_id,
          paciente_nome:       p.paciente_nome,
          paciente_telefone:   p.paciente_telefone,
          paciente_sexo:       p.paciente_sexo,
          paciente_idade:      p.paciente_idade,
          status_paciente:     p.status_paciente,
          diagnostico:         p.diagnostico,
          escala_dor:          p.escala_dor,
          proximo_atendimento: p.proximo_atendimento,
          observacoes:         p.observacoes,
          queixas:             [],
          data_cadastro_obj:   new Date(p.data_cadastro)
        });
      }
      atualizarContadorAba();
    })
    .catch(function(erro) {
      console.error("Erro ao carregar prontuários existentes:", erro);
    });
}

function exibirDadosPaciente(id) {
  var cartao   = document.getElementById("cartao-paciente");
  var paciente = null;

  for (var i = 0; i < pacientesCarregados.length; i++) {
    if (pacientesCarregados[i].id == id) {
      paciente = pacientesCarregados[i];
      break;
    }
  }

  if (paciente == null) {
    cartao.style.display = "none";
    return;
  }

  document.getElementById("paciente-nome").textContent     = paciente.nome;
  document.getElementById("paciente-telefone").textContent = paciente.telefone;
  document.getElementById("paciente-sexo").textContent     = paciente.sexo;
  document.getElementById("paciente-idade").textContent    = paciente.idade + " anos";
  cartao.style.display = "block";
}

function atualizarEscalaVisual(valor) {
  var barra = document.getElementById("escala-barra");
  barra.style.width           = (valor / 10) * 100 + "%";
  barra.style.backgroundColor = corEscala(valor);
}

function atualizarContador(texto) {
  var contador     = document.getElementById("contador-caracteres");
  contador.textContent = texto.length + " / 500 caracteres";
  contador.style.color = texto.length > 450 ? "#c0392b" : "";
}

function limparErros() {
  var erros  = document.querySelectorAll(".mensagem-erro");
  var campos = document.querySelectorAll(".campo-invalido");

  for (var i = 0; i < erros.length; i++) {
    erros[i].textContent = "";
  }
  for (var i = 0; i < campos.length; i++) {
    campos[i].classList.remove("campo-invalido");
  }
}

function exibirErro(idErro, mensagem, idCampo) {
  var el = document.getElementById(idErro);
  if (el) el.textContent = mensagem;

  if (idCampo) {
    var campo = document.getElementById(idCampo);
    if (campo) campo.classList.add("campo-invalido");
  }
}

function validarFormulario() {
  limparErros();
  var valido = true;

  if (!document.getElementById("select-paciente").value) {
    exibirErro("erro-paciente", "Selecione um paciente.", "select-paciente");
    valido = false;
  }

  if (!document.querySelector('input[name="status_paciente"]:checked')) {
    exibirErro("erro-status", "Selecione o status do paciente.");
    valido = false;
  }

  if (!document.querySelector('input[name="diagnostico"]:checked')) {
    exibirErro("erro-diagnostico", "Selecione o diagnóstico.");
    valido = false;
  }

  if (document.querySelectorAll('input[name="queixas"]:checked').length == 0) {
    exibirErro("erro-queixas", "Selecione pelo menos uma queixa.");
    valido = false;
  }

  var dataAtendimento = document.getElementById("proximo-atendimento").value;
  if (!dataAtendimento) {
    exibirErro("erro-data", "Informe a data do próximo atendimento.", "proximo-atendimento");
    valido = false;
  } else {
    var dataSelecionada = new Date(dataAtendimento + "T00:00:00");
    var hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (dataSelecionada < hoje) {
      exibirErro("erro-data", "A data não pode ser no passado.", "proximo-atendimento");
      valido = false;
    }
  }

  var escalaDor = document.getElementById("escala-dor").value;
  if (escalaDor == "") {
    exibirErro("erro-escala", "Informe a escala de dor.", "escala-dor");
    valido = false;
  } else {
    var valor = parseInt(escalaDor);
    if (isNaN(valor) || valor < 0 || valor > 10) {
      exibirErro("erro-escala", "A escala de dor deve ser entre 0 e 10.", "escala-dor");
      valido = false;
    }
  }

  return valido;
}

function enviarFormulario() {
  if (!validarFormulario()) return;

  var params = new URLSearchParams();
  params.append("pacienteId",          document.getElementById("select-paciente").value);
  params.append("statusPaciente",      document.querySelector('input[name="status_paciente"]:checked').value);
  params.append("diagnostico",         document.querySelector('input[name="diagnostico"]:checked').value);
  params.append("escalaDor",           document.getElementById("escala-dor").value);
  params.append("proximoAtendimento",  document.getElementById("proximo-atendimento").value);
  params.append("observacoes",         document.getElementById("observacoes").value);

  var checkboxesMarcados = document.querySelectorAll('input[name="queixas"]:checked');
  for (var i = 0; i < checkboxesMarcados.length; i++) {
    params.append("queixas", checkboxesMarcados[i].value);
  }

  fetch(URL_API + "/prontuarios/cadastrar", {
    method: "POST",
    body: params
  })
  .then(function(resposta) {
    if (resposta.status == 201) {
      var dados = coletarDadosParaHistorico();
      prontuariosGravados.push(dados);
      atualizarContadorAba();
      abrirModalSucesso(dados);
    } else {
      return resposta.text().then(function(mensagem) {
        alert("Erro ao gravar: " + mensagem);
      });
    }
  })
  .catch(function(erro) {
    console.error("Erro na requisição:", erro);
    alert("Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
  });
}

function coletarDadosParaHistorico() {
  var pacienteId = parseInt(document.getElementById("select-paciente").value);
  var paciente   = null;

  for (var i = 0; i < pacientesCarregados.length; i++) {
    if (pacientesCarregados[i].id == pacienteId) {
      paciente = pacientesCarregados[i];
      break;
    }
  }

  var queixasMarcadas = document.querySelectorAll('input[name="queixas"]:checked');
  var queixas = [];
  for (var i = 0; i < queixasMarcadas.length; i++) {
    queixas.push(queixasMarcadas[i].value);
  }

  return {
    paciente_id:         pacienteId,
    paciente_nome:       paciente ? paciente.nome      : "",
    paciente_telefone:   paciente ? paciente.telefone  : "",
    paciente_sexo:       paciente ? paciente.sexo      : "",
    paciente_idade:      paciente ? paciente.idade     : "",
    status_paciente:     document.querySelector('input[name="status_paciente"]:checked').value,
    diagnostico:         document.querySelector('input[name="diagnostico"]:checked').value,
    queixas:             queixas,
    proximo_atendimento: document.getElementById("proximo-atendimento").value,
    data_cadastro_obj:   new Date(),
    escala_dor:          parseInt(document.getElementById("escala-dor").value),
    observacoes:         document.getElementById("observacoes").value
  };
}

function atualizarContadorAba() {
  document.getElementById("aba-contador-historico").textContent = prontuariosGravados.length;
}

function abrirModalSucesso(dados) {
  var overlay = document.getElementById("overlay-modal");
  document.getElementById("modal-detalhe-paciente").textContent =
    "Paciente: " + dados.paciente_nome + " — " + formatarDataHora(new Date());
  overlay.style.display = "flex";
}

function fecharModalSucesso() {
  document.getElementById("overlay-modal").style.display = "none";
  limparFormulario();
}

function renderizarHistorico() {
  var container         = document.getElementById("lista-prontuarios");
  var vazio             = document.getElementById("historico-vazio");
  var filtroPaciente    = document.getElementById("filtro-paciente").value;
  var filtroDiagnostico = document.getElementById("filtro-diagnostico").value;
  var textoContagem     = document.getElementById("texto-contagem-registros");

  var lista = [];
  for (var i = 0; i < prontuariosGravados.length; i++) {
    var p = prontuariosGravados[i];

    if (filtroPaciente && p.paciente_id != filtroPaciente) continue;
    if (filtroDiagnostico && p.diagnostico != filtroDiagnostico) continue;

    lista.push(p);
  }

  for (var i = 0; i < lista.length - 1; i++) {
    for (var j = 0; j < lista.length - 1 - i; j++) {
      if (lista[j].data_cadastro_obj < lista[j + 1].data_cadastro_obj) {
        var temp   = lista[j];
        lista[j]   = lista[j + 1];
        lista[j + 1] = temp;
      }
    }
  }

  textoContagem.textContent = lista.length + " registro" + (lista.length != 1 ? "s" : "");

  var cartoesAntigos = container.querySelectorAll(".cartao-prontuario");
  for (var i = 0; i < cartoesAntigos.length; i++) {
    cartoesAntigos[i].remove();
  }

  if (lista.length == 0) {
    vazio.style.display = "block";
    return;
  }

  vazio.style.display = "none";

  for (var i = 0; i < lista.length; i++) {
    var cartao = criarCartaoProntuario(lista[i]);
    container.appendChild(cartao);
  }
}

function criarCartaoProntuario(prontuario) {
  var cartao = document.createElement("div");
  cartao.className = "cartao-prontuario";

  var partes        = prontuario.proximo_atendimento.split("-");
  var dataFormatada = partes[2] + "/" + partes[1] + "/" + partes[0];

  cartao.innerHTML =
    '<div class="cartao-prontuario-info">' +
      '<span class="cartao-prontuario-nome">' + prontuario.paciente_nome + '</span>' +
      '<div class="cartao-prontuario-meta">' +
        '<span>📅 Cadastrado em: ' + formatarDataHora(prontuario.data_cadastro_obj) + '</span>' +
        '<span>🗓 Próximo: ' + dataFormatada + '</span>' +
        '<span>⚡ Dor: ' + prontuario.escala_dor + '/10</span>' +
      '</div>' +
    '</div>' +
    '<div class="cartao-prontuario-badges">' +
      '<span class="badge badge-' + prontuario.diagnostico + '">' + prontuario.diagnostico + '</span>' +
      '<span class="badge badge-' + prontuario.status_paciente + '">' + prontuario.status_paciente + '</span>' +
      '<span class="cartao-prontuario-seta">›</span>' +
    '</div>';

  cartao.addEventListener("click", function() {
    abrirModalDetalhes(prontuario);
  });

  return cartao;
}

function abrirModalDetalhes(prontuario) {
  var overlay = document.getElementById("overlay-detalhes");
  var corpo   = document.getElementById("modal-detalhes-corpo");

  var partes          = prontuario.proximo_atendimento.split("-");
  var dataProxFormatada = partes[2] + "/" + partes[1] + "/" + partes[0];

  var queixasTexto = "";
  for (var i = 0; i < prontuario.queixas.length; i++) {
    if (i > 0) queixasTexto += ", ";
    queixasTexto += labelQueixa(prontuario.queixas[i]);
  }
  if (queixasTexto == "") queixasTexto = "—";

  var obsTexto      = prontuario.observacoes && prontuario.observacoes.trim() != ""
                      ? prontuario.observacoes
                      : "Sem observações registradas.";
  var larguraEscala = (prontuario.escala_dor / 10) * 100;
  var corDor        = corEscala(prontuario.escala_dor);

  corpo.innerHTML =
    '<div class="detalhe-linha">' +
      '<span class="detalhe-rotulo">Paciente</span>' +
      '<span class="detalhe-valor">' + prontuario.paciente_nome + '</span>' +
    '</div>' +
    '<div class="grade-dois-colunas">' +
      '<div class="detalhe-linha">' +
        '<span class="detalhe-rotulo">Telefone</span>' +
        '<span class="detalhe-valor">' + prontuario.paciente_telefone + '</span>' +
      '</div>' +
      '<div class="detalhe-linha">' +
        '<span class="detalhe-rotulo">Idade / Sexo</span>' +
        '<span class="detalhe-valor">' + prontuario.paciente_idade + ' anos · ' + prontuario.paciente_sexo + '</span>' +
      '</div>' +
    '</div>' +
    '<hr class="detalhe-separador" />' +
    '<div class="detalhe-linha">' +
      '<span class="detalhe-rotulo">Status e Diagnóstico</span>' +
      '<div class="detalhe-badges">' +
        '<span class="badge badge-' + prontuario.status_paciente + '">' + prontuario.status_paciente + '</span>' +
        '<span class="badge badge-' + prontuario.diagnostico + '">' + prontuario.diagnostico + '</span>' +
      '</div>' +
    '</div>' +
    '<div class="detalhe-linha">' +
      '<span class="detalhe-rotulo">Queixas</span>' +
      '<span class="detalhe-valor">' + queixasTexto + '</span>' +
    '</div>' +
    '<div class="detalhe-linha">' +
      '<span class="detalhe-rotulo">Escala de Dor</span>' +
      '<div class="detalhe-escala-barra-wrapper">' +
        '<span class="detalhe-escala-numero" style="color: ' + corDor + '">' + prontuario.escala_dor + '</span>' +
        '<div class="detalhe-escala-trilha">' +
          '<div class="detalhe-escala-preenchimento" style="width: ' + larguraEscala + '%; background-color: ' + corDor + ';"></div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<hr class="detalhe-separador" />' +
    '<div class="grade-dois-colunas">' +
      '<div class="detalhe-linha">' +
        '<span class="detalhe-rotulo">Data de Cadastro</span>' +
        '<span class="detalhe-valor">' + formatarDataHora(prontuario.data_cadastro_obj) + '</span>' +
      '</div>' +
      '<div class="detalhe-linha">' +
        '<span class="detalhe-rotulo">Próximo Atendimento</span>' +
        '<span class="detalhe-valor">' + dataProxFormatada + '</span>' +
      '</div>' +
    '</div>' +
    '<div class="detalhe-linha">' +
      '<span class="detalhe-rotulo">Observações</span>' +
      '<span class="detalhe-valor">' + obsTexto + '</span>' +
    '</div>';

  overlay.style.display = "flex";
}

function fecharModalDetalhes() {
  document.getElementById("overlay-detalhes").style.display = "none";
}

function limparFormulario() {
  document.getElementById("formulario-prontuario").reset();
  document.getElementById("cartao-paciente").style.display = "none";
  document.getElementById("escala-barra").style.width      = "0%";
  document.getElementById("contador-caracteres").textContent = "0 / 500 caracteres";
  document.getElementById("data-cadastro").value = formatarDataCurta(new Date());
  limparErros();
}

function inicializarEventos() {

  document.getElementById("select-paciente").addEventListener("change", function() {
    exibirDadosPaciente(this.value);
  });

  document.getElementById("escala-dor").addEventListener("input", function() {
    var valor = parseInt(this.value);
    if (!isNaN(valor) && valor >= 0 && valor <= 10) {
      atualizarEscalaVisual(valor);
    } else {
      document.getElementById("escala-barra").style.width = "0%";
    }
  });

  document.getElementById("observacoes").addEventListener("input", function() {
    if (this.value.length > 500) this.value = this.value.substring(0, 500);
    atualizarContador(this.value);
  });

  document.getElementById("formulario-prontuario").addEventListener("submit", function(e) {
    e.preventDefault();
    enviarFormulario();
  });

  document.getElementById("botao-limpar").addEventListener("click", limparFormulario);

  document.getElementById("botao-modal-fechar").addEventListener("click", fecharModalSucesso);

  document.getElementById("botao-modal-ver-historico").addEventListener("click", function() {
    fecharModalSucesso();
    trocarAba("pagina-historico");
  });

  document.getElementById("overlay-modal").addEventListener("click", function(e) {
    if (e.target == document.getElementById("overlay-modal")) fecharModalSucesso();
  });

  document.getElementById("botao-fechar-detalhes").addEventListener("click", fecharModalDetalhes);

  document.getElementById("overlay-detalhes").addEventListener("click", function(e) {
    if (e.target == document.getElementById("overlay-detalhes")) fecharModalDetalhes();
  });

  document.getElementById("filtro-paciente").addEventListener("change", renderizarHistorico);
  document.getElementById("filtro-diagnostico").addEventListener("change", renderizarHistorico);
}