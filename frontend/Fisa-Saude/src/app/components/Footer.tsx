import { Facebook, Twitter, Instagram, Linkedin, Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#002d2d] border-t border-teal-400/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">W</span>
              </div>
              <span className="ml-3 text-white text-xl">WereFrame</span>
            </div>
            <p className="text-teal-200 text-sm mb-4">
              Transform wireframes into stunning prototypes with AI-powered design tools.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 bg-teal-800/50 hover:bg-teal-700 rounded-lg flex items-center justify-center transition-colors">
                <Twitter size={16} className="text-teal-200" />
              </a>
              <a href="#" className="w-8 h-8 bg-teal-800/50 hover:bg-teal-700 rounded-lg flex items-center justify-center transition-colors">
                <Facebook size={16} className="text-teal-200" />
              </a>
              <a href="#" className="w-8 h-8 bg-teal-800/50 hover:bg-teal-700 rounded-lg flex items-center justify-center transition-colors">
                <Instagram size={16} className="text-teal-200" />
              </a>
              <a href="#" className="w-8 h-8 bg-teal-800/50 hover:bg-teal-700 rounded-lg flex items-center justify-center transition-colors">
                <Linkedin size={16} className="text-teal-200" />
              </a>
              <a href="#" className="w-8 h-8 bg-teal-800/50 hover:bg-teal-700 rounded-lg flex items-center justify-center transition-colors">
                <Github size={16} className="text-teal-200" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white mb-4">Product</h4>
            <ul className="space-y-2 text-teal-200 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white mb-4">Company</h4>
            <ul className="space-y-2 text-teal-200 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Press Kit</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white mb-4">Resources</h4>
            <ul className="space-y-2 text-teal-200 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Tutorials</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-teal-400/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-teal-200 text-sm">
            © 2026 WereFrame. All rights reserved.
          </p>
          <div className="flex gap-6 text-teal-200 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
