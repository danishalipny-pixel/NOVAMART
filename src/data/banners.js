import { BANNER_ASSETS } from '../constants/imageAssets';

export const heroBanners = [
  {
    id: 'hero-1',
    tag: 'FLAGSHIP LAUNCH 2026',
    title: 'Aura Sound Pro ANC',
    subtitle: 'Pure studio acoustics with adaptive 48dB active noise cancellation and 60-hour playtime.',
    ctaText: 'Shop New Arrival',
    ctaLink: '#products',
    badge: '35% OFF LAUNCH WEEK',
    category: 'electronics',
    image: BANNER_ASSETS.heroAuraSound,
    mobileImage: BANNER_ASSETS.heroAuraSound,
    accentColor: 'from-indigo-600 via-purple-700 to-slate-900',
    price: '$229.00',
    originalPrice: '$349.00'
  },
  {
    id: 'hero-2',
    tag: 'ULTRA PERFORMANCE',
    title: 'Zenith Apex Ultra Titan',
    subtitle: 'Sapphire crystal display, ECG bio-sensors, and aerospace titanium housing.',
    ctaText: 'Explore Wearables',
    ctaLink: '#products',
    badge: 'LIMITED EDITION',
    category: 'wearables',
    image: BANNER_ASSETS.heroZenithApex,
    mobileImage: BANNER_ASSETS.heroZenithApex,
    accentColor: 'from-amber-600 via-rose-700 to-slate-900',
    price: '$419.00',
    originalPrice: '$499.00'
  },
  {
    id: 'hero-3',
    tag: 'CREATIVE WORKSPACE',
    title: 'Precision Mechanical Lab',
    subtitle: 'Gasket-mounted hot-swappable switches with anodized aluminum body and PBT keycaps.',
    ctaText: 'Upgrade Setup',
    ctaLink: '#products',
    badge: 'BESTSELLER',
    category: 'computing',
    image: BANNER_ASSETS.heroPrecisionLab,
    mobileImage: BANNER_ASSETS.heroPrecisionLab,
    accentColor: 'from-emerald-600 via-teal-800 to-slate-900',
    price: '$179.00',
    originalPrice: '$219.00'
  }
];

export const promoBanners = [
  {
    id: 'promo-1',
    title: 'Next-Gen Audio Fest',
    subtitle: 'High-Res LDAC & Spatial Audio gear',
    discount: 'Up to 40% OFF',
    buttonText: 'View Deals',
    category: 'electronics',
    image: BANNER_ASSETS.promoAudioFest,
    bgGradient: 'from-blue-600 to-indigo-900'
  },
  {
    id: 'promo-2',
    title: 'Optics & Creator Gear',
    subtitle: 'Cinematic mirrorless cameras & stabilizers',
    discount: 'Exclusive Bundles',
    buttonText: 'Shop Cameras',
    category: 'cameras',
    image: BANNER_ASSETS.promoOpticsCreator,
    bgGradient: 'from-rose-600 to-purple-900'
  },
  {
    id: 'promo-3',
    title: 'Ergonomic Workspace',
    subtitle: 'Engineered for all-day focus & comfort',
    discount: 'Free Shipping',
    buttonText: 'Explore Gear',
    category: 'computing',
    image: BANNER_ASSETS.promoErgonomicWorkspace,
    bgGradient: 'from-amber-600 to-orange-900'
  }
];
