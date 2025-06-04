import { motion, useAnimation } from "framer-motion";
import { useState, useRef } from "react";

const NUM_STRIPES = 11;

const GlitchStripesLogo = ({ src, alt = "website logo", className = "" }) => {
  const controlsArray = useRef(Array.from({ length: NUM_STRIPES }, () => useAnimation()));

  const [isHover, setIsHover] = useState(false);
  const intervalRef = useRef(null);

  const startGlitch = () => {
    controlsArray.current.forEach((control) => {
      const randomX = Math.random() * 15 - 10;
      control.start({
        x: [0, randomX, 0],
        transition: { duration: 0.2, ease: "easeIn" }
      });
    });
  };

  const stopGlitch = () => {
    controlsArray.current.forEach((control) => {
      control.start({ x: 0, transition: { duration: 0.2, ease: "easeOut" } });
    });
  };

  const colorChannels = [
    { filter: "drop-shadow(-2px 0 red)", shift: -1 },
    { filter: "drop-shadow(2px 0 lime)", shift: 1 },
    { filter: "drop-shadow(2px 1px blue)", shift: 0 },
  ];

  const overlap = 2;

  const handleMouseEnter = () => {
    setIsHover(true);
    startGlitch();
    intervalRef.current = setInterval(startGlitch, 300);
  };

  const handleMouseLeave = () => {
    clearInterval(intervalRef.current);
    stopGlitch();
    setIsHover(false);
  };

  return (
    <div
      className={`relative w-20 h-20 cursor-pointer ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {!isHover && (
        <img src={src} alt={alt} className="w-full h-full object-contain" />
      )}

      {isHover && (
        <>
          {Array.from({ length: NUM_STRIPES }).map((_, i) => {
            const topPercent = (100 / NUM_STRIPES) * i - (i === 0 ? 0 : overlap);
            const bottomPercent = 100 - (100 / NUM_STRIPES) * (i + 1) - (i === NUM_STRIPES - 1 ? 0 : -overlap);

            return (
              <motion.img
                key={i}
                src={src}
                alt={alt}
                animate={controlsArray.current[i]}
                className="absolute w-full h-full object-contain"
                style={{
                  clipPath: `inset(${topPercent}% 0 ${bottomPercent}% 0)`
                }}
              />
            );
          })}

          {colorChannels.map(({ filter, shift }, channelIdx) => (
            <div
              key={channelIdx}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{
                filter,
                mixBlendMode: "screen",
              }}
            >
              {Array.from({ length: NUM_STRIPES }).map((_, i) => {
                const topPercent = (100 / NUM_STRIPES) * i - (i === 0 ? 0 : overlap);
                const bottomPercent = 100 - (100 / NUM_STRIPES) * (i + 1) - (i === NUM_STRIPES - 1 ? 0 : -overlap);

                return (
                  <motion.img
                    key={i}
                    src={src}
                    alt={alt}
                    animate={controlsArray.current[i]}
                    className="absolute w-full h-full object-contain"
                    style={{
                      clipPath: `inset(${topPercent}% 0 ${bottomPercent}% 0)`,
                      x: shift,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default GlitchStripesLogo;
