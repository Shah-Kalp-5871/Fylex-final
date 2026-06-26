"use client";
import React, { useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * SmoothScroll component integrates Lenis for global smooth scrolling.
 * It is conditionally disabled on the Home page ('/') as requested.
 */
const SmoothScroll = ({ children }) => {
  const location = usePathname();
  const lenisRef = useRef(null);

  useLayoutEffect(() => {
    // Initialize Lenis for all pages

    // Initialize Lenis for other pages
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Synchronize Lenis with ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Add Lenis to GSAP ticker
    const gsapTicker = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(gsapTicker);

    // Lag smoothing for better performance
    gsap.ticker.lagSmoothing(0);
    
    return () => {
      lenis.destroy();
      gsap.ticker.remove(gsapTicker);
      lenisRef.current = null;
    };
  }, [location]);

  return <>{children}</>;
};

export default SmoothScroll;
