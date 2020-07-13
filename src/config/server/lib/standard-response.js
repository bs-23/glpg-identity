class StandardResponse {
    constructor(data, errors) {
        this.data = data;
        this.errors = errors;
    }
}

class CustomError {
    constructor(message, field, errorCode) {
        this.message = message;
        this.errorCode = errorCode;
        this.field = field;
    }
}

module.exports = {
    StandardResponse,
    CustomError
}
