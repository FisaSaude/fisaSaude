import { ArrowRight } from 'lucide-react';
import wireframe from '../../imports/Were-Frame-Mobile.png';

export function CTA() {
  return (
    <section id="contact" className="py-20 sm:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-br from-teal-600 to-teal-800 rounded-3xl overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="relative grid lg:grid-cols-2 gap-12 items-center p-8 sm:p-12 lg:p-16">
            {/* Left Content */}
            <div className="text-white space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl leading-tight">
                Ready to Transform Your Wireframes?
              </h2>
              <p className="text-lg text-teal-50">
                Join thousands of designers who are creating better prototypes, faster. Start your free trial today—no credit card required.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button className="group bg-white text-teal-700 px-8 py-4 rounded-lg transition-all hover:shadow-xl flex items-center justify-center gap-2">
                  Start Free Trial
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </button>
                <button className="bg-teal-700/50 hover:bg-teal-700 text-white px-8 py-4 rounded-lg border border-white/20 transition-all">
                  Schedule Demo
                </button>
              </div>

              <div className="flex items-center gap-6 pt-6">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white"></div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white"></div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white"></div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border-2 border-white"></div>
                </div>
                <div>
                  <p className="text-sm text-teal-50">
                    Join 50,000+ happy users
                  </p>
                </div>
              </div>
            </div>

            {/* Right Content - Wireframe Preview */}
            <div className="relative">
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <img
                  src={wireframe}
                  alt="WereFrame Mobile Preview"
                  className="w-full h-auto rounded-lg shadow-2xl"
                />
                
                {/* Floating Badge */}
                <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full shadow-lg">
                  <span>✨ New Features</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
