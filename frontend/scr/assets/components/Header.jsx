import { Menu, Phone } from 'lucide-react';

export default function Header({ onContactClick }) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold">P</div>
          <span className="text-xl font-bold">Pilates Studio</span>
        </div>
        <button onClick={onContactClick} className="bg-emerald-600 text-white px-6 py-2 rounded-full flex items-center gap-2">
          <Phone size={18} /> Agendar
        </button>
      </div>
    </header>
  );
}