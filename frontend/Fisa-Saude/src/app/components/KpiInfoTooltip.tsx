import { Info } from 'lucide-react';

type KpiInfoTooltipProps = {
  text: string;
};

/** Tooltip leve só com CSS (hover ou foco no ícone). */
export function KpiInfoTooltip({ text }: KpiInfoTooltipProps) {
  return (
    <span className="relative inline-flex shrink-0 group">
      <button
        type="button"
        className="w-6 h-6 rounded-lg flex items-center justify-center text-[#56635C]/60 hover:text-[#009386] hover:bg-[#009386]/10 transition-colors cursor-help"
        aria-label="Ver explicação da métrica"
      >
        <Info size={13} strokeWidth={2.2} />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute right-0 bottom-full z-50 mb-1.5 w-52 max-w-[calc(100vw-3rem)] rounded-xl border border-[#E3DEC9] bg-white px-3 py-2 text-[10px] sm:text-[11px] leading-snug text-[#56635C] shadow-lg opacity-0 translate-y-1 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0"
      >
        {text}
      </span>
    </span>
  );
}
