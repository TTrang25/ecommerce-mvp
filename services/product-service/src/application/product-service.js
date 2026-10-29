const repository = require('../infrastructure/product-repository');
const {
  validateCreateProduct,
  validateUpdateProduct
} = require('../domain/product-validation');

async function getProducts() {
  return repository.findAll();
}

async function getProduct(pid) {
  const product = await repository.findByPid(pid);

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  return product;
}

async function createProduct(data) {
  validateCreateProduct(data);

  const existing = await repository.findByPid(data.pid);

  if (existing) {
    const error = new Error('Product already exists');
    error.statusCode = 409;
    throw error;
  }

  return repository.create({
    pid: data.pid,
    pname: data.pname.trim(),
    price: data.price,
    quantity: data.quantity
  });
}

async function updateProduct(pid, data) {
  validateUpdateProduct(data);

  await getProduct(pid);

  const updateData = {};

  if (data.pname !== undefined) {
    updateData.pname = data.pname.trim();
  }

  if (data.price !== undefined) {
    updateData.price = data.price;
  }

  if (data.quantity !== undefined) {
    updateData.quantity = data.quantity;
  }

  return repository.updateByPid(pid, updateData);
}

async function deleteProduct(pid) {
  await getProduct(pid);

  return repository.deleteByPid(pid);
}

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};
