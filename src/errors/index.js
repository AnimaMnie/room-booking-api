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

module.exports = { AppError, ValidationError, NotFoundError, ConflictError };