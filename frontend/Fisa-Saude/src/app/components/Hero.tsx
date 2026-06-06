import { ArrowRight, Play } from 'lucide-react';
import tealPalette from '../../imports/AdobeColor-CR_-_Shades_of_Teal.jpeg';
import geminiImage from '../../imports/Gemini_Generated_Image_1x8bk71x8bk71x8b.png';

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-300 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-400 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white space-y-8">
            <div className="inline-flex items-center bg-teal-900/40 backdrop-blur-sm border border-teal-400/30 rounded-full px-4 py-2">
              <span className="w-2 h-2 bg-teal-400 rounded-full mr-2 animate-pulse"></span>
              <span className="text-sm text-teal-100">Introducing WereFrame v2.0</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-tight">
              Design High-Fidelity
              <span className="block bg-gradient-to-r from-teal-200 to-teal-400 bg-clip-text text-transparent">
                Prototypes Fast
              </span>
            </h1>

            <p className="text-lg text-teal-100 max-w-xl">
              Transform your wireframes into stunning, interactive prototypes with our advanced design tools. Built for designers who demand perfection.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-lg transition-all flex items-center justify-center gap-2">
                Start Creating
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
              <button className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg border border-white/20 transition-all flex items-center justify-center gap-2">
                <Play size={20} />
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-teal-400/20">
              <div>
                <div className="text-3xl text-white">50K+</div>
                <div className="text-sm text-teal-200">Active Users</div>
              </div>
              <div>
                <div className="text-3xl text-white">100K+</div>
                <div className="text-sm text-teal-200">Prototypes</div>
              </div>
              <div>
                <div className="text-3xl text-white">4.9</div>
                <div className="text-sm text-teal-200">Rating</div>
              </div>
            </div>
          </div>

          {/* Right Content - Images */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src={geminiImage}
                alt="WereFrame Interface"
                className="rounded-2xl shadow-2xl border border-teal-400/20"
              />
              
              {/* Floating Card */}
              <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-teal-100">
                <img
                  src={tealPalette}
                  alt="Color Palette"
                  className="w-48 h-32 object-cover rounded-lg"
                />
                <p className="text-sm text-gray-600 mt-2">Shades of Teal</p>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl blur-xl opacity-60"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
