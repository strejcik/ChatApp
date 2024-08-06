"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidation = void 0;
exports.handleLoginValidationErrors = handleLoginValidationErrors;
const express_validator_1 = require("express-validator");
exports.loginValidation = [
    (0, express_validator_1.check)('email', 'the email must be a valid email address').isEmail(),
    (0, express_validator_1.check)('email', 'the email must exists').exists(),
    (0, express_validator_1.check)('email', 'the email must be string').isString(),
    (0, express_validator_1.check)('password', 'the password field is required').exists(),
    (0, express_validator_1.check)('password', 'the password field needs to be string').isString(),
    (0, express_validator_1.check)('password', 'the password field is required to be at least 8 characters long').isLength({ min: 8 }),
];
function handleLoginValidationErrors(req, res, next) {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).json({ errors: errors.array() });
    }
    next();
}
;
