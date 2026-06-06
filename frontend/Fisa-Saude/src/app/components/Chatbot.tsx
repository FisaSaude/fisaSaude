import { MessageCircle, X, Send, User, Bot } from 'lucide-react';
import { useState } from 'react';
import { COMPANY } from '../constants/company';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Olá! Sou o assistente virtual da ${COMPANY.name}. Como posso ajudar?`,
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

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    // Simular resposta do bot
    setTimeout(() => {
      const botResponse = getBotResponse(inputText);
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
      return `Para agendar, você pode:\n\n📱 WhatsApp: ${COMPANY.contact.phone}\n📧 E-mail: ${COMPANY.contact.email}\n\nOu utilize nosso sistema de agendamento online clicando em "Agendar Aula".`;
    }

    if (input.includes('localização') || input.includes('endereço') || input.includes('onde')) {
      return `Estamos localizados em:\n\n📍 ${COMPANY.address.full}`;
    }

    if (input.includes('serviço') || input.includes('especialidade')) {
      return `Oferecemos os seguintes serviços:\n\n${COMPANY.services.map((s) => `• ${s}`).join('\n')}`;
    }

    if (input.includes('contato') || input.includes('telefone') || input.includes('email')) {
      return `Você pode entrar em contato conosco:\n\n📞 ${COMPANY.contact.phone}\n📧 ${COMPANY.contact.email}\n💬 WhatsApp: ${COMPANY.contact.phone}`;
    }

    return `Obrigado pela sua mensagem! Para melhor atendê-lo, você pode:\n\n• Ligar: ${COMPANY.contact.phone}\n• WhatsApp: ${COMPANY.contact.phone}\n• E-mail: ${COMPANY.contact.email}\n\nNossa equipe responderá o mais breve possível! 😊`;
  };

  const handleQuickReply = (reply: string) => {
    setInputText(reply);
    handleSend();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-2xl transition-all flex items-center justify-center group hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary/30"
        aria-label="Abrir chat"
      >
        <MessageCircle size={28} className="transition-transform group-hover:scale-110" aria-hidden="true" />

        {/* Badge de notificação */}
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-success text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
          1
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-96 h-[600px] bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
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
          onClick={() => setIsOpen(false)}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          aria-label="Fechar chat"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
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

      {/* Quick Replies */}
      {messages.length === 1 && (
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              onClick={() => handleQuickReply(reply)}
              className="px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-full hover:bg-primary/20 transition-colors"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={handleSend}
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
