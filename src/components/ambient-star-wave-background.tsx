/**
 * Ambient Star Wave Background
 * 
 * A reusable animated background component that displays stars
 * moving in wave patterns across the screen while falling downward.
 * 
 * Usage: Place at the top of any page/section with relative positioning:
 * <div className="relative">
 *   <AmbientStarWaveBackground />
 *   ... your content here ...
 * </div>
 */

export function AmbientStarWaveBackground() {
  // Generate random animation delay (negative to start mid-animation)
  const getRandomDelay = (baseDuration: number) => {
    // Random delay between 0 and -baseDuration to start at different points in animation
    return `${-Math.random() * baseDuration}s`;
  };
  
  return (
    <div className="starfall-container" aria-hidden="true">
      {/* Wave Left-to-Right stars - distributed across screen */}
      <div className="starwave-across-container">
        <div className="star wave-across" style={{ left: '10%', animationDelay: getRandomDelay(8) } as React.CSSProperties}></div>
        <div className="star wave-across pink" style={{ left: '25%', animationDelay: getRandomDelay(9) } as React.CSSProperties}></div>
        <div className="star wave-across medium" style={{ left: '40%', animationDelay: getRandomDelay(7.5) } as React.CSSProperties}></div>
        <div className="star wave-across cyan" style={{ left: '55%', animationDelay: getRandomDelay(8.5) } as React.CSSProperties}></div>
        <div className="star wave-across" style={{ left: '70%', animationDelay: getRandomDelay(7.8) } as React.CSSProperties}></div>
        <div className="star wave-across pink medium" style={{ left: '85%', animationDelay: getRandomDelay(9.2) } as React.CSSProperties}></div>
        <div className="star wave-across cyan" style={{ left: '30%', animationDelay: getRandomDelay(8.3) } as React.CSSProperties}></div>
        <div className="star wave-across medium" style={{ left: '60%', animationDelay: getRandomDelay(7.6) } as React.CSSProperties}></div>
      </div>
      
      {/* Wave Right-to-Left stars - distributed across screen */}
      <div className="starwave-reverse-container">
        <div className="star wave-reverse cyan" style={{ left: '15%', animationDelay: getRandomDelay(8.2) } as React.CSSProperties}></div>
        <div className="star wave-reverse medium" style={{ left: '35%', animationDelay: getRandomDelay(9.1) } as React.CSSProperties}></div>
        <div className="star wave-reverse pink" style={{ left: '50%', animationDelay: getRandomDelay(7.7) } as React.CSSProperties}></div>
        <div className="star wave-reverse" style={{ left: '65%', animationDelay: getRandomDelay(8.4) } as React.CSSProperties}></div>
        <div className="star wave-reverse cyan medium" style={{ left: '80%', animationDelay: getRandomDelay(9.4) } as React.CSSProperties}></div>
        <div className="star wave-reverse pink" style={{ left: '20%', animationDelay: getRandomDelay(7.3) } as React.CSSProperties}></div>
        <div className="star wave-reverse" style={{ left: '45%', animationDelay: getRandomDelay(8.9) } as React.CSSProperties}></div>
        <div className="star wave-reverse medium" style={{ left: '75%', animationDelay: getRandomDelay(9.6) } as React.CSSProperties}></div>
      </div>
    </div>
  );
}