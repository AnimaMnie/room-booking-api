const { ConflictError } = require('../../errors');

function createUsersRepository() {
    let nextId = 1;
    const users = [];

    return {
        async findById(id) {
            return users.find(u => u.id === id) ?? null;
        },
        async findByEmail(email) {
            return users.find(u => u.email === email) ?? null;
        },
        async create(data) {
            if (users.some(u => u.email === data.email)) {
                throw new ConflictError('EMAIL_TAKEN', 'Email is already taken');
            }
            const user = { id: nextId++, ...data, createdAt: new Date().toISOString() };
            users.push(user);
            return user;
        },
    };
}

module.exports = { createUsersRepository };