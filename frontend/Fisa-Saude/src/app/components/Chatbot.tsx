import { MessageCircle } from 'lucide-react';
import { COMPANY } from '../constants/company';

const WHATSAPP_URL = `https://wa.me/${COMPANY.contact.whatsapp}?text=${encodeURIComponent(
  'Olá, vim pelo site e gostaria de mais informações.',
)}`;

export function Chatbot() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-fab-nudge relative fixed bottom-6 right-6 z-40 w-16 h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-2xl flex items-center justify-center group hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary/30"
      aria-label="WhatsApp da Ana, suporte direto"
    >
      <span className="whatsapp-fab-ring pointer-events-none absolute inset-0 rounded-full bg-primary" aria-hidden="true" />
      <MessageCircle size={28} className="relative z-10 transition-transform group-hover:scale-110" aria-hidden="true" />
    </a>
  );
}
