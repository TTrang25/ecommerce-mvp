const { validateLogin } = require('../domain/validation');
const { UnauthorizedError } = require('../domain/errors');

module.exports = ({ userRepository, passwordHasher, tokenService, expiresInSec }) =>
  async function loginUser(input) {
    const { username, password } = validateLogin(input);

    const user = await userRepository.findByUsername(username);
    // Luôn so sánh hash, kể cả khi không có user, để không lộ username nào tồn tại
    const passwordOk = await passwordHasher.compare(
      password,
      user ? user.password : passwordHasher.DUMMY_HASH
    );
    if (!user || !passwordOk) throw new UnauthorizedError('Invalid username or password');

    const accessToken = tokenService.sign({ uid: user.uid, role: user.role });
    return { accessToken, tokenType: 'Bearer', expiresIn: expiresInSec };
  };