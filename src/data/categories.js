import { CATEGORY_ASSETS } from '../constants/imageAssets';

export const categories = [
  {
    id: 'all',
    name: 'All Categories',
    icon: 'LayoutGrid',
    count: 24,
    image: CATEGORY_ASSETS.all,
    description: 'Explore our complete catalog'
  },
  {
    id: 'electronics',
    name: 'Electronics & Audio',
    icon: 'Headphones',
    count: 18,
    image: CATEGORY_ASSETS.electronics,
    description: 'High-fidelity audio, wireless gear & monitors'
  },
  {
    id: 'wearables',
    name: 'Wearables & Smart',
    icon: 'Watch',
    count: 12,
    image: CATEGORY_ASSETS.wearables,
    description: 'Smartwatches, fitness trackers & accessories'
  },
  {
    id: 'computing',
    name: 'Laptops & Computing',
    icon: 'Laptop',
    count: 14,
    image: CATEGORY_ASSETS.computing,
    description: 'Ultrabooks, workstations & mechanical peripherals'
  },
  {
    id: 'cameras',
    name: 'Cameras & Optics',
    icon: 'Camera',
    count: 9,
    image: CATEGORY_ASSETS.cameras,
    description: 'Mirrorless cameras, prime lenses & creator kits'
  },
  {
    id: 'gaming',
    name: 'Gaming & VR',
    icon: 'Gamepad2',
    count: 11,
    image: CATEGORY_ASSETS.gaming,
    description: 'Consoles, wireless controllers & VR headsets'
  },
  {
    id: 'lifestyle',
    name: 'Modern Lifestyle',
    icon: 'Coffee',
    count: 16,
    image: CATEGORY_ASSETS.lifestyle,
    description: 'Minimalist desk accessories, thermals & bags'
  }
];
