import { Menu, X, Phone, MapPin, Instagram, Facebook, Mail, CheckCircle, Star, ArrowRight, Award, Users, Heart, Shield } from 'lucide-react';
import { useState } from 'react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { FisaLogo } from '../components/FisaLogo';
import { COMPANY } from '../constants/company';

// Imagens reais da FISA Saúde
import heroImage1 from '../../imports/Captura_de_tela_de_2026-05-31_19-26-55.png';
import heroImage2 from '../../imports/Captura_de_tela_de_2026-05-31_19-27-13.png';
import aboutImage from '../../imports/WhatsApp_Image_2026-05-31_at_19.26.17__1_.jpeg';
import pilatesImage1 from '../../imports/WhatsApp_Image_2026-05-31_at_19.26.17.jpeg';
import pilatesImage2 from '../../imports/WhatsApp_Image_2026-05-31_at_19.26.17__2_.jpeg';
import pilatesImage3 from '../../imports/WhatsApp_Image_2026-05-31_at_19.26.18.jpeg';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Olá! Gostaria de saber mais sobre os serviços da FISA Saúde.");
    window.open(`https://wa.me/${COMPANY.contact.whatsapp}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-50/30 to-white">
      <a href="#main-content" className="skip-to-content">
        Pular para o conteúdo principal
      </a>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-border shadow-sm" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18 sm:h-20">
            <FisaLogo size="md" />

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-2" aria-label="Navegação principal">
              <a href="#sobre" className="px-4 py-3 min-h-[44px] text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all flex items-center font-medium">
                Sobre Nós
              </a>
              <a href="#servicos" className="px-4 py-3 min-h-[44px] text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all flex items-center font-medium">
                Serviços
              </a>
              <a href="#diferenciais" className="px-4 py-3 min-h-[44px] text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all flex items-center font-medium">
                Diferenciais
              </a>
              <a href="#depoimentos" className="px-4 py-3 min-h-[44px] text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all flex items-center font-medium">
                Depoimentos
              </a>
              <a
                href="/admin/login"
                className="ml-4 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-700 text-white px-6 py-3 min-h-[44px] rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2 font-semibold focus:outline-2 focus:outline-offset-2 focus:outline-primary"
                aria-label="Fazer login"
              >
                <span>Login</span>
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-foreground p-3 min-h-[44px] min-w-[44px] hover:bg-accent rounded-lg transition-colors"
              aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav id="mobile-menu" className="lg:hidden py-4 border-t border-border" aria-label="Navegação mobile">
              <div className="flex flex-col space-y-2">
                <a href="#sobre" className="px-4 py-3 min-h-[44px] text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors flex items-center font-medium" onClick={() => setIsMenuOpen(false)}>
                  Sobre Nós
                </a>
                <a href="#servicos" className="px-4 py-3 min-h-[44px] text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors flex items-center font-medium" onClick={() => setIsMenuOpen(false)}>
                  Serviços
                </a>
                <a href="#diferenciais" className="px-4 py-3 min-h-[44px] text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors flex items-center font-medium" onClick={() => setIsMenuOpen(false)}>
                  Diferenciais
                </a>
                <a href="#depoimentos" className="px-4 py-3 min-h-[44px] text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors flex items-center font-medium" onClick={() => setIsMenuOpen(false)}>
                  Depoimentos
                </a>
                <a
                  href="/admin/login"
                  className="mt-2 bg-gradient-to-r from-primary to-emerald-600 text-white px-6 py-3 min-h-[44px] rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 font-semibold focus:outline-2 focus:outline-offset-2 focus:outline-primary"
                  aria-label="Fazer login"
                >
                  <span>Login</span>
                </a>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main id="main-content">
        <section className="relative overflow-hidden py-8 sm:py-10 lg:py-12" aria-labelledby="hero-heading">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50/30" aria-hidden="true" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold border border-primary/20">
                  <Award size={16} />
                  Referência em Atendimento Multidisciplinar
                </div>

                <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-foreground leading-[1.1] font-bold tracking-tight">
                  Movimento, Saúde e
                  <span className="block bg-gradient-to-r from-primary via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                    Qualidade de Vida
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Agende suas aulas de Pilates de forma simples e rápida. A FISA Saúde oferece atendimento personalizado para promover bem-estar, prevenção e reabilitação física.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleWhatsAppClick}
                    className="group bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-700 text-white px-8 py-4 min-h-[52px] rounded-xl transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2 font-semibold text-lg"
                    aria-label="Agendar aula pelo WhatsApp"
                  >
                    <Phone size={22} aria-hidden="true" />
                    <span>Agendar Aula</span>
                    <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </button>
                  <a
                    href="#sobre"
                    className="bg-white hover:bg-accent text-foreground px-8 py-4 min-h-[52px] rounded-xl border-2 border-border hover:border-primary/30 transition-all flex items-center justify-center font-semibold text-lg shadow-sm hover:scale-105 active:scale-95"
                    aria-label="Conhecer a clínica"
                  >
                    Conhecer a Clínica
                  </a>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 sm:gap-8 pt-8 border-t border-border">
                  <div className="space-y-2 text-center lg:text-left">
                    <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">15+</div>
                    <div className="text-sm text-muted-foreground font-medium">Anos de Atuação</div>
                  </div>
                  <div className="space-y-2 text-center lg:text-left">
                    <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">5.000+</div>
                    <div className="text-sm text-muted-foreground font-medium">Pacientes Atendidos</div>
                  </div>
                  <div className="space-y-2 text-center lg:text-left">
                    <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">98%</div>
                    <div className="text-sm text-muted-foreground font-medium">Satisfação</div>
                  </div>
                </div>
              </div>

              {/* Right Image */}
              <div className="relative order-first lg:order-last">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-border">
                  <ImageWithFallback
                    src={heroImage1}
                    alt="Aula de Pilates na FISA Saúde"
                    className="w-full h-[400px] lg:h-[600px] object-cover"
                  />
                </div>

                {/* Floating Badge */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:-left-8 bg-white rounded-2xl p-6 shadow-2xl ring-1 ring-border max-w-[280px]">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Shield className="text-white" size={28} />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground font-medium">Certificada</div>
                      <div className="text-xl text-foreground font-bold">ISO 9001:2015</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sobre Section */}
        <section id="sobre" className="py-16 sm:py-20 lg:py-24 bg-white" aria-labelledby="sobre-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="relative order-last lg:order-first">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-border">
                  <ImageWithFallback
                    src={aboutImage}
                    alt="Atendimento personalizado de Pilates na FISA Saúde"
                    className="w-full h-[400px] lg:h-[500px] object-cover"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold border border-primary/20">
                  <Users size={16} aria-hidden="true" />
                  Sobre a FISA Saúde
                </div>

                <h2 id="sobre-heading" className="text-3xl sm:text-4xl lg:text-5xl text-foreground font-bold leading-tight">
                  Conheça a{' '}
                  <span className="bg-gradient-to-r from-primary via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                    FISA Saúde
                  </span>
                </h2>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  A <strong className="text-foreground">FISA Saúde</strong> é especializada em Pilates e acompanhamento personalizado, oferecendo um ambiente acolhedor e profissional para pessoas que buscam melhorar sua qualidade de vida, prevenir lesões e alcançar mais saúde através do movimento.
                </p>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  Nossa metodologia combina técnica, cuidado individualizado e equipamentos de última geração para proporcionar uma experiência única de transformação física e bem-estar.
                </p>

                <div className="grid sm:grid-cols-2 gap-6 pt-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <CheckCircle className="text-white" size={24} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1">Atendimento Humanizado</h3>
                      <p className="text-sm text-muted-foreground">Cuidado individualizado e acolhedor</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Users className="text-white" size={24} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1">Profissionais Qualificados</h3>
                      <p className="text-sm text-muted-foreground">Equipe especializada em Pilates</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Shield className="text-white" size={24} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1">Ambiente Seguro</h3>
                      <p className="text-sm text-muted-foreground">Infraestrutura moderna e acolhedora</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Heart className="text-white" size={24} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1">Foco em Saúde</h3>
                      <p className="text-sm text-muted-foreground">Bem-estar integral através do movimento</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Serviços Section */}
        <section id="servicos" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-emerald-50/50 to-white" aria-labelledby="servicos-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold border border-primary/20 mb-6">
                <Star size={16} aria-hidden="true" />
                Nossos Serviços
              </div>
              <h2 id="servicos-heading" className="text-3xl sm:text-4xl lg:text-5xl text-foreground font-bold mb-6">
                Nossos Serviços de Pilates
              </h2>
              <p className="text-lg text-muted-foreground">
                Atendimento personalizado com foco em suas necessidades individuais, promovendo saúde e bem-estar através do movimento.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {COMPANY.services.map((service, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-2xl p-8 shadow-sm border border-border hover:shadow-xl hover:border-primary/30 transition-all hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform">
                    <CheckCircle className="text-white" size={28} aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{service}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {service === 'Pilates Individual' && 'Aulas exclusivas com atenção total às suas necessidades e objetivos específicos.'}
                    {service === 'Pilates em Pequenos Grupos' && 'Turmas reduzidas que garantem acompanhamento próximo e personalizado.'}
                    {service === 'Reabilitação Física' && 'Recuperação de lesões e cirurgias com acompanhamento especializado e seguro.'}
                    {service === 'Fortalecimento Muscular' && 'Desenvolvimento de força, resistência e tônus muscular de forma equilibrada.'}
                    {service === 'Qualidade de Vida' && 'Melhora da postura, flexibilidade e bem-estar no dia a dia.'}
                    {service === 'Acompanhamento Personalizado' && 'Planejamento individualizado que evolui junto com seus progressos.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Diferenciais Section */}
        <section id="diferenciais" className="py-16 sm:py-20 lg:py-24 bg-white" aria-labelledby="diferenciais-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold border border-primary/20 mb-6">
                <Award size={16} aria-hidden="true" />
                Nossos Diferenciais
              </div>
              <h2 id="diferenciais-heading" className="text-3xl sm:text-4xl lg:text-5xl text-foreground font-bold mb-6">
                Benefícios do Pilates
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
                  <CheckCircle className="text-white" size={32} aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Melhora da Postura</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Correção postural e alinhamento corporal adequado.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
                  <CheckCircle className="text-white" size={32} aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Fortalecimento Muscular</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Desenvolvimento equilibrado de força e resistência.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
                  <CheckCircle className="text-white" size={32} aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Alívio de Dores</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Redução de dores crônicas e desconfortos musculares.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
                  <CheckCircle className="text-white" size={32} aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Aumento da Mobilidade</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Mais flexibilidade e amplitude de movimento.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
                  <CheckCircle className="text-white" size={32} aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Prevenção de Lesões</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Exercícios seguros que protegem seu corpo.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
                  <Heart className="text-white" size={32} aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Mais Qualidade de Vida</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Bem-estar físico e mental no dia a dia.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Depoimentos Section */}
        <section id="depoimentos" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-emerald-50/50 to-white" aria-labelledby="depoimentos-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold border border-primary/20 mb-6">
                <Star size={16} aria-hidden="true" />
                Depoimentos
              </div>
              <h2 id="depoimentos-heading" className="text-3xl sm:text-4xl lg:text-5xl text-foreground font-bold mb-6">
                O que dizem nossos pacientes
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-border">
                <div className="flex gap-1 mb-4" aria-label="5 estrelas">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="text-amber-400 fill-amber-400" size={20} aria-hidden="true" />
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6 italic">
                  "Excelente atendimento! A equipe é muito atenciosa e profissional. Minha recuperação foi muito mais rápida do que esperava. Recomendo!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                    MC
                  </div>
                  <div>
                    <div className="font-bold text-foreground">Maria Clara Silva</div>
                    <div className="text-sm text-muted-foreground">Paciente de Fisioterapia</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-border">
                <div className="flex gap-1 mb-4" aria-label="5 estrelas">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="text-amber-400 fill-amber-400" size={20} aria-hidden="true" />
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6 italic">
                  "As sessões de Pilates Terapêutico transformaram minha qualidade de vida. Minhas dores nas costas sumiram e ganhei muito mais disposição."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                    RS
                  </div>
                  <div>
                    <div className="font-bold text-foreground">Roberto Santos</div>
                    <div className="text-sm text-muted-foreground">Paciente de Pilates</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-border">
                <div className="flex gap-1 mb-4" aria-label="5 estrelas">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="text-amber-400 fill-amber-400" size={20} aria-hidden="true" />
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6 italic">
                  "Estrutura impecável e profissionais extremamente competentes. Me sinto muito bem cuidada aqui. A FISA Saúde é referência em qualidade!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                    AF
                  </div>
                  <div>
                    <div className="font-bold text-foreground">Ana Fernandes</div>
                    <div className="text-sm text-muted-foreground">Paciente de Acupuntura</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-primary via-emerald-500 to-teal-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/5" aria-hidden="true" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl text-white font-bold mb-6">
              Agende sua Aula
            </h2>
            <p className="text-lg sm:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Comece agora sua jornada rumo a mais saúde, movimento e qualidade de vida com a FISA Saúde.
            </p>
            <button
              onClick={handleWhatsAppClick}
              className="group bg-white hover:bg-gray-50 text-primary px-8 py-4 min-h-[52px] rounded-xl transition-all shadow-2xl hover:shadow-3xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2 font-semibold text-lg mx-auto"
              aria-label="Agendar aula pelo WhatsApp"
            >
              <Phone size={22} aria-hidden="true" />
              <span>Agendar Aula Agora</span>
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </button>
          </div>
        </section>

        {/* Contato e Mapa Section */}
        <section className="py-16 sm:py-20 lg:py-24 bg-white" aria-labelledby="contato-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold border border-primary/20 mb-6">
                <MapPin size={16} aria-hidden="true" />
                Localização
              </div>
              <h2 id="contato-heading" className="text-3xl sm:text-4xl lg:text-5xl text-foreground font-bold mb-6">
                Venha nos visitar
              </h2>
              <p className="text-lg text-muted-foreground">
                Estamos localizados em um dos endereços mais privilegiados de São Paulo.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Contact Info */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50/30 rounded-2xl p-8 border border-primary/20">
                  <h3 className="text-2xl font-bold text-foreground mb-6">Informações de Contato</h3>

                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <MapPin className="text-white" size={20} aria-hidden="true" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground mb-1">Endereço</h4>
                        <p className="text-muted-foreground leading-relaxed">{COMPANY.address.full}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Phone className="text-white" size={20} aria-hidden="true" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground mb-1">Telefone</h4>
                        <a href={`tel:${COMPANY.contact.phone}`} className="text-primary hover:underline">
                          {COMPANY.contact.phone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Mail className="text-white" size={20} aria-hidden="true" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground mb-1">E-mail</h4>
                        <a href={`mailto:${COMPANY.contact.email}`} className="text-primary hover:underline">
                          {COMPANY.contact.email}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-primary/20">
                    <h4 className="font-bold text-foreground mb-4">Horário de Atendimento</h4>
                    <div className="space-y-2 text-muted-foreground">
                      <p>{COMPANY.schedule.weekdays}</p>
                      <p>{COMPANY.schedule.saturday}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl ring-1 ring-border h-[500px] bg-muted">
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
                  href={COMPANY.maps.openUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-3 left-3 z-10 inline-flex items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-sm font-semibold text-foreground shadow-md ring-1 ring-border hover:bg-white"
                >
                  <MapPin size={16} className="text-primary" aria-hidden="true" />
                  Abrir no Maps
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-900 to-slate-800 text-white" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Logo e Descrição */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                <FisaLogo size="lg" />
              </div>
              <p className="text-slate-300 leading-relaxed text-sm mb-6">
                Instituição de referência em atendimento multidisciplinar, promovendo saúde e bem-estar com excelência.
              </p>
              <div className="flex gap-3">
                <a
                  href="https://instagram.com/fisasaude"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="Instagram da FISA Saúde"
                >
                  <Instagram size={20} aria-hidden="true" />
                </a>
                <a
                  href="https://facebook.com/fisasaude"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="Facebook da FISA Saúde"
                >
                  <Facebook size={20} aria-hidden="true" />
                </a>
                <a
                  href={`https://wa.me/${COMPANY.contact.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="WhatsApp da FISA Saúde"
                >
                  <Phone size={20} aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Serviços */}
            <div>
              <h3 className="font-bold text-lg mb-4">Serviços</h3>
              <ul className="space-y-3">
                {COMPANY.services.map((service, index) => (
                  <li key={index}>
                    <a href="#servicos" className="text-slate-300 hover:text-white transition-colors text-sm">
                      {service}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Links Rápidos */}
            <div>
              <h3 className="font-bold text-lg mb-4">Links Rápidos</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#sobre" className="text-slate-300 hover:text-white transition-colors text-sm">
                    Sobre Nós
                  </a>
                </li>
                <li>
                  <a href="#diferenciais" className="text-slate-300 hover:text-white transition-colors text-sm">
                    Diferenciais
                  </a>
                </li>
                <li>
                  <a href="#depoimentos" className="text-slate-300 hover:text-white transition-colors text-sm">
                    Depoimentos
                  </a>
                </li>
                <li>
                  <a href="/admin/login" className="text-slate-300 hover:text-white transition-colors text-sm">
                    Área do Profissional
                  </a>
                </li>
              </ul>
            </div>

            {/* Contato */}
            <div>
              <h3 className="font-bold text-lg mb-4">Contato</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-slate-300">{COMPANY.address.full}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-primary flex-shrink-0" aria-hidden="true" />
                  <a href={`tel:${COMPANY.contact.phone}`} className="text-slate-300 hover:text-white transition-colors">
                    {COMPANY.contact.phone}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-primary flex-shrink-0" aria-hidden="true" />
                  <a href={`mailto:${COMPANY.contact.email}`} className="text-slate-300 hover:text-white transition-colors">
                    {COMPANY.contact.email}
                  </a>
                </li>
              </ul>
              <button
                onClick={handleWhatsAppClick}
                className="mt-6 w-full bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-700 text-white px-4 py-3 min-h-[44px] rounded-xl transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-2 font-semibold text-sm"
                aria-label="Falar no WhatsApp"
              >
                <Phone size={18} aria-hidden="true" />
                WhatsApp
              </button>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-slate-400 text-sm">
              &copy; {new Date().getFullYear()} <strong className="text-white">FISA Saúde</strong>. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
