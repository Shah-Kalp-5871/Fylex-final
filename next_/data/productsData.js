/**
 * Shared product data for Products page and Configure page.
 * When an admin panel is added, this static data can be replaced
 * by an API call to fetch products dynamically.
 */

const productsData = [
  {
    id: 'gold',
    num: '01',
    title: 'Datejust',
    titleAccent: 'Gold',
    subtitle: 'High Horology',
    tagline: 'Timeless Elegance',
    shortDesc: 'A masterpiece of precision, blending the heritage of technical mastery with the warmth of 18k yellow gold.',
    longDesc: 'The Datejust Gold is the quintessence of horological excellence. Crafted for the discerning connoisseur, every surface is hand-polished to capture the light in its purest form. The dial, a work of art in champagne gold, is adorned with luminous hour markers that speak of a commitment to visibility and design purity. Its Oyster case, a fortress of waterproof integrity, houses the Calibre 3235 — an engine of perpetual precision that powers the date function with an instantaneous jump at midnight.',
    heroImage: '/assets/fylex-watch-v2/premium.png',
    galleryImages: [
      '/assets/fylex-watch-v2/premium.png',
      '/assets/fylex-watch-v2/goldwatch.png',
      '/assets/fylex-watch-v2/olive-green.png',
      '/assets/fylex-watch-v2/chocolate.png',
      '/assets/fylex-watch-v2/premium.png',
    ],
    videoUrl: '/Watch_Iframe_1.mp4',
    bgColor: '#f8f6f1',
    accentColor: '#c4a35a',
    textColor: '#1a1a1a',
    theme: 'champagne',
    category: 'Classic',
    price: '$12,400',
    heritageText: 'Since its inception in 1945, the Datejust has been a symbol of style and achievement. Worn by visionaries and leaders across the globe, it was the first self-winding waterproof chronometer wristwatch to display the date in a window at 3 o\'clock on the dial.',
    // For Products page gradient/mist
    gradient: 'radial-gradient(at 0% 0%, rgba(196,163,90,0.25) 0, transparent 70%), radial-gradient(at 80% 20%, rgba(255,255,255,1) 0, transparent 40%), radial-gradient(at 100% 100%, rgba(196,163,90,0.12) 0, transparent 60%), linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 100%)',
    mistColor: 'rgba(196,163,90,0.15)',
    totalStock: 300,
    sold: 12,
    combinations: [
      { id: '001', name: 'Oyster, Yellow Gold, Fluted, Olive Green', img: '/assets/fylex-watch-v2/Olive-green-dial.png' },
      { id: '002', name: 'Oyster, Yellow Gold, Brilliant Diamond, Meteorite', img: '/assets/fylex-watch-v2/metoritedial.png' }
    ]
  },
  {
    id: 'blue',
    num: '02',
    title: 'Submariner',
    titleAccent: 'Blue',
    subtitle: 'Nautical Precision',
    tagline: 'Built for Depth',
    shortDesc: 'Forged for the deep, this iconic diver\'s watch features a royal blue dial that captures the essence of the ocean.',
    longDesc: 'The Submariner Blue is the definitive diver\'s watch, born from decades of underwater exploration. Its unidirectional rotating bezel, graduated in Cerachrom ceramic, allows divers to accurately and safely monitor their immersion time. Beneath its sapphire crystal lies a sunray blue dial of extraordinary depth, evoking the very waters it was designed to conquer. The Oystersteel case ensures unparalleled corrosion resistance, while the Glidelock extension system allows for seamless bracelet adjustment over a wetsuit.',
    heroImage: '/assets/fylex-watch-v2/goldwatch.png',
    galleryImages: [
      '/assets/fylex-watch-v2/goldwatch.png',
      '/assets/fylex-watch-v2/premium.png',
      '/assets/fylex-watch-v2/olive-green.png',
      '/assets/fylex-watch-v2/chocolate.png',
      '/assets/fylex-watch-v2/goldwatch.png',
    ],
    videoUrl: '/Watch-iframe-2.mp4',
    bgColor: '#e8eef5',
    accentColor: '#1e40af',
    textColor: '#1a1a1a',
    theme: 'mist-blue',
    category: 'Professional',
    price: '$36,500',
    heritageText: 'Launched in 1953, the Submariner was the first watch water-resistant to a depth of 100 metres. It set the standard for divers\' watches and over the decades has become as iconic above the water as it is below it. A tool of precision that doubles as a statement of enduring style.',
    gradient: 'radial-gradient(at 0% 0%, rgba(30,64,175,0.2) 0, transparent 70%), radial-gradient(at 80% 20%, rgba(255,255,255,1) 0, transparent 40%), radial-gradient(at 100% 100%, rgba(30,64,175,0.08) 0, transparent 60%), linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 100%)',
    mistColor: 'rgba(30,64,175,0.2)',
    totalStock: 150,
    sold: 45,
    combinations: [
      { id: '001', name: 'Oyster, White Gold, Fluted, Royal Blue', img: '/assets/fylex-watch-v2/goldwatch.png' },
      { id: '002', name: 'Oyster, White Gold, Diamond, Chocolate', img: '/assets/fylex-watch-v2/Chocolate-dial.png' },
      { id: '003', name: 'Oyster, Premium, Fluted, Meteorite', img: '/assets/fylex-watch-v2/metoritedial.png' }
    ]
  },
  {
    id: 'green',
    num: '03',
    title: 'Day-Date',
    titleAccent: 'Green',
    subtitle: 'The President\'s Choice',
    tagline: 'Absolute Prestige',
    shortDesc: 'A symbol of excellence and achievement, presented with a refined emerald green sunray finish.',
    longDesc: 'The Day-Date Green is the pinnacle of prestige. Since 1956, it has been the watch of choice for world leaders, visionaries, and those who shape history. This edition is distinguished by a mesmerizing emerald green sunray dial — a colour that symbolizes growth, renewal, and the richness of ambition. Its fluted bezel, cast in 18k gold, catches the light with a radiance that is unmistakably distinguished. The President bracelet, created exclusively for the Day-Date, provides unmatched comfort and presence on the wrist.',
    heroImage: '/assets/fylex-watch-v2/olive-green.png',
    galleryImages: [
      '/assets/fylex-watch-v2/olive-green.png',
      '/assets/fylex-watch-v2/premium.png',
      '/assets/fylex-watch-v2/goldwatch.png',
      '/assets/fylex-watch-v2/chocolate.png',
      '/assets/fylex-watch-v2/olive-green.png',
    ],
    videoUrl: '/Watch-iframe-3.mp4',
    bgColor: '#f0f7f2',
    accentColor: '#065f46',
    textColor: '#1a1a1a',
    theme: 'soft-green',
    category: 'Classic',
    price: '$9,100',
    heritageText: 'The Day-Date was the first wristwatch to display the day of the week spelled out in full when it was unveiled in 1956. It quickly became the watch of influence and power, gracing the wrists of presidents and visionaries across the globe.',
    gradient: 'radial-gradient(at 0% 0%, rgba(6,110,80,0.2) 0, transparent 70%), radial-gradient(at 80% 20%, rgba(255,255,255,1) 0, transparent 40%), radial-gradient(at 100% 100%, rgba(6,110,80,0.08) 0, transparent 60%), linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 100%)',
    mistColor: 'rgba(6,110,80,0.15)',
    totalStock: 120,
    sold: 85,
    combinations: [
      { id: '001', name: 'President, Everose Gold, Fluted, Olive Green', img: '/assets/fylex-watch-v2/Olive-green-dial.png' },
      { id: '002', name: 'President, Yellow Gold, Diamond, Diamond-paved', img: '/assets/fylex-watch-v2/Diamondpavedial.png' }
    ]
  },
  {
    id: 'silver',
    num: '04',
    title: 'Sky-Dweller',
    titleAccent: 'Silver',
    subtitle: 'Global Traveler',
    tagline: 'Worldly Distinction',
    shortDesc: 'Designed for those who navigate the world, encased in platinum-silver with a white gold fluted bezel.',
    longDesc: 'The Sky-Dweller Silver is the ultimate travel companion. Conceived for the global traveler, it displays two time zones simultaneously through an innovative and intuitive interface. The off-centre disc on the dial indicates the reference time — the time at home — while the conventional hands display local time. The Ring Command bezel, a Fylex-exclusive interface, allows the wearer to select and set each function in turn with ease. It is a marvel of micro-engineering wrapped in platinum sophistication.',
    heroImage: '/assets/fylex-watch-v2/chocolate.png',
    galleryImages: [
      '/assets/fylex-watch-v2/chocolate.png',
      '/assets/fylex-watch-v2/premium.png',
      '/assets/fylex-watch-v2/goldwatch.png',
      '/assets/fylex-watch-v2/olive-green.png',
      '/assets/fylex-watch-v2/chocolate.png',
    ],
    videoUrl: '/Watch-iframe-2.mp4',
    bgColor: '#f5f5f7',
    accentColor: '#475569',
    textColor: '#1a1a1a',
    theme: 'pearl-silver',
    category: 'Professional',
    price: '$15,800',
    heritageText: 'The Sky-Dweller was introduced in 2012 as the most complex watch in the Oyster collection. Its revolutionary Ring Command bezel and annual calendar mechanism represent a breakthrough in watchmaking innovation for the modern world traveler.',
    gradient: 'radial-gradient(at 0% 0%, rgba(71,85,105,0.2) 0, transparent 70%), radial-gradient(at 80% 20%, rgba(255,255,255,1) 0, transparent 40%), radial-gradient(at 100% 100%, rgba(71,85,105,0.08) 0, transparent 60%), linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 100%)',
    mistColor: 'rgba(71,85,105,0.15)',
    totalStock: 75,
    sold: 14,
    combinations: [
      { id: '001', name: 'Oysterflex, White Gold, Fluted, Chocolate', img: '/assets/fylex-watch-v2/Chocolate-dial.png' }
    ]
  },
  {
    id: 'burgundy',
    num: '05',
    title: 'GMT-Master II',
    titleAccent: 'Burgundy',
    subtitle: 'The Traveler\'s Icon',
    tagline: 'Sophisticated Journey',
    shortDesc: 'A cosmopolitan timepiece for a world in motion, featuring a deep burgundy allure that resonates with classic luxury.',
    longDesc: 'The GMT-Master II Burgundy is for those who view the world as their domain. Originally developed for intercontinental airline pilots, it allows the simultaneous reading of the time in two different time zones. The deep burgundy and black Cerachrom bidirectional rotating bezel is a striking hallmark, evoking the warmth of old-world elegance fused with cutting-edge technology. Its 24-hour hand, arrow-tipped and independent, can be set to an additional time zone via the rotatable bezel. Function and form, in perfect burgundy harmony.',
    heroImage: '/assets/fylex-watch-v2/premium.png',
    galleryImages: [
      '/assets/fylex-watch-v2/premium.png',
      '/assets/fylex-watch-v2/goldwatch.png',
      '/assets/fylex-watch-v2/olive-green.png',
      '/assets/fylex-watch-v2/chocolate.png',
      '/assets/fylex-watch-v2/premium.png',
    ],
    videoUrl: '/Watch_Iframe_1.mp4',
    bgColor: '#f9f3f4',
    accentColor: '#991b1b',
    textColor: '#1a1a1a',
    theme: 'rose-burgundy',
    category: 'Professional',
    price: '$18,200',
    heritageText: 'The GMT-Master was born in 1955, developed in collaboration with Pan American World Airways to help pilots manage time zone changes. Its iconic bi-colour bezel has since become one of the most recognizable design elements in all of watchmaking.',
    gradient: 'radial-gradient(at 0% 0%, rgba(127,29,29,0.18) 0, transparent 70%), radial-gradient(at 80% 20%, rgba(255,255,255,1) 0, transparent 40%), radial-gradient(at 100% 100%, rgba(127,29,29,0.08) 0, transparent 60%), linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 100%)',
    mistColor: 'rgba(127,29,29,0.15)',
    totalStock: 250,
    sold: 210,
    combinations: [
      { id: '001', name: 'Jubilee, Everose Gold, Fluted, Meteorite', img: '/assets/fylex-watch-v2/metoritedial.png' },
      { id: '002', name: 'Oyster, Premium, Diamond, Diamond-paved', img: '/assets/fylex-watch-v2/Diamondpavedial.png' }
    ]
  }
];

export default productsData;
