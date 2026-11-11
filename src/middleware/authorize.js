const { ForbiddenError } = require('../errors');

function authorize(...roles) {
    return function (req, res, next) {
        if (!roles.includes(req.user.role)) {
            throw new ForbiddenError();
        }
        next();
    };
}

module.exports = { authorize };