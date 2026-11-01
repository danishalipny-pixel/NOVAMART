/**
 * NOVAMART Centralized Image Asset Directory
 * All static image references across the platform are centralized here.
 * Local path references point to the public directory: /assets/images/...
 */

// 1. Logo & Branding
export const LOGO_ASSETS = {
  logo: '/assets/images/logo/novamart-logo.svg',
  icon: '/assets/images/logo/novamart-icon.svg'
};

// 2. Fallbacks & Placeholders
export const PLACEHOLDER_ASSETS = {
  product: '/assets/images/placeholders/product-placeholder.webp',
  productSvg: '/assets/images/placeholders/product-placeholder.svg',
  banner: '/assets/images/placeholders/banner-placeholder.svg',
  category: '/assets/images/placeholders/category-placeholder.svg',
  avatar: '/assets/images/placeholders/avatar-placeholder.svg'
};

// 3. Homepage & Promotional Banners
export const BANNER_ASSETS = {
  heroAuraSound: '/assets/images/banners/hero-aura-sound.webp',
  heroZenithApex: '/assets/images/banners/hero-zenith-apex.webp',
  heroPrecisionLab: '/assets/images/banners/hero-precision-lab.webp',
  promoAudioFest: '/assets/images/banners/promo-audio-fest.webp',
  promoOpticsCreator: '/assets/images/banners/promo-optics-creator.webp',
  promoErgonomicWorkspace: '/assets/images/banners/promo-ergonomic-workspace.webp'
};

// 4. Categories
export const CATEGORY_ASSETS = {
  all: '/assets/images/categories/category-all.webp',
  electronics: '/assets/images/categories/category-electronics.webp',
  wearables: '/assets/images/categories/category-wearables.webp',
  computing: '/assets/images/categories/category-computing.webp',
  cameras: '/assets/images/categories/category-cameras.webp',
  gaming: '/assets/images/categories/category-gaming.webp',
  lifestyle: '/assets/images/categories/category-lifestyle.webp'
};

