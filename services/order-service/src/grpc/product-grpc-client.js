const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(
  __dirname,
  'proto',
  'product.proto'
);

const packageDefinition = protoLoader.loadSync(
  PROTO_PATH,
  {
    keepCase: false,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
);

const productProto = grpc.loadPackageDefinition(
  packageDefinition
).product;

const GRPC_HOST =
  process.env.PRODUCT_GRPC_HOST || 'localhost';

const GRPC_PORT =
  Number(process.env.PRODUCT_GRPC_PORT || 50051);

const client = new productProto.ProductService(
  `${GRPC_HOST}:${GRPC_PORT}`,
  grpc.credentials.createInsecure()
);

function getProduct(pid) {
  return new Promise((resolve, reject) => {
    client.getProduct(
      { pid },
      (error, response) => {
        if (error) {
          return reject(error);
        }

        resolve(response);
      }
    );
  });
}

function updateInventory(pid, quantity) {
  return new Promise((resolve, reject) => {
    client.updateInventory(
      {
        pid,
        quantity
      },
      (error, response) => {
        if (error) {
          return reject(error);
        }

        resolve(response);
      }
    );
  });
}

module.exports = {
  getProduct,
  updateInventory
};