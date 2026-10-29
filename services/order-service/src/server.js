const app = require('./app');
const config = require('./config');

app.listen(config.port, () => {
  console.log(
    `Order Service is running on port ${config.port}`
  );
});