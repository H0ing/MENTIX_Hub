export function success(res, data = null, message = 'Success', statusCode = 200) {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

export function created(res, data = null, message = 'Resource created successfully') {
  success(res, data, message, 201);
}

export function paginated(res, { rows, count, page, limit }) {
  const totalPages = Math.ceil(count / limit);
  
  res.status(200).json({
    success: true,
    message: 'Data retrieved successfully',
    data: rows,
    pagination: {
      page,
      limit,
      totalItems: count,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  });
}

export function error(res, message = 'Internal Server Error', statusCode = 500, errors = null) {
  const response = {
    success: false,
    message
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  res.status(statusCode).json(response);
}