import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/users';
import { authenticateJWT, authenticateJWTGet} from '../middlewares/authMiddleware.js';
import { registerValidation, handleRegisterValidationErrors } from '../middlewares/registerMiddleware.js';
import { loginValidation, handleLoginValidationErrors } from '../middlewares/loginMiddleware.js';
import { Request, Response} from "express";
import {createID} from '../singal/signal';
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
    const newUser = new User({
      email, 
      password: hashedPassword, 
    });

    let sigObj = await createID();

    function toBuffer(arrayBuffer) {
      const buffer = Buffer.alloc(arrayBuffer.byteLength);
      const view = new Uint8Array(arrayBuffer);
      for (let i = 0; i < buffer.length; ++i) {
        buffer[i] = view[i];
      }
      return buffer;
    }

    newUser['ikp'].prk = toBuffer(sigObj.identityKeyPair.privKey);
    newUser['ikp'].pbk = toBuffer(sigObj.identityKeyPair.pubKey);
    newUser['bki'] = sigObj.baseKeyId;
    newUser['pk'].ki = sigObj.preKey.keyId;
    newUser['pk'].kp.prk = toBuffer(sigObj.preKey.keyPair.privKey);
    newUser['pk'].kp.pbk = toBuffer(sigObj.preKey.keyPair.pubKey);
    newUser['spki'] = sigObj.signedPreKeyId;
    newUser['spk'].ki =  sigObj.signedPreKey.keyId;
    newUser['spk'].kp.prk = toBuffer(sigObj.signedPreKey.keyPair.privKey);
    newUser['spk'].kp.pbk = toBuffer(sigObj.signedPreKey.keyPair.pubKey);
    newUser['spk'].si = toBuffer(sigObj.signedPreKey.signature);

    
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
    let user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    

    console.log(user);
    user.save();
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

