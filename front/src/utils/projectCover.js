const CLOUD_BASE = 'https://res.cloudinary.com/d37lj2pf/image/upload/uploads/default-covers';

const categoryImages = {
  'Web Development': `${CLOUD_BASE}/web-development.webp`,
  'AI & Machine Learning': `${CLOUD_BASE}/AI_ML.webp`,
  'Mobile Development': `${CLOUD_BASE}/mobile-development.jpg`,
  'DevOps': `${CLOUD_BASE}/devops.jpg`,
  'UI/UX Design': `${CLOUD_BASE}/ux_ui_design.webp`,
  'Data Science': `${CLOUD_BASE}/data_science.webp`,
  'IoT': `${CLOUD_BASE}/IoT.jpg`,
  'Other': `${CLOUD_BASE}/other.jpg`,
};

export function getProjectCover(project) {
  if (project?.thumbnail) return project.thumbnail;
  const category = project?.category;
  return categoryImages[category] || `${CLOUD_BASE}/other.jpg`;
}
