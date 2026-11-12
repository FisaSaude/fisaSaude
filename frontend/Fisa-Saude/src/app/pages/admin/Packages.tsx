import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  PackageOpen,
  Pencil,
  Plus,
  Power,
  PowerOff,
  Save,
  Search,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { api } from '../../services/api';

export interface ServicoResponseDto {
  id: number;
  nome: string;
  tipo: string;
  duracaoMinutos: number;
  preco: number;
  ativo: boolean;
  criadoEm?: string;
}

interface ServicoForm {
  nome: string;
  tipo: string;
  duracaoMinutos: string;
  preco: string;
}

const TIPOS_SUGERIDOS = ['pilates', 'fisioterapia', 'liberacao_miofascial', 'pacote', 'avaliacao'];

const ROTULOS_TIPO: Record<string, string> = {
  pilates: 'Pilates',
  fisioterapia: 'Fisioterapia',
  liberacao_miofascial: 'Liberação Miofascial',
  pacote: 'Pacote',
  avaliacao: 'Avaliação',
};

const FORM_INICIAL: ServicoForm = {
  nome: '',
  tipo: 'pilates',
  duracaoMinutos: '60',
  preco: '',
};

const labelTipo = (tipo?: string) => {
  if (!tipo) return '-';
  const chave = tipo.toLowerCase();
  if (ROTULOS_TIPO[chave]) return ROTULOS_TIPO[chave];
  return tipo
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letra) => letra.toUpperCase());
};

const formatarPreco = (valor: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor) || 0);

const formatarDuracao = (minutos: number) => {
  const total = Number(minutos) || 0;
  if (total < 60) return `${total} min`;
  const horas = Math.floor(total / 60);
  const resto = total % 60;
  return resto ? `${horas}h ${resto}min` : `${horas}h`;
};

const parsePreco = (valor: string) => {
  const limpo = valor.replace(/[^\d,.-]/g, '').trim();
  if (!limpo) return NaN;
  if (limpo.includes(',')) {
    return Number(limpo.replace(/\./g, '').replace(',', '.'));
  }
  return Number(limpo);
};

const formatarPrecoInput = (valor: number) => (Number.isFinite(valor) ? valor.toFixed(2).replace('.', ',') : '');

const estaAtivo = (servico: ServicoResponseDto) => servico.ativo !== false;

