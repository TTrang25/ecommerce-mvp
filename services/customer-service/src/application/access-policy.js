const ADMIN = 'ADMIN';

// Admin xem/sửa được tất cả; người dùng thường chỉ thao tác trên uid của chính mình
const isAdmin = (requester) => requester.role === ADMIN;
const canAccess = (requester, uid) => isAdmin(requester) || requester.uid === uid;

module.exports = { isAdmin, canAccess };