function successResponse(data) {
  return {
    success: true,
    data,
  };
}

function errorResponse(error) {
  return {
    success: false,
    error,
  };
}

module.exports = {
  successResponse,
  errorResponse,
};
