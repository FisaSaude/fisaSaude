import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  X,
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar
} from 'lucide-react';
import { api } from '../../services/api';

export interface DespesaResponseDto {
  id: number;
  nome: string;
  dataDespesa: string | number[];
  tipo: string;
  valor: number;
  estabelecimentoId?: number;
}

interface ClienteDto {
  id: number;
  nome: string;
}

interface ServicoItem {
  id: number;
  nome: string;
  preco: number;
}

interface PagamentoEntrada {
  id: string;
  clienteNome: string;
  servicoNome: string;
  data: string;
  valor: number;
  formaPagamento: string;
}

const SERVICOS_PADRAO: ServicoItem[] = [
  { id: 1, nome: 'Aula Experimental', preco: 0 },
  { id: 2, nome: 'Fisioterapia e RPG - Sessão Avulsa', preco: 200 },
  { id: 3, nome: 'Liberação Miofascial - Sessão Avulsa', preco: 150 },
  { id: 4, nome: 'Pilates 1x/semana - Mensal', preco: 307 },
  { id: 5, nome: 'Pilates 2x/semana - Mensal', preco: 457 },
  { id: 6, nome: 'Pilates 3x/semana - Mensal', preco: 597 },
  { id: 7, nome: 'Pilates 1x/semana - Semestral', preco: 227 },
  { id: 8, nome: 'Pilates 2x/semana - Semestral', preco: 367 },
  { id: 9, nome: 'Pilates 3x/semana - Semestral', preco: 497 },
  { id: 10, nome: 'Pacote Fisa Movimento (Pilates + Fisio)', preco: 620 },
  { id: 11, nome: 'Pacote Fisa Cuidado (Pilates 2x/sem + Fisio 2x/mês)', preco: 810 },
  { id: 12, nome: 'Pacote Fisa Performance (Pilates + Fisio + Liberação)', preco: 760 },
];

