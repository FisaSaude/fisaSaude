package com.fisasaude.projeto.sitema_agendamento.mapper;

import com.fisasaude.projeto.sitema_agendamento.dto.agendamento.AgendamentoResponseDto;
import com.fisasaude.projeto.sitema_agendamento.dto.agendamento.ClienteMiniResponseDto;
import com.fisasaude.projeto.sitema_agendamento.dto.agendamento.ServicoMiniResponseDto;
import com.fisasaude.projeto.sitema_agendamento.dto.agendamento.UsuarioMiniResponseDto;
import com.fisasaude.projeto.sitema_agendamento.model.entity.Agendamento;
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
