import { Clock, Calendar, MessageSquare, Save } from 'lucide-react';
import { useState } from 'react';

export default function Settings() {
  const [workDays, setWorkDays] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  });

  const weekDays = [
    { key: 'monday', label: 'Segunda-feira' },
    { key: 'tuesday', label: 'Terça-feira' },
    { key: 'wednesday', label: 'Quarta-feira' },
    { key: 'thursday', label: 'Quinta-feira' },
    { key: 'friday', label: 'Sexta-feira' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' },
  ];

  return (
    <div className="h-full lg:overflow-hidden">
      <div className="h-full lg:overflow-y-auto p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl text-gray-900 mb-2">Configurações</h1>
        <p className="text-gray-600">Gerencie as configurações do seu estúdio</p>
      </div>

      <div className="space-y-6">
        {/* Horários de Atendimento */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Clock className="text-emerald-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl text-gray-900">Horários de Atendimento</h2>
              <p className="text-sm text-gray-600">Configure seus horários de trabalho</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Início</label>
                <input
                  type="time"
                  defaultValue="08:00"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Término</label>
                <input
                  type="time"
                  defaultValue="18:00"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Duração da Sessão</label>
              <select 
                defaultValue="50"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
              >
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="50">50 minutos</option>
                <option value="60">60 minutos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Intervalo entre Aulas</label>
              <select 
                defaultValue="10"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
              >
                <option value="0">Sem intervalo</option>
                <option value="5">5 minutos</option>
                <option value="10">10 minutos</option>
                <option value="15">15 minutos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dias de Trabalho */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl text-gray-900">Dias de Trabalho</h2>
              <p className="text-sm text-gray-600">Selecione os dias que você atende</p>
            </div>
          </div>

          <div className="space-y-3">
            {weekDays.map((day) => (
              <label key={day.key} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={workDays[day.key as keyof typeof workDays]}
                  onChange={(e) => setWorkDays({ ...workDays, [day.key]: e.target.checked })}
                  className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <span className="text-gray-900">{day.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* WhatsApp Integration */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="text-green-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl text-gray-900">Integração WhatsApp</h2>
              <p className="text-sm text-gray-600">Configure seu número do WhatsApp</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Número do WhatsApp</label>
              <input
                type="tel"
                defaultValue="(11) 99999-9999"
                placeholder="(11) 99999-9999"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">
                Usado para agendamentos e confirmações automáticas
              </p>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <div>
                  <div className="text-sm text-gray-900">Enviar confirmação automática</div>
                  <div className="text-xs text-gray-600">Cliente recebe confirmação após agendamento</div>
                </div>
              </label>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <div>
                  <div className="text-sm text-gray-900">Lembrete 24h antes</div>
                  <div className="text-xs text-gray-600">Enviar lembrete um dia antes da aula</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Valores dos Planos */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-xl">R$</span>
            </div>
            <div>
              <h2 className="text-xl text-gray-900">Valores dos Planos</h2>
              <p className="text-sm text-gray-600">Configure os preços das mensalidades</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Plano Mensal</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">R$</span>
                <input
                  type="text"
                  defaultValue="400,00"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Plano Semestral (mensal)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">R$</span>
                <input
                  type="text"
                  defaultValue="350,00"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Aula Avulsa</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">R$</span>
                <input
                  type="text"
                  defaultValue="80,00"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
            <Save size={20} />
            Salvar Configurações
          </button>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}
