package br.com.fisasaude.agendamento.mapper;

import br.com.fisasaude.agendamento.dto.agendamento.AgendamentoResponseDto;
import br.com.fisasaude.agendamento.dto.agendamento.ClienteMiniResponseDto;
import br.com.fisasaude.agendamento.dto.agendamento.ServicoMiniResponseDto;
import br.com.fisasaude.agendamento.dto.agendamento.UsuarioMiniResponseDto;
import br.com.fisasaude.agendamento.model.entity.Agendamento;
import org.springframework.stereotype.Component;

@Component
public class AgendamentoMapper {

    public AgendamentoResponseDto toDto(Agendamento a) {
        return new AgendamentoResponseDto(
                a.getId(),
                a.getData(),
                a.getHoraInicio(),
                a.getHoraFim(),
                a.getStatus(),
                a.getObservacoes(),
                a.getCriadoEm(),
                a.getAtualizadoEm(),
                new ClienteMiniResponseDto(
                        a.getCliente().getId(),
                        a.getCliente().getNome(),
                        a.getCliente().getTelefone()
                ),
                new ServicoMiniResponseDto(
                        a.getServico().getId(),
                        a.getServico().getNome(),
                        a.getServico().getTipo(),
                        a.getServico().getPreco()
                ),
                new UsuarioMiniResponseDto(a.getUsuario().getId(), a.getUsuario().getNome())
        );
    }
}
