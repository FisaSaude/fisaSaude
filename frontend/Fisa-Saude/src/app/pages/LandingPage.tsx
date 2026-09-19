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
  const [isoOpen, setIsoOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('hero');

  const navLinks = [
    { id: 'hero', label: 'Início' },
    { id: 'sobre', label: 'Sobre Nós' },
    { id: 'servicos', label: 'Serviços' },
    { id: 'diferenciais', label: 'Diferenciais' },
    { id: 'faq', label: 'Dúvidas' },
    { id: 'localizacao', label: 'Localização' },
  ];

  useEffect(() => {
    const sectionIds = [
      'hero',
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
    <div className="min-h-screen bg-[#F8F6F0] text-[#1B2E26] font-sans antialiased selection:bg-[#3CD099]/40 selection:text-[#0E2820]">

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
            pt-4
            pb-10
            sm:pt-6
            sm:pb-12
            lg:pt-8
            lg:pb-16
          "
          aria-labelledby="hero-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="grid lg:grid-cols-12 gap-8 lg:gap-8 items-center">

              {/* CONTEÚDO */}

              <div className="lg:col-span-6 space-y-4 text-center lg:text-left">

                <div className="
                  inline-flex
                  items-center
                  gap-1.5
                  bg-[#009386]/15
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

                {/* STATS */}

                <div className="
                  grid
                  grid-cols-3
                  gap-4
                  pt-4
                  border-t
                  border-[#E3DEC9]
                ">

                  <div className="text-center lg:text-left">

                  </div>

                  <div className="text-center lg:text-left">

                  </div>

                  <div className="text-center lg:text-left">

                  </div>

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

                <div className="
                  absolute
                  right-0
                  bottom-0
                  w-64
                  h-64
                  sm:w-72
                  sm:h-72
                  bg-[#3CD099]
                  rounded-[32px]
                  -z-0
                  translate-x-2
                  translate-y-2
                " />

                <div className="
                  absolute
                  -right-3
                  bottom-6
                  w-20
                  h-20
                  sm:w-24
                  sm:h-24
                  bg-[#9E2A43]
                  rounded-tl-[36px]
                  rounded-br-[36px]
                  rounded-tr-[10px]
                  rounded-bl-[10px]
                  z-10
                " />

                <div className="
                  absolute
                  -left-2
                  top-1/4
                  w-12
                  h-12
                  bg-[#009386]
                  rounded-tl-[20px]
                  rounded-br-[20px]
                  rounded-tr-[6px]
                  rounded-bl-[6px]
                  z-10
                " />

                <div className="
                  relative
                  z-[5]
                  w-full
                  max-w-sm
                  sm:max-w-md
                  bg-white
                  rounded-t-[160px]
                  rounded-b-[28px]
                  overflow-hidden
                  shadow-xl
                  border-4
                  border-[#EBE5D3]
                  p-2
                ">
                  <div className="
                    rounded-t-[150px]
                    rounded-b-[22px]
                    overflow-hidden
                  ">
                    <ImageWithFallback
                      src={heroImage1}
                      alt="Clínica de pilates no Tatuapé"
                      className="w-full h-[320px] sm:h-[420px] object-cover"
                      loading="eager"
                      fetchPriority="high"
                    />
                  </div>
                </div>

                {/* ISO */}

                <Dialog
                  open={isoOpen}
                  onOpenChange={setIsoOpen}
                >
                  <div className="
                    absolute
                    -bottom-3
                    left-4
                    z-20
                  ">
                    <button
                      type="button"
                      onClick={() => setIsoOpen(true)}
                      title="Clique para saber mais"
                      aria-label="Certificada ISO 9001:2015. Clique para saber mais"
                      className="
                        bg-white/95
                        backdrop-blur-md
                        rounded-xl
                        p-2.5
                        shadow-md
                        border
                        border-[#E3DEC9]
                        cursor-pointer
                        text-left
                        transition-transform
                        hover:scale-105
                        flex
                        items-center
                        gap-2.5
                      "
                    >

                      <div className="
                        w-8
                        h-8
                        bg-[#009386]
                        rounded-lg
                        flex
                        items-center
                        justify-center
                        flex-shrink-0
                        text-white
                      ">
                        <Shield
                          size={16}
                          aria-hidden="true"
                        />
                      </div>

                      <div>

                        <div className="
                          text-[9px]
                          text-[#56635C]
                          uppercase
                          font-bold
                          tracking-wider
                        ">
                          Certificada
                        </div>

                        <div className="
                          text-xs
                          text-[#1B2E26]
                          font-bold
                          flex
                          items-center
                          gap-1
                        ">
                          ISO 9001:2015

                          <Info
                            size={11}
                            className="text-[#009386]"
                            aria-hidden="true"
                          />
                        </div>

                      </div>

                    </button>
                  </div>

                  <DialogContent className="
                    bg-[#F8F6F0]
                    rounded-2xl
                    max-w-[500px]
                    p-6
                    border
                    border-[#E3DEC9]
                  ">
                    <DialogHeader>

                      <DialogTitle className="
                        text-left
                        text-xl
                        font-bold
                        text-[#1B2E26]
                        leading-snug
                      ">
                        ISO 9001:2015, Sistema de Gestão da Qualidade
                      </DialogTitle>

                      <DialogDescription className="
                        text-left
                        text-sm
                        text-[#56635C]
                        leading-relaxed
                        pt-2
                      ">
                        A ISO 9001:2015 é uma certificação internacional
                        que garante que a empresa segue padrões rigorosos
                        de qualidade, organização de processos e melhoria
                        contínua. Isso significa mais segurança, eficiência
                        e confiança para os clientes.
                      </DialogDescription>

                    </DialogHeader>

                    <ul className="
                      list-disc
                      pl-5
                      space-y-1.5
                      text-[#1B2E26]
                      text-sm
                      pt-2
                    ">
                      <li>Padronização de processos</li>
                      <li>Foco na satisfação do cliente</li>
                      <li>Melhoria contínua</li>
                      <li>Gestão eficiente</li>
                    </ul>

                    <p className="text-xs text-[#56635C]">
                      Certificação reconhecida internacionalmente
                    </p>

                    <DialogFooter>

                      <DialogClose asChild>

                        <button
                          type="button"
                          className="
                            bg-[#FF6954]
                            hover:bg-[#E8533E]
                            text-white
                            px-5
                            py-1.5
                            rounded-full
                            uppercase
                            tracking-wider
                            text-xs
                            font-bold
                            shadow-sm
                          "
                        >
                          Fechar
                        </button>

                      </DialogClose>

                    </DialogFooter>

                  </DialogContent>
                </Dialog>

              </div>

            </div>
          </div>
        </section>

        {/* =========================================================
            FAIXA DESTAQUES
        ========================================================= */}

        <section
          className="bg-[#009386] text-white border-y border-[#007491]"
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
          className="py-14 sm:py-18 lg:py-20"
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

                <div className="
                  relative
                  z-10
                  w-full
                  max-w-md
                  bg-white
                  rounded-t-[180px]
                  rounded-b-[24px]
                  p-2
                  shadow-xl
                  border-4
                  border-[#EBE5D3]
                ">
                  <div className="
                    rounded-t-[170px]
                    rounded-b-[18px]
                    overflow-hidden
                  ">
                    <ImageWithFallback
                      src={aboutImage}
                      alt="Fisioterapia no Tatuapé São Paulo"
                      className="
                        w-full
                        h-[380px]
                        lg:h-[440px]
                        object-cover
                      "
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="
                  absolute
                  -bottom-3
                  left-6
                  w-14
                  h-14
                  bg-[#9E2A43]
                  rounded-tl-[20px]
                  rounded-br-[20px]
                  z-20
                " />

                <div className="
                  absolute
                  -top-3
                  -right-3
                  w-24
                  h-24
                  bg-[#009386]/20
                  rounded-full
                  -z-0
                " />

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
                  gap-4
                  pt-3
                ">

                  <div className="flex gap-3 items-start">

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

                  <div className="flex gap-3 items-start">

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

                  <div className="flex gap-3 items-start">

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

                  <div className="flex gap-3 items-start">

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
            py-14
            sm:py-18
            lg:py-20
            bg-[#EFEAD9]/60
            border-y
            border-[#E3DEC9]
          "
          aria-labelledby="servicos-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

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
                bg-[#009386]/15
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
                Atendimento personalizado com foco em suas necessidades
                individuais, promovendo saúde e bem-estar através do movimento.
                Quem procura fisioterapia no Tatuapé SP encontra aqui avaliação
                cuidadosa para dores, pós-operatório, lesões e prevenção,
                perto de quem vive na Zona Leste de SP.
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
                  Quando procurar fisioterapia
                </h3>

                <p className="
                  text-sm
                  sm:text-base
                  text-[#56635C]
                  leading-relaxed
                ">
                  Procure fisioterapia quando a dor persiste, a mobilidade
                  diminui ou você precisa de reabilitação segura. Nossa equipe
                  em São Paulo - SP combina pilates terapêutico e fisioterapia
                  para recuperar função e qualidade de vida no dia a dia.
                </p>

              </div>

            </div>

            <div className="
              grid
              sm:grid-cols-2
              lg:grid-cols-3
              gap-6
              sm:gap-8
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
                      rounded-3xl
                      p-7
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
                      w-14
                      h-14
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
                      text-lg
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

            <div className="text-center mt-10">

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
            py-14
            sm:py-18
            lg:py-20
            bg-[#F8F6F0]
            border-y
            border-[#E3DEC9]
          "
          aria-labelledby="seo-local-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* CABEÇALHO */}

            <div className="
              text-center
              max-w-3xl
              mx-auto
              mb-10
              sm:mb-12
            ">

              <div className="
                inline-flex
                items-center
                gap-1.5
                bg-[#009386]/15
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
          className="py-14 sm:py-18 lg:py-20"
          aria-labelledby="diferenciais-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

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
                bg-[#009386]/15
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
                mx-auto
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
              lg:grid-cols-3
              gap-6
              sm:gap-8
            ">

              <div className="
                text-center
                space-y-2.5
                p-6
                rounded-2xl
                bg-white
                border
                border-[#E3DEC9]
                shadow-sm
              ">
                <div className="
                  w-12
                  h-12
                  bg-[#009386]
                  rounded-full
                  flex
                  items-center
                  justify-center
                  text-white
                  mx-auto
                  shadow-sm
                ">
                  <CheckCircle
                    size={22}
                    aria-hidden="true"
                  />
                </div>

                <h3 className="
                  text-base
                  font-bold
                  text-[#1B2E26]
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

              <div className="
                text-center
                space-y-2.5
                p-6
                rounded-2xl
                bg-white
                border
                border-[#E3DEC9]
                shadow-sm
              ">
                <div className="
                  w-12
                  h-12
                  bg-[#FF6954]
                  rounded-full
                  flex
                  items-center
                  justify-center
                  text-white
                  mx-auto
                  shadow-sm
                ">
                  <Dumbbell
                    size={22}
                    aria-hidden="true"
                  />
                </div>

                <h3 className="
                  text-base
                  font-bold
                  text-[#1B2E26]
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

              <div className="
                text-center
                space-y-2.5
                p-6
                rounded-2xl
                bg-white
                border
                border-[#E3DEC9]
                shadow-sm
              ">
                <div className="
                  w-12
                  h-12
                  bg-[#9E2A43]
                  rounded-full
                  flex
                  items-center
                  justify-center
                  text-white
                  mx-auto
                  shadow-sm
                ">
                  <Activity
                    size={22}
                    aria-hidden="true"
                  />
                </div>

                <h3 className="
                  text-base
                  font-bold
                  text-[#1B2E26]
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

              <div className="
                text-center
                space-y-2.5
                p-6
                rounded-2xl
                bg-white
                border
                border-[#E3DEC9]
                shadow-sm
              ">
                <div className="
                  w-12
                  h-12
                  bg-[#3CD099]
                  rounded-full
                  flex
                  items-center
                  justify-center
                  text-[#0E2820]
                  mx-auto
                  shadow-sm
                ">
                  <Sparkles
                    size={22}
                    aria-hidden="true"
                  />
                </div>

                <h3 className="
                  text-base
                  font-bold
                  text-[#1B2E26]
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

              <div className="
                text-center
                space-y-2.5
                p-6
                rounded-2xl
                bg-white
                border
                border-[#E3DEC9]
                shadow-sm
              ">
                <div className="
                  w-12
                  h-12
                  bg-[#007491]
                  rounded-full
                  flex
                  items-center
                  justify-center
                  text-white
                  mx-auto
                  shadow-sm
                ">
                  <Shield
                    size={22}
                    aria-hidden="true"
                  />
                </div>

                <h3 className="
                  text-base
                  font-bold
                  text-[#1B2E26]
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

              <div className="
                text-center
                space-y-2.5
                p-6
                rounded-2xl
                bg-white
                border
                border-[#E3DEC9]
                shadow-sm
              ">
                <div className="
                  w-12
                  h-12
                  bg-[#5168AB]
                  rounded-full
                  flex
                  items-center
                  justify-center
                  text-white
                  mx-auto
                  shadow-sm
                ">
                  <Heart
                    size={22}
                    aria-hidden="true"
                  />
                </div>

                <h3 className="
                  text-base
                  font-bold
                  text-[#1B2E26]
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
        </section>

        {/* =========================================================
            FAQ
        ========================================================= */}

        <section
          id="faq"
          className="
            py-14
            sm:py-18
            bg-[#EFEAD9]/60
            border-y
            border-[#E3DEC9]
          "
          aria-labelledby="faq-heading"
        >
          <div className="
            max-w-3xl
            mx-auto
            px-4
            sm:px-6
            lg:px-8
          ">

            <div className="
              text-center
              mb-8
            ">

              <h2
                id="faq-heading"
                className="
                  text-2xl
                  sm:text-3xl
                  font-extrabold
                  text-[#1B2E26]
                  mb-2
                "
              >
                Dúvidas frequentes
              </h2>

              <p className="
                text-xs
                sm:text-sm
                text-[#56635C]
              ">
                Respostas rápidas sobre pilates no Tatuapé,
                fisioterapia e agendamento.
              </p>

            </div>

            <Accordion
              type="single"
              collapsible
              className="
                w-full
                text-left
                bg-white
                rounded-2xl
                border
                border-[#E3DEC9]
                p-3.5
                sm:p-5
                shadow-sm
              "
            >

              <AccordionItem
                value="onde"
                className="border-b border-[#E3DEC9]"
              >
                <AccordionTrigger className="
                  text-sm
                  sm:text-base
                  font-semibold
                  text-[#1B2E26]
                  hover:text-[#009386]
                ">
                  Onde fica a clínica de pilates no Tatuapé?
                </AccordionTrigger>

                <AccordionContent className="
                  text-[#56635C]
                  text-xs
                  sm:text-sm
                  leading-relaxed
                ">
                  Na Rua Itapura, 1182, Tatuapé, Zona Leste de São Paulo.
                  Abra o perfil no{' '}

                  <a
                    href={COMPANY.maps.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      text-[#009386]
                      font-semibold
                      hover:underline
                    "
                  >
                    Google Maps
                  </a>

                  {' '}para traçar a rota.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="experimental"
                className="border-b border-[#E3DEC9]"
              >
                <AccordionTrigger className="
                  text-sm
                  sm:text-base
                  font-semibold
                  text-[#1B2E26]
                  hover:text-[#009386]
                ">
                  Vocês têm aula experimental de pilates?
                </AccordionTrigger>

                <AccordionContent className="
                  text-[#56635C]
                  text-xs
                  sm:text-sm
                  leading-relaxed
                ">
                  Sim. Agende pelo WhatsApp uma aula experimental para
                  conhecer o espaço, o método e a equipe antes de iniciar
                  o plano.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="convenio"
                className="border-b border-[#E3DEC9]"
              >
                <AccordionTrigger className="
                  text-sm
                  sm:text-base
                  font-semibold
                  text-[#1B2E26]
                  hover:text-[#009386]
                ">
                  A Fisa Saúde atende convênio?
                </AccordionTrigger>

                <AccordionContent className="
                  text-[#56635C]
                  text-xs
                  sm:text-sm
                  leading-relaxed
                ">
                  O atendimento é particular. Fale com a recepção no
                  WhatsApp para confirmar valores e formas de pagamento.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="valor"
                className="border-b border-[#E3DEC9]"
              >
                <AccordionTrigger className="
                  text-sm
                  sm:text-base
                  font-semibold
                  text-[#1B2E26]
                  hover:text-[#009386]
                ">
                  Qual o valor do pilates e da fisioterapia?
                </AccordionTrigger>

                <AccordionContent className="
                  text-[#56635C]
                  text-xs
                  sm:text-sm
                  leading-relaxed
                ">
                  Os valores dependem da frequência e do tipo de sessão.
                  Peça a tabela atualizada no WhatsApp, que é o jeito mais
                  rápido de receber a informação certa.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="fisio"
                className="border-b border-[#E3DEC9]"
              >
                <AccordionTrigger className="
                  text-sm
                  sm:text-base
                  font-semibold
                  text-[#1B2E26]
                  hover:text-[#009386]
                ">
                  Fazem fisioterapia na Zona Leste?
                </AccordionTrigger>

                <AccordionContent className="
                  text-[#56635C]
                  text-xs
                  sm:text-sm
                  leading-relaxed
                ">
                  Sim. Atendemos fisioterapia e reabilitação no Tatuapé,
                  com foco em dores, postura, pós-operatório e retorno
                  seguro ao movimento.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="avaliacao"
                className="border-b border-[#E3DEC9]"
              >
                <AccordionTrigger className="
                  text-sm
                  sm:text-base
                  font-semibold
                  text-[#1B2E26]
                  hover:text-[#009386]
                ">
                  Como agendar uma avaliação de fisioterapia?
                </AccordionTrigger>

                <AccordionContent className="
                  text-[#56635C]
                  text-xs
                  sm:text-sm
                  leading-relaxed
                ">
                  Use o botão Agendar avaliação ou mande uma mensagem
                  no WhatsApp. Indicamos o melhor horário na clínica.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="horario"
                className="border-b-0"
              >
                <AccordionTrigger className="
                  text-sm
                  sm:text-base
                  font-semibold
                  text-[#1B2E26]
                  hover:text-[#009386]
                ">
                  Qual o horário de atendimento?
                </AccordionTrigger>

                <AccordionContent className="
                  text-[#56635C]
                  text-xs
                  sm:text-sm
                  leading-relaxed
                ">
                  {COMPANY.schedule.weekdays}.{' '}
                  {COMPANY.schedule.saturday}. Domingo fechado.
                </AccordionContent>
              </AccordionItem>

            </Accordion>

          </div>
        </section>

        {/* =========================================================
            CTA
        ========================================================= */}

        <section className="
          py-14
          sm:py-18
          bg-[#F8F6F0]
        ">
          <div className="
            max-w-5xl
            mx-auto
            px-4
            sm:px-6
            lg:px-8
          ">

            <div className="
              bg-[#FF6954]
              rounded-[36px]
              p-6
              sm:p-12
              text-center
              text-white
              relative
              overflow-hidden
              shadow-xl
            ">

              <div className="
                absolute
                -top-12
                -left-12
                w-32
                h-32
                bg-white/10
                rounded-full
              " />

              <div className="
                absolute
                -bottom-10
                -right-10
                w-40
                h-40
                bg-[#9E2A43]/30
                rounded-tl-[50px]
              " />

              <h2 className="
                text-2xl
                sm:text-3xl
                lg:text-4xl
                font-extrabold
                mb-3
                relative
                z-10
              ">
                Agende sua aula experimental
              </h2>

              <p className="
                text-sm
                sm:text-base
                text-white/95
                mb-6
                max-w-xl
                mx-auto
                leading-relaxed
                relative
                z-10
              ">
                Comece no Tatuapé com pilates ou avaliação de fisioterapia.
                A equipe da Fisa Saúde responde no WhatsApp.
              </p>

              <button
                onClick={() =>
                  handleWhatsAppClick(
                    'Olá! Quero agendar uma aula experimental de pilates na Fisa Saúde, no Tatuapé.'
                  )
                }
                className="
                  relative
                  z-10
                  bg-white
                  hover:bg-[#F8F6F0]
                  text-[#1B2E26]
                  px-7
                  py-3
                  rounded-full
                  uppercase
                  tracking-wider
                  text-xs
                  font-extrabold
                  transition-all
                  shadow-md
                  hover:scale-105
                  inline-flex
                  items-center
                  gap-2
                "
                aria-label="Agendar aula experimental pelo WhatsApp"
              >
                <Phone
                  size={15}
                  aria-hidden="true"
                />

                <span>
                  Falar no WhatsApp
                </span>

                <ArrowRight
                  size={15}
                  aria-hidden="true"
                />
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
            py-14
            sm:py-18
            lg:py-20
            bg-white
            border-t
            border-[#E3DEC9]
          "
          aria-labelledby="contato-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

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
                bg-[#009386]/15
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
              lg:grid-cols-2
              gap-8
              lg:gap-12
              items-center
            ">

              {/* INFORMAÇÕES */}

              <div className="
                bg-[#F8F6F0]
                rounded-3xl
                p-7
                border
                border-[#E3DEC9]
                space-y-5
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

              </div>

              {/* MAPA */}

              <div className="
                relative
                rounded-3xl
                overflow-hidden
                shadow-lg
                border
                border-[#E3DEC9]
                h-[400px]
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