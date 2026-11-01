import { PRODUCT_ASSETS } from '../constants/imageAssets';

export const initialProducts = [
  {
    id: 'prod-1',
    name: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones',
    brand: 'Sony',
    category: 'electronics',
    price: 348.00,
    originalPrice: 399.99,
    discountPercentage: 13,
    rating: 4.8,
    reviewCount: 1420,
    stock: 24,
    badge: 'Best Seller',
    isFeatured: true,
    description: 'Industry-leading noise cancellation optimized to you with two processors and 8 microphones. Enjoy ultra-clear hands-free calling and up to 30 hours of battery life.',
    features: [
      'Two processors and 8 microphones for unprecedented noise cancellation',
      'Up to 30-hour battery life with quick charging (3 min for 3 hours)',
      'Magnificent Sound, engineered to perfection with 30mm precision driver',
      'Multipoint connection allows swift switching between devices',
      'Ultra-comfortable, lightweight design with soft fit leather'
    ],
    specs: {
      'Driver Unit': '30mm, dome type (CCAW Voice coil)',
      'Frequency Response': '4 Hz - 40,000 Hz',
      'Battery Life': 'Max. 30 hrs (NC ON)',
      'Weight': 'Approx. 250g',
      'Bluetooth Version': '5.2 with LDAC / AAC / SBC'
    },
    images: PRODUCT_ASSETS.electronics.sonyWh1000xm5,
    seller: {
      name: 'Sony Official Store',
      rating: 4.9,
      sales: 12500
    }
  },
  {
    id: 'prod-2',
    name: 'Apple Watch Ultra 2 Titanium GPS + Cellular',
    brand: 'Apple',
    category: 'wearables',
    price: 779.00,
    originalPrice: 799.00,
    discountPercentage: 3,
    rating: 4.9,
    reviewCount: 890,
    stock: 15,
    badge: 'Staff Pick',
    isFeatured: true,
    description: 'The ultimate sports and adventure watch features a 49mm titanium case, precision dual-frequency GPS, up to 36 hours of battery life, and three specialized bands.',
    features: [
      'Rugged 49mm aerospace-grade titanium case with flat sapphire front crystal',
      'Brightest Apple display ever at 3000 nits peak outdoor brightness',
      'Precision dual-frequency GPS for exact route, distance, and pace calculations',
      'Water resistant to 100m, tested to MIL-STD 810H standards',
      'Up to 36 hours normal use and 72 hours in Low Power Mode'
    ],
    specs: {
      'Case Size': '49mm x 44mm x 14.4mm',
      'Case Material': 'Aerospace-grade Titanium',
      'Display': 'Always-On Retina display (3000 nits)',
      'Water Resistance': '100m with Depth Gauge',
      'Connectivity': 'LTE, Wi-Fi 4, Bluetooth 5.3, U2 Chip'
    },
    images: PRODUCT_ASSETS.accessories.appleWatchUltra2,
    seller: {
      name: 'Apex Digital Hub',
      rating: 4.8,
      sales: 9200
    }
  },
  {
    id: 'prod-3',
    name: 'Fujifilm X-T5 Mirrorless Camera Body 40.2MP',
    brand: 'Fujifilm',
    category: 'cameras',
    price: 1699.00,
    originalPrice: 1799.00,
    discountPercentage: 6,
    rating: 4.9,
    reviewCount: 340,
    stock: 8,
    badge: 'Pro Tier',
    isFeatured: true,
    description: 'Fifth-generation X-Trans CMOS 5 HR sensor and X-Processor 5 in a compact, lightweight body with 5-axis in-body image stabilization of up to 7.0 stops.',
    features: [
      '40.2MP high-resolution X-Trans CMOS 5 HR back-illuminated sensor',
      'Up to 7.0 stops of 5-axis In-Body Image Stabilization (IBIS)',
      '6.2K/30p 4:2:2 10-bit internal movie recording',
      'Classic dial operation and three-way tilting LCD screen',
      'Subject detection AF powered by deep learning AI'
    ],
    specs: {
      'Sensor Type': '23.5mm x 15.6mm (APS-C) X-Trans CMOS 5 HR',
      'Effective Pixels': '40.2 million pixels',
      'Shutter Speed': 'Up to 1/180,000 sec electronic',
      'ISO Range': 'Standard ISO 125-12800 (Ext. 64-51200)',
      'Dimensions': '129.5mm x 91mm x 63.8mm'
    },
    images: PRODUCT_ASSETS.electronics.fujifilmXt5,
    seller: {
      name: 'Optic Masters Direct',
      rating: 4.95,
      sales: 4300
    }
  },
  {
    id: 'prod-4',
    name: 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard',
    brand: 'Keychron',
    category: 'computing',
    price: 199.00,
    originalPrice: 229.00,
    discountPercentage: 13,
    rating: 4.7,
    reviewCount: 520,
    stock: 32,
    badge: 'Popular',
    isFeatured: true,
    description: 'QMK/VIA wireless custom mechanical keyboard with a 75% layout, double-gasket design, full CNC aluminum body, hot-swappable sockets, and K Pro Banana switches.',
    features: [
      'Double-gasket acoustic design reduces metallic resonance',
      'Fully CNC machined 6063 aluminum body with anodized finish',
      'Bluetooth 5.1 & Type-C wired dual connectivity with 3 device switching',
      'Hot-swappable PCB supports both 3-pin and 5-pin MX switches',
      'South-facing RGB lighting with programmable QMK/VIA web configurator'
    ],
    specs: {
      'Layout': '75% (81 keys + knob)',
      'Switch Type': 'Keychron K Pro Pre-lubed Switches',
      'Body Material': 'Full CNC Machined Aluminum',
      'Battery': '4000mAh rechargeable Li-polymer',
      'Polling Rate': '1000Hz (Wired) / 90Hz (Wireless)'
    },
    images: PRODUCT_ASSETS.accessories.keychronQ1pro,
    seller: {
      name: 'Keychron Labs',
      rating: 4.9,
      sales: 7800
    }
  },
  {
    id: 'prod-5',
    name: 'Sony DualSense Edge Wireless Controller for PS5 & PC',
    brand: 'Sony',
    category: 'gaming',
    price: 189.99,
    originalPrice: 199.99,
    discountPercentage: 5,
    rating: 4.8,
    reviewCount: 940,
    stock: 19,
    badge: 'Top Rated',
    isFeatured: true,
    description: 'Ultra-customizable controls, swappable stick modules, mappable back buttons, adjustable trigger stops, and profile switching on the fly.',
    features: [
      'Replaceable analog stick modules (sold separately) for long lifespan',
      'Two sets of swappable back buttons (half-dome & lever)',
      'Adjustable trigger travel stops and stick dead-zones via UI',
      'Braided USB cable with lockable connector housing',
      'Included hard carrying case with pass-through charging'
    ],
    specs: {
      'Compatibility': 'PS5, PC (Windows), macOS, iOS, Android',
      'Battery': 'Rechargeable built-in lithium-ion',
      'Haptics': 'Dual actuators with Dynamic Adaptive Triggers',
      'Weight': 'Approx. 335g',
      'Connector': 'USB Type-C'
    },
    images: PRODUCT_ASSETS.electronics.sonyDualSense,
    seller: {
      name: 'PlayZone Gaming Supplies',
      rating: 4.85,
      sales: 11000
    }
  },
  {
    id: 'prod-6',
    name: 'Bose QuietComfort Ultra Spatial Audio Earbuds',
    brand: 'Bose',
    category: 'electronics',
    price: 249.00,
    originalPrice: 299.00,
    discountPercentage: 17,
    rating: 4.7,
    reviewCount: 680,
    stock: 28,
    badge: '17% OFF',
    isFeatured: false,
    description: 'Groundbreaking spatialized audio for more immersive listening. World-class noise cancellation custom-tuned to the shape of your ears with CustomTune technology.',
    features: [
      'Bose Immersive Audio pushes boundaries of spatial acoustic realism',
      'CustomTune technology analyzes ear canal shape for bespoke acoustic response',
      'Three modes: Quiet Mode, Aware Mode, and Immersion Mode',
      'Up to 6 hours listening time (up to 4 hours with Immersive Audio)',
      'IPX4 weather and sweat resistant construction'
    ],
    specs: {
      'Dimensions': '1.23" H x 0.79" W x 0.96" D',
      'Case Battery': 'Provides 3 additional full charges',
      'Microphones': '4 mics in each earbud',
      'Bluetooth Range': 'Up to 30 ft (9 m)',
      'Codecs': 'aptX Adaptive, AAC, SBC'
    },
    images: PRODUCT_ASSETS.electronics.boseQcUltra,
    seller: {
      name: 'Acoustic Sound Labs',
      rating: 4.9,
      sales: 6400
    }
  },
  {
    id: 'prod-7',
    name: 'MacBook Pro 16" M3 Max Liquid Retina XDR',
    brand: 'Apple',
    category: 'computing',
    price: 3299.00,
    originalPrice: 3499.00,
    discountPercentage: 6,
    rating: 5.0,
    reviewCount: 420,
    stock: 7,
    badge: 'Ultimate Power',
    isFeatured: true,
    description: 'The most advanced Mac laptop ever made with up to 16-core CPU, 40-core GPU, Liquid Retina XDR display with 1600 nits peak brightness, and 22 hours of battery.',
    features: [
      'Monster M3 Max chip with 16-core CPU and 40-core GPU',
      'Liquid Retina XDR display with Extreme Dynamic Range and ProMotion 120Hz',
      '1080p FaceTime HD camera, studio-quality three-mic array, six-speaker sound',
      'Up to 22 hours of battery life with zero performance throttling on battery',
      'Extensive ports: MagSafe 3, three Thunderbolt 4, HDMI, SDXC card slot'
    ],
    specs: {
      'Memory': '36GB Unified Memory (Configurable to 128GB)',
      'Storage': '1TB NVMe PCIe 4.0 SSD',
      'Display': '16.2-inch (3456 x 2234) mini-LED',
      'Battery': '100-watt-hour lithium-polymer',
      'Weight': '2.16 kg (4.8 lbs)'
    },
    images: PRODUCT_ASSETS.electronics.macbookPro16,
    seller: {
      name: 'Apex Digital Hub',
      rating: 4.8,
      sales: 9200
    }
  },
  {
    id: 'prod-8',
    name: 'Herman Miller Embody Ergonomic Task Chair',
    brand: 'Herman Miller',
    category: 'lifestyle',
    price: 1545.00,
    originalPrice: 1795.00,
    discountPercentage: 14,
    rating: 4.9,
    reviewCount: 780,
    stock: 11,
    badge: 'Ergonomic Choice',
    isFeatured: true,
    description: 'Engineered specifically for people who work or game for long hours. Designed with the input of more than 30 physicians and PhDs in biomechanics, vision, and physical therapy.',
    features: [
      'Pixelated Support matrix distributes body weight evenly',
      'BackFit adjustment conforms to unique spine curvature',
      'Four-layer breathable seat upholstery promotes airflow and cooling',
      'Fully adjustable armrests and tilt limiter with smooth harmonic tilt',
      '12-year manufacturer warranty'
    ],
    specs: {
      'Maximum Weight Capacity': '300 lbs (136 kg)',
      'Seat Height Adjustment': '16" to 20.5"',
      'Seat Depth': '15" to 18"',
      'Base': 'Die-cast aluminum 5-star base',
      'Certifications': 'Cradle to Cradle Certified Silver'
    },
    images: PRODUCT_ASSETS.homeLiving.hermanMillerEmbody,
    seller: {
      name: 'Workspace Elite Design',
      rating: 4.98,
      sales: 3200
    }
  },
  {
    id: 'prod-9',
    name: 'Sony FE 24-70mm F2.8 GM II Full-Frame Standard Zoom Lens',
    brand: 'Sony',
    category: 'cameras',
    price: 2298.00,
    originalPrice: 2398.00,
    discountPercentage: 4,
    rating: 4.9,
    reviewCount: 310,
    stock: 9,
    badge: 'G Master',
    isFeatured: false,
    description: 'The world’s lightest fast standard zoom lens with groundbreaking G Master optics, four XD linear motors for autofocus, and aperture click switches for video.',
    features: [
      '22% lighter and 18% smaller in volume than original predecessor',
      'Four XD (extreme dynamic) Linear Motors deliver blistering fast AF',
      'Dual XA (extreme aspherical) elements for exquisite bokeh',
      'Aperture ring with click ON/OFF switch and iris lock switch',
      'Dust and moisture resistant design with fluorine front element coating'
    ],
    specs: {
      'Focal Length': '24-70mm',
      'Aperture': 'f/2.8 to f/22',
      'Filter Diameter': '82mm',
      'Minimum Focus Distance': '0.21m (8.3 in)',
      'Weight': '695g (24.6 oz)'
    },
    images: PRODUCT_ASSETS.accessories.sonyFe2470,
    seller: {
      name: 'Sony Official Store',
      rating: 4.9,
      sales: 12500
    }
  },
  {
    id: 'prod-10',
    name: 'Logitech MX Master 3S Wireless Performance Mouse',
    brand: 'Logitech',
    category: 'computing',
    price: 99.99,
    originalPrice: 119.99,
    discountPercentage: 17,
    rating: 4.8,
    reviewCount: 3100,
    stock: 65,
    badge: 'Popular',
    isFeatured: false,
    description: 'An icon remastered. Quiet Clicks and 8,000 DPI track-on-glass sensor. MagSpeed electromagnetic scrolling for 1,000 lines per second precision scrolling.',
    features: [
      'Quiet clicks provide tactile bump with 90% less noise',
      '8,000 DPI optical sensor tracks seamlessly on any surface, including glass',
      'MagSpeed scroll wheel shifts from ratchet to hyper-fast mode automatically',
      'Ergonomic silhouette crafted to support hand and wrist',
      'Flow cross-computer control across 3 macOS & Windows devices'
    ],
    specs: {
      'DPI Range': '200 to 8,000 DPI (set in increments of 50)',
      'Battery': 'Rechargeable Li-Po (500 mAh) up to 70 days',
      'Buttons': '7 buttons (Left/Right, Back/Forward, App-Switch, Wheel Mode, Middle)',
      'Wireless': 'Logi Bolt USB receiver or Bluetooth Low Energy',
      'Weight': '141 g'
    },
    images: PRODUCT_ASSETS.accessories.logitechMxMaster3s,
    seller: {
      name: 'Keychron Labs',
      rating: 4.9,
      sales: 7800
    }
  },
  {
    id: 'prod-11',
    name: 'Bang & Olufsen Beosound Explore Outdoor Speaker',
    brand: 'Bang & Olufsen',
    category: 'electronics',
    price: 199.00,
    originalPrice: 249.00,
    discountPercentage: 20,
    rating: 4.7,
    reviewCount: 390,
    stock: 22,
    badge: '20% OFF',
    isFeatured: false,
    description: 'Ultra-portable, tough, waterproof Bluetooth speaker engineered for adventure with up to 27 hours of playtime and True360 omnidirectional acoustic sound.',
    features: [
      'Type II anodized aluminum shell resistant to scratches and impacts',
      'IP67 certified dustproof and fully submersible up to 1 meter',
      'Up to 27 hours of battery life on a single charge',
      'True360 omnidirectional sound ensures balanced acoustic coverage',
      'Integrated aluminum carabiner and rugged carry strap'
    ],
    specs: {
      'Amplifier': '2 x 30W Class D for Woofer and Tweeter',
      'Frequency Range': '56 - 22,700 Hz',
      'Bluetooth Version': '5.2 with fast pairing',
      'Battery Capacity': '2,400 mAh',
      'Weight': '631 g (with carabiner)'
    },
    images: PRODUCT_ASSETS.electronics.beosoundExplore,
    seller: {
      name: 'Acoustic Sound Labs',
      rating: 4.9,
      sales: 6400
    }
  },
  {
    id: 'prod-12',
    name: 'Bellroy Tokyo Transit Tech Backpack 20L',
    brand: 'Bellroy',
    category: 'lifestyle',
    price: 179.00,
    originalPrice: 199.00,
    discountPercentage: 10,
    rating: 4.8,
    reviewCount: 512,
    stock: 35,
    badge: 'New Arrival',
    isFeatured: false,
    description: 'Clean, minimalist commuter backpack with dedicated padded 16" laptop pocket, magnetic quick-snap closures, and water-resistant recycled Baida nylon.',
    features: [
      'Padded sleeve protects up to 16" MacBook Pro with false bottom',
      'Quick-access front pocket with internal key clip and pen loop',
      'Water-resistant coated zippers and durable recycled exterior fabric',
      'Contoured padded shoulder straps and breathable mesh back panel',
      'Luggage pass-through strap for effortless airport travel'
    ],
    specs: {
      'Capacity': '20 Liters',
      'Dimensions': '480mm x 320mm x 160mm',
      'Weight': '850 g',
      'Material': '100% Recycled PET water-resistant woven fabric',
      'Warranty': '3-year Bellroy warranty'
    },
    images: PRODUCT_ASSETS.accessories.bellroyTransit,
    seller: {
      name: 'Workspace Elite Design',
      rating: 4.98,
      sales: 3200
    }
  }
];
