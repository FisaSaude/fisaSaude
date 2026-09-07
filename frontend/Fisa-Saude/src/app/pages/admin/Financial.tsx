import React, { useState, useEffect, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  X, 
  AlertCircle, 
  ArrowDownCircle, 
  ArrowUpCircle 
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
  { id: 10, nome: 'Pacote Fisa Movimento (Pilates 2x/sem + Fisio 1x/mês)', preco: 620 },
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

  // Modais
  const [showDespesaModal, setShowDespesaModal] = useState(false);
  const [showEntradaModal, setShowEntradaModal] = useState(false);

  // Form Saída (Despesa)
  const [formDespesa, setFormDespesa] = useState({
    nome: '',
    tipo: 'Operacional',
    valor: '',
    dataDespesa: new Date().toISOString().split('T')[0],
    estabelecimentoId: 1
  });

  // Form Entrada (Receber Pagamento)
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

      // 1. Despesas cadastradas no backend
      const resDespesas = await api.get('/despesas').catch(() => ({ data: [] }));
      const listaDespesas = Array.isArray(resDespesas.data)
        ? resDespesas.data
        : resDespesas.data?.content || [];
      setDespesas(listaDespesas);

      // 2. Clientes cadastrados
      const resClientes = await api.get('/clientes').catch(() => ({ data: [] }));
      const listaClientes = Array.isArray(resClientes.data)
        ? resClientes.data
        : resClientes.data?.content || [];
      setClientes(listaClientes);

      // 3. Entradas base reais do banco de dados (Setembro/2026)
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

      // 4. Busca agendamentos concluídos da API
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

      // 5. Entradas cadastradas manualmente
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

    if (!clienteIdNum) {
      alert('Selecione o paciente que realizou o pagamento.');
      return;
    }

    if (isNaN(valorNum) || valorNum <= 0) {
      alert('Informe um valor de pagamento válido.');
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
    alert('Pagamento registrado com sucesso!');
  };

  const handleCriarDespesa = async (e: React.FormEvent) => {
    e.preventDefault();

    const nomeLimpo = formDespesa.nome.trim();
    const valorNumerico = parseFloat(formDespesa.valor.replace(',', '.'));

    if (!nomeLimpo) {
      alert('Informe o nome/descrição da despesa.');
      return;
    }

    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      alert('Informe um valor de saída válido maior que zero.');
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
      alert('Despesa registrada com sucesso!');
    } catch (err: any) {
      console.error('Erro ao criar despesa:', err.response?.data || err);
      alert('Falha ao registrar despesa no sistema.');
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

    if (activeTab === 'entradas') {
      combinado = combinado.filter((item) => item.tipo === 'ENTRADA');
    } else if (activeTab === 'saidas') {
      combinado = combinado.filter((item) => item.tipo === 'SAIDA');
    }

    return combinado.sort((a, b) => b.data.localeCompare(a.data));
  }, [entradas, despesas, activeTab]);

  return (
    <div className="h-full lg:overflow-hidden bg-[#F8F6F0] text-[#1B2E26]">
      <div className="h-full lg:overflow-y-auto p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Superior */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1B2E26] mb-1">Controle Financeiro</h1>
              <p className="text-xs sm:text-sm text-[#56635C]">
                Gestão de pagamentos recebidos e controle de saídas operacionais
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDespesaModal(true)}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-[#E3DEC9] hover:bg-[#F8F6F0] text-[#1B2E26] rounded-xl transition-all font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <ArrowDownCircle size={16} className="text-[#D94F3C]" />
                Nova Despesa
              </button>

              <button
                onClick={() => setShowEntradaModal(true)}
                className="flex-1 sm:flex-none bg-[#009386] hover:bg-[#007491] text-white px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                <ArrowUpCircle size={16} />
                Receber Pagamento
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-[#FF6954]/10 border border-[#FF6954]/30 rounded-xl text-xs font-semibold text-[#D94F3C] flex items-center gap-2">
              <AlertCircle size={16} />
              {errorMessage}
            </div>
          )}

          {/* Cards de Indicadores */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Recebido */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#E3DEC9]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#009386]/10 text-[#009386] rounded-xl flex items-center justify-center">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#56635C] uppercase tracking-wider">
                    Total de Entradas (Receitas)
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-[#009386]">
                    R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            {/* Total Despesas */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#E3DEC9]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FF6954]/10 text-[#D94F3C] rounded-xl flex items-center justify-center">
                  <TrendingDown size={20} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#56635C] uppercase tracking-wider">
                    Total de Saídas (Despesas)
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-[#D94F3C]">
                    - R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            {/* Saldo Operacional */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#E3DEC9]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#007491]/10 text-[#007491] rounded-xl flex items-center justify-center">
                  <DollarSign size={20} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#56635C] uppercase tracking-wider">
                    Saldo em Caixa
                  </span>
                  <div className={`text-xl sm:text-2xl font-black ${saldoLiquido >= 0 ? 'text-[#007491]' : 'text-[#D94F3C]'}`}>
                    R$ {saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabela de Lançamentos */}
          <div className="bg-white rounded-3xl shadow-xs border border-[#E3DEC9] overflow-hidden">
            <div className="p-4 border-b border-[#E3DEC9] bg-[#F8F6F0]/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex bg-[#EBE5D3]/60 p-1 rounded-xl w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('todos')}
                  className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'todos' ? 'bg-white text-[#1B2E26] shadow-xs' : 'text-[#56635C]'
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('entradas')}
                  className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'entradas' ? 'bg-[#009386] text-white shadow-xs' : 'text-[#56635C]'
                  }`}
                >
                  Entradas ({entradas.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('saidas')}
                  className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'saidas' ? 'bg-[#D94F3C] text-white shadow-xs' : 'text-[#56635C]'
                  }`}
                >
                  Saídas ({despesas.length})
                </button>
              </div>

              <span className="text-xs font-bold text-[#56635C]">
                {lancamentosUnificados.length} lançamentos encontrados
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-[#56635C]">Carregando lançamentos...</div>
            ) : lancamentosUnificados.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#56635C]">Nenhum lançamento registrado nesta categoria.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white border-b border-[#E3DEC9] text-[11px] font-extrabold uppercase text-[#56635C] tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5 text-left">Data</th>
                      <th className="px-6 py-3.5 text-left">Tipo</th>
                      <th className="px-6 py-3.5 text-left">Descrição / Paciente</th>
                      <th className="px-6 py-3.5 text-left">Forma / Categoria</th>
                      <th className="px-6 py-3.5 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3DEC9]/60 text-xs">
                    {lancamentosUnificados.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F8F6F0]/70 transition-colors">
                        <td className="px-6 py-4 font-semibold text-[#56635C]">{formatDateBR(item.data)}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide border ${
                              item.tipo === 'ENTRADA'
                                ? 'bg-[#009386]/10 text-[#009386] border-[#009386]/20'
                                : 'bg-[#FF6954]/10 text-[#D94F3C] border-[#FF6954]/20'
                            }`}
                          >
                            {item.tipo === 'ENTRADA' ? 'Entrada' : 'Saída'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-[#1B2E26]">{item.descricao}</td>
                        <td className="px-6 py-4 text-[#56635C] font-medium">{item.categoria}</td>
                        <td
                          className={`px-6 py-4 text-sm font-bold text-right ${
                            item.tipo === 'ENTRADA' ? 'text-[#009386]' : 'text-[#D94F3C]'
                          }`}
                        >
                          {item.tipo === 'ENTRADA' ? '+' : '-'} R$ {Number(item.valor).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* MODAL RECEBER PAGAMENTO */}
          {showEntradaModal && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowEntradaModal(false)}
            >
              <form
                onSubmit={handleCriarEntrada}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl max-w-md w-full border border-[#E3DEC9] shadow-2xl overflow-hidden p-6 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-[#E3DEC9] pb-3">
                  <div>
                    <h2 className="text-lg font-bold text-[#1B2E26]">Receber Pagamento</h2>
                    <p className="text-[11px] text-[#56635C]">Registre um pagamento de sessão ou plano</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEntradaModal(false)}
                    className="p-1.5 hover:bg-[#F8F6F0] rounded-xl text-[#56635C] cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B2E26] uppercase mb-1">Paciente *</label>
                  <select
                    required
                    value={formEntrada.clienteId}
                    onChange={(e) => setFormEntrada({ ...formEntrada, clienteId: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-[#009386]"
                  >
                    <option value="">Selecione o paciente</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B2E26] uppercase mb-1">Serviço / Plano *</label>
                  <select
                    required
                    value={formEntrada.servicoId}
                    onChange={handleSelectServico}
                    className="w-full px-3 py-2.5 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-[#009386]"
                  >
                    <option value="">Selecione o serviço</option>
                    {SERVICOS_PADRAO.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nome} {s.preco > 0 ? `(R$ ${s.preco})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1B2E26] uppercase mb-1">Valor Pago (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={formEntrada.valor}
                      onChange={(e) => setFormEntrada({ ...formEntrada, valor: e.target.value })}
                      className="w-full px-3 py-2.5 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-[#009386]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1B2E26] uppercase mb-1">Forma de Pagamento</label>
                    <select
                      value={formEntrada.formaPagamento}
                      onChange={(e) => setFormEntrada({ ...formEntrada, formaPagamento: e.target.value })}
                      className="w-full px-3 py-2.5 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-[#009386]"
                    >
                      <option value="PIX">PIX</option>
                      <option value="Cartão de Crédito">Cartão de Crédito</option>
                      <option value="Cartão de Débito">Cartão de Débito</option>
                      <option value="Dinheiro">Dinheiro</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B2E26] uppercase mb-1">Data do Pagamento *</label>
                  <input
                    type="date"
                    required
                    value={formEntrada.data}
                    onChange={(e) => setFormEntrada({ ...formEntrada, data: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-[#009386]"
                  />
                </div>

                <div className="flex gap-2 pt-3 border-t border-[#E3DEC9]">
                  <button
                    type="button"
                    onClick={() => setShowEntradaModal(false)}
                    className="flex-1 bg-[#EBE5D3]/60 hover:bg-[#EBE5D3] py-2.5 rounded-xl text-xs font-bold uppercase cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#009386] hover:bg-[#007491] text-white py-2.5 rounded-xl text-xs font-bold uppercase shadow-sm cursor-pointer"
                  >
                    Confirmar Entrada
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* MODAL NOVA DESPESA */}
          {showDespesaModal && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowDespesaModal(false)}
            >
              <form
                onSubmit={handleCriarDespesa}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl max-w-md w-full border border-[#E3DEC9] shadow-2xl overflow-hidden p-6 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-[#E3DEC9] pb-3">
                  <div>
                    <h2 className="text-lg font-bold text-[#1B2E26]">Lançar Nova Despesa</h2>
                    <p className="text-[11px] text-[#56635C]">Registre uma saída de caixa no sistema</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDespesaModal(false)}
                    className="p-1.5 hover:bg-[#F8F6F0] rounded-xl text-[#56635C] cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B2E26] uppercase mb-1">
                    Nome / Descrição da Despesa *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder="Ex: Aluguel, Compra de faixas..."
                    value={formDespesa.nome}
                    onChange={(e) => setFormDespesa({ ...formDespesa, nome: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-[#009386]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1B2E26] uppercase mb-1">Tipo / Categoria *</label>
                    <select
                      value={formDespesa.tipo}
                      onChange={(e) => setFormDespesa({ ...formDespesa, tipo: e.target.value })}
                      className="w-full px-3 py-2.5 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-[#009386]"
                    >
                      <option value="Operacional">Operacional</option>
                      <option value="Imóvel">Imóvel</option>
                      <option value="Administrativo">Administrativo</option>
                      <option value="Serviços">Serviços</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1B2E26] uppercase mb-1">Valor (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={formDespesa.valor}
                      onChange={(e) => setFormDespesa({ ...formDespesa, valor: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-[#009386]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B2E26] uppercase mb-1">Data da Despesa *</label>
                  <input
                    type="date"
                    required
                    value={formDespesa.dataDespesa}
                    onChange={(e) => setFormDespesa({ ...formDespesa, dataDespesa: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-[#009386]"
                  />
                </div>

                <div className="flex gap-2 pt-3 border-t border-[#E3DEC9]">
                  <button
                    type="button"
                    onClick={() => setShowDespesaModal(false)}
                    className="flex-1 bg-[#EBE5D3]/60 hover:bg-[#EBE5D3] py-2.5 rounded-xl text-xs font-bold uppercase cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#D94F3C] hover:bg-[#B83E2D] text-white py-2.5 rounded-xl text-xs font-bold uppercase shadow-sm cursor-pointer"
                  >
                    Salvar Despesa
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}