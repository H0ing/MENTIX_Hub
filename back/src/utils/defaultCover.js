const CDN = 'https://res.cloudinary.com/d37lj2pf/image/upload';

const categoryImages = {
  'Web Development': `${CDN}/v1784016052/uploads/default-covers/web-development.webp`,
  'AI & Machine Learning': `${CDN}/v1784016054/uploads/default-covers/AI_ML.webp`,
  'Mobile Development': `${CDN}/v1784016056/uploads/default-covers/mobile-development.jpg`,
  'DevOps': `${CDN}/v1784016057/uploads/default-covers/devops.jpg`,
  'UI/UX Design': `${CDN}/v1784016059/uploads/default-covers/ux_ui_design.webp`,
  'Data Science': `${CDN}/v1784016061/uploads/default-covers/data_science.webp`,
  'IoT': `${CDN}/v1784016063/uploads/default-covers/IoT.jpg`,
};

export function getDefaultCover(category) {
  return categoryImages[category] || `${CDN}/v1784016064/uploads/default-covers/other.jpg`;
}
