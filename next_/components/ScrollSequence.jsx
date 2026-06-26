"use client";
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ScrollSequence = ({ 
  frameCount = 126, 
  baseUrl = '/assets/newframes/ezgif-frame-', 
  extension = '.jpg',
  scrollDistance = '300%' // How long the scroll lasts
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // Preload images
  useEffect(() => {
    let loadedCount = 0;
    const loadedImages = [];

    const preload = () => {
      for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        const frameNumber = String(i).padStart(3, '0');
        img.src = `${baseUrl}${frameNumber}${extension}`;
        img.onload = () => {
          loadedCount++;
          if (loadedCount === frameCount) {
            setImages(loadedImages);
            setIsLoading(false);
          }
        };
        loadedImages[i - 1] = img;
      }
    };

    preload();
  }, [frameCount, baseUrl, extension]);

  // Handle render
  const render = useCallback((index) => {
    if (images[index] && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const img = images[index];

      // Responsive canvas sizing
      const ratio = img.width / img.height;
      const windowRatio = window.innerWidth / window.innerHeight;

      if (windowRatio > ratio) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerWidth / ratio;
      } else {
        canvas.height = window.innerHeight;
        canvas.width = window.innerHeight * ratio;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  }, [images]);

  // GSAP ScrollTrigger
  useEffect(() => {
    if (isLoading || images.length === 0) return;

    // Initial render
    render(0);

    const scrollTrigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: `+=${scrollDistance}`,
      pin: true,
      scrub: 0.5, // Smooth scrubbing
      onUpdate: (self) => {
        const frameIndex = Math.min(
          frameCount - 1,
          Math.floor(self.progress * frameCount)
        );
        render(frameIndex);
        setProgress(self.progress);
      }
    });

    // Handle resize
    const handleResize = () => render(Math.floor(scrollTrigger.progress * frameCount));
    window.addEventListener('resize', handleResize);

    return () => {
      scrollTrigger.kill();
      window.removeEventListener('resize', handleResize);
    };
  }, [isLoading, images, frameCount, scrollDistance, render]);

  return (
    <div 
      ref={containerRef} 
      className="scroll-sequence-container"
      style={{
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#000'
      }}
    >
      {isLoading ? (
        <div className="loading-overlay" style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          zIndex: 10
        }}>
          <span>Loading Experience...</span>
        </div>
      ) : null}
      
      <canvas 
        ref={canvasRef} 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          objectFit: 'cover'
        }}
      />

      <div className="scroll-content" style={{
        position: 'absolute',
        bottom: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        color: '#fff',
        zIndex: 5,
        opacity: 1 - progress * 2, // Fade out as we scroll
        pointerEvents: 'none'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 300, letterSpacing: '0.2em' }}>SCROLL TO DISCOVER</h2>
        <div className="mouse-icon" style={{
          width: '24px',
          height: '40px',
          border: '2px solid #fff',
          borderRadius: '12px',
          margin: '10px auto',
          position: 'relative'
        }}>
          <div className="wheel" style={{
            width: '4px',
            height: '8px',
            backgroundColor: '#fff',
            borderRadius: '2px',
            position: 'absolute',
            top: '6px',
            left: '50%',
            transform: 'translateX(-50%)',
            animation: 'scroll-wheel 2s infinite'
          }} />
        </div>
      </div>

      <style>{`
        @keyframes scroll-wheel {
          0% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, 15px); }
        }
      `}</style>
    </div>
  );
};

export default ScrollSequence;
