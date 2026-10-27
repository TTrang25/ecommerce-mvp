const bcrypt = require('bcryptjs');

const ROUNDS = 10;
// Hash giả để so sánh khi username không tồn tại, giữ thời gian phản hồi gần như nhau
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', ROUNDS);

const hash = (plain) => bcrypt.hash(plain, ROUNDS);
const compare = (plain, hashed) => bcrypt.compare(plain, hashed);

module.exports = { hash, compare, DUMMY_HASH };