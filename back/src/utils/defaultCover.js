const categoryImages = {
  'Web Development': '/uploads/default-covers/web-development.webp',
  'AI & Machine Learning': '/uploads/default-covers/AI_ML.webp',
  'Mobile Development': '/uploads/default-covers/mobile-development.jpg',
  'DevOps': '/uploads/default-covers/devops.jpg',
  'UI/UX Design': '/uploads/default-covers/ux_ui_design.webp',
  'Data Science': '/uploads/default-covers/data_science.webp',
  'IoT': '/uploads/default-covers/IoT.jpg',
};

export function getDefaultCover(category) {
  return categoryImages[category] || '/uploads/default-covers/other.jpg';
}
