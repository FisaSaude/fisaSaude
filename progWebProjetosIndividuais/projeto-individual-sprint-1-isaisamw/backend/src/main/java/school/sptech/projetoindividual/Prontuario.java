package school.sptech.projetoindividual;

public class Prontuario {

        private Integer id;
        private Integer pacienteId;
        private String  statusPaciente;
        private String  diagnostico;
        private Integer escalaDor;
        private String  proximoAtendimento;
        private String  dataCadastro;
        private String  observacoes;

        public Integer getId() {
            return id;
        }

        public void setId(Integer id) {
            this.id = id;
        }

        public Integer getPacienteId() {
            return pacienteId;
        }

        public void setPacienteId(Integer pacienteId) {
            this.pacienteId = pacienteId;
        }

        public String getStatusPaciente() {
            return statusPaciente;
        }

        public void setStatusPaciente(String statusPaciente) {
            this.statusPaciente = statusPaciente;
        }

        public String getDiagnostico() {
            return diagnostico;
        }

        public void setDiagnostico(String diagnostico) {
            this.diagnostico = diagnostico;
        }

        public Integer getEscalaDor() {
            return escalaDor;
        }

        public void setEscalaDor(Integer escalaDor) {
            this.escalaDor = escalaDor;
        }

        public String getProximoAtendimento() {
            return proximoAtendimento;
        }

        public void setProximoAtendimento(String proximoAtendimento) {
            this.proximoAtendimento = proximoAtendimento;
        }

        public String getDataCadastro() {
            return dataCadastro;
        }

        public void setDataCadastro(String dataCadastro) {
            this.dataCadastro = dataCadastro;
        }

        public String getObservacoes() {
            return observacoes;
        }

        public void setObservacoes(String observacoes) {
            this.observacoes = observacoes;
        }
    }