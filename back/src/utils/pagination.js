export function getPagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(Math.max(1, parseInt(query.limit, 10) || 10), 100);
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
}