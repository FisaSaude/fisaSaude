import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#003d3d]/95 backdrop-blur-sm border-b border-teal-400/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">W</span>
            </div>
            <span className="ml-3 text-white text-xl">WereFrame</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-teal-100 hover:text-white transition-colors">
              Home
            </a>
            <a href="#features" className="text-teal-100 hover:text-white transition-colors">
              Features
            </a>
            <a href="#gallery" className="text-teal-100 hover:text-white transition-colors">
              Gallery
            </a>
            <a href="#contact" className="text-teal-100 hover:text-white transition-colors">
              Contact
            </a>
            <button className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg transition-colors">
              Get Started
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-2"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-teal-400/20">
            <div className="flex flex-col space-y-4">
              <a href="#home" className="text-teal-100 hover:text-white transition-colors">
                Home
              </a>
              <a href="#features" className="text-teal-100 hover:text-white transition-colors">
                Features
              </a>
              <a href="#gallery" className="text-teal-100 hover:text-white transition-colors">
                Gallery
              </a>
              <a href="#contact" className="text-teal-100 hover:text-white transition-colors">
                Contact
              </a>
              <button className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg transition-colors text-center">
                Get Started
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
