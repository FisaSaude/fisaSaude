import { ImageWithFallback } from './figma/ImageWithFallback';
import furniturePalette from '../../imports/AdobeColor-N_I_S_H_I_K_I_G_O_-_Furniture_Design_Award_2014.jpeg';

const galleryItems = [
  {
    title: 'Modern Workspace',
    category: 'Design System',
    image: 'https://images.unsplash.com/photo-1770816307096-b0e9cdf08bc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3BhY2UlMjB0ZWFsJTIwZGVzaWdufGVufDF8fHx8MTc3NTAwMDE0MHww&ixlib=rb-4.1.0&q=80&w=1080',
    size: 'large'
  },
  {
    title: 'Minimalist Interior',
    category: 'UI Components',
    image: 'https://images.unsplash.com/photo-1705321963943-de94bb3f0dd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwaW50ZXJpb3IlMjBkZXNpZ258ZW58MXx8fHwxNzc0OTQ3NTk0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    size: 'medium'
  },
  {
    title: 'Geometric Patterns',
    category: 'Typography',
    image: 'https://images.unsplash.com/photo-1595411425732-e69c1abe2763?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGdlb21ldHJpYyUyMHBhdHRlcm58ZW58MXx8fHwxNzc0OTg0MDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    size: 'medium'
  },
  {
    title: 'Creative Studio',
    category: 'Interactive',
    image: 'https://images.unsplash.com/photo-1730206562928-0efd62560435?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHN0dWRpbyUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NzQ5NzQ0NzB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    size: 'large'
  }
];

export function Gallery() {
  return (
    <section id="gallery" className="py-20 sm:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-teal-900/40 backdrop-blur-sm border border-teal-400/30 rounded-full px-4 py-2 mb-6">
            <span className="text-sm text-teal-100">Gallery</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-white mb-4">
            Showcase
          </h2>
          <p className="text-lg text-teal-100 max-w-2xl mx-auto">
            Explore stunning prototypes created by our community of designers.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Featured Large Item */}
          <div className="md:col-span-2 lg:col-span-2 group relative overflow-hidden rounded-2xl">
            <ImageWithFallback
              src={galleryItems[0].image}
              alt={galleryItems[0].title}
              className="w-full h-[400px] object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="text-teal-300 text-sm">{galleryItems[0].category}</span>
                <h3 className="text-2xl text-white mt-1">{galleryItems[0].title}</h3>
              </div>
            </div>
          </div>

          {/* Medium Item */}
          <div className="group relative overflow-hidden rounded-2xl">
            <ImageWithFallback
              src={galleryItems[1].image}
              alt={galleryItems[1].title}
              className="w-full h-[400px] object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="text-teal-300 text-sm">{galleryItems[1].category}</span>
                <h3 className="text-xl text-white mt-1">{galleryItems[1].title}</h3>
              </div>
            </div>
          </div>

          {/* Medium Item with Palette */}
          <div className="group relative overflow-hidden rounded-2xl">
            <img
              src={furniturePalette}
              alt="Furniture Design Palette"
              className="w-full h-[300px] object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="text-teal-300 text-sm">Color Palette</span>
                <h3 className="text-xl text-white mt-1">Furniture Design</h3>
              </div>
            </div>
          </div>

          {/* Medium Item */}
          <div className="group relative overflow-hidden rounded-2xl">
            <ImageWithFallback
              src={galleryItems[2].image}
              alt={galleryItems[2].title}
              className="w-full h-[300px] object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="text-teal-300 text-sm">{galleryItems[2].category}</span>
                <h3 className="text-xl text-white mt-1">{galleryItems[2].title}</h3>
              </div>
            </div>
          </div>

          {/* Large Bottom Item */}
          <div className="md:col-span-2 lg:col-span-2 group relative overflow-hidden rounded-2xl">
            <ImageWithFallback
              src={galleryItems[3].image}
              alt={galleryItems[3].title}
              className="w-full h-[300px] object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="text-teal-300 text-sm">{galleryItems[3].category}</span>
                <h3 className="text-2xl text-white mt-1">{galleryItems[3].title}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* View More Button */}
        <div className="mt-12 text-center">
          <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg border border-white/20 transition-all">
            View More Projects
          </button>
        </div>
      </div>
    </section>
  );
}
