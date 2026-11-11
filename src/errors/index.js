class AppError extends Error {
    constructor(status, code, message, details) {
        super(message);
        this.name = this.constructor.name;
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

class ValidationError extends AppError {
    constructor(details, message = 'Validation failed') {
        super(400, 'VALIDATION_ERROR', message, details);
    }
}

class UnauthorizedError extends AppError {
    constructor(code = 'UNAUTHORIZED', message = 'Authentication required') {
        super(401, code, message);
    }
}

class ForbiddenError extends AppError {
    constructor(code = 'FORBIDDEN', message = 'You do not have permission to perform this action') {
        super(403, code, message);
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource not found', code = 'NOT_FOUND') {
        super(404, code, message);
    }
}

class ConflictError extends AppError {
    constructor(code, message) {
        super(409, code, message);
    }
}

module.exports = {
    AppError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
};