const bcrypt = require('bcryptjs');
const { UnauthorizedError } = require('../../errors');

const BCRYPT_COST = 12;
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', BCRYPT_COST);

function invalidCredentials() {
    return new UnauthorizedError('INVALID_CREDENTIALS', 'Invalid email or password');
}

function createAuthService({ usersRepository, tokenService }) {
    async function register({ email, password }) {
        const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

        return usersRepository.create({
            email,
            passwordHash,
            role: 'USER',
        });
    }

    async function login({ email, password }) {
        const user = await usersRepository.findByEmail(email);

        const passwordMatches = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);
        if (!user || !passwordMatches) {
            throw invalidCredentials();
        }

        return {
            accessToken: tokenService.sign(user),
            tokenType: 'Bearer',
            expiresIn: tokenService.expiresIn,
        };
    }

    async function getCurrentUser(currentUser) {
        const user = await usersRepository.findById(currentUser.id);
        if (!user) {
            throw new UnauthorizedError('INVALID_TOKEN', 'Invalid token');
        }
        return user;
    }

    return { register, login, getCurrentUser };
}

module.exports = { createAuthService };