// 5. Products by Department
export const PRODUCT_ASSETS = {
  electronics: {
    sonyWh1000xm5: [
      '/assets/images/products/electronics/sony-wh1000xm5-main.webp',
      '/assets/images/products/electronics/sony-wh1000xm5-angle.webp',
      '/assets/images/products/electronics/sony-wh1000xm5-earcup.webp',
      '/assets/images/products/electronics/sony-wh1000xm5-lifestyle.webp'
    ],
    boseQcUltra: [
      '/assets/images/products/electronics/bose-qc-ultra-main.webp',
      '/assets/images/products/electronics/bose-qc-ultra-case.webp',
      '/assets/images/products/electronics/bose-qc-ultra-detail.webp',
      '/assets/images/products/electronics/bose-qc-ultra-wear.webp'
    ],
    macbookPro16: [
      '/assets/images/products/electronics/macbook-pro-16-main.webp',
      '/assets/images/products/electronics/macbook-pro-16-display.webp',
      '/assets/images/products/electronics/macbook-pro-16-keyboard.webp',
      '/assets/images/products/electronics/macbook-pro-16-lifestyle.webp'
    ],
    fujifilmXt5: [
      '/assets/images/products/electronics/fujifilm-xt5-main.webp',
      '/assets/images/products/electronics/fujifilm-xt5-dial.webp',
      '/assets/images/products/electronics/fujifilm-xt5-lens.webp',
      '/assets/images/products/electronics/fujifilm-xt5-sensor.webp'
    ],
    sonyDualSense: [
      '/assets/images/products/electronics/sony-dualsense-main.webp',
      '/assets/images/products/electronics/sony-dualsense-triggers.webp',
      '/assets/images/products/electronics/sony-dualsense-sticks.webp',
      '/assets/images/products/electronics/sony-dualsense-case.webp'
    ],
    beosoundExplore: [
      '/assets/images/products/electronics/beosound-explore-main.webp',
      '/assets/images/products/electronics/beosound-explore-grille.webp',
      '/assets/images/products/electronics/beosound-explore-strap.webp',
      '/assets/images/products/electronics/beosound-explore-outdoor.webp'
    ]
  },
  accessories: {
    appleWatchUltra2: [
      '/assets/images/products/accessories/apple-watch-ultra2-main.webp',
      '/assets/images/products/accessories/apple-watch-ultra2-titanium.webp',
      '/assets/images/products/accessories/apple-watch-ultra2-band.webp',
      '/assets/images/products/accessories/apple-watch-ultra2-screen.webp'
    ],
    keychronQ1pro: [
      '/assets/images/products/accessories/keychron-q1pro-main.webp',
      '/assets/images/products/accessories/keychron-q1pro-knob.webp',
      '/assets/images/products/accessories/keychron-q1pro-keycaps.webp',
      '/assets/images/products/accessories/keychron-q1pro-switches.webp'
    ],
    logitechMxMaster3s: [
      '/assets/images/products/accessories/logitech-mxmaster3s-main.webp',
      '/assets/images/products/accessories/logitech-mxmaster3s-wheel.webp',
      '/assets/images/products/accessories/logitech-mxmaster3s-thumb.webp',
      '/assets/images/products/accessories/logitech-mxmaster3s-desk.webp'
    ],
    sonyFe2470: [
      '/assets/images/products/accessories/sony-fe24-70-main.webp',
      '/assets/images/products/accessories/sony-fe24-70-glass.webp',
      '/assets/images/products/accessories/sony-fe24-70-mount.webp',
      '/assets/images/products/accessories/sony-fe24-70-ring.webp'
    ],
    bellroyTransit: [
      '/assets/images/products/accessories/bellroy-transit-main.webp',
      '/assets/images/products/accessories/bellroy-transit-interior.webp',
      '/assets/images/products/accessories/bellroy-transit-straps.webp',
      '/assets/images/products/accessories/bellroy-transit-pocket.webp'
    ]
  },
  homeLiving: {
    hermanMillerEmbody: [
      '/assets/images/products/home-living/herman-miller-embody-main.webp',
      '/assets/images/products/home-living/herman-miller-embody-backfit.webp',
      '/assets/images/products/home-living/herman-miller-embody-arms.webp',
      '/assets/images/products/home-living/herman-miller-embody-lifestyle.webp'
    ]
  },
  fashion: {
    leatherBikerJacket: [
      '/assets/images/products/fashion/leather-biker-jacket-main.webp'
    ],
    techCommuterHoodie: [
      '/assets/images/products/fashion/tech-commuter-hoodie-main.webp'
    ]
  },
  footwear: {
    crimsonRunner: [
      '/assets/images/products/footwear/crimson-runner-sneakers-main.webp'
    ],
    retroTrainer: [
      '/assets/images/products/footwear/retro-classic-trainers-main.webp'
    ]
  }
};

// 6. Brand Badges & Logos
export const BRAND_ASSETS = {
  sony: '/assets/images/brands/sony.svg',
  apple: '/assets/images/brands/apple.svg',
  fujifilm: '/assets/images/brands/fujifilm.svg',
  keychron: '/assets/images/brands/keychron.svg',
  bose: '/assets/images/brands/bose.svg',
  logitech: '/assets/images/brands/logitech.svg',
  hermanMiller: '/assets/images/brands/herman-miller.svg',
  bellroy: '/assets/images/brands/bellroy.svg',
  bangOlufsen: '/assets/images/brands/bang-olufsen.svg'
};

// 7. Avatars
export const AVATAR_ASSETS = {
  sophia: '/assets/images/avatars/avatar-sophia.webp',
  marcus: '/assets/images/avatars/avatar-marcus.webp',
  elena: '/assets/images/avatars/avatar-elena.webp',
  david: '/assets/images/avatars/avatar-david.webp',
  seller: '/assets/images/avatars/avatar-seller.webp',
  default: '/assets/images/placeholders/avatar-placeholder.svg'
};

// 8. Value Icons
export const ICON_ASSETS = {
  shipping: '/assets/images/icons/trust-shipping.svg',
  quality: '/assets/images/icons/trust-quality.svg',
  returns: '/assets/images/icons/trust-returns.svg',
  support: '/assets/images/icons/trust-support.svg'
};

// Utility function to get fallback by category or type
export function getFallbackImage(type = 'product') {
  switch (type) {
    case 'banner':
      return PLACEHOLDER_ASSETS.banner;
    case 'category':
      return PLACEHOLDER_ASSETS.category;
    case 'avatar':
      return PLACEHOLDER_ASSETS.avatar;
    case 'product':
    default:
      return PLACEHOLDER_ASSETS.product;
  }
}
