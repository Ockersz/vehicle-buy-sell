function getPagination(query) {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const pageSize = Math.min(
    50,
    Math.max(1, parseInt(query.page_size || '20', 10))
  );
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset };
}

module.exports = { getPagination };
