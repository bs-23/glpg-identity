class Response {
    constructor(data, errors) {
        this.data = data;
        this.errors = errors;
    }
}

class CustomError {
    constructor(message, field, code, stackTrace) {
        this.message = message;
        this.code = code;
        this.field = field;
        this.stackTrace = stackTrace;
    }
}

module.exports = {
    Response,
    CustomError
}
