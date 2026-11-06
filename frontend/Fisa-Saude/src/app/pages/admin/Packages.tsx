import { PackageOpen, AlertCircle, ListChecks } from 'lucide-react';

export default function Packages() {
  return (
    <div className="h-full overflow-y-auto bg-[#F8F6F0] dark:bg-background p-4 sm:p-6 lg:p-8 text-[#1B2E26] dark:text-foreground">
      <div className="max-w-3xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Planos e Pacotes</h1>
          <p className="text-xs text-[#56635C] dark:text-muted-foreground">
            Serviços, planos e pacotes comercializados pela unidade.
          </p>
        </div>

        <section className="bg-white dark:bg-card border border-[#E3DEC9] dark:border-border rounded-3xl p-6 text-center">
          <PackageOpen size={34} className="mx-auto text-[#009386] dark:text-[#3CD099] mb-3" />
          <h2 className="font-bold">Integração ainda não disponível</h2>
          <p className="text-xs text-[#56635C] dark:text-muted-foreground mt-2 max-w-md mx-auto">
            O banco já possui a entidade de serviço e registros de planos, mas a API atual não expõe Controller
            ou endpoint para listar, cadastrar ou editar esses dados. Nenhuma informação é exibida ou salva
            localmente.
          </p>
          <div className="mt-4 p-3 rounded-xl text-left bg-[#E3DEC9]/40 dark:bg-muted text-xs flex gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>Esta tela será integrada quando o endpoint de serviços/planos existir.</span>
          </div>
        </section>

        <section className="bg-white dark:bg-card border border-[#E3DEC9] dark:border-border rounded-3xl p-5">
          <div className="flex items-center gap-2 border-b border-[#E3DEC9] dark:border-border pb-3">
            <ListChecks size={17} className="text-[#009386] dark:text-[#3CD099]" />
            <h2 className="text-sm font-bold">O que já existe no backend</h2>
          </div>
          <ul className="mt-3 space-y-2 text-xs text-[#56635C] dark:text-muted-foreground">
            <li>• Entidade <code className="font-semibold">Servico</code> com nome, tipo, preço, duração e situação.</li>
            <li>• Repositório de serviços e registros de planos no banco.</li>
            <li>• Respostas de agendamento que já referenciam o serviço utilizado.</li>
            <li>• Ausência de endpoint público para listagem e manutenção.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
