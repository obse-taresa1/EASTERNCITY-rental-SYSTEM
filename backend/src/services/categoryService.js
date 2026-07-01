const repository = require('../repositories/categoryRepository');

function list() {
  return repository.findMany();
}

function create(payload) {
  return repository.create({
    name: payload.name,
    slug: payload.slug,
    description: payload.description || '',
  });
}

function update(id, payload) {
  return repository.update(id, {
    name: payload.name,
    slug: payload.slug,
    description: payload.description,
  });
}

function remove(id) {
  return repository.remove(id);
}

module.exports = {
  list,
  create,
  update,
  remove,
};