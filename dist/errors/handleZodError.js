"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handleZodError = (error) => {
    var _a;
    const issues = error.issues || error.errors || [];
    console.log(issues);
    const errorMessages = issues.map((el) => {
        return {
            path: el.path[el.path.length - 1],
            message: el.message,
        };
    });
    const statusCode = 400;
    return {
        statusCode,
        message: ((_a = errorMessages === null || errorMessages === void 0 ? void 0 : errorMessages[0]) === null || _a === void 0 ? void 0 : _a.message) || 'Validation Error',
        errorMessages,
    };
};
exports.default = handleZodError;
