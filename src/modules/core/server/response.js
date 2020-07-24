class Response {
    constructor(data, errors) {
        this.data = data;
        this.errors = errors;
    }
}

class CustomError {
    constructor(message, field, code) {
        this.message = message;
        this.code = code;
        this.field = field;
    }
}

module.exports = {
    Response,
    CustomError
}