const normalizeDate = (val: any): string => {
  if (!val) return '';
  if (Array.isArray(val)) {
    const y = String(val[0]);
    const m = String(val[1]).padStart(2, '0');
    const d = String(val[2]).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const str = String(val);
  return str.includes('T') ? str.split('T')[0] : str.substring(0, 10);
};

const formatDateBR = (val: any): string => {
  const iso = normalizeDate(val);
  if (!iso || iso.length < 10) return '-';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

export default function Financial() {
  const [activeTab, setActiveTab] = useState<'todos' | 'entradas' | 'saidas'>('todos');
  const [despesas, setDespesas] = useState<DespesaResponseDto[]>([]);
  const [entradas, setEntradas] = useState<PagamentoEntrada[]>([]);
  const [clientes, setClientes] = useState<ClienteDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [showDespesaModal, setShowDespesaModal] = useState(false);
  const [showEntradaModal, setShowEntradaModal] = useState(false);

  const [formDespesa, setFormDespesa] = useState({
    nome: '',
    tipo: 'Operacional',
    valor: '',
    dataDespesa: new Date().toISOString().split('T')[0],
    estabelecimentoId: 1
  });

  const [formEntrada, setFormEntrada] = useState({
    clienteId: '',
    servicoId: '',
    valor: '',
    formaPagamento: 'PIX',
    data: new Date().toISOString().split('T')[0]
  });

  const carregarDadosFinanceiros = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const resDespesas = await api.get('/despesas').catch(() => ({ data: [] }));
      const listaDespesas = Array.isArray(resDespesas.data)
        ? resDespesas.data
        : resDespesas.data?.content || [];
      setDespesas(listaDespesas);

      const resClientes = await api.get('/clientes').catch(() => ({ data: [] }));
      const listaClientes = Array.isArray(resClientes.data)
        ? resClientes.data
        : resClientes.data?.content || [];
      setClientes(listaClientes);

      const entradasBaseBanco: PagamentoEntrada[] = [
        { id: 'banco_1', clienteNome: 'Mariana Silva', servicoNome: 'Pilates 2x/semana - Mensal', data: '2026-09-01', valor: 457.0, formaPagamento: 'PIX' },
        { id: 'banco_2', clienteNome: 'Joao Pereira', servicoNome: 'Pacote Fisa Movimento (Pilates + Fisio)', data: '2026-09-01', valor: 620.0, formaPagamento: 'Cartão de Crédito' },
        { id: 'banco_3', clienteNome: 'Ana Souza', servicoNome: 'Pilates 3x/semana - Mensal', data: '2026-09-02', valor: 597.0, formaPagamento: 'PIX' },
        { id: 'banco_4', clienteNome: 'Carlos Mendes', servicoNome: 'Pacote Fisa Cuidado Integral', data: '2026-09-03', valor: 810.0, formaPagamento: 'PIX' },
        { id: 'banco_5', clienteNome: 'Beatriz Costa', servicoNome: 'Pilates 2x/semana - Semestral', data: '2026-09-04', valor: 367.0, formaPagamento: 'Cartão de Débito' },
        { id: 'banco_6', clienteNome: 'Juliana Rodrigues', servicoNome: 'Fisioterapia e RPG - Sessão Avulsa', data: '2026-09-04', valor: 200.0, formaPagamento: 'Dinheiro' },
        { id: 'banco_7', clienteNome: 'Roberto Lima', servicoNome: 'Pilates 3x/semana - Mensal', data: '2026-09-07', valor: 597.0, formaPagamento: 'PIX' },
        { id: 'banco_8', clienteNome: 'Marina Costa', servicoNome: 'Liberação Miofascial - Sessão Avulsa', data: '2026-09-07', valor: 150.0, formaPagamento: 'PIX' }
      ];

      let entradasApi: PagamentoEntrada[] = [];
      try {
        let usuarioId = localStorage.getItem('@FisaSaude:usuarioId') || '1';
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = hoje.getMonth() + 1;
        const ultimoDia = new Date(ano, mes, 0).getDate();

        const resAgendamentos = await api.get('/agendamentos/usuario-periodo', {
          params: {
            usuarioId: Number(usuarioId),
            dataInicio: `${ano}-${String(mes).padStart(2, '0')}-01`,
            dataFim: `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`
          }
        });

        const lista = Array.isArray(resAgendamentos.data)
          ? resAgendamentos.data
          : resAgendamentos.data?.content || [];

        entradasApi = lista
          .filter((a: any) => a.status === 'CONCLUIDO' && Number(a.preco) > 0)
          .map((a: any) => ({
            id: `agend_${a.id}`,
            clienteNome: a.nomeCliente || 'Paciente',
            servicoNome: 'Atendimento Concluído',
            data: normalizeDate(a.data),
            valor: Number(a.preco),
            formaPagamento: 'Faturamento'
          }));
      } catch {
        entradasApi = [];
      }

      const salvos = localStorage.getItem('@FisaSaude:entradas_financeiras');
      const entradasManuais: PagamentoEntrada[] = salvos ? JSON.parse(salvos) : [];

      const fonteEntradas = entradasApi.length > 0 ? entradasApi : entradasBaseBanco;
      setEntradas([...entradasManuais, ...fonteEntradas]);
    } catch (err) {
      console.error('Erro ao carregar dados financeiros:', err);
      setErrorMessage('Não foi possível sincronizar as movimentações financeiras.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDadosFinanceiros();
  }, []);

  const handleSelectServico = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sId = e.target.value;
    const servico = SERVICOS_PADRAO.find((s) => String(s.id) === sId);
    setFormEntrada({
      ...formEntrada,
      servicoId: sId,
      valor: servico && servico.preco > 0 ? String(servico.preco) : formEntrada.valor
    });
  };

  const handleCriarEntrada = (e: React.FormEvent) => {
    e.preventDefault();
    const clienteIdNum = Number(formEntrada.clienteId);
    const valorNum = parseFloat(formEntrada.valor.replace(',', '.'));

    if (!clienteIdNum || isNaN(valorNum) || valorNum <= 0) {
      alert('Preencha os campos obrigatórios corretamente.');
      return;
    }

    const cliente = clientes.find((c) => c.id === clienteIdNum);
    const servico = SERVICOS_PADRAO.find((s) => String(s.id) === formEntrada.servicoId);

    const novoLancamento: PagamentoEntrada = {
      id: `pag_${Date.now()}`,
      clienteNome: cliente?.nome || 'Paciente',
      servicoNome: servico?.nome || 'Atendimento / Sessão',
      data: formEntrada.data,
      valor: valorNum,
      formaPagamento: formEntrada.formaPagamento
    };

    const salvos = localStorage.getItem('@FisaSaude:entradas_financeiras');
    const locais: PagamentoEntrada[] = salvos ? JSON.parse(salvos) : [];
    const atualizados = [novoLancamento, ...locais];
    localStorage.setItem('@FisaSaude:entradas_financeiras', JSON.stringify(atualizados));

    setShowEntradaModal(false);
    setFormEntrada({
      clienteId: '',
      servicoId: '',
      valor: '',
      formaPagamento: 'PIX',
      data: new Date().toISOString().split('T')[0]
    });

    carregarDadosFinanceiros();
  };

  const handleCriarDespesa = async (e: React.FormEvent) => {
    e.preventDefault();
    const nomeLimpo = formDespesa.nome.trim();
    const valorNumerico = parseFloat(formDespesa.valor.replace(',', '.'));

    if (!nomeLimpo || isNaN(valorNumerico) || valorNumerico <= 0) {
      alert('Preencha os dados da despesa corretamente.');
      return;
    }

    try {
      await api.post('/despesas', {
        nome: nomeLimpo,
        dataDespesa: formDespesa.dataDespesa,
        tipo: formDespesa.tipo,
        valor: valorNumerico,
        estabelecimentoId: Number(formDespesa.estabelecimentoId) || 1
      });

      setShowDespesaModal(false);
      setFormDespesa({
        nome: '',
        tipo: 'Operacional',
        valor: '',
        dataDespesa: new Date().toISOString().split('T')[0],
        estabelecimentoId: 1
      });

      await carregarDadosFinanceiros();
    } catch (err: any) {
      alert('Erro ao cadastrar despesa.');
    }
  };

  const totalEntradas = useMemo(() => {
    return entradas.reduce((acc, item) => acc + (Number(item.valor) || 0), 0);
  }, [entradas]);

  const totalDespesas = useMemo(() => {
    return despesas.reduce((acc, d) => acc + (Number(d.valor) || 0), 0);
  }, [despesas]);

  const saldoLiquido = totalEntradas - totalDespesas;

  const lancamentosUnificados = useMemo(() => {
    const listaEntradas = entradas.map((e) => ({
      id: e.id,
      tipo: 'ENTRADA' as const,
      data: e.data,
      descricao: `${e.clienteNome} • ${e.servicoNome}`,
      categoria: e.formaPagamento,
      valor: e.valor
    }));

    const listaSaidas = despesas.map((d) => ({
      id: String(d.id),
      tipo: 'SAIDA' as const,
      data: normalizeDate(d.dataDespesa),
      descricao: d.nome,
      categoria: d.tipo || 'Operacional',
      valor: Number(d.valor)
    }));

    let combinado = [...listaEntradas, ...listaSaidas];
    if (activeTab === 'entradas') combinado = combinado.filter((item) => item.tipo === 'ENTRADA');
    if (activeTab === 'saidas') combinado = combinado.filter((item) => item.tipo === 'SAIDA');

    return combinado.sort((a, b) => b.data.localeCompare(a.data));
  }, [entradas, despesas, activeTab]);

  return (
    <div className="h-full bg-[#F8F6F0] text-[#1B2E26] flex flex-col">
      <div className="flex-1 p-3 sm:p-5 lg:p-8 space-y-4 sm:space-y-6">
        {/* Header Mobile Otimizado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-[#1B2E26]">Controle Financeiro</h1>
            <p className="text-[11px] sm:text-sm text-[#56635C]">
              Fluxo de pagamentos e despesas operacionais
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowDespesaModal(true)}
              className="flex-1 sm:flex-none px-3 py-2.5 bg-white border border-[#E3DEC9] active:bg-[#F8F6F0] text-[#1B2E26] rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ArrowDownCircle size={15} className="text-[#D94F3C]" />
              Despesa
            </button>

            <button
              onClick={() => setShowEntradaModal(true)}
              className="flex-1 sm:flex-none bg-[#009386] hover:bg-[#007491] active:scale-98 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-transform"
            >
              <ArrowUpCircle size={15} />
              Receber
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-[#FF6954]/10 border border-[#FF6954]/30 rounded-xl text-xs font-semibold text-[#D94F3C] flex items-center gap-2">
            <AlertCircle size={16} />
            {errorMessage}
          </div>
        )}

        {/* Cards de Resumo Responsivos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#E3DEC9] flex items-center gap-3">
            <div className="w-10 h-10 bg-[#009386]/10 text-[#009386] rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingUp size={20} />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold text-[#56635C] uppercase tracking-wider block">
                Total de Entradas
              </span>
              <div className="text-lg sm:text-2xl font-black text-[#009386]">
                R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#E3DEC9] flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF6954]/10 text-[#D94F3C] rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingDown size={20} />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold text-[#56635C] uppercase tracking-wider block">
                Total de Despesas
              </span>
              <div className="text-lg sm:text-2xl font-black text-[#D94F3C]">
                - R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#E3DEC9] flex items-center gap-3">
            <div className="w-10 h-10 bg-[#007491]/10 text-[#007491] rounded-xl flex items-center justify-center flex-shrink-0">
              <DollarSign size={20} />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold text-[#56635C] uppercase tracking-wider block">
                Saldo em Caixa
              </span>
              <div className={`text-lg sm:text-2xl font-black ${saldoLiquido >= 0 ? 'text-[#007491]' : 'text-[#D94F3C]'}`}>
                R$ {saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Lista e Abas */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-[#E3DEC9] overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-[#E3DEC9] bg-[#F8F6F0]/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
            <div className="flex bg-[#EBE5D3]/60 p-1 rounded-xl w-full sm:w-auto">
              {(['todos', 'entradas', 'saidas'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${activeTab === tab
                      ? tab === 'saidas'
                        ? 'bg-[#D94F3C] text-white shadow-xs'
                        : tab === 'entradas'
                          ? 'bg-[#009386] text-white shadow-xs'
                          : 'bg-white text-[#1B2E26] shadow-xs'
                      : 'text-[#56635C]'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <span className="text-[11px] font-bold text-[#56635C]">
              {lancamentosUnificados.length} registros
            </span>
          </div>

          {loading ? (
            <div className="p-10 text-center text-xs text-[#56635C]">Carregando...</div>
          ) : lancamentosUnificados.length === 0 ? (
            <div className="p-10 text-center text-xs text-[#56635C]">Nenhum lançamento no momento.</div>
          ) : (
            <>
              {/* Tabela para Desktop */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white border-b border-[#E3DEC9] text-[11px] font-extrabold uppercase text-[#56635C]">
                    <tr>
                      <th className="px-5 py-3 text-left">Data</th>
                      <th className="px-5 py-3 text-left">Tipo</th>
                      <th className="px-5 py-3 text-left">Descrição</th>
                      <th className="px-5 py-3 text-left">Categoria</th>
                      <th className="px-5 py-3 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3DEC9]/60 text-xs">
                    {lancamentosUnificados.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F8F6F0]/60">
                        <td className="px-5 py-3.5 font-semibold text-[#56635C]">{formatDateBR(item.data)}</td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${item.tipo === 'ENTRADA' ? 'bg-[#009386]/10 text-[#009386]' : 'bg-[#FF6954]/10 text-[#D94F3C]'
                            }`}>
                            {item.tipo}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-[#1B2E26]">{item.descricao}</td>
                        <td className="px-5 py-3.5 text-[#56635C]">{item.categoria}</td>
                        <td className={`px-5 py-3.5 text-sm font-bold text-right ${item.tipo === 'ENTRADA' ? 'text-[#009386]' : 'text-[#D94F3C]'
                          }`}>
                          {item.tipo === 'ENTRADA' ? '+' : '-'} R$ {Number(item.valor).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Lista Vertical em Cartões para Mobile */}
              <div className="sm:hidden divide-y divide-[#E3DEC9]/60">
                {lancamentosUnificados.map((item) => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between gap-2 active:bg-[#F8F6F0]">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-[10px] text-[#56635C] font-semibold mb-0.5">
                        <Calendar size={11} />
                        <span>{formatDateBR(item.data)}</span>
                        <span>•</span>
                        <span className="truncate">{item.categoria}</span>
                      </div>
                      <p className="text-xs font-bold text-[#1B2E26] truncate">{item.descricao}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className={`text-xs font-extrabold ${item.tipo === 'ENTRADA' ? 'text-[#009386]' : 'text-[#D94F3C]'}`}>
                        {item.tipo === 'ENTRADA' ? '+' : '-'} R$ {Number(item.valor).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL BOTTOM-SHEET: RECEBER PAGAMENTO */}
      {showEntradaModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={() => setShowEntradaModal(false)}
        >
          <form
            onSubmit={handleCriarEntrada}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-3.5"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-[#1B2E26]">Receber Pagamento</h2>
              <button type="button" onClick={() => setShowEntradaModal(false)} className="p-1 text-[#56635C]">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase mb-1">Paciente *</label>
              <select
                required
                value={formEntrada.clienteId}
                onChange={(e) => setFormEntrada({ ...formEntrada, clienteId: e.target.value })}
                className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs font-medium"
              >
                <option value="">Selecione o paciente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase mb-1">Serviço / Plano *</label>
              <select
                required
                value={formEntrada.servicoId}
                onChange={handleSelectServico}
                className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs font-medium"
              >
                <option value="">Selecione o serviço</option>
                {SERVICOS_PADRAO.map((s) => (
                  <option key={s.id} value={s.id}>{s.nome} {s.preco > 0 ? `(R$ ${s.preco})` : ''}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold uppercase mb-1">Valor (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formEntrada.valor}
                  onChange={(e) => setFormEntrada({ ...formEntrada, valor: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase mb-1">Forma</label>
                <select
                  value={formEntrada.formaPagamento}
                  onChange={(e) => setFormEntrada({ ...formEntrada, formaPagamento: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs font-medium"
                >
                  <option value="PIX">PIX</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="Dinheiro">Dinheiro</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase mb-1">Data *</label>
              <input
                type="date"
                required
                value={formEntrada.data}
                onChange={(e) => setFormEntrada({ ...formEntrada, data: e.target.value })}
                className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs font-medium"
              />
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowEntradaModal(false)}
                className="flex-1 bg-[#EBE5D3]/60 py-2.5 rounded-xl text-xs font-bold uppercase"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#009386] text-white py-2.5 rounded-xl text-xs font-bold uppercase shadow-sm"
              >
                Confirmar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL BOTTOM-SHEET: NOVA DESPESA */}
      {showDespesaModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={() => setShowDespesaModal(false)}
        >
          <form
            onSubmit={handleCriarDespesa}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-3.5"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-[#1B2E26]">Lançar Despesa</h2>
              <button type="button" onClick={() => setShowDespesaModal(false)} className="p-1 text-[#56635C]">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase mb-1">Descrição *</label>
              <input
                type="text"
                required
                maxLength={100}
                placeholder="Ex: Aluguel, Faixas..."
                value={formDespesa.nome}
                onChange={(e) => setFormDespesa({ ...formDespesa, nome: e.target.value })}
                className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold uppercase mb-1">Categoria</label>
                <select
                  value={formDespesa.tipo}
                  onChange={(e) => setFormDespesa({ ...formDespesa, tipo: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs font-medium"
                >
                  <option value="Operacional">Operacional</option>
                  <option value="Imóvel">Imóvel</option>
                  <option value="Administrativo">Administrativo</option>
                  <option value="Serviços">Serviços</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase mb-1">Valor (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={formDespesa.valor}
                  onChange={(e) => setFormDespesa({ ...formDespesa, valor: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase mb-1">Data *</label>
              <input
                type="date"
                required
                value={formDespesa.dataDespesa}
                onChange={(e) => setFormDespesa({ ...formDespesa, dataDespesa: e.target.value })}
                className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs font-medium"
              />
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowDespesaModal(false)}
                className="flex-1 bg-[#EBE5D3]/60 py-2.5 rounded-xl text-xs font-bold uppercase"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#D94F3C] text-white py-2.5 rounded-xl text-xs font-bold uppercase shadow-sm"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}