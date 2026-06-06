import { Sparkles, Zap, Layout, Palette } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Design',
    description: 'Automatically transform low-fidelity wireframes into polished prototypes with intelligent design suggestions.',
    color: 'from-teal-400 to-emerald-400'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Real-time collaboration and instant preview. See your changes come to life as you design.',
    color: 'from-emerald-400 to-teal-500'
  },
  {
    icon: Layout,
    title: 'Responsive Layouts',
    description: 'Create prototypes that adapt perfectly to any screen size with our flexible grid system.',
    color: 'from-teal-500 to-emerald-500'
  },
  {
    icon: Palette,
    title: 'Rich Components',
    description: 'Access a comprehensive library of pre-built, customizable components and design patterns.',
    color: 'from-emerald-400 to-teal-400'
  }
];

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-teal-900/40 backdrop-blur-sm border border-teal-400/30 rounded-full px-4 py-2 mb-6">
            <span className="text-sm text-teal-100">Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-teal-100 max-w-2xl mx-auto">
            Powerful features that make prototyping a breeze. From concept to high-fidelity in minutes.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-white/5 backdrop-blur-sm border border-teal-400/20 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
              >
                {/* Icon */}
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="text-white" size={24} />
                </div>

                {/* Content */}
                <h3 className="text-xl text-white mb-2">{feature.title}</h3>
                <p className="text-teal-100 text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400/0 to-teal-600/0 group-hover:from-teal-400/5 group-hover:to-teal-600/5 rounded-2xl transition-all duration-300"></div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <button className="text-teal-300 hover:text-white transition-colors inline-flex items-center gap-2 group">
            Explore All Features
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
