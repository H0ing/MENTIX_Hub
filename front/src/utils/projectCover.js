const categoryImages = {
  'Web Development': '/web-development.webp',
  'AI & Machine Learning': '/AI_ML.webp',
  'Mobile Development': '/mobile-development.jpg',
  'DevOps': '/devops.jpg',
  'UI/UX Design': '/ux_ui_design.webp',
  'Data Science': '/data_science.webp',
  'IoT': '/IoT.jpg',
  'Other': '/other.jpg',
};

export function getProjectCover(project) {
  if (project?.thumbnail) return project.thumbnail;
  const category = project?.category;
  return categoryImages[category] || '/other.jpg';
}
