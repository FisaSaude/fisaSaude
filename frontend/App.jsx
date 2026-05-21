import Header from './components/Header';
import Hero from './sections/Hero';
import About from './sections/About';
import Benefits from './sections/Benefits';
import Pricing from './sections/Pricing';
import Testimonials from './sections/Testimonials';
import Contact from './sections/Contact';
import Footer from './components/Footer';

function App() {
  const whatsappNumber = "5511999999999";
  
  const handleWhatsApp = () => {
    const msg = encodeURIComponent("Olá! Gostaria de agendar uma aula de Pilates.");
    window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onContactClick={handleWhatsApp} />
      <main>
        <Hero onContactClick={handleWhatsApp} />
        <About />
        <Benefits />
        <Pricing onContactClick={handleWhatsApp} />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;