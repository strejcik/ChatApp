"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const users_1 = __importDefault(require("../models/users"));
const registerMiddleware_js_1 = require("../middlewares/registerMiddleware.js");
const loginMiddleware_js_1 = require("../middlewares/loginMiddleware.js");
const router = express_1.default.Router();
// User Registration
router.post('/register', registerMiddleware_js_1.registerValidation, registerMiddleware_js_1.handleRegisterValidationErrors, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const existingUser = yield users_1.default.findOne({ email }).lean(); // Changed variable name to existingUser
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const newUser = new users_1.default({ email, password: hashedPassword });
        yield newUser.save();
        return res.json({ message: 'User registered successfully' });
    }
    catch (error) {
        console.error(error);
        return res.json({ message: 'Internal server error' });
    }
}));
// User Login
router.post('/login', loginMiddleware_js_1.loginValidation, loginMiddleware_js_1.handleLoginValidationErrors, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Check if user exists
        const user = yield users_1.default.findOne({ email: email }).lean();
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Compare passwords
        const passwordMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ email: user.email, userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });
        return res.json({ token, email });
    }
    catch (error) {
        console.error(error);
        return res.json({ message: 'Internal server error' });
    }
}));
//Protected route 
exports.default = router;