export default function Packages() {
  const [servicos, setServicos] = useState<ServicoResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [somenteAtivos, setSomenteAtivos] = useState(false);

  const [modalAberto, setModalAberto] = useState(false);
  const [servicoEmEdicao, setServicoEmEdicao] = useState<ServicoResponseDto | null>(null);
  const [form, setForm] = useState<ServicoForm>(FORM_INICIAL);
  const [salvando, setSalvando] = useState(false);
  const [processandoId, setProcessandoId] = useState<number | null>(null);

  const [confirmarDesativacao, setConfirmarDesativacao] = useState<ServicoResponseDto | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState<ServicoResponseDto | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const carregarServicos = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const res = await api.get('/servicos');
      const lista = Array.isArray(res.data) ? res.data : res.data?.content || [];
      setServicos(lista);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Não foi possível carregar o catálogo de serviços e pacotes.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarServicos();
  }, []);

  const tiposDisponiveis = useMemo(
    () => Array.from(new Set(servicos.map((s) => s.tipo))).sort((a, b) => a.localeCompare(b)),
    [servicos]
  );

  const totalAtivos = useMemo(() => servicos.filter((s) => estaAtivo(s)).length, [servicos]);
  const totalPacotes = useMemo(
    () => servicos.filter((s) => s.tipo?.toLowerCase() === 'pacote').length,
    [servicos]
  );

  const servicosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return servicos.filter((servico) => {
      if (tipoFiltro !== 'todos' && servico.tipo !== tipoFiltro) return false;
      if (somenteAtivos && !estaAtivo(servico)) return false;
      if (!termo) return true;

      return (
        servico.nome?.toLowerCase().includes(termo) ||
        servico.tipo?.toLowerCase().includes(termo)
      );
    });
  }, [servicos, busca, tipoFiltro, somenteAtivos]);

  const abrirNovo = () => {
    setServicoEmEdicao(null);
    setForm(FORM_INICIAL);
    setErrorMessage('');
    setModalAberto(true);
  };

  const abrirEdicao = (servico: ServicoResponseDto) => {
    setServicoEmEdicao(servico);
    setForm({
      nome: servico.nome || '',
      tipo: servico.tipo || 'pilates',
      duracaoMinutos: String(servico.duracaoMinutos ?? 60),
      preco: formatarPrecoInput(Number(servico.preco)),
    });
    setErrorMessage('');
    setModalAberto(true);
  };

  const fecharModal = () => {
    if (salvando) return;
    setModalAberto(false);
    setServicoEmEdicao(null);
    setForm(FORM_INICIAL);
  };

  const handleSalvar = async (event: FormEvent) => {
    event.preventDefault();

    const nome = form.nome.trim();
    const tipo = form.tipo.trim();
    const duracao = Number(form.duracaoMinutos);
    const preco = parsePreco(form.preco);

    if (!nome || !tipo) {
      setErrorMessage('Informe o nome e o tipo do serviço.');
      return;
    }
    if (!Number.isInteger(duracao) || duracao < 1 || duracao > 600) {
      setErrorMessage('A duração deve estar entre 1 e 600 minutos.');
      return;
    }
    if (!Number.isFinite(preco) || preco < 0) {
      setErrorMessage('Informe um preço válido (use vírgula ou ponto).');
      return;
    }

    const payload = {
      nome,
      tipo,
      duracaoMinutos: duracao,
      preco,
    };

    try {
      setSalvando(true);
      setErrorMessage('');

      if (servicoEmEdicao) {
        await api.put(`/servicos/${servicoEmEdicao.id}`, payload);
      } else {
        await api.post('/servicos', payload);
      }

      setModalAberto(false);
      setServicoEmEdicao(null);
      setForm(FORM_INICIAL);
      await carregarServicos();
      showSuccess(servicoEmEdicao ? 'Serviço atualizado com sucesso!' : 'Serviço cadastrado com sucesso!');
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Não foi possível salvar o serviço. Verifique os dados.'
      );
    } finally {
      setSalvando(false);
    }
  };

  const solicitarToggleAtivo = (servico: ServicoResponseDto) => {
    if (estaAtivo(servico)) {
      setConfirmarDesativacao(servico);
      return;
    }
    executarToggleAtivo(servico);
  };

  const executarToggleAtivo = async (servico: ServicoResponseDto) => {
    const novoStatus = !estaAtivo(servico);

    try {
      setProcessandoId(servico.id);
      setErrorMessage('');
      const res = await api.patch(`/servicos/${servico.id}/ativo`, { ativo: novoStatus });
      setServicos((prev) => prev.map((s) => (s.id === servico.id ? { ...s, ...res.data } : s)));
      showSuccess(
        novoStatus ? `${servico.nome} foi ativado.` : `${servico.nome} foi desativado.`
      );
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || `Não foi possível atualizar a situação de ${servico.nome}.`
      );
    } finally {
      setProcessandoId(null);
      setConfirmarDesativacao(null);
    }
  };

  const executarExclusao = async (servico: ServicoResponseDto) => {
    try {
      setProcessandoId(servico.id);
      setErrorMessage('');
      await api.delete(`/servicos/${servico.id}`);
      setServicos((prev) => prev.filter((s) => s.id !== servico.id));
      showSuccess(`${servico.nome} foi removido.`);
    } catch (err: any) {
      const status = err.response?.status;
      setErrorMessage(
        status === 409
          ? 'Este serviço possui agendamentos vinculados. Desative-o em vez de excluir.'
          : err.response?.data?.message || `Não foi possível excluir ${servico.nome}.`
      );
    } finally {
      setProcessandoId(null);
      setConfirmarExclusao(null);
    }
  };

  const badgeTipo = (tipo: string) => {
    const chave = tipo?.toLowerCase();
    if (chave === 'pacote') {
      return 'bg-[#009386]/10 text-[#007491] dark:text-[#3CD099] border border-[#009386]/25';
    }
    return 'bg-[#EBE5D3] dark:bg-muted text-[#1B2E26] dark:text-foreground border border-[#E3DEC9] dark:border-border';
  };

  return (
    <div className="h-full bg-[#F8F6F0] dark:bg-background text-[#1B2E26] dark:text-foreground flex flex-col overflow-hidden">
      {successMessage && (
        <div className="fixed top-4 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-auto z-[100] bg-[#009386] text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center justify-center gap-2 text-xs font-semibold">
          <CheckCircle2 size={16} />
          {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="p-3.5 sm:p-5 border-b border-[#E3DEC9] dark:border-border bg-white dark:bg-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-bold text-[#1B2E26] dark:text-foreground">
              Planos e Pacotes
            </h1>
            <span className="bg-[#009386]/10 text-[#009386] dark:text-[#3CD099] text-[10px] font-bold px-2 py-0.5 rounded-full">
              {servicos.length} itens
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-[#56635C] dark:text-muted-foreground mt-0.5">
            Serviços, planos e pacotes comercializados pela unidade
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#56635C] dark:text-muted-foreground"
              size={14}
            />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou tipo..."
              className="w-full pl-8 pr-3 py-2 bg-[#F8F6F0] dark:bg-background border border-[#E3DEC9] dark:border-border rounded-xl text-xs font-medium focus:bg-white dark:focus:bg-card focus:outline-none focus:border-[#009386]"
            />
          </div>

          <button
            onClick={abrirNovo}
            className="bg-[#009386] hover:bg-[#007491] active:scale-95 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-transform"
          >
            <Plus size={15} /> Novo
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 p-3 sm:p-5 lg:p-6 overflow-hidden flex flex-col gap-3">
        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-[#FF6954]/10 border border-[#FF6954]/30 text-[#D94F3C] dark:text-[#FF8FA3] text-[11px] font-medium flex items-center gap-2 flex-shrink-0">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Resumo */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 flex-shrink-0">
          <div className="bg-white dark:bg-card border border-[#E3DEC9] dark:border-border rounded-2xl p-3 sm:p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#56635C] dark:text-muted-foreground">
              Total
            </p>
            <p className="text-lg sm:text-2xl font-extrabold mt-1">{servicos.length}</p>
          </div>
          <div className="bg-white dark:bg-card border border-[#E3DEC9] dark:border-border rounded-2xl p-3 sm:p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#56635C] dark:text-muted-foreground">
              Ativos
            </p>
            <p className="text-lg sm:text-2xl font-extrabold mt-1 text-[#009386] dark:text-[#3CD099]">
              {totalAtivos}
            </p>
          </div>
          <div className="bg-white dark:bg-card border border-[#E3DEC9] dark:border-border rounded-2xl p-3 sm:p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#56635C] dark:text-muted-foreground">
              Pacotes
            </p>
            <p className="text-lg sm:text-2xl font-extrabold mt-1">{totalPacotes}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => setTipoFiltro('todos')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
              tipoFiltro === 'todos'
                ? 'bg-[#009386] text-white border-[#009386]'
                : 'bg-white dark:bg-card text-[#56635C] dark:text-muted-foreground border-[#E3DEC9] dark:border-border hover:border-[#009386]/40'
            }`}
          >
            Todos
          </button>

          {tiposDisponiveis.map((tipo) => (
            <button
              key={tipo}
              onClick={() => setTipoFiltro(tipo)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
                tipoFiltro === tipo
                  ? 'bg-[#009386] text-white border-[#009386]'
                  : 'bg-white dark:bg-card text-[#56635C] dark:text-muted-foreground border-[#E3DEC9] dark:border-border hover:border-[#009386]/40'
              }`}
            >
              {labelTipo(tipo)}
            </button>
          ))}

          <button
            onClick={() => setSomenteAtivos((v) => !v)}
            className={`ml-auto px-3 py-1.5 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 transition-colors cursor-pointer ${
              somenteAtivos
                ? 'bg-[#3CD099]/15 text-[#0E2820] dark:text-foreground border-[#3CD099]/40'
                : 'bg-white dark:bg-card text-[#56635C] dark:text-muted-foreground border-[#E3DEC9] dark:border-border'
            }`}
          >
            <Check size={12} className={somenteAtivos ? 'opacity-100' : 'opacity-30'} />
            Somente ativos
          </button>
        </div>

        <div className="flex-1 bg-white dark:bg-card rounded-2xl sm:rounded-3xl border border-[#E3DEC9] dark:border-border shadow-xs flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="w-8 h-8 border-4 border-[#009386] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : servicosFiltrados.length > 0 ? (
              <>
                {/* Mobile */}
                <div className="sm:hidden divide-y divide-[#E3DEC9]/60 dark:divide-border/60">
                  {servicosFiltrados.map((servico) => (
                    <div key={servico.id} className="p-3.5 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{servico.nome}</p>
                          <p className="text-[10px] text-[#56635C] dark:text-muted-foreground mt-0.5">
                            {formatarDuracao(servico.duracaoMinutos)} • {formatarPreco(Number(servico.preco))}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex-shrink-0 ${badgeTipo(servico.tipo)}`}>
                          {labelTipo(servico.tipo)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => abrirEdicao(servico)}
                          className="flex-1 py-1.5 rounded-lg bg-[#009386]/10 text-[#007491] dark:text-[#3CD099] text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Pencil size={11} /> Editar
                        </button>
                        <button
                          onClick={() => solicitarToggleAtivo(servico)}
                          disabled={processandoId === servico.id}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 ${
                            estaAtivo(servico)
                              ? 'bg-[#FF6954]/10 text-[#D94F3C] dark:text-[#FF8FA3]'
                              : 'bg-[#3CD099]/15 text-[#0E2820] dark:text-foreground'
                          }`}
                        >
                          {estaAtivo(servico) ? <PowerOff size={11} /> : <Power size={11} />}
                          {estaAtivo(servico) ? 'Desativar' : 'Ativar'}
                        </button>
                        <button
                          onClick={() => setConfirmarExclusao(servico)}
                          disabled={processandoId === servico.id}
                          className="py-1.5 px-2.5 rounded-lg bg-[#FF6954]/10 text-[#D94F3C] dark:text-[#FF8FA3] cursor-pointer disabled:opacity-50"
                          title="Excluir"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop */}
                <table className="hidden sm:table w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#E3DEC9] dark:border-border text-[11px] font-extrabold uppercase text-[#56635C] dark:text-muted-foreground text-left bg-white dark:bg-card sticky top-0">
                      <th className="px-5 py-3">Serviço / Pacote</th>
                      <th className="px-5 py-3">Tipo</th>
                      <th className="px-5 py-3">Duração</th>
                      <th className="px-5 py-3">Preço</th>
                      <th className="px-5 py-3 text-center">Status</th>
                      <th className="px-5 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3DEC9]/60 dark:divide-border/60 text-xs">
                    {servicosFiltrados.map((servico) => (
                      <tr
                        key={servico.id}
                        className="hover:bg-[#F8F6F0]/60 dark:hover:bg-muted/60 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#009386]/10 text-[#009386] dark:text-[#3CD099] flex items-center justify-center flex-shrink-0">
                              <PackageOpen size={15} />
                            </div>
                            <span className="font-bold text-[#1B2E26] dark:text-foreground">{servico.nome}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${badgeTipo(servico.tipo)}`}>
                            <Tag size={10} />
                            {labelTipo(servico.tipo)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[#56635C] dark:text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Clock size={12} />
                            {formatarDuracao(servico.duracaoMinutos)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-[#1B2E26] dark:text-foreground">
                          {formatarPreco(Number(servico.preco))}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              estaAtivo(servico)
                                ? 'bg-[#3CD099]/15 text-[#0E2820] dark:text-foreground'
                                : 'bg-[#FF6954]/10 text-[#D94F3C] dark:text-[#FF8FA3]'
                            }`}
                          >
                            {estaAtivo(servico) ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => abrirEdicao(servico)}
                              title="Editar"
                              className="p-1.5 rounded-lg bg-[#009386]/10 hover:bg-[#009386]/20 text-[#007491] dark:text-[#3CD099] cursor-pointer transition-colors"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => solicitarToggleAtivo(servico)}
                              disabled={processandoId === servico.id}
                              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                estaAtivo(servico)
                                  ? 'bg-[#FF6954]/10 hover:bg-[#FF6954]/20 text-[#D94F3C] dark:text-[#FF8FA3]'
                                  : 'bg-[#3CD099]/15 hover:bg-[#3CD099]/25 text-[#0E2820] dark:text-foreground'
                              }`}
                            >
                              {processandoId === servico.id ? (
                                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : estaAtivo(servico) ? (
                                <PowerOff size={12} />
                              ) : (
                                <Power size={12} />
                              )}
                              {estaAtivo(servico) ? 'Desativar' : 'Ativar'}
                            </button>
                            <button
                              onClick={() => setConfirmarExclusao(servico)}
                              title="Excluir"
                              disabled={processandoId === servico.id}
                              className="p-1.5 rounded-lg bg-[#FF6954]/10 hover:bg-[#FF6954]/20 text-[#D94F3C] dark:text-[#FF8FA3] cursor-pointer transition-colors disabled:opacity-50"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <div className="p-10 text-center text-xs text-[#56635C] dark:text-muted-foreground">
                {servicos.length === 0
                  ? 'Nenhum serviço cadastrado ainda.'
                  : 'Nenhum item encontrado com os filtros atuais.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de criação/edição */}
      {modalAberto && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={fecharModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-card rounded-t-3xl sm:rounded-3xl max-w-lg w-full border border-[#E3DEC9] dark:border-border shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-5 border-b border-[#E3DEC9] dark:border-border flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-[#009386]/10 text-[#009386] dark:text-[#3CD099] flex items-center justify-center flex-shrink-0">
                  <PackageOpen size={18} />
                </span>
                <div>
                  <h2 className="text-base font-bold">
                    {servicoEmEdicao ? 'Editar serviço' : 'Novo serviço/pacote'}
                  </h2>
                  <p className="text-[11px] text-[#56635C] dark:text-muted-foreground">
                    {servicoEmEdicao
                      ? 'Atualize os dados do item selecionado.'
                      : 'Cadastre um serviço, plano ou pacote no catálogo.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={fecharModal}
                disabled={salvando}
                className="p-1.5 rounded-lg hover:bg-[#F8F6F0] dark:hover:bg-muted cursor-pointer disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSalvar} className="p-5 space-y-3.5">
              <div>
                <label htmlFor="servico-nome" className="block text-[11px] font-bold uppercase mb-1">
                  Nome *
                </label>
                <input
                  id="servico-nome"
                  type="text"
                  required
                  maxLength={100}
                  placeholder="Ex: Pilates 2x/semana - Mensal"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8F6F0] dark:bg-background border border-[#E3DEC9] dark:border-border rounded-xl text-xs font-medium focus:bg-white dark:focus:bg-card focus:outline-none focus:border-[#009386]"
                />
              </div>

              <div>
                <label htmlFor="servico-tipo" className="block text-[11px] font-bold uppercase mb-1">
                  Tipo *
                </label>
                <input
                  id="servico-tipo"
                  list="servico-tipos"
                  type="text"
                  required
                  maxLength={50}
                  placeholder="pilates, fisioterapia, pacote..."
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8F6F0] dark:bg-background border border-[#E3DEC9] dark:border-border rounded-xl text-xs font-medium focus:bg-white dark:focus:bg-card focus:outline-none focus:border-[#009386]"
                />
                <datalist id="servico-tipos">
                  {TIPOS_SUGERIDOS.map((tipo) => (
                    <option key={tipo} value={tipo} />
                  ))}
                </datalist>
                <p className="mt-1 text-[10px] text-[#56635C] dark:text-muted-foreground">
                  Use <b>pacote</b> para itens que devem aparecer na aba de pacotes.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="servico-duracao" className="block text-[11px] font-bold uppercase mb-1">
                    Duração (min) *
                  </label>
                  <input
                    id="servico-duracao"
                    type="number"
                    required
                    min={1}
                    max={600}
                    value={form.duracaoMinutos}
                    onChange={(e) => setForm({ ...form, duracaoMinutos: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F6F0] dark:bg-background border border-[#E3DEC9] dark:border-border rounded-xl text-xs font-medium focus:bg-white dark:focus:bg-card focus:outline-none focus:border-[#009386]"
                  />
                </div>

                <div>
                  <label htmlFor="servico-preco" className="block text-[11px] font-bold uppercase mb-1">
                    Preço (R$) *
                  </label>
                  <input
                    id="servico-preco"
                    type="text"
                    inputMode="decimal"
                    required
                    placeholder="620,00"
                    value={form.preco}
                    onChange={(e) => setForm({ ...form, preco: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F6F0] dark:bg-background border border-[#E3DEC9] dark:border-border rounded-xl text-xs font-medium focus:bg-white dark:focus:bg-card focus:outline-none focus:border-[#009386]"
                  />
                </div>
              </div>

              {!servicoEmEdicao && (
                <p className="text-[10px] text-[#56635C] dark:text-muted-foreground">
                  Novos itens são cadastrados como ativos. A situação pode ser alterada na listagem.
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={fecharModal}
                  disabled={salvando}
                  className="flex-1 bg-[#EBE5D3]/60 dark:bg-muted/60 hover:bg-[#EBE5D3] dark:hover:bg-muted py-2.5 rounded-xl font-bold text-xs uppercase cursor-pointer disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex-1 bg-[#009386] hover:bg-[#007491] text-white py-2.5 rounded-xl font-bold text-xs uppercase shadow-sm cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
                >
                  <Save size={14} />
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmação de desativação */}
      {confirmarDesativacao && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={() => setConfirmarDesativacao(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-card rounded-t-3xl sm:rounded-3xl max-w-sm w-full border border-[#E3DEC9] dark:border-border shadow-2xl p-5 space-y-4"
          >
            <div className="flex items-center gap-2.5 border-b border-[#E3DEC9] dark:border-border pb-3">
              <span className="w-8 h-8 rounded-xl bg-[#FF6954]/10 text-[#D94F3C] dark:text-[#FF8FA3] flex items-center justify-center flex-shrink-0">
                <PowerOff size={16} />
              </span>
              <div>
                <h2 className="text-base font-bold">Desativar item</h2>
                <p className="text-[11px] text-[#56635C] dark:text-muted-foreground">
                  Ele deixa de aparecer para novos agendamentos.
                </p>
              </div>
            </div>

            <p className="text-xs text-[#56635C] dark:text-muted-foreground">
              Tem certeza que deseja desativar{' '}
              <b className="text-[#1B2E26] dark:text-foreground">{confirmarDesativacao.nome}</b>? Ele
              continuará cadastrado e poderá ser reativado depois.
            </p>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmarDesativacao(null)}
                disabled={processandoId === confirmarDesativacao.id}
                className="flex-1 bg-[#EBE5D3]/60 dark:bg-muted/60 hover:bg-[#EBE5D3] dark:hover:bg-muted py-2.5 rounded-xl font-bold text-xs uppercase cursor-pointer disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => executarToggleAtivo(confirmarDesativacao)}
                disabled={processandoId === confirmarDesativacao.id}
                className="flex-1 bg-[#FF6954] hover:brightness-95 text-white py-2.5 rounded-xl font-bold text-xs uppercase shadow-sm cursor-pointer disabled:opacity-60"
              >
                {processandoId === confirmarDesativacao.id ? 'Desativando...' : 'Desativar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmação de exclusão */}
      {confirmarExclusao && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={() => setConfirmarExclusao(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-card rounded-t-3xl sm:rounded-3xl max-w-sm w-full border border-[#E3DEC9] dark:border-border shadow-2xl p-5 space-y-4"
          >
            <div className="flex items-center gap-2.5 border-b border-[#E3DEC9] dark:border-border pb-3">
              <span className="w-8 h-8 rounded-xl bg-[#FF6954]/10 text-[#D94F3C] dark:text-[#FF8FA3] flex items-center justify-center flex-shrink-0">
                <Trash2 size={16} />
              </span>
              <div>
                <h2 className="text-base font-bold">Excluir item</h2>
                <p className="text-[11px] text-[#56635C] dark:text-muted-foreground">
                  Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>

            <p className="text-xs text-[#56635C] dark:text-muted-foreground">
              Excluir permanentemente{' '}
              <b className="text-[#1B2E26] dark:text-foreground">{confirmarExclusao.nome}</b>? Se houver
              agendamentos vinculados, a exclusão será bloqueada — nesse caso, desative o item.
            </p>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmarExclusao(null)}
                disabled={processandoId === confirmarExclusao.id}
                className="flex-1 bg-[#EBE5D3]/60 dark:bg-muted/60 hover:bg-[#EBE5D3] dark:hover:bg-muted py-2.5 rounded-xl font-bold text-xs uppercase cursor-pointer disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => executarExclusao(confirmarExclusao)}
                disabled={processandoId === confirmarExclusao.id}
                className="flex-1 bg-[#FF6954] hover:brightness-95 text-white py-2.5 rounded-xl font-bold text-xs uppercase shadow-sm cursor-pointer disabled:opacity-60"
              >
                {processandoId === confirmarExclusao.id ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
