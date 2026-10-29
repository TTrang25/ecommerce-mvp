const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const path = require('path');

const repository = require('../infrastructure/product-repository');

const PROTO_PATH = path.join(
  __dirname,
  'proto',
  'product.proto'
);

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const productProto = grpc.loadPackageDefinition(
  packageDefinition
).product;

async function getProduct(call, callback) {
  try {
    const pid = Number(call.request.pid);

    if (!Number.isInteger(pid) || pid <= 0) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'Invalid product id'
      });
    }

    const product = await repository.findByPid(pid);

    if (!product) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: 'Product not found'
      });
    }

    callback(null, {
      pid: product.pid,
      pname: product.pname,
      price: Number(product.price),
      quantity: product.quantity
    });
  } catch (error) {
    console.error('gRPC GetProduct error:', error);

    callback({
      code: grpc.status.INTERNAL,
      message: 'Internal server error'
    });
  }
}

async function updateInventory(call, callback) {
  try {
    const pid = Number(call.request.pid);
    const quantity = Number(call.request.quantity);

    if (
      !Number.isInteger(pid) ||
      pid <= 0 ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'Invalid inventory data'
      });
    }

    const product = await repository.findByPid(pid);

    if (!product) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: 'Product not found'
      });
    }

    if (product.quantity < quantity) {
      return callback({
        code: grpc.status.FAILED_PRECONDITION,
        message: 'Insufficient stock'
      });
    }

    const updatedProduct = await repository.updateByPid(pid, {
      quantity: product.quantity - quantity
    });

    callback(null, {
      pid: updatedProduct.pid,
      quantity: updatedProduct.quantity
    });
  } catch (error) {
    console.error('gRPC UpdateInventory error:', error);

    callback({
      code: grpc.status.INTERNAL,
      message: 'Internal server error'
    });
  }
}

function createGrpcServer() {
  const server = new grpc.Server();

  server.addService(productProto.ProductService.service, {
    getProduct,
    updateInventory
  });

  return server;
}

module.exports = {
  createGrpcServer
};