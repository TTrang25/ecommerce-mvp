const grpc = require('@grpc/grpc-js');

const app = require('./app');
const config = require('./config');
const { connectMongo } = require('./infrastructure/db');
const { createGrpcServer } = require('./grpc/product-grpc-service');

const GRPC_PORT = Number(process.env.GRPC_PORT || 50051);

async function startServer() {
  try {
    await connectMongo();

    // REST server
    app.listen(config.port, () => {
      console.log(
        `Product Service is running on port ${config.port}`
      );
    });

    // gRPC server
    const grpcServer = createGrpcServer();

    grpcServer.bindAsync(
      `0.0.0.0:${GRPC_PORT}`,
      grpc.ServerCredentials.createInsecure(),
      (error, port) => {
        if (error) {
          console.error('Failed to start gRPC server:', error);
          process.exit(1);
        }

        console.log(
          `Product gRPC Service is running on port ${port}`
        );
      }
    );
  } catch (error) {
    console.error('Failed to start Product Service:', error);
    process.exit(1);
  }
}

startServer();