import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  X,
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight
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

const mesAtualISO = () => {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
};

const opcoesPeriodo = (quantidade = 12) => {
  const opts: { value: string; label: string }[] = [];
  const cursor = new Date();
  cursor.setDate(1);
  const anoAtual = cursor.getFullYear();
  opts.push({ value: String(anoAtual), label: `Ano ${anoAtual}` });
  if (anoAtual > 2025) {
    opts.push({ value: String(anoAtual - 1), label: `Ano ${anoAtual - 1}` });
  }
  for (let i = 0; i < quantidade; i++) {
    const value = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
    const label = cursor.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    opts.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
    cursor.setMonth(cursor.getMonth() - 1);
  }
  return opts;
};

const pertenceAoPeriodo = (data: string, periodo: string) => Boolean(data) && data.startsWith(periodo);

export default function Financial() {
  const [activeTab, setActiveTab] = useState<'todos' | 'entradas' | 'saidas'>('todos');
  const [despesas, setDespesas] = useState<DespesaResponseDto[]>([]);
  const [entradas, setEntradas] = useState<PagamentoEntrada[]>([]);
  const [clientes, setClientes] = useState<ClienteDto[]>([]);
  const [servicos, setServicos] = useState<ServicoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [mesFiltro, setMesFiltro] = useState(mesAtualISO);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
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

      const resDespesas = await api.get('/despesas');
      const listaDespesas = Array.isArray(resDespesas.data)
        ? resDespesas.data
        : resDespesas.data?.content || [];
      setDespesas(listaDespesas);

      const resClientes = await api.get('/clientes', { params: { page: 0, size: 100 } });
      const listaClientes = Array.isArray(resClientes.data)
        ? resClientes.data
        : resClientes.data?.content || [];
      setClientes(listaClientes);

      // O backend atual expõe apenas despesas; não há endpoint de recebimentos ou serviços.
      setEntradas([]);
      setServicos([]);
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
    const servico = servicos.find((s) => String(s.id) === sId);
    setFormEntrada({
      ...formEntrada,
      servicoId: sId,
      valor: servico && servico.preco > 0 ? String(servico.preco) : formEntrada.valor
    });
  };

  const handleCriarEntrada = async (e: React.FormEvent) => {
    e.preventDefault();
    const clienteIdNum = Number(formEntrada.clienteId);
    const valorNum = parseFloat(formEntrada.valor.replace(',', '.'));

    if (!clienteIdNum || isNaN(valorNum) || valorNum <= 0) {
      alert('Preencha os campos obrigatórios corretamente.');
      return;
    }

    setErrorMessage('O backend atual não possui endpoint para registrar entradas financeiras.');
    return;

    setShowEntradaModal(false);
    setFormEntrada({
      clienteId: '',
      servicoId: '',
      valor: '',
      formaPagamento: 'PIX',
      data: new Date().toISOString().split('T')[0]
    });

    await carregarDadosFinanceiros();
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

  const entradasDoMes = useMemo(
    () => entradas.filter((item) => pertenceAoPeriodo(normalizeDate(item.data), mesFiltro)),
    [entradas, mesFiltro]
  );

  const saidasDoMes = useMemo(
    () => despesas.filter((d) => pertenceAoPeriodo(normalizeDate(d.dataDespesa), mesFiltro)),
    [despesas, mesFiltro]
  );

  const totalEntradas = useMemo(() => {
    return entradasDoMes.reduce((acc, item) => acc + (Number(item.valor) || 0), 0);
  }, [entradasDoMes]);

  const totalSaidas = useMemo(() => {
    return saidasDoMes.reduce((acc, d) => acc + (Number(d.valor) || 0), 0);
  }, [saidasDoMes]);

  const saldoLiquido = totalEntradas - totalSaidas;

  const lancamentosUnificados = useMemo(() => {
    const listaEntradas = entradasDoMes.map((e) => ({
      id: e.id,
      tipo: 'ENTRADA' as const,
      data: e.data,
      descricao: `${e.clienteNome} • ${e.servicoNome}`,
      categoria: e.formaPagamento,
      valor: e.valor
    }));

    const listaSaidas = saidasDoMes.map((d) => ({
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
    if (searchTerm.trim()) combinado = combinado.filter((item) => `${item.descricao} ${item.categoria}`.toLowerCase().includes(searchTerm.toLowerCase()));

    return combinado.sort((a, b) => b.data.localeCompare(a.data));
  }, [entradasDoMes, saidasDoMes, activeTab, searchTerm]);
  const totalPages = Math.max(1, Math.ceil(lancamentosUnificados.length / pageSize));
  const lancamentosPaginados = lancamentosUnificados.slice(page * pageSize, (page + 1) * pageSize);

  const periodoSelecionado = opcoesPeriodo().find((p) => p.value === mesFiltro)?.label || mesFiltro;
  const classeAcao =
    'h-9 min-h-9 max-h-9 px-3.5 box-border rounded-xl text-xs font-bold uppercase leading-none inline-flex items-center justify-center gap-1.5 shrink-0';

  return (
    <div className="h-full bg-[#F8F6F0] dark:bg-background text-[#1B2E26] dark:text-foreground flex flex-col">
      <div className="flex-1 p-3 sm:p-5 lg:p-8 space-y-4 sm:space-y-6">
        {/* Header Mobile Otimizado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-[#1B2E26] dark:text-foreground">Controle Financeiro</h1>
            <p className="text-[11px] sm:text-sm text-[#56635C] dark:text-muted-foreground">
              Fluxo de pagamentos e despesas operacionais
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className={`relative flex-1 sm:flex-none bg-white dark:bg-card border border-[#E3DEC9] dark:border-border text-[#1B2E26] dark:text-foreground shadow-xs ${classeAcao}`}>
              <Calendar size={15} className="text-[#009386] dark:text-[#3CD099] shrink-0" />
              <span className="truncate max-w-[9.5rem]">{periodoSelecionado}</span>
              <ChevronDown size={14} className="text-[#56635C] dark:text-muted-foreground shrink-0" />
              <select
                aria-label="Filtrar período"
                value={mesFiltro}
                onChange={(e) => { setMesFiltro(e.target.value); setPage(0); }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              >
                {opcoesPeriodo().map((periodo) => (
                  <option key={periodo.value} value={periodo.value}>
                    {periodo.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowDespesaModal(true)}
              className={`flex-1 sm:flex-none bg-white dark:bg-card border border-[#E3DEC9] dark:border-border active:bg-[#F8F6F0] dark:active:bg-muted text-[#1B2E26] dark:text-foreground shadow-xs cursor-pointer ${classeAcao}`}
            >
              <ArrowDownCircle size={15} className="text-[#D94F3C] dark:text-[#FF8FA3]" />
              Saída
            </button>

            <button
              type="button"
              onClick={() => setErrorMessage('O backend atual não possui endpoint para registrar entradas financeiras.')}
              className={`flex-1 sm:flex-none bg-[#009386]/60 text-white shadow-md cursor-not-allowed ${classeAcao}`}
              title="Indisponível até existir endpoint de entradas"
            >
              <ArrowUpCircle size={15} />
              Entrada
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-[#FF6954]/10 border border-[#FF6954]/30 rounded-xl text-xs font-semibold text-[#D94F3C] dark:text-[#FF8FA3] flex items-center gap-2">
            <AlertCircle size={16} />
            {errorMessage}
          </div>
        )}

        {/* Cards de Resumo Responsivos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white dark:bg-card rounded-2xl p-4 shadow-xs border border-[#E3DEC9] dark:border-border flex items-center gap-3">
            <div className="w-10 h-10 bg-[#009386]/10 text-[#009386] dark:text-[#3CD099] rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingUp size={20} />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold text-[#56635C] dark:text-muted-foreground uppercase tracking-wider block">
                Total de Entradas
              </span>
              <div className="text-lg sm:text-2xl font-black text-[#009386] dark:text-[#3CD099]">
                R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-card rounded-2xl p-4 shadow-xs border border-[#E3DEC9] dark:border-border flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF6954]/10 text-[#D94F3C] dark:text-[#FF8FA3] rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingDown size={20} />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold text-[#56635C] dark:text-muted-foreground uppercase tracking-wider block">
                Total de Saídas
              </span>
              <div className="text-lg sm:text-2xl font-black text-[#D94F3C] dark:text-[#FF8FA3]">
                - R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-card rounded-2xl p-4 shadow-xs border border-[#E3DEC9] dark:border-border flex items-center gap-3">
            <div className="w-10 h-10 bg-[#007491]/10 text-[#007491] dark:text-[#3CD099] rounded-xl flex items-center justify-center flex-shrink-0">
              <DollarSign size={20} />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold text-[#56635C] dark:text-muted-foreground uppercase tracking-wider block">
                Saldo em Caixa
              </span>
              <div className="text-lg sm:text-2xl font-black text-[#007491] dark:text-[#3CD099]">
                R$ {Math.max(0, saldoLiquido).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Lista e Abas */}
        <div className="bg-white dark:bg-card rounded-2xl sm:rounded-3xl shadow-xs border border-[#E3DEC9] dark:border-border overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-[#E3DEC9] dark:border-border bg-[#F8F6F0]/60 dark:bg-background/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
            <div className="flex bg-[#EBE5D3]/60 dark:bg-muted/60 p-1 rounded-xl w-full sm:w-auto">
              {(['todos', 'entradas', 'saidas'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => { setActiveTab(tab); setPage(0); }}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${activeTab === tab
                      ? tab === 'saidas'
                        ? 'bg-[#D94F3C] text-white shadow-xs'
                        : tab === 'entradas'
                          ? 'bg-[#009386] text-white shadow-xs'
                          : 'bg-white dark:bg-card text-[#1B2E26] dark:text-foreground shadow-xs'
                      : 'text-[#56635C] dark:text-muted-foreground'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative"><Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#56635C] dark:text-muted-foreground"/><input value={searchTerm} onChange={e=>{setSearchTerm(e.target.value);setPage(0)}} placeholder="Buscar lançamento" className="pl-7 pr-2 py-1.5 w-40 border border-[#E3DEC9] dark:border-border rounded-lg text-[11px]"/></div>
            <span className="text-[11px] font-bold text-[#56635C] dark:text-muted-foreground">{lancamentosUnificados.length} registros filtrados</span>
          </div>

          {loading ? (
            <div className="p-10 text-center text-xs text-[#56635C] dark:text-muted-foreground">Carregando...</div>
          ) : lancamentosUnificados.length === 0 ? (
            <div className="p-10 text-center text-xs text-[#56635C] dark:text-muted-foreground">Nenhum lançamento neste período.</div>
          ) : (
            <>
              {/* Tabela para Desktop */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white dark:bg-card border-b border-[#E3DEC9] dark:border-border text-[11px] font-extrabold uppercase text-[#56635C] dark:text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 text-left">Data</th>
                      <th className="px-5 py-3 text-left">Tipo</th>
                      <th className="px-5 py-3 text-left">Descrição</th>
                      <th className="px-5 py-3 text-left">Categoria</th>
                      <th className="px-5 py-3 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3DEC9]/60 dark:divide-border/60 text-xs">
                    {lancamentosPaginados.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F8F6F0]/60 dark:hover:bg-muted/60">
                        <td className="px-5 py-3.5 font-semibold text-[#56635C] dark:text-muted-foreground">{formatDateBR(item.data)}</td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${item.tipo === 'ENTRADA' ? 'bg-[#009386]/10 text-[#009386] dark:text-[#3CD099]' : 'bg-[#FF6954]/10 text-[#D94F3C] dark:text-[#FF8FA3]'
                            }`}>
                            {item.tipo}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-[#1B2E26] dark:text-foreground">{item.descricao}</td>
                        <td className="px-5 py-3.5 text-[#56635C] dark:text-muted-foreground">{item.categoria}</td>
                        <td className={`px-5 py-3.5 text-sm font-bold text-right ${item.tipo === 'ENTRADA' ? 'text-[#009386] dark:text-[#3CD099]' : 'text-[#D94F3C] dark:text-[#FF8FA3]'
                          }`}>
                          {item.tipo === 'ENTRADA' ? '+' : '-'} R$ {Number(item.valor).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Lista Vertical em Cartões para Mobile */}
              <div className="sm:hidden divide-y divide-[#E3DEC9]/60 dark:divide-border/60">
                {lancamentosPaginados.map((item) => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between gap-2 active:bg-[#F8F6F0] dark:active:bg-muted">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-[10px] text-[#56635C] dark:text-muted-foreground font-semibold mb-0.5">
                        <Calendar size={11} />
                        <span>{formatDateBR(item.data)}</span>
                        <span>•</span>
                        <span className="truncate">{item.categoria}</span>
                      </div>
                      <p className="text-xs font-bold text-[#1B2E26] dark:text-foreground truncate">{item.descricao}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className={`text-xs font-extrabold ${item.tipo === 'ENTRADA' ? 'text-[#009386] dark:text-[#3CD099]' : 'text-[#D94F3C] dark:text-[#FF8FA3]'}`}>
                        {item.tipo === 'ENTRADA' ? '+' : '-'} R$ {Number(item.valor).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {!loading && lancamentosUnificados.length > 0 && <div className="border-t border-[#E3DEC9] dark:border-border px-4 py-2.5 flex items-center justify-between text-[11px] text-[#56635C] dark:text-muted-foreground"><span>{Math.min(page * pageSize + 1, lancamentosUnificados.length)}–{Math.min((page + 1) * pageSize, lancamentosUnificados.length)} de {lancamentosUnificados.length}</span><div className="flex items-center gap-2"><select value={pageSize} onChange={e=>{setPageSize(Number(e.target.value));setPage(0)}} className="border border-[#E3DEC9] dark:border-border rounded-lg p-1"><option value={10}>10/página</option><option value={25}>25/página</option><option value={50}>50/página</option></select><button disabled={page===0} onClick={()=>setPage(p=>p-1)} className="p-1 disabled:opacity-40"><ChevronLeft size={15}/></button><span>{page+1}/{totalPages}</span><button disabled={page>=totalPages-1} onClick={()=>setPage(p=>p+1)} className="p-1 disabled:opacity-40"><ChevronRight size={15}/></button></div></div>}
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
            className="bg-white dark:bg-card rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-3.5"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-[#1B2E26] dark:text-foreground">Registrar entrada</h2>
              <button type="button" onClick={() => setShowEntradaModal(false)} className="p-1 text-[#56635C] dark:text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase mb-1">Aluno *</label>
              <select
                required
                value={formEntrada.clienteId}
                onChange={(e) => setFormEntrada({ ...formEntrada, clienteId: e.target.value })}
                className="w-full px-3 py-2 bg-[#F8F6F0] dark:bg-background border border-[#E3DEC9] dark:border-border rounded-xl text-xs font-medium"
              >
                <option value="">Selecione o aluno</option>
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
                className="w-full px-3 py-2 bg-[#F8F6F0] dark:bg-background border border-[#E3DEC9] dark:border-border rounded-xl text-xs font-medium"
              >
                <option value="">Selecione o serviço</option>
                {servicos.map((s) => (
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
                  className="w-full px-3 py-2 bg-[#F8F6F0] dark:bg-background border border-[#E3DEC9] dark:border-border rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase mb-1">Forma</label>
                <select
                  value={formEntrada.formaPagamento}
                  onChange={(e) => setFormEntrada({ ...formEntrada, formaPagamento: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8F6F0] dark:bg-background border border-[#E3DEC9] dark:border-border rounded-xl text-xs font-medium"
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
                className="w-full px-3 py-2 bg-[#F8F6F0] dark:bg-background border border-[#E3DEC9] dark:border-border rounded-xl text-xs font-medium"
              />
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowEntradaModal(false)}
                className="flex-1 bg-[#EBE5D3]/60 dark:bg-muted/60 py-2.5 rounded-xl text-xs font-bold uppercase"
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
            className="bg-white dark:bg-card rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-3.5"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-[#1B2E26] dark:text-foreground">Lançar saída</h2>
              <button type="button" onClick={() => setShowDespesaModal(false)} className="p-1 text-[#56635C] dark:text-muted-foreground">
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
                className="w-full px-3 py-2 bg-[#F8F6F0] dark:bg-background border border-[#E3DEC9] dark:border-border rounded-xl text-xs font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold uppercase mb-1">Categoria</label>
                <select
                  value={formDespesa.tipo}
                  onChange={(e) => setFormDespesa({ ...formDespesa, tipo: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8F6F0] dark:bg-background border border-[#E3DEC9] dark:border-border rounded-xl text-xs font-medium"
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
                  className="w-full px-3 py-2 bg-[#F8F6F0] dark:bg-background border border-[#E3DEC9] dark:border-border rounded-xl text-xs font-medium"
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
                className="w-full px-3 py-2 bg-[#F8F6F0] dark:bg-background border border-[#E3DEC9] dark:border-border rounded-xl text-xs font-medium"
              />
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowDespesaModal(false)}
                className="flex-1 bg-[#EBE5D3]/60 dark:bg-muted/60 py-2.5 rounded-xl text-xs font-bold uppercase"
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
