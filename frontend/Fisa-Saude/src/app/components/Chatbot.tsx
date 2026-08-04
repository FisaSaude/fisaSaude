import { MessageCircle, X, Send, User, Bot } from 'lucide-react';
import { useState } from 'react';
import { COMPANY } from '../constants/company';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

function WhatsAppIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

const WHATSAPP_URL = `https://wa.me/${COMPANY.contact.whatsapp}?text=${encodeURIComponent(
  `Olá, ${COMPANY.contact.supportName}! Vim pelo site da ${COMPANY.name} e gostaria de atendimento.`,
)}`;

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Olá! Sou o assistente virtual da ${COMPANY.name}. Como posso ajudar?\n\nSe preferir falar direto com a ${COMPANY.contact.supportName}, use o botão do WhatsApp abaixo.`,
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');

  const quickReplies = [
    'Horários de atendimento',
    'Como agendar',
    'Localização',
    'Serviços disponíveis',
  ];

  const handleSend = (text = inputText) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    setTimeout(() => {
      const botResponse = getBotResponse(text);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes('horário') || input.includes('atendimento')) {
      return `Nosso atendimento funciona:\n\n${COMPANY.schedule.weekdays}\n${COMPANY.schedule.saturday}`;
    }

    if (input.includes('agendar') || input.includes('marcar')) {
      return `Para agendar, você pode:\n\n📱 WhatsApp da ${COMPANY.contact.supportName}: ${COMPANY.contact.whatsappDisplay}\n📧 E-mail: ${COMPANY.contact.email}\n\nOu utilize nosso sistema de agendamento online clicando em "Agendar Aula".`;
    }

    if (input.includes('localização') || input.includes('endereço') || input.includes('onde')) {
      return `Estamos localizados em:\n\n📍 ${COMPANY.address.full}`;
    }

    if (input.includes('serviço') || input.includes('especialidade')) {
      return `Oferecemos os seguintes serviços:\n\n${COMPANY.services.map((s) => `• ${s}`).join('\n')}`;
    }

    if (input.includes('contato') || input.includes('telefone') || input.includes('email') || input.includes('whats')) {
      return `Fale com a ${COMPANY.contact.supportName} pelo WhatsApp:\n\n💬 ${COMPANY.contact.whatsappDisplay}\n📧 ${COMPANY.contact.email}`;
    }

    return `Obrigado pela sua mensagem! Para melhor atendê-lo, fale com a ${COMPANY.contact.supportName}:\n\n💬 WhatsApp: ${COMPANY.contact.whatsappDisplay}\n📧 E-mail: ${COMPANY.contact.email}`;
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {menuOpen && (
          <div className="flex flex-col gap-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setIsOpen(true);
              }}
              className="flex items-center gap-3 rounded-full bg-card border border-border shadow-xl pl-4 pr-5 py-3 hover:bg-muted transition-colors text-left"
            >
              <span className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <MessageCircle size={20} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-foreground">Assistente virtual</span>
                <span className="block text-xs text-muted-foreground">Tire dúvidas no chat</span>
              </span>
            </button>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-full bg-[#25D366] text-white shadow-xl pl-4 pr-5 py-3 hover:bg-[#1ebe57] transition-colors"
            >
              <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <WhatsAppIcon size={22} />
              </span>
              <span>
                <span className="block text-sm font-semibold">WhatsApp da Ana</span>
                <span className="block text-xs text-white/90">Suporte direto</span>
              </span>
            </a>
          </div>
        )}

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="w-16 h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-2xl transition-all flex items-center justify-center group hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary/30"
          aria-label={menuOpen ? 'Fechar menu de atendimento' : 'Abrir menu de atendimento'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <X size={28} aria-hidden="true" />
          ) : (
            <MessageCircle size={28} className="transition-transform group-hover:scale-110" aria-hidden="true" />
          )}

          {!menuOpen && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-success text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              1
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-96 max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-3rem)] bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{COMPANY.name}</h3>
            <p className="text-xs opacity-90">Assistente Virtual</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setMenuOpen(false);
          }}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          aria-label="Fechar chat"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.sender === 'user' ? 'bg-primary/10' : 'bg-primary'
              }`}
            >
              {message.sender === 'user' ? (
                <User size={16} className="text-primary" />
              ) : (
                <Bot size={16} className="text-primary-foreground" />
              )}
            </div>
            <div
              className={`max-w-[70%] p-3 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-sm'
                  : 'bg-white text-foreground rounded-tl-sm shadow-sm'
              }`}
            >
              <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {messages.length === 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => handleSend(reply)}
              className="px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-full hover:bg-primary/20 transition-colors"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      <div className="px-4 pb-3">
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#1ebe57] text-white font-semibold text-sm py-3 shadow-md transition-colors"
        >
          <WhatsAppIcon size={20} />
          Falar com a Ana no WhatsApp
        </a>
      </div>

      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!inputText.trim()}
            className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Enviar mensagem"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
