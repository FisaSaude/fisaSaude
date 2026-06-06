import { 
  Calendar,
  Search, 
  Download, 
  Clock,
  User,
  DollarSign,
  Tag,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useState } from 'react';

interface BookingLog {
  id: string;
  timestamp: Date; // Realizado em
  scheduledDateTime: Date; // Data/Hora do agendamento
  clientName: string;
  planType: 'avulso' | 'mensal' | 'semestral';
  price: number;
  status: 'agendado' | 'realizado' | 'cancelado' | 'reagendado';
}

export default function Logs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlanType, setFilterPlanType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<BookingLog | null>(null);

  // Mock data - Logs de agendamentos
  const bookingLogs: BookingLog[] = [
    {
      id: '1',
      timestamp: new Date('2026-04-01T14:30:00'),
      scheduledDateTime: new Date('2026-04-03T10:00:00'),
      clientName: 'Ana Paula Silva',
      planType: 'mensal',
      price: 350.00,
      status: 'agendado',
    },
    {
      id: '2',
      timestamp: new Date('2026-04-01T13:15:00'),
      scheduledDateTime: new Date('2026-04-02T14:00:00'),
      clientName: 'Carlos Santos',
      planType: 'semestral',
      price: 1800.00,
      status: 'realizado',
    },
    {
      id: '3',
      timestamp: new Date('2026-04-01T12:00:00'),
      scheduledDateTime: new Date('2026-04-02T09:00:00'),
      clientName: 'Mariana Costa',
      planType: 'avulso',
      price: 80.00,
      status: 'cancelado',
    },
    {
      id: '4',
      timestamp: new Date('2026-04-01T11:30:00'),
      scheduledDateTime: new Date('2026-04-01T11:00:00'),
      clientName: 'João Oliveira',
      planType: 'mensal',
      price: 450.00,
      status: 'realizado',
    },
    {
      id: '5',
      timestamp: new Date('2026-04-01T10:00:00'),
      scheduledDateTime: new Date('2026-04-01T10:00:00'),
      clientName: 'Paula Mendes',
      planType: 'avulso',
      price: 80.00,
      status: 'reagendado',
    },
    {
      id: '6',
      timestamp: new Date('2026-04-01T09:45:00'),
      scheduledDateTime: new Date('2026-04-01T15:00:00'),
      clientName: 'Roberto Lima',
      planType: 'mensal',
      price: 400.00,
      status: 'realizado',
    },
    {
      id: '7',
      timestamp: new Date('2026-03-31T16:20:00'),
      scheduledDateTime: new Date('2026-04-04T08:00:00'),
      clientName: 'Fernanda Rocha',
      planType: 'semestral',
      price: 1500.00,
      status: 'agendado',
    },
    {
      id: '8',
      timestamp: new Date('2026-03-31T14:10:00'),
      scheduledDateTime: new Date('2026-03-31T14:00:00'),
      clientName: 'Lucas Martins',
      planType: 'mensal',
      price: 450.00,
      status: 'realizado',
    },
    {
      id: '9',
      timestamp: new Date('2026-03-31T11:30:00'),
      scheduledDateTime: new Date('2026-04-01T16:00:00'),
      clientName: 'Beatriz Alves',
      planType: 'avulso',
      price: 90.00,
      status: 'cancelado',
    },
    {
      id: '10',
      timestamp: new Date('2026-03-31T10:00:00'),
      scheduledDateTime: new Date('2026-03-31T10:00:00'),
      clientName: 'André Silva',
      planType: 'mensal',
      price: 350.00,
      status: 'realizado',
    },
    {
      id: '11',
      timestamp: new Date('2026-03-30T15:30:00'),
      scheduledDateTime: new Date('2026-03-30T15:00:00'),
      clientName: 'Camila Souza',
      planType: 'avulso',
      price: 80.00,
      status: 'reagendado',
    },
    {
      id: '12',
      timestamp: new Date('2026-03-30T09:00:00'),
      scheduledDateTime: new Date('2026-03-30T09:00:00'),
      clientName: 'Diego Costa',
      planType: 'semestral',
      price: 1800.00,
      status: 'realizado',
    },
  ];

  const getPlanTypeConfig = (type: string) => {
    const configs = {
      avulso: { 
        label: 'Avulso',
        bg: 'bg-blue-50',
        color: 'text-blue-700',
        border: 'border-blue-200'
      },
      mensal: { 
        label: 'Mensal',
        bg: 'bg-emerald-50',
        color: 'text-emerald-700',
        border: 'border-emerald-200'
      },
      semestral: { 
        label: 'Semestral',
        bg: 'bg-purple-50',
        color: 'text-purple-700',
        border: 'border-purple-200'
      },
    };
    return configs[type as keyof typeof configs] || configs.avulso;
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      agendado: {
        label: 'Agendado',
        icon: Calendar,
        bg: 'bg-blue-50',
        color: 'text-blue-700',
        border: 'border-blue-200'
      },
      realizado: {
        label: 'Realizado',
        icon: CheckCircle,
        bg: 'bg-emerald-50',
        color: 'text-emerald-700',
        border: 'border-emerald-200'
      },
      cancelado: {
        label: 'Cancelado',
        icon: XCircle,
        bg: 'bg-red-50',
        color: 'text-red-700',
        border: 'border-red-200'
      },
      reagendado: {
        label: 'Reagendado',
        icon: AlertTriangle,
        bg: 'bg-amber-50',
        color: 'text-amber-700',
        border: 'border-amber-200'
      },
    };
    return configs[status as keyof typeof configs] || configs.agendado;
  };

  const filteredLogs = bookingLogs.filter(log => {
    const matchesSearch = 
      log.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlanFilter = filterPlanType === 'all' || log.planType === filterPlanType;
    const matchesStatusFilter = filterStatus === 'all' || log.status === filterStatus;
    
    return matchesSearch && matchesPlanFilter && matchesStatusFilter;
  });

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Data/Hora,Cliente,Plano,Preço,Status,Realizado em\n"
      + filteredLogs.map(log => 
        `${formatDateTime(log.scheduledDateTime)},${log.clientName},${log.planType},${log.price},${log.status},${formatDateTime(log.timestamp)}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `logs_agendamentos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calcular totais
  const totalReceita = filteredLogs.reduce((acc, log) => acc + log.price, 0);
  const totalRegistros = filteredLogs.length;

  return (
    <div className="h-full lg:overflow-hidden">
      <div className="h-full lg:overflow-y-auto bg-gray-50">
        <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Histórico de Agendamentos</h1>
              <p className="text-sm text-gray-600">Histórico completo de agendamentos realizados</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-blue-600" size={18} />
              <span className="text-xs text-blue-700 font-medium">Total de Agendamentos</span>
            </div>
            <div className="text-2xl font-bold text-blue-700">{bookingLogs.length}</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="text-emerald-600" size={18} />
              <span className="text-xs text-emerald-700 font-medium">Realizados</span>
            </div>
            <div className="text-2xl font-bold text-emerald-700">
              {bookingLogs.filter(l => l.status === 'realizado').length}
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-red-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="text-red-600" size={18} />
              <span className="text-xs text-red-700 font-medium">Cancelados</span>
            </div>
            <div className="text-2xl font-bold text-red-700">
              {bookingLogs.filter(l => l.status === 'cancelado').length}
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-amber-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="text-amber-600" size={18} />
              <span className="text-xs text-amber-700 font-medium">Reagendados</span>
            </div>
            <div className="text-2xl font-bold text-amber-700">
              {bookingLogs.filter(l => l.status === 'reagendado').length}
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={filterPlanType}
                onChange={(e) => setFilterPlanType(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
              >
                <option value="all">Todos os planos</option>
                <option value="avulso">Avulso</option>
                <option value="mensal">Mensal</option>
                <option value="semestral">Semestral</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
              >
                <option value="all">Todos os status</option>
                <option value="agendado">Agendado</option>
                <option value="realizado">Realizado</option>
                <option value="cancelado">Cancelado</option>
                <option value="reagendado">Reagendado</option>
              </select>

              <button
                onClick={handleExport}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
              >
                <Download size={18} />
                <span className="hidden lg:inline">Exportar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Logs Table/List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Plano
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Realizado em
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map((log) => {
                  const planConfig = getPlanTypeConfig(log.planType);
                  const statusConfig = getStatusConfig(log.status);
                  const StatusIcon = statusConfig.icon;
                  return (
                    <tr 
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Calendar size={16} className="text-gray-400" />
                          {formatDateTime(log.scheduledDateTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{log.clientName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${planConfig.bg} ${planConfig.color} ${planConfig.border}`}>
                          <Tag size={14} />
                          {planConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm font-semibold text-emerald-700">
                          {formatPrice(log.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                          <StatusIcon size={14} />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={16} className="text-gray-400" />
                          {formatDateTime(log.timestamp)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-gray-100">
            {filteredLogs.map((log) => {
              const planConfig = getPlanTypeConfig(log.planType);
              const statusConfig = getStatusConfig(log.status);
              const StatusIcon = statusConfig.icon;
              return (
                <div 
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User size={16} className="text-gray-400" />
                        <h3 className="font-semibold text-gray-900">{log.clientName}</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${planConfig.bg} ${planConfig.color} ${planConfig.border}`}>
                          <Tag size={14} />
                          {planConfig.label}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                          <StatusIcon size={14} />
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-emerald-700">
                        {formatPrice(log.price)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      Agendado: {formatDateTime(log.scheduledDateTime)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      Realizado em: {formatDateTime(log.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum registro encontrado</h3>
              <p className="text-gray-600">Tente ajustar os filtros de busca</p>
            </div>
          )}
        </div>

        {/* Results count */}
        {filteredLogs.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Mostrando {filteredLogs.length} de {bookingLogs.length} registros
          </div>
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSelectedLog(null)}
          />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 lg:inset-x-auto lg:left-1/2 lg:-translate-x-1/2 lg:w-full lg:max-w-2xl bg-white rounded-2xl shadow-2xl z-50 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <User className="text-emerald-600" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedLog.clientName}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      {(() => {
                        const statusConfig = getStatusConfig(selectedLog.status);
                        const StatusIcon = statusConfig.icon;
                        return (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                            <StatusIcon size={14} />
                            {statusConfig.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-gray-400 text-2xl leading-none">&times;</span>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                    Tipo de Plano
                  </label>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${getPlanTypeConfig(selectedLog.planType).bg} ${getPlanTypeConfig(selectedLog.planType).color} ${getPlanTypeConfig(selectedLog.planType).border}`}>
                    <Tag size={16} />
                    {getPlanTypeConfig(selectedLog.planType).label}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Valor
                  </label>
                  <div className="flex items-center gap-2 text-2xl font-bold text-emerald-700">
                    <DollarSign size={24} />
                    {formatPrice(selectedLog.price)}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Data/Hora do Agendamento
                  </label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Calendar size={18} className="text-gray-400" />
                    {formatDateTime(selectedLog.scheduledDateTime)}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Realizado em
                  </label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Clock size={18} className="text-gray-400" />
                    {formatDateTime(selectedLog.timestamp)}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setSelectedLog(null)}
                className="w-full px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  );
}