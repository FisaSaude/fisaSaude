package school.sptech.projetoindividual;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
    @RequestMapping("/prontuarios")
    public class ProntuarioController {

        @Autowired
        private JdbcTemplate jdbcTemplate;

        @GetMapping("/pacientes")
        public ResponseEntity<List<Map<String, Object>>> listarPacientes() {

            List<Map<String, Object>> pacientes = jdbcTemplate.queryForList(
                    "SELECT id, nome, telefone, sexo, idade FROM pacientes ORDER BY nome");

            return ResponseEntity.ok(pacientes);
        }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listarProntuarios() {

        List<Map<String, Object>> prontuarios = jdbcTemplate.queryForList(
                "SELECT pr.id, pr.status_paciente, pr.diagnostico, pr.escala_dor, " +
                        "pr.proximo_atendimento, pr.observacoes, pr.data_cadastro, " +
                        "pa.id AS paciente_id, pa.nome AS paciente_nome, " +
                        "pa.telefone AS paciente_telefone, pa.sexo AS paciente_sexo, pa.idade AS paciente_idade " +
                        "FROM prontuarios pr " +
                        "JOIN pacientes pa ON pa.id = pr.paciente_id " +
                        "ORDER BY pr.data_cadastro DESC"
        );

        return ResponseEntity.ok(prontuarios);
    }

    @PostMapping("/cadastrar")
    public ResponseEntity<String> cadastrarProntuario(
            @RequestParam Integer pacienteId, @RequestParam String  statusPaciente,
            @RequestParam String  diagnostico, @RequestParam Integer escalaDor,
            @RequestParam String  proximoAtendimento, @RequestParam(required = false, defaultValue = "") String observacoes,
            @RequestParam List<Integer> queixas) {

            if (pacienteId == null) {
                return ResponseEntity.badRequest().body("Paciente é obrigatório.");
            }

            if (statusPaciente == null || statusPaciente.isBlank()) {
                return ResponseEntity.badRequest().body("Status do paciente é obrigatório.");
            }

            if (!statusPaciente.equals("ativo") && !statusPaciente.equals("inativo")) {
                return ResponseEntity.badRequest().body("Status inválido. Use 'ativo' ou 'inativo'.");
            }

            if (diagnostico == null || diagnostico.isBlank()) {
                return ResponseEntity.badRequest().body("Diagnóstico é obrigatório.");
            }

            if (!diagnostico.equals("ok") && !diagnostico.equals("moderado") && !diagnostico.equals("critico")) {
                return ResponseEntity.badRequest().body("Diagnóstico inválido. Use 'ok', 'moderado' ou 'critico'.");
            }

            if (escalaDor == null || escalaDor < 0 || escalaDor > 10) {
                return ResponseEntity.badRequest().body("Escala de dor deve estar entre 0 e 10.");
            }

            if (proximoAtendimento == null || proximoAtendimento.isBlank()) {
                return ResponseEntity.badRequest().body("Data do próximo atendimento é obrigatória.");
            }

            if (queixas == null || queixas.isEmpty()) {
                return ResponseEntity.badRequest().body("Selecione pelo menos uma queixa.");
            }

            Integer pacienteExiste = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM pacientes WHERE id = ?", Integer.class, pacienteId);

            if (pacienteExiste == 0) {
                return ResponseEntity.badRequest().body("Paciente não encontrado.");
            }

            jdbcTemplate.update(
                    "INSERT INTO prontuarios (paciente_id, status_paciente, diagnostico, escala_dor, proximo_atendimento, observacoes) " +
                            "VALUES (?, ?, ?, ?, ?, ?)", pacienteId, statusPaciente, diagnostico, escalaDor,
                    proximoAtendimento, observacoes);

            Integer idProntuario = jdbcTemplate.queryForObject(
                    "SELECT id FROM prontuarios WHERE paciente_id = ? ORDER BY data_cadastro DESC LIMIT 1",
                    Integer.class, pacienteId);

            for (Integer idQueixa : queixas) {jdbcTemplate.update(
                        "INSERT INTO prontuario_queixas (prontuario_id, queixa_id) VALUES (?, ?)",
                    idProntuario, idQueixa);
            }

            return ResponseEntity.status(201).body("Prontuário cadastrado com sucesso!");
        }
}