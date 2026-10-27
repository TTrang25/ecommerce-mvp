const { ConflictError } = require('../domain/errors');

module.exports = ({ userRepository, passwordHasher, adminConfig }) =>
  async function seedAdmin() {
    const { username, password, email } = adminConfig;
    if (!username || !password) {
      console.log('[seed] ADMIN_USERNAME/ADMIN_PASSWORD not set, skip admin seeding');
      return;
    }
    if (await userRepository.findByUsername(username)) {
      console.log(`[seed] admin "${username}" already exists`);
      return;
    }
    try {
      const passwordHash = await passwordHasher.hash(password);
      const uid = await userRepository.createUserWithRoleName({
        username,
        passwordHash,
        email,
        phone: null,
        roleName: 'ADMIN',
      });
      console.log(`[seed] admin "${username}" created (uid=${uid})`);
    } catch (err) {
      if (err instanceof ConflictError) {
        console.warn(`[seed] cannot create admin: ${err.message}`);
        return;
      }
      throw err;
    }
  };