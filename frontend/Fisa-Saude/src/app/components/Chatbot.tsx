import { MessageCircle } from 'lucide-react';
import { COMPANY } from '../constants/company';

const WHATSAPP_URL = `https://wa.me/${COMPANY.contact.whatsapp}?text=${encodeURIComponent(
  'Olá, vim pelo site e gostaria de mais informações.',
)}`;

export function Chatbot() {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-fab-nudge relative flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/30"
        aria-label="WhatsApp da Ana, suporte direto"
      >
        <span className="whatsapp-fab-ring pointer-events-none absolute inset-0 rounded-full bg-primary" aria-hidden="true" />
        <MessageCircle size={28} className="relative z-10" aria-hidden="true" />
      </a>
    </div>
  );
}
