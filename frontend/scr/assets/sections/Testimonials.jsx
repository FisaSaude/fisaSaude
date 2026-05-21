import { Star } from 'lucide-react';
import { TESTIMONIALS } from '../constants';

export default function Testimonials() {
  return (
    <section id="depoimentos" className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-16">O que nossos alunos dizem</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, index) => (
            <div key={index} className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
              <div className="flex justify-center gap-1 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="text-yellow-400 fill-yellow-400" size={20} />
                ))}
              </div>
              <p className="text-gray-700 italic mb-6">"{t.text}"</p>
              <div className="font-bold text-gray-900">{t.name}</div>
              <div className="text-sm text-gray-500">Aluna</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}