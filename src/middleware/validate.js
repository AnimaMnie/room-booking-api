const { ValidationError } = require('../errors');

const parts = ['params', 'query', 'body'];

function validate(schemas) {
    return (req, res, next) => {
        const errors = [];
        req.validated = {};

        parts.forEach(part => {
            if (!schemas[part]) return;

            const result = schemas[part].safeParse(req[part] ?? {});

            if (result.success) {
                req.validated[part] = result.data;
                return;
            }

            result.error.issues.forEach(issue => {
                if (issue.code === 'unrecognized_keys') {
                    issue.keys.forEach(key => {
                        errors.push({ location: part, field: key, message: 'Unknown field' });
                    });
                } else {
                    errors.push({ location: part, field: issue.path.join('.'), message: issue.message });
                }
            });
        });

        if (errors.length) {
            throw new ValidationError(errors);
        }

        next();
    };
}

module.exports = { validate };