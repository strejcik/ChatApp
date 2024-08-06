import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/users';
import { authenticateJWT, authenticateJWTGet} from '../middlewares/authMiddleware.js';
import { registerValidation, handleRegisterValidationErrors } from '../middlewares/registerMiddleware.js';
import { loginValidation, handleLoginValidationErrors } from '../middlewares/loginMiddleware.js';
import { Request, Response} from "express";
const router = express.Router();

// User Registration

router.post('/register',registerValidation, handleRegisterValidationErrors, async (req:Request, res:Response) => {
  
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email }).lean(); // Changed variable name to existingUser
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    return res.json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    return res.json({ message: 'Internal server error' });
  }
});

// User Login

router.post('/login', loginValidation, handleLoginValidationErrors, async (req:Request, res:Response) => {
  
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email: email }).lean();
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }


    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ email: user.email, userId: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });
    return res.json({ token, email });
  } catch (error) {
    console.error(error);
    return res.json({ message: 'Internal server error' });
  }
});


//Protected route 
























export default router;

