'use client';

import React, { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';
import Link from 'next/link';
import { fetchProducts } from '../../../lib/api';
import cmsService from '@/services/cms.service';
import { getFileUrl, resolveProductImage, getDisplayData } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

export default function Shop() {
  const container = useRef(null);
  const canvasRef = useRef(null);
  const mainWatchRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeWatchIndex, setActiveWatchIndex] = useState(0);
  const [videoSettings, setVideoSettings] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchProducts();
        const rawData = res.data || (Array.isArray(res) ? res : []);
        
        const hexToRgb = (hex) => {
          if (!hex) return '196, 163, 90';
          const cleanHex = hex.replace('#', '');
          const r = parseInt(cleanHex.substring(0, 2), 16);
          const g = parseInt(cleanHex.substring(2, 4), 16);
          const b = parseInt(cleanHex.substring(4, 6), 16);
          return `${r}, ${g}, ${b}`;
        };

        const mapped = rawData.map(p => {
          const display = getDisplayData(p);
          return {
            ...p,
            ...display,
            accentRgb: hexToRgb(p.accentColor || '#c4a35a'),
            mistRgb: hexToRgb(p.mistColor || p.accentColor || '#c4a35a'),
          };
        });
        setProducts(mapped);
        
        const { data: settings } = await cmsService.getVideoSettings();
        if (settings) {
          const videoMap = {};
          settings.forEach(s => {
            if (s.group === 'video' || s.group === 'shop_page') videoMap[s.key] = s.value;
          });
          setVideoSettings(videoMap);
        }
      } catch (err) {
        console.error('Failed to load shop data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const displayProducts = products;

  const watchImages = displayProducts.map(p => p.image);

  // Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(raf);
    };
  }, []);

  useGSAP(() => {
    // Reveal Utils
    const reveal = (sel, xFrom) => {
      gsap.utils.toArray(sel).forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, x: xFrom || 0, y: xFrom ? 0 : 28 },
          { opacity: 1, x: 0, y: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' } }
        );
      });
    };
    reveal('.r0'); reveal('.rl', -32); reveal('.rr', 32);

    // Hero Reveals
    gsap.utils.toArray('.r-hero, .hd').forEach((el, i) => {
      gsap.fromTo(el,
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 1.8, ease: 'power4.out', delay: 0.2 + (i * 0.1), scrollTrigger: { trigger: el, start: 'top 85%' } }
      );
    });

    gsap.utils.toArray('.r-dial').forEach((el, i) => {
      gsap.fromTo(el, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 1.5, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 80%' },
        delay: i * 0.2
      });
    });

    // Floating overlays
    gsap.to('.video-overlay', {
      y: '+=15',
      duration: 3,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true
    });

    // Feature Blocks
    gsap.utils.toArray('.fxt-feature-block').forEach(block => {
      const img = block.querySelector('img');
      const con = block.querySelector('.fxt-feature-con');
      if (img) {
        gsap.fromTo(img,
          { scale: 1.1, opacity: 0, x: -40 },
          { scale: 1, opacity: 1, x: 0, duration: 1.4, ease: 'power4.out', scrollTrigger: { trigger: block, start: 'top 80%' } }
        );
      }
      if (con) {
        gsap.fromTo(con,
          { opacity: 0, x: 40 },
          { opacity: 1, x: 0, duration: 1.2, ease: 'power3.out', delay: 0.2, scrollTrigger: { trigger: block, start: 'top 80%' } }
        );
      }
    });

    // Watch Sequence Animation (Canvas)
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      canvas.width = 1920;
      canvas.height = 1080;

      const frameCount = 210;
      const currentFrame = index => `watch/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`;

      const images = [];
      const airpods = { frame: 0 };

      for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        images.push(img);
      }

      const render = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        const img = images[airpods.frame];
        if (img) context.drawImage(img, 0, 0, canvas.width, canvas.height);
      };

      images[0].onload = render;

      gsap.to(airpods, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "none",
        scrollTrigger: {
          trigger: "#watch-sequence",
          pin: ".watch-sticky",
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5
        },
        onUpdate: render
      });
    }

    // Rotator Watch Set
    const isMobile = window.innerWidth <= 768;
    ScrollTrigger.create({
      trigger: "#rot",
      start: "top top",
      end: isMobile ? "+=120%" : "+=150%",
      pin: true,
      animation: gsap.fromTo(mainWatchRef.current,
        { y: isMobile ? '80vh' : '100vh', opacity: 0.5, scale: 0.8 },
        { y: '0vh', opacity: 1, scale: 1, ease: 'none' }
      ),
      scrub: 0.5
    });

  }, { scope: container });

  // Watch rotator interval logic
  useEffect(() => {
    if (!watchImages || watchImages.length === 0) return;
    
    const interval = setInterval(() => {
      handleWatchChange((activeWatchIndex + 1) % watchImages.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [activeWatchIndex, watchImages.length]);

  const handleWatchChange = (index) => {
    if (index === activeWatchIndex) return;

    // Cross-fade images
    gsap.to(mainWatchRef.current, {
      opacity: 0, duration: 0.4, ease: 'power2.inOut',
      onComplete: () => {
        setActiveWatchIndex(index);
        gsap.to(mainWatchRef.current, { opacity: 1, duration: 0.5, ease: 'power2.out' });
      }
    });

    // Cross-fade backgrounds
    const layers = container.current.querySelectorAll('.rbg-layer');
    if (layers.length > 0) {
      gsap.to(layers[activeWatchIndex], { opacity: 0, duration: 0.8, ease: 'power2.inOut' });
      gsap.to(layers[index], { opacity: 1, duration: 1.0, ease: 'power2.inOut' });
    }
  };

  return (
    <div ref={container}>
      <style>{`
        #hero {
          height: 100vh; min-height: 500px; position: relative; overflow: hidden; display: flex; align-items: center; background: #000000; color: #ffffff;
        }
        .yt-bg-wrap { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
        .hvideo {
          position: absolute; top: 50%; left: 50%; width: 100vw; height: 56.25vw;
          min-height: 100vh; min-width: 177.77vh; transform: translate(-50%, -50%);
          opacity: 1; border: none; pointer-events: none;
        }
        .hov { position: absolute; inset: 0; background: linear-gradient(100deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,.15) 40%, transparent 100%); }
        .video-overlay {
          position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; align-items: center;
          text-align: center; z-index: 10; color: var(--cream); padding: 0 24px;
        }
        .video-overlay h1, .video-overlay h2 {
          font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif; font-size: clamp(32px, 5vw, 68px); font-weight: 500; line-height: 1.1; margin-bottom: 24px; letter-spacing: -0.01em; text-shadow: 0 4px 16px rgba(0,0,0,0.6);
        }
        .video-overlay p {
          max-width: 600px; font-size: clamp(15px, 1.3vw, 18px); font-weight: 400; line-height: 1.8; letter-spacing: 0.02em; opacity: 0.95; text-shadow: 0 2px 10px rgba(0,0,0,0.8);
        }
        #watch-sequence { position: relative; height: 300vh; background: #000000; }
        .watch-sticky { width: 100%; height: 100vh; display: flex; justify-content: center; align-items: center; overflow: hidden; background: #000000; }
        #watch-canvas { width: 100%; height: 100%; object-fit: cover; }
        #rot { height: 100vh; position: relative; background: #000000; }
        .rst { position: relative; height: 100vh; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .rbs { position: absolute; inset: 0; z-index: 1; }
        .rbg-layer {
          position: absolute; inset: 0; opacity: 0; 
          transition: none; overflow: hidden;
        }
        .rbg-layer.active { opacity: 1; }

        .r-shadow { position: absolute; inset: -20%; background: radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.04) 75%); z-index: 1; }
        .r-mist { position: absolute; inset: -10%; filter: blur(60px); z-index: 2; opacity: 0.6; }
        .r-glow { position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 0%, transparent 60%); z-index: 3; }
        .r-side-shadow { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(0,0,0,0.18) 0%, transparent 50%); z-index: 4; }

        .g-1 { background-color: #fffbf2; }
        .g-1 .r-mist { background: radial-gradient(circle at 70% 30%, #f1e4d1 0%, transparent 70%); }
        
        .g-2 { background-color: #f0f4f8; }
        .g-2 .r-mist { background: radial-gradient(circle at 30% 70%, #d1d9e6 0%, transparent 70%); }
        
        .g-3 { background-color: #f0fdf4; }
        .g-3 .r-mist { background: radial-gradient(circle at 50% 50%, #dcfce7 0%, transparent 70%); }

        .rblur { position: absolute; inset: -10%; background: radial-gradient(circle at center, rgba(255,255,255,0.7), transparent); opacity: 0.2; filter: blur(40px); z-index: 2; pointer-events: none; }
        .watch-showcase { width: 100%; height: 100vh; display: flex; align-items: center; justify-content: center; z-index: 3; }
        #mainWatch { height: 70vh; max-width: 90vw; object-fit: contain; filter: drop-shadow(0 30px 60px rgba(28, 37, 53, 0.25)); transform: translateY(100vh); opacity: 0.5; will-change: transform, opacity; }
        .rtxt { position: absolute; left: 8vw; top: 50%; transform: translateY(-50%); z-index: 4; }
        .rtxt .hd { color: var(--navy); font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif; line-height: 1.05; letter-spacing: -0.01em; margin-bottom: 20px; font-weight: 500; }
        .rtxt .hd em { color: var(--fyl-gold); font-weight: 400; font-style: italic; }
        .rtxt .lbl { color: var(--fyl-gold); font-size: 12px; letter-spacing: 0.35em; text-transform: uppercase; margin-bottom: 12px; font-weight: 600; display: block; }
        .rtxt .rule { background: var(--fyl-gold); width: 40px; height: 2px; margin-bottom: 24px; }
        .bf { 
          display: inline-block; 
          padding: 8px 16px; 
          text-align: center; 
          font-size: 10px; 
          letter-spacing: .15em; 
          text-transform: uppercase; 
          font-family: 'Inter', sans-serif; 
          font-weight: 700; 
          background: #1a1a1a; 
          border: 1px solid #1a1a1a; 
          color: #fff; 
          cursor: pointer; 
          transition: all .4s cubic-bezier(0.23, 1, 0.32, 1); 
          border-radius: 999px; 
          text-decoration: none; 
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        .bf:hover, .bf:active { 
          background: rgba(255, 255, 255, 0.1) !important;
          color: #000000 !important;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }
        .rbtn-wrap { position: absolute; top: auto; bottom: 5vh; left: 50%; transform: translateX(-50%); width: 100%; text-align: center; z-index: 5; }
        .rpag { position: absolute; bottom: 12vh; left: 50%; transform: translateX(-50%); display: flex; gap: 16px; z-index: 10; }
        .rdot { width: 44px; height: 3px; background: rgba(28,46,74,0.15); cursor: pointer; transition: all .4s cubic-bezier(0.23, 1, 0.32, 1); border-radius: 2px; }
        .rdot.active { background: var(--navy); transform: scaleX(1.1); }
        #dial { background: #000000; padding: 100px 8vw; overflow: hidden; color: #ffffff; }
        .dwrap { max-width: 1280px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .dimg-col { position: relative; }
        .dimgf { position: relative; filter: drop-shadow(0 30px 60px rgba(0,0,0,.3)); }
        .dimgf::after { content: ''; position: absolute; inset: 20px; border: 1px solid rgba(255,255,255,.2); pointer-events: none; }
        .dimgf img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; border-radius: 4px; }
        .dcap { position: absolute; bottom: 0; left: 0; right: 0; padding: 28px 28px 32px; background: linear-gradient(to top, rgba(0,0,0,.8), transparent); border-bottom-left-radius: 4px; border-bottom-right-radius: 4px; }
        .dcap span { font-size: 11px; letter-spacing: .3em; text-transform: uppercase; color: rgba(255,255,255,.9); font-weight: 500;}
        .dtxt .hd { color: #ffffff; font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif; font-size: clamp(32px, 4.5vw, 56px); line-height: 1.1; letter-spacing: -0.01em; margin-bottom: 24px; font-weight: 500; }
        .dtxt .hd em { color: var(--fyl-gold); font-weight: 400; font-style: italic; }
        .dtxt .bt { max-width: 480px; font-size: 16px; line-height: 1.8; color: #cccccc; letter-spacing: 0.01em; font-weight: 400; }
        .dtxt .lbl { color: var(--fyl-gold); font-size: 12px; letter-spacing: 0.35em; text-transform: uppercase; margin-bottom: 12px; font-weight: 600; display: block; }
        .dtxt .rule { background: var(--fyl-gold); width: 40px; height: 2px; margin-bottom: 24px; }
        .dspecs { margin-top: 48px; display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid rgba(255,255,255,.08); }
        .dspec { padding: 24px 0 24px 24px; border-right: 1px solid rgba(255,255,255,.08); border-bottom: 1px solid rgba(255,255,255,.08); transition: background 0.4s; }
        .dspec:hover { background: rgba(255,255,255,.05); }
        .dspec:nth-child(even) { border-right: none; }
        .dspec:nth-last-child(-n+2) { border-bottom: none; }
        .dsv { font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif; font-size: 38px; font-weight: 400; color: #ffffff; margin-bottom: 6px; line-height: 1; }
        .dsl { font-size: 11px; letter-spacing: .25em; text-transform: uppercase; color: #aaaaaa; font-weight: 600; }
        #mv { background: #000000; padding: 100px 8vw; position: relative; overflow: hidden; color: #ffffff; }
        .mvbg { position: absolute; inset: 0; background: url('https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=1400&q=55') center/cover no-repeat; opacity: .15; filter: grayscale(1); }
        .mvhdr { text-align: center; margin-bottom: 60px; position: relative; z-index: 2; }
        .mvhdr .hd { color: #ffffff; font-size: clamp(32px, 4vw, 48px); font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif; font-weight: 500;}
        .mvhdr .hd em { color: var(--fyl-gold); font-style: italic; font-weight: 400;}
        .mvhdr .lbl { color: var(--fyl-gold); display: flex; justify-content: center; font-size: 12px; letter-spacing: 0.3em; text-transform: uppercase; margin-bottom: 12px; font-weight: 600;}
        .mvhdr .rule { background: var(--fyl-gold); margin: 0 auto 24px; width: 40px; height: 2px; }
        .mvhdr .bt { margin: 0 auto; text-align: center; max-width: 600px; color: #cccccc; line-height: 1.8; font-size: 16px; }
        .mvgrid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; position: relative; z-index: 2; }
        .mvcard { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,.1); border-radius: 12px; padding: 40px 32px; transition: background .4s, border-color .4s, transform .4s, box-shadow .4s; }
        .mvcard:hover { border-color: rgba(255,255,255,0.2); box-shadow: 0 16px 40px rgba(0,0,0,0.4); transform: translateY(-4px); z-index: 5; background: rgba(255, 255, 255, 0.1); }
        .mvico { margin-bottom: 24px; }
        .mvico svg { width: 36px; height: 36px; stroke: var(--fyl-gold); fill: none; stroke-width: 1.5; }
        .mvval { font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif; font-size: 36px; font-weight: 400; color: #ffffff; line-height: 1; margin-bottom: 8px; }
        .mvval sup { font-size: 16px; vertical-align: super; color: #aaaaaa; }
        .mvkey { font-size: 11px; letter-spacing: .25em; text-transform: uppercase; color: #ffffff; margin-bottom: 12px; font-weight: 600;}
        .mvdsc { font-size: 14px; line-height: 1.7; color: #aaaaaa; letter-spacing: 0.01em; }
        .mvphotos { max-width: 1200px; margin: 60px auto 0; display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; position: relative; z-index: 2; }
        .mvp { aspect-ratio: 3/4; overflow: hidden; position: relative; background: #000; }
        .mvp img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.8s cubic-bezier(.25,.46,.45,.94), opacity 0.8s; opacity: 0.7; }
        .mvp:hover img { transform: scale(1.08); opacity: 1; }
        .mvpl { position: absolute; bottom: 20px; left: 20px; font-size: 11px; letter-spacing: .25em; text-transform: uppercase; color: #FFF; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.8); pointer-events: none;}
        #vr { background: #000000; padding: 100px 8vw; color: #ffffff; }
        .vrhdr { text-align: center; margin-bottom: 60px; }
        .vrhdr .rule { margin: 0 auto 24px; width: 40px; height: 2px; background: var(--fyl-gold);}
        .vrhdr .lbl { color: var(--fyl-gold); display: flex; justify-content: center; font-size: 12px; letter-spacing: 0.3em; text-transform: uppercase; margin-bottom: 12px; font-weight: 600;}
        .vrhdr .hd { color: #ffffff; font-size: clamp(32px, 4vw, 48px); font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif; font-weight: 500;}
        .vrhdr .hd em { color: var(--fyl-gold); font-style: italic; font-weight: 400;}
        .vrgrid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
        .vc, .vc.feat { position: relative; cursor: pointer; background: rgba(255, 255, 255, 0.05) !important; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; transition: transform .4s cubic-bezier(.25,.46,.45,.94), box-shadow .4s, border-color .4s; display: flex; flex-direction: column; overflow: hidden; }
        .vc:hover { transform: translateY(-8px); box-shadow: 0 24px 48px rgba(0,0,0,.4); border-color: rgba(255, 255, 255, 0.2); }
        .vcimg { width: 100%; aspect-ratio: 4/3; overflow: hidden; position: relative; display: flex; align-items: center; justify-content: center; padding: 24px; background: transparent;}
        .vcimg img { width: 80%; height: 80%; object-fit: contain; transition: transform .7s ease; filter: drop-shadow(0 15px 25px rgba(0,0,0,0.4));}
        .vc:hover .vcimg img { transform: scale(1.06); }
        .vbdg { position: absolute; top: 16px; right: 16px; font-size: 10px; letter-spacing: .25em; text-transform: uppercase; color: var(--fyl-white); background: var(--fyl-gold); padding: 6px 14px; z-index: 3; font-weight: 600; border-radius: 99px; color: #000; }
        .vbody { padding: 32px; background: transparent !important; flex: 1; display: flex; flex-direction: column; }
        .vname { font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif; font-size: 24px; font-weight: 500; color: #ffffff !important; margin-bottom: 8px; }
        .vsub { font-size: 13px; color: #aaaaaa !important; letter-spacing: .02em; margin-bottom: 24px; line-height: 1.5; }
        .vprice { font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif; font-size: 24px; font-weight: 600; color: #ffffff !important; margin-bottom: 32px; margin-top: auto;}
        .vbtn { 
          display: block; 
          width: 100%; 
          padding: 8px 16px; 
          text-align: center; 
          font-size: 10px; 
          letter-spacing: .15em; 
          text-transform: uppercase; 
          font-family: 'Inter', sans-serif; 
          font-weight: 700; 
          background: #1a1a1a; 
          border: 1px solid #1a1a1a; 
          color: #fff; 
          cursor: pointer; 
          transition: all .4s cubic-bezier(0.23, 1, 0.32, 1); 
          border-radius: 999px; 
          text-decoration: none; 
          margin-top: 20px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        .vbtn:hover, .vbtn:active { 
          background: rgba(255, 255, 255, 0.1) !important;
          color: #000000 !important;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }
        .vc:hover .vbtn { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
        .vc.feat .vbtn { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
        .vc.feat:hover .vbtn { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
        #cta { position: relative; width: 100vw; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .ctaph { width: 100%; height: auto; object-fit: cover; filter: grayscale(1); display: block; }
        .shop-bt { color: #2c3e50; line-height: 1.85; letter-spacing: 0.02em; font-size: 16px; font-weight: 400; }

        @media (max-width: 1024px) {
          #dial { padding: 80px 5vw; }
          .dwrap { gap: 40px; }
          #mv { padding: 80px 5vw; }
          .mvgrid { grid-template-columns: 1fr 1fr; gap: 8px; }
          #vr { padding: 80px 5vw; }
        }
        @media (max-width: 768px) {
          .hcon { padding: 0 5vw; max-width: 100%; }
          #rot { height: 90vh; }
          .rst { height: 90vh; }
          .watch-showcase { height: 75vh; }
          #mainWatch { height: 45vh; }
          .rtxt { display: block; position: absolute; top: 15vh; left: 5vw; transform: none; z-index: 5; }
          .rpag { bottom: 5vh; }
          .rbtn-wrap { top: auto; bottom: 10vh; left: 50%; transform: translateX(-50%); width: 100%; text-align: center; }
          #dial { padding: 60px 5vw; }
          .dwrap { grid-template-columns: 1fr; gap: 40px; }
          .dspecs { margin-top: 32px; border-top: 1px solid rgba(0,0,0,.08); }
          .dsv { font-size: 32px; letter-spacing: -0.01em; }
          .dspec { padding: 20px 0 20px 0; border-right: 1px solid rgba(0,0,0,.08); }
          .dspec:nth-child(even) { border-right: none; padding-left: 20px; }
          #mv { padding: 60px 5vw; }
          .mvgrid { grid-template-columns: 1fr; gap: 8px; }
          .mvcard { padding: 32px 24px; }
          .mvphotos { grid-template-columns: 1fr 1fr; gap: 4px; margin-top: 32px; }
          .mvval { font-size: 32px; }
          #vr { padding: 60px 5vw; }
          .vrgrid { grid-template-columns: 1fr; gap: 24px; }
          .vrhdr { margin-bottom: 40px; }
          #dial-video { height: 60vh !important; }
          #heritage-2-video { height: 100svh !important; }
          #watch-sequence { height: 180vh; }
        }
        @media (max-width: 480px) {
          .video-overlay h1, .video-overlay h2 { font-size: clamp(26px, 8vw, 36px); }
          .video-overlay p { font-size: 14px; }
          #dial { padding: 50px 5vw; }
          .dspecs { grid-template-columns: 1fr 1fr; }
          .dsv { font-size: 26px; }
          #mv { padding: 50px 5vw; }
          .mvphotos { grid-template-columns: 1fr 1fr; }
          #vr { padding: 50px 5vw; }
          .vbody { padding: 24px; }
          .vprice { font-size: 20px; }
        }
        @media (max-width: 768px) and (orientation: landscape) {
          #hero, #rot, .rst { height: auto; min-height: 100vw; }
          .watch-showcase { height: 80vw; }
          #mainWatch { height: 70vw; }
          .video-overlay h1, .video-overlay h2 { font-size: clamp(22px, 5vw, 36px); }
        }
      `}</style>

      <section id="hero">
        <div className="yt-bg-wrap">
          {videoSettings.shop_hero_video_is_iframe === 'true' ? (
            <iframe className="hvideo" src={videoSettings.shop_hero_video} frameBorder="0" allow="autoplay; fullscreen" allowFullScreen></iframe>
          ) : (
            <video className="hvideo" src={getFileUrl(videoSettings.shop_hero_video) || "/Watch-iframe-3.mp4"} autoPlay loop muted playsInline></video>
          )}
        </div>
        <div className="hov" style={{ background: 'linear-gradient(100deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.2) 40%, transparent 100%)' }}></div>
        <div className="video-overlay">
          <span className="eyebrow" style={{ color: 'var(--fyl-gold)', letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, marginBottom: '16px', display: 'block' }}>
            {videoSettings.shop_hero_video_subtitle || "Exclusive Collection"}
          </span>
          <h1 className="r-hero" dangerouslySetInnerHTML={{ __html: videoSettings.shop_hero_video_title ? videoSettings.shop_hero_video_title.replace('Nautical Precision', '<em>Nautical Precision</em>') : "The Master of <br /><em>Nautical Precision</em>" }}></h1>
          <button className="bf" style={{ color: '#fff', borderColor: '#fff' }} onClick={() => document.querySelector('#rot').scrollIntoView({ behavior: 'smooth' })}>Discover More</button>
        </div>
      </section>

      <section id="watch-sequence">
        <div className="watch-sticky">
          <canvas id="watch-canvas" ref={canvasRef}></canvas>
        </div>
      </section>

      {/*
      <section id="rot">
        <div className="rst">
          <div className="rbs">
            {displayProducts.map((p, idx) => (
              <div 
                key={p.id || idx} 
                className={`rbg-layer ${activeWatchIndex === idx ? 'active' : ''}`} 
                style={{ 
                    opacity: activeWatchIndex === idx ? 1 : 0,
                    background: p.gradient || p.bgColor || '#fff'
                }}
              >
                <div className="r-shadow"></div>
                <div className="r-mist" style={{
                    background: `radial-gradient(circle at 70% 30%, rgba(${p.mistRgb || p.accentRgb || '196,163,90'}, 0.4) 0%, transparent 70%)`
                }}></div>
                <div className="r-glow"></div>
                <div className="r-side-shadow"></div>
              </div>
            ))}
          </div>
          <div className="rblur"></div>
          <div className="rtxt r0">
            <div className="lbl">Iconic Design</div>
            <div className="rule"></div>
            <h2 className="hd" style={{ fontSize: 'clamp(28px,2.8vw,44px)', maxWidth: '300px' }}>Our Best<br /><em>Watches</em></h2>
          </div>
          <div className="watch-showcase">
            <img id="mainWatch" ref={mainWatchRef} src={displayProducts[activeWatchIndex]?.image} alt="Fylex Watch" />
          </div>
          <div className="rbtn-wrap r0">
            <Link href="/discover" className="bf">Discover our watches</Link>
          </div>
          <div className="rpag" id="rpag">
            {displayProducts.map((_, idx) => (
              <div 
                key={idx} 
                className={`rdot ${activeWatchIndex === idx ? 'active' : ''}`} 
                onClick={() => handleWatchChange(idx)}
              ></div>
            ))}
          </div>
        </div>
      </section>
      */}

      <section id="dial-video" style={{ height: '120vh', position: 'relative', overflow: 'hidden', background: '#000' }}>
        <div className="yt-bg-wrap">
          {videoSettings.shop_deepsea_video_is_iframe === 'true' ? (
            <iframe className="hvideo" src={videoSettings.shop_deepsea_video} frameBorder="0" allow="autoplay; fullscreen" allowFullScreen></iframe>
          ) : (
            <video className="hvideo" src={getFileUrl(videoSettings.shop_deepsea_video) || "/Watch-iframe-2.mp4"} autoPlay loop muted playsInline></video>
          )}
        </div>
        <div className="hov" style={{ background: 'rgba(0,0,0,0.35)' }}></div>
        <div className="video-overlay">
          <h2 className="r-dial" dangerouslySetInnerHTML={{ __html: videoSettings.shop_deepsea_video_title ? videoSettings.shop_deepsea_video_title.replace('Chronometry', '<em>Chronometry</em>') : "Deep Sea <br /><em>Chronometry</em>" }}></h2>
          <p className="r-dial">{videoSettings.shop_deepsea_video_subtitle || "Engineered for the abyss, where pressure defines excellence."}</p>
        </div>
      </section>

      <section id="dial">
        <div className="dwrap">
          <div className="dimg-col rl">
            <div className="dimgf">
              <img src={getFileUrl(videoSettings.shop_dial_image) || "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=900&q=85"} alt="Fylex Dial" loading="lazy" />
              <div className="dcap"><span>{videoSettings.shop_dial_caption || 'Fylex Master · Ref. FX-3200'}</span></div>
            </div>
          </div>
          <div className="dtxt">
            <div className="lbl r0">{videoSettings.shop_dial_label || 'The Hallmark of Prestige'}</div>
            <div className="rule r0"></div>
            <h2 className="hd r0" style={{ marginTop: '24px' }} dangerouslySetInnerHTML={{ __html: videoSettings.shop_dial_title || 'Exquisite<br /><em>Mastery</em>' }}></h2>
            <p className="shop-bt r0">{videoSettings.shop_dial_desc || 'Every element of the Fylex Master dial is obsessively hand-finished in La Chaux-de-Fonds. Applied luminescent indices, guilloché sunburst texture and meteorite-inspired lacquer create a timepiece commanding presence.'}</p>
            <div className="dspecs r0">
              <div className="dspec">
                <div className="dsv" dangerouslySetInnerHTML={{ __html: videoSettings.shop_dial_spec1_val || '±1<span style="font-size: 16px; opacity: .45">s</span>' }}></div>
                <div className="dsl">{videoSettings.shop_dial_spec1_lbl || 'Daily Accuracy'}</div>
              </div>
              <div className="dspec">
                <div className="dsv" dangerouslySetInnerHTML={{ __html: videoSettings.shop_dial_spec2_val || '72<span style="font-size: 16px; opacity: .45">h</span>' }}></div>
                <div className="dsl">{videoSettings.shop_dial_spec2_lbl || 'Power Reserve'}</div>
              </div>
              <div className="dspec">
                <div className="dsv" dangerouslySetInnerHTML={{ __html: videoSettings.shop_dial_spec3_val || '31' }}></div>
                <div className="dsl">{videoSettings.shop_dial_spec3_lbl || 'Jewels'}</div>
              </div>
              <div className="dspec">
                <div className="dsv" dangerouslySetInnerHTML={{ __html: videoSettings.shop_dial_spec4_val || '300<span style="font-size: 16px; opacity: .45">m</span>' }}></div>
                <div className="dsl">{videoSettings.shop_dial_spec4_lbl || 'Water Resistance'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="heritage-2-video" style={{ height: '120vh', position: 'relative', overflow: 'hidden', background: '#000' }}>
        <div className="yt-bg-wrap">
          {videoSettings.shop_precision_video_is_iframe === 'true' ? (
            <iframe className="hvideo" src={videoSettings.shop_precision_video} frameBorder="0" allow="autoplay; fullscreen" allowFullScreen></iframe>
          ) : (
            <video className="hvideo" src={getFileUrl(videoSettings.shop_precision_video) || "/Watch_Iframe_1.mp4"} autoPlay loop muted playsInline></video>
          )}
        </div>
        <div className="hov" style={{ background: 'rgba(0,0,0,0.35)' }}></div>
        <div className="video-overlay">
          <h2 className="r-hero" dangerouslySetInnerHTML={{ __html: videoSettings.shop_precision_video_title ? videoSettings.shop_precision_video_title.replace('Precision', '<em>Precision</em>') : "The Art of <em>Precision</em>" }}></h2>
          <p className="r-hero">{videoSettings.shop_precision_video_subtitle || "Every Fylex timepiece is born from a relentless pursuit of perfection."}</p>
        </div>
      </section>

      <section id="mv">
        <div className="mvhdr r0">
          <div className="lbl">{videoSettings.shop_mv_label || 'Calibre FX-3200'}</div>
          <div className="rule"></div>
          <h2 className="hd" dangerouslySetInnerHTML={{ __html: videoSettings.shop_mv_title || 'The heart of<br /><em>precision</em>' }}></h2>
          <p className="shop-bt" style={{ marginTop: '20px' }}>{videoSettings.shop_mv_desc || 'In-house movement, 14 years of R&D, manufactured and assembled entirely in Geneva. Superlative Chronometer certified to ±1 second per day.'}</p>
        </div>
        <div className="mvbg"></div>
        <div className="mvgrid">
          <div className="mvcard r0">
            <div className="mvico"><svg viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="16" />
              <line x1="20" y1="4" x2="20" y2="10" />
              <line x1="20" y1="30" x2="20" y2="36" />
              <line x1="4" y1="20" x2="10" y2="20" />
              <line x1="30" y1="20" x2="36" y2="20" />
              <circle cx="20" cy="20" r="4" />
            </svg></div>
            <div className="mvkey">{videoSettings.shop_mv_card1_key || 'Frequency'}</div>
            <div className="mvval" dangerouslySetInnerHTML={{ __html: videoSettings.shop_mv_card1_val || '28<sup>,800 vph</sup>' }}></div>
            <div className="mvdsc">{videoSettings.shop_mv_card1_desc || '4 Hz oscillation for silky smooth seconds sweep. Beats in perfect time, every time.'}</div>
          </div>
          <div className="mvcard r0">
            <div className="mvico"><svg viewBox="0 0 40 40">
              <path d="M20 4 L36 20 L20 36 L4 20 Z" />
              <path d="M20 12 L28 20 L20 28 L12 20 Z" />
              <circle cx="20" cy="20" r="3" />
            </svg></div>
            <div className="mvkey">{videoSettings.shop_mv_card2_key || 'Power Reserve'}</div>
            <div className="mvval" dangerouslySetInnerHTML={{ __html: videoSettings.shop_mv_card2_val || '72<sup>h</sup>' }}></div>
            <div className="mvdsc">{videoSettings.shop_mv_card2_desc || 'Dual mainspring barrel architecture provides three full days of operation.'}</div>
          </div>
          <div className="mvcard r0">
            <div className="mvico"><svg viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="15" />
              <circle cx="20" cy="20" r="8" />
              <line x1="20" y1="5" x2="20" y2="12" />
              <line x1="20" y1="28" x2="20" y2="35" />
              <line x1="5" y1="20" x2="12" y2="20" />
              <line x1="28" y1="20" x2="35" y2="20" />
            </svg></div>
            <div className="mvkey">{videoSettings.shop_mv_card3_key || 'Certification'}</div>
            <div className="mvval" dangerouslySetInnerHTML={{ __html: videoSettings.shop_mv_card3_val || 'COSC' }}></div>
            <div className="mvdsc">{videoSettings.shop_mv_card3_desc || 'Superlative Chronometer certified to ±1 second per day across all conditions.'}</div>
          </div>
        </div>
        <div className="mvphotos">
          <div className="mvp r0"><img src={getFileUrl(videoSettings.shop_mv_photo1_img) || "https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=500&q=76"}
            alt="Balance wheel" loading="lazy" /><span className="mvpl">{videoSettings.shop_mv_photo1_lbl || 'Balance Wheel'}</span></div>
          <div className="mvp r0"><img src={getFileUrl(videoSettings.shop_mv_photo2_img) || "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=500&q=76"}
            alt="Escapement" loading="lazy" /><span className="mvpl">{videoSettings.shop_mv_photo2_lbl || 'Escapement'}</span></div>
          <div className="mvp r0"><img src={getFileUrl(videoSettings.shop_mv_photo3_img) || "https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=500&q=76"}
            alt="Main Barrel" loading="lazy" /><span className="mvpl">{videoSettings.shop_mv_photo3_lbl || 'Main Barrel'}</span></div>
          <div className="mvp r0"><img src={getFileUrl(videoSettings.shop_mv_photo4_img) || "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=500&q=76"} alt="Rotor"
            loading="lazy" /><span className="mvpl">{videoSettings.shop_mv_photo4_lbl || 'Self-winding Rotor'}</span></div>
        </div>
      </section>
    </div>
  );
}
