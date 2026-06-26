"use client";
import React from 'react';
import ScrollSequence from '@/components/ScrollSequence';

const ScrollTest = () => {
  return (
    <div className="scroll-test-page">
      {/* Top Spacer */}
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', color: '#fff' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 300, letterSpacing: '0.1em' }}><img src="/fylex.png" alt="FYLEXX" style={{ height: '2.5em', display: 'inline-block', verticalAlign: 'middle', transform: 'translateY(-0.1em)' }} /> PRECISION</h1>
      </div>

      {/* The Scroll Sequence Component */}
      <ScrollSequence 
        frameCount={126}
        baseUrl="/assets/newframes/ezgif-frame-"
        scrollDistance="400%" // 4 viewports worth of scroll
      />

      {/* Bottom Spacer */}
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', color: '#111' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>ENGINEERED EXCELLENCE</h2>
          <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', opacity: 0.7 }}>
            Experience the pinnacle of mechanical watchmaking through our interactive 3D scroll sequence. 
            Every frame captures the intricate dance of gears and springs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScrollTest;
