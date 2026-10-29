const Product = require('./product-model');

async function findAll() {
  return Product.find().sort({ pid: 1 }).lean();
}

async function findByPid(pid) {
  return Product.findOne({ pid }).lean();
}

async function create(data) {
  return Product.create(data);
}

async function updateByPid(pid, data) {
  return Product.findOneAndUpdate(
    { pid },
    { $set: data },
    {
      new: true,
      runValidators: true
    }
  ).lean();
}

async function deleteByPid(pid) {
  return Product.findOneAndDelete({ pid }).lean();
}

module.exports = {
  findAll,
  findByPid,
  create,
  updateByPid,
  deleteByPid
};
