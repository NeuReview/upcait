import React from 'react';

const GeometricShapes = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large Circles */}
      <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-br from-neural-purple/10 to-tech-lavender/10 blur-3xl animate-float"></div>
      <div className="absolute top-1/3 -left-32 w-64 h-64 rounded-full bg-gradient-to-br from-success-gold/10 to-energy-orange/10 blur-2xl animate-float-delayed"></div>
      <div className="absolute bottom-1/4 right-1/3 w-48 h-48 rounded-full bg-gradient-to-br from-growth-green/10 to-tech-lavender/10 blur-xl animate-float"></div>
      
      {/* Small Circles */}
      <div className="absolute top-1/4 right-1/2 w-4 h-4 rounded-full bg-neural-purple/20 animate-ping"></div>
      <div className="absolute bottom-1/3 right-1/4 w-3 h-3 rounded-full bg-success-gold/20 animate-ping-delayed"></div>
      <div className="absolute top-1/2 left-1/4 w-2 h-2 rounded-full bg-tech-lavender/20 animate-ping-slow"></div>
      
      {/* Squares */}
      <div className="absolute top-1/4 right-1/4 w-24 h-24 rotate-45 bg-neural-purple/5 animate-spin-slow"></div>
      <div className="absolute bottom-1/3 left-1/4 w-32 h-32 rotate-12 border-2 border-tech-lavender/10 animate-bounce-slow"></div>
      <div className="absolute top-1/2 right-1/3 w-16 h-16 transform rotate-45 bg-success-gold/5 animate-pulse"></div>
      
      {/* Triangles */}
      <div className="absolute top-1/3 right-1/3">
        <div className="w-0 h-0 border-l-[20px] border-l-transparent border-b-[35px] border-b-neural-purple/10 border-r-[20px] border-r-transparent animate-float"></div>
      </div>
      <div className="absolute bottom-1/4 left-1/3">
        <div className="w-0 h-0 border-l-[15px] border-l-transparent border-b-[25px] border-b-tech-lavender/10 border-r-[15px] border-r-transparent animate-float-delayed"></div>
      </div>
      
      {/* Dots Grid */}
      <div className="absolute top-1/4 left-1/3 grid grid-cols-3 gap-4 rotate-12 animate-float">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-neural-purple/20"></div>
        ))}
      </div>
      <div className="absolute bottom-1/3 right-1/4 grid grid-cols-2 gap-3 -rotate-12 animate-float-delayed">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-success-gold/20"></div>
        ))}
      </div>
      
      {/* Lines */}
      <div className="absolute bottom-1/4 right-1/4 w-32 h-px bg-gradient-to-r from-neural-purple/0 via-neural-purple/10 to-neural-purple/0 rotate-45"></div>
      <div className="absolute top-1/3 left-1/3 w-px h-32 bg-gradient-to-b from-tech-lavender/0 via-tech-lavender/10 to-tech-lavender/0"></div>
      <div className="absolute top-2/3 right-1/3 w-24 h-px bg-gradient-to-r from-success-gold/0 via-success-gold/10 to-success-gold/0 -rotate-45"></div>
      
      {/* Hexagons */}
      <div className="absolute top-1/2 left-1/2 w-16 h-16 transform rotate-90">
        <div className="w-full h-full border-2 border-neural-purple/10 clip-hexagon animate-spin-slow"></div>
      </div>
      <div className="absolute bottom-1/4 left-1/4 w-12 h-12">
        <div className="w-full h-full border border-tech-lavender/10 clip-hexagon animate-float"></div>
      </div>
    </div>
  );
};

export default GeometricShapes; 