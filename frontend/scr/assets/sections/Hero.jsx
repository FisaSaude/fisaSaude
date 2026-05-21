import { Sparkles, CheckCircle } from 'lucide-react';

export default function Hero({ onContactClick }) {
  return (
    <section className="py-20 px-4 text-center lg:text-left max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm">
          <Sparkles size={16} /> Mais de 500 alunos transformados
        </div>
        <h1 className="text-6xl font-bold text-gray-900 leading-tight">
          Transforme seu <span className="text-emerald-600">Corpo e Mente</span>
        </h1>
        <button onClick={onContactClick} className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg">
          Agendar pelo WhatsApp
        </button>
      </div>
      <div className="relative">
        <img src="https://images.unsplash.com/photo-1754257319787-4c19f30f2a16?q=80&w=1080" className="rounded-3xl shadow-2xl h-[500px] w-full object-cover" alt="Pilates" />
      </div>
    </section>
  );
}