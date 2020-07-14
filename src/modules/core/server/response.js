class Response {
    constructor(data, errors) {
        this.data = data;
        this.errors = errors;
    }
}

class CustomError {
    constructor(message, field, errorCode, stackTrace) {
        this.message = message;
        this.errorCode = errorCode;
        this.field = field;
        this.stackTrace = stackTrace;
    }
}

module.exports = {
    Response,
    CustomError
}
