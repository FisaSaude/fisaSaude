import { COMPANY } from '../constants/company';

interface WhatsAppButtonProps {
  message?: string;
}

export function WhatsAppButton({
  message = 'Olá! Gostaria de saber mais sobre os serviços da FISA Saúde.',
}: WhatsAppButtonProps) {
  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);

    const whatsappUrl = `https://wa.me/${COMPANY.contact.whatsapp}?text=${encodedMessage}`;

    window.open(
      whatsappUrl,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <button
      type="button"
      onClick={handleWhatsAppClick}
      className="
        fixed
        bottom-6
        right-6
        z-40
        w-14
        h-14
        bg-[#25D366]
        hover:bg-[#20bd5a]
        text-white
        rounded-full
        shadow-2xl
        transition-all
        duration-300
        flex
        items-center
        justify-center
        hover:scale-110
        active:scale-95
        focus:outline-none
        focus:ring-4
        focus:ring-[#25D366]/30
      "
      aria-label="Conversar pelo WhatsApp"
      title="Conversar pelo WhatsApp"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="25"
        height="25"
        fill="none"
        aria-hidden="true"
        className="block"
      >
        <path
          fill="white"
          d="M20.52 3.48A11.82 11.82 0 0 0 12.08 0C5.55 0 .24 5.31.24 11.84c0 2.09.55 4.13 1.59 5.93L.14 24l6.37-1.67a11.8 11.8 0 0 0 5.57 1.41h.01c6.53 0 11.84-5.31 11.84-11.84 0-3.17-1.23-6.15-3.41-8.42ZM12.09 21.7h-.01a9.82 9.82 0 0 1-5.01-1.37l-.36-.21-3.78.99 1.01-3.68-.23-.38a9.84 9.84 0 0 1-1.51-5.21C2.2 6.42 6.62 2 12.09 2c2.65 0 5.14 1.03 7.01 2.9a9.85 9.85 0 0 1 2.91 7.01c0 5.47-4.45 9.79-9.92 9.79Zm5.39-7.36c-.3-.15-1.77-.87-2.05-.97-.28-.1-.48-.15-.68.15-.2.3-.78.97-.95 1.17-.17.2-.35.23-.65.08-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.78-1.68-2.08-.18-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.68-1.64-.93-2.25-.25-.59-.5-.51-.68-.52-.18-.01-.38-.01-.58-.01-.2 0-.53.08-.8.38-.28.3-1.05 1.02-1.05 2.49s1.08 2.89 1.23 3.09c.15.2 2.12 3.24 5.13 4.54.72.31 1.28.5 1.72.64.72.23 1.37.2 1.89.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.07-.13-.27-.2-.57-.35Z"
        />
      </svg>
    </button>
  );
}

export default WhatsAppButton;