const { validateRegistration } = require('../domain/validation');

module.exports = ({ userRepository, passwordHasher }) =>
  async function registerUser(input) {
    const data = validateRegistration(input);
    const passwordHash = await passwordHasher.hash(data.password);
    const uid = await userRepository.createCustomerWithEvent({
      username: data.username,
      passwordHash,
      email: data.email,
      phone: data.phone,
    });
    return { message: 'User registered successfully', uid };
  };