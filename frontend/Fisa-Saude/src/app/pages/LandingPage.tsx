import {
  Menu,
  X,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Mail,
  CheckCircle,
  Star,
  ArrowRight,
  Award,
  Users,
  Heart,
  Shield,
  Info,
  Activity,
  Sparkles,
  User,
  Dumbbell,
  Stethoscope,
  Compass,
  Moon,
  Sun,
} from 'lucide-react';

import { useState, useEffect } from 'react';

import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { FisaLogo } from '../components/FisaLogo';
import { COMPANY } from '../constants/company';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';

// Imagens reais da FISA Saúde
import heroImage1 from '../../imports/hero_section.jpeg';
import aboutImage from '../../imports/pilates_03.png';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('fisa-theme') === 'dark';
  });
  const [isoOpen, setIsoOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('hero');

  useEffect(() => {
    window.localStorage.setItem('fisa-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((current) => !current);

  const navLinks = [
    { id: 'hero', label: 'Início' },
    { id: 'convenios', label: 'Convênios' },
    { id: 'sobre', label: 'Sobre Nós' },
    { id: 'servicos', label: 'Serviços' },
    { id: 'diferenciais', label: 'Diferenciais' },
    { id: 'faq', label: 'Dúvidas' },
    { id: 'localizacao', label: 'Localização' },
  ];

  useEffect(() => {
    const sectionIds = [
      'hero',
      'convenios',
      'sobre',
      'servicos',
      'diferenciais',
      'faq',
      'localizacao',
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -60% 0px',
      }
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);

      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  const handleWhatsAppClick = (preset?: string) => {
    const message = encodeURIComponent(
      preset ??
      'Olá! Gostaria de saber mais sobre os serviços da FISA Saúde.'
    );

    window.open(
      `https://wa.me/${COMPANY.contact.whatsapp}?text=${message}`,
      '_blank'
    );
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'Pilates Individual':
        return <User size={24} aria-hidden="true" />;

      case 'Pilates em Pequenos Grupos':
        return <Users size={24} aria-hidden="true" />;

      case 'Reabilitação Física':
        return <Stethoscope size={24} aria-hidden="true" />;

      case 'Fortalecimento Muscular':
        return <Dumbbell size={24} aria-hidden="true" />;

      case 'Qualidade de Vida':
        return <Heart size={24} aria-hidden="true" />;

      case 'Acompanhamento Personalizado':
        return <Compass size={24} aria-hidden="true" />;

      default:
        return <CheckCircle size={24} aria-hidden="true" />;
    }
  };

  return (
    <div id="fisa-landing" className={`min-h-screen bg-[#F8F6F0] text-[#1B2E26] font-sans antialiased selection:bg-[#3CD099]/40 selection:text-[#0E2820] ${isDarkMode ? 'fisa-theme-dark' : ''}`}>
      <style>{`
        #fisa-landing {
          --fisa-dark-bg: #101b19;
          --fisa-dark-surface: #172724;
          --fisa-dark-surface-raised: #203530;
          --fisa-dark-border: #35534a;
          --fisa-dark-text: #f4f5ef;
          --fisa-dark-muted: #b7c9c0;
          --fisa-dark-coral: #ff8978;
          --fisa-dark-mint: #7ce0b8;
          transition: background-color .25s ease, color .25s ease;
        }
        #fisa-landing.fisa-theme-dark {
          background-color: var(--fisa-dark-bg) !important;
          color: var(--fisa-dark-text) !important;
          color-scheme: dark;
        }
        #fisa-landing.fisa-theme-dark header button[aria-label="Ativar tema claro"],
        #fisa-landing.fisa-theme-dark header button[aria-label="Ativar tema escuro"] {
          background-color: var(--fisa-dark-surface-raised) !important;
          color: var(--fisa-dark-mint) !important;
        }
        #fisa-landing.fisa-theme-dark header {
          background-color: rgba(16, 27, 25, .94) !important;
          border-color: var(--fisa-dark-border) !important;
          box-shadow: 0 8px 28px rgba(0, 0, 0, .16);
        }
        #fisa-landing.fisa-theme-dark [class~="bg-white"],
        #fisa-landing.fisa-theme-dark [class~="bg-white/70"],
        #fisa-landing.fisa-theme-dark [class~="bg-white/75"],
        #fisa-landing.fisa-theme-dark [class~="bg-white/80"],
        #fisa-landing.fisa-theme-dark [class~="bg-white/90"],
        #fisa-landing.fisa-theme-dark [class~="bg-white/95"],
        #fisa-landing.fisa-theme-dark [class~="bg-[#F8F6F0]"],
        #fisa-landing.fisa-theme-dark [class~="bg-[#FBF5E9]"],
        #fisa-landing.fisa-theme-dark [class~="bg-[#EEF0F4]"],
        #fisa-landing.fisa-theme-dark [class~="bg-[#F7F4ED]"],
        #fisa-landing.fisa-theme-dark [class~="bg-[#F7F2E9]"],
        #fisa-landing.fisa-theme-dark [class~="bg-[#EBE5D3]"],
        #fisa-landing.fisa-theme-dark [class~="bg-[#E3DEC9]"] {
          background-color: var(--fisa-dark-surface) !important;
        }
        #fisa-landing.fisa-theme-dark [class~="bg-[#EBE5D3]/60"],
        #fisa-landing.fisa-theme-dark [class~="bg-[#009386]/10"],
        #fisa-landing.fisa-theme-dark [class~="bg-[#E4F5E9]"],
        #fisa-landing.fisa-theme-dark [class~="bg-[#FFF0E9]"],
        #fisa-landing.fisa-theme-dark [class~="bg-[#FCE7EE]"] {
          background-color: var(--fisa-dark-surface-raised) !important;
        }
        #fisa-landing.fisa-theme-dark [class~="text-[#1B2E26]"],
        #fisa-landing.fisa-theme-dark [class~="text-[#231B22]"],
        #fisa-landing.fisa-theme-dark [class~="text-[#292820]"],
        #fisa-landing.fisa-theme-dark [class~="text-[#171717]"],
        #fisa-landing.fisa-theme-dark [class~="text-[#06190F]"],
        #fisa-landing.fisa-theme-dark [class~="text-[#475E54]"] {
          color: var(--fisa-dark-text) !important;
        }
        #fisa-landing.fisa-theme-dark [class~="text-[#56635C]"],
        #fisa-landing.fisa-theme-dark [class~="text-[#57544D]"],
        #fisa-landing.fisa-theme-dark [class~="text-[#4E5851]"],
        #fisa-landing.fisa-theme-dark [class~="text-[#6B6B78]"],
        #fisa-landing.fisa-theme-dark [class~="text-[#777268]"] {
          color: var(--fisa-dark-muted) !important;
        }
        #fisa-landing.fisa-theme-dark [class~="text-[#FF6954]"],
        #fisa-landing.fisa-theme-dark [class~="text-[#E8795C]"],
        #fisa-landing.fisa-theme-dark [class~="text-[#D8385E]"] {
          color: var(--fisa-dark-coral) !important;
        }
        #fisa-landing.fisa-theme-dark [class~="text-[#009386]"],
        #fisa-landing.fisa-theme-dark [class~="text-[#007491]"],
        #fisa-landing.fisa-theme-dark [class~="text-[#268B65]"] {
          color: var(--fisa-dark-mint) !important;
        }
        #fisa-landing.fisa-theme-dark [class~="border-[#E3DEC9]"],
        #fisa-landing.fisa-theme-dark [class~="border-white"],
        #fisa-landing.fisa-theme-dark [class~="border-[#1B2E26]/15"] {
          border-color: var(--fisa-dark-border) !important;
        }
        #fisa-landing.fisa-theme-dark [class~="bg-[#FF6954]"] {
          background-color: #e96f60 !important;
        }
        #fisa-landing.fisa-theme-dark [class~="hover:bg-[#E8533E]"]:hover {
          background-color: #f18372 !important;
        }
        #fisa-landing.fisa-theme-dark #hero,
        #fisa-landing.fisa-theme-dark #convenios,
        #fisa-landing.fisa-theme-dark #sobre,
        #fisa-landing.fisa-theme-dark #servicos,
        #fisa-landing.fisa-theme-dark #diferenciais,
        #fisa-landing.fisa-theme-dark #faq,
        #fisa-landing.fisa-theme-dark #localizacao {
          background-color: var(--fisa-dark-bg) !important;
        }
        #fisa-landing.fisa-theme-dark #faq article,
        #fisa-landing.fisa-theme-dark #faq [role="region"],
        #fisa-landing.fisa-theme-dark [class*="shadow-"] {
          border-color: var(--fisa-dark-border);
        }
        #fisa-landing.fisa-theme-dark #faq article,
        #fisa-landing.fisa-theme-dark #faq [role="region"] {
          background-color: var(--fisa-dark-surface) !important;
        }
        #fisa-landing.fisa-theme-dark input,
        #fisa-landing.fisa-theme-dark textarea,
        #fisa-landing.fisa-theme-dark select {
          background-color: var(--fisa-dark-surface) !important;
          color: var(--fisa-dark-text) !important;
          border-color: var(--fisa-dark-border) !important;
        }
        #fisa-landing.fisa-theme-dark a:focus-visible,
        #fisa-landing.fisa-theme-dark button:focus-visible {
          outline-color: var(--fisa-dark-mint);
        }
        #fisa-landing.fisa-theme-dark .fisa-decorative-circle {
          opacity: .16;
        }
        @media (prefers-reduced-motion: reduce) {
          #fisa-landing { transition: none; }
        }
      `}</style>

      {/* =========================================================
          ACESSIBILIDADE
      ========================================================= */}

      <a
        href="#main-content"
        className="
          sr-only
          focus:not-sr-only
          focus:fixed
          focus:top-3
          focus:left-3
          focus:z-[100]
          focus:px-3.5
          focus:py-1.5
          focus:bg-white
          focus:text-[#1B2E26]
          focus:text-xs
          focus:font-semibold
          focus:rounded-full
          focus:shadow-md
          focus:ring-2
          focus:ring-[#FF6954]
          focus:outline-none
        "
      >
        Pular para o conteúdo principal
      </a>

      {/* =========================================================
          NAVBAR
      ========================================================= */}

      <header
        className="
          sticky
          top-0
          z-50
          bg-[#F8F6F0]/95
          backdrop-blur-md
          border-b
          border-[#E3DEC9]
        "
        role="banner"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="flex h-[72px] items-center justify-between">

            {/* =====================================================
                LOGO
            ===================================================== */}

            <a
              href="#hero"
              aria-label="FISA Saúde - início"
              className="
                flex
                shrink-0
                items-center
                mr-8
              "
            >
              <FisaLogo size="sm" />
            </a>

            {/* =====================================================
                NAVEGAÇÃO DESKTOP
            ===================================================== */}

            <nav
              className="
                hidden
                lg:flex
                flex-1
                items-center
                justify-center
              "
              aria-label="Navegação principal"
            >
              <div className="flex items-center gap-2">

                {navLinks.map((link) => {
                  const isActive = activeSection === link.id;

                  return (
                    <a
                      key={link.id}
                      href={`#${link.id}`}
                      aria-current={
                        isActive ? 'location' : undefined
                      }
                      className={`
                        relative
                        px-4
                        py-2.5
                        rounded-full
                        text-[12px]
                        font-semibold
                        tracking-wide
                        whitespace-nowrap
                        transition-all
                        duration-200

                        ${isActive
                          ? 'bg-[#009386] text-white shadow-sm'
                          : 'text-[#475E54] hover:bg-[#EBE5D3] hover:text-[#1B2E26]'
                        }
                      `}
                    >
                      {link.label}
                    </a>
                  );
                })}

              </div>
            </nav>

            {/* =====================================================
                AÇÕES DESKTOP
            ===================================================== */}

            <div
              className="
                hidden
                lg:flex
                shrink-0
                items-center
                gap-3
                ml-8
              "
            >

              {/* Instagram */}

              <a
                href={COMPANY.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram da FISA Saúde"
                title="Instagram"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  text-[#475E54]
                  bg-[#EBE5D3]/60
                  transition-all
                  duration-200
                  hover:bg-[#EBE5D3]
                  hover:text-[#FF6954]
                "
              >
                <Instagram
                  size={17}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </a>

              <button
                type="button"
                onClick={toggleTheme}
                aria-label={isDarkMode ? 'Ativar tema claro' : 'Ativar tema escuro'}
                aria-pressed={isDarkMode}
                title={isDarkMode ? 'Ativar tema claro' : 'Ativar tema escuro'}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EBE5D3]/60 text-[#475E54] transition-colors hover:bg-[#EBE5D3] hover:text-[#FF6954] focus:outline-none focus:ring-2 focus:ring-[#FF6954]"
              >
                {isDarkMode ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
              </button>

              {/* Separador */}

              <div
                className="
                  h-6
                  w-px
                  bg-[#E3DEC9]
                "
                aria-hidden="true"
              />

              {/* Botão Agendar */}

              <button
                type="button"
                onClick={() =>
                  handleWhatsAppClick(
                    'Olá! Quero agendar uma aula experimental de pilates na Fisa Saúde, no Tatuapé.'
                  )
                }
                className="
                  inline-flex
                  h-10
                  items-center
                  justify-center
                  rounded-full
                  bg-[#FF6954]
                  px-5
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-white
                  shadow-sm
                  transition-colors
                  duration-200
                  hover:bg-[#E8533E]
                  hover:shadow-md
                  active:scale-95
                  whitespace-nowrap
                "
                aria-label="Agendar aula experimental pelo WhatsApp"
              >
                Agendar aula
              </button>

            </div>

            {/* =====================================================
                MENU MOBILE
            ===================================================== */}

            <div className="flex lg:hidden items-center gap-2">

              <button
                type="button"
                onClick={() =>
                  handleWhatsAppClick(
                    'Olá! Quero agendar uma aula experimental de pilates na Fisa Saúde, no Tatuapé.'
                  )
                }
                className="
                  inline-flex
                  h-9
                  items-center
                  justify-center
                  rounded-full
                  bg-[#FF6954]
                  px-3.5
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-white
                  shadow-sm
                  transition-colors
                  duration-200
                  hover:bg-[#E8533E]
                  active:scale-95
                  whitespace-nowrap
                "
                aria-label="Agendar aula experimental pelo WhatsApp"
              >
                Agendar aula
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                aria-label={isDarkMode ? 'Ativar tema claro' : 'Ativar tema escuro'}
                aria-pressed={isDarkMode}
                title={isDarkMode ? 'Ativar tema claro' : 'Ativar tema escuro'}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EBE5D3]/60 text-[#475E54] transition-colors hover:bg-[#EBE5D3] hover:text-[#FF6954] focus:outline-none focus:ring-2 focus:ring-[#FF6954]"
              >
                {isDarkMode ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
              </button>

              <button
                type="button"
                onClick={() =>
                  setIsMenuOpen((prev) => !prev)
                }
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  text-[#1B2E26]
                  bg-[#EBE5D3]/60
                  transition-colors
                  hover:bg-[#EBE5D3]
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#FF6954]
                "
                aria-label={
                  isMenuOpen
                    ? 'Fechar menu'
                    : 'Abrir menu'
                }
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMenuOpen ? (
                  <X
                    size={20}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                ) : (
                  <Menu
                    size={20}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                )}
              </button>

            </div>

          </div>

          {/* =====================================================
              MENU MOBILE DROPDOWN
          ===================================================== */}

          {isMenuOpen && (
            <nav
              id="mobile-menu"
              className="
                lg:hidden
                border-t
                border-[#E3DEC9]
                py-3
                animate-in
                fade-in
                slide-in-from-top-2
                duration-200
              "
              aria-label="Navegação mobile"
            >

              <div className="flex flex-col gap-1">

                {navLinks.map((link) => {
                  const isActive =
                    activeSection === link.id;

                  return (
                    <a
                      key={link.id}
                      href={`#${link.id}`}
                      onClick={() =>
                        setIsMenuOpen(false)
                      }
                      aria-current={
                        isActive
                          ? 'location'
                          : undefined
                      }
                      className={`
                        flex
                        items-center
                        justify-between
                        rounded-xl
                        px-4
                        py-2.5
                        text-xs
                        font-semibold
                        transition-colors

                        ${isActive
                          ? 'bg-[#009386] text-white'
                          : 'text-[#475E54] hover:bg-[#EBE5D3] hover:text-[#1B2E26]'
                        }
                      `}
                    >
                      <span>{link.label}</span>

                      {isActive && (
                        <span
                          className="
                            h-1.5
                            w-1.5
                            rounded-full
                            bg-[#3CD099]
                          "
                          aria-hidden="true"
                        />
                      )}
                    </a>
                  );
                })}

                {/* Instagram */}

                <a
                  href={COMPANY.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    setIsMenuOpen(false)
                  }
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    px-4
                    py-2.5
                    text-xs
                    font-semibold
                    text-[#475E54]
                    hover:bg-[#EBE5D3]
                    hover:text-[#FF6954]
                  "
                >
                  <Instagram
                    size={15}
                    aria-hidden="true"
                  />

                  Veja o dia a dia no Instagram
                </a>

                {/* Agendar */}

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);

                    handleWhatsAppClick(
                      'Olá! Quero agendar uma aula experimental de pilates na Fisa Saúde, no Tatuapé.'
                    );
                  }}
                  className="
                    mt-1
                    w-full
                    rounded-full
                    bg-[#FF6954]
                    px-4
                    py-2.5
                    text-xs
                    font-bold
                    uppercase
                    tracking-wider
                    text-white
                    shadow-sm
                    transition-all
                    hover:bg-[#E8533E]
                    active:scale-[0.98]
                  "
                >
                  Agendar aula
                </button>

              </div>

            </nav>
          )}

        </div>
      </header>

      <main id="main-content">

        {/* =========================================================
            HERO
        ========================================================= */}

        <section
          id="hero"
          className="
            relative
            overflow-hidden
            bg-[#FBF5E9]
            pt-6
            pb-12
            sm:pt-8
            sm:pb-14
            lg:pt-10
            lg:pb-16
          "
          aria-labelledby="hero-heading"
        >
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-0 h-[28rem] w-[28rem] rounded-full border border-[#E9CDA6]/70" />
          <div aria-hidden="true" className="pointer-events-none absolute -left-28 bottom-[-12rem] h-[26rem] w-[26rem] rounded-full border-[18px] border-white/70" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">

              {/* CONTEÚDO */}

              <div className="lg:col-span-6 space-y-4 text-center lg:text-left">

                <div className="
                  inline-flex
                  items-center
                  gap-1.5
                  bg-[#009386]/10
                  text-[#007491]
                  border
                  border-[#009386]/25
                  px-3.5
                  py-1
                  rounded-full
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-wider
                ">
                  <Award size={13} className="text-[#009386]" />
                  Clínica de pilates e fisioterapia
                </div>

                <h1
                  id="hero-heading"
                  className="
                    text-3xl
                    sm:text-4xl
                    lg:text-[3.1rem]
                    font-extrabold
                    text-[#1B2E26]
                    tracking-tight
                    leading-[1.12]
                  "
                >
                  Movimento com propósito.

                  <span className="block text-[#FF6954] mt-1">
                    Cuidado com o seu corpo.
                  </span>
                </h1>

                <p className="
                  text-sm
                  sm:text-base
                  text-[#56635C]
                  leading-relaxed
                  max-w-xl
                  mx-auto
                  lg:mx-0
                  font-normal
                ">
                  Pilates e fisioterapia com atenção individual,
                  foco em prevenção, reabilitação e bem-estar.
                </p>

                {/* BOTÕES */}

                <div className="
                  pt-1
                  flex
                  flex-col
                  sm:flex-row
                  gap-3
                  justify-center
                  lg:justify-start
                  items-center
                ">

                  <button
                    onClick={() =>
                      handleWhatsAppClick(
                        'Olá! Quero agendar uma aula experimental de pilates na Fisa Saúde, no Tatuapé.'
                      )
                    }
                    className="
                      w-full
                      sm:w-auto
                      bg-[#FF6954]
                      hover:bg-[#E8533E]
                      text-white
                      px-6
                      py-2.5
                      rounded-full
                      uppercase
                      tracking-wider
                      text-xs
                      font-bold
                      transition-all
                      shadow-md
                      hover:scale-105
                      active:scale-95
                      flex
                      items-center
                      justify-center
                      gap-2
                    "
                    aria-label="Agendar aula experimental pelo WhatsApp"
                  >
                    <Phone
                      size={15}
                      aria-hidden="true"
                    />

                    <span>
                      Agendar aula experimental
                    </span>

                    <ArrowRight
                      size={14}
                      aria-hidden="true"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleWhatsAppClick(
                        'Olá! Quero agendar uma avaliação de fisioterapia na Fisa Saúde, no Tatuapé.'
                      )
                    }
                    className="
                      w-full
                      sm:w-auto
                      border-2
                      border-[#009386]
                      text-[#009386]
                      bg-transparent
                      hover:bg-[#009386]
                      hover:text-white
                      px-5
                      py-2
                      rounded-full
                      uppercase
                      tracking-wider
                      text-xs
                      font-bold
                      transition-all
                    "
                    aria-label="Agendar avaliação pelo WhatsApp"
                  >
                    Agendar avaliação
                  </button>

                </div>

                <div className="pt-1">

                  <a
                    href={COMPANY.maps.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      inline-flex
                      items-center
                      justify-center
                      lg:justify-start
                      gap-1.5
                      text-xs
                      text-[#56635C]
                      hover:text-[#1B2E26]
                    "
                  >
                    <Star
                      className="text-[#FFB800] fill-[#FFB800]"
                      size={15}
                      aria-hidden="true"
                    />

                    Veja as avaliações reais da Fisa Saúde no Google
                  </a>

                </div>

              </div>

              {/* IMAGEM */}

              <div className="
                lg:col-span-6
                relative
                flex
                justify-center
                items-center
              ">

                <div aria-hidden="true" className="absolute right-[4%] top-[4%] aspect-square w-[82%] rounded-full bg-[#F2DCC0]" />
                <div aria-hidden="true" className="absolute -left-1 bottom-[8%] h-24 w-24 rounded-full border-[10px] border-[#E9CDA6]/70" />

                <div className="
                  relative
                  z-[5]
                  aspect-square
                  w-full
                  max-w-[440px]
                  overflow-hidden
                  rounded-full
                  border-[7px]
                  border-white/90
                  bg-white
                  shadow-[0_22px_60px_rgba(83,65,42,0.16)]
                ">
                  <ImageWithFallback
                    src={heroImage1}
                    alt="Espaço de Pilates e fisioterapia da FISA Saúde"
                    className="h-full w-full rounded-full object-cover"
                    loading="eager"
                    fetchPriority="high"
                  />
                </div>

                <div className="absolute right-0 top-[16%] z-20 flex max-w-[190px] items-center gap-2 rounded-xl border border-[#F0E7D8] bg-white/95 p-3 shadow-lg sm:right-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFF0E9] text-[#E8795C]"><Heart size={16} aria-hidden="true" /></span>
                  <span><strong className="block text-[11px] text-[#292820]">Cuidado individual</strong><span className="text-[9px] text-[#777268]">Respeito ao seu ritmo</span></span>
                </div>

                <div className="absolute bottom-[9%] left-0 z-20 flex max-w-[205px] items-center gap-2 rounded-xl border border-[#F0E7D8] bg-white/95 p-3 shadow-lg">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E4F5E9] text-[#268B65]"><Activity size={16} aria-hidden="true" /></span>
                  <span><strong className="block text-[11px] text-[#292820]">Movimento e bem-estar</strong><span className="text-[9px] text-[#777268]">Mais qualidade de vida</span></span>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* =========================================================
            CONVÊNIOS WELLHUB E TOTALPASS
            Cada card usa uma linguagem visual própria da plataforma
        ========================================================= */}

        <section
          id="convenios"
          className="relative overflow-hidden bg-[#F8F6F0] py-9 sm:py-11 lg:py-12"
          aria-labelledby="convenios-heading"
        >
          <div aria-hidden="true" className="absolute -left-20 top-16 h-56 w-56 rounded-full border-[32px] border-[#009386]/10" />
          <div aria-hidden="true" className="absolute -right-12 bottom-0 h-64 w-64 rounded-full bg-[#FF6954]/[0.05]" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-7 grid gap-4 md:mb-8 md:grid-cols-[0.9fr_1.1fr] md:items-end">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#1B2E26]/15 bg-white/70 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#1B2E26]">
                  <CheckCircle size={14} aria-hidden="true" />
                  Seu benefício, seu movimento
                </span>
                <h2 id="convenios-heading" className="mt-3 max-w-xl text-2xl font-black leading-[1.08] tracking-tight text-[#231B22] sm:text-3xl lg:text-4xl">
                  A FISA também está nos seus <span className="text-[#D8385E]">benefícios.</span>
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-[#57544D] md:justify-self-end md:text-base">
                Já utiliza uma plataforma de bem-estar pela empresa? Encontre a nossa unidade nos perfis abaixo e confira diretamente as condições para praticar Pilates com a FISA Saúde.
              </p>
            </div>

            <div className="grid items-stretch gap-6 lg:grid-cols-2 lg:gap-8">
              {/* WELLHUB — identidade vibrante, rosa + verde-limão e roda do bem-estar */}
              <article className="group relative flex min-h-full flex-col overflow-hidden rounded-[2rem] border border-[#D8385E]/15 bg-white shadow-[0_18px_55px_rgba(35,27,34,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(35,27,34,0.14)]">
                <div className="relative min-h-[150px] overflow-hidden bg-[#F33F68] p-5 sm:p-6">
                  <div aria-hidden="true" className="absolute -right-10 -top-12 h-56 w-56 rounded-full border-[24px] border-white/20" />
                  <div aria-hidden="true" className="absolute right-7 top-6 h-20 w-20 rounded-full bg-white/20 opacity-95 transition-transform duration-500 group-hover:rotate-45">
                    <span className="absolute left-1/2 top-0 h-1/2 w-1/2 rounded-tr-full bg-[#F33F68]" />
                    <span className="absolute bottom-0 left-0 h-1/2 w-1/2 rounded-bl-full bg-[#231B22]" />
                    <span className="absolute bottom-0 right-0 h-1/2 w-1/2 rounded-br-full bg-white" />
                  </div>
                  <div className="relative z-10 flex h-full min-h-[118px] flex-col items-start justify-between">
                    <span className="rounded-full bg-white/15 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.18em] text-white">
                      Bem-estar em movimento
                    </span>
                    <div>
                      <div className="text-3xl font-black tracking-[-0.07em] text-white sm:text-4xl" aria-label="Wellhub">
                        Wellhub<span className="text-[#B8F46A]">.</span>
                      </div>
                      <p className="mt-2 max-w-[240px] text-sm font-semibold text-white">
                        Mais possibilidades para cuidar de você.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FCE7EE] text-[#D8385E]">
                      <Activity size={20} aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-lg font-extrabold text-[#231B22]">Encontre a FISA no Wellhub</h3>
                      <p className="text-xs text-[#6B6B78]">Consulte as condições do seu benefício.</p>
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-[#57544D]">
                    Acesse o perfil da nossa unidade e confira as opções disponíveis para incluir o Pilates na sua rotina.
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-[#231B22]">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle size={17} className="mt-0.5 shrink-0 text-[#1D856C]" aria-hidden="true" />
                      <span>Verifique a elegibilidade da sua conta.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle size={17} className="mt-0.5 shrink-0 text-[#1D856C]" aria-hidden="true" />
                      <span>Confira o plano e a disponibilidade da atividade.</span>
                    </li>
                  </ul>
                  <a
                    href="https://wellhub.com/pt-br/search/partners/fisa-saude-vila-gomes-cardim/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#F33F68] px-4 py-2.5 text-center text-xs font-extrabold text-white transition hover:bg-[#D92E56] focus:outline-none focus:ring-2 focus:ring-[#F33F68] focus:ring-offset-2"
                    aria-label="Consultar o perfil da FISA Saúde no Wellhub"
                  >
                    Ver perfil no Wellhub <ArrowRight size={16} aria-hidden="true" />
                  </a>
                </div>
              </article>

              {/* TOTALPASS — wordmark em faixa preta inclinada, preto + verde */}
              <article className="group relative flex min-h-full flex-col overflow-hidden rounded-[1.25rem] border border-[#1A1A1A]/10 bg-white shadow-[0_18px_55px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(0,0,0,0.15)]">
                <div className="relative min-h-[150px] overflow-hidden bg-[#22C879] p-5 sm:p-6">
                  <div aria-hidden="true" className="absolute -right-8 -top-8 h-56 w-56 rounded-full border-[30px] border-[#101710]/10" />
                  <div aria-hidden="true" className="absolute bottom-0 right-0 h-24 w-3/5 bg-white/10 [clip-path:polygon(22%_0,100%_0,100%_100%,0_100%)]" />
                  <div className="relative z-10 flex min-h-[118px] flex-col items-start justify-between">
                    <span className="rounded-sm bg-[#101710]/10 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#101710]">
                      Seu treino, suas escolhas
                    </span>
                    <div>
                      <div className="inline-flex items-center">
                        <span className="text-5xl font-black italic leading-none tracking-[-0.12em] text-[#06190F] sm:text-6xl">TP</span>
                      </div>
                      <p className="mt-3 max-w-[260px] text-sm font-semibold text-[#06190F]">
                        Seu caminho para uma rotina mais ativa.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E0F7E9] text-[#008A49]">
                      <Heart size={20} aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-lg font-extrabold text-[#171717]">FISA Saúde na TotalPass</h3>
                      <p className="text-xs text-[#5A655E]">Veja os detalhes da unidade.</p>
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-[#4E5851]">
                    Consulte o perfil da FISA Saúde – Fisioterapia e Pilates e veja as informações disponíveis para o seu plano.
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-[#171717]">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle size={17} className="mt-0.5 shrink-0 text-[#00A859]" aria-hidden="true" />
                      <span>Confira a disponibilidade para Pilates.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle size={17} className="mt-0.5 shrink-0 text-[#00A859]" aria-hidden="true" />
                      <span>Consulte regras e necessidade de agendamento.</span>
                    </li>
                  </ul>
                  <a
                    href="https://totalpass.com/br/academias/fisa-saude-fisioterapia-e-pilates/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#171717] px-4 py-2.5 text-center text-xs font-extrabold text-white transition hover:bg-[#00A859] hover:text-[#101010] focus:outline-none focus:ring-2 focus:ring-[#00A859] focus:ring-offset-2"
                    aria-label="Consultar o perfil da FISA Saúde na TotalPass"
                  >
                    Ver perfil na TotalPass <ArrowRight size={16} aria-hidden="true" />
                  </a>
                </div>
              </article>
            </div>

            <p className="mx-auto mt-5 max-w-3xl border-l-2 border-[#D8385E]/40 pl-4 text-left text-[11px] leading-5 text-[#57544D]">
              A disponibilidade, o plano elegível e a necessidade de agendamento podem variar. Confirme as condições diretamente no aplicativo ou na página de cada plataforma.
            </p>
          </div>
        </section>

        {/* =========================================================
            FAIXA DESTAQUES
        ========================================================= */}

        <section
          className="bg-[#1B2E26] text-white border-y border-[#1B2E26]"
          aria-label="Destaques"
        >
          <div className="
            max-w-7xl
            mx-auto
            grid
            grid-cols-1
            md:grid-cols-3
            divide-y
            md:divide-y-0
            md:divide-x
            divide-[#3CD099]/30
          ">

            <div className="
              py-4
              px-6
              flex
              items-center
              justify-center
              gap-2.5
              text-center
            ">
              <Sparkles
                size={16}
                className="text-[#3CD099] flex-shrink-0"
              />

              <span className="
                font-bold
                text-xs
                tracking-wide
                uppercase
                text-[#F8F6F0]
              ">
                Cuidado & Bem-Estar
              </span>
            </div>

            <div className="
              py-4
              px-6
              flex
              items-center
              justify-center
              gap-2.5
              text-center
            ">
              <Users
                size={16}
                className="text-[#3CD099] flex-shrink-0"
              />

              <span className="
                font-bold
                text-xs
                tracking-wide
                uppercase
                text-[#F8F6F0]
              ">
                Atendimento Acolhedor
              </span>
            </div>

            <div className="
              py-4
              px-6
              flex
              items-center
              justify-center
              gap-2.5
              text-center
            ">
              <Activity
                size={16}
                className="text-[#3CD099] flex-shrink-0"
              />

              <span className="
                font-bold
                text-xs
                tracking-wide
                uppercase
                text-[#F8F6F0]
              ">
                Saúde & Movimento
              </span>
            </div>

          </div>
        </section>

        {/* =========================================================
            SOBRE
        ========================================================= */}

        <section
          id="sobre"
          className="relative overflow-hidden bg-white py-12 sm:py-14 lg:py-16"
          aria-labelledby="sobre-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="
              grid
              lg:grid-cols-12
              gap-10
              lg:gap-14
              items-center
            ">

              {/* IMAGEM */}

              <div className="
                lg:col-span-6
                relative
                flex
                justify-center
              ">

                <div aria-hidden="true" className="absolute left-[8%] top-[8%] h-28 w-28 rounded-full border-[12px] border-[#DDF3E8]" />
                <div className="relative z-10 w-full max-w-[490px]">
                  <div className="overflow-hidden rounded-[46%_54%_48%_52%/42%_44%_56%_58%] bg-[#F7F2E9] p-2">
                    <ImageWithFallback
                      src={aboutImage}
                      alt="Atendimento de Pilates e fisioterapia na FISA Saúde"
                      className="h-[300px] w-full rounded-[46%_54%_48%_52%/42%_44%_56%_58%] object-cover sm:h-[350px] lg:h-[390px]"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute left-0 top-[18%] max-w-[190px] rounded-lg bg-[#F07E5B] px-4 py-3 text-white shadow-lg sm:-left-3">
                    <div className="flex items-center gap-2 text-xs font-bold"><Heart size={17} aria-hidden="true" /> Cuidado que acolhe</div>
                    <p className="mt-1 text-[10px] leading-relaxed text-white/90">Seu bem-estar é parte do nosso movimento.</p>
                  </div>
                  <div aria-hidden="true" className="absolute -bottom-2 right-[8%] h-16 w-16 rounded-full border-[5px] border-[#65D4B0]/80" />
                </div>

              </div>

              {/* TEXTO */}

              <div className="
                lg:col-span-6
                space-y-5
              ">

                <div className="
                  inline-flex
                  items-center
                  gap-1.5
                  bg-[#FF6954]/10
                  text-[#FF6954]
                  px-3.5
                  py-1
                  rounded-full
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-wider
                ">
                  <Users
                    size={13}
                    aria-hidden="true"
                  />

                  Sobre a FISA Saúde
                </div>

                <h2
                  id="sobre-heading"
                  className="
                    text-2xl
                    sm:text-3xl
                    lg:text-4xl
                    font-extrabold
                    text-[#1B2E26]
                    tracking-tight
                    leading-tight
                  "
                >
                  Conheça a{' '}

                  <span className="text-[#009386]">
                    FISA Saúde
                  </span>
                </h2>

                <p className="
                  text-sm
                  sm:text-base
                  text-[#56635C]
                  leading-relaxed
                ">
                  Na <strong className="text-[#1B2E26]">Fisa Saúde</strong>,
                  no Tatuapé, acreditamos que cuidar vai muito além de tratar
                  sintomas. Cada pessoa que chega até nós traz uma história,
                  desafios e objetivos únicos, por isso escolhemos olhar cada
                  paciente de forma integral, respeitando sua individualidade
                  e compreendendo que reabilitar é também acolher.
                </p>

                <p className="
                  text-sm
                  sm:text-base
                  text-[#56635C]
                  leading-relaxed
                ">
                  Nosso compromisso é unir excelência técnica, escuta atenta
                  e um cuidado genuinamente humano, porque acreditamos que
                  pequenos gestos também fazem parte do processo de saúde.
                  Mais do que aliviar dores ou recuperar funções, queremos
                  ajudar cada pessoa a conquistar autonomia, confiança e
                  qualidade de vida. Cuidar, para nós, é enxergar a pessoa
                  antes da condição que ela apresenta.
                </p>

                <div className="
                  grid
                  sm:grid-cols-2
                  gap-3
                  pt-2
                ">

                  <div className="flex gap-3 items-start rounded-xl bg-[#F7F4ED] p-3">

                    <div className="
                      w-9
                      h-9
                      bg-[#009386]
                      rounded-full
                      flex
                      items-center
                      justify-center
                      flex-shrink-0
                      text-white
                      shadow-sm
                    ">
                      <CheckCircle
                        size={18}
                        aria-hidden="true"
                      />
                    </div>

                    <div>
                      <h3 className="
                        text-sm
                        font-bold
                        text-[#1B2E26]
                      ">
                        Atendimento Humanizado
                      </h3>

                      <p className="
                        text-xs
                        text-[#56635C]
                      ">
                        Cuidado individualizado e acolhedor
                      </p>
                    </div>

                  </div>

                  <div className="flex gap-3 items-start rounded-xl bg-[#F7F4ED] p-3">

                    <div className="
                      w-9
                      h-9
                      bg-[#FF6954]
                      rounded-full
                      flex
                      items-center
                      justify-center
                      flex-shrink-0
                      text-white
                      shadow-sm
                    ">
                      <Users
                        size={18}
                        aria-hidden="true"
                      />
                    </div>

                    <div>
                      <h3 className="
                        text-sm
                        font-bold
                        text-[#1B2E26]
                      ">
                        Profissionais Qualificados
                      </h3>

                      <p className="
                        text-xs
                        text-[#56635C]
                      ">
                        Equipe especializada em Pilates
                      </p>
                    </div>

                  </div>

                  <div className="flex gap-3 items-start rounded-xl bg-[#F7F4ED] p-3">

                    <div className="
                      w-9
                      h-9
                      bg-[#9E2A43]
                      rounded-full
                      flex
                      items-center
                      justify-center
                      flex-shrink-0
                      text-white
                      shadow-sm
                    ">
                      <Shield
                        size={18}
                        aria-hidden="true"
                      />
                    </div>

                    <div>
                      <h3 className="
                        text-sm
                        font-bold
                        text-[#1B2E26]
                      ">
                        Ambiente Seguro
                      </h3>

                      <p className="
                        text-xs
                        text-[#56635C]
                      ">
                        Infraestrutura moderna e acolhedora
                      </p>
                    </div>

                  </div>

                  <div className="flex gap-3 items-start rounded-xl bg-[#F7F4ED] p-3">

                    <div className="
                      w-9
                      h-9
                      bg-[#3CD099]
                      rounded-full
                      flex
                      items-center
                      justify-center
                      flex-shrink-0
                      text-[#0E2820]
                      shadow-sm
                    ">
                      <Heart
                        size={18}
                        aria-hidden="true"
                      />
                    </div>

                    <div>
                      <h3 className="
                        text-sm
                        font-bold
                        text-[#1B2E26]
                      ">
                        Foco em Saúde
                      </h3>

                      <p className="
                        text-xs
                        text-[#56635C]
                      ">
                        Bem-estar integral através do movimento
                      </p>
                    </div>

                  </div>

                </div>

                <div className="pt-3">

                  <button
                    onClick={() =>
                      handleWhatsAppClick(
                        'Olá! Quero agendar uma aula experimental de pilates na Fisa Saúde, no Tatuapé.'
                      )
                    }
                    className="
                      bg-[#FF6954]
                      hover:bg-[#E8533E]
                      text-white
                      px-6
                      py-2.5
                      rounded-full
                      uppercase
                      tracking-wider
                      text-xs
                      font-bold
                      transition-all
                      shadow-md
                      hover:scale-105
                    "
                  >
                    Agendar Aula Experimental
                  </button>

                </div>

              </div>

            </div>

          </div>
        </section>

        {/* =========================================================
            SERVIÇOS
        ========================================================= */}

        <section
          id="servicos"
          className="
            relative
            overflow-hidden
            py-12 sm:py-14 lg:py-16
            bg-white
            border-y
            border-[#E3DEC9]
          "
          aria-labelledby="servicos-heading"
        >
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-12 h-64 w-64 rounded-full border-[28px] border-[#FF6954]/[0.07]" />
          <div aria-hidden="true" className="pointer-events-none absolute -left-20 bottom-8 h-44 w-44 rounded-full border-[20px] border-[#009386]/[0.07]" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="
              text-center
              max-w-3xl
              mx-auto
              mb-12
            ">

              <div className="
                inline-flex
                items-center
                gap-1.5
                bg-[#009386]/10
                text-[#007491]
                px-3.5
                py-1
                rounded-full
                text-[11px]
                font-semibold
                uppercase
                tracking-wider
                mb-3
              ">
                <Star
                  size={13}
                  aria-hidden="true"
                />

                Nossos Serviços
              </div>

              <h2
                id="servicos-heading"
                className="
                  text-2xl
                  sm:text-3xl
                  lg:text-4xl
                  font-extrabold
                  text-[#1B2E26]
                  tracking-tight
                  mb-4
                "
              >
                Nossos Serviços de Pilates
              </h2>

              <p className="
                text-sm
                sm:text-base
                text-[#56635C]
                leading-relaxed
              ">
                Cuidado pensado para o seu momento, seus objetivos e seu ritmo.
                Conheça as opções de Pilates e fisioterapia e encontre com a
                nossa equipe o acompanhamento mais adequado para você.
              </p>

              <div className="
                mt-6
                pt-5
                border-t
                border-[#E3DEC9]
              ">

                <h3 className="
                  text-lg
                  font-bold
                  text-[#1B2E26]
                  mb-1.5
                ">
                  Não sabe por onde começar?
                </h3>

                <p className="
                  text-sm
                  sm:text-base
                  text-[#56635C]
                  leading-relaxed
                ">
                  Está sentindo dor, recuperando-se de uma lesão ou quer se
                  movimentar com mais segurança? Converse com a equipe para
                  entender qual atendimento faz sentido para sua necessidade.
                </p>

              </div>

            </div>

            <div className="
              grid
              sm:grid-cols-2
              lg:grid-cols-3
              gap-4
              sm:gap-5
            ">

              {COMPANY.services.map((service, index) => {
                const iconColors = [
                  'bg-[#009386]',
                  'bg-[#FF6954]',
                  'bg-[#007491]',
                  'bg-[#9E2A43]',
                  'bg-[#3CD099] text-[#0E2820]',
                  'bg-[#5168AB]',
                ];
                const activeColor = iconColors[index % iconColors.length];

                return (
                  <div
                    key={index}
                    className="
                      bg-white
                      rounded-2xl
                      p-5 sm:p-6
                      border
                      border-[#E3DEC9]
                      hover:border-[#009386]
                      hover:shadow-lg
                      transition-all
                      flex
                      flex-col
                      items-center
                      text-center
                      group
                      shadow-sm
                    "
                  >

                    <div className={`
                      w-12
                      h-12
                      ${activeColor}
                      rounded-full
                      flex
                      items-center
                      justify-center
                      text-white
                      mb-5
                      group-hover:scale-110
                      transition-transform
                      shadow-sm
                    `}>
                      {getServiceIcon(service)}
                    </div>

                    <h3 className="
                      text-base
                      font-bold
                      text-[#1B2E26]
                      mb-2
                    ">
                      {service}
                    </h3>

                    <p className="
                      text-[#56635C]
                      text-xs
                      sm:text-sm
                      leading-relaxed
                    ">
                      {service === 'Pilates Individual' &&
                        'Aulas exclusivas com atenção total às suas necessidades e objetivos específicos.'}

                      {service === 'Pilates em Pequenos Grupos' &&
                        'Turmas reduzidas que garantem acompanhamento próximo e personalizado.'}

                      {service === 'Reabilitação Física' &&
                        'Recuperação de lesões e cirurgias com acompanhamento especializado e seguro.'}

                      {service === 'Fortalecimento Muscular' &&
                        'Desenvolvimento de força, resistência e tônus muscular de forma equilibrada.'}

                      {service === 'Qualidade de Vida' &&
                        'Melhora da postura, flexibilidade e bem-estar no dia a dia.'}

                      {service === 'Acompanhamento Personalizado' &&
                        'Planejamento individualizado que evolui junto com seus progressos.'}
                    </p>

                  </div>
                );
              })}

            </div>

            <div className="text-center mt-7">

              <button
                onClick={() =>
                  handleWhatsAppClick(
                    'Olá! Quero agendar uma aula experimental de pilates na Fisa Saúde, no Tatuapé.'
                  )
                }
                className="
                  bg-[#FF6954]
                  hover:bg-[#E8533E]
                  text-white
                  px-7
                  py-3
                  rounded-full
                  uppercase
                  tracking-wider
                  text-xs
                  font-bold
                  transition-all
                  shadow-md
                  hover:scale-105
                "
              >
                Falar com a Equipe no WhatsApp
              </button>

            </div>

          </div>
        </section>

        {/* =========================================================
            SEO LOCAL
        ========================================================= */}

        <section
          className="
            relative
            overflow-hidden
            py-12 sm:py-14 lg:py-16
            bg-[#F8F6F0]
            border-y
            border-[#E3DEC9]
          "
          aria-labelledby="seo-local-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* CABEÇALHO */}

            <div className="
              text-left
              max-w-4xl
              mx-0
              mb-10
              sm:mb-12
            ">

              <div className="
                inline-flex
                items-center
                gap-1.5
                bg-[#009386]/10
                text-[#007491]
                px-3.5
                py-1
                rounded-full
                text-[11px]
                font-semibold
                uppercase
                tracking-wider
                mb-3
              ">
                <MapPin
                  size={13}
                  aria-hidden="true"
                />

                Fisa Saúde • Tatuapé
              </div>

              <h2
                id="seo-local-heading"
                className="
                  text-2xl
                  sm:text-3xl
                  lg:text-4xl
                  font-extrabold
                  text-[#1B2E26]
                  tracking-tight
                  mb-4
                "
              >
                Cuidar do corpo também é{' '}

                <span className="text-[#009386]">
                  cuidar de você.
                </span>
              </h2>

              <p className="
                text-sm
                sm:text-base
                text-[#56635C]
                leading-relaxed
              ">
                Pilates e fisioterapia no Tatuapé, com atendimento próximo,
                seguro e pensado para acompanhar cada pessoa em sua jornada.
              </p>

            </div>

            {/* CONTEÚDO */}

            <div className="
              grid
              lg:grid-cols-12
              gap-6
              lg:gap-8
              items-stretch
            ">

              {/* TEXTO */}

              <div className="
                lg:col-span-7
                bg-white
                rounded-3xl
                p-6
                sm:p-8
                lg:p-9
                border
                border-[#E3DEC9]
                shadow-sm
              ">

                <div className="
                  space-y-4
                  text-sm
                  sm:text-base
                  text-[#56635C]
                  leading-relaxed
                ">

                  <p>
                    Quem busca{' '}
                    <strong className="text-[#1B2E26]">
                      pilates na região do Tatuapé
                    </strong>{' '}
                    encontra na Fisa Saúde um espaço para fortalecer o corpo
                    com segurança, melhorar a postura e reduzir dores do dia
                    a dia, com turmas reduzidas e atendimento individual
                    quando necessário.
                  </p>

                  <p>
                    Também oferecemos{' '}
                    <strong className="text-[#1B2E26]">
                      fisioterapia em São Paulo
                    </strong>
                    , na Zona Leste de SP, para reabilitação, pós-operatório
                    e prevenção de lesões. O objetivo é simples: ajudar você
                    a se mover melhor, com acompanhamento profissional.
                  </p>

                  <p>
                    Somos uma{' '}
                    <strong className="text-[#1B2E26]">
                      clínica de pilates na Zona Leste
                    </strong>
                    , com endereço fixo na Rua Itapura, no bairro Tatuapé.
                    Uma localização de fácil acesso para quem mora ou trabalha
                    na região.
                  </p>

                  <p>
                    Se você não sabe por onde começar, podemos orientar.
                    Agende uma aula experimental ou uma avaliação e converse
                    com nossa equipe pelo WhatsApp.
                  </p>

                </div>

                {/* LOCALIZAÇÃO */}

                <div className="
                  mt-7
                  pt-5
                  border-t
                  border-[#E3DEC9]
                  flex
                  items-center
                  gap-3
                ">

                  <div className="
                    w-10
                    h-10
                    rounded-full
                    bg-[#009386]
                    flex
                    items-center
                    justify-center
                    flex-shrink-0
                    text-white
                    shadow-sm
                  ">
                    <MapPin
                      size={18}
                      aria-hidden="true"
                    />
                  </div>

                  <div>

                    <span className="
                      block
                      text-[10px]
                      uppercase
                      tracking-wider
                      font-bold
                      text-[#56635C]
                    ">
                      Nossa localização
                    </span>

                    <span className="
                      text-sm
                      font-bold
                      text-[#1B2E26]
                    ">
                      Rua Itapura • Tatuapé • São Paulo
                    </span>

                  </div>

                </div>

              </div>

              {/* CARDS LATERAIS */}

              <div className="
                lg:col-span-5
                grid
                sm:grid-cols-2
                lg:grid-cols-1
                gap-4
              ">

                {/* PILATES */}

                <div className="
                  bg-white
                  rounded-3xl
                  p-6
                  border
                  border-[#E3DEC9]
                  shadow-sm
                  flex
                  items-start
                  gap-4
                  hover:border-[#009386]
                  hover:shadow-md
                  transition-all
                ">

                  <div className="
                    w-11
                    h-11
                    rounded-full
                    bg-[#009386]
                    flex
                    items-center
                    justify-center
                    text-white
                    flex-shrink-0
                    shadow-sm
                  ">
                    <Activity
                      size={19}
                      aria-hidden="true"
                    />
                  </div>

                  <div>

                    <h3 className="
                      text-sm
                      sm:text-base
                      font-bold
                      text-[#1B2E26]
                      mb-1
                    ">
                      Pilates no Tatuapé
                    </h3>

                    <p className="
                      text-xs
                      sm:text-sm
                      text-[#56635C]
                      leading-relaxed
                    ">
                      Exercícios adaptados às suas necessidades, com
                      acompanhamento próximo e foco em saúde e movimento.
                    </p>

                  </div>

                </div>

                {/* FISIOTERAPIA */}

                <div className="
                  bg-white
                  rounded-3xl
                  p-6
                  border
                  border-[#E3DEC9]
                  shadow-sm
                  flex
                  items-start
                  gap-4
                  hover:border-[#FF6954]
                  hover:shadow-md
                  transition-all
                ">

                  <div className="
                    w-11
                    h-11
                    rounded-full
                    bg-[#FF6954]
                    flex
                    items-center
                    justify-center
                    text-white
                    flex-shrink-0
                    shadow-sm
                  ">
                    <Stethoscope
                      size={19}
                      aria-hidden="true"
                    />
                  </div>

                  <div>

                    <h3 className="
                      text-sm
                      sm:text-base
                      font-bold
                      text-[#1B2E26]
                      mb-1
                    ">
                      Fisioterapia na Zona Leste
                    </h3>

                    <p className="
                      text-xs
                      sm:text-sm
                      text-[#56635C]
                      leading-relaxed
                    ">
                      Atendimento para reabilitação, pós-operatório, dores,
                      lesões e prevenção.
                    </p>

                  </div>

                </div>

                {/* CUIDADO */}

                <div className="
                  bg-white
                  rounded-3xl
                  p-6
                  border
                  border-[#E3DEC9]
                  shadow-sm
                  flex
                  items-start
                  gap-4
                  hover:border-[#9E2A43]
                  hover:shadow-md
                  transition-all
                  sm:col-span-2
                  lg:col-span-1
                ">

                  <div className="
                    w-11
                    h-11
                    rounded-full
                    bg-[#9E2A43]
                    flex
                    items-center
                    justify-center
                    text-white
                    flex-shrink-0
                    shadow-sm
                  ">
                    <Heart
                      size={19}
                      aria-hidden="true"
                    />
                  </div>

                  <div>

                    <h3 className="
                      text-sm
                      sm:text-base
                      font-bold
                      text-[#1B2E26]
                      mb-1
                    ">
                      Cuidado perto de você
                    </h3>

                    <p className="
                      text-xs
                      sm:text-sm
                      text-[#56635C]
                      leading-relaxed
                    ">
                      Um espaço acolhedor para quem vive ou trabalha no
                      Tatuapé e busca cuidar da saúde sem precisar ir longe.
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* CTA */}

            <div className="text-center mt-9">

              <button
                onClick={() =>
                  handleWhatsAppClick(
                    'Olá! Gostaria de saber mais sobre Pilates e fisioterapia na Fisa Saúde, no Tatuapé.'
                  )
                }
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  bg-[#FF6954]
                  hover:bg-[#E8533E]
                  text-white
                  px-7
                  py-3
                  rounded-full
                  uppercase
                  tracking-wider
                  text-xs
                  font-bold
                  transition-all
                  shadow-md
                  hover:scale-105
                  active:scale-95
                "
                aria-label="Falar com a equipe da Fisa Saúde pelo WhatsApp"
              >
                <Phone
                  size={14}
                  aria-hidden="true"
                />

                Falar com a equipe

                <ArrowRight
                  size={14}
                  aria-hidden="true"
                />
              </button>

            </div>

          </div>
        </section>

        {/* =========================================================
            DIFERENCIAIS
        ========================================================= */}

        <section
          id="diferenciais"
          className="relative overflow-hidden bg-[#F8F6F0] py-12 sm:py-14 lg:py-16"
          aria-labelledby="diferenciais-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="
              text-left
              max-w-4xl
              mx-0
              mb-10
              border-l-4
              border-[#FF6954]
              pl-5
              sm:pl-7
            ">

              <div className="
                inline-flex
                items-center
                gap-1.5
                bg-[#009386]/10
                text-[#007491]
                px-3.5
                py-1
                rounded-full
                text-[11px]
                font-semibold
                uppercase
                tracking-wider
                mb-3
              ">
                <Award
                  size={13}
                  aria-hidden="true"
                />

                Nossos Diferenciais
              </div>

              <h2
                id="diferenciais-heading"
                className="
                  text-2xl
                  sm:text-3xl
                  lg:text-4xl
                  font-extrabold
                  text-[#1B2E26]
                  tracking-tight
                  mb-4
                "
              >
                Benefícios do Pilates
              </h2>

              <p className="
                text-sm
                sm:text-base
                text-[#56635C]
                max-w-3xl
                leading-relaxed
              ">
                O pilates na região do Tatuapé ajuda a fortalecer o corpo
                com baixo impacto, melhorar a postura e aliviar tensões
                do cotidiano. Na Fisa Saúde, no bairro Tatuapé, os exercícios
                são adaptados à sua condição, com acompanhamento próximo
                para quem busca mais disposição na Zona Leste de SP.
              </p>

            </div>

            <div className="
              grid
              md:grid-cols-2
              md:gap-x-12
              gap-x-8
              gap-y-0
            ">

              <div className="
                group
                flex
                items-start
                gap-4
                border-b
                border-[#D8D2C5]
                py-5
                sm:py-6
                transition-colors
              ">
                <div className="
                  w-11
                  h-11
                  shrink-0
                  bg-[#009386]
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  text-white
                  shadow-sm
                ">
                  <CheckCircle
                    size={22}
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0 flex-1 pt-0.5">
                  <h3 className="
                  text-base
                  font-bold
                  text-[#1B2E26]
                  transition-colors
                  group-hover:text-[#007491]
                ">
                    Melhora da Postura
                  </h3>

                  <p className="
                  text-xs
                  sm:text-sm
                  text-[#56635C]
                  leading-relaxed
                ">
                    Correção postural e alinhamento corporal adequado.
                  </p>
                </div>
              </div>

              <div className="
                group
                flex
                items-start
                gap-4
                border-b
                border-[#D8D2C5]
                py-5
                sm:py-6
                transition-colors
              ">
                <div className="
                  w-11
                  h-11
                  shrink-0
                  bg-[#FF6954]
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  text-white
                  shadow-sm
                ">
                  <Dumbbell
                    size={22}
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0 flex-1 pt-0.5">
                  <h3 className="
                  text-base
                  font-bold
                  text-[#1B2E26]
                  transition-colors
                  group-hover:text-[#007491]
                ">
                    Fortalecimento Muscular
                  </h3>

                  <p className="
                  text-xs
                  sm:text-sm
                  text-[#56635C]
                  leading-relaxed
                ">
                    Desenvolvimento equilibrado de força e resistência.
                  </p>
                </div>
              </div>

              <div className="
                group
                flex
                items-start
                gap-4
                border-b
                border-[#D8D2C5]
                py-5
                sm:py-6
                transition-colors
              ">
                <div className="
                  w-11
                  h-11
                  shrink-0
                  bg-[#9E2A43]
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  text-white
                  shadow-sm
                ">
                  <Activity
                    size={22}
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0 flex-1 pt-0.5">
                  <h3 className="
                  text-base
                  font-bold
                  text-[#1B2E26]
                  transition-colors
                  group-hover:text-[#007491]
                ">
                    Alívio de Dores
                  </h3>

                  <p className="
                  text-xs
                  sm:text-sm
                  text-[#56635C]
                  leading-relaxed
                ">
                    Redução de dores crônicas e desconfortos musculares.
                  </p>
                </div>
              </div>

              <div className="
                group
                flex
                items-start
                gap-4
                border-b
                border-[#D8D2C5]
                py-5
                sm:py-6
                transition-colors
              ">
                <div className="
                  w-11
                  h-11
                  shrink-0
                  bg-[#3CD099]
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  text-[#0E2820]
                  shadow-sm
                ">
                  <Sparkles
                    size={22}
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0 flex-1 pt-0.5">
                  <h3 className="
                  text-base
                  font-bold
                  text-[#1B2E26]
                  transition-colors
                  group-hover:text-[#007491]
                ">
                    Aumento da Mobilidade
                  </h3>

                  <p className="
                  text-xs
                  sm:text-sm
                  text-[#56635C]
                  leading-relaxed
                ">
                    Mais flexibilidade e amplitude de movimento.
                  </p>
                </div>
              </div>

              <div className="
                group
                flex
                items-start
                gap-4
                border-b
                border-[#D8D2C5]
                py-5
                sm:py-6
                transition-colors
              ">
                <div className="
                  w-11
                  h-11
                  shrink-0
                  bg-[#007491]
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  text-white
                  shadow-sm
                ">
                  <Shield
                    size={22}
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0 flex-1 pt-0.5">
                  <h3 className="
                  text-base
                  font-bold
                  text-[#1B2E26]
                  transition-colors
                  group-hover:text-[#007491]
                ">
                    Prevenção de Lesões
                  </h3>

                  <p className="
                  text-xs
                  sm:text-sm
                  text-[#56635C]
                  leading-relaxed
                ">
                    Exercícios seguros que protegem seu corpo.
                  </p>
                </div>
              </div>

              <div className="
                group
                flex
                items-start
                gap-4
                border-b
                border-[#D8D2C5]
                py-5
                sm:py-6
                transition-colors
              ">
                <div className="
                  w-11
                  h-11
                  shrink-0
                  bg-[#5168AB]
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  text-white
                  shadow-sm
                ">
                  <Heart
                    size={22}
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0 flex-1 pt-0.5">
                  <h3 className="
                  text-base
                  font-bold
                  text-[#1B2E26]
                  transition-colors
                  group-hover:text-[#007491]
                ">
                    Mais Qualidade de Vida
                  </h3>

                  <p className="
                  text-xs
                  sm:text-sm
                  text-[#56635C]
                  leading-relaxed
                ">
                    Bem-estar físico e mental no dia a dia.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* =========================================================
            FAQ — DÚVIDAS FREQUENTES
        ========================================================= */}

        <section
          id="faq"
          className="relative isolate overflow-hidden border-y border-[#E3DEC9] bg-[#EEF0F4] py-12 sm:py-16 lg:py-20"
          aria-labelledby="faq-heading"
        >
          {/* Círculos decorativos suaves para conectar visualmente as seções */}
          <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full border-[28px] border-[#009386]/[0.07]" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-[-5rem] h-72 w-72 rounded-full border-[34px] border-[#FF6954]/[0.08]" />

          <div className="relative mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:gap-14 lg:px-8">
            {/* Coluna de apresentação e contato */}
            <div className="flex flex-col items-start justify-between gap-8 lg:py-3">
              <div>
                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#009386]/15 bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#00796F]">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#FF6954]" />
                  Dúvidas frequentes
                </span>
                <h2
                  id="faq-heading"
                  className="max-w-sm text-3xl font-extrabold leading-[1.08] tracking-tight text-[#1B2E26] sm:text-4xl"
                >
                  Como podemos <span className="text-[#009386]">ajudar?</span>
                </h2>
                <p className="mt-4 max-w-sm text-sm leading-6 text-[#56635C] sm:text-base">
                  Reunimos as principais informações para você conhecer a FISA Saúde e se preparar para o seu atendimento.
                </p>
              </div>

              <div className="w-full rounded-2xl border border-white bg-white/75 p-5 shadow-sm sm:max-w-sm sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF0E9] text-[#E8533E]">
                    <Phone size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#1B2E26]">Ainda ficou com alguma dúvida?</h3>
                    <p className="mt-1 text-xs leading-5 text-[#56635C]">
                      Nossa equipe pode orientar você sobre horários, atendimentos e agendamento.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleWhatsAppClick('Olá! Tenho uma dúvida sobre os atendimentos da Fisa Saúde.')}
                  className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#FF6954] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#E8533E] focus:outline-none focus:ring-2 focus:ring-[#FF6954] focus:ring-offset-2"
                >
                  Fale com a nossa equipe <ArrowRight size={15} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Lista de perguntas */}
            <div className="rounded-[1.5rem] border border-white/80 bg-white p-3 shadow-[0_20px_60px_rgba(27,46,38,0.07)] sm:rounded-[1.75rem] sm:p-5 lg:p-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="onde" className="mb-2 overflow-hidden rounded-xl border-0 bg-[#F7F7F9] px-3 sm:px-4">
                  <AccordionTrigger className="gap-3 py-4 text-left text-[13px] font-semibold text-[#1B2E26] hover:no-underline hover:text-[#009386] sm:text-sm [&>svg]:h-4 [&>svg]:w-4">
                    <span className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="shrink-0 font-medium tabular-nums text-[#8B8B9B]">01</span>
                      <span>Onde fica a clínica de pilates no Tatuapé?</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 pl-9 text-xs leading-6 text-[#626270] sm:text-sm">
                    Na Rua Itapura, 1182, Tatuapé, Zona Leste de São Paulo. Abra o perfil no{' '}
                    <a href={COMPANY.maps.profileUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#00877D] underline-offset-4 hover:underline">Google Maps</a>
                    {' '}para traçar a rota.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="experimental" className="mb-2 overflow-hidden rounded-xl border-0 bg-[#F7F7F9] px-3 sm:px-4">
                  <AccordionTrigger className="gap-3 py-4 text-left text-[13px] font-semibold text-[#1B2E26] hover:no-underline hover:text-[#009386] sm:text-sm [&>svg]:h-4 [&>svg]:w-4">
                    <span className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="shrink-0 font-medium tabular-nums text-[#8B8B9B]">02</span>
                      <span>Vocês têm aula experimental de pilates?</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 pl-9 text-xs leading-6 text-[#626270] sm:text-sm">
                    Sim! Chame a equipe pelo WhatsApp para consultar os horários e combinar sua aula experimental.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="convenio" className="mb-2 overflow-hidden rounded-xl border-0 bg-[#F7F7F9] px-3 sm:px-4">
                  <AccordionTrigger className="gap-3 py-4 text-left text-[13px] font-semibold text-[#1B2E26] hover:no-underline hover:text-[#009386] sm:text-sm [&>svg]:h-4 [&>svg]:w-4">
                    <span className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="shrink-0 font-medium tabular-nums text-[#8B8B9B]">03</span>
                      <span>A Fisa Saúde atende convênio?</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 pl-9 text-xs leading-6 text-[#626270] sm:text-sm">
                    A FISA também está listada no Wellhub e na TotalPass. A disponibilidade depende das regras de cada plataforma; confira os detalhes nos perfis ou fale com a recepção pelo WhatsApp.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="valor" className="mb-2 overflow-hidden rounded-xl border-0 bg-[#F7F7F9] px-3 sm:px-4">
                  <AccordionTrigger className="gap-3 py-4 text-left text-[13px] font-semibold text-[#1B2E26] hover:no-underline hover:text-[#009386] sm:text-sm [&>svg]:h-4 [&>svg]:w-4">
                    <span className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="shrink-0 font-medium tabular-nums text-[#8B8B9B]">04</span>
                      <span>Qual o valor do pilates e da fisioterapia?</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 pl-9 text-xs leading-6 text-[#626270] sm:text-sm">
                    Os valores variam conforme o atendimento e a frequência. Envie uma mensagem para receber as opções atualizadas.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="fisio" className="mb-2 overflow-hidden rounded-xl border-0 bg-[#F7F7F9] px-3 sm:px-4">
                  <AccordionTrigger className="gap-3 py-4 text-left text-[13px] font-semibold text-[#1B2E26] hover:no-underline hover:text-[#009386] sm:text-sm [&>svg]:h-4 [&>svg]:w-4">
                    <span className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="shrink-0 font-medium tabular-nums text-[#8B8B9B]">05</span>
                      <span>Fazem fisioterapia na Zona Leste?</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 pl-9 text-xs leading-6 text-[#626270] sm:text-sm">
                    Sim. Atendemos fisioterapia e reabilitação no Tatuapé, com foco em dores, postura, pós-operatório e retorno seguro ao movimento.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="avaliacao" className="mb-2 overflow-hidden rounded-xl border-0 bg-[#F7F7F9] px-3 sm:px-4">
                  <AccordionTrigger className="gap-3 py-4 text-left text-[13px] font-semibold text-[#1B2E26] hover:no-underline hover:text-[#009386] sm:text-sm [&>svg]:h-4 [&>svg]:w-4">
                    <span className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="shrink-0 font-medium tabular-nums text-[#8B8B9B]">06</span>
                      <span>Como agendar uma avaliação de fisioterapia?</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 pl-9 text-xs leading-6 text-[#626270] sm:text-sm">
                    Clique em “Consultar horários” ou envie uma mensagem pelo WhatsApp. A equipe orienta você sobre os próximos horários disponíveis.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="horario" className="overflow-hidden rounded-xl border-0 bg-[#F7F7F9] px-3 sm:px-4">
                  <AccordionTrigger className="gap-3 py-4 text-left text-[13px] font-semibold text-[#1B2E26] hover:no-underline hover:text-[#009386] sm:text-sm [&>svg]:h-4 [&>svg]:w-4">
                    <span className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="shrink-0 font-medium tabular-nums text-[#8B8B9B]">07</span>
                      <span>Qual o horário de atendimento?</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 pl-9 text-xs leading-6 text-[#626270] sm:text-sm">
                    {COMPANY.schedule.weekdays}.{' '}{COMPANY.schedule.saturday}. Domingo fechado.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* =========================================================
            CTA — AGENDAMENTO
        ========================================================= */}

        <section className="bg-[#1B2E26] px-4 py-8 sm:px-6 sm:py-10">
          <div className="mx-auto max-w-6xl">
            <div className="relative overflow-hidden rounded-2xl bg-[#FF6954] px-5 py-6 text-white shadow-lg sm:px-8 sm:py-7 lg:flex lg:items-center lg:justify-between lg:gap-8">
              <div aria-hidden="true" className="absolute -right-8 -top-10 h-32 w-32 rounded-full border-[18px] border-white/10" />
              <div className="relative z-10 max-w-2xl">
                <span className="mb-2 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/90">
                  <Heart size={13} aria-hidden="true" />
                  Seu próximo passo começa aqui
                </span>
                <h2 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
                  Vamos cuidar do seu movimento?
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/95">
                  Tire suas dúvidas com a equipe e veja os horários disponíveis para uma aula experimental.
                </p>
              </div>
              <button
                onClick={() =>
                  handleWhatsAppClick(
                    'Olá! Quero saber os horários disponíveis para uma aula experimental de Pilates na FISA Saúde, no Tatuapé.'
                  )
                }
                className="relative z-10 mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-extrabold text-[#1B2E26] shadow-sm transition hover:bg-[#F8F6F0] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#FF6954] sm:w-auto lg:mt-0 lg:shrink-0"
                aria-label="Consultar horários para aula experimental pelo WhatsApp"
              >
                <Phone size={15} aria-hidden="true" />
                Consultar horários
                <ArrowRight size={15} aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================
            CONTATO E MAPA
        ========================================================= */}

        <section
          id="localizacao"
          className="
            relative
            overflow-hidden
            py-10
            sm:py-12
            lg:py-14
            bg-[#EAF3EF]
            border-t
            border-[#D5E3DB]
          "
          aria-labelledby="contato-heading"
        >
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-6 h-56 w-56 rounded-full border-[24px] border-[#009386]/[0.08]" />
          <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-[-4rem] h-64 w-64 rounded-full border-[30px] border-[#FF6954]/[0.07]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="
              text-left
              max-w-3xl
              mx-0
              mb-7
            ">

              <div className="
                inline-flex
                items-center
                gap-1.5
                bg-[#009386]/10
                text-[#007491]
                px-3.5
                py-1
                rounded-full
                text-[11px]
                font-semibold
                uppercase
                tracking-wider
                mb-3
              ">
                <MapPin
                  size={13}
                  aria-hidden="true"
                />

                Localização
              </div>

              <h2
                id="contato-heading"
                className="
                  text-2xl
                  sm:text-3xl
                  lg:text-4xl
                  font-extrabold
                  text-[#1B2E26]
                  tracking-tight
                  mb-3
                "
              >
                Onde estamos
              </h2>

              <p className="
                text-xs
                sm:text-sm
                text-[#56635C]
              ">
                Atendemos no bairro Tatuapé, Zona Leste de SP,
                com fácil acesso para moradores próximos.
              </p>

            </div>

            <div className="
              grid
              lg:grid-cols-[0.85fr_1.15fr]
              gap-5
              lg:gap-7
              items-stretch
            ">

              {/* INFORMAÇÕES */}

              <div className="
                bg-[#F8F6F0]
                rounded-2xl
                p-5 sm:p-6
                border
                border-[#E3DEC9]
                space-y-4
              ">

                <h3 className="
                  text-xl
                  font-bold
                  text-[#1B2E26]
                ">
                  Informações de Contato
                </h3>

                <div className="space-y-4">

                  <div className="
                    flex
                    items-start
                    gap-3.5
                  ">

                    <div className="
                      w-9
                      h-9
                      bg-[#009386]
                      rounded-full
                      flex
                      items-center
                      justify-center
                      flex-shrink-0
                      text-white
                      shadow-sm
                    ">
                      <MapPin
                        size={17}
                        aria-hidden="true"
                      />
                    </div>

                    <div>

                      <h4 className="
                        font-bold
                        text-xs
                        sm:text-sm
                        text-[#1B2E26]
                      ">
                        Endereço
                      </h4>

                      <p className="
                        text-xs
                        sm:text-sm
                        text-[#56635C]
                        leading-relaxed
                      ">
                        {COMPANY.address.full}
                      </p>

                    </div>

                  </div>

                  <div className="
                    flex
                    items-start
                    gap-3.5
                  ">

                    <div className="
                      w-9
                      h-9
                      bg-[#FF6954]
                      rounded-full
                      flex
                      items-center
                      justify-center
                      flex-shrink-0
                      text-white
                      shadow-sm
                    ">
                      <Phone
                        size={17}
                        aria-hidden="true"
                      />
                    </div>

                    <div>

                      <h4 className="
                        font-bold
                        text-xs
                        sm:text-sm
                        text-[#1B2E26]
                      ">
                        Telefone
                      </h4>

                      <a
                        href={`tel:${COMPANY.contact.phone}`}
                        className="
                          text-xs
                          sm:text-sm
                          text-[#009386]
                          font-semibold
                          hover:underline
                        "
                      >
                        {COMPANY.contact.phone}
                      </a>

                    </div>

                  </div>

                  <div className="
                    flex
                    items-start
                    gap-3.5
                  ">

                    <div className="
                      w-9
                      h-9
                      bg-[#9E2A43]
                      rounded-full
                      flex
                      items-center
                      justify-center
                      flex-shrink-0
                      text-white
                      shadow-sm
                    ">
                      <Mail
                        size={17}
                        aria-hidden="true"
                      />
                    </div>

                    <div>

                      <h4 className="
                        font-bold
                        text-xs
                        sm:text-sm
                        text-[#1B2E26]
                      ">
                        E-mail
                      </h4>

                      <a
                        href={`mailto:${COMPANY.contact.email}`}
                        className="
                          text-xs
                          sm:text-sm
                          text-[#009386]
                          font-semibold
                          hover:underline
                        "
                      >
                        {COMPANY.contact.email}
                      </a>

                    </div>

                  </div>

                </div>

                <div className="
                  pt-5
                  border-t
                  border-[#E3DEC9]
                ">

                  <h4 className="
                    font-bold
                    text-xs
                    sm:text-sm
                    text-[#1B2E26]
                    mb-1.5
                  ">
                    Horário de Atendimento
                  </h4>

                  <div className="
                    space-y-1
                    text-xs
                    text-[#56635C]
                  ">
                    <p>
                      {COMPANY.schedule.weekdays}
                    </p>

                    <p>
                      {COMPANY.schedule.saturday}
                    </p>
                  </div>

                </div>

                <a
                  href={COMPANY.maps.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-[#1B2E26] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#009386] focus:outline-none focus:ring-2 focus:ring-[#009386] focus:ring-offset-2"
                >
                  <MapPin size={15} aria-hidden="true" />
                  Traçar rota no Google Maps
                  <ArrowRight size={14} aria-hidden="true" />
                </a>

              </div>

              {/* MAPA */}

              <div className="
                relative
                rounded-3xl
                overflow-hidden
                shadow-lg
                border
                border-[#E3DEC9]
                h-[280px] sm:h-[320px] lg:h-full
                min-h-[280px]
                bg-[#EFEAD9]
              ">

                <iframe
                  src={COMPANY.maps.embedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localização FISA Saúde"
                  className="w-full h-full"
                />

                <a
                  href={COMPANY.maps.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    absolute
                    bottom-3
                    right-3
                    z-10
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    bg-white/95
                    backdrop-blur-sm
                    px-3.5
                    py-1.5
                    text-xs
                    font-bold
                    text-[#1B2E26]
                    shadow-md
                    border
                    border-[#E3DEC9]
                    hover:bg-[#009386]
                    hover:text-white
                    hover:scale-105
                    transition-all
                  "
                >
                  <MapPin
                    size={13}
                    className="text-[#FF6954]"
                    aria-hidden="true"
                  />

                  Abrir no Maps
                </a>

              </div>

            </div>

          </div>
        </section>

      </main>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer
        className="bg-[#12241D] text-white"
        role="contentinfo"
      >
        <div className="
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          py-10
          sm:py-14
        ">

          <div className="
            grid
            md:grid-cols-2
            lg:grid-cols-4
            gap-8
            lg:gap-12
          ">

            {/* MARCA */}

            <div>

              <div className="mb-5">
                <FisaLogo
                  size="lg"
                  tone="onDark"
                />
              </div>

              <p className="
                text-[#A2BAAF]
                leading-relaxed
                text-xs
                mb-5
              ">
                Clínica de pilates na zona leste, no bairro Tatuapé SP,
                promovendo saúde e bem-estar com excelência.
              </p>

              <div className="flex gap-2">

                <a
                  href="https://instagram.com/fisasaude"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    w-8
                    h-8
                    bg-white/10
                    hover:bg-[#FF6954]
                    rounded-full
                    flex
                    items-center
                    justify-center
                    transition-colors
                    text-white
                  "
                  aria-label="Instagram da FISA Saúde"
                >
                  <Instagram
                    size={16}
                    aria-hidden="true"
                  />
                </a>

                <a
                  href="https://facebook.com/fisasaude"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    w-8
                    h-8
                    bg-white/10
                    hover:bg-[#FF6954]
                    rounded-full
                    flex
                    items-center
                    justify-center
                    transition-colors
                    text-white
                  "
                  aria-label="Facebook da FISA Saúde"
                >
                  <Facebook
                    size={16}
                    aria-hidden="true"
                  />
                </a>

                <a
                  href={`https://wa.me/${COMPANY.contact.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    w-8
                    h-8
                    bg-white/10
                    hover:bg-[#FF6954]
                    rounded-full
                    flex
                    items-center
                    justify-center
                    transition-colors
                    text-white
                  "
                  aria-label="WhatsApp da FISA Saúde"
                >
                  <Phone
                    size={16}
                    aria-hidden="true"
                  />
                </a>

              </div>

            </div>

            {/* SERVIÇOS */}

            <div>

              <h3 className="
                font-bold
                text-xs
                uppercase
                tracking-wider
                mb-3.5
                text-[#3CD099]
              ">
                Serviços
              </h3>

              <ul className="space-y-2">

                {COMPANY.services.map(
                  (service, index) => (
                    <li key={index}>

                      <a
                        href="#servicos"
                        className="
                          text-[#A2BAAF]
                          hover:text-[#3CD099]
                          transition-colors
                          text-xs
                        "
                      >
                        {service}
                      </a>

                    </li>
                  )
                )}

              </ul>

            </div>

            {/* LINKS */}

            <div>

              <h3 className="
                font-bold
                text-xs
                uppercase
                tracking-wider
                mb-3.5
                text-[#3CD099]
              ">
                Links Rápidos
              </h3>

              <ul className="space-y-2">

                <li>
                  <a
                    href="#sobre"
                    className="
                      text-[#A2BAAF]
                      hover:text-[#3CD099]
                      transition-colors
                      text-xs
                    "
                  >
                    Sobre Nós
                  </a>
                </li>

                <li>
                  <a
                    href="#diferenciais"
                    className="
                      text-[#A2BAAF]
                      hover:text-[#3CD099]
                      transition-colors
                      text-xs
                    "
                  >
                    Diferenciais
                  </a>
                </li>

                <li>
                  <a
                    href="#depoimentos"
                    className="
                      text-[#A2BAAF]
                      hover:text-[#3CD099]
                      transition-colors
                      text-xs
                    "
                  >
                    Depoimentos
                  </a>
                </li>

                <li>
                  <a
                    href="/admin/login"
                    className="
                      text-[#A2BAAF]
                      hover:text-[#3CD099]
                      transition-colors
                      text-xs
                    "
                  >
                    Área do Profissional
                  </a>
                </li>

              </ul>

            </div>

            {/* CONTATO */}

            <div>

              <h3 className="
                font-bold
                text-xs
                uppercase
                tracking-wider
                mb-3.5
                text-[#3CD099]
              ">
                Contato
              </h3>

              <ul className="
                space-y-2
                text-xs
              ">

                <li className="
                  flex
                  items-start
                  gap-2
                ">
                  <MapPin
                    size={15}
                    className="
                      text-[#FF6954]
                      flex-shrink-0
                      mt-0.5
                    "
                    aria-hidden="true"
                  />

                  <span className="text-[#A2BAAF]">
                    {COMPANY.address.full}
                  </span>
                </li>

                <li className="
                  flex
                  items-center
                  gap-2
                ">
                  <Phone
                    size={15}
                    className="
                      text-[#FF6954]
                      flex-shrink-0
                    "
                    aria-hidden="true"
                  />

                  <a
                    href={`tel:+${COMPANY.contact.whatsapp}`}
                    className="
                      text-[#A2BAAF]
                      hover:text-white
                      transition-colors
                    "
                  >
                    {COMPANY.contact.phone}
                  </a>
                </li>

                <li className="
                  flex
                  items-center
                  gap-2
                ">
                  <Mail
                    size={15}
                    className="
                      text-[#FF6954]
                      flex-shrink-0
                    "
                    aria-hidden="true"
                  />

                  <a
                    href={`mailto:${COMPANY.contact.email}`}
                    className="
                      text-[#A2BAAF]
                      hover:text-white
                      transition-colors
                    "
                  >
                    {COMPANY.contact.email}
                  </a>
                </li>

              </ul>

              <button
                onClick={() => handleWhatsAppClick()}
                className="
                  mt-4
                  w-full
                  bg-[#FF6954]
                  hover:bg-[#E8533E]
                  text-white
                  py-2
                  rounded-full
                  uppercase
                  tracking-wider
                  text-xs
                  font-bold
                  transition-all
                  shadow-sm
                  flex
                  items-center
                  justify-center
                  gap-2
                "
                aria-label="Falar no WhatsApp"
              >
                <Phone
                  size={13}
                  aria-hidden="true"
                />

                WhatsApp
              </button>

            </div>

          </div>

          <div className="
            mt-10
            pt-5
            border-t
            border-white/10
            text-center
          ">

            <p className="
              text-[#6D8A7E]
              text-[11px]
            ">
              &copy; {new Date().getFullYear()}{' '}

              <strong className="text-[#3CD099]">
                FISA Saúde
              </strong>

              . Todos os direitos reservados.
            </p>

          </div>

        </div>
      </footer>

    </div>
  );
}