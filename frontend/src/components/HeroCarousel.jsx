import React, { useState, useEffect } from 'react';

const slides = [
  {
    icon: "🎓",
    title: "Find Research Faster",
    description: "Stop browsing through folders. Discover relevant papers in seconds with intelligent search.",
    gradient: "from-orange-500 to-red-500",
    bgImage: "url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=400&fit=crop')"
  },
  {
    icon: "📚",
    title: "Your Academic Library",
    description: "Upload, organize, and search through all your research papers in one central place.",
    gradient: "from-emerald-500 to-teal-500",
    bgImage: "url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&h=400&fit=crop')"
  },
  {
    icon: "🔬",
    title: "Smart Document Discovery",
    description: "Our intelligent system finds the most relevant papers based on your search terms.",
    gradient: "from-blue-500 to-indigo-500",
    bgImage: "url('https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&h=400&fit=crop')"
  },
  {
    icon: "⚡",
    title: "Instant Results",
    description: "Get ranked, relevant research papers in milliseconds, not minutes.",
    gradient: "from-purple-500 to-pink-500",
    bgImage: "url('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=400&fit=crop')"
  }
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % slides.length);
        setIsAnimating(false);
      }, 400);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (i) => {
    setIsAnimating(true);
    setTimeout(() => {
      setIndex(i);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-xl">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ 
          backgroundImage: slides[index].bgImage,
          filter: 'brightness(0.85)'
        }}
      />
      
      {/* Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r ${slides[index].gradient} opacity-75 transition-all duration-500`}></div>
      
      {/* Animated pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1.5px, transparent 1.5px)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Content */}
      <div className="relative p-8 md:p-12 text-center text-white">
        <div className={`transform transition-all duration-500 ${isAnimating ? 'scale-90 opacity-0' : 'scale-100 opacity-100'}`}>
          {/* Large Animated Icon */}
          <div className="text-7xl md:text-8xl mb-6 animate-float">
            {slides[index].icon}
          </div>
          
          {/* Title */}
          <h2 className="text-2xl md:text-4xl font-bold mb-4 max-w-2xl mx-auto">
            {slides[index].title}
          </h2>
          
          {/* Description */}
          <p className="text-white/95 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {slides[index].description}
          </p>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`transition-all duration-300 rounded-full ${
                i === index 
                  ? 'bg-white w-8 h-2.5' 
                  : 'bg-white/40 hover:bg-white/60 w-2 h-2'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

