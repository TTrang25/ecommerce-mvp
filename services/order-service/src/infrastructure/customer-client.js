const config = require('../config');

async function getCustomer(uid, authorizationHeader) {
  const response = await fetch(
    `${config.customerServiceUrl}/api/customers/${uid}`,
    {
      method: 'GET',
      headers: {
        Authorization: authorizationHeader
      }
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data.message || 'Customer Service request failed'
    );

    error.statusCode = response.status;

    throw error;
  }

  return data;
}

module.exports = {
  getCustomer
};