function validateCreateProduct(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Product data is required');
  }

  if (!Number.isInteger(data.pid) || data.pid <= 0) {
    throw new Error('pid must be a positive integer');
  }

  if (!data.pname || typeof data.pname !== 'string' || !data.pname.trim()) {
    throw new Error('pname is required');
  }

  if (typeof data.price !== 'number' || data.price < 0) {
    throw new Error('price must be a number >= 0');
  }

  if (!Number.isInteger(data.quantity) || data.quantity < 0) {
    throw new Error('quantity must be an integer >= 0');
  }
}

function validateUpdateProduct(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Product data is required');
  }

  if (data.pname !== undefined) {
    if (typeof data.pname !== 'string' || !data.pname.trim()) {
      throw new Error('pname must be a non-empty string');
    }
  }

  if (data.price !== undefined) {
    if (typeof data.price !== 'number' || data.price < 0) {
      throw new Error('price must be a number >= 0');
    }
  }

  if (data.quantity !== undefined) {
    if (!Number.isInteger(data.quantity) || data.quantity < 0) {
      throw new Error('quantity must be an integer >= 0');
    }
  }
}

module.exports = {
  validateCreateProduct,
  validateUpdateProduct
};
